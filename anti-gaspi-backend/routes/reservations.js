const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireMerchant, requireCustomer } = require('../middleware/auth');

function createReservationRoutes(db) {
    const router = express.Router();

    /**
     * POST /api/reservations
     * Create a reservation (customer only)
     * WITH QUANTITY MANAGEMENT & RACE CONDITION PREVENTION
     */
    router.post('/', authenticate, requireCustomer, (req, res) => {
        const { basketId } = req.body;

        if (!basketId) {
            return res.status(400).json({ error: 'basketId requis' });
        }

        try {
            // USE TRANSACTION to prevent race conditions
            const reservation = db.transaction(() => {
                // 1. Lock basket row and check availability
                const basket = db.prepare(`
                    SELECT * FROM baskets WHERE id = ?
                `).get(basketId);

                if (!basket) {
                    throw new Error('Panier introuvable');
                }

                // 2. Check if expired
                const now = new Date();
                const expiresAt = new Date(basket.expires_at);

                if (expiresAt <= now) {
                    throw new Error('Ce panier a expiré');
                }

                // 3. Calculate current available quantity
                const reservationCount = db.prepare(`
                    SELECT COUNT(*) as count 
                    FROM reservations 
                    WHERE basket_id = ? AND status = 'pending'
                `).get(basketId).count;

                const availableQuantity = basket.quantity - reservationCount;

                // 4. Check availability
                if (availableQuantity <= 0) {
                    throw new Error('Ce panier n\'est plus disponible');
                }

                // 5. Check if user already has a reservation for this basket
                const existingReservation = db.prepare(
                    'SELECT * FROM reservations WHERE user_id = ? AND basket_id = ? AND status = ?'
                ).get(req.user.userId, basketId, 'pending');

                if (existingReservation) {
                    throw new Error('Vous avez déjà réservé ce panier');
                }

                // 6. Generate unique QR code
                const qrCode = uuidv4();

                // 7. Create reservation
                const insertReservation = db.prepare(`
                    INSERT INTO reservations (user_id, basket_id, qr_code, status)
                    VALUES (?, ?, ?, 'pending')
                `);

                const result = insertReservation.run(req.user.userId, basketId, qrCode);

                // 8. Check if this was the last available slot
                const newAvailableQuantity = availableQuantity - 1;

                // 9. If quantity reaches 0, hide the basket
                if (newAvailableQuantity <= 0) {
                    db.prepare(`
                        UPDATE baskets 
                        SET visible = 0 
                        WHERE id = ?
                    `).run(basketId);
                }

                return {
                    id: result.lastInsertRowid,
                    basket_id: basketId,
                    qr_code: qrCode,
                    status: 'pending',
                    quantity_left: newAvailableQuantity
                };
            })();

            res.status(201).json({
                message: 'Réservation créée avec succès',
                reservation
            });
        } catch (error) {
            console.error('Create reservation error:', error);

            // Handle custom error messages
            if (error.message.includes('introuvable') ||
                error.message.includes('expiré') ||
                error.message.includes('disponible') ||
                error.message.includes('déjà réservé')) {
                return res.status(409).json({ error: error.message });
            }

            res.status(500).json({ error: 'Erreur lors de la création de la réservation' });
        }
    });

    /**
     * GET /api/reservations/user
     * Get current user's reservations
     */
    router.get('/user', authenticate, requireCustomer, (req, res) => {
        try {
            const reservations = db.prepare(`
        SELECT 
          r.*,
          b.title,
          b.description,
          b.original_price,
          b.discounted_price,
          b.expires_at,
          m.business_name,
          u.address,
          u.latitude,
          u.longitude
        FROM reservations r
        JOIN baskets b ON r.basket_id = b.id
        JOIN merchants m ON b.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE r.user_id = ?
        ORDER BY r.reserved_at DESC
      `).all(req.user.userId);

            res.json({ reservations });
        } catch (error) {
            console.error('Get user reservations error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
        }
    });

    /**
     * GET /api/reservations/merchant
     * Get merchant's pending pickups
     */
    router.get('/merchant', authenticate, requireMerchant, (req, res) => {
        try {
            // Get merchant ID
            const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(req.user.userId);

            if (!merchant) {
                return res.status(403).json({ error: 'Profil commerçant introuvable' });
            }

            const reservations = db.prepare(`
        SELECT 
          r.*,
          b.title,
          b.description,
          b.discounted_price,
          u.name as customer_name,
          u.email as customer_email
        FROM reservations r
        JOIN baskets b ON r.basket_id = b.id
        JOIN users u ON r.user_id = u.id
        WHERE b.merchant_id = ?
        ORDER BY r.reserved_at DESC
      `).all(merchant.id);

            res.json({ reservations });
        } catch (error) {
            console.error('Get merchant reservations error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
        }
    });

    /**
     * POST /api/reservations/validate
     * Validate QR code and mark reservation as collected (merchant only)
     */
    router.post('/validate', authenticate, requireMerchant, (req, res) => {
        const { qrCode } = req.body;

        if (!qrCode) {
            return res.status(400).json({ error: 'qrCode requis' });
        }

        try {
            // Get merchant ID
            const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(req.user.userId);

            if (!merchant) {
                return res.status(403).json({ error: 'Profil commerçant introuvable' });
            }

            // Find reservation
            const reservation = db.prepare(`
        SELECT r.*, b.merchant_id
        FROM reservations r
        JOIN baskets b ON r.basket_id = b.id
        WHERE r.qr_code = ?
      `).get(qrCode);

            if (!reservation) {
                return res.status(404).json({ error: 'QR Code invalide' });
            }

            // Verify merchant owns this basket
            if (reservation.merchant_id !== merchant.id) {
                return res.status(403).json({ error: 'Ce QR Code n\'appartient pas à votre établissement' });
            }

            // Check if already collected
            if (reservation.status === 'collected') {
                return res.status(409).json({ error: 'Cette réservation a déjà été récupérée' });
            }

            // USE TRANSACTION
            const updatedReservation = db.transaction(() => {
                const now = new Date().toISOString();

                // 1. Update reservation status
                db.prepare(`
                    UPDATE reservations 
                    SET status = 'collected', collected_at = ?
                    WHERE id = ?
                `).run(now, reservation.id);

                // 2. Decrement basket quantity to reflect permanent removal from stock
                // This ensures available_quantity (quantity - pending) remains correct
                db.prepare(`
                    UPDATE baskets
                    SET quantity = quantity - 1
                    WHERE id = ?
                `).run(reservation.basket_id);

                return {
                    id: reservation.id,
                    status: 'collected',
                    collected_at: now
                };
            })();

            res.json({
                message: 'Réservation validée avec succès',
                reservation: updatedReservation
            });
        } catch (error) {
            console.error('Validate reservation error:', error);
            res.status(500).json({ error: 'Erreur lors de la validation de la réservation' });
        }
    });

    /**
     * PATCH /api/reservations/:id/cancel
     * Cancel a reservation (customer only)
     */
    router.patch('/:id/cancel', authenticate, requireCustomer, (req, res) => {
        try {
            const runTransaction = db.transaction(() => {
                const reservation = db.prepare('SELECT basket_id FROM reservations WHERE id = ? AND user_id = ? AND status = ?').get(req.params.id, req.user.userId, 'pending');

                if (!reservation) {
                    throw new Error('Réservation introuvable ou déjà traitée');
                }

                // Update status
                db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?").run(req.params.id);

                // Re-enable visibility just in case it was hidden (this fixes the "0 available" bug)
                db.prepare("UPDATE baskets SET visible = 1 WHERE id = ?").run(reservation.basket_id);
            });

            runTransaction();
            res.json({ message: 'Réservation annulée' });
        } catch (error) {
            if (error.message === 'Réservation introuvable ou déjà traitée') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Cancel reservation error:', error);
            res.status(500).json({ error: 'Erreur lors de l\'annulation' });
        }
    });

    return router;
}

module.exports = createReservationRoutes;

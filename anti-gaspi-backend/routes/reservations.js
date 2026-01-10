const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireMerchant, requireCustomer } = require('../middleware/auth');

function createReservationRoutes(db) {
    const router = express.Router();

    /**
     * POST /api/reservations
     * Create a reservation (customer only)
     */
    router.post('/', authenticate, requireCustomer, (req, res) => {
        const { basketId } = req.body;

        if (!basketId) {
            return res.status(400).json({ error: 'basketId requis' });
        }

        try {
            // Check if basket exists and is available
            const basket = db.prepare(`
        SELECT 
          b.*,
          (b.quantity - COALESCE((
            SELECT COUNT(*) 
            FROM reservations r 
            WHERE r.basket_id = b.id AND r.status = 'pending'
          ), 0)) as available_quantity
        FROM baskets b
        WHERE b.id = ?
      `).get(basketId);

            if (!basket) {
                return res.status(404).json({ error: 'Panier introuvable' });
            }

            // Check if expired
            const now = new Date();
            const expiresAt = new Date(basket.expires_at);

            if (expiresAt <= now) {
                return res.status(410).json({ error: 'Ce panier a expiré' });
            }

            // Check availability
            if (basket.available_quantity <= 0) {
                return res.status(409).json({ error: 'Ce panier n\'est plus disponible' });
            }

            // Check if user already has a reservation for this basket
            const existingReservation = db.prepare(
                'SELECT * FROM reservations WHERE user_id = ? AND basket_id = ? AND status = ?'
            ).get(req.user.userId, basketId, 'pending');

            if (existingReservation) {
                return res.status(409).json({ error: 'Vous avez déjà réservé ce panier' });
            }

            // Generate unique QR code
            const qrCode = uuidv4();

            // Create reservation
            const insertReservation = db.prepare(`
        INSERT INTO reservations (user_id, basket_id, qr_code, status)
        VALUES (?, ?, ?, 'pending')
      `);

            const result = insertReservation.run(req.user.userId, basketId, qrCode);

            res.status(201).json({
                message: 'Réservation créée avec succès',
                reservation: {
                    id: result.lastInsertRowid,
                    basket_id: basketId,
                    qr_code: qrCode,
                    status: 'pending'
                }
            });
        } catch (error) {
            console.error('Create reservation error:', error);
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
     * GET /api/reservations/history
     * Get complete reservation history (all statuses)
     */
    router.get('/history', authenticate, requireCustomer, (req, res) => {
        try {
            const history = db.prepare(`
        SELECT 
          r.*,
          b.title,
          b.description,
          b.original_price,
          b.discounted_price,
          b.image_url,
          m.id as merchant_id,
          m.business_name,
          u.address,
          CASE 
            WHEN rv.id IS NOT NULL THEN 1
            ELSE 0
          END as has_review
        FROM reservations r
        JOIN baskets b ON r.basket_id = b.id
        JOIN merchants m ON b.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        LEFT JOIN reviews rv ON r.id = rv.reservation_id
        WHERE r.user_id = ?
        ORDER BY r.reserved_at DESC
      `).all(req.user.userId);

            res.json({ history });
        } catch (error) {
            console.error('Get history error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
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

            // Update reservation status
            const now = new Date().toISOString();
            db.prepare(`
                UPDATE reservations 
                SET status = 'collected', collected_at = ?
                WHERE id = ?
            `).run(now, reservation.id);

            res.json({
                message: 'Réservation validée avec succès',
                reservation: {
                    id: reservation.id,
                    status: 'collected',
                    collected_at: now
                }
            });
        } catch (error) {
            console.error('Validate reservation error:', error);
            res.status(500).json({ error: 'Erreur lors de la validation de la réservation' });
        }
    });

    return router;
}

module.exports = createReservationRoutes;

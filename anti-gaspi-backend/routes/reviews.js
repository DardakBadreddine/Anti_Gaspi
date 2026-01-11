const express = require('express');
const { authenticate, requireCustomer } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * Create reviews routes
 */
function createReviewsRoutes(db) {
    const router = express.Router();

    /**
     * GET /api/reviews/merchant/:merchantId
     * Get all reviews for a merchant
     */
    router.get('/merchant/:merchantId', (req, res) => {
        try {
            const { merchantId } = req.params;

            const reviews = db.prepare(`
                SELECT 
                    r.*,
                    u.name as user_name,
                    u.email as user_email
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.merchant_id = ?
                ORDER BY r.created_at DESC
            `).all(merchantId);

            res.json({ reviews });
        } catch (error) {
            console.error('Error getting reviews:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    /**
     * GET /api/reviews/user
     * Get current user's reviews
     */
    router.get('/user', authenticate, (req, res) => {
        try {
            const reviews = db.prepare(`
                SELECT 
                    r.*,
                    m.business_name,
                    m.id as merchant_id
                FROM reviews r
                JOIN merchants m ON r.merchant_id = m.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
            `).all(req.user.userId);

            res.json({ reviews });
        } catch (error) {
            console.error('Error getting user reviews:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    /**
     * POST /api/reviews
     * Create a review (customer only, after reservation)
     */
    router.post('/', authenticate, requireCustomer, [
        body('merchantId').isInt(),
        body('rating').isInt({ min: 1, max: 5 }),
        body('basketRating').optional().isInt({ min: 1, max: 5 }),
        body('comment').optional().trim(),
        body('reservationId').optional().isInt()
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { merchantId, rating, basketRating, comment, reservationId } = req.body;
        const userId = req.user.userId;

        try {
            // Check if merchant exists
            const merchant = db.prepare('SELECT id FROM merchants WHERE id = ?').get(merchantId);
            if (!merchant) {
                return res.status(404).json({ error: 'Commerçant introuvable' });
            }

            // If reservationId provided, check it belongs to user and merchant
            if (reservationId) {
                const reservation = db.prepare(`
                    SELECT r.*, b.merchant_id
                    FROM reservations r
                    JOIN baskets b ON r.basket_id = b.id
                    WHERE r.id = ? AND r.user_id = ?
                `).get(reservationId, userId);

                if (!reservation) {
                    return res.status(404).json({ error: 'Réservation introuvable' });
                }

                if (reservation.merchant_id !== merchantId) {
                    return res.status(400).json({ error: 'La réservation ne correspond pas au commerçant' });
                }

                // Check if review already exists for this reservation
                const existing = db.prepare(`
                    SELECT id FROM reviews 
                    WHERE user_id = ? AND reservation_id = ?
                `).get(userId, reservationId);

                if (existing) {
                    return res.status(400).json({ error: 'Vous avez déjà laissé un avis pour cette réservation' });
                }
            }

            // Get basket_id from reservation if provided
            let basketId = null;
            if (reservationId) {
                const reservation = db.prepare('SELECT basket_id FROM reservations WHERE id = ?').get(reservationId);
                if (reservation) {
                    basketId = reservation.basket_id;
                }
            }

            // Insert review
            const result = db.prepare(`
                INSERT INTO reviews (user_id, merchant_id, reservation_id, rating, basket_rating, comment)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(userId, merchantId, reservationId || null, rating, basketRating || null, comment || null);

            // Update merchant rating
            const avgRating = db.prepare(`
                SELECT AVG(rating) as avg_rating, COUNT(*) as count
                FROM reviews
                WHERE merchant_id = ?
            `).get(merchantId);

            db.prepare(`
                UPDATE merchants
                SET rating = ?
                WHERE id = ?
            `).run(avgRating.avg_rating || 0, merchantId);

            // Update basket rating if basketRating provided
            if (basketRating && basketId) {
                const avgBasketRating = db.prepare(`
                    SELECT AVG(basket_rating) as avg_rating, COUNT(*) as count
                    FROM reviews
                    WHERE reservation_id IN (
                        SELECT id FROM reservations WHERE basket_id = ?
                    ) AND basket_rating IS NOT NULL
                `).get(basketId);

                db.prepare(`
                    UPDATE baskets
                    SET rating = ?
                    WHERE id = ?
                `).run(avgBasketRating.avg_rating || 0, basketId);
            }

            // Send notification to merchant
            (async () => {
                try {
                    const merchantUser = db.prepare(`
                        SELECT u.id FROM users u
                        JOIN merchants m ON u.id = m.user_id
                        WHERE m.id = ?
                    `).get(merchantId);

                    if (merchantUser) {
                        const tokens = db.prepare(`
                            SELECT token FROM push_tokens
                            WHERE user_id = ?
                        `).all(merchantUser.id);

                        if (tokens.length > 0) {
                            const fetch = require('node-fetch');
                            const messages = tokens.map(t => ({
                                to: t.token,
                                sound: 'default',
                                title: 'Nouvel Avis ! ⭐',
                                body: `Vous avez reçu un avis ${rating}/5 étoiles`,
                                data: { merchantId, type: 'new_review' },
                            }));

                            await fetch('https://exp.host/--/api/v2/push/send', {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Accept-encoding': 'gzip, deflate',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(messages),
                            });
                        }
                    }
                } catch (notifError) {
                    console.error('Notification error:', notifError);
                }
            })();

            res.status(201).json({
                message: 'Avis créé',
                review: {
                    id: result.lastInsertRowid,
                    rating,
                    comment,
                }
            });
        } catch (error) {
            console.error('Create review error:', error);
            res.status(500).json({ error: 'Erreur lors de la création de l\'avis' });
        }
    });

    /**
     * DELETE /api/reviews/:id
     * Delete own review
     */
    router.delete('/:id', authenticate, (req, res) => {
        try {
            const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
            if (!review) {
                return res.status(404).json({ error: 'Avis introuvable' });
            }

            if (review.user_id !== req.user.userId) {
                return res.status(403).json({ error: 'Vous ne pouvez pas supprimer cet avis' });
            }

            db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);

            // Update merchant rating
            const merchantId = review.merchant_id;
            const avgRating = db.prepare(`
                SELECT AVG(rating) as avg_rating
                FROM reviews
                WHERE merchant_id = ?
            `).get(merchantId);

            db.prepare(`
                UPDATE merchants
                SET rating = ?
                WHERE id = ?
            `).run(avgRating.avg_rating || 0, merchantId);

            // Update basket rating if reservation exists
            if (review.reservation_id) {
                const reservation = db.prepare('SELECT basket_id FROM reservations WHERE id = ?').get(review.reservation_id);
                if (reservation) {
                    const avgBasketRating = db.prepare(`
                        SELECT AVG(basket_rating) as avg_rating
                        FROM reviews
                        WHERE reservation_id IN (
                            SELECT id FROM reservations WHERE basket_id = ?
                        ) AND basket_rating IS NOT NULL
                    `).get(reservation.basket_id);

                    db.prepare(`
                        UPDATE baskets
                        SET rating = ?
                        WHERE id = ?
                    `).run(avgBasketRating.avg_rating || 0, reservation.basket_id);
                }
            }

            res.json({ message: 'Avis supprimé' });
        } catch (error) {
            console.error('Delete review error:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
    });

    return router;
}

module.exports = createReviewsRoutes;

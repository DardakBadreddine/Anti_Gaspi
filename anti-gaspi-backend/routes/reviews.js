const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, requireCustomer } = require('../middleware/auth');

function createReviewsRoutes(db) {
    const router = express.Router();

    /**
     * POST /api/reviews
     * Submit a review for a merchant (requires collected reservation)
     */
    router.post('/',
        authenticate,
        requireCustomer,
        body('reservationId').isInt(),
        body('rating').isInt({ min: 1, max: 5 }),
        body('comment').optional().trim(),
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { reservationId, rating, comment } = req.body;
            const userId = req.user.userId;

            try {
                // Verify reservation exists, belongs to user, and is collected
                const reservation = db.prepare(`
                    SELECT r.*, b.merchant_id
                    FROM reservations r
                    JOIN baskets b ON r.basket_id = b.id
                    WHERE r.id = ? AND r.user_id = ?
                `).get(reservationId, userId);

                if (!reservation) {
                    return res.status(404).json({ error: 'Réservation introuvable' });
                }

                if (reservation.status !== 'collected') {
                    return res.status(400).json({ error: 'Vous devez d\'abord récupérer le panier' });
                }

                // Check if already reviewed
                const existingReview = db.prepare(
                    'SELECT id FROM reviews WHERE reservation_id = ?'
                ).get(reservationId);

                if (existingReview) {
                    return res.status(409).json({ error: 'Vous avez déjà noté cette réservation' });
                }

                // Create review
                const result = db.prepare(`
                    INSERT INTO reviews (user_id, merchant_id, reservation_id, rating, comment)
                    VALUES (?, ?, ?, ?, ?)
                `).run(userId, reservation.merchant_id, reservationId, rating, comment || null);

                res.status(201).json({
                    message: 'Merci pour votre avis !',
                    review: {
                        id: result.lastInsertRowid,
                        merchant_id: reservation.merchant_id,
                        rating,
                        comment
                    }
                });
            } catch (error) {
                console.error('Create review error:', error);
                res.status(500).json({ error: 'Erreur lors de la création de l\'avis' });
            }
        }
    );

    /**
     * GET /api/reviews/merchant/:merchantId
     * Get all reviews for a merchant
     */
    router.get('/merchant/:merchantId', authenticate, (req, res) => {
        const { merchantId } = req.params;

        try {
            const reviews = db.prepare(`
                SELECT 
                    r.*,
                    u.name as user_name
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.merchant_id = ?
                ORDER BY r.created_at DESC
            `).all(merchantId);

            res.json({ reviews });
        } catch (error) {
            console.error('Get reviews error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
        }
    });

    /**
     * GET /api/reviews/merchant/:merchantId/rating
     * Get average rating for a merchant
     */
    router.get('/merchant/:merchantId/rating', authenticate, (req, res) => {
        const { merchantId } = req.params;

        try {
            const result = db.prepare(`
                SELECT 
                    COALESCE(AVG(rating), 0) as average_rating,
                    COUNT(*) as review_count
                FROM reviews
                WHERE merchant_id = ?
            `).get(merchantId);

            res.json({
                averageRating: Number(result.average_rating.toFixed(1)),
                reviewCount: result.review_count
            });
        } catch (error) {
            console.error('Get rating error:', error);
            res.status(500).json({ error: 'Erreur lors du calcul de la note' });
        }
    });

    /**
     * GET /api/reviews/pending
     * Get reservations that can be reviewed (collected but not yet reviewed)
     */
    router.get('/pending', authenticate, requireCustomer, (req, res) => {
        const userId = req.user.userId;

        try {
            const pendingReviews = db.prepare(`
                SELECT 
                    r.id as reservation_id,
                    r.collected_at,
                    b.title as basket_title,
                    b.merchant_id,
                    m.business_name
                FROM reservations r
                JOIN baskets b ON r.basket_id = b.id
                JOIN merchants m ON b.merchant_id = m.id
                LEFT JOIN reviews rv ON r.id = rv.reservation_id
                WHERE r.user_id = ?
                AND r.status = 'collected'
                AND rv.id IS NULL
                ORDER BY r.collected_at DESC
            `).all(userId);

            res.json({ pendingReviews });
        } catch (error) {
            console.error('Get pending reviews error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des avis en attente' });
        }
    });

    return router;
}

module.exports = createReviewsRoutes;

const express = require('express');
const { authenticate, requireCustomer } = require('../middleware/auth');

function createFavoritesRoutes(db) {
    const router = express.Router();

    /**
     * POST /api/favorites/:merchantId
     * Add merchant to user's favorites
     */
    router.post('/:merchantId', authenticate, requireCustomer, (req, res) => {
        const { merchantId } = req.params;
        const userId = req.user.userId;

        try {
            // Verify merchant exists
            const merchant = db.prepare('SELECT id FROM merchants WHERE id = ?').get(merchantId);
            if (!merchant) {
                return res.status(404).json({ error: 'Commerçant introuvable' });
            }

            // Check if already favorited
            const existing = db.prepare(
                'SELECT id FROM favorites WHERE user_id = ? AND merchant_id = ?'
            ).get(userId, merchantId);

            if (existing) {
                return res.status(409).json({ error: 'Déjà dans vos favoris' });
            }

            // Add to favorites
            const result = db.prepare(
                'INSERT INTO favorites (user_id, merchant_id) VALUES (?, ?)'
            ).run(userId, merchantId);

            res.status(201).json({
                message: 'Ajouté aux favoris',
                favorite: {
                    id: result.lastInsertRowid,
                    merchant_id: merchantId
                }
            });
        } catch (error) {
            console.error('Add favorite error:', error);
            res.status(500).json({ error: 'Erreur lors de l\'ajout aux favoris' });
        }
    });

    /**
     * DELETE /api/favorites/:merchantId
     * Remove merchant from user's favorites
     */
    router.delete('/:merchantId', authenticate, requireCustomer, (req, res) => {
        const { merchantId } = req.params;
        const userId = req.user.userId;

        try {
            const result = db.prepare(
                'DELETE FROM favorites WHERE user_id = ? AND merchant_id = ?'
            ).run(userId, merchantId);

            if (result.changes === 0) {
                return res.status(404).json({ error: 'Favori introuvable' });
            }

            res.json({ message: 'Retiré des favoris' });
        } catch (error) {
            console.error('Remove favorite error:', error);
            res.status(500).json({ error: 'Erreur lors du retrait des favoris' });
        }
    });

    /**
     * GET /api/favorites
     * Get user's favorite merchants with their active baskets
     */
    router.get('/', authenticate, requireCustomer, (req, res) => {
        const userId = req.user.userId;

        try {
            // Get favorite merchants with their info
            const favorites = db.prepare(`
                SELECT 
                    f.id as favorite_id,
                    f.created_at as favorited_at,
                    m.id as merchant_id,
                    m.business_name,
                    m.description,
                    m.phone,
                    u.address,
                    u.latitude,
                    u.longitude,
                    COALESCE(AVG(r.rating), 0) as average_rating,
                    COUNT(DISTINCT r.id) as review_count
                FROM favorites f
                JOIN merchants m ON f.merchant_id = m.id
                JOIN users u ON m.user_id = u.id
                LEFT JOIN reviews r ON m.id = r.merchant_id
                WHERE f.user_id = ?
                GROUP BY f.id, m.id, m.business_name, m.description, m.phone, u.address, u.latitude, u.longitude
                ORDER BY f.created_at DESC
            `).all(userId);

            // For each favorite merchant, get their active baskets
            const result = favorites.map(fav => {
                const baskets = db.prepare(`
                    SELECT 
                        b.*,
                        (b.quantity - COALESCE((
                            SELECT COUNT(*) 
                            FROM reservations r 
                            WHERE r.basket_id = b.id AND r.status = 'pending'
                        ), 0)) as available_quantity
                    FROM baskets b
                    WHERE b.merchant_id = ?
                    AND datetime(b.expires_at) > datetime('now')
                    AND b.quantity > 0
                    ORDER BY b.created_at DESC
                `).all(fav.merchant_id);

                return {
                    ...fav,
                    active_baskets: baskets.filter(b => b.available_quantity > 0)
                };
            });

            res.json({ favorites: result });
        } catch (error) {
            console.error('Get favorites error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
        }
    });

    /**
     * GET /api/favorites/check/:merchantId
     * Check if merchant is in user's favorites
     */
    router.get('/check/:merchantId', authenticate, requireCustomer, (req, res) => {
        const { merchantId } = req.params;
        const userId = req.user.userId;

        try {
            const favorite = db.prepare(
                'SELECT id FROM favorites WHERE user_id = ? AND merchant_id = ?'
            ).get(userId, merchantId);

            res.json({ isFavorite: !!favorite });
        } catch (error) {
            console.error('Check favorite error:', error);
            res.status(500).json({ error: 'Erreur lors de la vérification' });
        }
    });

    return router;
}

module.exports = createFavoritesRoutes;

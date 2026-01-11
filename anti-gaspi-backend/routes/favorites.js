const express = require('express');
const { authenticate } = require('../middleware/auth');

/**
 * Create favorites routes
 * All routes require authentication
 */
function createFavoritesRoutes(db) {
    const router = express.Router();

    // Get user's favorites (with merchant details)
    router.get('/', authenticate, async (req, res) => {
        try {
            const favorites = db.prepare(`
                SELECT 
                    f.id,
                    f.merchant_id,
                    f.created_at,
                    m.business_name,
                    m.description,
                    m.phone,
                    m.logo_url,
                    m.rating,
                    m.tagline,
                    u.latitude,
                    u.longitude,
                    u.address
                FROM favorites f
                JOIN merchants m ON f.merchant_id = m.id
                JOIN users u ON m.user_id = u.id
                WHERE f.user_id = ?
                ORDER BY f.created_at DESC
            `).all(req.user.userId);

            res.json({ favorites });
        } catch (error) {
            console.error('Error getting favorites:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    // Add merchant to favorites
    router.post('/', authenticate, async (req, res) => {
        try {
            console.log('POST /favorites request:', { body: req.body, user: req.user });
            const { merchant_id } = req.body;

            if (!merchant_id) {
                console.log('Missing merchant_id');
                return res.status(400).json({ error: 'merchant_id requis' });
            }

            // Check if merchant exists
            const merchant = db.prepare('SELECT id FROM merchants WHERE id = ?').get(merchant_id);
            if (!merchant) {
                console.log('Merchant not found:', merchant_id);
                return res.status(404).json({ error: 'Commerçant introuvable' });
            }

            // Check if already favorited
            const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND merchant_id = ?')
                .get(req.user.userId, merchant_id);

            if (existing) {
                console.log('Already favorited');
                return res.status(400).json({ error: 'Déjà dans vos favoris' });
            }

            // Add to favorites
            const result = db.prepare(`
                INSERT INTO favorites (user_id, merchant_id)
                VALUES (?, ?)
            `).run(req.user.userId, merchant_id);

            console.log('Favorite added:', result);

            res.status(201).json({
                id: result.lastInsertRowid,
                user_id: req.user.userId,
                merchant_id,
            });
        } catch (error) {
            console.error('Error adding favorite:', error);
            res.status(500).json({ error: 'Erreur serveur: ' + error.message });
        }
    });

    // Remove merchant from favorites
    router.delete('/:merchant_id', authenticate, async (req, res) => {
        try {
            const { merchant_id } = req.params;

            const result = db.prepare('DELETE FROM favorites WHERE user_id = ? AND merchant_id = ?')
                .run(req.user.userId, merchant_id);

            if (result.changes === 0) {
                return res.status(404).json({ error: 'Favori introuvable' });
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error removing favorite:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    // Check if merchant is favorited
    router.get('/check/:merchant_id', authenticate, async (req, res) => {
        try {
            const { merchant_id } = req.params;

            const favorite = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND merchant_id = ?')
                .get(req.user.userId, merchant_id);

            res.json({ is_favorite: !!favorite });
        } catch (error) {
            console.error('Error checking favorite:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    return router;
}

module.exports = createFavoritesRoutes;

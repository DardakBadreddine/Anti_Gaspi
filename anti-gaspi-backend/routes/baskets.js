const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, requireMerchant } = require('../middleware/auth');
const { filterByDistance } = require('../utils/geo');

function createBasketRoutes(db) {
    const router = express.Router();

    /**
     * GET /api/baskets
     * Search baskets by geolocation and radius
     * Query params: lat, lng, radius (in km)
     */
    router.get('/', authenticate, (req, res) => {
        const { lat, lng, radius = 5 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude et longitude requises' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radiusKm = parseFloat(radius);

        try {
            // Get all active baskets with merchant info
            const baskets = db.prepare(`
        SELECT 
          b.*,
          m.business_name,
          u.latitude,
          u.longitude,
          u.address,
          (b.quantity - COALESCE((
            SELECT COUNT(*) 
            FROM reservations r 
            WHERE r.basket_id = b.id AND r.status = 'pending'
          ), 0)) as available_quantity
        FROM baskets b
        JOIN merchants m ON b.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE datetime(b.expires_at) > datetime('now')
        AND b.quantity > 0
      `).all();

            // Filter by distance
            const filteredBaskets = filterByDistance(baskets, userLat, userLng, radiusKm);

            // Only return baskets with available quantity
            const availableBaskets = filteredBaskets.filter(b => b.available_quantity > 0);

            res.json({ baskets: availableBaskets });
        } catch (error) {
            console.error('Get baskets error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des paniers' });
        }
    });

    /**
     * GET /api/baskets/:id
     * Get basket details
     */
    router.get('/:id', authenticate, (req, res) => {
        const { id } = req.params;

        try {
            const basket = db.prepare(`
        SELECT 
          b.*,
          m.business_name,
          m.description as merchant_description,
          m.phone,
          u.latitude,
          u.longitude,
          u.address,
          (b.quantity - COALESCE((
            SELECT COUNT(*) 
            FROM reservations r 
            WHERE r.basket_id = b.id AND r.status = 'pending'
          ), 0)) as available_quantity
        FROM baskets b
        JOIN merchants m ON b.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE b.id = ?
      `).get(id);

            if (!basket) {
                return res.status(404).json({ error: 'Panier introuvable' });
            }

            // Check if expired
            const now = new Date();
            const expiresAt = new Date(basket.expires_at);

            if (expiresAt <= now) {
                return res.status(410).json({ error: 'Ce panier a expiré' });
            }

            res.json({ basket });
        } catch (error) {
            console.error('Get basket error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération du panier' });
        }
    });

    /**
     * POST /api/baskets
     * Create a new basket (merchant only)
     */
    router.post('/',
        authenticate,
        requireMerchant,
        body('title').trim().notEmpty(),
        body('description').optional().trim(),
        body('originalPrice').isFloat({ min: 0 }),
        body('discountedPrice').isFloat({ min: 0 }),
        body('quantity').isInt({ min: 1 }),
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, originalPrice, discountedPrice, quantity } = req.body;

            try {
                // Get merchant ID
                const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(req.user.userId);

                if (!merchant) {
                    return res.status(403).json({ error: 'Profil commerçant introuvable' });
                }

                // Calculate expiration (1 hour from now)
                const now = new Date();
                const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

                // Insert basket
                const insertBasket = db.prepare(`
          INSERT INTO baskets (merchant_id, title, description, original_price, discounted_price, quantity, expires_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

                const result = insertBasket.run(
                    merchant.id,
                    title,
                    description || null,
                    originalPrice,
                    discountedPrice,
                    quantity,
                    expiresAt.toISOString()
                );

                res.status(201).json({
                    message: 'Panier créé avec succès',
                    basket: {
                        id: result.lastInsertRowid,
                        title,
                        description,
                        original_price: originalPrice,
                        discounted_price: discountedPrice,
                        quantity,
                        expires_at: expiresAt.toISOString()
                    }
                });
            } catch (error) {
                console.error('Create basket error:', error);
                res.status(500).json({ error: 'Erreur lors de la création du panier' });
            }
        }
    );

    /**
     * DELETE /api/baskets/:id
     * Delete a basket (merchant only)
     */
    router.delete('/:id', authenticate, requireMerchant, (req, res) => {
        const { id } = req.params;

        try {
            // Get merchant ID
            const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(req.user.userId);

            // Verify ownership
            const basket = db.prepare('SELECT * FROM baskets WHERE id = ? AND merchant_id = ?').get(id, merchant.id);

            if (!basket) {
                return res.status(404).json({ error: 'Panier introuvable ou accès non autorisé' });
            }

            // Delete basket
            db.prepare('DELETE FROM baskets WHERE id = ?').run(id);

            res.json({ message: 'Panier supprimé avec succès' });
        } catch (error) {
            console.error('Delete basket error:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression du panier' });
        }
    });

    return router;
}

// Background task to clean up expired baskets
function startBasketCleanup(db) {
    setInterval(() => {
        try {
            const result = db.prepare(`
        DELETE FROM baskets 
        WHERE datetime(expires_at) <= datetime('now')
      `).run();

            if (result.changes > 0) {
                console.log(`🧹 Cleaned up ${result.changes} expired baskets`);
            }
        } catch (error) {
            console.error('Basket cleanup error:', error);
        }
    }, 60000); // Run every minute
}

module.exports = { createBasketRoutes, startBasketCleanup };

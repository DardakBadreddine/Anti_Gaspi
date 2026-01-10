const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, requireMerchant } = require('../middleware/auth');
const { filterByDistance } = require('../utils/geo');

function createBasketRoutes(db) {
    const router = express.Router();

    /**
     * GET /api/baskets
     * Search baskets by geolocation and radius with filters
     * Query params: lat, lng, radius (in km), category, minPrice, maxPrice, sortBy
     */
    router.get('/', authenticate, (req, res) => {
        const { lat, lng, radius = 5, category, minPrice, maxPrice, sortBy = 'distance' } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude et longitude requises' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radiusKm = parseFloat(radius);

        try {
            // Get all active baskets with merchant info and rating
            // Base query with availability calculation
            let categoryFilter = '';
            let priceFilter = '';
            let orderBy = '';
            const params = [];

            if (category && category !== 'Tous') {
                categoryFilter = 'AND b.category = ?';
                params.push(category);
            }

            if (minPrice) {
                priceFilter += ' AND b.discounted_price >= ?';
                params.push(parseFloat(minPrice));
            }
            if (maxPrice) {
                priceFilter += ' AND b.discounted_price <= ?';
                params.push(parseFloat(maxPrice));
            }

            // Sorting will be done in JS for distance, but for price/rating, we can add to SQL
            if (sortBy === 'price') {
                orderBy = 'ORDER BY b.discounted_price ASC';
            } else if (sortBy === 'rating') {
                orderBy = 'ORDER BY merchant_rating DESC';
            }

            const query = `
            SELECT 
                b.*,
                m.business_name,
                u.latitude,
                u.longitude,
                u.address,
                (b.quantity - COALESCE(pending.count, 0)) as available_quantity,
                COALESCE(AVG(rev.rating), 0) as merchant_rating,
                COUNT(DISTINCT rev.id) as review_count
            FROM baskets b
            JOIN merchants m ON b.merchant_id = m.id
            JOIN users u ON m.user_id = u.id
            LEFT JOIN (
                SELECT basket_id, COUNT(*) as count 
                FROM reservations 
                WHERE status = 'pending'
                GROUP BY basket_id
            ) pending ON b.id = pending.basket_id
            LEFT JOIN reviews rev ON m.id = rev.merchant_id
            WHERE datetime(b.expires_at) > datetime('now')
            AND b.quantity > 0
            ${categoryFilter}
            ${priceFilter}
            GROUP BY b.id
            ${orderBy}
        `;

            let baskets = db.prepare(query).all(...params);

            // Filter by distance
            let filteredBaskets = filterByDistance(baskets, userLat, userLng, radiusKm);

            // Only return baskets with available quantity
            // This filter is now largely redundant due to the SQL WHERE clause, but kept for safety/consistency
            filteredBaskets = filteredBaskets.filter(b => b.available_quantity > 0);

            if (category && category !== 'Tous') {
                filteredBaskets = filteredBaskets.filter(b => b.category === category);
            }

            // Apply price filters
            if (minPrice) {
                filteredBaskets = filteredBaskets.filter(b => b.discounted_price >= parseFloat(minPrice));
            }
            if (maxPrice) {
                filteredBaskets = filteredBaskets.filter(b => b.discounted_price <= parseFloat(maxPrice));
            }

            // Sort results
            if (sortBy === 'price') {
                filteredBaskets.sort((a, b) => a.discounted_price - b.discounted_price);
            } else if (sortBy === 'rating') {
                filteredBaskets.sort((a, b) => b.merchant_rating - a.merchant_rating);
            }
            // default is distance (already sorted by filterByDistance)

            res.json({ baskets: filteredBaskets });
        } catch (error) {
            console.error('Get baskets error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des paniers' });
        }
    });

    /**
     * GET /api/baskets/:id
     * Get basket details with merchant rating
     */
    router.get('/:id', authenticate, (req, res) => {
        const { id } = req.params;

        try {
            const basket = db.prepare(`
        SELECT 
          b.*,
          m.id as merchant_id,
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
          ), 0)) as available_quantity,
          COALESCE(AVG(r.rating), 0) as merchant_rating,
          COUNT(DISTINCT r.id) as review_count
        FROM baskets b
        JOIN merchants m ON b.merchant_id = m.id
        JOIN users u ON m.user_id = u.id
        LEFT JOIN reviews r ON m.id = r.merchant_id
        WHERE b.id = ?
        GROUP BY b.id
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
        body('category').optional().trim(),
        body('imageUrl').optional().trim(),
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, originalPrice, discountedPrice, quantity, category, imageUrl } = req.body;

            // Debug logging
            console.log('📦 Creating basket:', { title, category, imageUrl });

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
          INSERT INTO baskets (merchant_id, title, description, original_price, discounted_price, quantity, category, image_url, expires_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

                const result = insertBasket.run(
                    merchant.id,
                    title,
                    description || null,
                    originalPrice,
                    discountedPrice,
                    quantity,
                    category || 'Autre',
                    imageUrl || null,
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
                        category: category || 'Autre',
                        image_url: imageUrl || null,
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

    // PUT /api/baskets/:id/reactivate - Reactivate a sold basket
    router.put('/:id/reactivate',
        authenticate,
        requireMerchant,
        body('quantity').isInt({ min: 1 }),
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const { quantity } = req.body;

            try {
                // Get merchant ID
                const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(req.user.userId);

                // Verify ownership
                const basket = db.prepare('SELECT * FROM baskets WHERE id = ? AND merchant_id = ?').get(id, merchant.id);

                if (!basket) {
                    return res.status(404).json({ error: 'Panier introuvable' });
                }

                // Update basket: new quantity + extend expiration by 1 hour
                const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

                db.prepare(`
                    UPDATE baskets 
                    SET quantity = ?, expires_at = ?
                    WHERE id = ?
                `).run(quantity, newExpiresAt, id);

                const updatedBasket = db.prepare('SELECT * FROM baskets WHERE id = ?').get(id);

                res.json({
                    message: 'Panier réactivé avec succès',
                    basket: updatedBasket
                });
            } catch (error) {
                console.error('Reactivate basket error:', error);
                res.status(500).json({ error: 'Erreur lors de la réactivation' });
            }
        }
    );

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

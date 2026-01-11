const express = require('express');
const { authenticate, requireMerchant, tryAuthenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const fetch = require('node-fetch');

function createBasketRoutes(db) {
    const router = express.Router();

    // Helper for distance (Haversine)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * GET /api/baskets
     * Search shops with paniers
     * PUBLIC/AUTHENTICATED
     */
    router.get('/', tryAuthenticate, (req, res) => {
        const { lat, lng, radius = 50 } = req.query; // Default radius increased
        const userId = req.user ? req.user.userId : 0;

        try {
            // 1. Get all merchants with their location and review count
            const shops = db.prepare(`
                SELECT 
                    m.id, m.business_name, m.rating, m.tagline, m.phone, m.logo_url, m.cover_image_url,
                    u.latitude, u.longitude, u.address,
                    (SELECT COUNT(*) FROM favorites f WHERE f.merchant_id = m.id AND f.user_id = ?) as is_favorited_count,
                    (SELECT COUNT(*) FROM reviews WHERE merchant_id = m.id) as review_count
                FROM merchants m
                JOIN users u ON m.user_id = u.id
            `).all(userId);

            // 2. Filter by distance & attach baskets
            const results = shops.map(shop => {
                let distance = null;
                if (lat && lng && shop.latitude && shop.longitude) {
                    distance = calculateDistance(
                        parseFloat(lat), parseFloat(lng),
                        shop.latitude, shop.longitude
                    );
                }

                // Fetch active baskets for this shop with categories
                const paniers = db.prepare(`
                    SELECT 
                        b.*,
                        (b.quantity - COALESCE((
                            SELECT COUNT(*) 
                            FROM reservations r 
                            WHERE r.basket_id = b.id AND r.status = 'pending'
                        ), 0)) as available_quantity
                    FROM baskets b
                    WHERE b.merchant_id = ? 
                    AND b.visible = 1
                    AND datetime(b.expires_at) > datetime('now')
                `).all(shop.id);

                // Add categories and merchant logo for each basket
                const paniersWithCategories = paniers.map(basket => {
                    const categories = db.prepare(`
                        SELECT c.id, c.name, c.icon, c.color
                        FROM categories c
                        JOIN basket_categories bc ON c.id = bc.category_id
                        WHERE bc.basket_id = ?
                    `).all(basket.id);
                    return { ...basket, categories, merchant_logo_url: shop.logo_url };
                });

                return {
                    ...shop,
                    distance,
                    is_favorited: shop.is_favorited_count > 0,
                    paniers: paniersWithCategories.filter(p => p.available_quantity > 0)
                };
            }).filter(shop => {
                // Filter by radius if provided, otherwise show all if radius not strict
                if (!lat || !lng) return true; // No user location = show all
                return shop.distance <= parseFloat(radius);
            });

            // Sort by distance
            results.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });

            res.json({ shops: results });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ error: 'Erreur de recherche' });
        }
    });

    /**
     * GET /api/baskets/merchant
     * Get merchant's own baskets
     */
    router.get('/merchant', authenticate, requireMerchant, (req, res) => {
        try {
            const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(req.user.userId);
            if (!merchant) {
                return res.status(403).json({ error: 'Profil commerçant introuvable' });
            }

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
                ORDER BY b.created_at DESC
            `).all(merchant.id);

            res.json({ baskets });
        } catch (error) {
            console.error('Get merchant baskets error:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    /**
     * GET /api/baskets/merchant/:merchantId
     * Get baskets for a specific merchant (public)
     */
    router.get('/merchant/:merchantId', tryAuthenticate, (req, res) => {
        try {
            console.log('📦 GET /api/baskets/merchant/:merchantId - merchantId:', req.params.merchantId);
            const { merchantId } = req.params;
            const userId = req.user ? req.user.userId : 0;

            // Get merchant info with review count
            const merchant = db.prepare(`
                SELECT 
                    m.id, m.business_name, m.rating, m.tagline, m.phone, m.logo_url, m.cover_image_url,
                    u.latitude, u.longitude, u.address,
                    (SELECT COUNT(*) FROM reviews WHERE merchant_id = m.id) as review_count
                FROM merchants m
                JOIN users u ON m.user_id = u.id
                WHERE m.id = ?
            `).get(merchantId);

            if (!merchant) {
                return res.status(404).json({ error: 'Commerçant introuvable' });
            }

            // Get active baskets for this merchant
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
                AND b.visible = 1
                AND datetime(b.expires_at) > datetime('now')
                ORDER BY b.created_at DESC
            `).all(merchantId);

            // Add categories and merchant logo for each basket
            const basketsWithCategories = baskets.map(basket => {
                const categories = db.prepare(`
                    SELECT c.id, c.name, c.icon, c.color
                    FROM categories c
                    JOIN basket_categories bc ON c.id = bc.category_id
                    WHERE bc.basket_id = ?
                `).all(basket.id);
                return { ...basket, categories, merchant_logo_url: merchant.logo_url };
            });

            // Check if merchant is favorited
            const isFavorited = userId > 0 ? db.prepare(`
                SELECT id FROM favorites 
                WHERE user_id = ? AND merchant_id = ?
            `).get(userId, merchantId) : null;

            res.json({
                ...merchant,
                id: merchant.id,
                paniers: basketsWithCategories,
                is_favorited: !!isFavorited,
                distance: null, // Distance not calculated for single merchant view
            });
        } catch (error) {
            console.error('Get merchant baskets error:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    /**
     * GET /api/baskets/:id
     * Get detailed basket info
     */
    router.get('/:id', (req, res) => {
        try {
            const basket = db.prepare(`
                SELECT b.*, m.business_name, m.logo_url as merchant_logo_url, u.address, u.latitude, u.longitude
                FROM baskets b
                JOIN merchants m ON b.merchant_id = m.id
                JOIN users u ON m.user_id = u.id
                WHERE b.id = ?
            `).get(req.params.id);

            if (!basket) {
                return res.status(404).json({ error: 'Panier introuvable' });
            }
            res.json(basket);
        } catch (error) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    /**
     * POST /api/baskets
     * Create a new basket
     */
    router.post('/', authenticate, requireMerchant, [
        body('title').notEmpty().trim(),
        body('originalPrice').isFloat({ min: 0 }),
        body('discountedPrice').isFloat({ min: 0 }),
        body('quantity').isInt({ min: 1 }),
        body('durationHours').optional().isFloat({ min: 0.5, max: 48 })
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, originalPrice, discountedPrice, quantity, durationHours = 1, autoRelist = false, imageBase64, imageUrl, categoryIds = [] } = req.body;
        
        // Use base64 image if provided, otherwise fallback to imageUrl
        let finalImageUrl = null;
        if (imageBase64) {
            // Store as data URI for simplicity (in production, upload to cloud storage)
            finalImageUrl = `data:image/jpeg;base64,${imageBase64}`;
        } else if (imageUrl) {
            finalImageUrl = imageUrl;
        }

        try {
            const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(req.user.userId);
            if (!merchant) {
                return res.status(403).json({ error: 'Profil commerçant introuvable' });
            }

            // Calculate expiration based on duration
            const now = new Date();
            const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

            // Ensure auto_relist column exists (migration safety)
            try {
                db.exec('ALTER TABLE baskets ADD COLUMN auto_relist BOOLEAN DEFAULT 0');
            } catch (e) {
                // Column already exists, ignore
            }

            const result = db.prepare(`
                INSERT INTO baskets (merchant_id, title, description, original_price, discounted_price, quantity, expires_at, auto_relist, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(merchant.id, title, description || null, originalPrice, discountedPrice, quantity, expiresAt.toISOString(), autoRelist ? 1 : 0, finalImageUrl);

            const basketId = result.lastInsertRowid;

            // Add categories if provided
            if (categoryIds && categoryIds.length > 0) {
                const insertCategory = db.prepare(`
                    INSERT INTO basket_categories (basket_id, category_id)
                    VALUES (?, ?)
                `);
                for (const categoryId of categoryIds) {
                    try {
                        insertCategory.run(basketId, categoryId);
                    } catch (error) {
                        console.error('Error adding category:', error);
                    }
                }
            }

            // Send Notifications to followers
            (async () => {
                try {
                    const favorites = db.prepare(`
                        SELECT pt.token 
                        FROM favorites f
                        JOIN push_tokens pt ON f.user_id = pt.user_id
                        WHERE f.merchant_id = ?
                    `).all(merchant.id);

                    if (favorites.length > 0) {
                        const messages = favorites.map(fav => ({
                            to: fav.token,
                            sound: 'default',
                            title: 'Nouveau Panier ! 🧺',
                            body: `${merchant.business_name || 'Un commerce'} vient d'ajouter un panier Anti-Gaspi !`,
                            data: { basketId: result.lastInsertRowid, type: 'new_basket' },
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
                        console.log(`🔔 Sent ${favorites.length} notifications`);
                    }
                } catch (notifError) {
                    console.error('Notification error:', notifError);
                }
            })();

            res.status(201).json({
                message: 'Panier créé',
                basket: { id: result.lastInsertRowid, title, expires_at: expiresAt }
            });
        } catch (error) {
            console.error('Create basket error:', error);
            console.error('Error details:', error.message);
            console.error('Stack:', error.stack);
            res.status(500).json({ error: 'Erreur lors de la création: ' + error.message });
        }
    });

    /**
     * DELETE /api/baskets/:id
     * Delete a basket
     */
    router.delete('/:id', authenticate, requireMerchant, (req, res) => {
        try {
            const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(req.user.userId);

            const result = db.prepare(`
                DELETE FROM baskets 
                WHERE id = ? AND merchant_id = ?
            `).run(req.params.id, merchant.id);

            if (result.changes === 0) {
                return res.status(404).json({ error: 'Panier introuvable ou vous n\'êtes pas le propriétaire' });
            }

            res.json({ message: 'Panier supprimé' });
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
    });

    return router;
}

function startBasketCleanup(db) {
    console.log("⏱️ Starting cleanup scheduler...");
    setInterval(() => {
        try {
            // 1. Find expired pending reservations
            // Only targets reservations linked to baskets that have now expired
            const expiredReservations = db.prepare(`
                SELECT r.id, r.basket_id, b.auto_relist
                FROM reservations r 
                JOIN baskets b ON r.basket_id = b.id 
                WHERE r.status = 'pending' 
                AND datetime(b.expires_at) < datetime('now')
            `).all();

            if (expiredReservations.length > 0) {
                console.log(`🧹 Processing ${expiredReservations.length} expired reservations...`);

                const updateStatus = db.prepare("UPDATE reservations SET status = 'expired' WHERE id = ?");
                const restockBasket = db.prepare("UPDATE baskets SET quantity = quantity + 1 WHERE id = ?");

                const runTransaction = db.transaction(() => {
                    for (const res of expiredReservations) {
                        // Mark as expired
                        updateStatus.run(res.id);

                        // Restock if enabled
                        if (res.auto_relist === 1) {
                            console.log(`♻️ Auto-relisting basket ${res.basket_id}`);
                            restockBasket.run(res.basket_id);
                        }
                    }
                });

                runTransaction();
            }
        } catch (error) {
            console.error('Basket cleanup error:', error);
        }
    }, 60000); // Check every minute
}

module.exports = { createBasketRoutes, startBasketCleanup };

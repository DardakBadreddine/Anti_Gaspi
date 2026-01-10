const express = require('express');
const { authenticate, requireCustomer, requireMerchant } = require('../middleware/auth');

module.exports = (db) => {
    const router = express.Router();

    // GET /api/stats/user - Get user (customer) statistics
    router.get('/user', authenticate, requireCustomer, (req, res) => {
        const userId = req.user.userId;

        try {
            // Count total collected reservations
            const totalCollected = db.prepare(`
                SELECT COUNT(*) as count 
                FROM reservations 
                WHERE user_id = ? AND status = 'collected'
            `).get(userId).count;

            // Count pending reservations
            const pendingReservations = db.prepare(`
                SELECT COUNT(*) as count 
                FROM reservations 
                WHERE user_id = ? AND status = 'pending'
            `).get(userId).count;

            // Calculate money saved (original_price - discounted_price) for collected
            const savings = db.prepare(`
                SELECT 
                    COALESCE(SUM(b.original_price - b.discounted_price), 0) as money_saved,
                    COALESCE(SUM(b.original_price), 0) as total_original_value
                FROM reservations r
                JOIN baskets b ON r.basket_id = b.id
                WHERE r.user_id = ? AND r.status = 'collected'
            `).get(userId);

            // Count favorite merchants
            const favoriteMerchants = db.prepare(`
                SELECT COUNT(*) as count 
                FROM favorites 
                WHERE user_id = ?
            `).get(userId).count;

            // Calculate environmental impact
            // Estimate: 3kg food per basket, 2.5kg CO2 per kg food, each basket = 2 meals
            const foodSavedKg = totalCollected * 3;
            const co2SavedKg = Math.round(foodSavedKg * 2.5);
            const mealsEquivalent = totalCollected * 2;

            const stats = {
                totalCollected,
                pendingReservations,
                moneySaved: Number(savings.money_saved.toFixed(2)),
                totalOriginalValue: Number(savings.total_original_value.toFixed(2)),
                favoriteMerchants,
                environmentalImpact: {
                    foodSavedKg,
                    co2SavedKg,
                    mealsEquivalent
                }
            };

            res.json({ stats });
        } catch (error) {
            console.error('Get user stats error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
        }
    });

    // GET /api/stats/merchant - Get merchant statistics
    router.get('/merchant', authenticate, requireMerchant, (req, res) => {
        const userId = req.user.userId;

        // Get merchant ID from user
        const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(userId);

        if (!merchant) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        const merchantId = merchant.id;

        // Total baskets created
        const totalBaskets = db.prepare(
            'SELECT COUNT(*) as count FROM baskets WHERE merchant_id = ?'
        ).get(merchantId).count;

        // Active baskets (not expired, has quantity)
        const activeBaskets = db.prepare(`
            SELECT COUNT(*) as count FROM baskets 
            WHERE merchant_id = ? 
            AND expires_at > datetime('now')
            AND quantity > 0
        `).get(merchantId).count;

        // Sold baskets (collected reservations)
        const soldBaskets = db.prepare(`
            SELECT COUNT(*) as count FROM reservations r
            JOIN baskets b ON r.basket_id = b.id
            WHERE b.merchant_id = ? AND r.status = 'collected'
        `).get(merchantId).count;

        // Total revenue (sum of discounted prices for collected reservations)
        const revenueResult = db.prepare(`
            SELECT COALESCE(SUM(b.discounted_price), 0) as revenue FROM reservations r
            JOIN baskets b ON r.basket_id = b.id
            WHERE b.merchant_id = ? AND r.status = 'collected'
        `).get(merchantId);

        // Food saved (estimate 3kg per basket)
        const savedFromWaste = soldBaskets * 3;

        // Unique customers
        const uniqueCustomers = db.prepare(`
            SELECT COUNT(DISTINCT r.user_id) as count FROM reservations r
            JOIN baskets b ON r.basket_id = b.id
            WHERE b.merchant_id = ? AND r.status = 'collected'
        `).get(merchantId).count;

        // Average rating and review count
        const ratingData = db.prepare(`
            SELECT 
                COALESCE(AVG(rating), 0) as averageRating,
                COUNT(*) as reviewCount
            FROM reviews
            WHERE merchant_id = ?
        `).get(merchantId);

        const stats = {
            totalBaskets,
            soldBaskets,
            activeBaskets,
            totalRevenue: Number(revenueResult.revenue.toFixed(2)),
            savedFromWaste,
            customers: uniqueCustomers,
            averageRating: Number(ratingData.averageRating.toFixed(1)),
            reviewCount: ratingData.reviewCount
        };

        res.json({ stats });
    });

    return router;
};

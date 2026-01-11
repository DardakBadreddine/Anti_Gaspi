/**
 * GET /api/baskets/merchant
 * Get merchant's own baskets
 */
router.get('/merchant', authenticate, requireMerchant, (req, res) => {
    try {
        const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(req.user.userId);
        if (!merchant) return res.status(403).json({ error: 'Profil commerçant introuvable' });
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
        res.status(500).json({ error: 'Erreur lors de la récupération des paniers' });
    }
});


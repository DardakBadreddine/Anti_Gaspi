const express = require('express');

/**
 * Create categories routes
 */
function createCategoriesRoutes(db) {
    const router = express.Router();

    /**
     * GET /api/categories
     * Get all categories
     */
    router.get('/', (req, res) => {
        try {
            const categories = db.prepare(`
                SELECT * FROM categories
                ORDER BY name ASC
            `).all();

            res.json({ categories });
        } catch (error) {
            console.error('Error getting categories:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    /**
     * GET /api/categories/:id
     * Get category by ID
     */
    router.get('/:id', (req, res) => {
        try {
            const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Catégorie introuvable' });
            }
            res.json({ category });
        } catch (error) {
            console.error('Error getting category:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    });

    return router;
}

module.exports = createCategoriesRoutes;

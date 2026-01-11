const express = require('express');
const { authenticate } = require('../middleware/auth');

function createPushTokenRoutes(db) {
    const router = express.Router();

    /**
     * POST /api/push-tokens
     * Save/Update push token for user
     */
    router.post('/', authenticate, (req, res) => {
        const { token, platform } = req.body;
        const userId = req.user.userId;

        if (!token) {
            return res.status(400).json({ error: 'Token requis' });
        }

        try {
            // Check if token exists for this user
            const existing = db.prepare('SELECT id FROM push_tokens WHERE user_id = ? AND token = ?').get(userId, token);

            if (!existing) {
                // Remove old tokens for this user if you want only one device per user, 
                // OR just add new one. Let's add new one but maybe limit count?
                // For simplicity, we just insert.

                db.prepare(`
                    INSERT INTO push_tokens (user_id, token, platform)
                    VALUES (?, ?, ?)
                `).run(userId, token, platform || 'unknown');
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Save push token error:', error);
            res.status(500).json({ error: 'Erreur lors de la sauvegarde du token' });
        }
    });

    return router;
}

module.exports = createPushTokenRoutes;

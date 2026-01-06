const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

function createAuthRoutes(db) {
    const router = express.Router();

    /**
     * POST /api/auth/register
     * Register a new user (customer or merchant)
     */
    router.post('/register',
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('role').isIn(['customer', 'merchant']),
        body('name').trim().notEmpty(),
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, role, name, address, latitude, longitude, businessName, description, phone } = req.body;

            try {
                // Check if user already exists
                const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
                if (existingUser) {
                    return res.status(400).json({ error: 'Cet email est déjà utilisé' });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert user
                const insertUser = db.prepare(
                    'INSERT INTO users (email, password, role, name, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)'
                );
                const result = insertUser.run(email, hashedPassword, role, name, address || null, latitude || null, longitude || null);
                const userId = result.lastInsertRowid;

                // If merchant, insert merchant details
                if (role === 'merchant') {
                    const insertMerchant = db.prepare(
                        'INSERT INTO merchants (user_id, business_name, description, phone) VALUES (?, ?, ?, ?)'
                    );
                    insertMerchant.run(userId, businessName || name, description || null, phone || null);
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId, email, role },
                    process.env.JWT_SECRET,
                    { expiresIn: '30d' }
                );

                res.status(201).json({
                    message: 'Compte créé avec succès',
                    token,
                    user: { id: userId, email, role, name }
                });
            } catch (error) {
                console.error('Registration error:', error);
                res.status(500).json({ error: 'Erreur lors de la création du compte' });
            }
        }
    );

    /**
     * POST /api/auth/login
     * Login user and return JWT token
     */
    router.post('/login',
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            try {
                // Find user
                const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

                if (!user) {
                    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(password, user.password);

                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user.id, email: user.email, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '30d' }
                );

                // Get merchant ID if merchant
                let merchantId = null;
                if (user.role === 'merchant') {
                    const merchant = db.prepare('SELECT id FROM merchants WHERE user_id = ?').get(user.id);
                    merchantId = merchant ? merchant.id : null;
                }

                res.json({
                    message: 'Connexion réussie',
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        name: user.name,
                        merchantId
                    }
                });
            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ error: 'Erreur lors de la connexion' });
            }
        }
    );

    return router;
}

module.exports = createAuthRoutes;

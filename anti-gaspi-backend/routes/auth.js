const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');

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

            const { email, password, role, name, address, latitude, longitude, businessName, description, phone, coverImageBase64, logoImageBase64, profileImageBase64 } = req.body;

            try {
                // Check if user already exists
                const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
                if (existingUser) {
                    return res.status(400).json({ error: 'Cet email est déjà utilisé' });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert user
                const insertUser = db.prepare(
                    'INSERT INTO users (email, password, role, name, address, latitude, longitude, phone, profile_image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                // Format profile image if provided
                let profileImage = null;
                if (profileImageBase64 && profileImageBase64.trim() !== '') {
                    if (!profileImageBase64.startsWith('data:')) {
                        profileImage = `data:image/jpeg;base64,${profileImageBase64}`;
                    } else {
                        profileImage = profileImageBase64;
                    }
                }
                
                const result = await insertUser.run(
                    email, 
                    hashedPassword, 
                    role, 
                    name, 
                    address || null, 
                    latitude || null, 
                    longitude || null,
                    phone || null,
                    profileImage
                );
                const userId = result.lastInsertRowid;

                // If merchant, insert merchant details
                if (role === 'merchant') {
                    // Format images if provided
                    let coverImage = null;
                    if (coverImageBase64 && coverImageBase64.trim() !== '') {
                        if (!coverImageBase64.startsWith('data:')) {
                            coverImage = `data:image/jpeg;base64,${coverImageBase64}`;
                        } else {
                            coverImage = coverImageBase64;
                        }
                    }
                    
                    let logoImage = null;
                    if (logoImageBase64 && logoImageBase64.trim() !== '') {
                        if (!logoImageBase64.startsWith('data:')) {
                            logoImage = `data:image/jpeg;base64,${logoImageBase64}`;
                        } else {
                            logoImage = logoImageBase64;
                        }
                    }
                    
                    const insertMerchant = db.prepare(
                        'INSERT INTO merchants (user_id, business_name, description, phone, cover_image_url, logo_url) VALUES (?, ?, ?, ?, ?, ?)'
                    );
                    await insertMerchant.run(
                        userId, 
                        businessName || name, 
                        description || null, 
                        phone || null,
                        coverImage,
                        logoImage
                    );
                }

                // Get merchant details if merchant
                let merchantData = null;
                if (role === 'merchant') {
                    const merchant = await db.prepare('SELECT * FROM merchants WHERE user_id = ?').get(userId);
                    if (merchant) {
                        merchantData = {
                            id: merchant.id,
                            business_name: merchant.business_name,
                            description: merchant.description,
                            phone: merchant.phone,
                            logo_url: merchant.logo_url,
                            cover_image_url: merchant.cover_image_url,
                            rating: merchant.rating,
                            tagline: merchant.tagline,
                        };
                    }
                }

                // Get user with profile_image_url
                const createdUser = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

                // Generate JWT token
                const token = jwt.sign(
                    { userId, email, role },
                    process.env.JWT_SECRET,
                    { expiresIn: '30d' }
                );

                res.status(201).json({
                    message: 'Compte créé avec succès',
                    token,
                    user: {
                        id: userId,
                        email,
                        role,
                        name,
                        address: address || null,
                        latitude: latitude || null,
                        longitude: longitude || null,
                        phone: role === 'merchant' ? (merchantData?.phone || phone) : (createdUser.phone || phone || null),
                        profile_image_url: createdUser.profile_image_url || null,
                        merchantId: merchantData?.id || null,
                        business_name: merchantData?.business_name || null,
                        description: merchantData?.description || null,
                        logo_url: merchantData?.logo_url || null,
                        cover_image_url: merchantData?.cover_image_url || null,
                        rating: merchantData?.rating || 0,
                        tagline: merchantData?.tagline || null,
                    }
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
                const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);

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

                // Get merchant details if merchant
                let merchantData = null;
                if (user.role === 'merchant') {
                    const merchant = await db.prepare('SELECT * FROM merchants WHERE user_id = ?').get(user.id);
                    if (merchant) {
                        merchantData = {
                            id: merchant.id,
                            business_name: merchant.business_name,
                            description: merchant.description,
                            phone: merchant.phone,
                            logo_url: merchant.logo_url,
                            cover_image_url: merchant.cover_image_url,
                            rating: merchant.rating,
                            tagline: merchant.tagline,
                        };
                    }
                }

                res.json({
                    message: 'Connexion réussie',
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        name: user.name,
                        address: user.address,
                        latitude: user.latitude,
                        longitude: user.longitude,
                        phone: user.role === 'customer' ? user.phone : merchantData?.phone,
                        profile_image_url: user.profile_image_url,
                        merchantId: merchantData?.id,
                        business_name: merchantData?.business_name,
                        description: merchantData?.description,
                        logo_url: merchantData?.logo_url,
                        cover_image_url: merchantData?.cover_image_url,
                        rating: merchantData?.rating,
                        tagline: merchantData?.tagline,
                    }
                });
            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ error: 'Erreur lors de la connexion' });
            }
        }
    );

    /**
     * PUT /api/auth/update
     * Update user profile
     */
    router.put('/update', authenticate, async (req, res) => {
        const { name, email, password, address, latitude, longitude, businessName, description, phone } = req.body;
        const userId = req.user.userId;

        try {
            // Update basic user info
            const updates = [];
            const params = [];

            if (name) { updates.push('name = ?'); params.push(name); }
            if (email) { updates.push('email = ?'); params.push(email); }
            if (address) { updates.push('address = ?'); params.push(address); }
            if (latitude !== undefined) { updates.push('latitude = ?'); params.push(latitude); }
            if (longitude !== undefined) { updates.push('longitude = ?'); params.push(longitude); }
            if (req.body.profileImageBase64 !== undefined) { 
                updates.push('profile_image_url = ?'); 
                // Ensure proper format: if it's already a data URI, use it; otherwise add prefix
                let imageData = req.body.profileImageBase64;
                if (imageData && !imageData.startsWith('data:')) {
                    imageData = `data:image/jpeg;base64,${imageData}`;
                }
                params.push(imageData || null); 
            }
            // For customers, phone is stored in users table
            if (req.user.role === 'customer' && phone !== undefined) { 
                updates.push('phone = ?'); 
                params.push(phone); 
            }

            if (updates.length > 0) {
                params.push(userId);
                await db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
            }

            // Update password if provided
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);
            }

            // Update merchant info if applicable
            if (req.user.role === 'merchant') {
                const merchantUpdates = [];
                const merchantParams = [];

                if (businessName) { merchantUpdates.push('business_name = ?'); merchantParams.push(businessName); }
                if (description) { merchantUpdates.push('description = ?'); merchantParams.push(description); }
                if (phone) { merchantUpdates.push('phone = ?'); merchantParams.push(phone); }
                if (req.body.coverImageBase64 !== undefined) { 
                    merchantUpdates.push('cover_image_url = ?'); 
                    // Ensure proper format
                    let imageData = req.body.coverImageBase64;
                    if (imageData && !imageData.startsWith('data:')) {
                        imageData = `data:image/jpeg;base64,${imageData}`;
                    }
                    merchantParams.push(imageData || null); 
                }
                if (req.body.logoImageBase64 !== undefined) { 
                    merchantUpdates.push('logo_url = ?'); 
                    // Ensure proper format
                    let imageData = req.body.logoImageBase64;
                    if (imageData && !imageData.startsWith('data:')) {
                        imageData = `data:image/jpeg;base64,${imageData}`;
                    }
                    merchantParams.push(imageData || null); 
                }

                if (merchantUpdates.length > 0) {
                    merchantParams.push(userId);
                    await db.prepare(`UPDATE merchants SET ${merchantUpdates.join(', ')} WHERE user_id = ?`).run(...merchantParams);
                }
            }

            // Fetch updated user to return
            const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

            // Get merchant details if merchant
            let merchantData = null;
            if (user.role === 'merchant') {
                const merchant = await db.prepare('SELECT * FROM merchants WHERE user_id = ?').get(user.id);
                if (merchant) {
                    merchantData = {
                        id: merchant.id,
                        business_name: merchant.business_name,
                        description: merchant.description,
                        phone: merchant.phone,
                        logo_url: merchant.logo_url,
                        cover_image_url: merchant.cover_image_url,
                        rating: merchant.rating,
                        tagline: merchant.tagline,
                    };
                }
            }

            res.json({
                message: 'Profil mis à jour',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    address: user.address,
                    latitude: user.latitude,
                    longitude: user.longitude,
                    phone: user.role === 'customer' ? user.phone : merchantData?.phone,
                    profile_image_url: user.profile_image_url,
                    merchantId: merchantData?.id,
                    business_name: merchantData?.business_name,
                    description: merchantData?.description,
                    logo_url: merchantData?.logo_url,
                    cover_image_url: merchantData?.cover_image_url,
                    rating: merchantData?.rating,
                    tagline: merchantData?.tagline,
                }
            });
        } catch (error) {
            console.error('Update error:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }
    });

    /**
     * DELETE /api/auth/delete
     * Delete user account
     */
    router.delete('/delete', authenticate, async (req, res) => {
        const userId = req.user.userId;

        try {
            // Because of ON DELETE CASCADE, deleting user will delete merchant info, baskets, and reservations
            await db.prepare('DELETE FROM users WHERE id = ?').run(userId);

            res.json({ message: 'Compte supprimé avec succès' });
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
        }
    });

    return router;
}

module.exports = createAuthRoutes;

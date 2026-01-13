require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, MySQLWrapper } = require('./database/mysql-init');
const createAuthRoutes = require('./routes/auth');
const { createBasketRoutes, startBasketCleanup } = require('./routes/baskets');
const createReservationRoutes = require('./routes/reservations');
const createFavoritesRoutes = require('./routes/favorites');
const createPushTokenRoutes = require('./routes/push_tokens');
const createReviewsRoutes = require('./routes/reviews');
const createCategoriesRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allow requests from Expo apps and production domains
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // In production, allow specific origins
        const allowedOrigins = [
            'https://exp.host',
            'https://expo.dev',
            process.env.ALLOWED_ORIGIN // Add custom domain if needed
        ].filter(Boolean);
        
        if (allowedOrigins.some(allowed => origin.includes(allowed))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));
// Increase body size limit to 20MB for image uploads (base64 can be large)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logging
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - FROM: ${ip}`);
    next();
});

// Initialize MySQL database and start server
(async () => {
    try {
        const pool = await initializeDatabase({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const db = new MySQLWrapper(pool);
        
        // Routes
        app.use('/api/auth', createAuthRoutes(db));
        app.use('/api/baskets', createBasketRoutes(db));
        app.use('/api/reservations', createReservationRoutes(db));
        app.use('/api/favorites', createFavoritesRoutes(db));
        app.use('/api/push-tokens', createPushTokenRoutes(db));
        app.use('/api/reviews', createReviewsRoutes(db));
        app.use('/api/categories', createCategoriesRoutes(db));

        // Health check
        app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        // 404 handler
        app.use((req, res) => {
            res.status(404).json({ error: 'Route introuvable' });
        });

        // Error handler
        app.use((err, req, res, next) => {
            console.error('Server error:', err);
            res.status(500).json({ error: 'Erreur serveur interne' });
        });

        // Start basket cleanup task
        startBasketCleanup(db);

        // Start server - bind to all network interfaces
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Anti-Gaspi API Server`);
            console.log(`📡 Server running on http://localhost:${PORT}`);
            console.log(`📡 Accessible from network on http://0.0.0.0:${PORT}`);
            console.log(`🗄️  Database: MySQL (${process.env.DB_NAME || 'antigaspi'})`);
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n👋 Shutting down gracefully...');
            await db.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    }
})();

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database/init');
const createAuthRoutes = require('./routes/auth');
const { createBasketRoutes, startBasketCleanup } = require('./routes/baskets');
const createReservationRoutes = require('./routes/reservations');
const createFavoritesRoutes = require('./routes/favorites');
const createPushTokenRoutes = require('./routes/push_tokens');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - FROM: ${ip}`);
    next();
});

// Initialize database
const dbPath = process.env.DATABASE_PATH || './database/antigaspi.db';
const db = initializeDatabase(dbPath);

// Routes
app.use('/api/auth', createAuthRoutes(db));
app.use('/api/baskets', createBasketRoutes(db));
app.use('/api/reservations', createReservationRoutes(db));
app.use('/api/favorites', createFavoritesRoutes(db));
app.use('/api/push-tokens', createPushTokenRoutes(db));

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
    console.log(`🗄️  Database: ./database/antigaspi.db`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    db.close();
    process.exit(0);
});

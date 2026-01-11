const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide' });
    }
}

/**
 * Middleware to check if user is a merchant
 */
function requireMerchant(req, res, next) {
    if (req.user.role !== 'merchant') {
        return res.status(403).json({ error: 'Accès réservé aux commerçants' });
    }
    next();
}

/**
 * Middleware to check if user is a customer
 */
function requireCustomer(req, res, next) {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ error: 'Accès réservé aux clients' });
    }
    next();
}

/**
 * Middleware to check if user is authenticated (without erroring)
 */
function tryAuthenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        // Ignore error
    }
    next();
}

module.exports = { authenticate, requireMerchant, requireCustomer, tryAuthenticate };

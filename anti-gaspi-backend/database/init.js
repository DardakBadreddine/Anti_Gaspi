const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

/**
 * Initialize SQLite database with schema
 * @param {string} dbPath - Path to database file
 * @returns {Database} SQLite database instance
 */
function initializeDatabase(dbPath) {
    // Ensure database directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create or open database
    const db = new Database(dbPath, { verbose: console.log });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema (split by semicolons and execute each statement)
    const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const statement of statements) {
        try {
            db.exec(statement);
        } catch (error) {
            // Ignore errors for statements that already exist
            if (!error.message.includes('already exists')) {
                console.error('Schema error:', error.message);
            }
        }
    }

    // Run migration v2 to ensure new tables exist (inline, without closing DB)
    try {
        // Add image_url column to baskets if it doesn't exist
        try {
            db.exec('ALTER TABLE baskets ADD COLUMN image_url TEXT');
            console.log('✅ Added image_url column to baskets');
        } catch (error) {
            if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
                console.log('ℹ️  image_url column already exists or table not ready');
            }
        }

        // Add auto_relist column to baskets if it doesn't exist
        try {
            db.exec('ALTER TABLE baskets ADD COLUMN auto_relist BOOLEAN DEFAULT 0');
            console.log('✅ Added auto_relist column to baskets');
        } catch (error) {
            if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
                console.log('ℹ️  auto_relist column already exists or table not ready');
            }
        }

        // Create categories table
        db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                icon TEXT,
                color TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create basket_categories table
        db.exec(`
            CREATE TABLE IF NOT EXISTS basket_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                basket_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (basket_id) REFERENCES baskets(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                UNIQUE(basket_id, category_id)
            )
        `);

        // Add basket_rating column to reviews if it doesn't exist
        try {
            db.exec('ALTER TABLE reviews ADD COLUMN basket_rating INTEGER CHECK(basket_rating >= 1 AND basket_rating <= 5)');
            console.log('✅ Added basket_rating column to reviews');
        } catch (error) {
            if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
                console.log('ℹ️  basket_rating column already exists or table not ready');
            }
        }

        // Add rating column to baskets if it doesn't exist
        try {
            db.exec('ALTER TABLE baskets ADD COLUMN rating REAL DEFAULT 0');
            console.log('✅ Added rating column to baskets');
        } catch (error) {
            if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
                console.log('ℹ️  rating column already exists or table not ready');
            }
        }

        // Add cover_image_url column to merchants if it doesn't exist
        try {
            db.exec('ALTER TABLE merchants ADD COLUMN cover_image_url TEXT');
            console.log('✅ Added cover_image_url column to merchants');
        } catch (error) {
            if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
                console.log('ℹ️  cover_image_url column already exists or table not ready');
            }
        }

        // Add profile_image_url column to users if it doesn't exist
        try {
            db.exec('ALTER TABLE users ADD COLUMN profile_image_url TEXT');
            console.log('✅ Added profile_image_url column to users');
        } catch (error) {
            if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
                console.log('ℹ️  profile_image_url column already exists or table not ready');
            }
        }

        // Add phone column to users if it doesn't exist (for customers)
        try {
            db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
            console.log('✅ Added phone column to users');
        } catch (error) {
            if (!error.message.includes('duplicate column') && !error.message.includes('no such table')) {
                console.log('ℹ️  phone column already exists or table not ready');
            }
        }

        // Create reviews table
        db.exec(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                merchant_id INTEGER NOT NULL,
                reservation_id INTEGER,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                basket_rating INTEGER CHECK(basket_rating >= 1 AND basket_rating <= 5),
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
                FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
                UNIQUE(user_id, reservation_id)
            )
        `);

        // Create indexes
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_reviews_merchant ON reviews(merchant_id);
            CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
            CREATE INDEX IF NOT EXISTS idx_basket_categories_basket ON basket_categories(basket_id);
            CREATE INDEX IF NOT EXISTS idx_basket_categories_category ON basket_categories(category_id);
        `);

        // Insert default categories if they don't exist
        const categories = [
            { name: 'Boulangerie', icon: '🥖', color: '#FFB84D' },
            { name: 'Restaurant', icon: '🍽️', color: '#FF6B6B' },
            { name: 'Supermarket', icon: '🛒', color: '#4ECDC4' },
            { name: 'Pâtisserie', icon: '🍰', color: '#FFE66D' },
            { name: 'Fruits & Légumes', icon: '🥬', color: '#95E1D3' },
            { name: 'Boucherie', icon: '🥩', color: '#F38181' },
            { name: 'Poissonnerie', icon: '🐟', color: '#AAE3E2' },
            { name: 'Épicerie', icon: '🛍️', color: '#FFD93D' },
        ];

        const insertCategory = db.prepare(`
            INSERT OR IGNORE INTO categories (name, icon, color)
            VALUES (?, ?, ?)
        `);

        for (const category of categories) {
            insertCategory.run(category.name, category.icon, category.color);
        }
        console.log('✅ Migration v2 tables and categories ready');
    } catch (migrationError) {
        console.log('ℹ️  Migration check:', migrationError.message);
    }

    console.log('✅ Database initialized successfully');
    console.log(`📁 Database file: ${dbPath}`);

    return db;
}

/**
 * Save database (not needed for SQLite, but kept for compatibility)
 */
function saveDatabase() {
    // SQLite auto-saves, no action needed
}

module.exports = { initializeDatabase, saveDatabase };


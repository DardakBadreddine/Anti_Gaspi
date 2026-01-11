const Database = require('better-sqlite3');
const path = require('path');

/**
 * Migration script to add new features:
 * - Image URLs for baskets
 * - Categories and tags
 * - Reviews system
 */
function migrateDatabase(dbPath) {
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    console.log('🔄 Starting migration v2...');

    try {
        // Add image_url column to baskets if it doesn't exist
        try {
            db.exec('ALTER TABLE baskets ADD COLUMN image_url TEXT');
            console.log('✅ Added image_url column to baskets');
        } catch (error) {
            if (!error.message.includes('duplicate column')) {
                throw error;
            }
            console.log('ℹ️  image_url column already exists');
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
        console.log('✅ Created categories table');

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
        console.log('✅ Created basket_categories table');

        // Create reviews table
        db.exec(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                merchant_id INTEGER NOT NULL,
                reservation_id INTEGER,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
                FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
                UNIQUE(user_id, reservation_id)
            )
        `);
        console.log('✅ Created reviews table');

        // Create indexes
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_reviews_merchant ON reviews(merchant_id);
            CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
            CREATE INDEX IF NOT EXISTS idx_basket_categories_basket ON basket_categories(basket_id);
            CREATE INDEX IF NOT EXISTS idx_basket_categories_category ON basket_categories(category_id);
        `);
        console.log('✅ Created indexes');

        // Insert default categories
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
        console.log(`✅ Inserted ${categories.length} default categories`);

        // Update merchant ratings based on existing reviews
        db.exec(`
            UPDATE merchants
            SET rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews
                WHERE reviews.merchant_id = merchants.id
            )
        `);
        console.log('✅ Updated merchant ratings');

        console.log('✅ Migration v2 completed successfully!');
    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run migration if called directly
if (require.main === module) {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'antigaspi.db');
    migrateDatabase(dbPath);
}

module.exports = { migrateDatabase };

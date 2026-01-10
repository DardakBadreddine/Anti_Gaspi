const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'antigaspi.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('🔄 Running comprehensive migration for new features...\n');

try {
    // Get existing table info
    const tableInfo = db.prepare("PRAGMA table_info(baskets)").all();
    const hasImageUrl = tableInfo.some(col => col.name === 'image_url');
    const hasCategory = tableInfo.some(col => col.name === 'category');

    // 1. Add image_url column to baskets if not exists (from previous migration)
    if (!hasImageUrl) {
        console.log('📸 Adding image_url column to baskets table...');
        db.prepare('ALTER TABLE baskets ADD COLUMN image_url TEXT').run();
        console.log('✅ Added image_url column');
    } else {
        console.log('ℹ️  image_url column already exists');
    }

    // 2. Add category column to baskets
    if (!hasCategory) {
        console.log('🏷️  Adding category column to baskets table...');
        db.prepare('ALTER TABLE baskets ADD COLUMN category TEXT DEFAULT "Autre"').run();
        console.log('✅ Added category column');
    } else {
        console.log('ℹ️  category column already exists');
    }

    // 3. Create favorites table
    console.log('\n⭐ Creating favorites table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            merchant_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
            UNIQUE(user_id, merchant_id)
        )
    `);
    console.log('✅ Favorites table created');

    // 4. Create reviews table
    console.log('\n⭐ Creating reviews table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            merchant_id INTEGER NOT NULL,
            reservation_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
            FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
            UNIQUE(reservation_id)
        )
    `);
    console.log('✅ Reviews table created');

    // 5. Create indexes for performance
    console.log('\n🔍 Creating indexes...');

    db.exec('CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_favorites_merchant ON favorites(merchant_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_reviews_merchant ON reviews(merchant_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_reviews_reservation ON reviews(reservation_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_baskets_category ON baskets(category)');

    console.log('✅ All indexes created');

    // 6. Verify tables exist
    console.log('\n✅ Verifying migration...');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📋 Database tables:', tables.map(t => t.name).join(', '));

    // Check favorites table structure
    const favoritesInfo = db.prepare("PRAGMA table_info(favorites)").all();
    console.log('\n⭐ Favorites table columns:', favoritesInfo.map(c => c.name).join(', '));

    // Check reviews table structure
    const reviewsInfo = db.prepare("PRAGMA table_info(reviews)").all();
    console.log('⭐ Reviews table columns:', reviewsInfo.map(c => c.name).join(', '));

    // Check baskets table structure
    const basketsInfo = db.prepare("PRAGMA table_info(baskets)").all();
    console.log('📦 Baskets table columns:', basketsInfo.map(c => c.name).join(', '));

    console.log('\n✅ Migration completed successfully! 🎉\n');

} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}

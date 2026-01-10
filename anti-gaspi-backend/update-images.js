const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'antigaspi.db');
const db = new Database(dbPath);

console.log('🖼️  Updating basket images...\n');

try {
    // Update existing baskets with image URLs
    db.prepare(`
        UPDATE baskets 
        SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80'
        WHERE id = 1
    `).run();

    db.prepare(`
        UPDATE baskets 
        SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80'
        WHERE id = 2
    `).run();

    db.prepare(`
        UPDATE baskets 
        SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80'
        WHERE id = 3
    `).run();

    console.log('✅ Updated all baskets with images\n');

    // Verify
    const baskets = db.prepare('SELECT id, title, image_url FROM baskets').all();
    baskets.forEach(b => {
        console.log(`  ${b.id}. ${b.title}`);
        console.log(`     ${b.image_url ? '✓ Has image' : '✗ No image'}`);
    });

} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}

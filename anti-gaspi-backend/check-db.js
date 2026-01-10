const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'antigaspi.db');
const db = new Database(dbPath);

console.log('📊 Checking baskets in database...\n');

try {
    const baskets = db.prepare(`
        SELECT 
            id,
            merchant_id,
            title,
            quantity,
            datetime(expires_at) as expires_at,
            datetime('now') as now,
            CASE 
                WHEN datetime(expires_at) > datetime('now') THEN 'ACTIVE'
                ELSE 'EXPIRED'
            END as status,
            image_url
        FROM baskets
    `).all();

    if (baskets.length === 0) {
        console.log('❌ No baskets found in database!');
        console.log('\nRun this to add baskets:');
        console.log('  node database/seed.js\n');
    } else {
        console.log(`Found ${baskets.length} basket(s):\n`);
        baskets.forEach(basket => {
            const statusIcon = basket.status === 'ACTIVE' ? '✅' : '⏰';
            console.log(`${statusIcon} ID: ${basket.id}`);
            console.log(`   Title: ${basket.title}`);
            console.log(`   Quantity: ${basket.quantity}`);
            console.log(`   Expires: ${basket.expires_at}`);
            console.log(`   Status: ${basket.status}`);
            console.log(`   Image: ${basket.image_url ? '✓' : '✗'}`);
            console.log('');
        });

        const activeBaskets = baskets.filter(b => b.status === 'ACTIVE');
        console.log(`\n📈 Summary: ${activeBaskets.length} active / ${baskets.length} total`);

        if (activeBaskets.length === 0) {
            console.log('\n⚠️  All baskets have expired!');
            console.log('Run: node database/seed.js (to recreate baskets)\n');
        }
    }

    // Check users
    const users = db.prepare('SELECT id, email, role FROM users').all();
    console.log(`\n👥 Users: ${users.length}`);
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}

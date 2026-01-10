const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'antigaspi.db');
const db = new Database(dbPath);

console.log('🗺️  Checking locations...\n');

try {
    const merchants = db.prepare(`
        SELECT 
            u.id,
            u.email,
            u.latitude,
            u.longitude,
            u.address,
            m.business_name
        FROM users u
        JOIN merchants m ON u.id = m.user_id
        WHERE u.role = 'merchant'
    `).all();

    console.log('📍 Merchant Locations:');
    merchants.forEach(m => {
        console.log(`\n  ${m.business_name} (${m.email})`);
        console.log(`    Lat: ${m.latitude}`);
        console.log(`    Lng: ${m.longitude}`);
        console.log(`    Address: ${m.address || 'Not set'}`);
    });

    const customers = db.prepare(`
        SELECT id, email, latitude, longitude, address
        FROM users
        WHERE role = 'customer'
    `).all();

    console.log('\n\n👤 Customer Locations:');
    customers.forEach(c => {
        console.log(`\n  ${c.email}`);
        console.log(`    Lat: ${c.latitude}`);
        console.log(`    Lng: ${c.longitude}`);
        console.log(`    Address: ${c.address || 'Not set'}`);
    });

    console.log('\n\n💡 Note:');
    console.log('If merchant and customer have the same coordinates (48.8566, 2.3522),');
    console.log('they should see each other. If baskets are not showing, check:');
    console.log('1. Location permissions in the mobile app');
    console.log('2. API errors in the backend terminal');
    console.log('3. Network errors in the mobile terminal\n');

} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}

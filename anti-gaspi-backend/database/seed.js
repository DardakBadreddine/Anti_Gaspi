const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'antigaspi.db');
const db = new Database(dbPath, { verbose: console.log });

async function seed() {
    console.log('🌱 Seeding database...');

    // Hash password
    const password = await bcrypt.hash('password123', 10);

    // 1. Create Customer
    const customer = db.prepare('SELECT * FROM users WHERE email = ?').get('client@test.com');
    if (!customer) {
        console.log('Creating customer: client@test.com');
        db.prepare(`
            INSERT INTO users (name, email, password, role, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('Jean Dupont', 'client@test.com', password, 'customer', 48.8566, 2.3522);
    } else {
        console.log('Customer already exists');
    }

    // 2. Create Merchant
    let merchantUser = db.prepare('SELECT * FROM users WHERE email = ?').get('merchant@test.com');
    let merchantId;

    if (!merchantUser) {
        console.log('Creating merchant user: merchant@test.com');
        const info = db.prepare(`
            INSERT INTO users (name, email, password, role, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('Boulangerie Marie', 'merchant@test.com', password, 'merchant', 48.8566, 2.3522); // Paris
        merchantUser = { id: info.lastInsertRowid };
    }

    // 3. Create Merchant Profile
    const merchantProfile = db.prepare('SELECT * FROM merchants WHERE user_id = ?').get(merchantUser.id);
    if (!merchantProfile) {
        console.log('Creating merchant profile');
        const info = db.prepare(`
            INSERT INTO merchants (user_id, business_name, description, phone)
            VALUES (?, ?, ?, ?)
        `).run(merchantUser.id, 'Boulangerie Marie', 'Meilleure baguette de Paris', '0123456789');
        merchantId = info.lastInsertRowid;
    } else {
        merchantId = merchantProfile.id;
    }

    // 4. Create Baskets
    const baskets = db.prepare('SELECT count(*) as count FROM baskets WHERE merchant_id = ?').get(merchantId);
    if (baskets.count === 0) {
        console.log('Creating demo baskets...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        db.prepare(`
            INSERT INTO baskets (merchant_id, title, description, original_price, discounted_price, quantity, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(merchantId, 'Panier Surprise Matin', 'Viennoiseries de la veille', 12.00, 4.00, 5, tomorrow.toISOString());

        db.prepare(`
            INSERT INTO baskets (merchant_id, title, description, original_price, discounted_price, quantity, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(merchantId, 'Panier Pain', 'Pains divers', 8.00, 2.50, 3, tomorrow.toISOString());
    }

    console.log('✅ Seeding complete!');
    console.log('Credentials:');
    console.log('Customer: client@test.com / password123');
    console.log('Merchant: merchant@test.com / password123');
}

seed().catch(console.error);

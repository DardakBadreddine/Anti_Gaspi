const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

/**
 * Migrate data from SQLite to MySQL
 */
async function migrateData() {
    // SQLite connection
    const sqlitePath = path.join(__dirname, 'antigaspi.db');
    const sqliteDb = new Database(sqlitePath);

    // MySQL connection
    const mysqlConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'antigaspi',
        charset: 'utf8mb4'
    });

    console.log('🔄 Starting data migration from SQLite to MySQL...\n');

    try {
        // Disable foreign key checks temporarily
        await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 0');

        // Migrate users
        console.log('📦 Migrating users...');
        const users = sqliteDb.prepare('SELECT * FROM users').all();
        if (users.length > 0) {
            const insertUser = 'INSERT INTO users (id, email, password, role, name, address, latitude, longitude, phone, profile_image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            for (const user of users) {
                await mysqlConnection.execute(insertUser, [
                    user.id,
                    user.email,
                    user.password,
                    user.role,
                    user.name,
                    user.address,
                    user.latitude,
                    user.longitude,
                    user.phone || null,
                    user.profile_image_url || null,
                    user.created_at
                ]);
            }
            console.log(`✅ Migrated ${users.length} users`);
        }

        // Migrate merchants
        console.log('📦 Migrating merchants...');
        const merchants = sqliteDb.prepare('SELECT * FROM merchants').all();
        if (merchants.length > 0) {
            const insertMerchant = 'INSERT INTO merchants (id, user_id, business_name, description, phone, logo_url, cover_image_url, rating, tagline, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            for (const merchant of merchants) {
                await mysqlConnection.execute(insertMerchant, [
                    merchant.id,
                    merchant.user_id,
                    merchant.business_name,
                    merchant.description,
                    merchant.phone,
                    merchant.logo_url,
                    merchant.cover_image_url || null,
                    merchant.rating,
                    merchant.tagline,
                    merchant.created_at
                ]);
            }
            console.log(`✅ Migrated ${merchants.length} merchants`);
        }

        // Migrate categories
        console.log('📦 Migrating categories...');
        const categories = sqliteDb.prepare('SELECT * FROM categories').all();
        if (categories.length > 0) {
            const insertCategory = 'INSERT IGNORE INTO categories (id, name, icon, color, created_at) VALUES (?, ?, ?, ?, ?)';
            for (const category of categories) {
                await mysqlConnection.execute(insertCategory, [
                    category.id,
                    category.name,
                    category.icon,
                    category.color,
                    category.created_at
                ]);
            }
            console.log(`✅ Migrated ${categories.length} categories`);
        }

        // Migrate baskets
        console.log('📦 Migrating baskets...');
        const baskets = sqliteDb.prepare('SELECT * FROM baskets').all();
        if (baskets.length > 0) {
            const insertBasket = 'INSERT INTO baskets (id, merchant_id, title, description, original_price, discounted_price, quantity, visible, image_url, rating, auto_relist, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            for (const basket of baskets) {
                await mysqlConnection.execute(insertBasket, [
                    basket.id,
                    basket.merchant_id,
                    basket.title,
                    basket.description,
                    basket.original_price,
                    basket.discounted_price,
                    basket.quantity,
                    basket.visible ? 1 : 0,
                    basket.image_url,
                    basket.rating || 0,
                    basket.auto_relist ? 1 : 0,
                    basket.created_at,
                    basket.expires_at
                ]);
            }
            console.log(`✅ Migrated ${baskets.length} baskets`);
        }

        // Migrate basket_categories
        console.log('📦 Migrating basket_categories...');
        const basketCategories = sqliteDb.prepare('SELECT * FROM basket_categories').all();
        if (basketCategories.length > 0) {
            const insertBasketCategory = 'INSERT IGNORE INTO basket_categories (id, basket_id, category_id, created_at) VALUES (?, ?, ?, ?)';
            for (const bc of basketCategories) {
                await mysqlConnection.execute(insertBasketCategory, [
                    bc.id,
                    bc.basket_id,
                    bc.category_id,
                    bc.created_at
                ]);
            }
            console.log(`✅ Migrated ${basketCategories.length} basket_categories`);
        }

        // Migrate reservations
        console.log('📦 Migrating reservations...');
        const reservations = sqliteDb.prepare('SELECT * FROM reservations').all();
        if (reservations.length > 0) {
            const insertReservation = 'INSERT INTO reservations (id, user_id, basket_id, qr_code, status, reserved_at, collected_at) VALUES (?, ?, ?, ?, ?, ?, ?)';
            for (const reservation of reservations) {
                await mysqlConnection.execute(insertReservation, [
                    reservation.id,
                    reservation.user_id,
                    reservation.basket_id,
                    reservation.qr_code,
                    reservation.status,
                    reservation.reserved_at,
                    reservation.collected_at
                ]);
            }
            console.log(`✅ Migrated ${reservations.length} reservations`);
        }

        // Migrate favorites
        console.log('📦 Migrating favorites...');
        const favorites = sqliteDb.prepare('SELECT * FROM favorites').all();
        if (favorites.length > 0) {
            const insertFavorite = 'INSERT IGNORE INTO favorites (id, user_id, merchant_id, created_at) VALUES (?, ?, ?, ?)';
            for (const favorite of favorites) {
                await mysqlConnection.execute(insertFavorite, [
                    favorite.id,
                    favorite.user_id,
                    favorite.merchant_id,
                    favorite.created_at
                ]);
            }
            console.log(`✅ Migrated ${favorites.length} favorites`);
        }

        // Migrate reviews
        console.log('📦 Migrating reviews...');
        const reviews = sqliteDb.prepare('SELECT * FROM reviews').all();
        if (reviews.length > 0) {
            const insertReview = 'INSERT INTO reviews (id, user_id, merchant_id, reservation_id, rating, basket_rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            for (const review of reviews) {
                await mysqlConnection.execute(insertReview, [
                    review.id,
                    review.user_id,
                    review.merchant_id,
                    review.reservation_id,
                    review.rating,
                    review.basket_rating || null,
                    review.comment,
                    review.created_at
                ]);
            }
            console.log(`✅ Migrated ${reviews.length} reviews`);
        }

        // Migrate push_tokens
        console.log('📦 Migrating push_tokens...');
        const pushTokens = sqliteDb.prepare('SELECT * FROM push_tokens').all();
        if (pushTokens.length > 0) {
            const insertToken = 'INSERT INTO push_tokens (id, user_id, token, platform, created_at) VALUES (?, ?, ?, ?, ?)';
            for (const token of pushTokens) {
                await mysqlConnection.execute(insertToken, [
                    token.id,
                    token.user_id,
                    token.token,
                    token.platform,
                    token.created_at
                ]);
            }
            console.log(`✅ Migrated ${pushTokens.length} push_tokens`);
        }

        // Re-enable foreign key checks
        await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        sqliteDb.close();
        await mysqlConnection.end();
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateData()
        .then(() => {
            console.log('🎉 All done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateData };

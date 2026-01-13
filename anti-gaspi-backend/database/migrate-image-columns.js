const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateImageColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'antigaspi',
    });

    try {
        console.log('🔄 Migrating image columns to LONGTEXT...');

        // Migrate baskets.image_url
        try {
            await connection.execute('ALTER TABLE baskets MODIFY COLUMN image_url LONGTEXT');
            console.log('✅ Migrated baskets.image_url to LONGTEXT');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('ℹ️  baskets.image_url:', error.message);
            }
        }

        // Migrate merchants.logo_url
        try {
            await connection.execute('ALTER TABLE merchants MODIFY COLUMN logo_url LONGTEXT');
            console.log('✅ Migrated merchants.logo_url to LONGTEXT');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('ℹ️  merchants.logo_url:', error.message);
            }
        }

        // Migrate merchants.cover_image_url
        try {
            await connection.execute('ALTER TABLE merchants MODIFY COLUMN cover_image_url LONGTEXT');
            console.log('✅ Migrated merchants.cover_image_url to LONGTEXT');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('ℹ️  merchants.cover_image_url:', error.message);
            }
        }

        // Migrate users.profile_image_url
        try {
            await connection.execute('ALTER TABLE users MODIFY COLUMN profile_image_url LONGTEXT');
            console.log('✅ Migrated users.profile_image_url to LONGTEXT');
        } catch (error) {
            if (!error.message.includes('Duplicate column name')) {
                console.log('ℹ️  users.profile_image_url:', error.message);
            }
        }

        console.log('✅ Image columns migration completed!');
    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateImageColumns()
        .then(() => {
            console.log('🎉 Migration completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateImageColumns };

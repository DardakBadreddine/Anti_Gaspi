const fs = require('fs');
const path = require('path');

// Simple in-memory database simulation
class SimpleDB {
    constructor() {
        this.data = {
            users: [],
            merchants: [],
            baskets: [],
            reservations: []
        };
        this.autoIncrement = {
            users: 1,
            merchants: 1,
            baskets: 1,
            reservations: 1
        };
    }

    prepare(sql) {
        return {
            run: (...params) => {
                if (sql.includes('INSERT INTO users')) {
                    const id = this.autoIncrement.users++;
                    this.data.users.push({ id, ...this.parseInsertParams('users', sql, params) });
                    return { lastInsertRowid: id };
                } else if (sql.includes('INSERT INTO merchants')) {
                    const id = this.autoIncrement.merchants++;
                    this.data.merchants.push({ id, ...this.parseInsertParams('merchants', sql, params) });
                    return { lastInsertRowid: id };
                } else if (sql.includes('INSERT INTO baskets')) {
                    const id = this.autoIncrement.baskets++;
                    this.data.baskets.push({ id, ...this.parseInsertParams('baskets', sql, params) });
                    return { lastInsertRowid: id };
                } else if (sql.includes('INSERT INTO reservations')) {
                    const id = this.autoIncrement.reservations++;
                    this.data.reservations.push({ id, ...this.parseInsertParams('reservations', sql, params) });
                    return { lastInsertRowid: id };
                } else if (sql.includes('UPDATE reservations')) {
                    const reservation = this.data.reservations.find(r => r.id === params[params.length - 1]);
                    if (reservation) {
                        reservation.status = 'collected';
                        reservation.collected_at = params[0];
                    }
                    return { changes: 1 };
                } else if (sql.includes('DELETE FROM baskets')) {
                    const lengthBefore = this.data.baskets.length;
                    if (sql.includes('datetime')) {
                        // Delete expired
                        const now = new Date().toISOString();
                        this.data.baskets = this.data.baskets.filter(b => b.expires_at > now);
                    } else {
                        // Delete specific
                        this.data.baskets = this.data.baskets.filter(b => b.id !== params[0]);
                    }
                    return { changes: lengthBefore - this.data.baskets.length };
                }
                return {};
            },
            get: (...params) => {
                if (sql.includes('SELECT * FROM users WHERE email')) {
                    return this.data.users.find(u => u.email === params[0]);
                } else if (sql.includes('SELECT id FROM users WHERE email')) {
                    const user = this.data.users.find(u => u.email === params[0]);
                    return user ? { id: user.id } : null;
                } else if (sql.includes('SELECT id FROM merchants WHERE user_id')) {
                    return this.data.merchants.find(m => m.user_id === params[0]);
                } else if (sql.includes('SELECT * FROM baskets WHERE id')) {
                    const basket = this.data.baskets.find(b => b.id === params[params.length - 1]);
                    if (!basket) return null;

                    const merchant = this.data.merchants.find(m => m.id === basket.merchant_id);
                    const user = merchant ? this.data.users.find(u => u.id === merchant.user_id) : null;

                    return {
                        ...basket,
                        business_name: merchant?.business_name,
                        merchant_description: merchant?.description,
                        phone: merchant?.phone,
                        latitude: user?.latitude,
                        longitude: user?.longitude,
                        address: user?.address,
                        available_quantity: basket.quantity - this.data.reservations.filter(r => r.basket_id === basket.id && r.status === 'pending').length
                    };
                } else if (sql.includes('FROM reservations r') && sql.includes('WHERE r.qr_code')) {
                    const reservation = this.data.reservations.find(r => r.qr_code === params[0]);
                    if (!reservation) return null;

                    const basket = this.data.baskets.find(b => b.id === reservation.basket_id);
                    return { ...reservation, merchant_id: basket?.merchant_id };
                }
                return null;
            },
            all: (...params) => {
                if (sql.includes('FROM baskets b') && sql.includes('JOIN merchants')) {
                    const now = new Date().toISOString();
                    return this.data.baskets
                        .filter(b => b.expires_at > now && b.quantity > 0)
                        .map(basket => {
                            const merchant = this.data.merchants.find(m => m.id === basket.merchant_id);
                            const user = merchant ? this.data.users.find(u => u.id === merchant.user_id) : null;
                            const pendingCount = this.data.reservations.filter(r => r.basket_id === basket.id && r.status === 'pending').length;

                            return {
                                ...basket,
                                business_name: merchant?.business_name,
                                latitude: user?.latitude,
                                longitude: user?.longitude,
                                address: user?.address,
                                available_quantity: basket.quantity - pendingCount
                            };
                        });
                } else if (sql.includes('FROM reservations r') && sql.includes('WHERE r.user_id')) {
                    return this.data.reservations
                        .filter(r => r.user_id === params[0])
                        .map(reservation => {
                            const basket = this.data.baskets.find(b => b.id === reservation.basket_id);
                            const merchant = basket ? this.data.merchants.find(m => m.id === basket.merchant_id) : null;
                            const user = merchant ? this.data.users.find(u => u.id === merchant.user_id) : null;

                            return {
                                ...reservation,
                                ...basket,
                                business_name: merchant?.business_name,
                                address: user?.address,
                                latitude: user?.latitude,
                                longitude: user?.longitude
                            };
                        });
                } else if (sql.includes('FROM reservations r') && sql.includes('b.merchant_id')) {
                    return this.data.reservations
                        .map(reservation => {
                            const basket = this.data.baskets.find(b => b.id === reservation.basket_id);
                            if (basket && basket.merchant_id === params[0]) {
                                const user = this.data.users.find(u => u.id === reservation.user_id);
                                return {
                                    ...reservation,
                                    title: basket.title,
                                    description: basket.description,
                                    discounted_price: basket.discounted_price,
                                    customer_name: user?.name,
                                    customer_email: user?.email
                                };
                            }
                            return null;
                        })
                        .filter(Boolean);
                }
                return [];
            }
        };
    }

    parseInsertParams(table, sql, params) {
        const result = {};
        if (table === 'users') {
            [result.email, result.password, result.role, result.name, result.address, result.latitude, result.longitude] = params;
            result.created_at = new Date().toISOString();
        } else if (table === 'merchants') {
            [result.user_id, result.business_name, result.description, result.phone] = params;
            result.created_at = new Date().toISOString();
        } else if (table === 'baskets') {
            [result.merchant_id, result.title, result.description, result.original_price, result.discounted_price, result.quantity, result.expires_at] = params;
            result.created_at = new Date().toISOString();
        } else if (table === 'reservations') {
            [result.user_id, result.basket_id, result.qr_code] = params;
            result.status = 'pending';
            result.reserved_at = new Date().toISOString();
        }
        return result;
    }

    exec() {
        // Schema initialization - do nothing since we're in-memory
        console.log('Schema loaded (in-memory)');
    }
}

function initializeDatabase(dbPath) {
    const db = new SimpleDB();

    console.log('✅ Database initialized successfully (in-memory mode)');

    return db;
}

function saveDatabase() {
    // No-op for in-memory
}

module.exports = { initializeDatabase, saveDatabase };

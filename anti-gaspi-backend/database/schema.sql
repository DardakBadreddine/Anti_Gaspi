-- Anti-Gaspi Database Schema

-- Users table (both customers and merchants)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('customer', 'merchant')),
  name TEXT NOT NULL,
  address TEXT,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Merchants table (additional info for merchant users)
CREATE TABLE IF NOT EXISTS merchants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  business_name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Baskets table (available food baskets)
CREATE TABLE IF NOT EXISTS baskets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  original_price REAL NOT NULL,
  discounted_price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  basket_id INTEGER NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'collected', 'cancelled')),
  reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  collected_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (basket_id) REFERENCES baskets(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_baskets_expires ON baskets(expires_at);
CREATE INDEX IF NOT EXISTS idx_baskets_merchant ON baskets(merchant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_basket ON reservations(basket_id);
CREATE INDEX IF NOT EXISTS idx_reservations_qr ON reservations(qr_code);

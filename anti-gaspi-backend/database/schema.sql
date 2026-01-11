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
  logo_url TEXT,
  rating REAL DEFAULT 0,
  tagline TEXT,
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
  visible BOOLEAN DEFAULT 1,
  image_url TEXT,
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

-- Favorites table (shop/merchant favorites)
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  merchant_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  UNIQUE(user_id, merchant_id)
);

-- Push notification tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  platform TEXT CHECK(platform IN ('android', 'ios')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table (basket categories)
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Basket categories (many-to-many relationship)
CREATE TABLE IF NOT EXISTS basket_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  basket_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (basket_id) REFERENCES baskets(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(basket_id, category_id)
);

-- Reviews table (customer reviews for merchants)
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
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_baskets_expires ON baskets(expires_at);
CREATE INDEX IF NOT EXISTS idx_baskets_merchant ON baskets(merchant_id);
CREATE INDEX IF NOT EXISTS idx_baskets_visible ON baskets(visible);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_basket ON reservations(basket_id);
CREATE INDEX IF NOT EXISTS idx_reservations_qr ON reservations(qr_code);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_merchant ON favorites(merchant_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_merchant ON reviews(merchant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_basket_categories_basket ON basket_categories(basket_id);
CREATE INDEX IF NOT EXISTS idx_basket_categories_category ON basket_categories(category_id);
// config/db.js (Updated with Order Tables)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../blueshelf.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database:', err.message);
    else console.log('✅ Connected to SQLite database');
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'student'
    )`);

    // 2. Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        category TEXT,
        price REAL,
        stock_quantity INTEGER,
        image_url TEXT
    )`);

    // 3. Orders Table (New!)
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT, 
        total_amount REAL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 4. Order Items Table (New!)
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_name TEXT,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY(order_id) REFERENCES orders(id)
    )`);

    // Seed Data (Only if empty)
    db.get("SELECT count(*) as count FROM products", (err, row) => {
        if (row.count === 0) {
            console.log("⚡ Seeding database...");
            const stmt = db.prepare("INSERT INTO products (name, category, price, stock_quantity) VALUES (?, ?, ?, ?)");
            stmt.run('Blue Ballpen', 'Stationery', 20.00, 300);
            stmt.run('School Pencil', 'Stationery', 10.00, 200);
            stmt.run('Correction Tape', 'Stationery', 60.00, 25);
            stmt.run('PE Uniform (M)', 'Uniform', 450.00, 50);
            stmt.finalize();
        }
    });
});

const dbAsync = {
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve([rows]); 
                });
            } else {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve([{ insertId: this.lastID, changes: this.changes }]);
                });
            }
        });
    }
};

module.exports = dbAsync;
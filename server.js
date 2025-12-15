// server.js - The Brain of The Blue Shelf

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// 1. Initialize App
const app = express();
const PORT = 3000;

// 2. Import Database (This triggers the "Connected" message)
const db = require('./config/db');

// 3. Middleware (Tools to read data)
// This allows us to read JSON data sent from the frontend forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 4. Serve Static Files (The Frontend)
// This tells the server: "Look in the 'public' folder for HTML/CSS/JS files"
app.use(express.static(path.join(__dirname, 'public')));

// =============================================================
// 5. API ROUTES (The Traffic Control)
// =============================================================

// Route for Products (Catalog)
// Checks file: routes/productRoutes.js
try {
    app.use('/api/products', require('./routes/productRoutes'));
} catch (error) {
    console.error("❌ Error loading Product Routes:", error.message);
}

// Route for Authentication (Login/Register) <--- THIS WAS MISSING
// Checks file: routes/authRoutes.js
try {
    app.use('/api/auth', require('./routes/authRoutes'));
} catch (error) {
    console.error("❌ Error loading Auth Routes. Check if 'routes/authRoutes.js' exists!", error.message);
}

// Route for Orders (Checkout/Admin)
// Checks file: routes/orderRoutes.js
try {
    app.use('/api/orders', require('./routes/orderRoutes'));
} catch (error) {
    console.error("❌ Error loading Order Routes:", error.message);
}

// =============================================================

// 6. Start the Server
app.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`🚀 The Blue Shelf is online!`);
    console.log(`📂 Frontend: http://localhost:${PORT}`);
    console.log(`-----------------------------------------------`);
});
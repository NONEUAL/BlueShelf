const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

const db = require('./config/db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

try {
    app.use('/api/products', require('./routes/productRoutes'));
} catch (error) {
    console.error("❌ Error loading Product Routes:", error.message);
}

try {
    app.use('/api/auth', require('./routes/authRoutes'));
} catch (error) {
    console.error("❌ Error loading Auth Routes:", error.message);
}

try {
    app.use('/api/orders', require('./routes/orderRoutes'));
} catch (error) {
    console.error("❌ Error loading Order Routes:", error.message);
}

app.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`🚀 The Blue Shelf is online!`);
    console.log(`📂 Frontend: http://localhost:${PORT}`);
    console.log(`-----------------------------------------------`);
});
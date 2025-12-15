const express = require('express');
const db = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware (Tools the server uses)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve Static Files (Tell the server where the HTML/CSS is)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// A Test Route (To check if it works)
app.get('/test', (req, res) => {
    res.send('The Blue Shelf Server is Running!');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`---------------------------------------`);
    console.log(`The Blue Shelf is running!`);
    console.log(`Open your browser at: http://localhost:${PORT}`);
    console.log(`---------------------------------------`);
});
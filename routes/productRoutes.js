 // routes/productRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/products
// @desc    Get all products from the database
router.get('/', async (req, res) => {
    try {
        // Query the database
        const [rows] = await db.query('SELECT * FROM products');
        
        // Send the data back to the frontend as JSON
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
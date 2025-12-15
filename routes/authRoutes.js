// routes/authRoutes.js - COMPLETE VERSION
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ensure this points to your SQLite config
const bcrypt = require('bcryptjs');

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    // Gatekeeper Check
    if (!email.endsWith('@sma.edu.ph')) {
        return res.status(403).json({ success: false, message: 'ACCESS DENIED: Use @sma.edu.ph email.' });
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, 'student']
        );

        res.status(201).json({ success: true, message: 'Account created successfully!' });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// 2. LOGIN ROUTE (This is the part that was likely missing or broken)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (!users || users.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Login Success
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

module.exports = router;
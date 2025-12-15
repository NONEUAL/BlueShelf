// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @route   POST /api/auth/register
// @desc    Register a new student (Gatekeeper Logic)
router.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    // 1. GATEKEEPER CHECK: Is it an SMA email?
    if (!email.endsWith('@sma.edu.ph')) {
        return res.status(403).json({ 
            success: false, 
            message: 'ACCESS DENIED: You must use a valid @sma.edu.ph email address.' 
        });
    }

    try {
        // 2. CHECK DUPLICATES: Does this user already exist?
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        // 3. SECURITY: Hash the password (Scramble it)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. SAVE TO DATABASE
        await db.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, 'student']
        );

        res.status(201).json({ success: true, message: 'Account created successfully! Please login.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
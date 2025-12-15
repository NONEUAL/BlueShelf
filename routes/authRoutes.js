// routes/authRoutes.js (FIXED)
const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const bcrypt = require('bcryptjs');

// 1. REGISTER
router.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!email.endsWith('@sma.edu.ph')) {
        return res.status(403).json({ success: false, message: 'Access Denied: Use SMA Email.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Note: We don't insert created_at, SQLite handles timestamps differently or we omit it
        await db.query('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)', 
            [full_name, email, hashedPassword, 'student']);
        
        res.status(201).json({ success: true, message: 'User registered.' });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(400).json({ success: false, message: 'Email already exists.' });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        res.json({ 
            success: true, 
            user: { id: user.id, name: user.full_name, email: user.email, role: user.role } 
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 3. GET ALL USERS (FIXED: Removed 'created_at')
router.get('/all', async (req, res) => {
    try {
        // We only select columns that definitely exist
        const [users] = await db.query('SELECT id, full_name, email, role FROM users');
        res.json(users);
    } catch (error) {
        console.error("Fetch Users Error:", error); // Check your terminal if this prints!
        res.status(500).json({ message: 'Server Error fetching users' });
    }
});

// 4. DELETE USER
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted.' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: 'Delete failed.' });
    }
});

module.exports = router;
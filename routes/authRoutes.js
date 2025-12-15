// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const bcrypt = require('bcryptjs');

// 1. REGISTER
router.post('/register', async (req, res) => {
    const { email, password, grade_level, strand } = req.body;

    if (!email.endsWith('@sma.edu.ph')) {
        return res.status(403).json({ success: false, message: 'Access Denied: Use SMA Email.' });
    }

    try {
        // Auto-Generate Name: justin.mendoza -> Justin Mendoza
        let namePart = email.split('@')[0];
        const generatedName = namePart.split('.').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query(
            'INSERT INTO users (full_name, email, password, role, grade_level, strand) VALUES (?, ?, ?, ?, ?, ?)', 
            [generatedName, email, hashedPassword, 'student', grade_level, strand]
        );
        
        res.status(201).json({ success: true, message: 'User registered.' });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(400).json({ success: false, message: 'Email already exists.' });
    }
});

// 2. LOGIN (UPDATED: Now sends 'strand' and 'grade_level')
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
            user: { 
                id: user.id, 
                name: user.full_name, 
                email: user.email, 
                role: user.role,
                grade: user.grade_level, // Send Grade
                strand: user.strand      // Send Strand <--- NEW
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 3. UPDATE PROFILE NAME
router.put('/update-profile', async (req, res) => {
    const { email, newName } = req.body;
    try {
        await db.query('UPDATE users SET full_name = ? WHERE email = ?', [newName, email]);
        res.json({ success: true, message: 'Name updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed.' });
    }
});

// 4. ADMIN ROUTES
router.get('/all', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, full_name, email, role, grade_level, strand FROM users');
        res.json(users);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted.' });
    } catch (error) { res.status(500).json({ success: false }); }
});

module.exports = router;
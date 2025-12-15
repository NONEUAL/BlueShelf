const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   POST /api/orders
// @desc    Place an order and deduct stock
router.post('/', async (req, res) => {
    const { user_email, cartItems } = req.body; // cartItems = [{id: 1, quantity: 2}, ...]

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    try {
        let totalAmount = 0;
        const finalItems = [];

        // 1. Calculate Total & Check Stock
        for (const item of cartItems) {
            // Get product from DB to check real price and stock
            const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [item.id]);
            const product = rows[0];

            if (!product) continue;
            
            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Not enough stock for ${product.name}. Only ${product.stock_quantity} left.` 
                });
            }

            totalAmount += product.price * item.quantity;
            finalItems.push({ 
                id: product.id, 
                name: product.name, 
                price: product.price, 
                qty: item.quantity 
            });
        }

        // 2. Create Order Record
        const [orderResult] = await db.query(
            'INSERT INTO orders (user_email, total_amount) VALUES (?, ?)',
            [user_email, totalAmount]
        );
        const orderId = orderResult.insertId;

        // 3. Save Items & Deduct Stock
        for (const item of finalItems) {
            // Save item to order history
            await db.query(
                'INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.name, item.qty, item.price]
            );

            // DEDUCT STOCK
            await db.query(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.qty, item.id]
            );
        }

        res.json({ success: true, message: 'Order placed successfully!', orderId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error processing order.' });
    }
});

router.get('/all', async (req, res) => {
    try {
        // We join tables to get the user's name along with the order
        const sql = `
            SELECT orders.id, orders.user_email, orders.total_amount, orders.status, orders.created_at 
            FROM orders 
            ORDER BY orders.created_at DESC
        `;
        const [orders] = await db.query(sql);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/orders/:id
// @desc    (Admin) Update order status (Pending -> Ready -> Completed)
router.put('/:id', async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body; // e.g., "ready_for_pickup"

    try {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        res.json({ success: true, message: `Order #${orderId} updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

router.post('/my-orders', async (req, res) => {
    const { email } = req.body;

    try {
        const sql = `
            SELECT * FROM orders 
            WHERE user_email = ? 
            ORDER BY created_at DESC
        `;
        const [orders] = await db.query(sql, [email]);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;
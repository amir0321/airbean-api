import express from 'express';
import { createOrder } from '../controllers/ordersController.js';
import { validateOrder } from '../middleware/orderValidation.js';

const router = express.Router();

router.post('/', validateOrder, (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if (userId) {
        req.body.userId = userId;
    }

    next();
}, createOrder);

// Leveransstatus
router.get('/status/:orderId', async (req, res) => {
    const db = req.app.get('db');
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({ error: 'orderId saknas' });
    }

    try {
        const order = await db.get(
            `SELECT order_nr, eta, order_time 
             FROM orders 
             WHERE order_nr = ?`,
            [orderId]
        );

        if (!order) {
            return res.status(404).json({ message: 'Order hittades inte' });
        }

        const createdAt = new Date(order.order_time);
        const now = new Date();
        const minutesPassed = Math.floor((now - createdAt) / 60000);
        const remainingEta = Math.max(order.eta - minutesPassed, 0);

        let status = 'brygger';
        if (remainingEta <= 10 && remainingEta > 0) status = 'Drönare på väg';
        if (remainingEta === 0) status = 'Levererad';

        res.json({
            orderId: order.order_nr,
            eta: remainingEta,
            status
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Misslyckades att hämta leveransinfo' });
    }
});

// Hämta en specifik order med detaljer
router.get('/details/:orderId', async (req, res) => {
    const db = req.app.get('db');
    const { orderId } = req.params;

    try {
        const orderHeader = await db.get(
            `SELECT order_nr, user_id, total_price, eta, order_time
             FROM orders
             WHERE order_nr = ?`,
            [orderId]
        );

        if (!orderHeader) {
            return res.status(404).json({ message: 'Ordern hittades inte' });
        }

        const orderItems = await db.all(
            `SELECT od.quantity, m.title, m.price as item_price
             FROM order_details od
             JOIN menu m ON od.product_id = m.id
             WHERE od.order_nr = ?`,
            [orderId]
        );

        const createdAt = new Date(orderHeader.order_time);
        const now = new Date();
        const minutesPassed = Math.floor((now - createdAt) / 60000);
        const remainingEta = Math.max(orderHeader.eta - minutesPassed, 0);

        let status = 'brygger';
        if (remainingEta <= 10 && remainingEta > 0) status = 'Drönare på väg';
        if (remainingEta === 0) status = 'Levererad';

        res.json({
            orderNr: orderHeader.order_nr,
            userId: orderHeader.user_id || 'Gäst',
            totalPrice: orderHeader.total_price,
            orderTime: orderHeader.order_time,
            remainingEta,
            status,
            items: orderItems.map(item => ({
                title: item.title,
                quantity: item.quantity,
                price: item.item_price
            }))
        });

    } catch (error) {
        console.error('Failed to get order details:', error);
        res.status(500).json({ error: 'Misslyckades att hämta orderdetaljer' });
    }
});


// hämta orderhistorik för en specifik användare
router.get('/:userId', async (req, res) => {
    const db = req.app.get('db');
    const { userId } = req.params;

    try {
        const rows = await db.all(
            `SELECT o.order_nr, o.total_price, o.eta, o.order_time, od.quantity, m.title, m.price as item_price
             FROM orders o
                JOIN order_details od ON o.order_nr = od.order_nr
                JOIN menu m ON od.product_id = m.id
             WHERE o.user_id = ? 
             ORDER BY o.order_time DESC`,
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Ingen orderhistorik för användaren' });
        }

        const ordersMap = new Map();
        const now = new Date();

        rows.forEach((row) => {
            if (!ordersMap.has(row.order_nr)) {
                const createdAt = new Date(row.order_time);
                const minutesPassed = Math.floor((now - createdAt) / 60000);
                const remainingEta = Math.max(row.eta - minutesPassed, 0);

                let status = 'brygger';
                if (remainingEta <= 10 && remainingEta > 0) status = 'Drönare på väg';
                if (remainingEta === 0) status = 'Levererad';

                ordersMap.set(row.order_nr, {
                    orderNr: row.order_nr,
                    totalPrice: row.total_price,
                    orderTime: row.order_time,
                    remainingEta,
                    status,
                    items: []
                });
            }
            ordersMap.get(row.order_nr).items.push({
                title: row.title,
                quantity: row.quantity,
                price: row.item_price
            });
        })

        const orders = Array.from(ordersMap.values());

        res.json({
            userId,
            totalOrders: orders.length,
            orders
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Misslyckades att hämta historik' });
    }
});


export default router;
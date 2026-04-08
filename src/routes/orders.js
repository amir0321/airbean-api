import express from 'express';
import { createOrder } from '../controllers/ordersController.js';
import { validateOrder } from '../middleware/orderValidation.js';

const router = express.Router();

// skapa order

      /*För att inte ändra om i ordersController behövde jag
       mappa headern till body då id't efterfrågas därifrån i ordersContrller.
       Här skickas det via req.headers */ 
router.post('/', validateOrder, (req, res, next) => {
    const userId = req.headers['x-user-id'];

     

    if (!userId) {
        return res.status(400).json({ error: 'x-user-id saknas' });
    }

    req.body.userId = userId; 

    next();
}, createOrder);



// hämta orderhistorik
router.get('/', async (req, res) => {
    const db = req.app.get('db');
    const userId = req.headers['x-user-id']; // läs från header

    if (!userId) {
        return res.status(400).json({ error: 'x-user-id saknas' });
    }

    try {
        const orders = await db.all(
            `SELECT order_nr, total_price, eta, order_time 
             FROM orders 
             WHERE user_id = ? 
             ORDER BY order_time DESC`,
            [userId]
        );

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'Ingen orderhistorik för användaren' });
        }

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

// Leveransstatus
router.get('/:orderId/eta', async (req, res) => {
    const db = req.app.get('db');
    const { orderId } = req.params;
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(400).json({ error: 'x-user-id saknas' });
    }
    if (!orderId) {
        return res.status(400).json({ error: 'orderId saknas' });
    }

    try {
        const order = await db.get(
            `SELECT order_nr, eta, order_time 
             FROM orders 
             WHERE order_nr = ? AND user_id = ?`,
            [orderId, userId]
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

export default router;
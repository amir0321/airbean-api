import express from 'express';
import { createOrder } from '../controllers/ordersController.js';
import { validateOrder } from '../middleware/orderValidation.js';

const router = express.Router();

/*
router.get('/test', (req, res) => {
    res.send('Testing testing');
});
*/

router.post('/', validateOrder, createOrder);


//GET översikt orderhistorik
router.get('/:userId', async (req, res) => {

    const db = req.app.get('db');
    const { userId } = req.params;

    try {
        const orders = await db.all(
            `SELECT order_nr, total_price, eta, order_time 
             FROM orders 
             WHERE user_id = ? 
             ORDER BY order_time DESC`,
        [userId]
        );

        if (!orders || orders.length === 0) {
            return res.status(404).json({message: 'Ingen orderhistorik för användaren'});
        }

        res.json({userId, 
            totalOrders: orders.length, 
            orders});
        
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Misslyckades att hämta orderhistorik'});
    }
});





export default router;
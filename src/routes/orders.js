import express from 'express';
import { createOrder } from '../controllers/ordersController.js';
import { validateOrder } from '../middleware/orderValidation.js';

const router = express.Router();

router.post('/', validateOrder, createOrder);

export default router;
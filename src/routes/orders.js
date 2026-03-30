import express from 'express';
import { createOrder } from '../controllers/ordersController.js';
//import { validateOrder } from '../middleware/orderValidation.js';

const router = express.Router();

router.post('/', createOrder); //validateOrder middleware kan läggas till här när den är implementerad

export default router;
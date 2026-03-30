const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/ordersController');
const { validateOrder } = require('../middleware/orderValidation');

router.post('/', validateOrder, createOrder);

module.exports = router;
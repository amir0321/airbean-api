import { v4 as uuidv4 } from 'uuid';
import { calculateTotal } from '../services/discountService.js';

export async function createOrder(req, res) {
  try {
    const db = req.app.get('db');
    const { userId, items } = req.body;

    const resolvedUserId = userId || null;

    const cart = [];
    for (const item of items) {
      const product = await db.get('SELECT id, price FROM menu WHERE id = ?', item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with id ${item.productId} not found.` });
      }
      cart.push({
        productId: item.productId,
        qty: item.quantity,
        unitPrice: product.price
      });
    }

    const { total, baseTotal, discountTotal, applied } = calculateTotal(cart);

    const orderNr = uuidv4();
    const eta = 20;

    await db.run(
        'INSERT INTO orders (order_nr, user_id, total_price, eta) VALUES (?, ?, ?, ?)',
        [orderNr, resolvedUserId, total, eta]
    );

    for (const item of items) {
      await db.run(
          'INSERT INTO order_details (order_nr, product_id, quantity) VALUES (?, ?, ?)',
          [orderNr, item.productId, item.quantity]
      );
    }

    res.status(201).json({
      message: 'Beställning lagd',
      orderNr,
      baseTotal,
      discountTotal,
      totalPrice: total,
      appliedDiscounts: applied,
      eta: `${eta} min`,
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to process the order.' });
  }
}

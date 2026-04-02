import { v4 as uuidv4 } from 'uuid';
import { calculateTotal } from '../services/discountService.js';

export async function createOrder(req, res) {
  const db = req.app.get('db');
  const { userId, items } = req.body;

  const resolvedUserId = userId || null;

  // Bygg en "cart" som calculateTotal kan använda
  const cart = [];
  for (const item of items){
    const product = await db.get('SELECT id, price FROM menu WHERE id = ?', item.productId);
    cart.push({
      sku: product.id,
      qty: item.quantity,
      unitPirce: product.price
    });
  }

  // Beräkna totalsumma och tillämpliga rabatter
  const { total, baseTotal, discountTotal, applied } = calculateTotal(cart);

  // Generera unikt ordernummer och beräkna ETA
  const orderNr = uuidv4();
  const eta = 20;

  // Spara ordern
  await db.run(
    'INSERT INTO orders (order_nr, user_id, total_price, eta) VALUES (?, ?, ?, ?)',
    orderNr, resolvedUserId, total, eta
  );

  // Spara orderraderna
  for (const item of items) {
    await db.run(
      'INSERT INTO order_details (order_nr, product_id, quantity) VALUES (?, ?, ?)',
      orderNr, item.productId, item.quantity
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
}
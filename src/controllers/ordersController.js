import { v4 as uuidv4 } from 'uuid';

export async function createOrder(req, res) {
  const db = req.app.get('db');
  const { userId, items } = req.body;

  const resolvedUserId = userId || null;

  // Beräkna totalpris på servern
  let totalPrice = 0;
  for (const item of items) {
    const product = await db.get(
      'SELECT price FROM menu WHERE id = ?',
      item.productId
    );
    totalPrice += product.price * item.quantity;
  }

  // Generera unikt ordernummer och beräkna ETA

  const orderNr = uuidv4();
  const eta = 20;

  // Spara ordern
  await db.run(
    'INSERT INTO orders (order_nr, user_id, total_price, eta) VALUES (?, ?, ?, ?)',
    orderNr, resolvedUserId, totalPrice, eta
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
    totalPrice,
    eta: `${eta} min`,
  });
}
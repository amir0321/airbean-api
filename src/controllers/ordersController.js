import { v4 as uuidv4 } from 'uuid';

export async function createOrder(req, res) {
  const db = req.app.get('db');
  const { userId, items } = req.body;

  const resolvedUserId = userId || null;

  // Beräkna totalpris på servern
  let totalPrice = 0;
  for (const item of items) {
    console.log('Letar efter productId:', item.productId);
    const product = await db.get(
      'SELECT price FROM menu WHERE id = ?',
      item.productId
    );
     console.log('Hittade produkt:', product);
    totalPrice += product.price * item.quantity;
  }

  const orderNr = uuidv4();
  

console.log('totalPrice:', totalPrice);
console.log('orderNr:', orderNr);
  await db.run(
    'INSERT INTO orders (order_nr, user_id, total_price) VALUES (?, ?, ?)',
    orderNr, resolvedUserId, totalPrice
  );

  for (const item of items) {
    await db.run(
      'INSERT INTO order_details (order_nr, product_id) VALUES (?, ?)',
      orderNr, item.productId
    );
  }

  res.status(201).json({
    message: 'Beställning lagd',
    orderNr,
    totalPrice,
    
  });
}
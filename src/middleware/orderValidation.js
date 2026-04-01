export async function validateOrder(req, res, next) {
  const db = req.app.get('db');
  const { items } = req.body;

  // Kontrollera att items finns och inte är tom
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items måste vara en icke-tom array' });
  }

  // Kontrollera varje produkt
  for (const item of items) {
    if (!item.productId) {
      return res.status(400).json({ error: 'Varje item måste ha ett productId' });
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({ error: 'quantity måste vara ett positivt heltal' });
    }

    // Kontrollera att produkten finns i menyn
    const product = await db.get('SELECT id FROM menu WHERE id = ?', item.productId);
    if (!product) {
      return res.status(400).json({ error: `Produkt med id ${item.productId} finns inte i menyn` });
    }
  }

  next();
}
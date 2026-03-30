const db  = require('..db/database');
const { v4: uuidv4} = require('uuid');

function createOrder(req, res){
    const {userId, items, campaignId } = req.body;

    // userId är valfritt, null om man är gäst
    const resolvedUserId = userId || null;

    // Beräknar totalpris på servern
    let totalPrice = 0;
    for(const item of items) {
        const product = db.prepare('SELECT price FROM menu_items WHERE product_id = ? ').get(item.productId);
        totalPrice += product.price * item.quantity;
    }



    // Lägg till  kampanjrabatt
    if(campaignId){

    }

    const orderId = uuidv4();
    const insertOrder = db.prepare('INSERT INTO orders (order_id, user_id, total_price, campaign_id) VALUES (?, ?, ?, ?)');
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)');


    const createOrderTransaction = db.transaction(() => {
        insertOrder.RUN(orderId, userId, totalPrice, campaignId || NULL)

        for(const item of items){
            const product = db.prepare('SELECT price FROM menu_items WHERE product_id = ?').get(item.productId);
            insertItem.run(orderId, item.productId, item.quantity, product.price); 
        }
    });

    createOrderTransaction();

    res.status(201).json({
        message: 'Beställning lagd',
        orderId,
        totalPrice,
        guest: !resolvedUserId
        // lägg till estimerad delivery här 
    });
}


function getOrderHistory(req, res){
    const {userId} = req.params;

    const orders = db.prepare(`
    SELECT o.order_id, o.created_at, o.total_price, o.status
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(userId);

  if(orders.length === 0){
    return res.status(404).json({ message: 'Ingen beställningshistorik hittades för användaren.'})
  }

  const getItems = db.prepare(`
    SELECT m.title, oi.quantity, oi.unit_price
    FROM order_items oi
    JOIN menu_items m ON oi.product_id = m.product_id
    WHERE oi.order_id = ?
  `);
}

const db  = require('..db/database');
const { v4: uuidv4} = require('uuid');

function createOrder(req, res){
    const {userId, items, campaignId } = req.body;

    // userId är valfritt, null om man är gäst
    const resolvedUserId = userId || null;

    // Beräknar totalpris på servern
    let totalPrice = 0;
 for (const item of items) {
    const product = db
      .prepare('SELECT price FROM menu_items WHERE product_id = ?')
      .get(item.productId);
    totalPrice += product.price * item.quantity;
  }



    // Lägg till  kampanjrabatt
    if(campaignId){

    }

    // Genererar unikt orderId
    const orderId = uuidv4();


    // Förbereder SQL statements
    const insertOrder = db.prepare('INSERT INTO orders (order_id, user_id, total_price, campaign_id) VALUES (?, ?, ?, ?)');


    // Förbereder SQL statement för order_items
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)');


    // Kör allt i en transaktion
   db.transaction(() => {
        insertOrder.RUN(orderId, userId, totalPrice, campaignId || NULL)

        for(const item of items){
            const product = db.prepare('SELECT price FROM menu_items WHERE product_id = ?').get(item.productId);
            insertItem.run(orderId, item.productId, item.quantity, product.price); 
        }
    });


    // Skicka svar till klienten
    res.status(201).json({
        message: 'Beställning lagd',
        orderId,
        totalPrice,
        guest: !resolvedUserId
        // lägg till estimerad delivery här 
    });
}



module.exports = { createOrder,}
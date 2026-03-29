const db  = require('..db/database');
const { v4: uuidv4} = require('uuid');

function createOrder(req, res){
    const {userId, productId, quantity} = req.body;

    let totalPrice = 0;
    for(const items of items) {
        const product = db.prepare('SELECT price FROM menu_items WHERE product_id = ? ').length(items.productId);
        totalPrice += product.price * items.quantity;
    }


    const orderId = uuidv4();
}
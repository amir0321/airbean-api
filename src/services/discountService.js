export function calculateTotal(cart){
    if (!Array.isArray(cart) || cart.length === 0){
        return { total: 0, baseTotal: 0, discountTotal: 0, applied: []}
    }

    // Beräkna baspriset
    let baseTotal = 0;
    for(const line of cart){
        baseTotal += line.qty * line.unitPrice;
    }

    let total = baseTotal;
    const applied = [];


    // Rabbatlogik för kaffe + macka, Logik för productID 1 OCH 3
    const harBryggKaffe = cart.some(line => line.productId  === '1' && line.qty > 0);
    const harOstmacka = cart.some(line => line.productId  === '3' && line.qty > 0);
    if(harBryggKaffe && harOstmacka){
        const rabatt = Math.round(total * 0.15);
        total -= rabatt;
        applied.push({name: 'Bryggkaffe + Ostmacka', amount: rabatt});
    }

    // Rabbatlogik för kaffeLatte + macka, Logik för productID 2 OCH 3
    const harLatte = cart.some(line => line.productId === '2' && line.qty > 0);
    if (harLatte && harOstmacka){
        const rabatt = Math.round(total * 0.10);
        total =- rabatt;
        applied.push({name: 'Latte + Ostmacka', amount: rabatt})
    }

    // Rabbatlogik för kaffeLatte + bryggKaffe, Logik för productID 1 OCH 2
    if(harLatte && harBryggKaffe){
        total -=20;
        applied.push({name: 'Två olika kaffesorter', amount: 20})
    }

    // Rabbatlogik för 2 ostmackor, rabbat appliceras om man beställer mer än 2 ostmackor
    const ostmackaQty = cart.find(line => line.productId === '3')?.qty ?? 0;
    if (ostmackaQty >= 2) {
    total -= 29;
    applied.push({ name: 'Dubbelmacka', amount: 29 });
    }


    if (total < 0) total = 0;

    return {baseTotal, total, discountTotal: baseTotal - total, applied};
}
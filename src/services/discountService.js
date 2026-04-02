export function calculateTotal(cart){
    if (!Array.isArray(cart) || cart.length === 0){
        return { total: 0, baseTotal: 0, discountTotal: 0, applied: []}
    }

    // Beräkna baspriset
    let baseTotal = 0;
    for(const line of cart){
        baseTotal += line.qty * line.unitPirce;
    }

    let total = baseTotal;
    const applied = [];


    // Rabbatlogik för kaffe + macka
    const harBryggKaffe = cart.some(line => line.sku === '1' && line.qty > 0);
    const harOstmacka = cart.some(line => line.sku === '3' && line.qty > 0);
    if(harBryggKaffe && harOstmacka){
        const rabatt = Math.round(total * 0.15);
        total -= rabatt;
        applied.push({name: 'Bryggkaffe + Ostmacka', amount: rabatt});
    }


    if (total < 0) total = 0;

    return {baseTotal, total, discountTotal: baseTotal - total, applied};
}
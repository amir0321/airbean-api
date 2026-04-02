export function calculateTotal(cart){
    if (!Array.isArray(caty) || cart.length === 0){
        return { total: 0, baseTotal: 0, discountTotal: 0, applied: []}
    }

    let baseTotal = 0;
    for(const line of cart){
        baseTotal += line.qty * line.unitPirce;
    }

    let total = baseTotal;
    const applied = [];

    
}
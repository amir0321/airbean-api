## API-dokumentation JAG VET INTE VILKEN ORDNING VI VILL GÖRA ALLTING I

### `POST /api/orders`

Lägger en ny beställning som gäst eller inloggad användare.

**Request body:**
```json
{
  "userId": "abc123",
  "items": [
    { "productId": "1", "quantity": 2 },
    { "productId": "3", "quantity": 1 }
  ]
}
```

`userId` är valfritt, utelämnas vid gästbeställning.

**Response `201`:**
```json
{
  "message": "Beställning lagd",
  "orderNr": "99af31fa-2b9e-4220-89c4-a6996a1a7a19",
  "baseTotal": 107,
  "discountTotal": 16,
  "totalPrice": 91,
  "appliedDiscounts": [
    { "name": "Bryggkaffe + Ostmacka", "amount": 16 }
  ],
  "eta": "20 min"
}
```

Om ingen rabatt appliceras returneras `appliedDiscounts` som en tom array.

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 400 | `items` saknas eller är tom |
| 400 | `productId` saknas på ett item |
| 400 | `quantity` är inte ett positivt heltal |
| 400 | Produkt finns inte i menyn |

---

### Kampanjer

Rabatter appliceras automatiskt om beställningen innehåller rätt kombination, ingen extra parameter behövs.

| Kampanj | Villkor | Rabatt |
|---------|---------|--------|
| Bryggkaffe + Ostmacka | Bryggkaffe (id: 1) + Ostsmörgås (id: 3) | 15% |
| Kaffelatte  + Ostmacka | Kaffelatte (id: 2) + Ostsmörgås (id: 3) | 10% |
| Bryggkaffe + Kaffelatte  | Bryggkaffe (id: 1) + Kaffelatte  (id: 2) | 20 kr |
| Ostmacka + Ostmacka | Ostsmörgås (id: 3) qty > 2  | 29 kr |

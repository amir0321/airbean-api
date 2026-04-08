## API-dokumentation

### `POST /api/users/register`

Skapar ett nytt användarkonto.

**Request body:**
```json
{
  "username": "Ada Lovelace",
  "email": "ada@exempel.se"
}
```

**Response `201`:**
Returnerar det nya användarobjektet.
```json
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "username": "Ada Lovelace",
  "email": "ada@exempel.se"
}
```

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 400 | `username` eller `email` saknas i request body. |
| 400 | Användarnamn eller e-postadress är redan registrerad. |

---

### `POST /api/orders`

Lägger en ny beställning som gäst eller inloggad användare. Om en inloggad användare gör en beställning, skicka med `x-user-id` i headern.

**Request body:**
```json
{
  "items": [
    { "productId": "1", "quantity": 2 },
    { "productId": "3", "quantity": 1 }
  ]
}
```

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
  "eta": "14:35"
}
```
*Notera: `eta` är den beräknade leveranstiden, inte antalet minuter.*

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 400 | `items` saknas eller är tom |
| 400 | `productId` saknas på ett item |
| 400 | `quantity` är inte ett positivt heltal |
| 400 | Produkt finns inte i menyn |

---

### `GET /api/orders/user/:userId`

Hämtar orderhistorik för en specifik användare.

**URL-parametrar:**
*   `userId` (string, obligatorisk): Användarens unika ID.

**Response `200`:**
```json
{
    "userId": "user_123",
    "totalOrders": 1,
    "orders": [
        {
            "orderNr": "3d60bba0-0eaa-4673-a6c3-a27b85580b30",
            "totalPrice": 91,
            "orderTime": "2024-05-22T12:15:00.000Z",
            "remainingEta": 15,
            "status": "Drönare på väg",
            "items": [
                {
                    "title": "Bryggkaffe",
                    "quantity": 2,
                    "price": 39
                },
                {
                    "title": "Ostsmörgås",
                    "quantity": 1,
                    "price": 29
                }
            ]
        }
    ]
}
```

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 400 | `x-user-id` saknas i header. |
| 404 | Ingen orderhistorik hittades för användaren. |
| 500 | Internt serverfel. |

---

### `GET /api/orders/all`

Hämtar en lista över alla ordrar som lagts, inklusive gästordrar. **Notera:** Denna endpoint bör i en verklig applikation skyddas så att endast administratörer kan komma åt den.

**Response `200`:**
```json
{
    "totalOrders": 2,
    "orders": [
        {
            "orderNr": "3d60bba0-0eaa-4673-a6c3-a27b85580b30",
            "userId": "user_123",
            "totalPrice": 91,
            "orderTime": "2024-05-22T12:15:00.000Z",
            "remainingEta": 15,
            "status": "Drönare på väg",
            "items": [
                { "title": "Bryggkaffe", "quantity": 2, "price": 39 }
            ]
        },
        {
            "orderNr": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "userId": "Gäst",
            "totalPrice": 49,
            "orderTime": "2024-05-22T12:20:00.000Z",
            "remainingEta": 18,
            "status": "brygger",
            "items": [
                { "title": "Caffè Latte", "quantity": 1, "price": 49 }
            ]
        }
    ]
}
```

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 404 | Inga ordrar hittades. |
| 500 | Internt serverfel. |

---

### `GET /api/orders/details/:orderId`

Hämtar detaljerad information för en specifik order.

**URL-parametrar:**
*   `orderId` (string, obligatorisk): Orderns unika nummer.

**Response `200`:**
```json
{
    "orderNr": "3d60bba0-0eaa-4673-a6c3-a27b85580b30",
    "userId": "user_123",
    "totalPrice": 91,
    "orderTime": "2024-05-22T12:15:00.000Z",
    "remainingEta": 15,
    "status": "Drönare på väg",
    "items": [
        {
            "title": "Bryggkaffe",
            "quantity": 2,
            "price": 39
        },
        {
            "title": "Ostsmörgås",
            "quantity": 1,
            "price": 29
        }
    ]
}
```

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 404 | Ordern hittades inte. |
| 500 | Internt serverfel. |

---

### `GET /api/orders/status/:orderId`

Hämtar aktuell status och återstående leveranstid (ETA) för en specifik order.

**URL-parametrar:**
*   `orderId` (string, obligatorisk): Orderns unika nummer.

**Response `200`:**
```json
{
    "orderId": "3d60bba0-0eaa-4673-a6c3-a27b85580b30",
    "eta": 12,
    "status": "Drönare på väg"
}
```
*Notera: `eta` är återstående minuter.*

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 400 | `orderId` saknas. |
| 404 | Ordern hittades inte. |
| 500 | Internt serverfel. |

---

### `GET /api/beans`

Hämtar hela menyn med alla tillgängliga produkter.

**Response `200`:**
Returnerar en array med alla produkter från menyn.
```json
[
  {
    "id": "1",
    "title": "Bryggkaffe",
    "description": "Bryggd på nymalda bönor.",
    "price": 39
  }
]
```

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 500 | Internt serverfel, misslyckades med att hämta menyn. |

---

### Kampanjer

Rabatter appliceras automatiskt om beställningen innehåller rätt kombination, ingen extra parameter behövs.

| Kampanj | Villkor | Rabatt |
|---------|---------|--------|
| Bryggkaffe + Ostmacka | Bryggkaffe (id: 1) + Ostsmörgås (id: 3) | 15% |
| Kaffelatte  + Ostmacka | Kaffelatte (id: 2) + Ostsmörgås (id: 3) | 10% |
| Bryggkaffe + Kaffelatte  | Bryggkaffe (id: 1) + Kaffelatte  (id: 2) | 20 kr |
| Ostmacka + Ostmacka | Ostsmörgås (id: 3) qty > 2  | 29 kr |

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

---

### `GET /api/beans`

Hämtar hela menyn med alla tillgängliga produkter.

**Request body:**
Ingen body krävs.

**Response `200`:**
Returnerar en array med alla produkter från menyn.
```json
[
  {
    "id": "1",
    "title": "Bryggkaffe",
    "description": "Bryggd på nymalda bönor.",
    "price": 39
  },
  {
    "id": "2",
    "title": "Caffè Latte",
    "description": "Klassisk espresso med ångad mjölk.",
    "price": 49
  },
  {
    "id": "3",
    "title": "Ostsmörgås",
    "description": "Smörgås med ost och grönsaker.",
    "price": 29
  }
]
```

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 500 | Internt serverfel, misslyckades med att hämta menyn. |

---

### `POST /api/users`

Skapar ett nytt användarkonto.

**Request body:**
```json
{
  "username": "Ada Lovelace",
  "email": "ada@exempel.se"
}
```

**Response `201`:**
Returnerar den nya användarens unika ID.
```json
{
  "message": "Användare skapad",
  "userId": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}
```

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 400 | `username` eller `email` saknas i request body. |
| 409 | Användarnamn eller e-postadress är redan registrerad. |

---

### `PUT /api/users/:userId`

Uppdaterar en befintlig användares uppgifter.

**URL-parametrar:**
*   `userId` (string, obligatorisk): Användarens unika ID.

**Request body:**
Innehåller de fält som ska uppdateras. Minst ett fält måste finnas med.
```json
{
  "username": "Ada Byron",
  "email": "ada.byron@exempel.se"
}
```

**Response `200`:**
```json
{
  "message": "Användaruppgifter uppdaterade"
}
```

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 400 | Inga fält att uppdatera skickades med. |
| 404 | Användare med angivet `userId` hittades inte. |
| 409 | Det nya användarnamnet eller e-postadressen är redan upptaget. |

---

### `DELETE /api/users/:userId`

Raderar ett användarkonto.

**URL-parametrar:**
*   `userId` (string, obligatorisk): Användarens unika ID.

**Request body:**
Ingen body krävs.

**Response `200`:**
```json
{
  "message": "Användare raderad"
}
```

**Felkoder:**

| Kod | Beskrivning |
|-----|-------------|
| 404 | Användare med angivet `userId` hittades inte. |

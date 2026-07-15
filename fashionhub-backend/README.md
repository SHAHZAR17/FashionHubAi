# FashionHub AI Backend

Backend & Database for the AI Fashion Sales Assistant (Node.js, Express, MongoDB).

## Setup

```bash
npm install
cp .env.example .env   # then fill in your MongoDB URI, OpenAI key, etc.
npm run seed            # loads the 15 sample products into MongoDB
npm run dev              # starts the server with nodemon
```

## Who owns what

**Member 1 — Products & database**
`config/db.js`, `models/Product.js`, `controllers/productController.js`,
`routes/productRoutes.js`, `seed/seedProducts.js`

**Member 2 — Customers & orders**
`models/Customer.js`, `models/Order.js`, `controllers/customerController.js`,
`controllers/orderController.js`, `routes/customerRoutes.js`, `routes/orderRoutes.js`

**Member 3 — Messaging, AI orchestration & conversation logs**
`models/Conversation.js`, `controllers/messageController.js`,
`services/intentService.js`, `services/aiService.js`, `routes/webhookRoutes.js`

## API endpoints

| Method | Endpoint | Owner | Description |
|---|---|---|---|
| GET | `/api/products` | 1 | List/filter products (category, price, color, size) |
| GET | `/api/products/search?q=` | 1 | Free-text product search |
| GET | `/api/products/:id` | 1 | Get one product |
| POST/PUT/DELETE | `/api/products/:id` | 1 | Admin CRUD |
| POST | `/api/customers` | 2 | Create/update customer by IG or WhatsApp ID |
| GET | `/api/customers` | 2 | List customers (admin) |
| POST | `/api/orders` | 2 | Place an order (decrements stock, generates tracking #) |
| GET | `/api/orders/track/:trackingNumber` | 2 | Track an order |
| PUT | `/api/orders/:id/status` | 2 | Update order/payment status (admin) |
| GET | `/api/orders/:id/upsell` | 2 | Same-category upsell suggestions |
| GET/POST | `/api/webhook/instagram` | 3 | Instagram Graph API webhook |
| GET/POST | `/api/webhook/whatsapp` | 3 | WhatsApp Business API webhook |
| GET | `/api/webhook/conversations` | 3 | View conversation logs (admin) |

## How it connects end-to-end

1. Customer messages on Instagram/WhatsApp → Member 3's webhook receives it.
2. Member 3 detects intent (keyword pass, `services/intentService.js`).
3. If it's a product query, Member 3 calls Member 1's `Product.find()` /
   search logic and passes the results into `services/aiService.js` to draft
   a natural reply.
4. If the customer proceeds to order, the flow hands off to Member 2's
   `POST /api/orders`, which decrements stock via Member 1's
   `decrementStock()` helper.
5. Every exchange is logged to `Conversation` (Member 3) for the admin
   dashboard's "View Conversations" and "Train AI Responses" features.

## Notes

- `productSchema` has a text index on `productName`, `description`,
  `category`, `colors` — required for `$text` search in
  `searchProducts`/`buildReply`.
- `sendPlatformMessage()` in `messageController.js` is a real call shape for
  the Graph API / WhatsApp Business API, but you'll need valid access tokens
  from Meta's developer console before it actually sends anything.
- Add request validation (Joi is already in `package.json`) before demo day —
  none of the controllers validate `req.body` shape yet beyond basic checks.

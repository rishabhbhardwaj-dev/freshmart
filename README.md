# 🥬 FreshMart — Premium Grocery Store

A full-stack grocery selling application where users can browse grocery items, add them to a cart, and place orders.

## Features

- **Product Catalog** — 18+ grocery items across 6 categories (Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks)
- **Category Filtering** — Filter products by category with animated tab navigation
- **Search** — Real-time search with debounced input
- **Shopping Cart** — Slide-out cart with quantity controls, item removal, and live totals
- **Checkout** — Order form with customer details and order summary
- **Order Confirmation** — Success view with order ID and details
- **Premium Dark UI** — Glassmorphism design with micro-animations and vibrant gradients

## Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Backend  | Node.js + Express        |
| Frontend | Vanilla HTML / CSS / JS  |
| Data     | In-memory JSON store     |
| Design   | Dark-mode glassmorphism  |

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Then open **http://localhost:3000** in your browser.

## API Endpoints

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | /api/products        | List products (?category=)   |
| GET    | /api/products/:id    | Get single product           |
| GET    | /api/products/categories | List categories           |
| GET    | /api/cart            | Get cart contents            |
| POST   | /api/cart            | Add item to cart             |
| PUT    | /api/cart/:productId | Update item quantity         |
| DELETE | /api/cart/:productId | Remove item from cart        |
| DELETE | /api/cart            | Clear entire cart            |
| POST   | /api/orders          | Place order                  |
| GET    | /api/orders          | List all orders              |
| GET    | /api/orders/:id      | Get single order             |

## Project Structure

```
grocery-app/
├── server/
│   ├── index.js              # Express server
│   ├── routes/
│   │   ├── products.js       # Product API routes
│   │   ├── cart.js            # Cart API routes
│   │   └── orders.js         # Order API routes
│   ├── data/
│   │   └── products.json     # Seed product data
│   └── models/
│       └── store.js          # In-memory data store
├── public/
│   ├── index.html            # Main page
│   ├── css/styles.css        # Design system
│   └── js/
│       ├── api.js            # API client
│       ├── components.js     # UI component renderers
│       └── app.js            # Main app controller
├── package.json
└── README.md
```

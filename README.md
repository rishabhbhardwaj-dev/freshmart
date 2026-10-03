# 🥬 FreshMart

> Premium grocery shopping experience built with Node.js, Express, Prisma, and a polished storefront UI.

<p align="center">
  <strong>🛒 Explore products → 🔎 Find favorites → 🛍️ Add to cart → 👤 Sign in → 📦 Checkout</strong>
</p>

FreshMart is a lightweight full-stack grocery store demo designed to deliver a premium e-commerce flow in a simple JavaScript stack. It combines a modern storefront UI with a REST API for product browsing, cart management, authentication, and order placement.

---

## ✨ Overview

FreshMart brings together:

- A responsive grocery storefront in the browser
- Express-based REST APIs for core shopping actions
- Prisma + MySQL/MariaDB persistence for products, carts, users, and orders
- Clean, dark-themed UI with glassmorphism-inspired styling
- A realistic user journey from browsing to checkout

The app is served by a single Node.js server and uses static files from `public/` while exposing API routes under `/api`.

---

## 🚀 Features

### Shopping experience

- Browse all grocery items
- Filter by category
- Search products by name or description
- View detailed product information
- Add items to cart
- Increase or decrease quantities
- Remove individual items or clear the cart
- See live totals and item counts

### Authentication

- Register a new account
- Log in securely using token-based auth
- Fetch the current authenticated user
- Password recovery flow with mock OTP generation
- Reset password flow

### Orders

- Checkout with customer details
- Create and store orders
- View order history
- Retrieve a specific order by ID

### UI/UX

- Premium dark interface
- Responsive layout for desktop and mobile
- Animated interactions and hover states
- Grocery-focused visual design
- Modal-based authentication flow

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Backend | Express |
| Frontend | HTML, CSS, Vanilla JavaScript |
| API | RESTful Express routes |
| Database | Prisma + MySQL/MariaDB |
| Seed data | JSON + Prisma seed script |
| Package manager | npm |

---

## 🗂️ Project Structure

```text
freshmart/
├─ public/                 # Frontend assets and single-page UI
├─ server/                 # Express server and route logic
│  ├─ db.js                # Prisma client setup
│  ├─ index.js             # App entry point
│  ├─ data/                # Seed product data
│  └─ routes/              # Auth, product, cart, and order routes
├─ prisma/                 # Prisma schema and migrations
├─ seed.js                 # Product seeding script
├─ package.json            # App metadata and scripts
├─ README.md               # Project documentation
└─ .gitignore              # Ignore rules
```

---

## ⚙️ Getting Started

### 1. Prerequisites

Install:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- A local MySQL/MariaDB instance (XAMPP, WAMP, or MySQL Workbench)

### 2. Clone the repository

```bash
git clone https://github.com/rishabhbhardwaj-dev/freshmart.git
cd freshmart
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up the database

Start your MySQL/MariaDB service and create a database named `freshmart`.

Then initialize Prisma and seed the product catalog:

```bash
npx prisma generate
npx prisma db push
node seed.js
```

> The app is currently configured to connect to a local MariaDB/MySQL instance on `localhost:3306` using the `freshmart` database.

### 5. Run the application

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

---

## 🌐 API Overview

FreshMart exposes a set of REST endpoints for the storefront experience:

### Products

- `GET /api/products` — list all products
- `GET /api/products/categories` — list category names
- `GET /api/products/:id` — get a product by ID

### Cart

- `GET /api/cart` — fetch current cart
- `POST /api/cart` — add an item to the cart
- `PUT /api/cart/:productId` — update item quantity
- `DELETE /api/cart/:productId` — remove an item
- `DELETE /api/cart` — clear the cart

### Auth

- `POST /api/auth/register` — create a user
- `POST /api/auth/login` — sign in
- `GET /api/auth/me` — fetch current user profile
- `POST /api/auth/forgot-password` — request OTP
- `POST /api/auth/reset-password` — reset account password

### Orders

- `POST /api/orders` — create an order from the cart
- `GET /api/orders` — fetch order history
- `GET /api/orders/:id` — fetch a single order

---

## 🧪 Scripts

```bash
npm start
npm run dev
```

Both scripts currently start the Express server via `server/index.js`.

---

## 📦 Notes

FreshMart is a polished demo application aimed at showcasing a realistic grocery shopping flow. It is useful for learning project structure, full-stack API design, Prisma integration, and frontend-to-backend data flow in a single lightweight app.

---

## 📄 License

This project is licensed under the MIT License.

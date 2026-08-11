# 🥬 FreshMart — Premium Grocery Store

> A full-stack grocery shopping experience built with **Node.js, Express, and Vanilla JavaScript**, featuring product browsing, search, categories, cart management, checkout, authentication, and a polished premium UI.

<p align="center">
  <strong>🛒 Browse → 🔎 Search → 🛍️ Add to Cart → 👤 Authenticate → 📦 Place an Order</strong>
</p>

---

## ✨ Overview

FreshMart is a full-stack grocery store application designed to demonstrate how a modern e-commerce flow can be built with a lightweight JavaScript stack.

The application is served by a single **Node.js + Express** server. Express serves the static frontend from `public/` and exposes REST APIs under `/api/*`.

The current application logic uses an **in-memory store** backed by seed product data in `server/data/products.json`. Prisma + MySQL/MariaDB have also been initialized as the project's database layer and are being prepared for the next persistence phase.

> **Important:** You do **not** need XAMPP or MySQL just to run the current FreshMart UI/API locally. XAMPP is relevant to the ongoing Prisma/MySQL database setup.

---

## 🚀 What You Can Do

### 🛍️ Shopping

- Browse grocery products
- Filter products by category
- Search products
- View product information
- Add products to the cart
- Increase/decrease quantities
- Remove individual items
- Clear the cart
- View live cart totals

### 👤 Authentication

- Register an account
- Log in
- Check the currently authenticated user
- Forgot-password / mock OTP flow
- Reset-password flow

### 📦 Orders

- Checkout with customer information
- Place an order
- Receive an order confirmation
- View orders
- Retrieve an individual order by ID

### 🎨 UI / UX

- Premium dark interface
- Glassmorphism styling
- Responsive layout
- Animated interactions
- Grocery-focused visual design
- Search and cart interactions
- Authentication modal

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Backend | Express 5 |
| Frontend | HTML5 + CSS3 + Vanilla JavaScript |
| API | REST-style Express routes |
| Current data layer | In-memory JavaScript store |
| Seed data | JSON |
| Database layer being prepared | Prisma + MySQL/MariaDB |
| Local DB environment | XAMPP / MariaDB |
| Package manager | npm |

The server entry point is `server/index.js`, and the current package scripts use `node server/index.js` for both `start` and `dev`.

---

## ⚡ Run FreshMart Locally

### 1. Prerequisites

Install:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)

For the **current application**, no separate database installation is required.

### 2. Clone the repository

```bash
git clone https://github.com/rishabhbhardwaj-dev/freshmart.git
cd freshmart
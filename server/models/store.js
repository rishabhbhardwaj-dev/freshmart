/**
 * In-memory data store for the grocery application.
 * Manages products, cart, and orders state.
 */

const fs = require('fs');
const path = require('path');

// Load seed product data
const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'products.json'), 'utf-8')
);

class Store {
  constructor() {
    this.products = [...productsData];
    this.cart = [];
    this.orders = [];
    this.nextOrderId = 1001;
    
    // Auth
    this.users = [];
    this.otps = {}; // Email to OTP map
    this.nextUserId = 1;
  }

  // ── Product Methods ──────────────────────────────────────

  getAllProducts(category = null) {
    if (category) {
      return this.products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    return this.products;
  }

  getProductById(id) {
    return this.products.find((p) => p.id === parseInt(id));
  }

  getCategories() {
    return [...new Set(this.products.map((p) => p.category))];
  }

  // ── Cart Methods ─────────────────────────────────────────

  getCart() {
    return {
      items: this.cart,
      totalItems: this.cart.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: this.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    };
  }

  addToCart(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    if (!product.inStock) {
      throw new Error('Product is out of stock');
    }

    const existingItem = this.cart.find((item) => item.productId === parseInt(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        unit: product.unit,
      });
    }

    return this.getCart();
  }

  updateCartItem(productId, quantity) {
    const item = this.cart.find((item) => item.productId === parseInt(productId));
    if (!item) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }

    item.quantity = quantity;
    return this.getCart();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.productId !== parseInt(productId));
    return this.getCart();
  }

  clearCart() {
    this.cart = [];
    return this.getCart();
  }

  // ── Order Methods ────────────────────────────────────────

  placeOrder(customerName, customerEmail) {
    if (this.cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const cartData = this.getCart();
    const order = {
      id: this.nextOrderId++,
      items: [...this.cart],
      total: cartData.totalPrice,
      status: 'confirmed',
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
    };

    this.orders.push(order);
    this.cart = [];

    return order;
  }

  getAllOrders() {
    return this.orders;
  }

  getOrderById(id) {
    return this.orders.find((o) => o.id === parseInt(id));
  }

  // ── Authentication Methods ─────────────────────────────

  registerUser(name, email, password) {
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    const user = {
      id: this.nextUserId++,
      name,
      email,
      password, // Plain text. In a real app we would use bcrypt
      token: `mock-token-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.users.push(user);
    return user;
  }

  loginUser(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    // rotate token on login
    user.token = `mock-token-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return user;
  }

  getUserByToken(token) {
    if (!token) return null;
    return this.users.find(u => u.token === token) || null;
  }

  generateResetOTP(email) {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    this.otps[email] = {
      otp,
      expires: Date.now() + 15 * 60 * 1000 // 15 mins
    };
    return otp;
  }

  resetPassword(email, otp, newPassword) {
    const record = this.otps[email];
    if (!record) {
      throw new Error('No OTP requested for this email');
    }
    if (Date.now() > record.expires) {
      delete this.otps[email];
      throw new Error('OTP has expired');
    }
    if (record.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword;
    delete this.otps[email]; // clear used OTP
    return true;
  }
}

// Singleton instance
module.exports = new Store();

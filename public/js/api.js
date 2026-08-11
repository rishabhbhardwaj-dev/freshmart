/**
 * API Client — Handles all HTTP requests to the backend.
 */

const API = {
  BASE_URL: '/api',

  async request(endpoint, options = {}) {
    try {
      const token = localStorage.getItem('freshmart_token');
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }

      return data.data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // ── Products ─────────────────────────────────────────
  async getProducts(category = null, search = null) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    const qs = params.toString();
    return this.request(`/products${qs ? '?' + qs : ''}`);
  },

  async getProduct(id) {
    return this.request(`/products/${id}`);
  },

  async getCategories() {
    return this.request('/products/categories');
  },

  // ── Cart ─────────────────────────────────────────────
  async getCart() {
    return this.request('/cart');
  },

  async addToCart(productId, quantity = 1) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async updateCartItem(productId, quantity) {
    return this.request(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeFromCart(productId) {
    return this.request(`/cart/${productId}`, {
      method: 'DELETE',
    });
  },

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    });
  },

  // ── Orders ───────────────────────────────────────────
  async placeOrder(customerName, customerEmail) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({ customerName, customerEmail }),
    });
  },

  async getOrders() {
    return this.request('/orders');
  },

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  },

  // ── Auth ─────────────────────────────────────────────
  
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async getCurrentUser() {
    return this.request('/auth/me');
  },

  async forgotPassword(email) {
    // Returns full json so we can access mockOTP from root instead of just .data
    const response = await fetch(`${this.BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data; 
  },

  async resetPassword(email, otp, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }
};

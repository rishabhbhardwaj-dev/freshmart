/**
 * Main Application Controller — Orchestrates the entire grocery app.
 * Manages state, routing, search, and all user interactions.
 */

const app = {
  // ── State ────────────────────────────────────────────
  products: [],
  cart: { items: [], totalItems: 0, totalPrice: 0 },
  categories: [],
  activeCategory: 'all',
  searchQuery: '',
  cartOpen: false,
  currentUser: null,
  authOpen: false,

  // ── Initialization ───────────────────────────────────
  async init() {
    console.log('🥬 FreshMart App initializing...');

    // Set up search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.loadProducts();
        }, 300);
      });
    }

    // Load categories + products + cart in parallel
    try {
      const [categories, products, cart] = await Promise.all([
        API.getCategories(),
        API.getProducts(),
        API.getCart(),
      ]);

      this.categories = categories;
      this.products = products;
      this.cart = cart;

      await this.checkAuth();

      this.renderCategories();
      this.renderProducts();
      this.updateCartUI();

      console.log('✅ FreshMart App ready!');
    } catch (err) {
      console.error('Failed to initialize app:', err);
    }
  },

  // ── Product Loading ──────────────────────────────────
  async loadProducts() {
    try {
      const category = this.activeCategory === 'all' ? null : this.activeCategory;
      this.products = await API.getProducts(category, this.searchQuery || null);
      this.renderProducts();
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  },

  // ── Category Filtering ──────────────────────────────
  filterByCategory(category) {
    this.activeCategory = category;

    document.querySelectorAll('.category-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });

    this.loadProducts();
  },

  // ── Rendering ────────────────────────────────────────
  renderCategories() {
    const container = document.getElementById('category-tabs');
    if (!container) return;

    const allTab = `
      <button class="category-tab active" data-category="all" id="tab-all" onclick="app.filterByCategory('all')">
        <span class="tab-icon">🛒</span> All
      </button>
    `;

    const categoryTabs = this.categories
      .map((cat) => Components.categoryTab(cat, false))
      .join('');

    container.innerHTML = allTab + categoryTabs;
  },

  renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (this.products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">🔍</div>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">No products found</p>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Try a different search or category</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.products
      .map((product) => {
        const cartItem = this.cart.items.find(
          (item) => item.productId === product.id
        );
        return Components.productCard(product, cartItem);
      })
      .join('');
  },

  // ── Cart Operations ──────────────────────────────────
  async addToCart(productId) {
    try {
      this.cart = await API.addToCart(productId, 1);
      this.updateCartUI();
      this.renderProducts();
      this.showToast('Added to cart', '🛒');

      const badge = document.getElementById('cart-badge');
      if (badge) {
        badge.style.animation = 'cartPop 0.4s ease';
        setTimeout(() => (badge.style.animation = ''), 400);
      }
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  async updateQuantity(productId, newQuantity) {
    try {
      if (newQuantity <= 0) {
        this.cart = await API.removeFromCart(productId);
        this.showToast('Removed from cart', '🗑️');
      } else {
        this.cart = await API.updateCartItem(productId, newQuantity);
      }
      this.updateCartUI();
      this.renderProducts();
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  async removeFromCart(productId) {
    try {
      this.cart = await API.removeFromCart(productId);
      this.updateCartUI();
      this.renderProducts();
      this.showToast('Removed from cart', '🗑️');
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  // ── Cart UI ──────────────────────────────────────────
  updateCartUI() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = this.cart.totalItems;
      badge.classList.toggle('visible', this.cart.totalItems > 0);
    }

    const cartItemsEl = document.getElementById('cart-items');
    if (cartItemsEl) {
      if (this.cart.items.length === 0) {
        cartItemsEl.innerHTML = Components.cartEmpty();
      } else {
        cartItemsEl.innerHTML = this.cart.items
          .map((item) => Components.cartItem(item))
          .join('');
      }
    }

    const totalEl = document.getElementById('cart-total-price');
    if (totalEl) {
      totalEl.textContent = `$${Number(this.cart.totalPrice).toFixed(2)}`;
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.disabled = this.cart.items.length === 0;
    }
  },

  // ── Cart Toggle ──────────────────────────────────────
  toggleCart() {
    this.cartOpen = !this.cartOpen;
    document.getElementById('cart-sidebar').classList.toggle('open', this.cartOpen);
    document.getElementById('cart-overlay').classList.toggle('open', this.cartOpen);
    document.body.style.overflow = this.cartOpen ? 'hidden' : '';
  },

  // ── Checkout ─────────────────────────────────────────
  async showCheckout() {
    if (this.cart.items.length === 0) return;

    if (this.cartOpen) this.toggleCart();

    const modal = document.getElementById('checkout-modal');
    const body = document.getElementById('checkout-modal-body');
    if (modal && body) {
      body.innerHTML = Components.checkoutForm(this.cart, this.currentUser);
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  },

  closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  },

  async placeOrder(event) {
    event.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('customer-email').value.trim();

    if (!name || !email) {
      this.showToast('Please fill in all fields', '⚠️');
      return;
    }

    const submitBtn = document.getElementById('place-order-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
    }

    try {
      const order = await API.placeOrder(name, email);

      this.cart = { items: [], totalItems: 0, totalPrice: 0 };
      this.updateCartUI();
      this.renderProducts();

      const body = document.getElementById('checkout-modal-body');
      if (body) {
        body.innerHTML = Components.orderConfirmation(order);
      }

      this.showToast(`Order #${order.id} placed successfully!`, '🎉');
    } catch (err) {
      this.showToast(err.message, '❌');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = `Place Order — $$$${Number(this.cart.totalPrice).toFixed(2)}`;
      }
    }
  },

  // ── Authentication ───────────────────────────────────
  async checkAuth() {
    const token = localStorage.getItem('freshmart_token');
    if (token) {
      try {
        const user = await API.getCurrentUser();
        this.setUser(user);
        this.cart = await API.getCart();
        this.updateCartUI();
        this.renderProducts();
      } catch (err) {
        localStorage.removeItem('freshmart_token');
        this.setUser(null);
      }
    }
  },

  setUser(user) {
    this.currentUser = user;
    const loginBtn = document.getElementById('login-button');
    const nameDisplay = document.getElementById('user-name-display');
    if (loginBtn && nameDisplay) {
      if (user) {
        nameDisplay.textContent = user.name.split(' ')[0];
        loginBtn.classList.add('logged-in');
        loginBtn.onclick = () => this.logout();
      } else {
        nameDisplay.textContent = 'Login';
        loginBtn.classList.remove('logged-in');
        loginBtn.onclick = () => this.showAuthModal();
      }
    }
  },

  logout() {
    localStorage.removeItem('freshmart_token');
    this.setUser(null);
    this.cart = { items: [], totalItems: 0, totalPrice: 0 };
    this.updateCartUI();
    this.renderProducts();
    this.showToast('Logged out successfully', '👋');
  },

  showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      this.setAuthView('login');
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  },

  setAuthView(view) {
    const body = document.getElementById('auth-modal-body');
    if (!body) return;

    switch (view) {
      case 'login':
        body.innerHTML = Components.authLogin();
        break;
      case 'register':
        body.innerHTML = Components.authRegister();
        break;
      case 'forgot':
        body.innerHTML = Components.authForgot();
        break;
    }
  },

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const { token, user } = await API.login(email, password);
      localStorage.setItem('freshmart_token', token);
      this.setUser(user);
      this.closeAuthModal();
      this.showToast(`Welcome back, ${user.name.split(' ')[0]}!`, '👋');

      this.cart = await API.getCart();
      this.updateCartUI();
      this.renderProducts();
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  async handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    try {
      const { token, user } = await API.register(name, email, password);
      localStorage.setItem('freshmart_token', token);
      this.setUser(user);
      this.closeAuthModal();
      this.showToast(`Welcome, ${user.name.split(' ')[0]}!`, '🎉');

      this.cart = await API.getCart();
      this.updateCartUI();
      this.renderProducts();
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  async handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();

    try {
      const data = await API.forgotPassword(email);
      this.showToast('Reset code sent!', '📧');

      const body = document.getElementById('auth-modal-body');
      if (body) {
        body.innerHTML = Components.authReset(email, data.mockOTP);
      }
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  async handleResetPassword(event) {
    event.preventDefault();
    const email = document.getElementById('reset-email').value;
    const otp = document.getElementById('reset-otp').value;
    const newPassword = document.getElementById('reset-password').value;

    try {
      await API.resetPassword(email, otp, newPassword);
      this.showToast('Password reset! Please log in.', '✅');
      this.setAuthView('login');
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  // ── Toast Notifications ──────────────────────────────
  showToast(message, icon = '✅') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.innerHTML = Components.toast(message, icon);
    const toastEl = toast.firstElementChild;
    container.appendChild(toastEl);

    requestAnimationFrame(() => {
      toastEl.classList.add('show');
    });

    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.remove(), 300);
    }, 3000);
  },
};

// Start the app
document.addEventListener('DOMContentLoaded', () => app.init());
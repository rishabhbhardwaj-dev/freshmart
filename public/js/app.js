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

    // Update active tab visually
    document.querySelectorAll('.category-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });

    this.loadProducts();
  },

  // ── Rendering ────────────────────────────────────────
  renderCategories() {
    const container = document.getElementById('category-tabs');
    if (!container) return;

    // Keep the "All" tab, add category tabs
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

      // Animate cart button
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
    // Badge
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = this.cart.totalItems;
      badge.classList.toggle('visible', this.cart.totalItems > 0);
    }

    // Cart items
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

    // Total
    const totalEl = document.getElementById('cart-total-price');
    if (totalEl) {
      totalEl.textContent = `$${this.cart.totalPrice.toFixed(2)}`;
    }

    // Checkout button state
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

    // Close cart sidebar
    if (this.cartOpen) this.toggleCart();

    const modal = document.getElementById('checkout-modal');
    const body = document.getElementById('checkout-modal-body');
    if (modal && body) {
      body.innerHTML = Components.checkoutForm(this.cart);
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

      // Update cart state
      this.cart = { items: [], totalItems: 0, totalPrice: 0 };
      this.updateCartUI();
      this.renderProducts();

      // Show confirmation
      const body = document.getElementById('checkout-modal-body');
      if (body) {
        body.innerHTML = Components.orderConfirmation(order);
      }

      this.showToast(`Order #${order.id} placed successfully!`, '🎉');
    } catch (err) {
      this.showToast(err.message, '❌');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = `Place Order — $${this.cart.totalPrice.toFixed(2)}`;
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
      } catch (err) {
        // Token invalid or expired
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
    this.showToast('Logged out successfully', '👋');
  },

  showAuthModal() {
    this.authOpen = true;
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      this.setAuthView('login');
    }
  },

  closeAuthModal() {
    this.authOpen = false;
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  },

  setAuthView(view, extraData = null) {
    const body = document.getElementById('auth-modal-body');
    if (!body) return;

    if (view === 'login') body.innerHTML = Components.authLogin();
    else if (view === 'register') body.innerHTML = Components.authRegister();
    else if (view === 'forgot') body.innerHTML = Components.authForgot();
    else if (view === 'reset') body.innerHTML = Components.authReset(extraData);
  },

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    try {
      const data = await API.login(email, password);
      localStorage.setItem('freshmart_token', data.token);
      this.setUser(data.user);
      this.closeAuthModal();
      this.showToast('Welcome back!', '🎉');
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  async handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    try {
      const data = await API.register(name, email, password);
      localStorage.setItem('freshmart_token', data.token);
      this.setUser(data.user);
      this.closeAuthModal();
      this.showToast('Account created successfully!', '🎉');
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  async handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    try {
      const res = await API.forgotPassword(email);
      this.showToast('OTP generated successfully!', '✉️');
      
      this.setAuthView('reset', email);

      // MOCK BEHAVIOR: Show alert prominently to ensure user sees it, and auto-fill it
      setTimeout(() => {
        alert(`MOCK EMAIL RECEIVED:\n\nYour Reset OTP is: ${res.mockOTP}`);
        const otpInput = document.getElementById('reset-otp');
        if (otpInput) {
          otpInput.value = res.mockOTP;
        }
      }, 500);

    } catch (err) {
      this.showToast(err.message, '❌');
      // If user tries to reset a non-existent account, they might not realize the mock DB resets.
      if (err.message.includes('User not found')) {
        alert("Wait! The application uses a mock in-memory database that resets when the server restarts. Please make sure you have explicitly registered an account first before trying to reset its password.");
      }
    }
  },

  async handleResetPassword(event) {
    event.preventDefault();
    const email = document.getElementById('reset-email').value;
    const otp = document.getElementById('reset-otp').value.trim();
    const newPassword = document.getElementById('reset-password').value.trim();
    try {
      await API.resetPassword(email, otp, newPassword);
      this.showToast('Password updated successfully! Please login.', '✅');
      this.setAuthView('login');
    } catch (err) {
      this.showToast(err.message, '❌');
    }
  },

  // ── Toast Notifications ──────────────────────────────
  showToast(message, icon = '✅') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.innerHTML = Components.toast(message, icon);
    container.appendChild(toastEl.firstElementChild);

    // Auto-remove after animation
    setTimeout(() => {
      const toast = container.firstElementChild;
      if (toast) toast.remove();
    }, 3000);
  },

  // ── Navigation (SPA-like) ───────────────────────────
  navigate(page) {
    if (page === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
};

// ── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

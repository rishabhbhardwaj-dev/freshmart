/**
 * UI Components — Renders product cards, cart items, checkout, and confirmations.
 */

const Components = {
  // Category icon mapping
  categoryIcons: {
    Fruits: '🍎',
    Vegetables: '🥦',
    Dairy: '🧀',
    Bakery: '🍞',
    Beverages: '☕',
    Snacks: '🍿',
    'Soft Drinks': '🥤',
  },

  /**
   * Render product card HTML
   */
  productCard(product, cartItem = null) {
    const inCart = cartItem && cartItem.quantity > 0;
    const delay = Math.random() * 0.3;

    return `
      <div class="product-card" id="product-${product.id}" style="animation-delay: ${delay}s">
        <div class="product-card-image">
          <span>${product.image}</span>
          <span class="product-category-badge">${product.category}</span>
        </div>
        <div class="product-card-body">
          <h3 class="product-card-name">${product.name}</h3>
          <p class="product-card-desc">${product.description}</p>
          <div class="product-card-footer">
            <div class="product-price">
              <span class="product-price-value">$$$${Number(product.price).toFixed(2)}</span>
              <span class="product-price-unit">${product.unit}</span>
            </div>
            ${inCart
              ? `<div class="in-cart-controls">
                   <button class="qty-btn" id="decrease-${product.id}" onclick="app.updateQuantity(${product.id}, ${cartItem.quantity - 1})">−</button>
                   <span class="qty-value">${cartItem.quantity}</span>
                   <button class="qty-btn" id="increase-${product.id}" onclick="app.updateQuantity(${product.id}, ${cartItem.quantity + 1})">+</button>
                 </div>`
              : `<button class="add-to-cart-btn" id="add-btn-${product.id}" onclick="app.addToCart(${product.id})">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                     <line x1="12" y1="5" x2="12" y2="19"></line>
                     <line x1="5" y1="12" x2="19" y2="12"></line>
                   </svg>
                   Add
                 </button>`
            }
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render category tab button
   */
  categoryTab(category, isActive = false) {
    const icon = this.categoryIcons[category] || '📦';
    return `
      <button class="category-tab ${isActive ? 'active' : ''}"
              data-category="${category}"
              id="tab-${category.toLowerCase()}"
              onclick="app.filterByCategory('${category}')">
        <span class="tab-icon">${icon}</span> ${category}
      </button>
    `;
  },

  /**
   * Render cart item HTML
   */
  cartItem(item) {
    const price = item.price !== undefined ? Number(item.price) : Number(item.product?.price || 0);
    const name = item.name || item.product?.name || 'Unknown';
    const image = item.image || item.product?.image || '📦';
    const unit = item.unit || item.product?.unit || '';

    return `
      <div class="cart-item" id="cart-item-${item.productId}">
        <div class="cart-item-emoji">${image}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-unit">${unit}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="app.updateQuantity(${item.productId}, ${item.quantity - 1})">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="app.updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
          </div>
        </div>
        <div class="cart-item-price">
          <span class="cart-item-total">$${(price * item.quantity).toFixed(2)}</span>
          <button class="cart-item-remove" onclick="app.removeFromCart({item.productId})">Remove</button>
        </div>
      </div>
    `;
  },

  /**
   * Render empty cart state
   */
  cartEmpty() {
    return `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div class="cart-empty-text">Your cart is empty</div>
        <div class="cart-empty-sub">Browse our products and add items to get started</div>
      </div>
    `;
  },

  /**
   * Render checkout form
   */
  checkoutForm(cart, user = null) {
    const itemsHtml = cart.items.map(item => {
      const price = item.price !== undefined ? Number(item.price) : Number(item.product?.price || 0);
      const name = item.name || item.product?.name || 'Unknown';
      const image = item.image || item.product?.image || '📦';
      return `
        <div class="order-summary-item">
          <span>${image} ${name} × ${item.quantity}</span>
          <span>$$$${(price * item.quantity).toFixed(2)}</span>
        </div>
      `;
    }).join('');

    const nameValue = user ? user.name : '';
    const emailValue = user ? user.email : '';

    return `
      <h2 class="checkout-title">Checkout</h2>
      <p class="checkout-subtitle">Complete your order details below</p>

      <div class="order-summary">
        <div class="order-summary-title">Order Summary</div>
        ${itemsHtml}
        <div class="order-summary-total">
          <span>Total</span>
          <span>$${Number(cart.totalPrice).toFixed(2)}</span>
        </div>
      </div>

      <form id="checkout-form" onsubmit="app.placeOrder(event)">
        <div class="form-group">
          <label class="form-label" for="customer-name">Full Name</label>
          <input class="form-input" type="text" id="customer-name" placeholder="John Doe" value="{nameValue}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="customer-email">Email Address</label>
          <input class="form-input" type="email" id="customer-email" placeholder="john@example.com" value="${emailValue}" required>
        </div>
        <button class="place-order-btn" type="submit" id="place-order-btn">
          Place Order — $$$${Number(cart.totalPrice).toFixed(2)}
        </button>
      </form>
    `;
  },

  /**
   * Render order confirmation
   */
  orderConfirmation(order) {
    return `
      <div class="order-success">
        <div class="order-success-icon">✅</div>
        <h2 class="order-success-title">Order Confirmed!</h2>
        <p class="order-success-id">Order #${order.id}</p>

        <div class="order-success-details">
          <div class="order-detail-row">
            <span>Customer</span>
            <span>${order.customerName}</span>
          </div>
          <div class="order-detail-row">
            <span>Email</span>
            <span>${order.customerEmail}</span>
          </div>
          <div class="order-detail-row">
            <span>Items</span>
            <span>${order.items.length} product(s)</span>
          </div>
          <div class="order-detail-row">
            <span>Status</span>
            <span style="color: var(--accent-green); font-weight: 600; text-transform: capitalize;">${order.status}</span>
          </div>
          <div class="order-detail-row" style="font-weight: 700; padding-top: 8px; border-top: 1px solid var(--border-subtle); margin-top: 8px;">
            <span>Total</span>
            <span style="color: var(--accent-green);">$${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <button class="continue-shopping-btn" onclick="app.closeCheckout(); app.toggleCart();">
          Continue Shopping
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    `;
  },

  /**
   * Render a toast notification
   */
  toast(message, icon = '✅') {
    return `
      <div class="toast">
        <span class="toast-icon">${icon}</span>
        ${message}
      </div>
    `;
  },

  // ── Auth Templates ─────────────────────────────────────────

  authLogin() {
    return `
      <div class="auth-view" id="view-login">
        <h2 class="auth-title">Welcome Back</h2>
        <form class="auth-form" onsubmit="app.handleLogin(event)">
          <div class="auth-input-group">
            <label class="auth-label" for="login-email">Email Address</label>
            <input type="email" id="login-email" class="auth-input" placeholder="you@example.com" required>
          </div>
          <div class="auth-input-group">
            <label class="auth-label" for="login-password">Password</label>
            <input type="password" id="login-password" class="auth-input" placeholder="••••••••" required>
          </div>
          <div style="text-align:right;">
            <span class="auth-link" style="font-size:0.8rem;" onclick="app.setAuthView('forgot')">Forgot Password?</span>
          </div>
          <button type="submit" class="auth-btn">Sign In</button>
        </form>
        <div class="auth-footer">
          Don't have an account? <span class="auth-link" onclick="app.setAuthView('register')">Sign Up</span>
        </div>
      </div>
    `;
  },

  authRegister() {
    return `
      <div class="auth-view" id="view-register">
        <h2 class="auth-title">Create Account</h2>
        <form class="auth-form" onsubmit="app.handleRegister(event)">
          <div class="auth-input-group">
            <label class="auth-label" for="reg-name">Full Name</label>
            <input type="text" id="reg-name" class="auth-input" placeholder="John Doe" required>
          </div>
          <div class="auth-input-group">
            <label class="auth-label" for="reg-email">Email Address</label>
            <input type="email" id="reg-email" class="auth-input" placeholder="you@example.com" required>
          </div>
          <div class="auth-input-group">
            <label class="auth-label" for="reg-password">Password</label>
            <input type="password" id="reg-password" class="auth-input" placeholder="••••••••" required>
          </div>
          <button type="submit" class="auth-btn">Create Account</button>
        </form>
        <div class="auth-footer">
          Already have an account? <span class="auth-link" onclick="app.setAuthView('login')">Sign In</span>
        </div>
      </div>
    `;
  },

  authForgot() {
    return `
      <div class="auth-view" id="view-forgot">
        <h2 class="auth-title">Reset Password</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">Enter your email to receive a reset code.</p>
        <form class="auth-form" onsubmit="app.handleForgotPassword(event)">
          <div class="auth-input-group">
            <label class="auth-label" for="forgot-email">Email Address</label>
            <input type="email" id="forgot-email" class="auth-input" placeholder="you@example.com" required>
          </div>
          <button type="submit" class="auth-btn">Send Reset Code</button>
        </form>
        <div class="auth-footer">
          Remember your password? <span class="auth-link" onclick="app.setAuthView('login')">Sign In</span>
        </div>
      </div>
    `;
  },

  authReset(email, otp) {
    return `
      <div class="auth-view" id="view-reset">
        <h2 class="auth-title">New Password</h2>
        <form class="auth-form" onsubmit="app.handleResetPassword(event)">
          <input type="hidden" id="reset-email" value="${email}">
          <input type="hidden" id="reset-otp" value="${otp}">
          <div class="auth-input-group">
            <label class="auth-label" for="reset-password">New Password</label>
            <input type="password" id="reset-password" class="auth-input" placeholder="••••••••" required>
          </div>
          <button type="submit" class="auth-btn">Reset Password</button>
        </form>
      </div>
    `;
  },

  /**
   * Render order history page
   */
  orderHistory(orders) {
    if (orders.length === 0) {
      return `
        <div class="order-history-empty">
          <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">📦</div>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">No orders yet</p>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Start shopping to place your first order</p>
        </div>
      `;
    }

    const ordersHtml = orders.map(order => {
      const itemsHtml = order.items.map(item => `
        <div class="order-history-item">
          <span>${item.quantity}× product #${item.productId}</span>
          <span>$$$${Number(item.price).toFixed(2)}</span>
        </div>
      `).join('');

      const date = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return `
        <div class="order-history-card">
          <div class="order-history-header">
            <div>
              <span class="order-history-id">Order #${order.id}</span>
              <span class="order-history-date">${date}</span>
            </div>
            <span class="order-history-status">${order.status}</span>
          </div>
          <div class="order-history-items">
            ${itemsHtml}
          </div>
          <div class="order-history-footer">
            <span class="order-history-total">Total: $${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="order-history-page">
        <div class="order-history-title">My Orders</div>
        <div class="order-history-list">
          {ordersHtml}
        </div>
      </div>
    `;
  },
};
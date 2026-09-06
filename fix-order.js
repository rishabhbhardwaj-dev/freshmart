const fs = require('fs');
let c = fs.readFileSync('public/js/components.js', 'utf8');
const start = c.indexOf('orderHistory(orders)');
const end = c.indexOf('};', start);
const method = `orderHistory(orders) {
    if (!orders || orders.length === 0) {
      return '<div class="order-history-empty"><div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">\ud83d\udce6</div><p style="color: var(--text-secondary); font-size: 1.1rem;">No orders yet</p><p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Start shopping to place your first order</p></div>';
    }
    const ordersHtml = orders.map(function(order) {
      const itemsHtml = order.items.map(function(item) {
        const name = item.product ? item.product.name : "Product #" + item.productId;
        const image = item.product ? item.product.image : "\ud83d\udce6";
        return '<div class="order-history-item"><span class="order-history-item-left"><span class="order-history-item-emoji">' + image + '</span>' + item.quantity + ' \u00d7 ' + name + '</span><span class="order-history-item-price">$' + Number(item.price).toFixed(2) + '</span></div>';
      }).join("");
      const date = new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      return '<div class="order-history-card"><div class="order-history-header"><div><span class="order-history-id">Order #' + order.id + '</span><span class="order-history-date">' + date + '</span></div><span class="order-history-status">' + order.status + '</span></div><div class="order-history-items">' + itemsHtml + '</div><div class="order-history-footer"><span class="order-history-total">Total: $' + Number(order.total).toFixed(2) + '</span></div></div>';
    }).join("");
    return '<div class="order-history-page"><div class="order-history-title">My Orders</div><div class="order-history-list">' + ordersHtml + '</div></div>';
  },
};`;
c = c.substring(0, start) + method;
fs.writeFileSync('public/js/components.js', c);
console.log('DONE');
console.log('Has order-history-card:', c.includes('order-history-card'));
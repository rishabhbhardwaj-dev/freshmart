/**
 * Cart routes — GET/POST/PUT/DELETE /api/cart
 */

const express = require('express');
const router = express.Router();
const store = require('../models/store');

// GET /api/cart
router.get('/', (req, res) => {
  try {
    const cart = store.getCart();
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cart — Add item { productId, quantity }
router.post('/', (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }
    const cart = store.addToCart(productId, quantity || 1);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/cart/:productId — Update quantity { quantity }
router.put('/:productId', (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ success: false, error: 'quantity is required' });
    }
    const cart = store.updateCartItem(req.params.productId, quantity);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/cart/:productId — Remove item
router.delete('/:productId', (req, res) => {
  try {
    const cart = store.removeFromCart(req.params.productId);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/cart — Clear cart
router.delete('/', (req, res) => {
  try {
    const cart = store.clearCart();
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

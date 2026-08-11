/**
 * Order routes — POST /api/orders, GET /api/orders, GET /api/orders/:id
 */

const express = require('express');
const router = express.Router();
const store = require('../models/store');

// POST /api/orders — Place order { customerName, customerEmail }
router.post('/', (req, res) => {
  try {
    const { customerName, customerEmail } = req.body;
    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'customerName and customerEmail are required',
      });
    }
    const order = store.placeOrder(customerName, customerEmail);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/orders
router.get('/', (req, res) => {
  try {
    const orders = store.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  try {
    const order = store.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

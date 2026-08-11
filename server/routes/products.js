/**
 * Product routes — GET /api/products, GET /api/products/:id, GET /api/categories
 */

const express = require('express');
const router = express.Router();
const store = require('../models/store');

// GET /api/products?category=Fruits
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    let products = store.getAllProducts(category || null);

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  try {
    const categories = store.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const product = store.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

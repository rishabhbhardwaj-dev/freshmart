/**
 * Product routes — GET /api/products, GET /api/products/:id, GET /api/categories
 */

const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET /api/products?category=Fruits&search=apple
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;

    const where = {};

    if (category) {
      where.category = {
        equals: category,
      };
    }

    if (search) {
      const q = search.toLowerCase();

      where.OR = [
        {
          name: {
            contains: q,
          },
        },
        {
          description: {
            contains: q,
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        id: 'asc',
      },
    });

    res.json({
      success: true,
      data: products.map(p => ({ ...p, price: Number(p.price) })),
    });
  } catch (err) {
    console.error('GET /api/products error:', err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        category: true,
      },
    });

    const categories = [...new Set(products.map((p) => p.category))];

    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    console.error('GET /api/products/categories error:', err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: { ...product, price: Number(product.price) },
    });
  } catch (err) {
    console.error('GET /api/products/:id error:', err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
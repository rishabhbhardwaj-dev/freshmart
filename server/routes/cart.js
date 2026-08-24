/**
 * Cart routes — Prisma-backed, per-user carts.
 * GET    /api/cart
 * POST   /api/cart             { productId, quantity }
 * PUT    /api/cart/:productId  { quantity }
 * DELETE /api/cart/:productId
 * DELETE /api/cart
 */

const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Helper: get or create cart for a user
async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  return cart;
}

// Helper: format cart for response (convert Decimal to Number)
function formatCart(cart) {
  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.image,
      unit: item.product.unit,
    })),
    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    ),
  };
}

// Middleware: extract userId from token (optional auth)
async function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const user = await prisma.user.findUnique({ where: { token } });
  return user || null;
}

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.json({
        success: true,
        data: { id: null, items: [], totalItems: 0, totalPrice: 0 },
      });
    }

    const cart = await getOrCreateCart(user.id);
    res.json({ success: true, data: formatCart(cart) });
  } catch (err) {
    console.error('GET /api/cart error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cart — Add item { productId, quantity }
router.post('/', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Please log in to use the cart' });
    }

    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const cart = await getOrCreateCart(user.id);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(productId),
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: quantity || 1,
        },
      });
    }

    const updatedCart = await getOrCreateCart(user.id);
    res.json({ success: true, data: formatCart(updatedCart) });
  } catch (err) {
    console.error('POST /api/cart error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/cart/:productId — Update quantity { quantity }
router.put('/:productId', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Please log in' });
    }

    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ success: false, error: 'quantity is required' });
    }

    const cart = await getOrCreateCart(user.id);

    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(req.params.productId),
        },
      },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not in cart' });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    const updatedCart = await getOrCreateCart(user.id);
    res.json({ success: true, data: formatCart(updatedCart) });
  } catch (err) {
    console.error('PUT /api/cart error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/cart/:productId — Remove item
router.delete('/:productId', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Please log in' });
    }

    const cart = await getOrCreateCart(user.id);

    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(req.params.productId),
        },
      },
    });

    if (item) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    }

    const updatedCart = await getOrCreateCart(user.id);
    res.json({ success: true, data: formatCart(updatedCart) });
  } catch (err) {
    console.error('DELETE /api/cart/:productId error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/cart — Clear cart
router.delete('/', async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Please log in' });
    }

    const cart = await getOrCreateCart(user.id);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const updatedCart = await getOrCreateCart(user.id);
    res.json({ success: true, data: formatCart(updatedCart) });
  } catch (err) {
    console.error('DELETE /api/cart error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
/**
 * Order routes — Prisma-backed.
 * POST /api/orders         { customerName, customerEmail }
 * GET  /api/orders
 * GET  /api/orders/:id
 */

const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Helper: get user from token (optional)
async function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const user = await prisma.user.findUnique({ where: { token } });
  return user || null;
}

// Helper: format order (convert Decimal to Number)
function formatOrder(order) {
  return {
    ...order,
    total: Number(order.total),
    items: order.items
      ? order.items.map((item) => ({
          ...item,
          price: Number(item.price),
        }))
      : undefined,
  };
}

// POST /api/orders — Place order { customerName, customerEmail }
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail } = req.body;
    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'customerName and customerEmail are required',
      });
    }

    const user = await getUserFromToken(req);

    // Get cart items
    let cartItems = [];
    if (user) {
      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
      cartItems = cart ? cart.items : [];
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          total,
          customerName,
          customerEmail,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Clear the cart
      if (user) {
        await tx.cartItem.deleteMany({
          where: {
            cart: { userId: user.id },
          },
        });
      }

      return newOrder;
    });

    res.status(201).json({ success: true, data: formatOrder(order) });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    let orders;
    if (user) {
      orders = await prisma.order.findMany({
        where: { customerEmail: user.email },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      orders = await prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json({
      success: true,
      data: orders.map(formatOrder),
    });
  } catch (err) {
    console.error('GET /api/orders error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: formatOrder(order) });
  } catch (err) {
    console.error('GET /api/orders/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
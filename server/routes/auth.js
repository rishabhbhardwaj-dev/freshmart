/**
 * Auth routes — Register, Login, Forgot Password, Reset Password, Me
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const prisma = require('../db');

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    const hashedPassword = hashPassword(password);
    const token = generateToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        token,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        token: user.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.error('Register error:', err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const hashedPassword = hashPassword(password);

    if (user.password !== hashedPassword) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const token = generateToken();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

    res.json({
      success: true,
      data: {
        token: updatedUser.token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const token = authHeader.split(' ')[1];

    const user = await prisma.user.findUnique({
      where: { token },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Auth me error:', err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found',
      });
    }

    const otp = generateOTP();

    const resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpires,
      },
    });

    // Mock OTP for development/testing
    res.json({
      success: true,
      message: 'OTP generated',
      mockOTP: otp,
    });
  } catch (err) {
    console.error('Forgot password error:', err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, OTP, and new password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found',
      });
    }

    if (
      user.resetOtp !== otp ||
      !user.resetOtpExpires ||
      user.resetOtpExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    const hashedPassword = hashPassword(newPassword);
    const token = generateToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        token,
        resetOtp: null,
        resetOtpExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully',
      token,
    });
  } catch (err) {
    console.error('Reset password error:', err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
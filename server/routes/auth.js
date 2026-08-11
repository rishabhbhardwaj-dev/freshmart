/**
 * Auth routes — Register, Login, Forgot Password, Reset Password, Me
 */

const express = require('express');
const router = express.Router();
const store = require('../models/store');

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }
    const user = store.registerUser(name, email, password);
    res.status(201).json({ success: true, data: { token: user.token, user: { id: user.id, name: user.name, email: user.email } } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const user = store.loginUser(email, password);
    res.json({ success: true, data: { token: user.token, user: { id: user.id, name: user.name, email: user.email } } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const user = store.getUserByToken(token);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    res.json({ success: true, data: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const otp = store.generateResetOTP(email);
    // In a real app, send email here. For mock, we return it in the response to show in the UI.
    res.json({ success: true, message: 'OTP generated', mockOTP: otp }); 
  } catch (err) {
    // Return a generic success even if user not found for security purposes in real apps, 
    // but here we can just pass the error to make it easier to test.
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required' });
    }
    
    store.resetPassword(email, otp, newPassword);
    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;

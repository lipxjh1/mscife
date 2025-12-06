/**
 * Main Routes Index
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const transactionRoutes = require('./transaction');
const notificationRoutes = require('./notification');
const adminRoutes = require('./admin');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TON Payment API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TON Payment API',
    version: '1.0.0',
    endpoints: {
      transactions: '/api/transactions',
      notifications: '/api/notifications',
      admin: '/api/admin',
      health: '/api/health'
    },
    documentation: 'https://docs.ton-payment-api.com',
    status: 'operational'
  });
});

// Mount route modules
router.use('/transactions', transactionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

// 404 handler for unmatched routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      path: req.originalUrl
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
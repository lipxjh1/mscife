/**
 * Transaction Routes
 * Defines all transaction-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { transactionRateLimit, generalRateLimit } = require('../middleware/rateLimit');
const {
  validateCreateTransaction,
  validateTransactionParams,
  sanitizeStrings
} = require('../middleware/validate');
const {
  createTransaction,
  getTransaction,
  getUserTransactions,
  cancelTransaction,
  getTransactionStats,
  confirmTransaction,
  failTransaction,
  bulkTransactionOperation
} = require('../controllers/transaction');

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Public (with optional auth)
 * @rateLimit 10 requests per minute per IP/user
 */
router.post('/',
  generalRateLimit,
  transactionRateLimit,
  sanitizeStrings,
  optionalAuth,
  validateCreateTransaction,
  createTransaction
);

/**
 * @route   GET /api/transactions
 * @desc    Get user transactions
 * @access  Private
 * @rateLimit 30 requests per minute
 */
router.get('/',
  generalRateLimit,
  verifyToken,
  getUserTransactions
);

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics
 * @access  Admin
 * @rateLimit 20 requests per minute
 */
router.get('/stats',
  generalRateLimit,
  verifyToken,
  // requireAdmin middleware would be added here
  getTransactionStats
);

/**
 * @route   POST /api/transactions/bulk
 * @desc    Bulk transaction operations (admin only)
 * @access  Admin
 * @rateLimit 5 requests per minute
 */
router.post('/bulk',
  generalRateLimit,
  verifyToken,
  // requireAdmin middleware would be added here
  sanitizeStrings,
  bulkTransactionOperation
);

/**
 * @route   GET /api/transactions/:transactionId
 * @desc    Get transaction by ID
 * @access  Private (with ownership verification)
 * @rateLimit 30 requests per minute
 */
router.get('/:transactionId',
  generalRateLimit,
  verifyToken,
  validateTransactionParams,
  getTransaction
);

/**
 * @route   POST /api/transactions/:transactionId/cancel
 * @desc    Cancel a transaction
 * @access  Private (with ownership verification)
 * @rateLimit 10 requests per minute
 */
router.post('/:transactionId/cancel',
  generalRateLimit,
  transactionRateLimit,
  verifyToken,
  validateTransactionParams,
  cancelTransaction
);

/**
 * @route   POST /api/transactions/:transactionId/confirm
 * @desc    Confirm a transaction (admin only)
 * @access  Admin
 * @rateLimit 20 requests per minute
 */
router.post('/:transactionId/confirm',
  generalRateLimit,
  verifyToken,
  // requireAdmin middleware would be added here
  validateTransactionParams,
  confirmTransaction
);

/**
 * @route   POST /api/transactions/:transactionId/fail
 * @desc    Mark transaction as failed (admin only)
 * @access  Admin
 * @rateLimit 20 requests per minute
 */
router.post('/:transactionId/fail',
  generalRateLimit,
  verifyToken,
  // requireAdmin middleware would be added here
  validateTransactionParams,
  failTransaction
);

module.exports = router;
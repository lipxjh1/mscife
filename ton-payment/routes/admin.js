/**
 * Admin Routes
 * Defines all admin-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { verifyToken } = require('../middleware/auth');
const { adminRateLimit, generalRateLimit } = require('../middleware/rateLimit');
const {
  validateUserParams,
  validateBulkTransaction,
  validateGetStats,
  sanitizeStrings
} = require('../middleware/validate');
const {
  getSystemOverview,
  getAllTransactions,
  getUserDetails,
  getAllUsers,
  getAnalytics,
  manageUser,
  exportData,
  getSystemLogs
} = require('../controllers/admin');

// Apply admin middleware to all routes
// In a real implementation, you would add:
// router.use(requireAdmin);

/**
 * @route   GET /api/admin/overview
 * @desc    Get system overview
 * @access  Admin
 * @rateLimit 20 requests per minute
 */
router.get('/overview',
  generalRateLimit,
  adminRateLimit,
  verifyToken,
  // requireAdmin middleware would be added here
  getSystemOverview
);

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions (admin view)
 * @access  Admin
 * @rateLimit 30 requests per minute
 */
router.get('/transactions',
  generalRateLimit,
  adminRateLimit,
  verifyToken,
  getAllTransactions
);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin view)
 * @access  Admin
 * @rateLimit 30 requests per minute
 */
router.get('/users',
  generalRateLimit,
  adminRateLimit,
  verifyToken,
  getAllUsers
);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user details
 * @access  Admin
 * @rateLimit 30 requests per minute
 */
router.get('/users/:userId',
  generalRateLimit,
  adminRateLimit,
  verifyToken,
  validateUserParams,
  getUserDetails
);

/**
 * @route   POST /api/admin/users/:userId/manage
 * @desc    Manage user (ban/unban/update status)
 * @access  Admin
 * @rateLimit 10 requests per minute
 */
router.post('/users/:userId/manage',
  generalRateLimit,
  adminRateLimit,
  verifyToken,
  validateUserParams,
  sanitizeStrings,
  manageUser
);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics data
 * @access  Admin
 * @rateLimit 20 requests per minute
 */
router.get('/analytics',
  generalRateLimit,
  adminRateLimit,
  verifyToken,
  getAnalytics
);

/**
 * @route   GET /api/admin/export
 * @desc    Export data
 * @access  Admin
 * @rateLimit 5 requests per minute
 */
router.get('/export',
  generalRateLimit,
  adminRateLimit,
  verifyToken,
  exportData
);

/**
 * @route   GET /api/admin/logs
 * @desc    Get system logs
 * @access  Admin
 * @rateLimit 20 requests per minute
 */
router.get('/logs',
  generalRateLimit,
  adminRateLimit,
  verifyToken,
  getSystemLogs
);

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Admin
 * @rateLimit 20 requests per minute
 */
router.get('/stats',
  generalRateLimit,
  adminRateLimit,
  verifyToken,
  validateGetStats,
  getSystemOverview
);

module.exports = router;
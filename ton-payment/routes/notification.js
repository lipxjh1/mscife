/**
 * Notification Routes
 * Defines all notification-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import middleware and controllers
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { notificationRateLimit, generalRateLimit } = require('../middleware/rateLimit');
const {
  validateMarkNotificationsRead,
  validateGetNotifications,
  sanitizeStrings
} = require('../middleware/validate');
const {
  getUserNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
  createNotification,
  broadcastNotification,
  getNotificationStats
} = require('../controllers/notification');

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 * @rateLimit 30 requests per minute
 */
router.get('/',
  generalRateLimit,
  notificationRateLimit,
  verifyToken,
  validateGetNotifications,
  getUserNotifications
);

/**
 * @route   GET /api/notifications/unread/count
 * @desc    Get unread notification count
 * @access  Private
 * @rateLimit 30 requests per minute
 */
router.get('/unread/count',
  generalRateLimit,
  verifyToken,
  getUnreadCount
);

/**
 * @route   POST /api/notifications/mark-read
 * @desc    Mark notifications as read
 * @access  Private
 * @rateLimit 20 requests per minute
 */
router.post('/mark-read',
  generalRateLimit,
  notificationRateLimit,
  verifyToken,
  sanitizeStrings,
  validateMarkNotificationsRead,
  markNotificationsAsRead
);

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 * @rateLimit 5 requests per minute
 */
router.post('/mark-all-read',
  generalRateLimit,
  verifyToken,
  markAllNotificationsAsRead
);

/**
 * @route   POST /api/notifications
 * @desc    Create notification (admin only)
 * @access  Admin
 * @rateLimit 20 requests per minute
 */
router.post('/',
  generalRateLimit,
  verifyToken,
  // requireAdmin middleware would be added here
  sanitizeStrings,
  createNotification
);

/**
 * @route   POST /api/notifications/broadcast
 * @desc    Broadcast notification to multiple users (admin only)
 * @access  Admin
 * @rateLimit 5 requests per minute
 */
router.post('/broadcast',
  generalRateLimit,
  verifyToken,
  // requireAdmin middleware would be added here
  sanitizeStrings,
  broadcastNotification
);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics (admin only)
 * @access  Admin
 * @rateLimit 20 requests per minute
 */
router.get('/stats',
  generalRateLimit,
  verifyToken,
  // requireAdmin middleware would be added here
  getNotificationStats
);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private (with ownership verification)
 * @rateLimit 30 requests per minute
 */
router.delete('/:notificationId',
  generalRateLimit,
  verifyToken,
  deleteNotification
);

module.exports = router;
/**
 * Notification Controller
 * Handles HTTP requests for notifications
 */

const { NotificationService } = require('../services');
const { successResponse, errorResponse } = require('../utils');

/**
 * Get user notifications
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : req.query.userId;
    const {
      page,
      limit,
      type,
      read,
      startDate,
      endDate
    } = req.query;

    const result = await NotificationService.getUserNotifications(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      type,
      read: read === 'true' ? true : read === 'false' ? false : undefined,
      startDate,
      endDate
    });

    res.json(
      successResponse(
        result.data,
        'Notifications retrieved successfully',
        {
          pagination: result.pagination
        }
      )
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get notifications')
    );
  }
};

/**
 * Mark notifications as read
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user.userId;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json(
        errorResponse(
          new Error('Invalid notification IDs'),
          'Notification IDs array is required'
        )
      );
    }

    const result = await NotificationService.markAsRead(notificationIds, userId);

    res.json(
      successResponse(
        {
          updated: result.updated,
          notificationIds
        },
        `${result.updated} notifications marked as read`
      )
    );
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to mark notifications as read')
    );
  }
};

/**
 * Mark all notifications as read
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await NotificationService.markAllAsRead(userId);

    res.json(
      successResponse(
        {
          updated: result.updated,
          userId
        },
        `All notifications marked as read`
      )
    );
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to mark all notifications as read')
    );
  }
};

/**
 * Get unread notification count
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : req.query.userId;

    const count = await NotificationService.getUnreadCount(userId);

    res.json(
      successResponse(
        {
          userId,
          unreadCount: count
        },
        'Unread count retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get unread count')
    );
  }
};

/**
 * Delete notification
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    await NotificationService.deleteNotification(notificationId, userId);

    res.json(
      successResponse(
        {
          notificationId,
          deleted: true
        },
        'Notification deleted successfully'
      )
    );
  } catch (error) {
    console.error('Delete notification error:', error);

    if (error.message === 'Notification not found') {
      return res.status(404).json(
        errorResponse(error, 'Notification not found')
      );
    }

    if (error.message === 'Access denied') {
      return res.status(403).json(
        errorResponse(error, 'Access denied')
      );
    }

    res.status(500).json(
      errorResponse(error, 'Failed to delete notification')
    );
  }
};

/**
 * Create notification (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createNotification = async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      data
    } = req.body;

    const { Notification } = require('../models');

    const notification = await Notification.create({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      message,
      data: data || {}
    });

    res.status(201).json(
      successResponse(
        {
          id: notification.id,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          read: notification.read,
          createdAt: notification.createdAt
        },
        'Notification created successfully'
      )
    );
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to create notification')
    );
  }
};

/**
 * Broadcast notification to multiple users (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const broadcastNotification = async (req, res) => {
  try {
    const {
      userIds,
      type,
      title,
      message,
      data
    } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json(
        errorResponse(
          new Error('Invalid user IDs'),
          'User IDs array is required'
        )
      );
    }

    const { Notification } = require('../models');
    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        const notification = await Notification.create({
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          type,
          title,
          message,
          data: data || {}
        });

        results.push({
          userId,
          notificationId: notification.id,
          success: true
        });
      } catch (error) {
        errors.push({
          userId,
          error: error.message
        });
      }
    }

    res.status(201).json(
      successResponse(
        {
          total: userIds.length,
          successful: results.length,
          failed: errors.length,
          results,
          errors
        },
        'Notification broadcast completed'
      )
    );
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to broadcast notification')
    );
  }
};

/**
 * Get notification statistics (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getNotificationStats = async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    const { storage } = require('../models');

    // Calculate time period
    const now = new Date();
    const periodStart = new Date();

    switch (period) {
      case 'hour':
        periodStart.setHours(now.getHours() - 1);
        break;
      case 'day':
        periodStart.setDate(now.getDate() - 1);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const notifications = Array.from(storage.notifications.values())
      .filter(notif => new Date(notif.createdAt) >= periodStart);

    const stats = {
      period,
      totalNotifications: notifications.length,
      readNotifications: notifications.filter(n => n.read).length,
      unreadNotifications: notifications.filter(n => !n.read).length,
      notificationsByType: {},
      averageNotificationsPerUser: 0
    };

    // Count by type
    notifications.forEach(notif => {
      stats.notificationsByType[notif.type] = (stats.notificationsByType[notif.type] || 0) + 1;
    });

    // Calculate average per user
    const uniqueUsers = new Set(notifications.map(n => n.userId)).size;
    if (uniqueUsers > 0) {
      stats.averageNotificationsPerUser = notifications.length / uniqueUsers;
    }

    res.json(
      successResponse(
        stats,
        'Notification statistics retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get notification statistics')
    );
  }
};

module.exports = {
  getUserNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
  createNotification,
  broadcastNotification,
  getNotificationStats
};
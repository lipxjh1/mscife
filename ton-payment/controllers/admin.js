/**
 * Admin Controller
 * Handles administrative operations
 */

const { TransactionService, NotificationService, UserService } = require('../services');
const { Transaction, User, storage } = require('../models');
const { successResponse, errorResponse, parseTonAmount } = require('../utils');

/**
 * Get system overview
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getSystemOverview = async (req, res) => {
  try {
    // Get statistics from different sources
    const [
      transactionStats,
      { totalUsers, activeUsers },
      { totalNotifications, unreadNotifications }
    ] = await Promise.all([
      TransactionService.getStatistics('day'),
      getUserStats(),
      getNotificationStats()
    ]);

    const overview = {
      transactions: transactionStats,
      users: {
        total: totalUsers,
        active: activeUsers
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        timestamp: new Date()
      }
    };

    res.json(
      successResponse(
        overview,
        'System overview retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get system overview error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get system overview')
    );
  }
};

/**
 * Get all transactions (admin view)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllTransactions = async (req, res) => {
  try {
    const {
      page,
      limit,
      status,
      type,
      userId,
      startDate,
      endDate
    } = req.query;

    const result = await TransactionService.getAllTransactions({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      type,
      userId,
      startDate,
      endDate
    });

    // Parse amounts for display
    const transactions = result.data.map(tx => ({
      ...tx,
      amount: parseTonAmount(tx.amount)
    }));

    res.json(
      successResponse(
        transactions,
        'Transactions retrieved successfully',
        {
          pagination: result.pagination
        }
      )
    );
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get transactions')
    );
  }
};

/**
 * Get user details
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json(
        errorResponse(
          new Error('User not found'),
          'User not found'
        )
      );
    }

    // Get user's transactions
    const transactionResult = await TransactionService.getUserTransactions(userId, { limit: 5 });

    // Get user's notifications
    const notificationResult = await NotificationService.getUserNotifications(userId, { limit: 5 });

    const userDetails = {
      ...user,
      transactionCount: transactionResult.pagination.total,
      notificationCount: notificationResult.pagination.total,
      recentTransactions: transactionResult.data.map(tx => ({
        id: tx.id,
        amount: parseTonAmount(tx.amount),
        status: tx.status,
        type: tx.type,
        createdAt: tx.createdAt
      })),
      recentNotifications: notificationResult.data.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        read: n.read,
        createdAt: n.createdAt
      }))
    };

    res.json(
      successResponse(
        userDetails,
        'User details retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get user details')
    );
  }
};

/**
 * Get all users (admin view)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page,
      limit,
      search
    } = req.query;

    const users = Array.from(storage.users.values())
      .filter(user => !search ||
        user.userId.includes(search) ||
        user.displayName.toLowerCase().includes(search.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedUsers = users.slice(startIndex, endIndex);

    // Add additional stats
    const usersWithStats = await Promise.all(
      paginatedUsers.map(async (user) => {
        const transactionResult = await TransactionService.getUserTransactions(user.userId, { limit: 1 });
        const unreadCount = await NotificationService.getUnreadCount(user.userId);

        return {
          userId: user.userId,
          displayName: user.displayName,
          email: user.email,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          transactionCount: transactionResult.pagination.total,
          unreadNotifications: unreadCount
        };
      })
    );

    res.json(
      successResponse(
        usersWithStats,
        'Users retrieved successfully',
        {
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: users.length,
            pages: Math.ceil(users.length / limitNum),
            hasNext: endIndex < users.length,
            hasPrev: pageNum > 1
          }
        }
      )
    );
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get users')
    );
  }
};

/**
 * Get analytics data
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAnalytics = async (req, res) => {
  try {
    const { period = 'week', type = 'transactions' } = req.query;

    let analytics;

    switch (type) {
      case 'transactions':
        analytics = await getTransactionAnalytics(period);
        break;
      case 'users':
        analytics = await getUserAnalytics(period);
        break;
      case 'revenue':
        analytics = await getRevenueAnalytics(period);
        break;
      default:
        throw new Error('Invalid analytics type');
    }

    res.json(
      successResponse(
        analytics,
        'Analytics data retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get analytics')
    );
  }
};

/**
 * Manage user (ban/unban/update status)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const manageUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json(
        errorResponse(
          new Error('User not found'),
          'User not found'
        )
      );
    }

    // In a real implementation, you would update user status in database
    const updatedUser = await user.update({
      status: action === 'ban' ? 'banned' : action === 'unban' ? 'active' : user.status,
      statusReason: reason,
      statusUpdatedAt: new Date()
    });

    res.json(
      successResponse(
        {
          userId: updatedUser.userId,
          status: updatedUser.status,
          statusReason: updatedUser.statusReason,
          statusUpdatedAt: updatedUser.statusUpdatedAt
        },
        `User ${action} successful`
      )
    );
  } catch (error) {
    console.error('Manage user error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to manage user')
    );
  }
};

/**
 * Export data
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const exportData = async (req, res) => {
  try {
    const { type, format = 'json', startDate, endDate } = req.query;

    let data;
    let filename;

    switch (type) {
      case 'transactions':
        data = await TransactionService.getAllTransactions({ startDate, endDate, limit: 10000 });
        filename = `transactions_${startDate || 'all'}_${endDate || 'all'}`;
        break;
      case 'users':
        data = { data: Array.from(storage.users.values()) };
        filename = `users_${startDate || 'all'}_${endDate || 'all'}`;
        break;
      default:
        throw new Error('Invalid export type');
    }

    if (format === 'csv') {
      // Convert to CSV (simplified)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      // In a real implementation, convert to CSV format
      return res.send(JSON.stringify(data));
    }

    // Default to JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.json(data);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to export data')
    );
  }
};

/**
 * Get system logs (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getSystemLogs = async (req, res) => {
  try {
    const { level = 'info', limit = 100 } = req.query;

    // In a real implementation, you would query actual logs
    const mockLogs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'Transaction confirmed successfully',
        data: { transactionId: 'txn_123' }
      },
      {
        timestamp: new Date(Date.now() - 60000),
        level: 'warning',
        message: 'Rate limit exceeded for IP',
        data: { ip: '192.168.1.1' }
      }
    ];

    const logs = mockLogs
      .filter(log => level === 'all' || log.level === level)
      .slice(0, parseInt(limit));

    res.json(
      successResponse(
        logs,
        'System logs retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get system logs')
    );
  }
};

/**
 * Helper functions
 */

async function getUserStats() {
  const users = Array.from(storage.users.values());
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const activeUsers = users.filter(user =>
    user.lastLoginAt && new Date(user.lastLoginAt) > dayAgo
  ).length;

  return {
    totalUsers: users.length,
    activeUsers
  };
}

async function getNotificationStats() {
  const notifications = Array.from(storage.notifications.values());
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return {
    totalNotifications: notifications.length,
    unreadNotifications
  };
}

async function getTransactionAnalytics(period) {
  // Mock analytics data
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 1;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      transactions: Math.floor(Math.random() * 100),
      volume: Math.random() * 10000,
      users: Math.floor(Math.random() * 50)
    });
  }

  return { type: 'transactions', period, data };
}

async function getUserAnalytics(period) {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 1;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 20),
      activeUsers: Math.floor(Math.random() * 100)
    });
  }

  return { type: 'users', period, data };
}

async function getRevenueAnalytics(period) {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 1;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.random() * 1000,
      fees: Math.random() * 50
    });
  }

  return { type: 'revenue', period, data };
}

module.exports = {
  getSystemOverview,
  getAllTransactions,
  getUserDetails,
  getAllUsers,
  getAnalytics,
  manageUser,
  exportData,
  getSystemLogs
};
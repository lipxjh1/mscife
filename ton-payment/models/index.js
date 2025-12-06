/**
 * Database Models for TON Payment Module
 * Mock implementation for demonstration
 */

// In-memory storage (replace with actual database in production)
const storage = {
  transactions: new Map(),
  notifications: new Map(),
  users: new Map(),
  statistics: {
    totalTransactions: 0,
    totalVolume: 0,
    successfulTransactions: 0,
    failedTransactions: 0
  }
};

/**
 * Transaction Model
 */
class Transaction {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.fromAddress = data.fromAddress;
    this.toAddress = data.toAddress;
    this.amount = data.amount;
    this.status = data.status || 'pending';
    this.type = data.type || 'transfer';
    this.comment = data.comment || '';
    this.payload = data.payload || '';
    this.hash = data.hash || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.confirmedAt = data.confirmedAt || null;
  }

  // Save transaction to storage
  async save() {
    storage.transactions.set(this.id, this);
    return this;
  }

  // Update transaction
  async update(updates) {
    Object.assign(this, updates, { updatedAt: new Date() });
    storage.transactions.set(this.id, this);
    return this;
  }

  // Find transaction by ID
  static async findById(id) {
    return storage.transactions.get(id) || null;
  }

  // Find transactions by user ID
  static async findByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status, type, startDate, endDate } = options;
    const transactions = Array.from(storage.transactions.values())
      .filter(tx => tx.userId === userId)
      .filter(tx => !status || tx.status === status)
      .filter(tx => !type || tx.type === type)
      .filter(tx => !startDate || new Date(tx.createdAt) >= new Date(startDate))
      .filter(tx => !endDate || new Date(tx.createdAt) <= new Date(endDate))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = transactions.slice(startIndex, endIndex);

    return {
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transactions.length,
        pages: Math.ceil(transactions.length / limit),
        hasNext: endIndex < transactions.length,
        hasPrev: page > 1
      }
    };
  }

  // Get all transactions (admin only)
  static async findAll(options = {}) {
    const { page = 1, limit = 10, status, type, startDate, endDate } = options;
    const transactions = Array.from(storage.transactions.values())
      .filter(tx => !status || tx.status === status)
      .filter(tx => !type || tx.type === type)
      .filter(tx => !startDate || new Date(tx.createdAt) >= new Date(startDate))
      .filter(tx => !endDate || new Date(tx.createdAt) <= new Date(endDate))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = transactions.slice(startIndex, endIndex);

    return {
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transactions.length,
        pages: Math.ceil(transactions.length / limit),
        hasNext: endIndex < transactions.length,
        hasPrev: page > 1
      }
    };
  }

  // Get statistics
  static async getStatistics(period = 'day') {
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

    const transactions = Array.from(storage.transactions.values())
      .filter(tx => new Date(tx.createdAt) >= periodStart);

    const stats = {
      period,
      totalTransactions: transactions.length,
      successfulTransactions: transactions.filter(tx => tx.status === 'confirmed').length,
      failedTransactions: transactions.filter(tx => tx.status === 'failed').length,
      pendingTransactions: transactions.filter(tx => tx.status === 'pending').length,
      totalVolume: transactions
        .filter(tx => tx.status === 'confirmed')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
      averageTransactionAmount: transactions.length > 0
        ? transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / transactions.length
        : 0
    };

    return stats;
  }
}

/**
 * Notification Model
 */
class Notification {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.data = data.data || {};
    this.read = data.read || false;
    this.createdAt = data.createdAt || new Date();
    this.readAt = data.readAt || null;
  }

  // Save notification to storage
  async save() {
    storage.notifications.set(this.id, this);
    return this;
  }

  // Update notification
  async update(updates) {
    Object.assign(this, updates);
    storage.notifications.set(this.id, this);
    return this;
  }

  // Mark as read
  async markAsRead() {
    this.read = true;
    this.readAt = new Date();
    storage.notifications.set(this.id, this);
    return this;
  }

  // Find notification by ID
  static async findById(id) {
    return storage.notifications.get(id) || null;
  }

  // Find notifications by user ID
  static async findByUserId(userId, options = {}) {
    const { page = 1, limit = 10, type, read, startDate, endDate } = options;
    const notifications = Array.from(storage.notifications.values())
      .filter(notif => notif.userId === userId)
      .filter(notif => !type || notif.type === type)
      .filter(notif => read === undefined || notif.read === read)
      .filter(notif => !startDate || new Date(notif.createdAt) >= new Date(startDate))
      .filter(notif => !endDate || new Date(notif.createdAt) <= new Date(endDate))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = notifications.slice(startIndex, endIndex);

    return {
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.length,
        pages: Math.ceil(notifications.length / limit),
        hasNext: endIndex < notifications.length,
        hasPrev: page > 1
      }
    };
  }

  // Mark multiple notifications as read
  static async markAsReadBulk(notificationIds) {
    let updated = 0;
    for (const id of notificationIds) {
      const notification = storage.notifications.get(id);
      if (notification && !notification.read) {
        notification.read = true;
        notification.readAt = new Date();
        storage.notifications.set(id, notification);
        updated++;
      }
    }
    return { updated };
  }

  // Create notification
  static async create(data) {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  }

  // Get unread count
  static async getUnreadCount(userId) {
    return Array.from(storage.notifications.values())
      .filter(notif => notif.userId === userId && !notif.read)
      .length;
  }
}

/**
 * User Model
 */
class User {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.email = data.email || null;
    this.displayName = data.displayName || data.userId;
    this.avatar = data.avatar || null;
    this.walletAddress = data.walletAddress || null;
    this.preferences = data.preferences || {
      notifications: {
        email: true,
        push: true,
        transaction: true,
        marketing: false
      },
      language: 'en',
      currency: 'TON'
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastLoginAt = data.lastLoginAt || null;
  }

  // Save user to storage
  async save() {
    storage.users.set(this.userId, this);
    return this;
  }

  // Update user
  async update(updates) {
    Object.assign(this, updates, { updatedAt: new Date() });
    storage.users.set(this.userId, this);
    return this;
  }

  // Find user by user ID
  static async findByUserId(userId) {
    return storage.users.get(userId) || null;
  }

  // Find user by wallet address
  static async findByWalletAddress(walletAddress) {
    return Array.from(storage.users.values())
      .find(user => user.walletAddress === walletAddress) || null;
  }

  // Update last login
  async updateLastLogin() {
    this.lastLoginAt = new Date();
    storage.users.set(this.userId, this);
    return this;
  }
}

module.exports = {
  Transaction,
  Notification,
  User,
  storage // Export storage for testing/debugging
};
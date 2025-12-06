/**
 * Utility Functions for TON Payment Module
 */

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

/**
 * Success response helper
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {Object} meta - Additional metadata
 */
const successResponse = (data = null, message = 'Success', meta = {}) => {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
};

/**
 * Error response helper
 * @param {Error} error - Error object
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 */
const errorResponse = (error, message = 'Internal server error', details = {}) => {
  const statusCode = error.statusCode || 500;

  return {
    success: false,
    error: {
      code: error.name || 'INTERNAL_ERROR',
      message: error.message || message,
      details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Parse TON amount from nanotons
 * @param {string|number} amount - Amount in nanotons
 * @returns {number} Amount in TON
 */
const parseTonAmount = (amount) => {
  if (!amount) return 0;
  return parseFloat(amount) / 1e9;
};

/**
 * Convert TON to nanotons
 * @param {number} amount - Amount in TON
 * @returns {string} Amount in nanotons
 */
const toNano = (amount) => {
  if (!amount) return '0';
  return (parseFloat(amount) * 1e9).toString();
};

/**
 * Generate random transaction ID
 * @returns {string} Transaction ID
 */
const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate TON address format
 * @param {string} address - TON address
 * @returns {boolean} True if valid
 */
const isValidTonAddress = (address) => {
  // Basic validation - TON addresses start with 0: followed by hex
  return /^0:[a-fA-F0-9]{64}$/.test(address);
};

/**
 * Sleep utility for delays
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry utility
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Delay between retries
 */
const retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }

  throw lastError;
};

/**
 * Format timestamp
 * @param {Date|string|number} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return new Date().toISOString();

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toISOString();
};

/**
 * Paginate results
 * @param {Array} data - Data to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const results = data.slice(startIndex, endIndex);

  return {
    data: results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: data.length,
      pages: Math.ceil(data.length / limit),
      hasNext: endIndex < data.length,
      hasPrev: page > 1
    }
  };
};

module.exports = {
  // Error classes
  ValidationError,
  DatabaseError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,

  // Response helpers
  successResponse,
  errorResponse,

  // TON utilities
  parseTonAmount,
  toNano,
  generateTransactionId,
  isValidTonAddress,

  // General utilities
  sleep,
  retry,
  formatTimestamp,
  paginate
};
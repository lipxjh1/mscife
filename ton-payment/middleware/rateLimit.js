/**
 * Rate Limiting Middleware
 * Controls request frequency to prevent abuse
 */

const rateLimit = require('express-rate-limit');
const { successResponse, errorResponse } = require('../utils');

/**
 * Store for tracking rate limits in memory
 * In production, use Redis or similar for distributed systems
 */
const store = new Map();

/**
 * Custom rate limiter implementation
 * @param {Object} options - Rate limit options
 */
const createRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or create rate limit data for this key
    let rateLimitData = store.get(key);
    if (!rateLimitData) {
      rateLimitData = {
        requests: [],
        totalRequests: 0
      };
      store.set(key, rateLimitData);
    }

    // Clean old requests outside the window
    rateLimitData.requests = rateLimitData.requests.filter(
      timestamp => now - timestamp < windowMs
    );

    // Check if limit exceeded
    if (rateLimitData.requests.length >= max) {
      const resetTime = Math.ceil(
        (rateLimitData.requests[0] + windowMs - now) / 1000
      );

      return res.status(429).json(
        errorResponse(
          new Error('RATE_LIMIT_EXCEEDED'),
          message,
          {
            limit: max,
            windowMs,
            resetIn: resetTime,
            retryAfter: resetTime
          }
        )
      );
    }

    // Record this request
    rateLimitData.requests.push(now);
    rateLimitData.totalRequests++;

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - rateLimitData.requests.length),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });

    next();
  };
};

/**
 * Pre-configured rate limiters for different endpoints
 */

// General API rate limit
const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});

// Transaction endpoints - stricter rate limiting
const transactionRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many transaction requests, please try again after 1 minute.',
  keyGenerator: (req) => {
    // Rate limit by both IP and user ID if authenticated
    if (req.user && req.user.userId) {
      return `user:${req.user.userId}`;
    }
    return req.ip;
  }
});

// Notification endpoints rate limit
const notificationRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many notification requests, please try again after 1 minute.'
});

// Admin endpoints - very strict rate limiting
const adminRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many admin requests, please try again after 15 minutes.',
  keyGenerator: (req) => {
    if (req.user && req.user.userId) {
      return `admin:${req.user.userId}`;
    }
    return req.ip;
  }
});

// Health check - very permissive
const healthCheckRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  message: 'Too many health check requests.'
});

/**
 * Rate limit by user ID for authenticated routes
 * @param {Object} options - Rate limit options
 */
const createUserRateLimit = (options = {}) => {
  return createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    keyGenerator: (req) => {
      // Must be authenticated
      if (!req.user || !req.user.userId) {
        return req.ip; // Fallback to IP
      }
      return `user:${req.user.userId}`;
    },
    ...options
  });
};

/**
 * Rate limit by wallet address
 * @param {Object} options - Rate limit options
 */
const createWalletRateLimit = (options = {}) => {
  return createRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    message: 'Too many requests for this wallet, please try again after 5 minutes.',
    keyGenerator: (req) => {
      // Try to get wallet from request body or params
      const wallet = req.body?.walletAddress || req.params?.walletAddress || req.query?.walletAddress;
      if (wallet) {
        return `wallet:${wallet}`;
      }
      return req.ip;
    },
    ...options
  });
};

/**
 * Cleanup expired entries from the store
 * Should be called periodically in production
 */
const cleanupStore = () => {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    // Remove entries with no recent requests (older than 1 hour)
    const oldestRequest = Math.min(...data.requests);
    if (now - oldestRequest > 60 * 60 * 1000) {
      store.delete(key);
    }
  }
};

// Schedule cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupStore, 5 * 60 * 1000);
}

module.exports = {
  createRateLimit,
  generalRateLimit,
  transactionRateLimit,
  notificationRateLimit,
  adminRateLimit,
  healthCheckRateLimit,
  createUserRateLimit,
  createWalletRateLimit,
  cleanupStore
};
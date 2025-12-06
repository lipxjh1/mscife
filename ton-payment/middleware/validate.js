/**
 * Validation Middleware
 * Validates request inputs using Joi schemas
 */

const Joi = require('joi');
const { ValidationError, errorResponse } = require('../utils');

/**
 * Create validation middleware
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Return all errors
      allowUnknown: false, // Reject unknown fields
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json(
        errorResponse(
          new ValidationError('Validation failed'),
          'Invalid request data',
          { details }
        )
      );
    }

    // Replace the data with validated and cleaned data
    req[source] = value;
    next();
  };
};

/**
 * Common validation schemas
 */

// TON address validation
const tonAddressSchema = Joi.string()
  .pattern(/^0:[a-fA-F0-9]{64}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid TON address format',
    'any.required': 'TON address is required'
  });

// Transaction amount validation
const amountSchema = Joi.number()
  .positive()
  .min(0.000000001)
  .max(1000000)
  .precision(9)
  .required()
  .messages({
    'number.positive': 'Amount must be positive',
    'number.min': 'Minimum amount is 0.000000001 TON',
    'number.max': 'Maximum amount is 1,000,000 TON',
    'any.required': 'Amount is required'
  });

// User ID validation
const userIdSchema = Joi.string()
  .alphanum()
  .min(3)
  .max(50)
  .required()
  .messages({
    'string.alphanum': 'User ID must contain only alphanumeric characters',
    'string.min': 'User ID must be at least 3 characters',
    'string.max': 'User ID must not exceed 50 characters',
    'any.required': 'User ID is required'
  });

// Transaction ID validation
const transactionIdSchema = Joi.string()
  .pattern(/^txn_\d+_[a-z0-9]+$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid transaction ID format',
    'any.required': 'Transaction ID is required'
  });

// Notification type validation
const notificationTypeSchema = Joi.string()
  .valid('transaction_pending', 'transaction_confirmed', 'transaction_failed', 'payment_received', 'payment_sent')
  .required()
  .messages({
    'any.only': 'Invalid notification type',
    'any.required': 'Notification type is required'
  });

// Pagination validation
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

// Date range validation
const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
});

/**
 * Transaction validation schemas
 */

// Create transaction request
const createTransactionSchema = Joi.object({
  userId: userIdSchema,
  fromAddress: tonAddressSchema,
  toAddress: tonAddressSchema,
  amount: amountSchema,
  comment: Joi.string().max(255).optional().allow(''),
  payload: Joi.string().max(1024).optional().allow('')
});

// Get transactions query
const getTransactionsQuerySchema = Joi.object({
  userId: userIdSchema.optional(),
  status: Joi.string().valid('pending', 'confirmed', 'failed', 'cancelled').optional(),
  type: Joi.string().valid('deposit', 'withdrawal', 'transfer').optional(),
  page: paginationSchema.extract('page'),
  limit: paginationSchema.extract('limit'),
  startDate: dateRangeSchema.extract('startDate'),
  endDate: dateRangeSchema.extract('endDate')
});

// Transaction params
const transactionParamsSchema = Joi.object({
  transactionId: transactionIdSchema
});

/**
 * Notification validation schemas
 */

// Mark notification as read
const markNotificationReadSchema = Joi.object({
  notificationIds: Joi.array().items(Joi.string()).min(1).required()
});

// Get notifications query
const getNotificationsQuerySchema = Joi.object({
  userId: userIdSchema,
  type: notificationTypeSchema.optional(),
  read: Joi.boolean().optional(),
  page: paginationSchema.extract('page'),
  limit: paginationSchema.extract('limit'),
  startDate: dateRangeSchema.extract('startDate'),
  endDate: dateRangeSchema.extract('endDate')
});

/**
 * User validation schemas
 */

// User profile update
const updateUserProfileSchema = Joi.object({
  displayName: Joi.string().max(100).optional(),
  email: Joi.string().email().optional(),
  avatar: Joi.string().uri().optional()
});

// User preferences
const updateUserPreferencesSchema = Joi.object({
  notifications: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    transaction: Joi.boolean().optional(),
    marketing: Joi.boolean().optional()
  }).optional(),
  language: Joi.string().valid('en', 'vi', 'zh', 'ja', 'ko').optional(),
  currency: Joi.string().valid('TON', 'USD', 'EUR', 'BTC', 'ETH').optional()
});

/**
 * Admin validation schemas
 */

// Admin bulk operations
const bulkTransactionSchema = Joi.object({
  action: Joi.string().valid('confirm', 'cancel', 'retry').required(),
  transactionIds: Joi.array().items(transactionIdSchema).min(1).max(100).required(),
  reason: Joi.string().max(500).optional()
});

// Admin statistics query
const getStatsQuerySchema = Joi.object({
  period: Joi.string().valid('hour', 'day', 'week', 'month', 'year').default('day'),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional()
});

/**
 * Pre-built validation middleware
 */

// Transaction validations
const validateCreateTransaction = validate(createTransactionSchema);
const validateGetTransactions = [
  validate(getTransactionsQuerySchema, 'query'),
  validate(transactionParamsSchema, 'params')
];
const validateTransactionParams = validate(transactionParamsSchema, 'params');

// Notification validations
const validateMarkNotificationsRead = validate(markNotificationReadSchema);
const validateGetNotifications = validate(getNotificationsQuerySchema, 'query');

// User validations
const validateUpdateProfile = validate(updateUserProfileSchema);
const validateUpdatePreferences = validate(updateUserPreferencesSchema);

// Admin validations
const validateBulkTransaction = validate(bulkTransactionSchema);
const validateGetStats = validate(getStatsQuerySchema, 'query');
const validateUserParams = validate(Joi.object({ userId: userIdSchema }), 'params');

/**
 * Custom validation functions
 */

// Validate TON address format
const validateTonAddress = (req, res, next) => {
  const { walletAddress } = req.body || req.params || req.query;

  if (!walletAddress) {
    return next();
  }

  if (!/^0:[a-fA-F0-9]{64}$/.test(walletAddress)) {
    return res.status(400).json(
      errorResponse(
        new ValidationError('Invalid TON address'),
        'TON address must be in format 0:<64 hex characters>'
      )
    );
  }

  next();
};

// Validate transaction amount range
const validateTransactionAmount = (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    return next();
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json(
      errorResponse(
        new ValidationError('Invalid amount'),
        'Amount must be a positive number'
      )
    );
  }

  if (numAmount > 1000000) {
    return res.status(400).json(
      errorResponse(
        new ValidationError('Amount too large'),
        'Maximum transaction amount is 1,000,000 TON'
      )
    );
  }

  next();
};

// Sanitize input strings
const sanitizeStrings = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS attacks
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};

module.exports = {
  // Main validation function
  validate,

  // Schema definitions
  schemas: {
    tonAddress: tonAddressSchema,
    amount: amountSchema,
    userId: userIdSchema,
    transactionId: transactionIdSchema,
    notificationType: notificationTypeSchema,
    pagination: paginationSchema,
    dateRange: dateRangeSchema,
    createTransaction: createTransactionSchema,
    getTransactionsQuery: getTransactionsQuerySchema,
    transactionParams: transactionParamsSchema,
    markNotificationRead: markNotificationReadSchema,
    getNotificationsQuery: getNotificationsQuerySchema,
    updateUserProfile: updateUserProfileSchema,
    updateUserPreferences: updateUserPreferencesSchema,
    bulkTransaction: bulkTransactionSchema,
    getStatsQuery: getStatsQuerySchema
  },

  // Pre-built middleware
  validateCreateTransaction,
  validateGetTransactions,
  validateTransactionParams,
  validateMarkNotificationsRead,
  validateGetNotifications,
  validateUpdateProfile,
  validateUpdatePreferences,
  validateBulkTransaction,
  validateGetStats,
  validateUserParams,

  // Custom validators
  validateTonAddress,
  validateTransactionAmount,
  sanitizeStrings
};
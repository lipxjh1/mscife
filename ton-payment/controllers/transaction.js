/**
 * Transaction Controller
 * Handles HTTP requests for transactions
 */

const { TransactionService } = require('../services');
const { successResponse, errorResponse, parseTonAmount } = require('../utils');

/**
 * Create a new transaction
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createTransaction = async (req, res) => {
  try {
    const { userId, fromAddress, toAddress, amount, comment, payload } = req.body;

    // Ensure user can only create transactions for themselves
    const transactionUserId = req.user ? req.user.userId : userId;

    const transaction = await TransactionService.createTransaction({
      userId: transactionUserId,
      fromAddress,
      toAddress,
      amount,
      comment,
      payload
    });

    res.status(201).json(
      successResponse(
        {
          id: transaction.id,
          userId: transaction.userId,
          fromAddress: transaction.fromAddress,
          toAddress: transaction.toAddress,
          amount: parseTonAmount(transaction.amount),
          status: transaction.status,
          type: transaction.type,
          comment: transaction.comment,
          createdAt: transaction.createdAt
        },
        'Transaction created successfully'
      )
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(400).json(
      errorResponse(error, 'Failed to create transaction')
    );
  }
};

/**
 * Get transaction by ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user ? req.user.userId : null;

    const transaction = await TransactionService.getTransaction(transactionId, userId);

    res.json(
      successResponse(
        {
          id: transaction.id,
          userId: transaction.userId,
          fromAddress: transaction.fromAddress,
          toAddress: transaction.toAddress,
          amount: parseTonAmount(transaction.amount),
          status: transaction.status,
          type: transaction.type,
          comment: transaction.comment,
          hash: transaction.hash,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          confirmedAt: transaction.confirmedAt,
          failureReason: transaction.failureReason
        },
        'Transaction retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get transaction error:', error);

    if (error.message === 'Transaction not found') {
      return res.status(404).json(
        errorResponse(error, 'Transaction not found')
      );
    }

    if (error.message === 'Access denied') {
      return res.status(403).json(
        errorResponse(error, 'Access denied')
      );
    }

    res.status(500).json(
      errorResponse(error, 'Failed to get transaction')
    );
  }
};

/**
 * Get user transactions
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : req.query.userId;
    const {
      page,
      limit,
      status,
      type,
      startDate,
      endDate
    } = req.query;

    const result = await TransactionService.getUserTransactions(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      type,
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
    console.error('Get user transactions error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get transactions')
    );
  }
};

/**
 * Cancel transaction
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const cancelTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const transaction = await TransactionService.cancelTransaction(transactionId, userId);

    res.json(
      successResponse(
        {
          id: transaction.id,
          status: transaction.status,
          cancelledAt: transaction.cancelledAt
        },
        'Transaction cancelled successfully'
      )
    );
  } catch (error) {
    console.error('Cancel transaction error:', error);

    if (error.message === 'Transaction not found') {
      return res.status(404).json(
        errorResponse(error, 'Transaction not found')
      );
    }

    if (error.message === 'Access denied') {
      return res.status(403).json(
        errorResponse(error, 'Access denied')
      );
    }

    if (error.message === 'Transaction cannot be cancelled') {
      return res.status(400).json(
        errorResponse(error, 'Transaction cannot be cancelled')
      );
    }

    res.status(500).json(
      errorResponse(error, 'Failed to cancel transaction')
    );
  }
};

/**
 * Get transaction statistics (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getTransactionStats = async (req, res) => {
  try {
    const { period = 'day' } = req.query;

    const stats = await TransactionService.getStatistics(period);

    res.json(
      successResponse(
        stats,
        'Transaction statistics retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to get transaction statistics')
    );
  }
};

/**
 * Confirm transaction (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const confirmTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { hash } = req.body;

    if (!hash) {
      return res.status(400).json(
        errorResponse(
          new Error('Missing transaction hash'),
          'Transaction hash is required'
        )
      );
    }

    const transaction = await TransactionService.confirmTransaction(transactionId, hash);

    res.json(
      successResponse(
        {
          id: transaction.id,
          status: transaction.status,
          hash: transaction.hash,
          confirmedAt: transaction.confirmedAt
        },
        'Transaction confirmed successfully'
      )
    );
  } catch (error) {
    console.error('Confirm transaction error:', error);

    if (error.message === 'Transaction not found') {
      return res.status(404).json(
        errorResponse(error, 'Transaction not found')
      );
    }

    if (error.message === 'Transaction cannot be confirmed') {
      return res.status(400).json(
        errorResponse(error, 'Transaction cannot be confirmed')
      );
    }

    res.status(500).json(
      errorResponse(error, 'Failed to confirm transaction')
    );
  }
};

/**
 * Fail transaction (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const failTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json(
        errorResponse(
          new Error('Missing failure reason'),
          'Failure reason is required'
        )
      );
    }

    const transaction = await TransactionService.failTransaction(transactionId, reason);

    res.json(
      successResponse(
        {
          id: transaction.id,
          status: transaction.status,
          failureReason: transaction.failureReason
        },
        'Transaction marked as failed'
      )
    );
  } catch (error) {
    console.error('Fail transaction error:', error);

    if (error.message === 'Transaction not found') {
      return res.status(404).json(
        errorResponse(error, 'Transaction not found')
      );
    }

    if (error.message === 'Transaction cannot be failed') {
      return res.status(400).json(
        errorResponse(error, 'Transaction cannot be failed')
      );
    }

    res.status(500).json(
      errorResponse(error, 'Failed to fail transaction')
    );
  }
};

/**
 * Bulk transaction operations (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const bulkTransactionOperation = async (req, res) => {
  try {
    const { action, transactionIds, reason } = req.body;

    if (!action || !transactionIds || !Array.isArray(transactionIds)) {
      return res.status(400).json(
        errorResponse(
          new Error('Invalid request'),
          'Action and transactionIds array are required'
        )
      );
    }

    const results = [];
    const errors = [];

    for (const transactionId of transactionIds) {
      try {
        let result;
        switch (action) {
          case 'confirm':
            result = await TransactionService.confirmTransaction(transactionId, req.body.hash);
            break;
          case 'fail':
            result = await TransactionService.failTransaction(transactionId, reason);
            break;
          default:
            throw new Error('Invalid action');
        }
        results.push({
          transactionId,
          success: true,
          status: result.status
        });
      } catch (error) {
        errors.push({
          transactionId,
          error: error.message
        });
      }
    }

    res.json(
      successResponse(
        {
          processed: transactionIds.length,
          successful: results.length,
          failed: errors.length,
          results,
          errors
        },
        `Bulk ${action} operation completed`
      )
    );
  } catch (error) {
    console.error('Bulk transaction operation error:', error);
    res.status(500).json(
      errorResponse(error, 'Failed to perform bulk operation')
    );
  }
};

module.exports = {
  createTransaction,
  getTransaction,
  getUserTransactions,
  cancelTransaction,
  getTransactionStats,
  confirmTransaction,
  failTransaction,
  bulkTransactionOperation
};
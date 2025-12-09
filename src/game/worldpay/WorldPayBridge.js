/**
 * WorldPayBridge
 * ===============
 * Bridge giữa Phaser Game Scenes và World Pay React Module
 *
 * Sử dụng EventBus để giao tiếp giữa Phaser và React:
 * - Phaser emits "world-pay-request" → React handles payment
 * - React emits "world-pay-success/error" → Phaser receives result
 *
 * @example
 * // Trong Phaser Scene:
 * import { WorldPayBridge } from '../../worldpay/WorldPayBridge';
 *
 * class ShopScene extends Phaser.Scene {
 *   create() {
 *     // Setup listeners
 *     WorldPayBridge.onPaymentResult(
 *       (data) => this.onPaymentSuccess(data),
 *       (data) => this.onPaymentError(data)
 *     );
 *
 *     // Request payment
 *     WorldPayBridge.requestPayment(1000, 'WLD');
 *   }
 *
 *   shutdown() {
 *     WorldPayBridge.cleanup();
 *   }
 * }
 */

import { EventBus } from '../EventBus';

// ============================================
// EVENT NAMES
// ============================================

const EVENTS = {
  // Phaser → React
  REQUEST: 'world-pay-request',

  // React → Phaser
  SUCCESS: 'world-pay-success',
  ERROR: 'world-pay-error',
  STATUS: 'world-pay-status',

  // Optional: Loading state
  LOADING_SHOW: 'world-pay-loading-show',
  LOADING_HIDE: 'world-pay-loading-hide',
};

// ============================================
// WORLDPAY BRIDGE CLASS
// ============================================

export class WorldPayBridge {

  // Store callbacks for cleanup
  static _successCallback = null;
  static _errorCallback = null;
  static _statusCallback = null;

  // ============================================
  // REQUEST PAYMENT (Phaser → React)
  // ============================================

  /**
   * Request payment từ Phaser scene
   * React App.jsx sẽ listen và xử lý payment
   *
   * @param {number} muskAmount - Số MUSK muốn mua
   * @param {string} currency - 'WLD' hoặc 'USDC' (default: 'WLD')
   * @param {object} options - Optional settings
   * @param {number} options.packageId - ID của package (nếu dùng predefined packages)
   * @param {boolean} options.showLoading - Hiển thị loading UI (default: true)
   */
  static requestPayment(muskAmount, currency = 'WLD', options = {}) {
    const { packageId = null, showLoading = true } = options;

    console.log('[WorldPayBridge] 📤 Requesting payment:', {
      muskAmount,
      currency,
      packageId,
      showLoading
    });

    // Emit loading state if needed
    if (showLoading) {
      EventBus.emit(EVENTS.LOADING_SHOW, {
        message: 'Đang xử lý thanh toán...',
      });
    }

    // Emit payment request to React
    EventBus.emit(EVENTS.REQUEST, {
      muskAmount,
      currency,
      packageId,
      timestamp: Date.now(),
    });
  }

  /**
   * Request payment với package ID
   * Dùng khi user chọn từ danh sách packages
   *
   * @param {number} packageId - ID của payment package
   * @param {string} currency - 'WLD' hoặc 'USDC'
   */
  static requestPaymentByPackage(packageId, currency = 'WLD') {
    console.log('[WorldPayBridge] 📤 Requesting payment by package:', { packageId, currency });

    EventBus.emit(EVENTS.LOADING_SHOW, {
      message: 'Đang xử lý thanh toán...',
    });

    EventBus.emit(EVENTS.REQUEST, {
      packageId,
      currency,
      muskAmount: null, // Backend sẽ xác định từ packageId
      timestamp: Date.now(),
    });
  }

  // ============================================
  // LISTEN FOR RESULTS (React → Phaser)
  // ============================================

  /**
   * Setup listeners cho payment results
   * Gọi trong scene.create() và cleanup trong scene.shutdown()
   *
   * @param {Function} onSuccess - Callback khi payment thành công
   * @param {Function} onError - Callback khi payment thất bại
   * @param {Function} onStatus - Optional callback cho status updates
   *
   * @example
   * WorldPayBridge.onPaymentResult(
   *   (data) => {
   *     console.log('Success! MUSK credited:', data.muskCredited);
   *     this.updateBalanceDisplay(data.newBalance);
   *   },
   *   (data) => {
   *     console.log('Failed:', data.error);
   *     this.showErrorPopup(data.error);
   *   },
   *   (data) => {
   *     console.log('Status:', data.status);
   *   }
   * );
   */
  static onPaymentResult(onSuccess, onError, onStatus = null) {
    // Cleanup existing listeners first
    this.cleanup();

    // Success handler
    if (onSuccess && typeof onSuccess === 'function') {
      this._successCallback = (data) => {
        console.log('[WorldPayBridge] 📥 Payment SUCCESS:', data);

        // Hide loading
        EventBus.emit(EVENTS.LOADING_HIDE);

        // Call success callback
        onSuccess(data);
      };
      EventBus.on(EVENTS.SUCCESS, this._successCallback);
    }

    // Error handler
    if (onError && typeof onError === 'function') {
      this._errorCallback = (data) => {
        console.log('[WorldPayBridge] 📥 Payment ERROR:', data);

        // Hide loading
        EventBus.emit(EVENTS.LOADING_HIDE);

        // Call error callback
        onError(data);
      };
      EventBus.on(EVENTS.ERROR, this._errorCallback);
    }

    // Status handler (optional)
    if (onStatus && typeof onStatus === 'function') {
      this._statusCallback = (data) => {
        console.log('[WorldPayBridge] 📥 Payment STATUS:', data);
        onStatus(data);
      };
      EventBus.on(EVENTS.STATUS, this._statusCallback);
    }

    console.log('[WorldPayBridge] ✅ Listeners registered');
  }

  /**
   * Listen only for success events
   * @param {Function} callback
   */
  static onSuccess(callback) {
    if (this._successCallback) {
      EventBus.off(EVENTS.SUCCESS, this._successCallback);
    }
    this._successCallback = callback;
    EventBus.on(EVENTS.SUCCESS, callback);
  }

  /**
   * Listen only for error events
   * @param {Function} callback
   */
  static onError(callback) {
    if (this._errorCallback) {
      EventBus.off(EVENTS.ERROR, this._errorCallback);
    }
    this._errorCallback = callback;
    EventBus.on(EVENTS.ERROR, callback);
  }

  /**
   * Listen only for status events
   * @param {Function} callback
   */
  static onStatus(callback) {
    if (this._statusCallback) {
      EventBus.off(EVENTS.STATUS, this._statusCallback);
    }
    this._statusCallback = callback;
    EventBus.on(EVENTS.STATUS, callback);
  }

  // ============================================
  // EMIT RESULTS (Called from React)
  // ============================================

  /**
   * Emit success event (gọi từ React sau khi payment thành công)
   * @param {object} data - Payment result data
   */
  static emitSuccess(data) {
    console.log('[WorldPayBridge] 📤 Emitting SUCCESS to Phaser:', data);
    EventBus.emit(EVENTS.SUCCESS, {
      muskCredited: data.muskCredited || 0,
      newBalance: data.newBalance || null,
      transactionHash: data.transactionHash || null,
      depositId: data.depositId || null,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit error event (gọi từ React khi payment thất bại)
   * @param {object} data - Error data
   */
  static emitError(data) {
    console.log('[WorldPayBridge] 📤 Emitting ERROR to Phaser:', data);
    EventBus.emit(EVENTS.ERROR, {
      error: data.error || 'Unknown error',
      code: data.code || null,
      depositId: data.depositId || null,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit status update (gọi từ React để update progress)
   * @param {string} status - Status: 'creating' | 'pending' | 'confirming'
   * @param {string} message - Human-readable message
   */
  static emitStatus(status, message = '') {
    console.log('[WorldPayBridge] 📤 Emitting STATUS to Phaser:', { status, message });
    EventBus.emit(EVENTS.STATUS, {
      status,
      message: message || this.getStatusMessage(status),
      timestamp: Date.now(),
    });
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Remove all listeners
   * QUAN TRỌNG: Gọi trong scene.shutdown() để tránh memory leaks
   */
  static cleanup() {
    console.log('[WorldPayBridge] 🧹 Cleaning up listeners');

    if (this._successCallback) {
      EventBus.off(EVENTS.SUCCESS, this._successCallback);
      this._successCallback = null;
    }

    if (this._errorCallback) {
      EventBus.off(EVENTS.ERROR, this._errorCallback);
      this._errorCallback = null;
    }

    if (this._statusCallback) {
      EventBus.off(EVENTS.STATUS, this._statusCallback);
      this._statusCallback = null;
    }
  }

  /**
   * Alias for cleanup (backward compatibility)
   */
  static removeListeners() {
    this.cleanup();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get human-readable status message
   * @param {string} status
   * @returns {string}
   */
  static getStatusMessage(status) {
    const messages = {
      'idle': 'Sẵn sàng',
      'creating': 'Đang tạo giao dịch...',
      'pending': 'Vui lòng xác nhận trong World App...',
      'confirming': 'Đang xác nhận thanh toán...',
      'success': 'Thanh toán thành công!',
      'error': 'Thanh toán thất bại',
    };
    return messages[status] || status;
  }

  /**
   * Get event names (for debugging/external use)
   */
  static getEventNames() {
    return { ...EVENTS };
  }

  /**
   * Check if listeners are registered
   */
  static hasListeners() {
    return !!(this._successCallback || this._errorCallback);
  }
}

// ============================================
// HELPER FUNCTIONS (Alternative API)
// ============================================

/**
 * Quick function to request payment
 * @param {number} muskAmount
 * @param {string} currency
 */
export function requestWorldPayment(muskAmount, currency = 'WLD') {
  WorldPayBridge.requestPayment(muskAmount, currency);
}

/**
 * Quick function to setup listeners
 * @param {Function} onSuccess
 * @param {Function} onError
 */
export function onWorldPayResult(onSuccess, onError) {
  WorldPayBridge.onPaymentResult(onSuccess, onError);
}

/**
 * Quick function to cleanup
 */
export function cleanupWorldPay() {
  WorldPayBridge.cleanup();
}

// ============================================
// EXPORT
// ============================================

export { EVENTS as WORLD_PAY_EVENTS };
export default WorldPayBridge;
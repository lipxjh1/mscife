/**
 * useWorldPayHandler
 * ===================
 * Custom hook để xử lý World Pay requests từ Phaser game
 *
 * Hook này:
 * 1. Listen event 'world-pay-request' từ EventBus
 * 2. Gọi World Pay Service để xử lý payment
 * 3. Emit kết quả về Phaser qua WorldPayBridge
 *
 * @example
 * // Trong App.jsx:
 * import { useWorldPayHandler } from './hooks/useWorldPayHandler';
 *
 * function App() {
 *   useWorldPayHandler(); // Tự động setup listeners
 *   return <...>;
 * }
 */

import { useEffect, useCallback, useRef } from 'react';
import { EventBus } from '../game/EventBus';
import { useWorldPay } from '../worldpay';
import { WorldPayBridge } from '../game/worldpay/WorldPayBridge';

// Debug mode
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[WorldPayHandler]', ...args);

export function useWorldPayHandler() {
  // Get pay function from useWorldPay hook
  const { pay, isAvailable, status, reset } = useWorldPay();

  // Track if payment is in progress to prevent double-clicks
  const isProcessingRef = useRef(false);

  /**
   * Handle payment request from Phaser
   */
  const handleWorldPayRequest = useCallback(async (data) => {
    console.log('🔍 [WorldPayHandler] ========== HANDLER START ==========');
    console.log('🔍 [WorldPayHandler] Received request:', { muskAmount: data?.muskAmount, currency: data?.currency, packageId: data?.packageId });
    console.log('🔍 [WorldPayHandler] Full data:', JSON.stringify(data, null, 2));
    log('📥 Received payment request:', data);

    // Prevent double processing
    if (isProcessingRef.current) {
      console.log('🔍 [WorldPayHandler] ⚠️ Payment already in progress, ignoring request');
      log('⚠️ Payment already in progress, ignoring request');
      return;
    }

    // Extract data
    const { muskAmount, currency = 'WLD', packageId } = data || {};

    // Validate
    if (!muskAmount || muskAmount <= 0) {
      console.log('🔍 [WorldPayHandler] ❌ Invalid muskAmount:', muskAmount);
      log('❌ Invalid muskAmount:', muskAmount);
      WorldPayBridge.emitError({
        error: 'Invalid amount. Please specify a valid MUSK amount.',
        code: 'INVALID_AMOUNT',
      });
      return;
    }

    // Check availability
    if (!isAvailable) {
      console.log('🔍 [WorldPayHandler] ❌ World Pay not available (not in World App)');
      console.log('🔍 [WorldPayHandler] isAvailable:', isAvailable);
      log('❌ World Pay not available (not in World App)');
      WorldPayBridge.emitError({
        error: 'Please open this app in World App to make payments.',
        code: 'NOT_AVAILABLE',
      });
      return;
    }

    // Start processing
    isProcessingRef.current = true;
    console.log('🔍 [WorldPayHandler] 🚀 Starting payment flow...', { muskAmount, currency });
    console.log('🔍 [WorldPayHandler] isProcessingRef set to true');
    log('🚀 Starting payment flow...', { muskAmount, currency });

    try {
      // Emit status update
      console.log('🔍 [WorldPayHandler] Emitting status: creating');
      WorldPayBridge.emitStatus('creating', 'Đang tạo giao dịch...');

      // Execute payment
      console.log('🔍 [WorldPayHandler] Calling pay() with:', { muskAmount, currency });
      const result = await pay(muskAmount, currency);
      console.log('🔍 [WorldPayHandler] Service result:', JSON.stringify(result, null, 2));

      log('📤 Payment result:', result);

      if (result.success) {
        console.log('✅ [WorldPayHandler] Payment SUCCESS');
        // Success - emit to Phaser
        WorldPayBridge.emitSuccess({
          muskCredited: result.muskCredited,
          newBalance: result.newBalance,
          transactionHash: result.transactionHash,
          depositId: result.depositId,
        });

        log('✅ Payment successful! MUSK credited:', result.muskCredited);
      } else {
        console.error('❌ [WorldPayHandler] Payment FAILED:', result.error);
        // Error - emit to Phaser
        WorldPayBridge.emitError({
          error: result.error || 'Payment failed',
          code: 'PAYMENT_FAILED',
          depositId: result.depositId,
        });

        log('❌ Payment failed:', result.error);
      }

    } catch (error) {
      console.error('🔍 [WorldPayHandler] ❌ Exception caught:', error);
      console.error('🔍 [WorldPayHandler] Error message:', error?.message);
      console.error('🔍 [WorldPayHandler] Error stack:', error?.stack);
      log('❌ Payment error:', error);

      WorldPayBridge.emitError({
        error: error.message || 'An unexpected error occurred',
        code: 'UNEXPECTED_ERROR',
      });

    } finally {
      // Reset processing flag
      console.log('🔍 [WorldPayHandler] Finally block - resetting flags');
      isProcessingRef.current = false;
      console.log('🔍 [WorldPayHandler] isProcessingRef:', isProcessingRef.current);
      reset(); // Reset hook state
      console.log('🔍 [WorldPayHandler] ========== HANDLER END ==========');
    }

  }, [pay, isAvailable, reset]);

  /**
   * Setup EventBus listener
   */
  useEffect(() => {
    log('🔧 Setting up World Pay handler...');
    log('📱 World Pay available:', isAvailable);

    // Register event listener
    EventBus.on('world-pay-request', handleWorldPayRequest);

    log('✅ World Pay handler ready');

    // Cleanup on unmount
    return () => {
      log('🧹 Cleaning up World Pay handler');
      EventBus.off('world-pay-request', handleWorldPayRequest);
    };
  }, [handleWorldPayRequest]);

  // Return status for debugging/UI
  return {
    isAvailable,
    status,
    isProcessing: isProcessingRef.current,
  };
}

export default useWorldPayHandler;
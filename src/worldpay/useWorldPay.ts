/**
 * useWorldPay Hook
 * React hook để sử dụng World Pay trong components
 *
 * Usage:
 * ```tsx
 * const { pay, isLoading, error, isAvailable } = useWorldPay();
 *
 * const handleBuy = async () => {
 *   const result = await pay(1000, 'WLD');
 *   if (result.success) {
 *     console.log('MUSK credited:', result.muskCredited);
 *   }
 * };
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { WorldPayService } from './WorldPayService';
import { WORLD_PAY_CONFIG } from './config';
import type {
  PaymentStatus,
  PaymentResult,
  UseWorldPayReturn,
} from './types';

export function useWorldPay(): UseWorldPayReturn {
  // State
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PaymentResult | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  // Check MiniKit availability on mount
  useEffect(() => {
    // Small delay to ensure MiniKit is fully initialized
    const checkAvailability = () => {
      const available = MiniKit.isInstalled();
      setIsAvailable(available);

      if (WORLD_PAY_CONFIG.DEBUG) {
        console.log('[useWorldPay] MiniKit available:', available);
      }
    };

    // Check immediately
    checkAvailability();

    // Also check after a short delay (MiniKit might initialize async)
    const timer = setTimeout(checkAvailability, 500);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Execute payment
   * @param muskAmount - Số MUSK muốn mua
   * @param currency - 'WLD' hoặc 'USDC' (default: 'WLD')
   */
  const pay = useCallback(async (
    muskAmount: number,
    currency: 'WLD' | 'USDC' = 'WLD'
  ): Promise<PaymentResult> => {

    // Reset state
    setStatus('creating');
    setError(null);
    setLastResult(null);

    // Check availability
    if (!MiniKit.isInstalled()) {
      const errorMsg = 'World App is required for payments. Please open this app in World App.';
      setStatus('error');
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Execute payment flow
    const result = await WorldPayService.pay(
      muskAmount,
      currency,
      (newStatus) => setStatus(newStatus)
    );

    // Update state based on result
    if (result.success) {
      setStatus('success');
      setLastResult(result);
      setError(null);
    } else {
      setStatus('error');
      setError(result.error || 'Payment failed');
      setLastResult(result);
    }

    return result;
  }, []);

  /**
   * Reset state to idle
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setLastResult(null);
  }, []);

  // Computed
  const isLoading = ['creating', 'pending', 'confirming'].includes(status);

  return {
    // State
    isAvailable,
    status,
    error,
    lastResult,
    isLoading,

    // Actions
    pay,
    reset,
  };
}

// ============================================
// ADDITIONAL HELPER HOOKS
// ============================================

/**
 * Hook to get payment packages
 */
export function useWorldPayPackages() {
  return WORLD_PAY_CONFIG.PACKAGES;
}

/**
 * Hook to check World Pay availability
 */
export function useWorldPayAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(MiniKit.isInstalled());
  }, []);

  return available;
}

export default useWorldPay;
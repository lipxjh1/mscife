/**
 * World Pay Service
 * Service xử lý payment với World App
 *
 * Flow:
 * 1. createDeposit() - Tạo deposit request trên backend
 * 2. executePayment() - Gọi MiniKit.pay() để user confirm
 * 3. confirmDeposit() - Verify và credit MUSK trên backend
 */

import { MiniKit, tokenToDecimals, Tokens } from '@worldcoin/minikit-js';
import { WORLD_PAY_CONFIG } from './config';
import type {
  CreateDepositRequest,
  CreateDepositResponse,
  ConfirmDepositRequest,
  ConfirmDepositResponse,
  PaymentResult,
  PaymentStatus,
} from './types';

// Logger helper
const log = (message: string, data?: any) => {
  if (WORLD_PAY_CONFIG.DEBUG) {
    console.log(`[WorldPay] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  console.error(`[WorldPay] ❌ ${message}`, error || '');
};

export class WorldPayService {

  // ============================================
  // STEP 1: Create Deposit Request
  // ============================================

  /**
   * Tạo deposit request trên backend
   * Backend sẽ trả về reference ID để dùng cho MiniKit.pay()
   */
  static async createDeposit(
    muskAmount: number,
    currency: 'WLD' | 'USDC' = 'WLD'
  ): Promise<CreateDepositResponse> {

    log('Creating deposit...', { muskAmount, currency });

    // Validate input
    if (muskAmount < WORLD_PAY_CONFIG.LIMITS.MIN_MUSK) {
      return {
        success: false,
        error: `Minimum amount is ${WORLD_PAY_CONFIG.LIMITS.MIN_MUSK} MUSK`,
      };
    }

    if (muskAmount > WORLD_PAY_CONFIG.LIMITS.MAX_MUSK) {
      return {
        success: false,
        error: `Maximum amount is ${WORLD_PAY_CONFIG.LIMITS.MAX_MUSK} MUSK`,
      };
    }

    try {
      const url = `${WORLD_PAY_CONFIG.API_BASE_URL}${WORLD_PAY_CONFIG.ENDPOINTS.CREATE_DEPOSIT}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          muskAmount,
          currency,
        } as CreateDepositRequest),
      });

      const data: CreateDepositResponse = await response.json();

      if (!response.ok) {
        logError('Create deposit failed', data);
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      log('Deposit created successfully', data);
      return data;

    } catch (error) {
      logError('Create deposit error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ============================================
  // STEP 2: Execute MiniKit Payment
  // ============================================

  /**
   * Gọi MiniKit.pay() để user confirm payment trong World App
   * World App sẽ hiện popup confirm và thực hiện transaction on-chain
   */
  static async executePayment(
    depositId: string,
    amount: number,
    currency: 'WLD' | 'USDC',
    description: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {

    log('Executing MiniKit payment...', { depositId, amount, currency });

    // Check MiniKit available
    if (!MiniKit.isInstalled()) {
      logError('MiniKit not installed');
      return {
        success: false,
        error: 'Please open this app in World App to make payments.'
      };
    }

    try {
      // Map currency to MiniKit token
      const token = currency === 'WLD' ? Tokens.WLD : Tokens.USDC;

      // Convert amount to token decimals
      // WLD = 18 decimals, USDC = 6 decimals
      const tokenAmount = tokenToDecimals(amount, token).toString();

      log('Payment payload', {
        reference: depositId,
        to: WORLD_PAY_CONFIG.WALLET_ADDRESS,
        token,
        tokenAmount,
        description,
      });

      // Execute payment via MiniKit
      const { finalPayload } = await MiniKit.commandsAsync.pay({
        reference: depositId,
        to: WORLD_PAY_CONFIG.WALLET_ADDRESS,
        tokens: [{
          symbol: token,
          token_amount: tokenAmount,
        }],
        description,
      });

      log('MiniKit response', finalPayload);

      // Check result
      if (finalPayload.status === 'success') {
        log('Payment successful!', { transactionId: finalPayload.transaction_id });
        return {
          success: true,
          transactionId: finalPayload.transaction_id,
        };
      }

      // Handle errors
      const errorMessage = this.getErrorMessage(finalPayload.error_code);
      logError('Payment failed', { errorCode: finalPayload.error_code, errorMessage });

      return {
        success: false,
        error: errorMessage,
      };

    } catch (error) {
      logError('Execute payment error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment execution failed',
      };
    }
  }

  // ============================================
  // STEP 3: Confirm Deposit with Backend
  // ============================================

  /**
   * Gửi transaction ID về backend để verify và credit MUSK
   * Backend sẽ check với World Developer API và credit MUSK cho user
   */
  static async confirmDeposit(
    depositId: string,
    worldTransactionId: string
  ): Promise<ConfirmDepositResponse> {

    log('Confirming deposit...', { depositId, worldTransactionId });

    try {
      const url = `${WORLD_PAY_CONFIG.API_BASE_URL}${WORLD_PAY_CONFIG.ENDPOINTS.CONFIRM_DEPOSIT}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          depositId,
          worldTransactionId,
        } as ConfirmDepositRequest),
      });

      const data: ConfirmDepositResponse = await response.json();

      if (!response.ok) {
        logError('Confirm deposit failed', data);
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      log('Deposit confirmed successfully!', data);
      return data;

    } catch (error) {
      logError('Confirm deposit error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ============================================
  // FULL PAYMENT FLOW
  // ============================================

  /**
   * Thực hiện full payment flow
   * 1. Create deposit → 2. MiniKit pay → 3. Confirm deposit
   *
   * @param muskAmount - Số MUSK muốn mua
   * @param currency - 'WLD' hoặc 'USDC'
   * @param onProgress - Callback cập nhật trạng thái
   */
  static async pay(
    muskAmount: number,
    currency: 'WLD' | 'USDC' = 'WLD',
    onProgress?: (status: PaymentStatus) => void
  ): Promise<PaymentResult> {

    log('=== Starting payment flow ===', { muskAmount, currency });

    try {
      // ---- STEP 1: Create deposit ----
      onProgress?.('creating');

      const createResult = await this.createDeposit(muskAmount, currency);

      if (!createResult.success || !createResult.depositId || !createResult.payment) {
        return {
          success: false,
          error: createResult.error || 'Failed to create deposit',
        };
      }

      const { depositId, payment } = createResult;
      log('Step 1 complete: Deposit created', { depositId });

      // ---- STEP 2: Execute MiniKit payment ----
      onProgress?.('pending');

      const payResult = await this.executePayment(
        depositId,
        payment.amount,
        currency,
        payment.description
      );

      if (!payResult.success || !payResult.transactionId) {
        return {
          success: false,
          error: payResult.error || 'Payment cancelled or failed',
          depositId,
        };
      }

      log('Step 2 complete: Payment executed', { transactionId: payResult.transactionId });

      // ---- STEP 3: Confirm with backend ----
      onProgress?.('confirming');

      const confirmResult = await this.confirmDeposit(
        depositId,
        payResult.transactionId
      );

      if (!confirmResult.success) {
        return {
          success: false,
          error: confirmResult.error || 'Failed to confirm payment',
          depositId,
        };
      }

      log('Step 3 complete: Deposit confirmed');
      log('=== Payment flow complete! ===', confirmResult);

      // ---- SUCCESS ----
      onProgress?.('success');

      return {
        success: true,
        muskCredited: confirmResult.muskCredited,
        newBalance: confirmResult.newBalance,
        transactionHash: confirmResult.transactionHash,
        depositId,
      };

    } catch (error) {
      logError('Payment flow error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Check if World Pay is available (running in World App)
   */
  static isAvailable(): boolean {
    return MiniKit.isInstalled();
  }

  /**
   * Get human-readable error message from MiniKit error code
   */
  static getErrorMessage(errorCode?: string): string {
    const errorMessages: Record<string, string> = {
      'user_rejected': 'Payment was cancelled by user.',
      'insufficient_balance': 'Insufficient balance in your wallet.',
      'invalid_address': 'Invalid recipient address.',
      'invalid_amount': 'Invalid payment amount.',
      'network_error': 'Network error. Please try again.',
      'timeout': 'Payment timed out. Please try again.',
      'unknown': 'An unknown error occurred.',
    };

    return errorMessages[errorCode || 'unknown'] || `Payment failed: ${errorCode}`;
  }

  /**
   * Get payment package by ID
   */
  static getPackage(packageId: number) {
    return WORLD_PAY_CONFIG.PACKAGES.find(p => p.id === packageId);
  }

  /**
   * Get all payment packages
   */
  static getPackages() {
    return WORLD_PAY_CONFIG.PACKAGES;
  }
}

export default WorldPayService;
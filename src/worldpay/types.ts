/**
 * World Pay TypeScript Types
 * Type definitions cho World App Payment
 */

// ============================================
// PAYMENT STATUS
// ============================================

export type PaymentStatus =
  | 'idle'        // Chưa bắt đầu
  | 'creating'    // Đang tạo deposit request
  | 'pending'     // Đang chờ user confirm trong World App
  | 'confirming'  // Đang verify với backend
  | 'success'     // Thành công
  | 'error';      // Lỗi

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * Request tạo deposit
 */
export interface CreateDepositRequest {
  muskAmount: number;
  currency: 'WLD' | 'USDC';
}

/**
 * Response từ API create deposit
 */
export interface CreateDepositResponse {
  success: boolean;
  message?: string;
  depositId?: string;
  orderId?: string;
  payment?: {
    reference: string;
    amount: number;
    token: string;
    description: string;
  };
  deposit?: {
    depositId: string;
    muskAmount: number;
    expectedAmount: number;
    currency: string;
    exchangeRate: number;
    status: string;
    expiresAt: string;
  };
  error?: string;
}

/**
 * Request confirm deposit
 */
export interface ConfirmDepositRequest {
  depositId: string;
  worldTransactionId: string;
}

/**
 * Response từ API confirm deposit
 */
export interface ConfirmDepositResponse {
  success: boolean;
  message?: string;
  muskCredited?: number;
  newBalance?: number;
  transactionHash?: string;
  deposit?: {
    depositId: string;
    status: string;
    completedAt: string;
  };
  error?: string;
}

// ============================================
// MINIKIT PAYMENT TYPES
// ============================================

/**
 * MiniKit Pay command input
 */
export interface WorldPayCommandInput {
  reference: string;
  to: string;
  tokens: {
    symbol: string;
    token_amount: string;
  }[];
  description: string;
}

/**
 * MiniKit Pay response
 */
export interface WorldPayCommandResponse {
  status: 'success' | 'error';
  transaction_id?: string;
  error_code?: string;
  error_message?: string;
}

// ============================================
// HOOK TYPES
// ============================================

/**
 * useWorldPay hook return type
 */
export interface UseWorldPayReturn {
  // State
  isAvailable: boolean;
  status: PaymentStatus;
  error: string | null;
  lastResult: PaymentResult | null;
  isLoading: boolean;

  // Actions
  pay: (muskAmount: number, currency?: 'WLD' | 'USDC') => Promise<PaymentResult>;
  reset: () => void;
}

/**
 * Payment result
 */
export interface PaymentResult {
  success: boolean;
  muskCredited?: number;
  newBalance?: number;
  transactionHash?: string;
  depositId?: string;
  error?: string;
}

// ============================================
// EVENT TYPES (for EventBus)
// ============================================

/**
 * Event data cho world-pay-request
 */
export interface WorldPayRequestEvent {
  muskAmount: number;
  currency: 'WLD' | 'USDC';
  packageId?: number;
}

/**
 * Event data cho world-pay-success
 */
export interface WorldPaySuccessEvent {
  muskCredited: number;
  newBalance?: number;
  transactionHash?: string;
  depositId: string;
}

/**
 * Event data cho world-pay-error
 */
export interface WorldPayErrorEvent {
  error: string;
  code?: string;
  depositId?: string;
}

// ============================================
// PACKAGE TYPE
// ============================================

export interface WorldPayPackage {
  id: number;
  musk: number;
  wld: number;
  usdc: number;
  label: string;
}
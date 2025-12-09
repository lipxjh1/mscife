/**
 * World Pay Module
 * Export all components, hooks, and services
 *
 * Usage:
 * ```tsx
 * import { useWorldPay, WorldPayService, WORLD_PAY_CONFIG } from './worldpay';
 * ```
 */

// Config
export { WORLD_PAY_CONFIG, default as config } from './config';
export type { WorldPayCurrency, WorldPayPackage as ConfigPackage } from './config';

// Types
export type {
  // Status
  PaymentStatus,

  // API Types
  CreateDepositRequest,
  CreateDepositResponse,
  ConfirmDepositRequest,
  ConfirmDepositResponse,

  // MiniKit Types
  WorldPayCommandInput,
  WorldPayCommandResponse,

  // Hook Types
  UseWorldPayReturn,
  PaymentResult,

  // Event Types
  WorldPayRequestEvent,
  WorldPaySuccessEvent,
  WorldPayErrorEvent,

  // Package
  WorldPayPackage,
} from './types';

// Service
export { WorldPayService, default as Service } from './WorldPayService';

// Hooks
export {
  useWorldPay,
  useWorldPayPackages,
  useWorldPayAvailable,
  default as useWorldPayHook,
} from './useWorldPay';

// Re-export MiniKit utilities for convenience
export { MiniKit, tokenToDecimals, Tokens } from '@worldcoin/minikit-js';
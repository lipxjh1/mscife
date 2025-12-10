/**
 * World Pay Configuration
 * Config cho World App Payment integration
 */

export const WORLD_PAY_CONFIG = {
  // API Settings
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://wld.m-sci.net',

  // World App Settings
  APP_ID: import.meta.env.VITE_WORLD_APP_ID || '',
  WALLET_ADDRESS: import.meta.env.VITE_WHITELIST_ADDRESS || '',

  // API Endpoints
  ENDPOINTS: {
    CREATE_DEPOSIT: '/api/world-app/deposit/create',
    CONFIRM_DEPOSIT: '/api/world-app/deposit/confirm',
    DEPOSIT_STATUS: '/api/world-app/deposit/status',
    DEPOSIT_HISTORY: '/api/world-app/deposit/history',
  },

  // Deposit Limits (phải khớp với backend)
  LIMITS: {
    MIN_MUSK: 50,
    MAX_MUSK: 1000000,
    EXPIRY_MINUTES: 30,
  },

  // Supported Currencies
  CURRENCIES: ['WLD', 'USDC'] as const,

  // Token Decimals
  TOKEN_DECIMALS: {
    WLD: 18,
    USDC: 6,
  },

  // Payment Packages (có thể config lại sau)
  // Rate: 1 WLD = 100 MUSK (theo backend config)
  PACKAGES: [
    { id: 1, musk: 100,   wld: 1.0,   usdc: 1.0,   label: '100 MUSK' },
    { id: 2, musk: 500,   wld: 5.0,   usdc: 5.0,   label: '500 MUSK' },
    { id: 3, musk: 1000,  wld: 10.0,  usdc: 10.0,  label: '1,000 MUSK' },
    { id: 4, musk: 5000,  wld: 50.0,  usdc: 50.0,  label: '5,000 MUSK' },
    { id: 5, musk: 10000, wld: 100.0, usdc: 100.0, label: '10,000 MUSK' },
  ],

  // Debug mode
  DEBUG: import.meta.env.DEV || false,
} as const;

// Type for currency
export type WorldPayCurrency = typeof WORLD_PAY_CONFIG.CURRENCIES[number];

// Type for package
export type WorldPayPackage = typeof WORLD_PAY_CONFIG.PACKAGES[number];

// ========== DEBUG CONFIG START ==========
console.log('🔍 [WorldPay Config] ========== ENV CHECK ==========');
console.log('🔍 [WorldPay Config] VITE_WORLD_APP_ID:', import.meta.env.VITE_WORLD_APP_ID);
console.log('🔍 [WorldPay Config] VITE_WHITELIST_ADDRESS:', import.meta.env.VITE_WHITELIST_ADDRESS);
console.log('🔍 [WorldPay Config] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('🔍 [WorldPay Config] WALLET_ADDRESS from config:', WORLD_PAY_CONFIG.WALLET_ADDRESS);
console.log('🔍 [WorldPay Config] APP_ID from config:', WORLD_PAY_CONFIG.APP_ID);
console.log('🔍 [WorldPay Config] API_BASE_URL from config:', WORLD_PAY_CONFIG.API_BASE_URL);
console.log('🔍 [WorldPay Config] DEV mode:', import.meta.env.DEV);
console.log('🔍 [WorldPay Config] DEBUG mode:', WORLD_PAY_CONFIG.DEBUG);
console.log('🔍 [WorldPay Config] ================================');
// ========== DEBUG CONFIG END ==========

// Validate config on load
if (!WORLD_PAY_CONFIG.WALLET_ADDRESS) {
  console.error('❌ [WorldPay Config] VITE_WHITELIST_ADDRESS not set!');
} else {
  console.log('✅ [WorldPay Config] WALLET_ADDRESS is set:', WORLD_PAY_CONFIG.WALLET_ADDRESS);
}

if (!WORLD_PAY_CONFIG.APP_ID) {
  console.error('❌ [WorldPay Config] VITE_WORLD_APP_ID not set!');
} else {
  console.log('✅ [WorldPay Config] APP_ID is set:', WORLD_PAY_CONFIG.APP_ID);
}

if (!WORLD_PAY_CONFIG.API_BASE_URL) {
  console.error('❌ [WorldPay Config] VITE_API_BASE_URL not set!');
} else {
  console.log('✅ [WorldPay Config] API_BASE_URL is set:', WORLD_PAY_CONFIG.API_BASE_URL);
}

export default WORLD_PAY_CONFIG;
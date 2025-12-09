// Environment variables helper
export const ENV = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://sta.m-sci.net',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // WebSocket Configuration (use same as API)
  WS_URL: import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE_URL || 'https://sta.m-sci.net',

  // Development flags
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',

  // OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,

  // Telegram Configuration
  TELEGRAM_BOT_URL: import.meta.env.VITE_TELEGRAM_BOT_URL || "https://t.me/MSCIgamebot/game",
  TELEGRAM_BOT_USERNAME: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "MSCIgamebot",

  // Game URLs
  GAME_BASE_URL: import.meta.env.VITE_GAME_BASE_URL || "https://wld.m-sci.net",
  WEB_BASE_URL: import.meta.env.VITE_WEB_BASE_URL || "https://sta.m-sci.net",

  // ========================================
  // ARENA BACKEND CONFIGURATION (NEW)
  // ========================================
  ARENA_API_URL: import.meta.env.VITE_ARENA_API_URL || 'https://wld.m-sci.net',
  ARENA_WS_URL: import.meta.env.VITE_ARENA_WS_URL || 'wss://wld.m-sci.net',
  VORLD_APP_ID: import.meta.env.VITE_VORLD_APP_ID || 'app_mh96pk5z_ca7db3dd',

  // ========================================
  // WORLD ID CONFIGURATION
  // ========================================
  WORLD_ID_APP_ID: import.meta.env.VITE_WORLD_ID_APP_ID || 'app_c1f666c83bbbc687bde452e4acb51b40',
  WORLD_ID_ACTION: import.meta.env.VITE_WORLD_ID_ACTION || 'msci-login',
};

// Validate required environment variables
const validateEnv = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_TELEGRAM_BOT_URL'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missingVars.join(', ')}`);
    console.warn('Please check your .env file');
  }

  if (ENV.ENABLE_DEBUG) {
    console.log('🔧 Environment Variables:', {
      API_BASE_URL: ENV.API_BASE_URL,
      WS_URL: ENV.WS_URL,
      GOOGLE_CLIENT_ID: ENV.GOOGLE_CLIENT_ID,
      TELEGRAM_BOT_URL: ENV.TELEGRAM_BOT_URL,
      GAME_BASE_URL: ENV.GAME_BASE_URL,
      WEB_BASE_URL: ENV.WEB_BASE_URL,
      // NEW: Arena environment variables
      ARENA_API_URL: ENV.ARENA_API_URL,
      ARENA_WS_URL: ENV.ARENA_WS_URL,
      VORLD_APP_ID: ENV.VORLD_APP_ID,
      IS_DEV: ENV.IS_DEV,
      IS_PROD: ENV.IS_PROD,
    });
  }
};

// Validate on import
validateEnv();

export default ENV;
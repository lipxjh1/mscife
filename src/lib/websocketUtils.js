/**
 * WebSocket Utilities for Arena Integration
 * Fixes URL namespace issues and standardizes WebSocket configuration
 *
 * @author Claude Code
 * @date 2025-11-04
 */

/**
 * Clean WebSocket URL - Remove session paths and game IDs
 * @param {string} url - Original WebSocket URL with path
 * @returns {string} Clean base URL
 *
 * Examples:
 *   wss://airdrop-arcade.onrender.com/ws/ABC123 => wss://airdrop-arcade.onrender.com
 *   wss://airdrop-arcade.onrender.com/game/XYZ  => wss://airdrop-arcade.onrender.com
 *   https://server.com/ws/SESSION?token=abc   => https://server.com
 */
export function cleanWebSocketUrl(url) {
  if (!url) {
    console.warn('[WebSocket] Empty URL provided to cleanWebSocketUrl');
    return url;
  }

  try {
    // Method 1: Parse URL properly
    const urlObj = new URL(url);
    const cleanUrl = `${urlObj.protocol}//${urlObj.host}`;

    console.log('[WebSocket] URL cleaned successfully:', {
      original: url,
      protocol: urlObj.protocol,
      host: urlObj.host,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      result: cleanUrl
    });

    return cleanUrl;
  } catch (e) {
    // Method 2: Fallback - String manipulation
    console.warn('[WebSocket] URL parse failed, using string manipulation fallback:', e.message);

    // Remove common session patterns
    let clean = url
      .split('/ws/')[0]
      .split('/game/')[0]
      .split('?')[0]
      .split('#')[0];

    console.log('[WebSocket] URL cleaned via fallback:', {
      original: url,
      result: clean
    });

    return clean;
  }
}

/**
 * Extract session ID from WebSocket URL
 * @param {string} url - Original WebSocket URL containing session ID
 * @returns {string|null} Session ID or null if not found
 */
export function extractSessionId(url) {
  if (!url) return null;

  try {
    // Method 1: Parse from pathname /ws/SESSION_ID
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const wsIndex = pathParts.indexOf('ws');

    if (wsIndex !== -1 && pathParts[wsIndex + 1]) {
      const sessionId = pathParts[wsIndex + 1];
      console.log('[WebSocket] Session ID extracted from pathname:', sessionId);
      return sessionId;
    }

    // Method 2: Parse from query parameter
    const sessionParam = urlObj.searchParams.get('sessionId') || urlObj.searchParams.get('session');
    if (sessionParam) {
      console.log('[WebSocket] Session ID extracted from query:', sessionParam);
      return sessionParam;
    }

    // Method 3: Parse from hash
    if (urlObj.hash.includes('session=')) {
      const hashSession = urlObj.hash.split('session=')[1]?.split('&')[0];
      if (hashSession) {
        console.log('[WebSocket] Session ID extracted from hash:', hashSession);
        return hashSession;
      }
    }

    console.warn('[WebSocket] No session ID found in URL:', url);
    return null;
  } catch (e) {
    console.warn('[WebSocket] Failed to extract session ID:', e.message);
    return null;
  }
}

/**
 * Get Vorld App ID from environment with fallback
 * Supports both Vite and Next.js env formats
 */
export function getVorldAppId() {
  const appId = import.meta.env.VITE_WORLD_ID_APP_ID ||
                import.meta.env.VITE_VORLD_APP_ID ||
                import.meta.env.VITE_APP_VORLD_APP_ID ||
                process.env.NEXT_PUBLIC_VORLD_APP_ID ||
                'app_c1f666c83bbbc687bde452e4acb51b40'; // Updated fallback

  console.log('[WebSocket] Vorld App ID resolved:', {
    env_world_id: import.meta.env.VITE_WORLD_ID_APP_ID,
    env_vite: import.meta.env.VITE_VORLD_APP_ID,
    env_next: process.env.NEXT_PUBLIC_VORLD_APP_ID,
    final: appId,
    hasAppId: !!appId
  });

  return appId;
}

/**
 * Get user token from storage with multiple fallbacks
 */
export function getUserToken() {
  const token = localStorage.getItem('userToken') ||
               localStorage.getItem('accessToken') ||
               localStorage.getItem('vorld_access_token') ||
               sessionStorage.getItem('userToken') ||
               sessionStorage.getItem('accessToken');

  console.log('[WebSocket] User token resolved:', {
    localStorage_userToken: !!localStorage.getItem('userToken'),
    localStorage_accessToken: !!localStorage.getItem('accessToken'),
    sessionStorage_userToken: !!sessionStorage.getItem('userToken'),
    hasToken: !!token,
    tokenLength: token?.length || 0
  });

  return token;
}

/**
 * Validate WebSocket configuration before connection
 * @param {string} url - WebSocket URL
 * @param {string} token - User authentication token
 * @param {string} appId - Vorld App ID
 * @returns {Object} Validation result
 */
export function validateWebSocketConfig(url, token, appId) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!url) errors.push('WebSocket URL is required');
  if (!token) errors.push('User token is required');
  if (!appId) errors.push('Vorld App ID is required');

  // URL format validation
  if (url && (url.includes('/ws/') || url.includes('/game/'))) {
    errors.push('URL should not contain session paths (/ws/ or /game/). Use cleanWebSocketUrl() first.');
  }

  if (url && !url.startsWith('wss://') && !url.startsWith('ws://')) {
    warnings.push('URL should use WebSocket protocol (wss:// or ws://)');
  }

  // Token format validation
  if (token && token.length < 10) {
    warnings.push('Token seems too short, may be invalid');
  }

  // App ID format validation
  if (appId && !appId.startsWith('app_')) {
    warnings.push('App ID should start with "app_"');
  }

  const result = {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    summary: {
      hasUrl: !!url,
      hasToken: !!token,
      hasAppId: !!appId,
      errorCount: errors.length,
      warningCount: warnings.length
    }
  };

  console.log('[WebSocket] Configuration validation:', result);
  return result;
}

/**
 * Create standardized socket.io configuration
 * @param {Object} options - Configuration options
 * @returns {Object} Socket.io connection options
 */
export function createSocketConfig(options = {}) {
  const {
    url,
    token,
    appId,
    sessionId,
    transports = ['websocket'],
    timeout = 10000,
    reconnection = true,
    reconnectionDelay = 1000,
    reconnectionAttempts = 5
  } = options;

  // Clean URL if needed
  const cleanUrl = url && (url.includes('/ws/') || url.includes('/game/'))
    ? cleanWebSocketUrl(url)
    : url;

  // Get defaults if not provided
  const finalToken = token || getUserToken();
  const finalAppId = appId || getVorldAppId();

  // Build configuration
  const config = {
    transports,
    reconnection,
    reconnectionDelay,
    reconnectionAttempts,
    timeout
  };

  // Add authentication
  if (finalToken && finalAppId) {
    config.auth = {
      token: finalToken,
      appId: finalAppId
    };
  } else if (finalToken) {
    config.auth = { token: finalToken };
    console.warn('[WebSocket] Creating socket config without appId');
  }

  // Add query parameters
  const query = {};
  if (sessionId && !url?.includes('/ws/')) {
    query.sessionId = sessionId;
  }

  if (Object.keys(query).length > 0) {
    config.query = query;
  }

  console.log('[WebSocket] Socket configuration created:', {
    url: cleanUrl,
    hasAuth: !!config.auth,
    authKeys: config.auth ? Object.keys(config.auth) : [],
    hasQuery: !!config.query,
    queryKeys: config.query ? Object.keys(config.query) : [],
    transports: config.transports
  });

  return { url: cleanUrl, config };
}

/**
 * Test WebSocket URL cleaning and validation
 * @param {Array<string>} testUrls - Array of test URLs
 */
export function testWebSocketUrls(testUrls = []) {
  const defaultTestUrls = [
    'wss://airdrop-arcade.onrender.com/ws/PJ3Q7Z',
    'wss://airdrop-arcade.onrender.com/game/ABC123',
    'wss://airdrop-arcade.onrender.com',
    'https://server.com/ws/XYZ?token=abc',
    'ws://localhost:3000/ws/session123'
  ];

  const urlsToTest = testUrls.length > 0 ? testUrls : defaultTestUrls;

  console.log('═══════════════════════════════════════');
  console.log('WEBSOCKET URL CLEANING TEST');
  console.log('═══════════════════════════════════════');

  const results = urlsToTest.map(url => {
    const cleaned = cleanWebSocketUrl(url);
    const sessionId = extractSessionId(url);
    const validation = validateWebSocketConfig(cleaned, 'test_token', 'app_test123');

    return {
      original: url,
      cleaned: cleaned,
      sessionId: sessionId,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings
    };
  });

  results.forEach((result, index) => {
    console.log(`\nTest ${index + 1}:`);
    console.log(`  Original: ${result.original}`);
    console.log(`  Cleaned: ${result.cleaned}`);
    console.log(`  Session: ${result.sessionId || 'Not found'}`);
    console.log(`  Valid: ${result.valid ? '✅' : '❌'}`);
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join(', ')}`);
    }
    if (result.warnings.length > 0) {
      console.log(`  Warnings: ${result.warnings.join(', ')}`);
    }
  });

  console.log('\n═══════════════════════════════════════');
  return results;
}

/**
 * Debug logging utility for WebSocket connections
 * @param {string} phase - Connection phase
 * @param {Object} data - Debug data
 */
export function debugWebSocket(phase, data = {}) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    phase,
    ...data
  };

  console.log(`[WebSocket Debug] ${phase}:`, logData);
  return logData;
}

// Export all functions
export default {
  cleanWebSocketUrl,
  extractSessionId,
  getVorldAppId,
  getUserToken,
  validateWebSocketConfig,
  createSocketConfig,
  testWebSocketUrls,
  debugWebSocket
};
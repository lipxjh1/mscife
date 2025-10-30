// File: src/services/arena.js (NEW FILE)
import axios from 'axios';
import ENV from '../config/env.js';

// Arena API Configuration
const ARENA_API_URL = ENV.ARENA_API_URL;
const VORLD_APP_ID = ENV.VORLD_APP_ID;

console.log('[Arena] Initializing Arena service...', {
  API_URL: ARENA_API_URL,
  APP_ID: VORLD_APP_ID
});

// Create Arena API client
const arenaClient = axios.create({
  baseURL: ARENA_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-ID': VORLD_APP_ID
  }
});

// Request interceptor - Add token
arenaClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Arena] Request with token:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: true
      });
    } else {
      console.log('[Arena] Request without token:', {
        method: config.method?.toUpperCase(),
        url: config.url
      });
    }
    return config;
  },
  (error) => {
    console.error('[Arena] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
arenaClient.interceptors.response.use(
  (response) => {
    console.log('[Arena] Response:', {
      status: response.status,
      url: response.config.url,
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('[Arena] Unauthorized - Token expired or invalid');
      // Could redirect to login or refresh token here
    } else if (error.response?.status >= 500) {
      console.error('[Arena] Server Error:', error.response?.data);
    } else {
      console.error('[Arena] API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Arena Service - Handle all Arena API calls
 */
class ArenaService {

  /**
   * Initialize a new Arena game session
   * @param {string} streamUrl - Optional Twitch/YouTube stream URL
   * @returns {Promise<{sessionId, gameId, status, websocketUrl}>}
   */
  async initGame(streamUrl = '') {
    try {
      console.log('[Arena] Initializing game session...', { streamUrl });

      const response = await arenaClient.post('/api/arena/games/init', {
        streamUrl
      });

      if (response.data.success) {
        console.log('[Arena] Game initialized successfully:', {
          sessionId: response.data.data.sessionId,
          gameId: response.data.data.gameId,
          status: response.data.data.status
        });
      }

      return response.data;

    } catch (error) {
      console.error('[Arena] Init game failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get Arena items catalog with pagination
   * @param {number} page - Page number (default 1)
   * @param {number} limit - Items per page (default 10)
   * @param {string} category - Filter by category (optional)
   * @returns {Promise<{items[], pagination}>}
   */
  async getItemsCatalog(page = 1, limit = 10, category = '') {
    try {
      console.log('[Arena] Fetching items catalog...', { page, limit, category });

      const response = await arenaClient.get('/api/arena/items-catalog', {
        params: { page, limit, category }
      });

      if (response.data.success) {
        console.log('[Arena] Items catalog loaded:', {
          totalItems: response.data.data.items?.length || 0,
          currentPage: page
        });
      }

      return response.data;

    } catch (error) {
      console.error('[Arena] Get catalog failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Boost a player with chips
   * @param {string} sessionId - Arena session ID
   * @param {string} targetUserId - Target player ID
   * @param {number} amount - Boost amount (must be 25, 50, 100, 200, or 500)
   * @returns {Promise<{boostId, playerId, amount}>}
   */
  async boostPlayer(sessionId, targetUserId, amount) {
    // CRITICAL: Validate amount
    const validAmounts = [25, 50, 100, 200, 500];
    if (!validAmounts.includes(amount)) {
      const error = new Error(`Invalid boost amount: ${amount}. Must be one of: ${validAmounts.join(', ')}`);
      console.error('[Arena] Validation failed:', error.message);
      throw error;
    }

    try {
      console.log('[Arena] Boosting player...', { sessionId, targetUserId, amount });

      const response = await arenaClient.post('/api/arena/boost', {
        sessionId,
        targetUserId,
        amount
      });

      if (response.data.success) {
        console.log('[Arena] Boost successful:', {
          boostId: response.data.data.boostId,
          playerId: response.data.data.playerId,
          amount: response.data.data.amount
        });
      }

      return response.data;

    } catch (error) {
      console.error('[Arena] Boost failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Drop an item to a player
   * @param {string} sessionId - Arena session ID
   * @param {string} itemId - Item ID from catalog
   * @param {string} targetUserId - Target player ID
   * @param {number} quantity - Item quantity (default 1)
   * @returns {Promise<{dropId, itemId, quantity}>}
   */
  async dropItem(sessionId, itemId, targetUserId, quantity = 1) {
    try {
      console.log('[Arena] Dropping item...', { sessionId, itemId, targetUserId, quantity });

      const response = await arenaClient.post('/api/arena/item-drop', {
        sessionId,
        itemId,
        targetUserId,
        quantity
      });

      if (response.data.success) {
        console.log('[Arena] Item dropped successfully:', {
          dropId: response.data.data.dropId,
          itemId: response.data.data.itemId,
          quantity: response.data.data.quantity
        });
      }

      return response.data;

    } catch (error) {
      console.error('[Arena] Drop item failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Health check - Test connection to Arena backend
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      console.log('[Arena] Performing health check...');
      const response = await arenaClient.get('/health');
      const isHealthy = response.status === 200;
      console.log('[Arena] Health check result:', isHealthy ? '✅ Healthy' : '❌ Unhealthy');
      return isHealthy;
    } catch (error) {
      console.error('[Arena] Health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get current user session info
   * @returns {Promise<Object>}
   */
  async getSessionInfo() {
    try {
      const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Try to get user profile to verify token
      const response = await arenaClient.get('/api/me');
      return response.data;
    } catch (error) {
      console.error('[Arena] Get session info failed:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
const arenaService = new ArenaService();

// Named exports for flexibility
export { ArenaService, arenaClient };
export default arenaService;

// Log service initialization
console.log('[Arena] Arena service initialized and exported');
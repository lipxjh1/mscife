// File: src/services/arenaSocket.js (NEW FILE)
import io from 'socket.io-client';
import ENV from '../config/env.js';
import {
  cleanWebSocketUrl,
  getVorldAppId,
  getUserToken,
  validateWebSocketConfig,
  createSocketConfig,
  debugWebSocket
} from '../lib/websocketUtils.js';

const ARENA_WS_URL = ENV.ARENA_WS_URL;
const VORLD_APP_ID = getVorldAppId(); // Use utility to get appId with fallbacks

console.log('[ArenaWS] Initializing Arena WebSocket service...', {
  WS_URL: ARENA_WS_URL,
  VORLD_APP_ID: VORLD_APP_ID,
  hasAppId: !!VORLD_APP_ID
});

/**
 * Arena WebSocket Service
 * Handles real-time events from Arena server
 */
class ArenaSocketService {
  constructor() {
    this.socket = null;
    this.sessionId = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to Arena WebSocket server with proper URL cleaning and authentication
   * @param {string} sessionId - Arena session ID
   * @param {string} websocketUrl - Optional WebSocket URL from backend
   */
  connect(sessionId, websocketUrl = null) {
    if (this.socket && this.isConnected) {
      console.warn('[ArenaWS] Already connected to session:', this.sessionId);
      return;
    }

    if (!sessionId) {
      console.error('[ArenaWS] Cannot connect: No session ID provided');
      return;
    }

    this.sessionId = sessionId;

    debugWebSocket('ARENA_CONNECT_START', {
      sessionId,
      websocketUrl,
      fallbackUrl: ARENA_WS_URL
    });

    // Get authentication tokens
    const token = getUserToken();
    const appId = VORLD_APP_ID;

    if (!token) {
      console.error('[ArenaWS] Cannot connect: No authentication token found');
      return;
    }

    if (!appId) {
      console.error('[ArenaWS] Cannot connect: No Vorld App ID available');
      return;
    }

    // ✅ FIXED: Clean WebSocket URL to remove /ws/ path (prevents Invalid namespace)
    let finalUrl, finalSessionId;

    if (websocketUrl) {
      // Clean the backend-provided URL and extract session ID
      finalUrl = cleanWebSocketUrl(websocketUrl);
      finalSessionId = this.extractSessionIdFromUrl(websocketUrl) || sessionId;

      debugWebSocket('ARENA_URL_CLEANING', {
        originalUrl: websocketUrl,
        cleanedUrl: finalUrl,
        sessionId: finalSessionId
      });
    } else {
      // Use base URL with session ID in query
      finalUrl = ARENA_WS_URL;
      finalSessionId = sessionId;
    }

    // ✅ FIXED: Validate configuration before connection
    const validation = validateWebSocketConfig(finalUrl, token, appId);
    if (!validation.valid) {
      console.error('[ArenaWS] Invalid WebSocket configuration:', validation.errors);
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn('[ArenaWS] WebSocket configuration warnings:', validation.warnings);
    }

    // ✅ FIXED: Create proper socket configuration with appId in auth
    const { config } = createSocketConfig({
      url: finalUrl,
      token: token,
      appId: appId,
      sessionId: finalSessionId,
      transports: ['websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    debugWebSocket('ARENA_SOCKET_CONFIG', {
      url: finalUrl,
      hasAuth: !!config.auth,
      authKeys: config.auth ? Object.keys(config.auth) : [],
      hasQuery: !!config.query,
      queryKeys: config.query ? Object.keys(config.query) : [],
      transports: config.transports
    });

    console.log('[ArenaWS] Connecting...', {
      sessionId: finalSessionId,
      finalUrl: finalUrl,
      hasToken: !!token,
      hasAppId: !!appId,
      appId: appId,
      authProvided: !!config.auth
    });

    // Create socket connection with proper configuration
    this.socket = io(finalUrl, config);

    this._setupEventHandlers();
  }

  /**
   * Helper method to extract session ID from WebSocket URL
   * @param {string} url - WebSocket URL containing session ID
   * @returns {string|null} Session ID or null
   */
  extractSessionIdFromUrl(url) {
    if (!url) return null;

    // Extract session ID from /ws/SESSION_ID pattern
    const urlParts = url.split('/ws/');
    if (urlParts.length > 1) {
      return urlParts[1].split('?')[0].split('#')[0];
    }

    return null;
  }

  /**
   * Setup default event handlers
   * @private
   */
  _setupEventHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('[ArenaWS] ✅ Connected successfully', {
        socketId: this.socket.id,
        sessionId: this.sessionId
      });
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this._emit('connected', { socketId: this.socket.id, sessionId: this.sessionId });

      // Auto join session after connecting
      this.joinSession();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[ArenaWS] ❌ Disconnected:', reason);
      this.isConnected = false;
      this._emit('disconnected', { reason, sessionId: this.sessionId });

      // Auto reconnect if not explicitly disconnected
      if (reason !== 'io client disconnect') {
        this._handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[ArenaWS] ❌ Connection error:', error.message);
      this._emit('error', { type: 'connection_error', message: error.message });

      this._handleReconnect();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[ArenaWS] ✅ Reconnected after', attemptNumber, 'attempts');
      this._emit('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[ArenaWS] ❌ Failed to reconnect after', this.maxReconnectAttempts, 'attempts');
      this._emit('error', { type: 'reconnect_failed', message: 'Max reconnection attempts reached' });
    });

    // Arena game events
    this.socket.on('session_created', (data) => {
      console.log('[ArenaWS] 🎮 Session created:', data);
      this._emit('session_created', data);
    });

    this.socket.on('session_activated', (data) => {
      console.log('[ArenaWS] 🎯 Session activated:', data);
      this._emit('session_activated', data);
    });

    // ✅ COUNTDOWN EVENTS - Fixed event names to match backend
    this.socket.on('ARENA_COUNTDOWN_START', (data) => {
      console.log('[ArenaWS] 📥 Event: ARENA_COUNTDOWN_START', data);
      this._emit('countdown_started', data);
    });

    this.socket.on('countdown_update', (data) => {
      console.log('[ArenaWS] 📥 Event: countdown_update', data);
      this._emit('countdown_update', data);
    });

    this.socket.on('ARENA_ACTIVE', (data) => {
      console.log('[ArenaWS] 📥 Event: ARENA_ACTIVE', data);
      this._emit('arena_begins', data);
    });

    // Arena join confirmation (optional)
    this.socket.on('arena:joined', (data) => {
      console.log('[ArenaWS] ✅ Successfully joined arena room:', data);
      this._emit('arena:joined', data);
    });

    this.socket.on('BOOST_RECEIVED', (data) => {
      console.log('[ArenaWS] 💰 Boost received:', data);
      this._emit('player_boosted', data);
    });

    this.socket.on('ITEM_RECEIVED', (data) => {
      console.log('[ArenaWS] 🎁 Item received:', data);
      this._emit('item_dropped', data);
    });

    this.socket.on('session_ended', (data) => {
      console.log('[ArenaWS] 🏁 Session ended:', data);
      this._emit('session_ended', data);
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('[ArenaWS] ❌ Server error:', error);
      this._emit('error', { type: 'server_error', error });
    });

    // Debug: Log all incoming events
    if (ENV.ENABLE_DEBUG) {
      this.socket.onAny((eventName, data) => {
        if (eventName !== 'connect' && eventName !== 'disconnect') {
          console.log(`[ArenaWS] 📥 Event: ${eventName}`, data);
        }
      });
    }
  }

  /**
   * Handle reconnection logic
   * @private
   */
  _handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[ArenaWS] 🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    }
  }

  /**
   * Emit event to registered handlers
   * @private
   */
  _emit(eventName, data) {
    const handlers = this.eventHandlers.get(eventName) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[ArenaWS] Handler error for ${eventName}:`, error);
      }
    });

    // Also log to console for debugging
    if (ENV.ENABLE_DEBUG && eventName !== 'connected' && eventName !== 'disconnected') {
      console.log(`[ArenaWS] 📤 Emitted: ${eventName}`, data);
    }
  }

  /**
   * Register event handler
   * @param {string} eventName - Event name
   * @param {Function} handler - Handler function
   */
  on(eventName, handler) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName).push(handler);
    console.log(`[ArenaWS] 📝 Registered handler for: ${eventName}`);
  }

  /**
   * Unregister event handler
   * @param {string} eventName - Event name
   * @param {Function} handler - Handler function
   */
  off(eventName, handler) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        console.log(`[ArenaWS] 🗑️ Unregistered handler for: ${eventName}`);
      }
    }
  }

  /**
   * Send join_session event
   */
  joinSession() {
    if (!this.socket || !this.isConnected) {
      console.error('[ArenaWS] Cannot join session: Not connected');
      return;
    }

    console.log('[ArenaWS] 🎮 Joining session:', this.sessionId);
    this.socket.emit('arena:join', this.sessionId);
  }

  /**
   * Send ping to keep connection alive
   */
  ping() {
    if (!this.socket || !this.isConnected) {
      console.warn('[ArenaWS] Cannot ping: Not connected');
      return;
    }

    console.log('[ArenaWS] 📡 Sending ping');
    this.socket.emit('ping');
  }

  /**
   * Send custom event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  emit(eventName, data) {
    if (!this.socket || !this.isConnected) {
      console.warn(`[ArenaWS] Cannot emit ${eventName}: Not connected`);
      return;
    }

    console.log(`[ArenaWS] 📤 Emitting: ${eventName}`, data);
    this.socket.emit(eventName, data);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.socket) {
      console.log('[ArenaWS] 🔌 Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.sessionId = null;
      this.reconnectAttempts = 0;

      // Clear all event handlers
      this.eventHandlers.clear();
    }
  }

  /**
   * Get connection status
   */
  get connected() {
    return this.isConnected;
  }

  /**
   * Get current session ID
   */
  get currentSessionId() {
    return this.sessionId;
  }

  /**
   * Get socket ID
   */
  get socketId() {
    return this.socket?.id;
  }

  /**
   * Get connection info
   */
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      sessionId: this.sessionId,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      url: this.sessionId ? this._getActualWebSocketUrl() : null
    };
  }

  /**
   * Get the actual WebSocket URL being used
   * @private
   */
  _getActualWebSocketUrl() {
    // If we're connected, the socket should know the URL it's connected to
    if (this.socket?.io?.uri) {
      return this.socket.io.uri;
    }
    
    // Fallback to base URL
    return ARENA_WS_URL;
  }
}

// Export singleton instance
const arenaSocket = new ArenaSocketService();

// Named export for flexibility
export { ArenaSocketService };
export default arenaSocket;

// Log service initialization
console.log('[ArenaWS] Arena WebSocket service initialized and exported');
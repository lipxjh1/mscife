// File: src/services/arenaSocket.js (NEW FILE)
import io from 'socket.io-client';
import ENV from '../config/env.js';

const ARENA_WS_URL = ENV.ARENA_WS_URL;

console.log('[ArenaWS] Initializing Arena WebSocket service...', {
  WS_URL: ARENA_WS_URL
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
   * Connect to Arena WebSocket server
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
    const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

    if (!token) {
      console.error('[ArenaWS] Cannot connect: No authentication token found');
      return;
    }

    // ✅ FIXED: Use websocketUrl from backend if provided, otherwise create correctly
    let wsUrl;
    if (websocketUrl) {
      // Use URL provided by backend (recommended by Arena docs)
      wsUrl = websocketUrl;
      console.log('[ArenaWS] Using WebSocket URL from backend');
    } else {
      // Create correct URL without /ws/ namespace
      wsUrl = ARENA_WS_URL;
      console.log('[ArenaWS] Using base URL, sessionId via query param');
    }

    console.log('[ArenaWS] Connecting...', { sessionId, wsUrl });

    // Create socket connection
    // ✅ FIXED: Pass sessionId via query parameter, not as namespace
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      auth: { token },
      query: websocketUrl ? {} : { sessionId },  // Add sessionId to query if no websocketUrl
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000
    });

    this._setupEventHandlers();
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

    this.socket.on('player_boosted', (data) => {
      console.log('[ArenaWS] 💰 Player boosted:', data);
      this._emit('player_boosted', data);
    });

    this.socket.on('item_dropped', (data) => {
      console.log('[ArenaWS] 🎁 Item dropped:', data);
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
    this.socket.emit('join_session', { sessionId: this.sessionId });
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
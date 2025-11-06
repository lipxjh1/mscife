// File: src/services/arenaGameService.js (NEW FILE)
import io from 'socket.io-client';
import axios from 'axios';
import ENV from '../config/env.js';
import { getVorldToken, hasVorldToken } from '../utils/vorldAuth.js';
import {
  cleanWebSocketUrl,
  getVorldAppId,
  getUserToken,
  validateWebSocketConfig,
  createSocketConfig,
  debugWebSocket
} from '../lib/websocketUtils.js';

// Arena Configuration
const ARENA_CONFIG = {
  API_URL: ENV.ARENA_API_URL,
  WS_BASE_URL: ENV.ARENA_WS_URL,
  VORLD_APP_ID: getVorldAppId(), // Use utility to get appId with fallbacks
  ARENA_GAME_ID: 'arcade_mh96qa8c_9bd983a7'
};

console.log('[ArenaGameService] Initializing unified Arena service...', {
  API_URL: ARENA_CONFIG.API_URL,
  WS_BASE_URL: ARENA_CONFIG.WS_BASE_URL,
  VORLD_APP_ID: ARENA_CONFIG.VORLD_APP_ID
});

/**
 * ArenaGameService - Unified Arena Game Service
 * Combines API calls and WebSocket management with 3 initialization methods
 */
export class ArenaGameService {
  constructor() {
    // WebSocket connections
    this.socket = null; // Backend local WebSocket
    this.arenaSocket = null; // Arena direct WebSocket
    this.gameState = null;

    // Authentication
    this.userToken = null;
    this.vorldToken = null;

    // Event handling
    this.eventHandlers = new Map();

    // Connection state
    this.isConnected = false;
    this.arenaConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;

    console.log('[ArenaGameService] Service instance created with dual WebSocket support');
  }

  // ==========================================
  // METHOD 1: Basic Initialization (with callbacks)
  // ==========================================
  /**
   * Initialize Arena Game with success/error callbacks (game activates automatically)
   * @param {Object} options - Initialization options
   * @param {string} options.streamUrl - Stream URL (optional)
   * @param {Function} options.onSuccess - Success callback
   * @param {Function} options.onError - Error callback
   * @returns {Promise<{success: boolean, gameState?: Object, error?: string}>}
   */
  async initializeArenaGame(options = {}) {
    const { streamUrl = '', onSuccess, onError } = options;

    console.log('[ArenaGameService] Method 1: Basic initialization with callbacks', { streamUrl });

    try {
      // Initialize game (now activates automatically)
      const initResult = await this.initGame(streamUrl);

      if (initResult.success) {
        console.log('[ArenaGameService] Game initialized and active', initResult.gameState);

        // Set game state
        this.gameState = initResult.gameState;

        // ✅ UPDATED: Game is now active immediately, no activation needed
        console.log('[ArenaGameService] Game is ready for WebSocket connection...');

        // Call success callback
        onSuccess?.(this.gameState);

        return {
          success: true,
          gameState: this.gameState,
          requiresActivation: false // ← No activation needed anymore
        };
      } else {
        console.error('[ArenaGameService] Game initialization failed', initResult.error);
        onError?.(initResult.error);

        return {
          success: false,
          error: initResult.error
        };
      }
    } catch (error) {
      console.error('[ArenaGameService] Basic initialization failed', error);
      const errorMessage = error.message || 'Unknown error occurred';
      onError?.(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ==========================================
  // METHOD 2: Quick Initialization (boolean return)
  // ==========================================
  /**
   * Quick initialize game with stream URL and user token
   * @param {string} streamUrl - Stream URL (optional)
   * @param {string} userToken - User authentication token
   * @returns {Promise<boolean>} - Success status
   */
  async quickInitializeGame(streamUrl = '', userToken = '') {
    console.log('[ArenaGameService] Method 2: Quick initialization', { streamUrl, hasToken: !!userToken });

    // Set token
    this.userToken = userToken;

    try {
      const initResult = await this.initGame(streamUrl);

      if (initResult.success) {
        this.gameState = initResult.gameState;
        console.log('[ArenaGameService] Quick init successful', {
          sessionId: this.gameState.sessionId,
          gameId: this.gameState.gameId
        });
        return true;
      } else {
        console.error('[ArenaGameService] Quick init failed', initResult.error);
        return false;
      }
    } catch (error) {
      console.error('[ArenaGameService] Quick initialization failed', error);
      return false;
    }
  }

  // ==========================================
  // METHOD 3: With WebSocket (auto-connect)
  // ==========================================
  /**
   * Initialize game with automatic WebSocket connection
   * @param {string} streamUrl - Stream URL (optional)
   * @param {string} userToken - User authentication token
   * @returns {Promise<Object|null>} - Game state or null on failure
   */
  async initializeGameWithWebSocket(streamUrl = '', userToken = '') {
    console.log('[ArenaGameService] Method 3: Initialization with WebSocket', { streamUrl, hasToken: !!userToken });

    // Set token
    this.userToken = userToken;

    try {
      // Initialize game (now activates automatically)
      const initResult = await this.initGame(streamUrl);

      if (initResult.success && initResult.gameState) {
        this.gameState = initResult.gameState;

        // ✅ UPDATED: Game is now active, WebSocket can be connected immediately
        console.log('[ArenaGameService] Game initialized and active, ready for WebSocket connection');

        return this.gameState;
      } else {
        console.error('[ArenaGameService] Initialization with WebSocket failed', initResult.error);
        return null;
      }
    } catch (error) {
      console.error('[ArenaGameService] Initialization with WebSocket failed', error);
      return null;
    }
  }

  // ==========================================
  // NEW METHOD: Complete Flow (Init → Connect WebSocket)
  // ==========================================
  /**
   * Complete initialization flow: Init → Connect WebSocket (no activation needed)
   * @param {string} streamUrl - Stream URL (optional)
   * @param {string} userToken - User authentication token
   * @returns {Promise<{success: boolean, gameState?: Object, error?: string}>}
   */
  async initializeCompleteFlow(streamUrl = '', userToken = '') {
    console.log('[ArenaGameService] Complete flow: Init → Connect WebSocket', {
      streamUrl,
      hasToken: !!userToken
    });

    // Set token
    this.userToken = userToken;

    try {
      // STEP 1: Initialize game (backend now activates automatically)
      console.log('[ArenaGameService] Step 1: Initializing game...');
      const initResult = await this.initGame(streamUrl);

      if (!initResult.success) {
        console.error('[ArenaGameService] Step 1 failed:', initResult.error);
        return { success: false, error: initResult.error };
      }

      // Set gameState from initResult
      this.gameState = initResult.gameState;

      console.log('[ArenaGameService] Step 1 success: Game initialized and active', {
        sessionId: this.gameState.sessionId,
        status: this.gameState.status, // Should be 'active' now
        gameId: this.gameState.gameId
      });

      // STEP 2: Setup WebSocket connections ngay (không cần activate)
      console.log('[ArenaGameService] Step 2: Setting up WebSocket connections...');
      const wsConnected = await this.connectWebSocket();

      if (!wsConnected) {
        console.warn('[ArenaGameService] Step 2 warning: WebSocket connection failed, but session is active');
        // Don't fail the entire flow if WebSocket fails, just warn
      } else {
        console.log('[ArenaGameService] Step 2 success: WebSocket connected');
      }

      console.log('[ArenaGameService] ✅ Complete flow finished successfully', {
        sessionId: this.gameState.sessionId,
        status: this.gameState.status,
        wsConnected: wsConnected
      });

      return {
        success: true,
        gameState: this.gameState,
        wsConnected: wsConnected
      };

    } catch (error) {
      console.error('[ArenaGameService] Complete flow failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // CORE METHODS
  // ==========================================

  // ============================================
  // DEPRECATED: activateSession method removed
  // Backend now activates sessions automatically during init
  // Flow simplified: Init → Connect WebSocket (no activation step needed)
  // ============================================
  /**
   * Core game initialization method
   * @param {string} streamUrl - Stream URL
   * @returns {Promise<{success: boolean, gameState?: Object, error?: string}>}
   */
  async initGame(streamUrl = '') {
    try {
      console.log('[ArenaGameService] Initializing game...', { streamUrl });

      // Get Vorld token for authentication
      const vorldToken = getVorldToken();

      if (!vorldToken) {
        console.error('[ArenaGameService] Cannot init game: No Vorld token');
        return {
          success: false,
          error: 'Vorld authentication required. Please login to Vorld first.'
        };
      }

      // Prepare API client
      const apiClient = axios.create({
        baseURL: ARENA_CONFIG.API_URL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': ARENA_CONFIG.VORLD_APP_ID
        }
      });

      // Add authentication headers
      const backendToken = this.userToken || sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
      if (backendToken) {
        apiClient.defaults.headers.Authorization = `Bearer ${backendToken}`;
        apiClient.defaults.headers['X-Vorld-Token'] = vorldToken;
      }

      console.log('[ArenaGameService] Making API request to initialize game...');

      const response = await apiClient.post('/api/arena/games/init', {
        streamUrl
      });

      if (response.data.success) {
        const gameState = response.data.data;

        // Game giờ đã active ngay từ init
        const updatedGameState = {
          sessionId: gameState.sessionId,
          gameId: gameState.gameId,
          arenaGameId: gameState.arenaGameId,
          status: gameState.status, // Should be 'active' now
          streamUrl: gameState.streamUrl,
          websocketUrl: gameState.websocketUrl,
          arenaWebsocketUrl: gameState.arenaWebsocketUrl,
          evaGameDetails: gameState.evaGameDetails,
          userInfo: gameState.userInfo
        };

        // Lưu state
        this.sessionId = updatedGameState.sessionId;
        this.gameId = updatedGameState.gameId;
        this.arenaGameId = updatedGameState.arenaGameId;
        this.status = updatedGameState.status;

        console.log('[ArenaGameService] Game initialized successfully:', {
          sessionId: this.sessionId,
          gameId: this.gameId,
          status: this.status, // Should log 'active'
          hasWebsocketUrl: !!updatedGameState.websocketUrl
        });

        // Emit event ngay vì game đã active
        this._emit('game_active', updatedGameState);

        return {
          success: true,
          gameState: updatedGameState
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to initialize game'
        };
      }
    } catch (error) {
      console.error('[ArenaGameService] Init game failed:', error);

      // Handle 400: Already have active session
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        const errorMessage = errorData?.message || errorData?.error || '';

        if (errorMessage.toLowerCase().includes('already have') &&
            errorMessage.toLowerCase().includes('session')) {

          console.log('[ArenaGameService] Active session detected, attempting auto-end and retry');

          const existingSessionId = errorData?.sessionId || errorData?.additionalData?.sessionId;

          if (existingSessionId) {
            try {
              await this.endGame(existingSessionId);
              console.log('[ArenaGameService] Old session ended, retrying initialization');

              // Retry initialization
              return await this.initGame(streamUrl);
            } catch (endError) {
              console.error('[ArenaGameService] Failed to end old session:', endError);
              return {
                success: false,
                error: 'Failed to end previous session. Please try again.'
              };
            }
          }
        }
      }

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to initialize game'
      };
    }
  }

  /**
   * Connect WebSocket server with proper URL cleaning and authentication
   * @returns {Promise<boolean>} - Connection success status
   */
  async connectWebSocket() {
    if (!this.gameState?.sessionId) {
      console.error('[ArenaGameService] Cannot connect WebSocket: No session ID');
      return false;
    }

    try {
      const { sessionId, websocketUrl, arenaGameId } = this.gameState;

      // ============================================
      // CONNECTION 1: Backend Local WebSocket (EXISTING CODE)
      // ============================================

      console.log('[ArenaGameService] Setting up backend local WebSocket connection...');

      if (this.socket && this.isConnected) {
        console.warn('[ArenaGameService] Backend WebSocket already connected');
      } else {
        debugWebSocket('CONNECTION_START', {
          sessionId,
          originalWebsocketUrl: websocketUrl,
          fallbackUrl: ARENA_CONFIG.WS_BASE_URL
        });

        // Get authentication tokens
        const token = this.userToken || getUserToken();
        const appId = ARENA_CONFIG.VORLD_APP_ID;

        if (!token) {
          console.error('[ArenaGameService] Cannot connect WebSocket: No authentication token');
          return false;
        }

        // ✅ FIXED: Clean WebSocket URL to remove /ws/ path (prevents Invalid namespace)
        let finalUrl, finalSessionId;

        if (websocketUrl) {
          // Clean the backend-provided URL and extract session ID
          finalUrl = cleanWebSocketUrl(websocketUrl);
          finalSessionId = this.extractSessionIdFromGamestate() || sessionId;

          debugWebSocket('URL_CLEANING', {
            originalUrl: websocketUrl,
            cleanedUrl: finalUrl,
            sessionId: finalSessionId
          });
        } else {
          // Use base URL with session ID in query
          finalUrl = ARENA_CONFIG.WS_BASE_URL;
          finalSessionId = sessionId;
        }

        // ✅ FIXED: Validate configuration before connection
        const validation = validateWebSocketConfig(finalUrl, token, appId);
        if (!validation.valid) {
          console.error('[ArenaGameService] Invalid WebSocket configuration:', validation.errors);
          return false;
        }

        if (validation.warnings.length > 0) {
          console.warn('[ArenaGameService] WebSocket configuration warnings:', validation.warnings);
        }

        // ✅ CRITICAL FIX: Connect to NAMESPACE path instead of base URL
        // Backend expects clients to connect to /ws/sess_[sessionId] namespace
        const namespacePath = `/ws/${finalSessionId}`;
        const namespaceUrl = finalUrl + namespacePath;

        console.log('[ArenaGameService] 🔧 CRITICAL FIX: Connecting to namespace...', {
          baseUrl: finalUrl,
          namespacePath: namespacePath,
          namespaceUrl: namespaceUrl,
          sessionId: finalSessionId,
          hasToken: !!token,
          hasAppId: !!appId,
          note: 'Backend emits to namespace, not base URL!'
        });

        // ✅ FIXED: Create proper socket configuration with appId in auth
        const { config } = createSocketConfig({
          url: namespaceUrl,  // ← Connect to NAMESPACE URL
          token: token,
          appId: appId,
          sessionId: finalSessionId,
          transports: ['websocket'],
          timeout: 10000,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: this.maxReconnectAttempts
        });

        debugWebSocket('SOCKET_CONFIG', {
          url: namespaceUrl,
          hasAuth: !!config.auth,
          authKeys: config.auth ? Object.keys(config.auth) : [],
          hasQuery: !!config.query,
          queryKeys: config.query ? Object.keys(config.query) : [],
          transports: config.transports
        });

        console.log('[ArenaGameService] Connecting backend local WebSocket to namespace...', {
          sessionId: finalSessionId,
          namespaceUrl: namespaceUrl,
          namespacePath: namespacePath,
          hasToken: !!token,
          hasAppId: !!appId,
          appId: appId,
          authProvided: !!config.auth
        });

        // Create backend socket connection to NAMESPACE
        this.socket = io(namespaceUrl, config);

        // Setup event listeners for backend socket
        this.setupEventListeners();
      }

      // ============================================
      // CONNECTION 2: Arena Direct WebSocket (NEW CODE)
      // ============================================

      try {
        // ✅ ÁP DỤNG LOGIC TỪ BACKEND - Parse URL đúng cách
        let arenaWebsocketUrl = this.gameState?.arenaWebsocketUrl || this.gameState?.externalArenaUrl;

        console.log('[ArenaGameService] Setting up DIRECT Arena WebSocket connection...');
        console.log('[ArenaGameService] Original Arena URL from backend:', arenaWebsocketUrl);

        // Validate URL
        if (!arenaWebsocketUrl) {
          console.warn('[ArenaGameService] ⚠️ No Arena WebSocket URL provided');
          return;
        }

        // ✅ FIX: Parse URL như backend đã làm
        let baseUrl, namespacePath;

        if (arenaWebsocketUrl.includes('/ws/')) {
          const urlParts = arenaWebsocketUrl.split('/ws/');
          baseUrl = urlParts[0];
          namespacePath = '/ws/' + urlParts[1];
        } else {
          // Fallback nếu URL không có /ws/
          baseUrl = arenaWebsocketUrl;
          namespacePath = '/';
        }

        console.log('[ArenaGameService] ✅ Parsed Arena URL:', {
          baseUrl: baseUrl,
          namespacePath: namespacePath,
          originalUrl: arenaWebsocketUrl
        });

        // Validate baseUrl phải là Arena server
        if (!baseUrl.includes('airdrop-arcade.onrender.com')) {
          console.warn('[ArenaGameService] ⚠️ Invalid Arena base URL:', baseUrl);
          return;
        }

        // Connect với base URL (KHÔNG dùng namespacePath trong io())
        this.arenaSocket = io(baseUrl, {
          auth: {
            token: this.vorldToken || getVorldToken(),
            gameId: this.gameState?.arenaGameId
          },
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 10000
        });

        console.log('[ArenaGameService] 🔗 Attempting direct connection to Arena base URL:', baseUrl);

        // ✅ FIX: Thêm logic join sau khi connect
        this.arenaSocket.on('connect', () => {
          console.log('[ArenaGameService] ✅ Connected to Arena base URL, joining room:', namespacePath);

          // Join với nhiều cách để đảm bảo
          if (namespacePath && namespacePath !== '/') {
            const roomId = namespacePath.replace('/ws/', '');
            console.log('[ArenaGameService] 📤 Sending join events for room:', roomId);

            this.arenaSocket.emit('join', roomId);
            this.arenaSocket.emit('join_game', { gameId: this.gameState?.arenaGameId });
            this.arenaSocket.emit('join_arena', { gameId: this.gameState?.arenaGameId });
          }
        });

        // Setup Arena direct connection event listeners
        this.setupArenaEventListeners();

      } catch (error) {
        console.error('[ArenaGameService] ❌ Failed to setup Arena connection:', {
          error: error.message,
          stack: error.stack
        });
      }

      // ============================================
      // WAIT FOR BACKEND CONNECTION (Primary)
      // ============================================

      // Return connection promise for backend socket (primary connection)
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.error('[ArenaGameService] Backend connection timeout after 15s');
          this.isConnected = false;
          resolve(false);
        }, 15000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          console.log('[ArenaGameService] ✅ Backend WebSocket connected to NAMESPACE successfully');
          debugWebSocket('CONNECTION_SUCCESS', {
            socketId: this.socket.id,
            connected: true,
            sessionId: sessionId,
            namespace: this.socket.nsp  // ← Show namespace we connected to
          });

          console.log('[ArenaGameService] 🔥 NAMESPACE CONNECTION SUCCESS:', {
            namespace: this.socket.nsp,  // Should be /ws/sess_...
            socketId: this.socket.id,
            sessionId: sessionId,
            note: 'Now receiving events from backend namespace!'
          });

          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Auto join session (not needed when connecting to namespace, but keep for compatibility)
          this.joinSession();

          // Log overall connection status
          console.log('[ArenaGameService] ✅ Dual WebSocket setup complete:', {
            backendSocket: !!this.socket,
            backendNamespace: this.socket.nsp,
            arenaSocket: !!this.arenaSocket,
            sessionId: sessionId,
            arenaGameId: arenaGameId
          });

          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('[ArenaGameService] ❌ Backend WebSocket connection error:', {
            message: error.message,
            description: error.description,
            context: error.context,
            type: error.type
          });

          debugWebSocket('CONNECTION_ERROR', {
            error: error.message,
            url: websocketUrl,
            hasAuth: !!this.userToken,
            sessionId: sessionId
          });

          this.isConnected = false;
          resolve(false);
        });
      });

    } catch (error) {
      console.error('[ArenaGameService] ❌ WebSocket connection failed:', error);
      debugWebSocket('CONNECTION_FAILED', {
        error: error.message,
        stack: error.stack,
        sessionId: this.gameState?.sessionId
      });
      return false;
    }
  }

  /**
   * Helper method to extract session ID from game state WebSocket URL
   * @returns {string|null} Session ID or null
   */
  extractSessionIdFromGamestate() {
    if (!this.gameState?.websocketUrl) return null;

    // Extract session ID from /ws/SESSION_ID pattern
    const urlParts = this.gameState.websocketUrl.split('/ws/');
    if (urlParts.length > 1) {
      return urlParts[1].split('?')[0].split('#')[0];
    }

    return null;
  }

  /**
   * Setup WebSocket event listeners (Backend Local Socket)
   */
  setupEventListeners() {
    if (!this.socket) return;

    console.log('[ArenaGameService] Setting up backend WebSocket event listeners...');

    // Connection events
    this.socket.on('connect', () => {
      console.log('[ArenaGameService] ✅ Backend WebSocket connected');
      this._emit('connected', { socketId: this.socket.id, source: 'backend' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[ArenaGameService] ❌ Backend WebSocket disconnected:', reason);
      this.isConnected = false;
      this._emit('disconnected', { reason, source: 'backend' });
    });

    this.socket.on('connect_error', (error) => {
      console.error('[ArenaGameService] ❌ Backend WebSocket error:', error.message);
      this._emit('error', { type: 'backend_connection_error', message: error.message });
    });

    // Backend-specific events
    this.socket.on('heartbeat', (data) => {
      console.log('[ArenaGameService] 📥 Backend heartbeat:', data);
      this._emit('heartbeat', data);
    });

    this.socket.on('arena:joined', (data) => {
      console.log('[ArenaGameService] 📥 Backend arena joined:', data);
      this._emit('arena:joined', data);
    });

    // Listen for arena notifications from backend
    this.socket.on('arena_notification', (data) => {
      console.log('🎁 Arena notification received from backend:', data);

      // Dispatch as window event for UI components
      window.dispatchEvent(new CustomEvent('arena:notification', {
        detail: data
      }));

      // Also emit through internal event system
      this._emit('arena_notification', data);
    });

    // Arena countdown events (from backend)
    this.socket.on('ARENA_COUNTDOWN_START', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: ARENA_COUNTDOWN_START', data);
      this.onArenaCountdownStarted?.(data);
      this._emit('countdown_started', { ...data, source: 'backend' });
    });

    this.socket.on('countdown_update', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: countdown_update', data);
      this.onCountdownUpdate?.(data);
      this._emit('countdown_update', { ...data, source: 'backend' });
    });

    this.socket.on('ARENA_ACTIVE', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: ARENA_ACTIVE', data);
      this.onArenaBegins?.(data);
      this._emit('arena_begins', { ...data, source: 'backend' });
    });

    // Boost events (from backend)
    this.socket.on('BOOST_RECEIVED', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: BOOST_RECEIVED', data);
      this.onPlayerBoostActivated?.(data);
      this._emit('player_boosted', { ...data, source: 'backend' });
    });

    this.socket.on('boost_cycle_update', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: boost_cycle_update', data);
      this.onBoostCycleUpdate?.(data);
      this._emit('boost_cycle_update', { ...data, source: 'backend' });
    });

    // Item/Package events (from backend)
    this.socket.on('ITEM_RECEIVED', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: ITEM_RECEIVED', data);
      this.onPackageDrop?.(data);
      this._emit('item_dropped', { ...data, source: 'backend' });
    });

    this.socket.on('immediate_item_drop', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: immediate_item_drop', data);
      this.onImmediateItemDrop?.(data);
      this._emit('immediate_item_drop', { ...data, source: 'backend' });
    });

    // Session events (from backend)
    this.socket.on('session_created', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: session_created', data);
      this._emit('session_created', { ...data, source: 'backend' });
    });

    this.socket.on('session_activated', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: session_activated', data);
      this._emit('session_activated', { ...data, source: 'backend' });
    });

    this.socket.on('session_ended', (data) => {
      console.log('[ArenaGameService] 📥 Backend Event: session_ended', data);
      this.onSessionEnded?.(data);
      this._emit('session_ended', { ...data, source: 'backend' });
      this.isConnected = false;
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('[ArenaGameService] ❌ Backend socket error:', error);
      this.onError?.(error);
      this._emit('error', { type: 'backend_server_error', error });
    });

    // Debug: Log all backend events
    if (ENV.ENABLE_DEBUG) {
      this.socket.onAny((eventName, data) => {
        if (eventName !== 'connect' && eventName !== 'disconnect') {
          console.log(`[ArenaGameService] 📥 Backend Event: ${eventName}`, data);
        }
      });
    }
  }

  /**
   * Setup Arena Direct WebSocket Event Listeners (NEW METHOD)
   */
  setupArenaEventListeners() {
    if (!this.arenaSocket) return;

    console.log('[ArenaGameService] Setting up Arena direct WebSocket event listeners...');

    // Arena connection events
    this.arenaSocket.on('connect', () => {
      console.log('[ArenaGameService] ✅ Connected DIRECTLY to Arena WebSocket!', {
        socketId: this.arenaSocket.id,
        arenaGameId: this.gameState?.arenaGameId,
        url: this.gameState?.websocketUrl
      });

      this.arenaConnected = true;

      // ✅ Logic join đã được xử lý ở trên (trong connectWebSocket)
      // Không cần duplicate ở đây vì đã có trong connectWebSocket

      console.log('[ArenaGameService] 📡 Listening for Arena events...');
      this._emit('arena_connected', {
        socketId: this.arenaSocket.id,
        source: 'arena_direct'
      });
    });

    // Arena connection error
    this.arenaSocket.on('connect_error', (error) => {
      console.error('[ArenaGameService] ❌ Arena connection error:', {
        error: error.message,
        gameId: this.gameState?.arenaGameId,
        originalUrl: this.gameState?.arenaWebsocketUrl || this.gameState?.externalArenaUrl
      });

      this.arenaConnected = false;
      this._emit('error', {
        source: 'arena_direct',
        type: 'arena_connection_error',
        message: error.message
      });
    });

    // Arena disconnect
    this.arenaSocket.on('disconnect', (reason) => {
      console.warn('[ArenaGameService] ⚠️ Arena disconnected:', {
        reason,
        gameId: this.gameState?.arenaGameId
      });

      this.arenaConnected = false;
      this._emit('arena_disconnected', { reason, source: 'arena_direct' });
    });

    // ============================================
    // ARENA DIRECT EVENTS - Nhận package drops
    // ============================================

    // Package dropped event
    this.arenaSocket.on('package:dropped', (data) => {
      console.log('[ArenaGameService] 📦 PACKAGE DROPPED from Arena!', data);

      // Forward to local event system
      this._emit('item_dropped', {
        ...data,
        package: data.package || data.name,
        amount: data.amount || data.value,
        player: data.player || data.target,
        timestamp: data.timestamp || Date.now(),
        source: 'arena_direct'
      });

      // Also call the callback if exists
      this.onPackageDrop?.(data);
    });

    // Alternative event name
    this.arenaSocket.on('item_dropped', (data) => {
      console.log('[ArenaGameService] 📦 ITEM DROPPED from Arena!', data);
      this._emit('item_dropped', { ...data, source: 'arena_direct' });
      this.onPackageDrop?.(data);
    });

    // Boost applied event
    this.arenaSocket.on('boost:applied', (data) => {
      console.log('[ArenaGameService] ⚡ BOOST APPLIED from Arena!', data);
      this._emit('player_boosted', { ...data, source: 'arena_direct' });
      this.onPlayerBoostActivated?.(data);
    });

    this.arenaSocket.on('player_boosted', (data) => {
      console.log('[ArenaGameService] ⚡ PLAYER BOOSTED from Arena!', data);
      this._emit('player_boosted', { ...data, source: 'arena_direct' });
      this.onPlayerBoostActivated?.(data);
    });

    // Arena notification event
    this.arenaSocket.on('arena_notification', (data) => {
      console.log('[ArenaGameService] 📢 ARENA NOTIFICATION received:', data);

      // Emit as window event for UI components
      window.dispatchEvent(new CustomEvent('arena:notification', {
        detail: {
          type: data.type || 'info',
          message: data.message,
          title: data.title,
          data: data.data,
          timestamp: Date.now()
        }
      }));

      // Also emit to internal event system
      this._emit('arena_notification', { ...data, source: 'arena_direct' });
    });

    // Countdown started
    this.arenaSocket.on('countdown_started', (data) => {
      console.log('[ArenaGameService] ⏱️ COUNTDOWN STARTED from Arena!', data);
      this._emit('countdown_started', { ...data, source: 'arena_direct' });
      this.onArenaCountdownStarted?.(data);
    });

    this.arenaSocket.on('game:countdown_started', (data) => {
      console.log('[ArenaGameService] ⏱️ COUNTDOWN from Arena!', data);
      this._emit('countdown_started', { ...data, source: 'arena_direct' });
      this.onArenaCountdownStarted?.(data);
    });

    // Arena begins
    this.arenaSocket.on('arena_begins', (data) => {
      console.log('[ArenaGameService] 🎮 ARENA BEGINS from Arena!', data);
      this._emit('arena_begins', { ...data, source: 'arena_direct' });
      this.onArenaBegins?.(data);
    });

    this.arenaSocket.on('game:arena_begins', (data) => {
      console.log('[ArenaGameService] 🎮 GAME STARTS from Arena!', data);
      this._emit('arena_begins', { ...data, source: 'arena_direct' });
      this.onArenaBegins?.(data);
    });

    // Session ended
    this.arenaSocket.on('session_ended', (data) => {
      console.log('[ArenaGameService] 🏁 SESSION ENDED from Arena!', data);
      this._emit('session_ended', { ...data, source: 'arena_direct' });
      this.onSessionEnded?.(data);
    });

    this.arenaSocket.on('game:session_ended', (data) => {
      console.log('[ArenaGameService] 🏁 GAME ENDED from Arena!', data);
      this._emit('session_ended', { ...data, source: 'arena_direct' });
      this.onSessionEnded?.(data);
    });

    // Error events
    this.arenaSocket.on('error', (error) => {
      console.error('[ArenaGameService] ❌ Arena error event:', error);
      this._emit('error', { source: 'arena_direct', error });
      this.onError?.(error);
    });

    // Catch-all for debugging - Log ALL Arena events
    this.arenaSocket.onAny((eventName, ...args) => {
      console.log('[ArenaGameService] 📥 RAW Arena Event:', {
        event: eventName,
        data: args[0]
      });
    });

    console.log('[ArenaGameService] ✅ Arena event listeners registered');
  }

  // ==========================================
  // ARENA ACTIONS
  // ==========================================

  /**
   * End an active game session
   * @param {string} sessionId - Session ID (optional, uses current session)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async endGame(sessionId = null) {
    try {
      const targetSessionId = sessionId || this.gameState?.sessionId;

      if (!targetSessionId) {
        return { success: false, error: 'No session ID provided' };
      }

      console.log('[ArenaGameService] Ending game session:', targetSessionId);

      const apiClient = axios.create({
        baseURL: ARENA_CONFIG.API_URL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': ARENA_CONFIG.VORLD_APP_ID
        }
      });

      const token = this.userToken || sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
      if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.post(`/api/arena/games/${targetSessionId}/end`, {});

      // Disconnect WebSocket
      this.disconnect();

      console.log('[ArenaGameService] Game session ended successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[ArenaGameService] Failed to end game session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Boost a player with chips
   * @param {string} sessionId - Session ID
   * @param {string} playerId - Player ID
   * @param {number} amount - Boost amount
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async boostPlayer(sessionId, playerId, amount) {
    try {
      console.log('[ArenaGameService] Boosting player...', { sessionId, playerId, amount });

      const apiClient = axios.create({
        baseURL: ARENA_CONFIG.API_URL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': ARENA_CONFIG.VORLD_APP_ID
        }
      });

      const token = this.userToken || sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
      if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.post('/api/arena/boost', {
        sessionId,
        targetUserId: playerId,
        amount
      });

      console.log('[ArenaGameService] Boost successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[ArenaGameService] Boost failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Drop an item to a player
   * @param {string} sessionId - Session ID
   * @param {string} itemId - Item ID
   * @param {string} targetUserId - Target user ID
   * @param {number} quantity - Item quantity
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async dropItem(sessionId, itemId, targetUserId, quantity = 1) {
    try {
      console.log('[ArenaGameService] Dropping item...', { sessionId, itemId, targetUserId, quantity });

      const apiClient = axios.create({
        baseURL: ARENA_CONFIG.API_URL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': ARENA_CONFIG.VORLD_APP_ID
        }
      });

      const token = this.userToken || sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
      if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.post('/api/arena/item-drop', {
        sessionId,
        itemId,
        targetUserId,
        quantity
      });

      console.log('[ArenaGameService] Item dropped successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[ArenaGameService] Drop item failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get items catalog
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} category - Category filter
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getItemsCatalog(page = 1, limit = 10, category = '') {
    try {
      console.log('[ArenaGameService] Fetching items catalog...', { page, limit, category });

      const apiClient = axios.create({
        baseURL: ARENA_CONFIG.API_URL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': ARENA_CONFIG.VORLD_APP_ID
        }
      });

      const token = this.userToken || sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
      if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get('/api/arena/items-catalog', {
        params: { page, limit, category }
      });

      console.log('[ArenaGameService] Items catalog loaded:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[ArenaGameService] Get catalog failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Set authentication tokens
   * @param {string} userToken - Backend JWT token
   * @param {string} vorldToken - Vorld authentication token
   */
  setTokens(userToken, vorldToken = '') {
    this.userToken = userToken;
    this.vorldToken = vorldToken;
    console.log('[ArenaGameService] Tokens set', {
      hasUserToken: !!userToken,
      hasVorldToken: !!vorldToken
    });
  }

  /**
   * Join WebSocket session
   */
  joinSession() {
    if (!this.socket || !this.isConnected || !this.gameState?.sessionId) {
      console.warn('[ArenaGameService] Cannot join session: Not ready');
      return;
    }

    console.log('[ArenaGameService] Joining session:', this.gameState.sessionId);
    this.socket.emit('arena:join', this.gameState.sessionId);
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
        console.error(`[ArenaGameService] Handler error for ${eventName}:`, error);
      }
    });
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
    console.log(`[ArenaGameService] 📝 Registered handler for: ${eventName}`);
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
        console.log(`[ArenaGameService] 🗑️ Unregistered handler for: ${eventName}`);
      }
    }
  }

  /**
   * Disconnect WebSocket and cleanup (BOTH sockets)
   */
  disconnect() {
    console.log('[ArenaGameService] 🔌 Disconnecting all WebSocket connections...');

    // Disconnect backend local socket
    if (this.socket) {
      console.log('[ArenaGameService] Disconnecting backend local socket...');
      this.socket.disconnect();
      this.socket = null;
    }

    // Disconnect Arena direct socket
    if (this.arenaSocket) {
      console.log('[ArenaGameService] Disconnecting Arena direct socket...');
      this.arenaSocket.disconnect();
      this.arenaSocket = null;
    }

    this.isConnected = false;
    this.arenaConnected = false;
    this.gameState = null;
    this.reconnectAttempts = 0;
    this.eventHandlers.clear();

    console.log('[ArenaGameService] ✅ All WebSocket connections closed');
  }

  /**
   * Get connection status
   * @returns {Object} Connection info
   */
  getConnectionInfo() {
    return {
      // Overall status
      connected: this.isConnected,
      hasGameState: !!this.gameState,
      reconnectAttempts: this.reconnectAttempts,

      // Backend local connection
      backendConnected: this.isConnected,
      backendSocketId: this.socket?.id,

      // Arena direct connection
      arenaConnected: this.arenaConnected,
      arenaSocketId: this.arenaSocket?.id,

      // Game info
      sessionId: this.gameState?.sessionId,
      gameId: this.gameState?.gameId,
      arenaGameId: this.gameState?.arenaGameId,
      websocketUrl: this.gameState?.websocketUrl,

      // Connection summary
      dualConnectionActive: this.isConnected && this.arenaConnected
    };
  }

  // ==========================================
  // EVENT CALLBACKS (to be overridden)
  // ==========================================

  onArenaCountdownStarted = (data) => {
    console.log('[ArenaGameService] Countdown started:', data);
  }

  onCountdownUpdate = (data) => {
    console.log('[ArenaGameService] Countdown update:', data);
  }

  onArenaBegins = (data) => {
    console.log('[ArenaGameService] Arena begins:', data);
  }

  onPlayerBoostActivated = (data) => {
    console.log('[ArenaGameService] Player boost activated:', data);
  }

  onBoostCycleUpdate = (data) => {
    console.log('[ArenaGameService] Boost cycle update:', data);
  }

  onPackageDrop = (data) => {
    console.log('[ArenaGameService] Package drop:', data);
  }

  onImmediateItemDrop = (data) => {
    console.log('[ArenaGameService] Immediate item drop:', data);
  }

  onSessionEnded = (data) => {
    console.log('[ArenaGameService] Session ended:', data);
  }

  onError = (error) => {
    console.error('[ArenaGameService] Error:', error);
  }
}

// Create singleton instance
const arenaGameService = new ArenaGameService();

// Export default instance (class already exported above)
export default arenaGameService;

// Log service initialization
console.log('[ArenaGameService] Unified Arena Game Service with DUAL WebSocket support initialized and exported');
console.log('[ArenaGameService] Available methods:');
console.log('  - initializeArenaGame(options) - Method 1: With callbacks (init only)');
console.log('  - quickInitializeGame(streamUrl, userToken) - Method 2: Quick boolean (init only)');
console.log('  - initializeGameWithWebSocket(streamUrl, userToken) - Method 3: With WebSocket (init only)');
console.log('  - initializeCompleteFlow(streamUrl, userToken) - RECOMMENDED: Init → Connect WebSocket');
console.log('  - endGame(sessionId) - End session');
console.log('  - boostPlayer(sessionId, playerId, amount) - Boost player');
console.log('  - dropItem(sessionId, itemId, targetUserId, quantity) - Drop item');
console.log('  - getItemsCatalog(page, limit, category) - Get catalog');
console.log('  - setTokens(userToken, vorldToken) - Set auth tokens');
console.log('  - disconnect() - Disconnect BOTH WebSockets');
console.log('  - getConnectionInfo() - Get dual connection status');
console.log('[ArenaGameService] Flow: Init (active) → WebSocket Connect ✅ (no activation needed)');
console.log('[ArenaGameService] Dual WebSocket Connections:');
console.log('  📡 Backend Local WebSocket - heartbeat, session management');
console.log('  🎯 Arena Direct WebSocket - package drops, real-time events');
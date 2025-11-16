/**
 * Colyseus Client Service for Multiplayer Boss V2
 *
 * Handles WebSocket connection to Colyseus server
 * Room creation, joining, and management
 *
 * Server URL: ws://139.180.144.161:2567
 * Room Name: boss_battle
 */

import { Client } from "colyseus.js";

class ColyseusClient {
  constructor() {
    // ✅ Environment-aware WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_COLYSEUS_URL ||
                  `${protocol}//139.180.144.161:2567`;

    console.log('[ColyseusClient] Initializing with URL:', wsUrl);
    console.log('[ColyseusClient] Page protocol:', window.location.protocol);
    console.log('[ColyseusClient] Environment:', import.meta.env.MODE);

    this.wsUrl = wsUrl;
    this.roomName = "boss_battle";

    // Initialize Colyseus client
    this.client = new Client(this.wsUrl);
    this.currentRoom = null;

    // ✅ THÊM: Connection status tracking
    this.connectionStatus = 'disconnected';
    this.connectionAttempts = 0;

    // Event callbacks
    this.onStateChange = null;
    this.onMessage = null;
    this.onError = null;
    this.onLeave = null;

    console.log('[ColyseusClient] ✅ Client initialized');
    console.log('[ColyseusClient] WebSocket URL:', this.wsUrl);
    console.log('[ColyseusClient] Ready to create/join rooms');
  }

  /**
   * Get user-friendly error message from various error types
   * @param {Error} error - Error object
   * @returns {string} Safe error message
   */
  getErrorMessage(error) {
    // Handle ProgressEvent (Colyseus connection failures)
    if (error.constructor.name === 'ProgressEvent') {
      return 'Connection failed - Server is not reachable';
    }

    // Handle standard Error objects
    if (error.message) {
      return error.message;
    }

    // Handle error with type property
    if (error.type) {
      return `Error type: ${error.type}`;
    }

    // Fallback
    return error.toString() || 'Unknown error occurred';
  }

  /**
   * Analyze error and provide detailed cause
   * @param {Error} error - Error object
   * @returns {Object} Error analysis with suggestions
   */
  analyzeError(error) {
    const analysis = {
      type: error.constructor.name,
      message: this.getErrorMessage(error),
      isNetworkError: false,
      isTimeout: false,
      isServerError: false,
      suggestions: []
    };

    // Check for network errors
    if (error.constructor.name === 'ProgressEvent') {
      analysis.isNetworkError = true;
      analysis.suggestions.push('Check if backend server is running');
      analysis.suggestions.push('Verify port 2567 is accessible');
      analysis.suggestions.push('Check firewall settings');
    }

    // Check message content
    const msg = (error.message || '').toLowerCase();

    if (msg.includes('fetch') || msg.includes('network')) {
      analysis.isNetworkError = true;
      analysis.suggestions.push('Network connection issue detected');
    }

    if (msg.includes('timeout')) {
      analysis.isTimeout = true;
      analysis.suggestions.push('Server response timeout');
      analysis.suggestions.push('Backend may be overloaded');
    }

    if (error.code === 'ERR_FAILED' || error.code === 'ERR_CONNECTION_REFUSED') {
      analysis.isNetworkError = true;
      analysis.suggestions.push('Backend server refused connection');
    }

    return analysis;
  }

  /**
   * Create a new boss battle room
   * @param {string} bossId - Boss ID to battle
   * @param {Object} playerData - Player information
   * @returns {Promise<Object>} {success: boolean, room?: Room, error?: string}
   */
  async createRoom(bossId, playerData = {}) {
    try {
      this.connectionAttempts++;
      console.log('[ColyseusClient] ============================================');
      console.log('[ColyseusClient] CREATE ROOM ATTEMPT #' + this.connectionAttempts);
      console.log('[ColyseusClient] ============================================');
      console.log('[ColyseusClient] Boss ID:', bossId);
      console.log('[ColyseusClient] Player Data:', playerData);
      console.log('[ColyseusClient] WebSocket URL:', this.wsUrl);
      console.log('[ColyseusClient] Client state:', this.client);

      // Prepare room creation options
      const options = {
        bossId,
        userId: playerData.userId || sessionStorage.getItem('userId') || 'guest-' + Date.now(),
        characterId: playerData.characterId || 'default',
        playerName: playerData.playerName || 'Player',
        avatar: playerData.avatar || '',
        level: playerData.level || 1,
        hp: playerData.hp || 1000,
        attack: playerData.attack || 100,
        defense: playerData.defense || 50
      };

      console.log('[ColyseusClient] Room options:', options);
      console.log('[ColyseusClient] Attempting to connect to server...');

      // Test connection first
      console.log('[ColyseusClient] Testing server availability...');
      const startTime = Date.now();

      // Create room
      this.currentRoom = await this.client.create(this.roomName, options);

      const connectionTime = Date.now() - startTime;
      console.log('[ColyseusClient] ✅ Connection established in ' + connectionTime + 'ms');
      console.log('[ColyseusClient] ✅ Room created successfully!');

      // ✅ THÊM debug call
      this.debugRoomObject(this.currentRoom);

      // ✅ WORKAROUND: Dùng room.id làm room code
      // Backend log shows: [BossBattleRoom] Room 289 ready
      // → room.id hoặc sessionId chính là room code
      const roomCode = this.currentRoom.state?.roomCode ||
                       this.currentRoom.id ||
                       this.currentRoom.sessionId ||
                       'UNKNOWN';

      console.log('[ColyseusClient] 🔑 Room code (from id/session):', roomCode);

      this.connectionStatus = 'connected';

      // Setup room event listeners
      this.setupRoomListeners(this.currentRoom);

      return {
        success: true,
        room: this.currentRoom,
        roomCode: roomCode  // ✅ Use room.id instead of state.roomCode
      };

    } catch (error) {
      this.connectionStatus = 'error';

      console.error('[ColyseusClient] ============================================');
      console.error('[ColyseusClient] ❌ CREATE ROOM FAILED');
      console.error('[ColyseusClient] ============================================');
      console.error('[ColyseusClient] Error object:', error);

      // ✅ FIX: Extract error message safely
      const errorMessage = this.getErrorMessage(error);
      const analysis = this.analyzeError(error);
      const errorCode = error.code || 'NO_CODE';

      console.error('[ColyseusClient] Error message:', errorMessage);
      console.error('[ColyseusClient] Error code:', errorCode);
      console.error('[ColyseusClient] Full error:', error);
      console.error('[ColyseusClient] Stack trace:', error.stack || 'No stack trace');
      console.error('[ColyseusClient] WebSocket URL was:', this.wsUrl);
      console.error('[ColyseusClient] Room name was:', this.roomName);
      console.error('[ColyseusClient] Boss ID was:', bossId);
      console.error('[ColyseusClient] Error analysis:', analysis);

      // ✅ Display suggestions
      if (analysis.suggestions.length > 0) {
        console.error('[ColyseusClient] 💡 Suggestions:');
        analysis.suggestions.forEach((suggestion, index) => {
          console.error(`[ColyseusClient] ${index + 1}. ${suggestion}`);
        });
      }

      // ✅ Specific error type logging
      if (analysis.isNetworkError) {
        console.error('[ColyseusClient] 🔥 NETWORK ERROR DETECTED');
        console.error('[ColyseusClient] Backend server is not reachable at:', this.wsUrl);
      }

      if (analysis.isTimeout) {
        console.error('[ColyseusClient] ⏱️ TIMEOUT ERROR DETECTED');
        console.error('[ColyseusClient] Server did not respond in time');
      }

      if (error.constructor.name === 'ProgressEvent') {
        console.error('[ColyseusClient] 🔥 PROGRESS EVENT ERROR (Connection issue)');
        console.error('[ColyseusClient] This usually means:');
        console.error('[ColyseusClient] 1. Backend server is not reachable');
        console.error('[ColyseusClient] 2. Port 2567 is blocked by firewall');
        console.error('[ColyseusClient] 3. Network connection failed');
        console.error('[ColyseusClient] 4. Backend crashed or timed out');
      }

      return {
        success: false,
        error: errorMessage,
        errorType: analysis.type,
        errorCode: errorCode,
        isNetworkError: analysis.isNetworkError,
        isTimeout: analysis.isTimeout,
        suggestions: analysis.suggestions
      };
    }
  }

  /**
   * Join an existing room by room code
   * @param {string} roomCode - 3-digit room code
   * @param {Object} playerData - Player information
   * @returns {Promise<Object>} {success: boolean, room?: Room, error?: string}
   */
  async joinRoom(roomCode, playerData = {}) {
    try {
      console.log(`[ColyseusClient] Joining room with code: ${roomCode}`);

      // Get available rooms to find the one with matching code
      const rooms = await this.getAvailableRooms();
      const targetRoom = rooms.find(room => room.metadata?.roomCode === roomCode);

      if (!targetRoom) {
        return {
          success: false,
          error: `Room with code ${roomCode} not found`
        };
      }

      // Prepare join options
      const options = {
        userId: playerData.userId || sessionStorage.getItem('userId') || 'guest-' + Date.now(),
        characterId: playerData.characterId || 'default',
        playerName: playerData.playerName || 'Player',
        avatar: playerData.avatar || '',
        level: playerData.level || 1,
        hp: playerData.hp || 1000,
        attack: playerData.attack || 100,
        defense: playerData.defense || 50
      };

      console.log(`[ColyseusClient] Join options:`, options);

      // Join room by ID
      this.currentRoom = await this.client.joinById(targetRoom.roomId, options);

      console.log('[ColyseusClient] ✅ Successfully joined room!');
      console.log('[ColyseusClient] Room ID:', this.currentRoom.id);
      console.log('[ColyseusClient] Session ID:', this.currentRoom.sessionId);

      // ✅ Use room.id as room code
      const resolvedRoomCode = this.currentRoom.state?.roomCode ||
                               this.currentRoom.id ||
                               this.currentRoom.sessionId ||
                               roomCode;

      console.log('[ColyseusClient] 🔑 Room code:', resolvedRoomCode);

      // Setup room event listeners
      this.setupRoomListeners(this.currentRoom);

      console.log(`[ColyseusClient] Joined room: ${this.currentRoom.id}`);

      return {
        success: true,
        room: this.currentRoom,
        roomCode: resolvedRoomCode  // ✅ Use room.id
      };

    } catch (error) {
      console.error('[ColyseusClient] ============================================');
      console.error('[ColyseusClient] ❌ JOIN ROOM FAILED');
      console.error('[ColyseusClient] ============================================');
      console.error('[ColyseusClient] Error object:', error);

      // ✅ Use helper methods
      const errorMessage = this.getErrorMessage(error);
      const analysis = this.analyzeError(error);

      console.error('[ColyseusClient] Error:', errorMessage);
      console.error('[ColyseusClient] Analysis:', analysis);

      if (analysis.suggestions.length > 0) {
        console.error('[ColyseusClient] 💡 Suggestions:');
        analysis.suggestions.forEach((suggestion, index) => {
          console.error(`[ColyseusClient] ${index + 1}. ${suggestion}`);
        });
      }

      return {
        success: false,
        error: errorMessage,
        errorType: analysis.type,
        isNetworkError: analysis.isNetworkError,
        isTimeout: analysis.isTimeout,
        suggestions: analysis.suggestions
      };
    }
  }

  /**
   * Join room by ID (alternative method)
   * @param {string} roomId - Room ID
   * @param {Object} playerData - Player information
   * @returns {Promise<Object>} {success: boolean, room?: Room, error?: string}
   */
  async joinRoomById(roomId, playerData = {}) {
    try {
      console.log(`[ColyseusClient] Joining room by ID: ${roomId}`);

      // Prepare join options
      const options = {
        userId: playerData.userId || sessionStorage.getItem('userId') || 'guest-' + Date.now(),
        characterId: playerData.characterId || 'default',
        playerName: playerData.playerName || 'Player',
        avatar: playerData.avatar || '',
        level: playerData.level || 1,
        hp: playerData.hp || 1000,
        attack: playerData.attack || 100,
        defense: playerData.defense || 50
      };

      console.log(`[ColyseusClient] Join options:`, options);

      // Join room by ID
      this.currentRoom = await this.client.joinById(roomId, options);

      console.log('[ColyseusClient] ✅ Successfully joined room!');
      console.log('[ColyseusClient] Room ID:', this.currentRoom.id);
      console.log('[ColyseusClient] Session ID:', this.currentRoom.sessionId);

      // ✅ Use room.id as room code
      const roomCode = this.currentRoom.state?.roomCode ||
                       this.currentRoom.id ||
                       this.currentRoom.sessionId ||
                       roomId;

      console.log('[ColyseusClient] 🔑 Room code:', roomCode);

      // Setup room event listeners
      this.setupRoomListeners(this.currentRoom);

      console.log(`[ColyseusClient] Joined room: ${this.currentRoom.id}`);

      return {
        success: true,
        room: this.currentRoom,
        roomCode: roomCode  // ✅ Use room.id
      };

    } catch (error) {
      console.error('[ColyseusClient] ============================================');
      console.error('[ColyseusClient] ❌ JOIN ROOM BY ID FAILED');
      console.error('[ColyseusClient] ============================================');
      console.error('[ColyseusClient] Error object:', error);

      // ✅ Use helper methods
      const errorMessage = this.getErrorMessage(error);
      const analysis = this.analyzeError(error);

      console.error('[ColyseusClient] Error:', errorMessage);
      console.error('[ColyseusClient] Analysis:', analysis);

      if (analysis.suggestions.length > 0) {
        console.error('[ColyseusClient] 💡 Suggestions:');
        analysis.suggestions.forEach((suggestion, index) => {
          console.error(`[ColyseusClient] ${index + 1}. ${suggestion}`);
        });
      }

      return {
        success: false,
        error: errorMessage,
        errorType: analysis.type,
        isNetworkError: analysis.isNetworkError,
        isTimeout: analysis.isTimeout,
        suggestions: analysis.suggestions
      };
    }
  }

  /**
   * Get list of available rooms
   * @returns {Promise<Array>} Array of available rooms
   */
  async getAvailableRooms() {
    try {
      console.log('[ColyseusClient] Fetching available rooms');

      // Check if method exists
      if (!this.client.getAvailableRooms) {
        console.warn('[ColyseusClient] getAvailableRooms method not found');
        console.warn('[ColyseusClient] Available methods:', Object.keys(this.client));
        return [];
      }

      // Method exists - use it
      const rooms = await this.client.getAvailableRooms(this.roomName);
      console.log(`[ColyseusClient] Found ${rooms.length} available rooms`);
      return rooms || [];

    } catch (error) {
      console.error('[ColyseusClient] Error fetching rooms:', error.message);
      return [];
    }
  }

  /**
   * Leave current room
   */
  leaveRoom() {
    if (this.currentRoom) {
      console.log(`[ColyseusClient] Leaving room: ${this.currentRoom.id}`);
      this.currentRoom.leave();
      this.currentRoom = null;
    }
  }

  /**
   * Send message to current room
   * @param {string} type - Message type
   * @param {Object} data - Message data
   */
  sendMessage(type, data = {}) {
    if (this.currentRoom && this.currentRoom.connection) {
      console.log(`[ColyseusClient] Sending message: ${type}`, data);
      this.currentRoom.send(type, data);
    } else {
      console.warn(`[ColyseusClient] Cannot send message - not in a room`);
    }
  }

  /**
   * Debug room object to find available properties
   */
  debugRoomObject(room) {
    console.log('[ColyseusClient] ============================================');
    console.log('[ColyseusClient] 🔍 DEBUG ROOM OBJECT');
    console.log('[ColyseusClient] ============================================');
    console.log('[ColyseusClient] Room ID:', room.id);
    console.log('[ColyseusClient] Session ID:', room.sessionId);
    console.log('[ColyseusClient] Room name:', room.name);
    console.log('[ColyseusClient] Room properties:', Object.keys(room));

    if (room.state) {
      console.log('[ColyseusClient] State type:', room.state.constructor?.name);
      console.log('[ColyseusClient] State properties:', Object.keys(room.state));
      console.log('[ColyseusClient] State values:');

      // Try to access common properties
      const stateProps = ['roomId', 'roomCode', 'phase', 'boss', 'players'];
      stateProps.forEach(prop => {
        try {
          console.log(`[ColyseusClient]   ${prop}:`, room.state[prop]);
        } catch (e) {
          console.log(`[ColyseusClient]   ${prop}: ERROR -`, e.message);
        }
      });
    }

    if (room.metadata) {
      console.log('[ColyseusClient] Metadata:', room.metadata);
    }

    console.log('[ColyseusClient] ============================================');
  }

  /**
   * Setup room event listeners
   */
  setupRoomListeners(room) {
    if (!room) {
      console.error('[ColyseusClient] Cannot setup listeners - room is undefined');
      return;
    }

    console.log('[ColyseusClient] Setting up room listeners...');

    // State change listener (main sync mechanism)
    room.onStateChange((state) => {
      console.log('[ColyseusClient] 🔄 State changed:', state);

      // ✅ THÊM: Log để debug schema
      console.log('[ColyseusClient] State type:', state.constructor?.name);
      console.log('[ColyseusClient] State properties:', Object.keys(state));

      if (this.onStateChange) {
        this.onStateChange(state);
      }
    });

    // ✅ THAY WILDCARD BẰNG SPECIFIC LISTENERS
    room.onMessage('player-joined', (message) => {
      console.log('[ColyseusClient] 📨 Player joined:', message);
    });

    room.onMessage('player-left', (message) => {
      console.log('[ColyseusClient] 📨 Player left:', message);
    });

    room.onMessage('player-ready', (message) => {
      console.log('[ColyseusClient] 📨 Player ready:', message);
    });

    room.onMessage('battle-starting', (message) => {
      console.log('[ColyseusClient] 📨 Battle starting:', message);
    });

    room.onMessage('battle-started', (message) => {
      console.log('[ColyseusClient] 📨 Battle started:', message);
    });

    room.onMessage('player-attacked', (message) => {
      console.log('[ColyseusClient] 📨 Player attacked:', message);
    });

    room.onMessage('boss-attacked', (message) => {
      console.log('[ColyseusClient] 📨 Boss attacked:', message);
    });

    room.onMessage('battle-ended', (message) => {
      console.log('[ColyseusClient] 📨 Battle ended:', message);
    });

    // Error handling
    room.onError((error) => {
      console.error(`[ColyseusClient] ❌ Room error:`, error);

      if (this.onError) {
        this.onError(error);
      }
    });

    // Leave handling
    room.onLeave((code) => {
      console.log(`[ColyseusClient] 👋 Left room with code:`, code);
      this.connectionStatus = 'disconnected';

      if (this.onLeave) {
        this.onLeave();
      }
    });

    console.log(`[ColyseusClient] ✅ Room listeners setup complete`);
  }

  /**
   * Get current room state
   * @returns {Object|null} Current room state
   */
  getCurrentState() {
    return this.currentRoom ? this.currentRoom.state : null;
  }

  /**
   * Get current room info
   * @returns {Object|null} Room info
   */
  getRoomInfo() {
    if (!this.currentRoom) return null;

    return {
      roomId: this.currentRoom.id,
      roomCode: this.currentRoom.state.roomCode,
      playerCount: this.currentRoom.state.players.size,
      phase: this.currentRoom.state.phase,
      boss: this.currentRoom.state.boss
    };
  }

  /**
   * Check if connected to a room
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.currentRoom && this.currentRoom.connection;
  }

  /**
   * Set event callbacks
   * @param {Object} callbacks - Event callback functions
   */
  setCallbacks(callbacks) {
    this.onStateChange = callbacks.onStateChange || null;
    this.onMessage = callbacks.onMessage || null;
    this.onError = callbacks.onError || null;
    this.onLeave = callbacks.onLeave || null;
  }

  /**
   * Get connection status
   * @returns {Object} Connection status
   */
  getStatus() {
    return {
      connected: this.isConnected(),
      roomId: this.currentRoom?.id || null,
      roomCode: this.currentRoom?.state?.roomCode || null,
      wsUrl: this.wsUrl,
      roomName: this.roomName,
      connectionStatus: this.connectionStatus,
      connectionAttempts: this.connectionAttempts
    };
  }

  /**
   * Test server connection
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    console.log('[ColyseusClient] ============================================');
    console.log('[ColyseusClient] TESTING SERVER CONNECTION');
    console.log('[ColyseusClient] ============================================');
    console.log('[ColyseusClient] URL:', this.wsUrl);

    try {
      // Try to get available rooms
      const rooms = await this.client.getAvailableRooms(this.roomName);

      console.log('[ColyseusClient] ✅ Connection test PASSED');
      console.log('[ColyseusClient] Server is reachable');
      console.log('[ColyseusClient] Available rooms:', rooms.length);
      console.log('[ColyseusClient] Rooms:', rooms);

      return {
        success: true,
        available: true,
        roomCount: rooms.length,
        rooms: rooms
      };

    } catch (error) {
      console.error('[ColyseusClient] ❌ Connection test FAILED');
      console.error('[ColyseusClient] Error:', error.message);
      console.error('[ColyseusClient] Server is NOT reachable');

      return {
        success: false,
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Comprehensive connection diagnostic
   * @returns {Promise<Object>} Diagnostic report
   */
  async diagnoseConnection() {
    console.log('[ColyseusClient] ============================================');
    console.log('[ColyseusClient] CONNECTION DIAGNOSTIC');
    console.log('[ColyseusClient] ============================================');

    const report = {
      timestamp: new Date().toISOString(),
      pageProtocol: window.location.protocol,
      pageUrl: window.location.href,
      wsUrl: this.wsUrl,
      clientState: this.connectionStatus,
      attempts: this.connectionAttempts
    };

    console.log('[ColyseusClient] Diagnostic Report:', report);

    // Test HTTP endpoint
    try {
      const httpUrl = this.wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
      console.log('[ColyseusClient] Testing HTTP endpoint:', httpUrl + '/health');

      const response = await fetch(httpUrl + '/health', {
        method: 'GET',
        mode: 'cors'
      });

      const data = await response.json();
      console.log('[ColyseusClient] ✅ HTTP endpoint reachable');
      console.log('[ColyseusClient] Health check:', data);
      report.httpReachable = true;
      report.healthCheck = data;

    } catch (error) {
      console.error('[ColyseusClient] ❌ HTTP endpoint unreachable');
      console.error('[ColyseusClient] Error:', error.message);
      report.httpReachable = false;
      report.httpError = error.message;
    }

    // Test WebSocket
    try {
      console.log('[ColyseusClient] Testing WebSocket connection:', this.wsUrl);

      const testWs = new WebSocket(this.wsUrl);

      await new Promise((resolve, reject) => {
        testWs.onopen = () => {
          console.log('[ColyseusClient] ✅ WebSocket connection opened');
          report.wsReachable = true;
          testWs.close();
          resolve();
        };

        testWs.onerror = (error) => {
          console.error('[ColyseusClient] ❌ WebSocket connection failed');
          console.error('[ColyseusClient] Error:', error);
          report.wsReachable = false;
          reject(error);
        };

        setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 5000);
      });

    } catch (error) {
      console.error('[ColyseusClient] ❌ WebSocket test failed');
      console.error('[ColyseusClient] Error:', error.message);
      report.wsReachable = false;
      report.wsError = error.message;
    }

    console.log('[ColyseusClient] ============================================');
    console.log('[ColyseusClient] DIAGNOSTIC COMPLETE');
    console.log('[ColyseusClient] ============================================');
    console.log('[ColyseusClient] Full Report:', report);

    return report;
  }
}

// Export singleton instance
export default new ColyseusClient();
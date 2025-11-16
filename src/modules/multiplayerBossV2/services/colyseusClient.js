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
    // Get WebSocket URL from environment or use staging default
    this.wsUrl = import.meta.env.VITE_COLYSEUS_URL || "ws://139.180.144.161:2567";
    this.roomName = "boss_battle";

    // Initialize Colyseus client
    this.client = new Client(this.wsUrl);
    this.currentRoom = null;

    // Event callbacks
    this.onStateChange = null;
    this.onMessage = null;
    this.onError = null;
    this.onLeave = null;

    console.log(`[ColyseusClient] Initialized with URL: ${this.wsUrl}`);
  }

  /**
   * Create a new boss battle room
   * @param {string} bossId - Boss ID to battle
   * @param {Object} playerData - Player information
   * @returns {Promise<Room>} Room instance
   */
  async createRoom(bossId, playerData = {}) {
    try {
      console.log(`[ColyseusClient] Creating room with bossId: ${bossId}`);

      // Prepare room creation options
      const options = {
        bossId,
        userId: playerData.userId || sessionStorage.getItem('userId') || 'guest',
        characterId: playerData.characterId || 'default',
        playerName: playerData.playerName || 'Player',
        avatar: playerData.avatar || '',
        level: playerData.level || 1,
        hp: playerData.hp || 1000,
        attack: playerData.attack || 100,
        defense: playerData.defense || 50
      };

      // Create room
      this.currentRoom = await this.client.create(this.roomName, options);

      // Setup room event listeners
      this.setupRoomListeners();

      console.log(`[ColyseusClient] Room created: ${this.currentRoom.id}`);
      console.log(`[ColyseusClient] Room code: ${this.currentRoom.state.roomCode}`);

      return this.currentRoom;

    } catch (error) {
      console.error(`[ColyseusClient] Failed to create room:`, error);
      throw error;
    }
  }

  /**
   * Join an existing room by room code
   * @param {string} roomCode - 3-digit room code
   * @param {Object} playerData - Player information
   * @returns {Promise<Room>} Room instance
   */
  async joinRoom(roomCode, playerData = {}) {
    try {
      console.log(`[ColyseusClient] Joining room with code: ${roomCode}`);

      // Get available rooms to find the one with matching code
      const rooms = await this.getAvailableRooms();
      const targetRoom = rooms.find(room => room.metadata?.roomCode === roomCode);

      if (!targetRoom) {
        throw new Error(`Room with code ${roomCode} not found`);
      }

      // Prepare join options
      const options = {
        userId: playerData.userId || sessionStorage.getItem('userId') || 'guest',
        characterId: playerData.characterId || 'default',
        playerName: playerData.playerName || 'Player',
        avatar: playerData.avatar || '',
        level: playerData.level || 1,
        hp: playerData.hp || 1000,
        attack: playerData.attack || 100,
        defense: playerData.defense || 50
      };

      // Join room by ID
      this.currentRoom = await this.client.joinById(targetRoom.roomId, options);

      // Setup room event listeners
      this.setupRoomListeners();

      console.log(`[ColyseusClient] Joined room: ${this.currentRoom.id}`);

      return this.currentRoom;

    } catch (error) {
      console.error(`[ColyseusClient] Failed to join room:`, error);
      throw error;
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
   * Setup room event listeners
   */
  setupRoomListeners() {
    if (!this.currentRoom) return;

    // State change listener (main sync mechanism)
    this.currentRoom.onStateChange((state) => {
      console.log(`[ColyseusClient] State changed:`, state.getSummary());

      if (this.onStateChange) {
        this.onStateChange(state);
      }
    });

    // Message listeners
    this.currentRoom.onMessage("chat", (message) => {
      console.log(`[ColyseusClient] Chat message:`, message);

      if (this.onMessage) {
        this.onMessage("chat", message);
      }
    });

    // Generic message listener
    this.currentRoom.onMessage((type, message) => {
      console.log(`[ColyseusClient] Message received: ${type}`, message);

      if (this.onMessage && type !== "chat") {
        this.onMessage(type, message);
      }
    });

    // Error handling
    this.currentRoom.onError((error) => {
      console.error(`[ColyseusClient] Room error:`, error);

      if (this.onError) {
        this.onError(error);
      }
    });

    // Leave handling
    this.currentRoom.onLeave(() => {
      console.log(`[ColyseusClient] Left room`);

      if (this.onLeave) {
        this.onLeave();
      }
    });

    console.log(`[ColyseusClient] Room listeners setup complete`);
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
      roomName: this.roomName
    };
  }
}

// Export singleton instance
export default new ColyseusClient();
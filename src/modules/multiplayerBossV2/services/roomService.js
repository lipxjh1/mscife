/**
 * Room Service Helper for Multiplayer Boss V2
 *
 * Provides utility functions for room management
 * Handles validation, formatting, and common operations
 */

import colyseusClient from "./colyseusClient.js";

class RoomService {
  constructor() {
    this.bossList = [
      { id: "fire-dragon-1", name: "Fire Dragon", level: 1, hp: 5000, attack: 100 },
      { id: "ice-golem-2", name: "Ice Golem", level: 2, hp: 7500, attack: 150 },
      { id: "thunder-eagle-3", name: "Thunder Eagle", level: 3, hp: 10000, attack: 200 },
      { id: "shadow-beast-4", name: "Shadow Beast", level: 4, hp: 12500, attack: 250 },
      { id: "light-angel-5", name: "Light Angel", level: 5, hp: 15000, attack: 300 }
    ];
  }

  /**
   * Validate room code format
   * @param {string} roomCode - Room code to validate
   * @returns {boolean} True if valid
   */
  validateRoomCode(roomCode) {
    // Room code should be 3 digits
    const codeRegex = /^\d{3}$/;
    return codeRegex.test(roomCode);
  }

  /**
   * Generate random room code for testing
   * @returns {string} 3-digit room code
   */
  generateRoomCode() {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  /**
   * Get boss information by ID
   * @param {string} bossId - Boss ID
   * @returns {Object|null} Boss information
   */
  getBossInfo(bossId) {
    return this.bossList.find(boss => boss.id === bossId) || null;
  }

  /**
   * Get all available bosses
   * @returns {Array} Array of boss information
   */
  getAllBosses() {
    return this.bossList;
  }

  /**
   * Format room data for UI display
   * @param {Object} roomData - Raw room data from Colyseus
   * @returns {Object} Formatted room data
   */
  formatRoomData(roomData) {
    return {
      roomId: roomData.roomId,
      roomCode: roomData.roomCode,
      playerCount: roomData.playerCount,
      maxPlayers: 2,
      phase: this.getPhaseName(roomData.phase),
      boss: roomData.boss,
      canJoin: roomData.playerCount < 2 && roomData.phase === 0,
      status: this.getRoomStatus(roomData)
    };
  }

  /**
   * Get phase name by number
   * @param {number} phase - Phase number
   * @returns {string} Phase name
   */
  getPhaseName(phase) {
    const phases = {
      0: "Waiting",
      1: "Playing",
      2: "Ended"
    };
    return phases[phase] || "Unknown";
  }

  /**
   * Get room status text
   * @param {Object} roomData - Room data
   * @returns {string} Status text
   */
  getRoomStatus(roomData) {
    if (roomData.playerCount >= 2) {
      return "Full";
    }
    if (roomData.phase === 1) {
      return "In Progress";
    }
    if (roomData.phase === 2) {
      return "Finished";
    }
    return "Waiting";
  }

  /**
   * Get player data from storage or create default
   * @returns {Object} Player data
   */
  getPlayerData() {
    // Try to get from sessionStorage or create default
    const userId = sessionStorage.getItem('userId') || `guest_${Date.now()}`;
    const playerName = sessionStorage.getItem('username') || 'Guest Player';
    const level = parseInt(sessionStorage.getItem('level')) || 1;
    const hp = parseInt(sessionStorage.getItem('hp')) || 1000;
    const attack = parseInt(sessionStorage.getItem('attack')) || 100;
    const defense = parseInt(sessionStorage.getItem('defense')) || 50;

    return {
      userId,
      playerName,
      level,
      hp,
      attack,
      defense,
      avatar: sessionStorage.getItem('avatar') || '',
      characterId: sessionStorage.getItem('characterId') || 'default'
    };
  }

  /**
   * Create room with error handling
   * @param {string} bossId - Boss ID
   * @param {Object} playerData - Player data (optional)
   * @returns {Promise<Object>} Room information
   */
  async createRoom(bossId, playerData = null) {
    console.log('[RoomService] ============================================');
    console.log('[RoomService] CREATE ROOM REQUEST');
    console.log('[RoomService] ============================================');
    console.log('[RoomService] Boss ID:', bossId);
    console.log('[RoomService] Player Data:', playerData);

    try {
      // Validate boss ID
      const bossInfo = this.getBossInfo(bossId);
      if (!bossInfo) {
        throw new Error(`Invalid boss ID: ${bossId}`);
      }

      // Get player data
      const pData = playerData || this.getPlayerData();

      console.log('[RoomService] Boss Info:', bossInfo);
      console.log('[RoomService] Final Player Data:', pData);
      console.log('[RoomService] Calling colyseusClient.createRoom()...');

      // Create room via colyseus client
      const result = await colyseusClient.createRoom(bossId, pData);

      console.log('[RoomService] Colyseus client returned:', result);

      if (result.success) {
        console.log('[RoomService] ✅ Room created successfully');
        console.log('[RoomService] Room object:', result.room);
        console.log('[RoomService] Room code:', result.roomCode);
        console.log('[RoomService] Room ID:', result.room?.id);
        console.log('[RoomService] Session ID:', result.room?.sessionId);
        console.log('[RoomService] Validating room data...');

        // Validate room object
        if (!result.room) {
          console.error('[RoomService] ❌ Room object is undefined!');
          return {
            success: false,
            error: "Room creation succeeded but room object is undefined"
          };
        }

        if (!result.room.state) {
          console.error('[RoomService] ❌ Room state is undefined!');
          return {
            success: false,
            error: "Room created but room state is undefined"
          };
        }

        if (!result.roomCode && !result.room.state.roomCode) {
          console.error('[RoomService] ❌ Room code is undefined!');
          console.error('[RoomService] result.roomCode:', result.roomCode);
          console.error('[RoomService] result.room.state.roomCode:', result.room.state.roomCode);
          return {
            success: false,
            error: "Room created but room code is undefined"
          };
        }

        const finalRoomCode = result.roomCode || result.room.state.roomCode;
        console.log('[RoomService] ✅ Room data validated successfully');
        console.log('[RoomService] Final room code:', finalRoomCode);

        // ✅ Return với roomCode từ room.id
        return {
          success: true,
          room: result.room,
          roomCode: result.roomCode,  // Already fixed in colyseusClient
          bossInfo,
          playerInfo: pData,
          status: "created"
        };

      } else {
        console.error('[RoomService] ❌ Room creation failed');
        console.error('[RoomService] Error:', result.error);
        console.error('[RoomService] Error type:', result.errorType);
        console.error('[RoomService] Error code:', result.errorCode);

        // ✅ Safe error message extraction
        const errorMessage = result.error || "Failed to create room";

        // Enhanced error messages with safe string checks
        let userMessage = "Failed to create room";

        if (result.isNetworkError) {
          userMessage = "Cannot connect to server. Please check your connection.";
        } else if (result.isTimeout) {
          userMessage = "Server connection timeout. Please try again.";
        } else if (errorMessage && errorMessage.includes('Failed to fetch')) {
          userMessage = "Cannot connect to server. Please check your internet connection.";
        } else if (errorMessage && errorMessage.includes('timeout')) {
          userMessage = "Server connection timeout. Please try again.";
        } else if (errorMessage && errorMessage.includes('ERR_FAILED')) {
          userMessage = "Server is not responding. Please try again later.";
        } else {
          userMessage = errorMessage;
        }

        return {
          success: false,
          error: userMessage,
          originalError: result.error,
          errorType: result.errorType,
          errorCode: result.errorCode,
          isNetworkError: result.isNetworkError,
          isTimeout: result.isTimeout,
          suggestions: result.suggestions
        };
      }

    } catch (error) {
      console.error('[RoomService] ============================================');
      console.error('[RoomService] ❌ EXCEPTION IN CREATE ROOM');
      console.error('[RoomService] ============================================');
      console.error('[RoomService] Error object:', error);

      // ✅ Safe error message extraction
      const errorMessage = error.message || error.toString() || 'Unknown error';
      const errorType = error.constructor?.name || 'Unknown';

      console.error('[RoomService] Error message:', errorMessage);
      console.error('[RoomService] Error type:', errorType);
      console.error('[RoomService] Stack trace:', error.stack || 'No stack trace');

      return {
        success: false,
        error: errorMessage,
        errorType: errorType
      };
    }
  }

  /**
   * Join room with error handling
   * @param {string} roomCode - Room code
   * @param {Object} playerData - Player data (optional)
   * @returns {Promise<Object>} Join result
   */
  async joinRoom(roomCode, playerData = null) {
    try {
      // Validate room code
      if (!this.validateRoomCode(roomCode)) {
        return {
          success: false,
          error: "Invalid room code format. Must be 3 digits."
        };
      }

      // Get player data
      const pData = playerData || this.getPlayerData();

      console.log(`[RoomService] Joining room with code: ${roomCode}`, pData);

      // Join room via colyseus client
      const result = await colyseusClient.joinRoom(roomCode, pData);

      if (result.success) {
        console.log(`[RoomService] Room joined successfully:`, result.roomCode);

        // Return success
        return {
          success: true,
          room: result.room,
          roomCode: result.roomCode,
          playerInfo: pData,
          status: "joined"
        };
      } else {
        console.error(`[RoomService] Room join failed:`, result.error);
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error) {
      console.error('[RoomService] ============================================');
      console.error('[RoomService] ❌ EXCEPTION IN JOIN ROOM');
      console.error('[RoomService] ============================================');
      console.error('[RoomService] Error object:', error);

      // ✅ Safe error message extraction
      const errorMessage = error.message || error.toString() || 'Failed to join room';
      const errorType = error.constructor?.name || 'Unknown';

      console.error('[RoomService] Error message:', errorMessage);
      console.error('[RoomService] Error type:', errorType);

      return {
        success: false,
        error: errorMessage,
        errorType: errorType
      };
    }
  }

  /**
   * Join room by ID with error handling
   * @param {string} roomId - Room ID
   * @param {Object} playerData - Player data (optional)
   * @returns {Promise<Object>} Join result
   */
  async joinRoomById(roomId, playerData = null) {
    try {
      // Get player data
      const pData = playerData || this.getPlayerData();

      console.log(`[RoomService] Joining room by ID: ${roomId}`, pData);

      // Join room via colyseus client
      const result = await colyseusClient.joinRoomById(roomId, pData);

      if (result.success) {
        console.log(`[RoomService] Room joined successfully by ID:`, result.roomCode);

        // Return success
        return {
          success: true,
          room: result.room,
          roomCode: result.roomCode,
          playerInfo: pData,
          status: "joined"
        };
      } else {
        console.error(`[RoomService] Room join by ID failed:`, result.error);
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error) {
      console.error('[RoomService] ============================================');
      console.error('[RoomService] ❌ EXCEPTION IN JOIN ROOM BY ID');
      console.error('[RoomService] ============================================');
      console.error('[RoomService] Error object:', error);

      // ✅ Safe error message extraction
      const errorMessage = error.message || error.toString() || 'Failed to join room by ID';
      const errorType = error.constructor?.name || 'Unknown';

      console.error('[RoomService] Error message:', errorMessage);
      console.error('[RoomService] Error type:', errorType);

      return {
        success: false,
        error: errorMessage,
        errorType: errorType
      };
    }
  }

  /**
   * Get available rooms with formatting
   * @returns {Promise<Array>} Formatted room list
   */
  async getAvailableRooms() {
    try {
      const rooms = await colyseusClient.getAvailableRooms();
      return rooms.map(room => this.formatRoomData({
        roomId: room.roomId,
        roomCode: room.metadata?.roomCode || "N/A",
        playerCount: room.clients,
        phase: room.metadata?.phase || 0,
        boss: room.metadata?.boss || null
      }));
    } catch (error) {
      console.error(`[RoomService] Failed to get available rooms:`, error);
      return [];
    }
  }

  /**
   * Leave current room
   * @returns {Object} Leave result
   */
  leaveRoom() {
    try {
      colyseusClient.leaveRoom();
      return {
        success: true,
        message: "Left room successfully"
      };
    } catch (error) {
      console.error(`[RoomService] Failed to leave room:`, error);
      return {
        success: false,
        error: error.message || "Failed to leave room"
      };
    }
  }

  /**
   * Send ready message
   * @returns {Object} Send result
   */
  sendReady() {
    try {
      colyseusClient.sendMessage("ready");
      return {
        success: true,
        message: "Ready message sent"
      };
    } catch (error) {
      console.error(`[RoomService] Failed to send ready:`, error);
      return {
        success: false,
        error: error.message || "Failed to send ready message"
      };
    }
  }

  /**
   * Send attack message
   * @param {string} skillId - Skill ID (optional)
   * @returns {Object} Send result
   */
  sendAttack(skillId = "") {
    try {
      const data = skillId ? { skillId } : {};
      colyseusClient.sendMessage("attack", data);
      return {
        success: true,
        message: "Attack message sent"
      };
    } catch (error) {
      console.error(`[RoomService] Failed to send attack:`, error);
      return {
        success: false,
        error: error.message || "Failed to send attack message"
      };
    }
  }

  /**
   * Send chat message
   * @param {string} text - Chat message text
   * @returns {Object} Send result
   */
  sendChat(text) {
    try {
      colyseusClient.sendMessage("chat", { text });
      return {
        success: true,
        message: "Chat message sent"
      };
    } catch (error) {
      console.error(`[RoomService] Failed to send chat:`, error);
      return {
        success: false,
        error: error.message || "Failed to send chat message"
      };
    }
  }

  /**
   * Get current room status
   * @returns {Object} Room status
   */
  getCurrentRoomStatus() {
    return colyseusClient.getStatus();
  }
}

// Export singleton instance
export default new RoomService();
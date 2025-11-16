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
    try {
      // Validate boss ID
      const bossInfo = this.getBossInfo(bossId);
      if (!bossInfo) {
        throw new Error(`Invalid boss ID: ${bossId}`);
      }

      // Get player data
      const pData = playerData || this.getPlayerData();

      // Create room
      const room = await colyseusClient.createRoom(bossId, pData);

      // Return room information
      return {
        success: true,
        room: {
          roomId: room.id,
          roomCode: room.state.roomCode,
          bossInfo,
          playerInfo: pData,
          status: "created"
        }
      };

    } catch (error) {
      console.error(`[RoomService] Failed to create room:`, error);
      return {
        success: false,
        error: error.message || "Failed to create room"
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
        throw new Error("Invalid room code format. Must be 3 digits.");
      }

      // Get player data
      const pData = playerData || this.getPlayerData();

      // Join room
      const room = await colyseusClient.joinRoom(roomCode, pData);

      // Return success
      return {
        success: true,
        room: {
          roomId: room.id,
          roomCode: room.state.roomCode,
          playerInfo: pData,
          status: "joined"
        }
      };

    } catch (error) {
      console.error(`[RoomService] Failed to join room:`, error);
      return {
        success: false,
        error: error.message || "Failed to join room"
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
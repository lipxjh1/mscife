// File: src/services/index.js (NEW FILE)
// Services index - Central export point for all services

// Arena Services
export { default as arenaService } from './arena.js';
export { default as arenaSocket } from './arenaSocket.js';
export { default as arenaGameService, ArenaGameService } from './arenaGameService.js';

// Legacy socket service (if exists)
try {
  export { default as socket } from './socket.js';
} catch (e) {
  // socket.js might not exist, that's okay
}

console.log('[Services] All services exported from index.js');
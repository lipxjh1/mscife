import { io } from 'socket.io-client';
import { EventBus } from '../game/EventBus';

// Socket connection configuration
const SOCKET_URL = 'https://wld.m-sci.net';
const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
  auth: (cb) => {
    cb({ token: localStorage.getItem('accessToken') });
  }
});

console.log('[Socket] Initializing socket connection to:', SOCKET_URL);

// Connection events
socket.on('connect', () => {
  console.log('[Socket] Connected successfully, ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('[Socket] Connection error:', error.message);
});

// Arena Events - Forward to React components and Phaser scenes
socket.on('arena:countdown', (data) => {
  console.log('[Socket] Arena countdown received:', data);

  // Emit to React components via window events
  window.dispatchEvent(new CustomEvent('arena:countdown', { detail: data }));

  // Emit to Phaser scenes
  EventBus.emit('arena:countdown', data);
});

socket.on('session_activated', (data) => {
  console.log('[Socket] Session activated received:', data);

  // Emit to React components via window events
  window.dispatchEvent(new CustomEvent('session_activated', { detail: data }));

  // Emit to Phaser scenes
  EventBus.emit('session_activated', data);
});

socket.on('arena:reward_notification', (data) => {
  console.log('[Socket] Arena reward notification received:', data);

  // Emit to React components via window events
  window.dispatchEvent(new CustomEvent('arena:reward_notification', { detail: data }));

  // Emit to Phaser scenes
  EventBus.emit('arena:reward_notification', data);
});

socket.on('immediate_item_drop', (data) => {
  console.log('[Socket] Immediate item drop received:', data);

  // Emit to React components via window events
  window.dispatchEvent(new CustomEvent('immediate_item_drop', { detail: data }));

  // Emit to Phaser scenes
  EventBus.emit('immediate_item_drop', data);
});

// Export socket instance and utility functions
export { socket };

// Utility function to connect to arena namespace if needed
export const connectToArena = (sessionId) => {
  console.log('[Socket] Connecting to arena namespace with session:', sessionId);

  // Join arena room/session
  socket.emit('join_arena', { sessionId });
};

// Utility function to disconnect from arena
export const disconnectFromArena = () => {
  console.log('[Socket] Disconnecting from arena namespace');
  socket.emit('leave_arena');
};

// Default export
export default socket;
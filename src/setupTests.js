/**
 * Setup file for Vitest
 * Runs before each test file
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Add custom matchers from @testing-library/jest-dom
// Now you can use: expect(element).toBeInTheDocument()

// ===========================
// MOCKS FOR GAME DEPENDENCIES
// ===========================

// Mock HTMLCanvasElement for Phaser
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillStyle: '',
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Array(4),
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => '');

// Mock Telegram SDK
vi.mock('@telegram-apps/sdk', () => ({
  retrieveLaunchParams: vi.fn(() => ({})),
}));

// Mock RXJS EMPTY
vi.mock('rxjs', () => ({
  EMPTY: {},
}));

// Mock Wallet
vi.mock('../wallet/Wallet.js', () => ({
  GetNftCharacters: vi.fn(() => Promise.resolve([])),
}));

// Mock window.location.reload for LogOut tests
delete window.location;
window.location = { reload: vi.fn() };

// Mock Phaser and game-related modules that cause issues in test environment
vi.mock('phaser', () => ({
  default: {
    Events: {
      EventEmitter: class MockEventEmitter {
        on() {}
        off() {}
        emit() {}
        once() {}
      },
    },
  },
  Events: {
    EventEmitter: class MockEventEmitter {
      on() {}
      off() {}
      emit() {}
      once() {}
    },
  },
  Game: vi.fn(),
  Scene: vi.fn(),
}));

vi.mock('phaser3spectorjs', () => ({}));

// Mock EventBus globally
global.Phaser = {
  Events: {
    EventEmitter: class MockEventEmitter {
      on() {}
      off() {}
      emit() {}
      once() {}
    },
  },
};

// Mock localStorage if not available
if (!global.localStorage) {
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}

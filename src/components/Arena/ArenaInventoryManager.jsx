/**
 * Arena Inventory Manager Component
 * Manages and displays inventory updates from Arena
 * Integrates with DOGE Shield notifications
 */

import React, { useState, useEffect } from 'react';
import { useArenaInventory } from '../../hooks/useArenaInventory';
import DogeShieldNotification from './DogeShieldNotification';
import './ArenaInventoryManager.css';

export const ArenaInventoryManager = ({ arenaSocket }) => {
  const { inventory, getDogeShieldCount, updateInventoryItem } = useArenaInventory();
  const [dogeNotification, setDogeNotification] = useState(null);

  useEffect(() => {
    if (!arenaSocket) return;

    // Setup callbacks for ArenaSocketListeners
    const callbacks = {
      onInventoryUpdate: (data) => {
        console.log('[ArenaInventoryManager] Inventory update:', data);
        updateInventoryItem(data.itemCode, data.quantity, data.change);

        // Show special notification for DOGE Shield
        if (data.itemCode === 'DOGE_SHIELD') {
          setDogeNotification({
            title: '🛡️ DOGE Shield Received!',
            message: data.message || 'A viewer donated a DOGE Shield!',
            data: {
              quantity: data.quantity,
              change: data.change,
              source: data.source
            },
            duration: 5000
          });
        }
      },

      onDogeShieldReceived: (data) => {
        console.log('[ArenaInventoryManager] DOGE Shield special handler:', data);

        // Add visual feedback
        document.body.classList.add('doge-shield-received');
        setTimeout(() => {
          document.body.classList.remove('doge-shield-received');
        }, 1000);
      },

      onPlaySound: (soundName) => {
        playSound(soundName);
      },

      onUpdatePhaserUI: (data) => {
        // Forward to Phaser game
        if (window.game && window.game.events) {
          window.game.events.emit('inventory-update', data);
        }
      }
    };

    // Register callbacks with socket service
    if (arenaSocket.setCallbacks) {
      arenaSocket.setCallbacks(callbacks);
    }

    return () => {
      // Cleanup if needed
    };
  }, [arenaSocket, updateInventoryItem]);

  // Listen for inventory updates from window events (fallback)
  useEffect(() => {
    const handleInventoryUpdate = (event) => {
      const data = event.detail;
      updateInventoryItem(data.itemCode, data.quantity, data.change);

      if (data.itemCode === 'DOGE_SHIELD') {
        setDogeNotification({
          title: '🛡️ DOGE Shield Received!',
          message: data.message || `You received a DOGE Shield!`,
          data: data,
          duration: 5000
        });
      }
    };

    window.addEventListener('arena:inventory_update', handleInventoryUpdate);

    return () => {
      window.removeEventListener('arena:inventory_update', handleInventoryUpdate);
    };
  }, [updateInventoryItem]);

  const shieldCount = getDogeShieldCount();

  return (
    <>
      {/* DOGE Shield special notification */}
      <DogeShieldNotification
        notification={dogeNotification}
        onClose={() => setDogeNotification(null)}
      />

      {/* Optional: Inventory display overlay */}
      {shieldCount > 0 && (
        <div className="arena-inventory-overlay">
          <div className="shield-counter">
            <span className="shield-icon">🛡️</span>
            <span className="shield-count">{shieldCount}</span>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Play sound effect
 */
function playSound(soundName) {
  try {
    // Create audio element
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(err => {
      console.warn('[ArenaInventoryManager] Sound play failed:', err);
    });
  } catch (error) {
    console.warn('[ArenaInventoryManager] No sound file for:', soundName);
  }
}

export default ArenaInventoryManager;
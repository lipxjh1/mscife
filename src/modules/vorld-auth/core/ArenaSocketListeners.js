/**
 * Arena Socket Event Listeners for DOGE Shield Integration
 * Handles inventory:update events from Arena backend
 * Updated: 2025-11-09
 */

import { showArenaNotification } from '../components/Arena/ArenaNotification';

export class ArenaSocketListeners {
  constructor(socket, callbacks = {}) {
    this.socket = socket;
    this.callbacks = callbacks;
    this.setupListeners();
  }

  setupListeners() {
    if (!this.socket) {
      console.error('[ArenaSocketListeners] Socket is null, cannot setup listeners');
      return;
    }

    // Listen for inventory updates (NEW from backend)
    this.socket.on('inventory:update', this.handleInventoryUpdate.bind(this));

    // Listen for immediate item drop (existing)
    this.socket.on('immediate_item_drop', this.handleImmediateItemDrop.bind(this));

    // Listen for ITEM_RECEIVED event (existing)
    this.socket.on('ITEM_RECEIVED', this.handleItemReceived.bind(this));

    // Listen for errors
    this.socket.on('arena:error', this.handleError.bind(this));

    console.log('[ArenaSocketListeners] ✅ All listeners setup complete');
  }

  /**
   * Handle inventory:update event from backend
   * Triggered when viewer donates DOGE Shield
   */
  handleInventoryUpdate(data) {
    console.log('[ArenaSocketListeners] 📦 Inventory update received:', data);

    const {
      userId,
      itemCode,
      itemName,
      quantity,
      change,
      source,
      message
    } = data;

    // Validate data
    if (!itemCode || quantity === undefined) {
      console.error('[ArenaSocketListeners] Invalid inventory update data:', data);
      return;
    }

    // Update inventory in centerData (existing pattern)
    if (window.centerData && window.centerData.inventoryDictionary) {
      let inventoryItem = window.centerData.inventoryDictionary[itemCode];

      if (!inventoryItem) {
        console.log('[ArenaSocketListeners] Creating new inventory entry for:', itemCode);
        inventoryItem = {
          itemId: itemCode,
          quantity: 0
        };
        window.centerData.inventoryDictionary[itemCode] = inventoryItem;
      }

      // Update quantity
      inventoryItem.quantity = quantity;
      console.log(`[ArenaSocketListeners] Updated ${itemCode} quantity to:`, quantity);
    }

    // Trigger callback for inventory update
    if (this.callbacks.onInventoryUpdate) {
      this.callbacks.onInventoryUpdate({
        itemCode,
        itemName,
        quantity,
        change,
        source
      });
    }

    // Show notification using existing system
    if (message) {
      showArenaNotification({
        type: 'success',
        title: 'Item Received!',
        message: message,
        data: {
          itemCode,
          quantity,
          source
        }
      });
    }

    // Play sound effect
    if (this.callbacks.onPlaySound) {
      this.callbacks.onPlaySound('item_received');
    }

    // Update Phaser game UI if available
    if (this.callbacks.onUpdatePhaserUI) {
      this.callbacks.onUpdatePhaserUI({
        type: 'inventory_update',
        itemCode,
        quantity,
        change
      });
    }

    // Special handling for DOGE Shield
    if (itemCode === 'DOGE_SHIELD') {
      this.handleDogeShieldReceived(data);
    }

    // Emit custom event for other components
    window.dispatchEvent(new CustomEvent('arena:inventory_update', {
      detail: data
    }));
  }

  /**
   * Special handler for DOGE Shield
   */
  handleDogeShieldReceived(data) {
    console.log('[ArenaSocketListeners] 🛡️ DOGE Shield received!', data);

    // Trigger special effect if callback provided
    if (this.callbacks.onDogeShieldReceived) {
      this.callbacks.onDogeShieldReceived(data);
    }

    // Update shield count in Phaser game UI
    this.updateShieldButtonInPhaser(data.quantity);

    // Spawn shield visual in game
    this.spawnShieldVisual();
  }

  /**
   * Update shield button quantity in Phaser UI
   */
  updateShieldButtonInPhaser(quantity) {
    const gameplayScene = window.game?.scene?.keys?.Gameplay;

    if (gameplayScene?.container_selector) {
      // Find shield button in container_selector
      const allButtons = gameplayScene.container_selector.list;

      for (let container of allButtons) {
        if (container.container_button_inner) {
          const image = container.container_button_inner.list.find(obj =>
            obj.texture && obj.texture.key === 'item_doge_shield'
          );

          if (image && container.text_quantity) {
            container.text_quantity.setText(quantity);
            console.log('[ArenaSocketListeners] Updated shield button quantity to:', quantity);

            // Add pulse effect
            if (container.container_button_inner) {
              container.container_button_inner.setScale(1.2);
              gameplayScene.tweens.add({
                targets: container.container_button_inner,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
              });
            }

            break;
          }
        }
      }
    }
  }

  /**
   * Spawn shield visual effect in game
   */
  spawnShieldVisual() {
    const gameplayScene = window.game?.scene?.keys?.Gameplay;

    if (gameplayScene && typeof gameplayScene.spawnShieldItem === 'function') {
      // Spawn shield at random position for visual feedback
      gameplayScene.spawnShieldItem({
        x: Math.random() * 700 + 100,
        y: Math.random() * 400 + 100
      });
    }
  }

  /**
   * Handle immediate_item_drop event (existing)
   */
  handleImmediateItemDrop(data) {
    console.log('[ArenaSocketListeners] 🎁 Immediate item drop received:', data);

    if (this.callbacks.onItemDrop) {
      this.callbacks.onItemDrop(data);
    }

    // Emit for existing handlers
    window.dispatchEvent(new CustomEvent('arena:item_drop', {
      detail: data
    }));
  }

  /**
   * Handle ITEM_RECEIVED event (existing)
   */
  handleItemReceived(data) {
    console.log('[ArenaSocketListeners] 🎁 Item received event:', data);

    if (this.callbacks.onItemReceived) {
      this.callbacks.onItemReceived(data);
    }

    // Emit for existing handlers
    window.dispatchEvent(new CustomEvent('arena:item_received', {
      detail: data
    }));
  }

  /**
   * Handle arena errors
   */
  handleError(error) {
    console.error('[ArenaSocketListeners] ❌ Arena error:', error);

    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }

    // Show error notification
    showArenaNotification({
      type: 'error',
      title: 'Arena Error',
      message: error.message || 'An error occurred in Arena'
    });
  }

  /**
   * Cleanup all listeners
   */
  destroy() {
    if (!this.socket) return;

    this.socket.off('inventory:update');
    this.socket.off('immediate_item_drop');
    this.socket.off('ITEM_RECEIVED');
    this.socket.off('arena:error');

    console.log('[ArenaSocketListeners] ✅ All listeners cleaned up');
  }
}

// Helper function to show notifications
function showNotification(options) {
  showArenaNotification(options);
}

export default ArenaSocketListeners;
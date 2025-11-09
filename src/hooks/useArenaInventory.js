/**
 * useArenaInventory Hook
 * Manages inventory state for Arena items including DOGE Shield
 * Integrates with centerData and provides React state management
 */

import { useState, useEffect, useCallback } from 'react';

// Import centerData (existing pattern)
import centerData from '../game/Data/CenterData.js';

export const useArenaInventory = () => {
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Initialize inventory from centerData
  useEffect(() => {
    if (centerData && centerData.inventoryDictionary) {
      // Convert inventoryDictionary to state
      const inventoryState = {};
      Object.keys(centerData.inventoryDictionary).forEach(itemId => {
        const item = centerData.inventoryDictionary[itemId];
        inventoryState[itemId] = {
          code: item.itemId || itemId,
          quantity: item.quantity || 0,
          name: getItemDisplayName(itemId),
          icon: getItemIcon(itemId)
        };
      });
      setInventory(inventoryState);
      console.log('[useArenaInventory] Initialized inventory from centerData:', inventoryState);
    }
  }, []);

  /**
   * Update single item in inventory
   * This will be called by ArenaSocketListeners
   */
  const updateInventoryItem = useCallback((itemCode, quantity, change = null) => {
    setInventory(prev => {
      const updated = {
        ...prev,
        [itemCode]: {
          code: itemCode,
          quantity: quantity,
          name: getItemDisplayName(itemCode),
          icon: getItemIcon(itemCode),
          lastUpdate: Date.now(),
          change: change !== null ? change : quantity - (prev[itemCode]?.quantity || 0)
        }
      };
      console.log(`[useArenaInventory] Updated ${itemCode}:`, updated[itemCode]);
      return updated;
    });

    setLastUpdate(Date.now());

    // Also update centerData for Phaser game compatibility
    if (centerData && centerData.inventoryDictionary) {
      let inventoryItem = centerData.inventoryDictionary[itemCode];
      if (!inventoryItem) {
        inventoryItem = {
          itemId: itemCode,
          quantity: 0
        };
        centerData.inventoryDictionary[itemCode] = inventoryItem;
      }
      inventoryItem.quantity = quantity;
    }
  }, []);

  /**
   * Get item quantity by code
   */
  const getItemQuantity = useCallback((itemCode) => {
    return inventory[itemCode]?.quantity || 0;
  }, [inventory]);

  /**
   * Get all items
   */
  const getAllItems = useCallback(() => {
    return Object.values(inventory);
  }, [inventory]);

  /**
   * Get DOGE Shield quantity (special case)
   */
  const getDogeShieldCount = useCallback(() => {
    return getItemQuantity('DOGE_SHIELD');
  }, [getItemQuantity]);

  /**
   * Listen for inventory updates from events
   */
  useEffect(() => {
    const handleInventoryUpdate = (event) => {
      const data = event.detail;
      console.log('[useArenaInventory] Received inventory update event:', data);

      if (data.itemCode && data.quantity !== undefined) {
        updateInventoryItem(data.itemCode, data.quantity, data.change);
      }
    };

    // Listen for custom events
    window.addEventListener('arena:inventory_update', handleInventoryUpdate);

    return () => {
      window.removeEventListener('arena:inventory_update', handleInventoryUpdate);
    };
  }, [updateInventoryItem]);

  return {
    inventory,
    loading,
    lastUpdate,
    updateInventoryItem,
    getItemQuantity,
    getAllItems,
    getDogeShieldCount
  };
};

/**
 * Get display name for item code
 */
function getItemDisplayName(itemCode) {
  const names = {
    'DOGE_SHIELD': 'DOGE Shield',
    'DOGE_ENERGY': 'DOGE Energy',
    'CHIP': 'Chip',
    'GOLD': 'Gold'
  };
  return names[itemCode] || itemCode.replace(/_/g, ' ');
}

/**
 * Get icon for item type
 */
function getItemIcon(itemCode) {
  const icons = {
    'DOGE_SHIELD': '🛡️',
    'DOGE_ENERGY': '⚡',
    'CHIP': '💰',
    'GOLD': '🪙'
  };
  return icons[itemCode] || '🎁';
}

export default useArenaInventory;
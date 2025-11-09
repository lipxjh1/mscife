import React, { useState, useEffect } from 'react';
import ArenaCountdown from './ArenaCountdown';
import PackageDropNotification from './PackageDropNotification';
import ArenaNotification from './ArenaNotification';
import './ArenaUI.css';
import centerData from '../../game/Data/CenterData.js';

const ArenaUI = () => {
  const [arenaCountdown, setArenaCountdown] = useState(null);
  const [arenaActive, setArenaActive] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for countdown events from backend via window events
    const handleCountdown = (event) => {
      console.log('[Arena UI] Countdown event received:', event.detail);
      setArenaCountdown(event.detail.timeRemaining);
      setArenaActive(false);
    };

    const handleSessionActivated = (event) => {
      console.log('[Arena UI] Session activated event received:', event.detail);
      setArenaActive(true);
      setArenaCountdown(null);
    };

    const handleRewardNotification = (event) => {
      console.log('[Arena UI] Reward notification received:', event.detail);
      const data = event.detail;

      const notification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        username: data.username || 'Anonymous',
        packageName: data.packageName || `${data.currency} Package`,
        amount: data.amount,
        currency: data.currency,
        icon: getCurrencyIcon(data.currency),
        timestamp: new Date()
      };

      setNotifications(prev => [...prev, notification]);
    };

    const handleItemDrop = (event) => {
      console.log('[Arena UI] Item drop received:', event.detail);
      const data = event.detail;

      // Check if dropped item is Dog Shield
      if (data.metadata?.type === 'shield' ||
          data.itemName === 'DOGE_SHIELD' ||
          data.itemId === 'package_dogshield_10') {
        console.log('[Arena UI] Shield drop detected, adding to inventory');

        // Add shield to inventory (same as Gameplay.js collectShieldItem)
        if (centerData && centerData.inventoryDictionary) {
          let inventoryItem = centerData.inventoryDictionary['DOGE_SHIELD'];
          if (!inventoryItem) {
            console.log('[Arena UI] Creating new DOGE_SHIELD inventory entry');
            inventoryItem = {
              itemId: 'DOGE_SHIELD',
              quantity: 0
            };
            centerData.inventoryDictionary['DOGE_SHIELD'] = inventoryItem;
          }

          // Increase quantity
          inventoryItem.quantity += 1;
          console.log('[Arena UI] Shield quantity now:', inventoryItem.quantity);

          // Update UI button quantity
          const gameplayScene = window.game?.scene?.keys?.Gameplay;
          if (gameplayScene?.container_selector) {
            // Find shield button in container_selector children
            const shieldButton = gameplayScene.container_selector.list.find(child =>
              children => children.children?.find(btn => btn.texture?.key === 'gameplay_selector_item_btn' &&
              children.children?.find(img => img.texture?.key === 'item_doge_shield'))
            );

            // Alternative: get by checking image texture
            const allButtons = gameplayScene.container_selector.list;
            for (let container of allButtons) {
              if (container.container_button_inner) {
                const image = container.container_button_inner.list.find(obj =>
                  obj.texture && obj.texture.key === 'item_doge_shield'
                );
                if (image && container.text_quantity) {
                  container.text_quantity.setText(inventoryItem.quantity);
                  console.log('[Arena UI] Updated shield button quantity to:', inventoryItem.quantity);
                  break;
                }
              }
            }
          }
        }

        const gameplayScene = window.game?.scene?.keys?.Gameplay;
        if (gameplayScene && typeof gameplayScene.spawnShieldItem === 'function') {
          // Spawn shield at random position for visual feedback
          gameplayScene.spawnShieldItem({
            x: Math.random() * 700 + 100,
            y: Math.random() * 500 + 300,
            metadata: data.metadata,
            itemName: data.itemName || 'Dog Shield',
            itemId: data.itemId || 'package_dogshield_10'
          });
        } else {
          console.warn('[Arena UI] Gameplay scene not found or spawnShieldItem method missing');
        }
      }

      const notification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        username: data.sender || 'Anonymous',
        packageName: data.itemName,
        amount: parseInt(data.metadata?.amount),
        currency: data.metadata?.currency || 'Chip',
        icon: '🎁',
        timestamp: new Date()
      };

      setNotifications(prev => [...prev, notification]);
    };

    // Add event listeners
    window.addEventListener('arena:countdown', handleCountdown);
    window.addEventListener('session_activated', handleSessionActivated);
    window.addEventListener('arena:reward_notification', handleRewardNotification);
    window.addEventListener('immediate_item_drop', handleItemDrop);

    // Cleanup
    return () => {
      window.removeEventListener('arena:countdown', handleCountdown);
      window.removeEventListener('session_activated', handleSessionActivated);
      window.removeEventListener('arena:reward_notification', handleRewardNotification);
      window.removeEventListener('immediate_item_drop', handleItemDrop);
    };
  }, []);

  const handleCountdownComplete = () => {
    console.log('[Arena UI] Countdown completed');
    setArenaCountdown(null);
  };

  const handleRemoveNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getCurrencyIcon = (currency) => {
    const icons = {
      'Chip': '💰',
      'Coin': '🪙',
      'Gem': '💎',
      'Star': '⭐'
    };
    return icons[currency] || '🎁';
  };

  return (
    <div className="arena-ui">
      {/* Arena Countdown Overlay */}
      {arenaCountdown !== null && (
        <ArenaCountdown
          timeRemaining={arenaCountdown}
          isActive={arenaActive}
          onComplete={handleCountdownComplete}
        />
      )}

      {/* Package Drop Notifications */}
      <PackageDropNotification
        notifications={notifications}
        onRemove={handleRemoveNotification}
      />

      {/* Arena Notifications */}
      <ArenaNotification />
    </div>
  );
};

export default ArenaUI;
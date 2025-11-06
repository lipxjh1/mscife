import React, { useState, useEffect } from 'react';
import ArenaCountdown from './ArenaCountdown';
import PackageDropNotification from './PackageDropNotification';
import ArenaNotification from './ArenaNotification';
import './ArenaUI.css';

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
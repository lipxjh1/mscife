import React, { useState, useEffect } from 'react';
import './ArenaNotification.css';

const ArenaNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [lastNotification, setLastNotification] = useState(null);

  // ✅ FIX: Debounce time to prevent duplicate notifications
  const DEBOUNCE_TIME = 3000; // 3 seconds

  useEffect(() => {
    // Listen for arena notification events
    const handleArenaNotification = (event) => {
      console.log('[ArenaNotification] Received notification:', event.detail);

      const { type, message, title, data } = event.detail;
      const now = Date.now();

      // ✅ FIX: Prevent duplicate notifications within debounce time
      if (lastNotification) {
        const isSameMessage = lastNotification.message === message;
        const isSameType = lastNotification.type === type;
        const withinDebounce = now - lastNotification.time < DEBOUNCE_TIME;

        if (isSameMessage && isSameType && withinDebounce) {
          console.log('[ArenaNotification] Duplicate notification blocked:', { message, type });
          return; // Skip duplicate notification
        }
      }

      // Update last notification
      setLastNotification({
        message: message,
        type: type,
        time: now
      });

      // Create notification object
      const notification = {
        id: `arena_notif_${Date.now()}_${Math.random()}`,
        type: type || 'info',
        title: title || getDefaultTitle(type),
        message: message,
        data: data,
        icon: getIconForType(type)
      };

      // Add to notifications list
      setNotifications(prev => [...prev, notification]);
    };

    // Add event listener
    window.addEventListener('arena:notification', handleArenaNotification);

    // Cleanup
    return () => {
      window.removeEventListener('arena:notification', handleArenaNotification);
    };
  }, [lastNotification]);

  const handleRemoveNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Auto-remove notification after 5 seconds
  useEffect(() => {
    if (notifications.length === 0) return;

    const timers = notifications.map(notification => {
      return setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  function getDefaultTitle(type) {
    const titles = {
      'success': 'Success!',
      'warning': 'Warning!',
      'error': 'Error!',
      'info': 'Arena Info',
      'reward': 'Reward Received!',
      'boost': 'Boost Activated!',
      'drop': 'Item Dropped!',
      'achievement': 'Achievement Unlocked!'
    };
    return titles[type] || 'Arena Notification';
  }

  function getIconForType(type) {
    const icons = {
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'info': 'ℹ️',
      'reward': '🏆',
      'boost': '⚡',
      'drop': '🎁',
      'achievement': '🎖️',
      'battle_start': '⚔️',
      'battle_end': '🏁',
      'player_joined': '👤',
      'player_left': '👋'
    };
    return icons[type] || '📢';
  }

  if (notifications.length === 0) return null;

  return (
    <div className="arena-notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`arena-notification ${notification.type}`}
        >
          <div className="arena-notification-icon">
            {notification.icon}
          </div>
          <div className="arena-notification-content">
            <div className="arena-notification-title">
              {notification.title}
            </div>
            <div className="arena-notification-message">
              {notification.message}
            </div>
          </div>
          <button
            className="arena-notification-close"
            onClick={() => handleRemoveNotification(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ArenaNotification;
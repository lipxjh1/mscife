/**
 * DOGE Shield Notification Component
 * Special notification for DOGE Shield drops from Arena
 * Enhanced with animations and effects
 */

import React, { useState, useEffect } from 'react';
import './DogeShieldNotification.css';

export const DogeShieldNotification = ({ notification, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (notification) {
      setVisible(true);

      // Create sparkle effects
      const newSparkles = Array.from({ length: 5 }, (_, i) => ({
        id: `sparkle_${Date.now()}_${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.5}s`
      }));
      setSparkles(newSparkles);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose && onClose(), 300);
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className={`doge-shield-notification ${visible ? 'visible' : 'hidden'}`}>
      {/* Sparkle effects */}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            animationDelay: sparkle.delay
          }}
        >
          ✨
        </div>
      ))}

      {/* Shield icon with animation */}
      <div className="shield-icon-wrapper">
        <div className="shield-icon">🛡️</div>
        <div className="shield-pulse"></div>
      </div>

      {/* Notification content */}
      <div className="notification-content">
        <h3 className="notification-title">
          {notification.title || 'DOGE Shield Received!'}
        </h3>
        <p className="notification-message">
          {notification.message}
        </p>
        {notification.data?.quantity && (
          <div className="shield-count">
            Total: {notification.data.quantity} 🛡️
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        className="notification-close"
        onClick={() => setVisible(false)}
      >
        ×
      </button>

      {/* Doge mascot */}
      <div className="doge-mascot">
        🐕
      </div>
    </div>
  );
};

export default DogeShieldNotification;
import React, { useState, useEffect } from 'react';
import './PackageDropNotification.css';

const PackageDropNotification = ({ notifications, onRemove }) => {
  return (
    <div className="package-notifications-container">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          index={index}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, index, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setIsExiting(true);
    }, 5000);

    // Remove from DOM after animation
    const removeTimer = setTimeout(() => {
      onRemove(notification.id);
    }, 5500);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [notification.id, onRemove]);

  const { username, packageName, amount, currency, icon } = notification;

  return (
    <div
      className={`package-notification ${isExiting ? 'exiting' : ''}`}
      style={{ '--index': index }}
    >
      <div className="notification-icon">
        {icon || '🎁'}
      </div>
      <div className="notification-content">
        <div className="notification-header">
          <span className="notification-username">{username}</span>
          <span className="notification-action">dropped a package!</span>
        </div>
        <div className="notification-package">
          <span className="package-name">{packageName}</span>
          {amount && (
            <span className="package-amount">
              +{amount.toLocaleString()} {currency}
            </span>
          )}
        </div>
      </div>
      <button
        className="notification-close"
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onRemove(notification.id), 500);
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default PackageDropNotification;
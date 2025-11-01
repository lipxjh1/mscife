import React, { useState, useEffect } from 'react';
import './ArenaCountdown.css';

const ArenaCountdown = ({ timeRemaining, isActive, onComplete }) => {
  const [showBegin, setShowBegin] = useState(false);

  useEffect(() => {
    if (timeRemaining === 0 && !isActive) {
      // Show "Arena Begins!" animation
      setShowBegin(true);

      // Hide after 3 seconds
      const timer = setTimeout(() => {
        setShowBegin(false);
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isActive, onComplete]);

  // Don't show if arena already active or no countdown
  if (isActive || timeRemaining === null) return null;

  return (
    <div className="arena-countdown-overlay">
      {!showBegin ? (
        <div className="countdown-container">
          <div className="countdown-title">Arena Starting In</div>
          <div className="countdown-timer">
            <div className="countdown-circle">
              <svg className="countdown-svg" viewBox="0 0 100 100">
                <circle
                  className="countdown-circle-bg"
                  cx="50"
                  cy="50"
                  r="45"
                />
                <circle
                  className="countdown-circle-progress"
                  cx="50"
                  cy="50"
                  r="45"
                  style={{
                    strokeDashoffset: (1 - timeRemaining / 60) * 283
                  }}
                />
              </svg>
              <div className="countdown-number">
                {timeRemaining}
              </div>
            </div>
          </div>
          <div className="countdown-subtitle">
            Get Ready to Drop Packages!
          </div>
        </div>
      ) : (
        <div className="countdown-begin">
          <div className="begin-text">Arena Begins!</div>
          <div className="begin-subtitle">Drop Packages Now!</div>
        </div>
      )}
    </div>
  );
};

export default ArenaCountdown;
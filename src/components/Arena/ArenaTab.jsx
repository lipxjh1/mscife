// File: src/components/Arena/ArenaTab.jsx (NEW FILE)
import React, { useState } from 'react';
import ArenaGame from './ArenaGame';

export default function ArenaTab() {
  const [showArena, setShowArena] = useState(false);

  if (showArena) {
    return (
      <div style={{ width: '100%', height: '100vh' }}>
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setShowArena(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ← Back to Game
          </button>
        </div>
        <ArenaGame />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      <button
        onClick={() => setShowArena(true)}
        style={{
          padding: '12px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        🎮 Arena Game
      </button>
    </div>
  );
}
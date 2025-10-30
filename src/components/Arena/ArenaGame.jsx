// File: src/components/Arena/ArenaGame.jsx (NEW FILE)
import React, { useState, useEffect } from 'react';
import GameInit from './GameInit';
import ItemsCatalog from './ItemsCatalog';
import BoostPlayer from './BoostPlayer';
import ItemDrop from './ItemDrop';
import arenaSocket from '../services/arenaSocket';

export default function ArenaGame() {
  const [sessionId, setSessionId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userBalance, setUserBalance] = useState(5000); // Default balance from backend
  const [wsStatus, setWsStatus] = useState('disconnected');

  useEffect(() => {
    // Setup WebSocket event listeners
    if (sessionId) {
      console.log('[ArenaGame] Setting up WebSocket listeners for session:', sessionId);

      arenaSocket.on('connected', (data) => {
        console.log('[ArenaGame] WebSocket connected:', data);
        setWsStatus('connected');
      });

      arenaSocket.on('disconnected', (data) => {
        console.log('[ArenaGame] WebSocket disconnected:', data);
        setWsStatus('disconnected');
      });

      arenaSocket.on('session_activated', (data) => {
        console.log('[ArenaGame] Session activated:', data);
        // Session is now ready for actions
      });

      arenaSocket.on('player_boosted', (data) => {
        console.log('[ArenaGame] Player boosted event received:', data);

        // Update balance if we boosted someone
        if (data.amount && data.playerId !== 'self') {
          setUserBalance(prev => {
            const newBalance = prev - data.amount;
            console.log('[ArenaGame] Balance updated via WebSocket:', newBalance);
            return newBalance;
          });

          // Show notification (could use a toast library)
          alert(`💰 Successfully boosted ${data.amount} chips to player ${data.playerId || 'Unknown'}!`);
        }
      });

      arenaSocket.on('item_dropped', (data) => {
        console.log('[ArenaGame] Item dropped event received:', data);

        // Show notification
        alert(`🎁 Successfully dropped ${data.quantity || 1}x item to player ${data.targetUserId || 'Unknown'}!`);
      });

      arenaSocket.on('session_ended', (data) => {
        console.log('[ArenaGame] Session ended:', data);
        setWsStatus('ended');
        alert('🏁 Game session has ended!');
      });

      arenaSocket.on('error', (data) => {
        console.error('[ArenaGame] WebSocket error:', data);
        setWsStatus('error');
      });

    } else {
      console.log('[ArenaGame] No session ID, not setting up WebSocket listeners');
    }

    // Cleanup function
    return () => {
      if (sessionId) {
        console.log('[ArenaGame] Cleaning up WebSocket listeners');
        arenaSocket.off('connected');
        arenaSocket.off('disconnected');
        arenaSocket.off('session_activated');
        arenaSocket.off('player_boosted');
        arenaSocket.off('item_dropped');
        arenaSocket.off('session_ended');
        arenaSocket.off('error');
      }
    };
  }, [sessionId]);

  const handleSessionCreated = (session) => {
    console.log('[ArenaGame] Session created callback:', session);
    if (session) {
      setSessionId(session.sessionId);
      setSelectedItem(null); // Reset selected item
    } else {
      setSessionId(null);
      setSelectedItem(null);
      setWsStatus('disconnected');
    }
  };

  const handleItemSelect = (item) => {
    console.log('[ArenaGame] Item selected:', item);
    setSelectedItem(item);
  };

  const handleBalanceUpdate = (newBalance) => {
    console.log('[ArenaGame] Balance updated:', newBalance);
    setUserBalance(newBalance);
  };

  const handleEndSession = () => {
    console.log('[ArenaGame] Ending session...');

    // Disconnect WebSocket
    arenaSocket.disconnect();

    // Reset state
    setSessionId(null);
    setSelectedItem(null);
    setUserBalance(5000); // Reset to default
    setWsStatus('disconnected');
  };

  // Get WebSocket status color and text
  const getWsStatusInfo = () => {
    switch (wsStatus) {
      case 'connected':
        return { color: '#28a745', text: '🟢 Connected', icon: '✅' };
      case 'disconnected':
        return { color: '#dc3545', text: '🔴 Disconnected', icon: '❌' };
      case 'error':
        return { color: '#ffc107', text: '🟡 Connection Error', icon: '⚠️' };
      case 'ended':
        return { color: '#6c757d', text: '🔘 Session Ended', icon: '🏁' };
      default:
        return { color: '#6c757d', text: '⚫ Unknown', icon: '❓' };
    }
  };

  const wsStatusInfo = getWsStatusInfo();

  return (
    <div className="arena-game-container" style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>
          🎮 Arena Arcade
        </h1>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Stream, boost players, and drop items in real-time!
        </p>

        {/* Session Info */}
        {sessionId ? (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            border: '1px solid #bbdefb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <strong>Session ID:</strong> <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px' }}>{sessionId}</code>
              </div>
              <div>
                <strong>Balance:</strong> <span style={{ color: '#1565c0', fontSize: '16px', fontWeight: 'bold' }}>{userBalance}</span> chips
              </div>
              <div>
                <strong>WebSocket:</strong>
                <span style={{ color: wsStatusInfo.color, marginLeft: '5px' }}>
                  {wsStatusInfo.icon} {wsStatusInfo.text}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffeaa7',
            color: '#856404'
          }}>
            🎯 Start a game session to begin playing!
          </div>
        )}
      </header>

      <main>
        {!sessionId ? (
          // Show game init when no session
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <GameInit onSessionCreated={handleSessionCreated} />
          </div>
        ) : (
          // Show game interface when session is active
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Left Column: Items Catalog */}
              <div>
                <ItemsCatalog onSelectItem={handleItemSelect} />
              </div>

              {/* Right Column: Actions */}
              <div>
                <BoostPlayer
                  sessionId={sessionId}
                  userBalance={userBalance}
                  onBalanceUpdate={handleBalanceUpdate}
                />
              </div>
            </div>

            {/* Bottom: Item Drop (full width) */}
            <div>
              <ItemDrop
                sessionId={sessionId}
                selectedItem={selectedItem}
              />
            </div>

            {/* End Session Button */}
            <div style={{
              textAlign: 'center',
              marginTop: '30px'
            }}>
              <button
                onClick={handleEndSession}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🏁 End Session
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid #dee2e6',
        color: '#666',
        fontSize: '12px'
      }}>
        <div>Arena Arcade - Real-time streaming and interaction platform</div>
        <div style={{ marginTop: '5px' }}>
          WebSocket Status: {wsStatusInfo.text} |
          Session: {sessionId || 'None'} |
          Balance: {userBalance} chips
        </div>
      </footer>
    </div>
  );
}
// File: src/components/Arena/GameInit.jsx (UPDATED - No Activation Needed)
import React, { useState, useEffect } from 'react';
import arenaGameService from '../../services/arenaGameService';

export default function ArenaGameInit({ onSessionCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [streamUrl, setStreamUrl] = useState('https://twitch.tv/gint0ky');
  const [status, setStatus] = useState('idle'); // idle | initializing | active | connected | error
  const [sessionId, setSessionId] = useState(null);
  const [gameState, setGameState] = useState(null);

  // Warn user before closing tab/window when Arena session is active
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning if WebSocket is connected
      if (arenaGameService.isConnected && arenaGameService.currentSessionId) {
        e.preventDefault();
        e.returnValue = 'You have an active Arena session. Leaving will disconnect you from the game.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Get user token on mount
  useEffect(() => {
    const userToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
    const vorldToken = localStorage.getItem('vorldAccessToken');

    if (userToken) {
      arenaGameService.setTokens(userToken, vorldToken);
      console.log('[ArenaGameInit] Tokens set for ArenaGameService');
    }

    // Setup event listeners
    setupEventListeners();

    return () => {
      // Cleanup on unmount - Keep WebSocket alive, only cleanup event handlers
      console.log('[ArenaGameInit] Component unmounting - WebSocket connection maintained');

      // Only clear event listeners, do NOT disconnect WebSocket
      if (arenaGameService.eventHandlers) {
        arenaGameService.eventHandlers.clear();
      }

      console.log('[ArenaGameInit] Event handlers cleaned up, WebSocket still active');
    };
  }, []);

  // Setup event listeners for ArenaGameService
  const setupEventListeners = () => {
    // Game active event (new - from initGame)
    arenaGameService.on('game_active', (gameState) => {
      console.log('[ArenaGameInit] Game is active:', gameState);
      setStatus('active');
      setSessionId(gameState.sessionId);
      setSuccess('✅ Game initialized and active! Connecting WebSocket...');
    });

    // Connection events
    arenaGameService.on('connected', (data) => {
      console.log('[ArenaGameInit] WebSocket connected:', data);
      setStatus('connected');
      setSuccess('🎮 Game ready! Arena is live and waiting for players...');
    });

    arenaGameService.on('disconnected', (data) => {
      console.log('[ArenaGameInit] WebSocket disconnected:', data);
      setStatus('error');
      setError('🔌 WebSocket disconnected');
    });

    // Arena events
    arenaGameService.on('countdown_started', (data) => {
      console.log('[ArenaGameInit] Countdown started:', data);
      setSuccess('🎮 Arena countdown started! Game will begin soon...');
    });

    arenaGameService.on('arena_begins', (data) => {
      console.log('[ArenaGameInit] Arena begins:', data);
      setSuccess('🚀 Arena game has started! You can now boost players and drop items.');
    });

    arenaGameService.on('player_boosted', (data) => {
      console.log('[ArenaGameInit] Player boosted:', data);
      setSuccess(`💰 Player boosted with ${data.amount} chips!`);
    });

    arenaGameService.on('item_dropped', (data) => {
      console.log('[ArenaGameInit] Item dropped:', data);
      setSuccess(`🎁 Item dropped to player!`);
    });

    arenaGameService.on('game_ended', (data) => {
      console.log('[ArenaGameInit] Game ended:', data);
      setSuccess('🏁 Arena game has ended!');
      setGameState(null);
      setStatus('idle');
    });

    arenaGameService.on('error', (data) => {
      console.error('[ArenaGameInit] Arena error:', data);
      setStatus('error');
      setError(`Arena error: ${data.message || 'Unknown error'}`);
    });
  };

  // Start game với flow mới (không cần activate)
  const startGame = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setStatus('initializing');
      setGameState(null);

      console.log('[ArenaGameInit] Starting Arena game with new flow...');

      // Lấy token
      const userToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

      if (!userToken) {
        throw new Error('Authentication required. Please login first.');
      }

      // Chỉ cần gọi complete flow - không có activate
      const result = await arenaGameService.initializeCompleteFlow(streamUrl, userToken);

      if (result.success) {
        console.log('[ArenaGameInit] ✅ Game ready!');
        setGameState(result.gameState);
        setSuccess('🎉 Arena game is ready! Players can now join and boost!');

        // Notify parent component
        if (onSessionCreated) {
          onSessionCreated(result.gameState);
        }
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('[ArenaGameInit] Failed to start:', err);
      setError(err.message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // End game
  const endGame = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!sessionId) {
        throw new Error('No active session to end');
      }

      console.log('[ArenaGameInit] Ending game session:', sessionId);
      const result = await arenaGameService.endGame(sessionId);

      if (result.success) {
        setSuccess('🏁 Game session ended successfully');
        setGameState(null);
        setSessionId(null);
        setStatus('idle');
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('[ArenaGameInit] Failed to end game:', err);
      setError(`Failed to end game: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'idle': return '#6c757d';
      case 'initializing': return '#fd7e14';
      case 'active': return '#20c997';
      case 'connected': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'idle': return '🟡 Idle';
      case 'initializing': return '🟠 Initializing...';
      case 'active': return '🟢 Game Active';
      case 'connected': return '✅ Connected & Ready';
      case 'error': return '❌ Error';
      default: return '❓ Unknown';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🎮 Arena Game Control Panel</h2>

      {/* Status Display */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h4>Game Status:</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ color: getStatusColor(), fontWeight: 'bold' }}>
            {getStatusText()}
          </span>
          {sessionId && (
            <span style={{ fontSize: '14px', color: '#6c757d' }}>
              Session: <code>{sessionId}</code>
            </span>
          )}
        </div>

        {error && (
          <div style={{ color: '#dc3545', marginTop: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div style={{ color: '#28a745', marginTop: '10px' }}>
            {success}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px' }}>
        {status === 'idle' && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="streamUrl" style={{ display: 'block', marginBottom: '5px' }}>
                Stream URL:
              </label>
              <input
                id="streamUrl"
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://twitch.tv/yourchannel"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <button
              onClick={startGame}
              disabled={loading || !streamUrl}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                marginRight: '10px'
              }}
            >
              {loading ? '⏳ Starting...' : '🎮 Start Arena Game'}
            </button>
          </div>
        )}

        {status === 'initializing' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
            <p>Initializing game and setting up connections...</p>
          </div>
        )}

        {status === 'active' && (
          <div style={{
            backgroundColor: '#d1ecf1',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid #bee5eb'
          }}>
            <h4>🎯 Game Active!</h4>
            <p>WebSocket is connecting... Game will be ready soon.</p>
          </div>
        )}

        {status === 'connected' && (
          <div style={{
            backgroundColor: '#d4edda',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid #c3e6cb'
          }}>
            <h4>🎉 Arena is Live!</h4>
            <p>Players can now join, boost, and receive items!</p>
            {gameState && (
              <div style={{ marginTop: '10px' }}>
                <small>
                  Game ID: {gameState.gameId} |
                  Status: {gameState.status} |
                  WebSocket: {arenaGameService.isConnected ? 'Connected' : 'Disconnected'}
                </small>
              </div>
            )}
          </div>
        )}

        {(status === 'active' || status === 'connected') && (
          <button
            onClick={endGame}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              marginTop: '10px'
            }}
          >
            {loading ? '⏳ Ending...' : '🛑 End Game'}
          </button>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                setStatus('idle');
                setError('');
                setSuccess('');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Reset
            </button>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        fontSize: '14px'
      }}>
        <h4>ℹ️ Flow Information</h4>
        <p><strong>New Flow (No Activation):</strong></p>
        <ol>
          <li>Initialize Game → Game becomes <code>active</code> immediately</li>
          <li>Connect WebSocket → Game is ready to play</li>
        </ol>
        <p style={{ marginTop: '10px', color: '#6c757d' }}>
          <em>Backend now handles activation automatically during initialization.</em>
        </p>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '20px' }}>
          <summary style={{ cursor: 'pointer', color: '#6c757d' }}>Debug Info</summary>
          <pre style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            marginTop: '10px'
          }}>
            {JSON.stringify({
              status,
              sessionId,
              gameState: gameState ? {
                gameId: gameState.gameId,
                status: gameState.status,
                hasWebsocketUrl: !!gameState.websocketUrl
              } : null,
              isConnected: arenaGameService.isConnected,
              error,
              loading
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
// File: src/components/Arena/GameInit.jsx (ENHANCED - 3 Initialization Methods)
import React, { useState, useEffect } from 'react';
import arenaGameService from '../../services/arenaGameService';

export default function ArenaGameInit({ onSessionCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [initMethod, setInitMethod] = useState('method1'); // Default to Method 1
  const [gameState, setGameState] = useState(null);
  const [wsStatus, setWsStatus] = useState('disconnected');

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
    const vorldToken = localStorage.getItem('vorldAccessToken'); // Assuming Vorld token is stored here

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
    // Connection events
    arenaGameService.on('connected', (data) => {
      console.log('[ArenaGameInit] WebSocket connected:', data);
      setWsStatus('connected');
    });

    arenaGameService.on('disconnected', (data) => {
      console.log('[ArenaGameInit] WebSocket disconnected:', data);
      setWsStatus('disconnected');
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

    arenaGameService.on('error', (data) => {
      console.error('[ArenaGameInit] Arena error:', data);
      setError(`Arena error: ${data.message || 'Unknown error'}`);
    });
  };

  // ==========================================
  // METHOD 1: Basic Initialization (with callbacks)
  // ==========================================
  const handleMethod1 = async () => {
    console.log('[ArenaGameInit] 🎯 METHOD 1: Basic initialization with callbacks');

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setGameState(null);

      const result = await arenaGameService.initializeArenaGame({
        streamUrl,
        onSuccess: (gameState) => {
          console.log('[ArenaGameInit] Method 1 - Success callback:', gameState);
          setSuccess(`✅ Method 1: Game initialized successfully! Session: ${gameState.sessionId}`);
          setGameState(gameState);

          // Notify parent component
          if (onSessionCreated) {
            onSessionCreated(gameState);
          }
        },
        onError: (error) => {
          console.error('[ArenaGameInit] Method 1 - Error callback:', error);
          setError(`❌ Method 1 Failed: ${error}`);
        }
      });

      console.log('[ArenaGameInit] Method 1 result:', result);

      // ✅ FIXED: Connection maintained - no auto-disconnect
      console.log('[ArenaGameService] ✅ Connection maintained for game session - ready to receive events');

    } catch (err) {
      console.error('[ArenaGameInit] Method 1 error:', err);
      setError(`❌ Method 1 Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // METHOD 2: Quick Initialization (boolean return)
  // ==========================================
  const handleMethod2 = async () => {
    console.log('[ArenaGameInit] ⚡ METHOD 2: Quick initialization');

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setGameState(null);

      const userToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

      const isSuccess = await arenaGameService.quickInitializeGame(streamUrl, userToken);

      if (isSuccess) {
        const connectionInfo = arenaGameService.getConnectionInfo();
        console.log('[ArenaGameInit] Method 2 - Success:', connectionInfo);

        setSuccess(`⚡ Method 2: Quick init successful! Session: ${connectionInfo.sessionId}`);
        setGameState({
          sessionId: connectionInfo.sessionId,
          gameId: connectionInfo.gameId,
          status: 'active'
        });

        // Notify parent component
        if (onSessionCreated) {
          onSessionCreated({
            sessionId: connectionInfo.sessionId,
            gameId: connectionInfo.gameId,
            status: 'active'
          });
        }
      } else {
        setError('❌ Method 2: Quick initialization failed');
      }

    } catch (err) {
      console.error('[ArenaGameInit] Method 2 error:', err);
      setError(`❌ Method 2 Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // METHOD 3: With WebSocket (auto-connect)
  // ==========================================
  const handleMethod3 = async () => {
    console.log('[ArenaGameInit] 🌐 METHOD 3: Initialization with WebSocket');

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setGameState(null);

      const userToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

      const gameStateResult = await arenaGameService.initializeGameWithWebSocket(streamUrl, userToken);

      if (gameStateResult) {
        console.log('[ArenaGameInit] Method 3 - Success with WebSocket:', gameStateResult);

        setSuccess(`🌐 Method 3: WebSocket connected! Session: ${gameStateResult.sessionId}`);
        setGameState(gameStateResult);

        // Check WebSocket status
        const connectionInfo = arenaGameService.getConnectionInfo();
        if (connectionInfo.connected) {
          setWsStatus('connected');
          setSuccess(prev => prev + ' ✅ WebSocket connected!');
        }

        // Notify parent component
        if (onSessionCreated) {
          onSessionCreated(gameStateResult);
        }
      } else {
        setError('❌ Method 3: Initialization with WebSocket failed');
      }

    } catch (err) {
      console.error('[ArenaGameInit] Method 3 error:', err);
      setError(`❌ Method 3 Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle initialization based on selected method
  const handleInitGame = async () => {
    switch (initMethod) {
      case 'method1':
        await handleMethod1();
        break;
      case 'method2':
        await handleMethod2();
        break;
      case 'method3':
        await handleMethod3();
        break;
      default:
        await handleMethod1();
    }
  };

  // Clear session
  const handleClearSession = () => {
    console.log('[ArenaGameInit] Clearing session...');

    // Disconnect WebSocket
    arenaGameService.disconnect();

    // Reset state
    setGameState(null);
    setSuccess('');
    setError('');
    setWsStatus('disconnected');

    if (onSessionCreated) {
      onSessionCreated(null);
    }
  };

  // Get WebSocket status color
  const getWsStatusColor = () => {
    switch (wsStatus) {
      case 'connected': return '#28a745';
      case 'disconnected': return '#dc3545';
      case 'error': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div className="arena-game-init" style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
        🎮 Arena Game Service - 3 Methods Demo
      </h2>

      {/* Method Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          🎯 Choose Initialization Method:
        </label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setInitMethod('method1')}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: initMethod === 'method1' ? '#007bff' : '#f8f9fa',
              color: initMethod === 'method1' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            Method 1: Callbacks
          </button>
          <button
            onClick={() => setInitMethod('method2')}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: initMethod === 'method2' ? '#28a745' : '#f8f9fa',
              color: initMethod === 'method2' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            Method 2: Quick Boolean
          </button>
          <button
            onClick={() => setInitMethod('method3')}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: initMethod === 'method3' ? '#6f42c1' : '#f8f9fa',
              color: initMethod === 'method3' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            Method 3: WebSocket Auto
          </button>
        </div>
      </div>

      {/* Method Description */}
      <div style={{
        marginBottom: '15px',
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#1565c0'
      }}>
        {initMethod === 'method1' && (
          <div>
            <strong>🎯 Method 1: initializeArenaGame(options)</strong><br/>
            • Parameters: streamUrl, onSuccess callback, onError callback<br/>
            • Returns: {`{success: boolean, gameState?: Object, error?: string}`}<br/>
            • Features: Full control with callbacks
          </div>
        )}
        {initMethod === 'method2' && (
          <div>
            <strong>⚡ Method 2: quickInitializeGame(streamUrl, userToken)</strong><br/>
            • Parameters: streamUrl, userToken<br/>
            • Returns: boolean (success status)<br/>
            • Features: Simple and fast
          </div>
        )}
        {initMethod === 'method3' && (
          <div>
            <strong>🌐 Method 3: initializeGameWithWebSocket(streamUrl, userToken)</strong><br/>
            • Parameters: streamUrl, userToken<br/>
            • Returns: GameState | null<br/>
            • Features: Auto WebSocket connection
          </div>
        )}
      </div>

      {/* Stream URL Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Stream URL (Optional):
        </label>
        <input
          type="text"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          placeholder="https://twitch.tv/your-channel"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Optional: Add your Twitch/YouTube stream URL for streaming integration
        </small>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <button
          onClick={handleInitGame}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#6c757d' :
                           initMethod === 'method1' ? '#007bff' :
                           initMethod === 'method2' ? '#28a745' : '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Initializing...' :
           initMethod === 'method1' ? '🎯 Start with Callbacks' :
           initMethod === 'method2' ? '⚡ Quick Start' :
           '🌐 Start with WebSocket'}
        </button>

        {gameState && (
          <button
            onClick={handleClearSession}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🔄 End Session
          </button>
        )}
      </div>

      {/* Status Display */}
      {gameState && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📊 Session Status:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><strong>Session ID:</strong> <code>{gameState.sessionId}</code></div>
            <div><strong>Game ID:</strong> <code>{gameState.gameId}</code></div>
            <div><strong>Status:</strong> <span style={{ color: '#28a745' }}>{gameState.status}</span></div>
            <div>
              <strong>WebSocket:</strong>
              <span style={{ color: getWsStatusColor(), marginLeft: '5px' }}>
                {wsStatus === 'connected' ? '🟢 Connected' :
                 wsStatus === 'disconnected' ? '🔴 Disconnected' : '⚠️ Error'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          ⏳ Initializing game session using {initMethod === 'method1' ? 'Method 1 (Callbacks)' :
                                            initMethod === 'method2' ? 'Method 2 (Quick Boolean)' :
                                            'Method 3 (WebSocket Auto)'}...
        </div>
      )}

      {/* Console logs reminder */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#856404'
      }}>
        💡 <strong>Tip:</strong> Open browser console (F12) to see detailed logs for each initialization method!
      </div>
    </div>
  );
}
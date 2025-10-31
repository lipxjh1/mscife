// File: src/components/Arena/GameInit.jsx (NEW FILE)
import React, { useState } from 'react';
import arenaService from '../../services/arena';
import arenaSocket from '../../services/arenaSocket';

export default function ArenaGameInit({ onSessionCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [streamUrl, setStreamUrl] = useState('');

  const handleInitGame = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('[ArenaGameInit] Initializing Arena game...', { streamUrl });

      // Call API to init game
      const response = await arenaService.initGame(streamUrl);

      if (response.success) {
        const { sessionId, gameId, status, websocketUrl } = response.data;

        console.log('[ArenaGameInit] Game initialized successfully:', { sessionId, gameId, status, hasWebsocketUrl: !!websocketUrl });

        // Connect WebSocket with URL from backend if available
        arenaSocket.connect(sessionId, websocketUrl);

        // Setup WebSocket event listeners
        arenaSocket.on('session_activated', (data) => {
          console.log('[ArenaGameInit] Session activated:', data);
          setSuccess('Game session activated! You can now boost players and drop items.');
        });

        arenaSocket.on('error', (data) => {
          console.error('[ArenaGameInit] WebSocket error:', data);
          setError(`Connection error: ${data.message || 'Unknown error'}`);
        });

        // Notify parent component
        if (onSessionCreated) {
          onSessionCreated({ sessionId, gameId, status });
        }

        setSuccess(`Arena game started successfully! Session ID: ${sessionId}`);
      } else {
        setError(response.message || 'Failed to start game');
      }

    } catch (err) {
      console.error('[ArenaGameInit] Init game error:', err);

      // Handle specific error cases
      if (err.response?.data?.message) {
        const errorMsg = err.response.data.message;

        if (errorMsg.includes('already have an active game session')) {
          setError('You already have an active game session. Please use the existing session or end it first.');
        } else {
          setError(errorMsg);
        }
      } else {
        setError(err.message || 'Failed to start game');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = () => {
    // Disconnect WebSocket
    arenaSocket.disconnect();

    // Reset state
    setSuccess('');
    setError('');

    if (onSessionCreated) {
      onSessionCreated(null);
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
      <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>🎮 Start Arena Game</h2>

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

      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
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
          borderRadius: '4px'
        }}>
          <strong>Success:</strong> {success}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleInitGame}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Starting...' : '🚀 Start Game'}
        </button>

        {success && (
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

      {loading && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#666'
        }}>
          ⏳ Initializing game session and connecting to Arena server...
        </div>
      )}
    </div>
  );
}
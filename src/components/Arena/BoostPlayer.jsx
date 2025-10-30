// File: src/components/Arena/BoostPlayer.jsx (NEW FILE)
import React, { useState } from 'react';
import arenaService from '../../services/arena';

const VALID_AMOUNTS = [25, 50, 100, 200, 500];

export default function BoostPlayer({ sessionId, userBalance, onBalanceUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [amount, setAmount] = useState(50);
  const [targetUserId, setTargetUserId] = useState('');

  const handleBoost = async () => {
    try {
      // Validation
      if (!sessionId) {
        setError('No active game session. Please start a game first.');
        return;
      }

      if (!targetUserId.trim()) {
        setError('Please enter target player ID.');
        return;
      }

      if (!VALID_AMOUNTS.includes(amount)) {
        setError(`Invalid amount. Must be one of: ${VALID_AMOUNTS.join(', ')}`);
        return;
      }

      if (userBalance < amount) {
        setError(`Insufficient balance. You have ${userBalance} chips, but need ${amount} chips.`);
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      console.log('[BoostPlayer] Boosting player...', { sessionId, targetUserId, amount });

      const response = await arenaService.boostPlayer(sessionId, targetUserId.trim(), amount);

      if (response.success) {
        const { boostId, playerId, amount: boostedAmount } = response.data;

        console.log('[BoostPlayer] Boost successful:', { boostId, playerId, boostedAmount });

        setSuccess(`Successfully boosted ${boostedAmount} chips to player ${playerId}!`);

        // Update balance
        const newBalance = userBalance - boostedAmount;
        if (onBalanceUpdate) {
          onBalanceUpdate(newBalance);
        }

        // Clear form
        setTargetUserId('');
        setAmount(50); // Reset to default

      } else {
        setError(response.message || 'Boost failed');
      }

    } catch (err) {
      console.error('[BoostPlayer] Boost error:', err);

      // Handle specific errors
      if (err.response?.data?.message) {
        const errorMsg = err.response.data.message;

        if (errorMsg.includes('Session not found')) {
          setError('Game session not found. Please start a new game.');
        } else if (errorMsg.includes('Amount must be one of')) {
          setError(`Invalid amount. ${errorMsg}`);
        } else {
          setError(errorMsg);
        }
      } else {
        setError(err.message || 'Boost failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (newAmount) => {
    setAmount(Number(newAmount));
    setError(''); // Clear error when user changes amount
  };

  return (
    <div className="boost-player" style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#fff'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>💰 Boost Player</h3>

      <div style={{
        padding: '10px',
        marginBottom: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        border: '1px solid #bbdefb'
      }}>
        <strong>Your Balance:</strong> <span style={{ color: '#1565c0', fontSize: '18px' }}>{userBalance}</span> chips
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Boost Amount:
        </label>
        <select
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          {VALID_AMOUNTS.map(amt => (
            <option key={amt} value={amt}>
              {amt} chips {amt > userBalance ? '(Insufficient balance)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Target Player ID:
        </label>
        <input
          type="text"
          value={targetUserId}
          onChange={(e) => {
            setTargetUserId(e.target.value);
            setError(''); // Clear error when user types
          }}
          placeholder="e.g., A00111312"
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
          Enter the player ID you want to boost
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

      <button
        onClick={handleBoost}
        disabled={loading || !sessionId || userBalance < amount}
        style={{
          padding: '12px 24px',
          backgroundColor: loading || userBalance < amount ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || userBalance < amount ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        {loading ? '⏳ Boosting...' : `💸 Boost ${amount} Chips`}
      </button>

      {!sessionId && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#dc3545',
          textAlign: 'center'
        }}>
          ⚠️ Please start a game session first
        </div>
      )}

      {userBalance < amount && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#dc3545',
          textAlign: 'center'
        }}>
          ⚠️ Insufficient balance for this boost amount
        </div>
      )}

      {loading && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          ⏳ Processing boost request...
        </div>
      )}
    </div>
  );
}
// File: src/components/Arena/ItemDrop.jsx (NEW FILE)
import React, { useState } from 'react';
import arenaService from '../../services/arena';

export default function ItemDrop({ sessionId, selectedItem }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [targetUserId, setTargetUserId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleDrop = async () => {
    try {
      // Validation
      if (!sessionId) {
        setError('No active game session. Please start a game first.');
        return;
      }

      if (!selectedItem) {
        setError('Please select an item from the catalog first.');
        return;
      }

      if (!targetUserId.trim()) {
        setError('Please enter target player ID.');
        return;
      }

      if (quantity < 1 || !Number.isInteger(quantity)) {
        setError('Quantity must be a positive integer.');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      console.log('[ItemDrop] Dropping item...', {
        sessionId,
        itemId: selectedItem.id,
        targetUserId,
        quantity
      });

      const response = await arenaService.dropItem(
        sessionId,
        selectedItem.id,
        targetUserId.trim(),
        quantity
      );

      if (response.success) {
        const { dropId, itemId, quantity: droppedQuantity } = response.data;

        console.log('[ItemDrop] Item dropped successfully:', { dropId, itemId, droppedQuantity });

        setSuccess(`Successfully dropped ${droppedQuantity}x ${selectedItem.name} to player ${targetUserId}!`);

        // Clear form
        setTargetUserId('');
        setQuantity(1);

      } else {
        setError(response.message || 'Drop failed');
      }

    } catch (err) {
      console.error('[ItemDrop] Drop item error:', err);

      // Handle specific errors
      if (err.response?.data?.message) {
        const errorMsg = err.response.data.message;

        if (errorMsg.includes('Session not found')) {
          setError('Game session not found. Please start a new game.');
        } else if (errorMsg.includes('Item not found')) {
          setError('Selected item not found. Please select a different item.');
        } else {
          setError(errorMsg);
        }
      } else {
        setError(err.message || 'Drop failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    const num = parseInt(newQuantity);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
    setError(''); // Clear error when user changes input
  };

  return (
    <div className="item-drop" style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#fff'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🎁 Drop Item</h3>

      {/* Selected Item Display */}
      <div style={{ marginBottom: '20px' }}>
        {selectedItem ? (
          <div style={{
            padding: '15px',
            backgroundColor: '#e8f5e8',
            border: '1px solid #c3e6cb',
            borderRadius: '4px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#155724' }}>
              ✅ Selected Item:
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{selectedItem.name || 'Unknown Item'}</strong>
                {selectedItem.description && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {selectedItem.description}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#28a745'
              }}>
                {selectedItem.price || 0} chips
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#856404'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>📦</div>
            <div>No item selected</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              Please select an item from the catalog first
            </div>
          </div>
        )}
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
          Enter the player ID who will receive the item
        </small>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Quantity:
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          min="1"
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
          Number of items to drop (minimum: 1)
        </small>
      </div>

      {/* Drop Preview */}
      {selectedItem && targetUserId && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Drop Preview:</strong> {quantity}x {selectedItem.name} → {targetUserId}
        </div>
      )}

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
        onClick={handleDrop}
        disabled={loading || !sessionId || !selectedItem}
        style={{
          padding: '12px 24px',
          backgroundColor: loading || !selectedItem ? '#6c757d' : '#17a2b8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !selectedItem ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        {loading ? '⏳ Dropping...' : '🎁 Drop Item'}
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

      {!selectedItem && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#dc3545',
          textAlign: 'center'
        }}>
          ⚠️ Please select an item from the catalog
        </div>
      )}

      {loading && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          ⏳ Processing item drop request...
        </div>
      )}
    </div>
  );
}
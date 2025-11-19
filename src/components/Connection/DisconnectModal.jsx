import React, { useState, useEffect } from 'react';
import './DisconnectModal.css';

const DisconnectModal = () => {
    const [isDisconnected, setIsDisconnected] = useState(false);
    const [disconnectReason, setDisconnectReason] = useState('');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    useEffect(() => {
        // Listen for disconnect event
        const handleDisconnect = (event) => {
            const { reason } = event.detail;
            console.log('[DisconnectModal] Received disconnect event:', reason);

            setIsDisconnected(true);
            setDisconnectReason(reason);
            setReconnectAttempts(0);
        };

        // Listen for reconnect attempts
        const handleReconnectAttempt = (event) => {
            const { attempt } = event.detail || {};
            console.log('[DisconnectModal] Reconnect attempt:', attempt);
            setReconnectAttempts(attempt || 0);
        };

        // Listen for successful connection
        const handleConnect = () => {
            console.log('[DisconnectModal] Connected - hiding modal');
            setIsDisconnected(false);
            setDisconnectReason('');
            setReconnectAttempts(0);
        };

        // Register event listeners
        window.addEventListener('socket:disconnect:modal', handleDisconnect);
        window.addEventListener('socket:reconnect:attempt', handleReconnectAttempt);
        window.addEventListener('socket:connect:success', handleConnect);

        return () => {
            window.removeEventListener('socket:disconnect:modal', handleDisconnect);
            window.removeEventListener('socket:reconnect:attempt', handleReconnectAttempt);
            window.removeEventListener('socket:connect:success', handleConnect);
        };
    }, []);

    // Get user-friendly message based on reason
    const getMessage = () => {
        const messages = {
            'ping timeout': 'Connection timed out',
            'transport close': 'Connection lost',
            'transport error': 'Network error occurred',
            'io client disconnect': 'Disconnected from server',
            'io server disconnect': 'Server disconnected',
            'forced close': 'Connection closed'
        };
        return messages[disconnectReason] || 'Connection lost to game server';
    };

    // Don't render if connected
    if (!isDisconnected) {
        return null;
    }

    return (
        <div className="disconnect-modal-overlay">
            <div className="disconnect-modal">
                {/* Warning Icon */}
                <div className="disconnect-modal-icon">
                    ⚠️
                </div>

                {/* Title */}
                <h2 className="disconnect-modal-title">
                    Connection Lost
                </h2>

                {/* Loading Spinner */}
                <div className="disconnect-modal-spinner"></div>

                {/* Message */}
                <div className="disconnect-modal-message">
                    <p>{getMessage()}</p>
                    <p className="disconnect-modal-status">
                        Attempting to reconnect...
                    </p>
                    {reconnectAttempts > 0 && (
                        <p className="disconnect-modal-attempts">
                            Attempt {reconnectAttempts}/5
                        </p>
                    )}
                </div>

                {/* Additional info */}
                <div className="disconnect-modal-info">
                    <p>Please check your internet connection</p>
                </div>
            </div>
        </div>
    );
};

export default DisconnectModal;
import React, { useState } from 'react';
import { useWorldID } from './useWorldID';
import { EventBus } from '../game/EventBus';

const WorldIdLogin = ({ onLoginSuccess }) => {
    const { verify, isLoading, error } = useWorldID();
    const [success, setSuccess] = useState(false);

    const handleLogin = async () => {
        setSuccess(false);

        console.log('🚀 Starting World ID login flow...');

        const result = await verify();

        if (result.success) {
            console.log('🎉 World ID login successful!');
            setSuccess(true);

            // Emit event to App.jsx and Phaser game
            EventBus.emit('world-id-login-success', {
                success: true
            });

            // Call success callback if provided
            if (onLoginSuccess) {
                onLoginSuccess();
            }

            // Auto-redirect after success
            setTimeout(() => {
                console.log('🎮 Redirecting to game...');
                // Game will handle the event and show itself
            }, 1500);
        } else {
            console.error('❌ World ID login failed:', result.error);
        }
    };

    return (
        <div className="world-id-login-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            {/* Logo/Title */}
            <div className="login-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                    MSCI Game
                </h1>
                <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.2rem'
                }}>
                    Verify with World ID to play
                </p>
            </div>

            {/* Verify Button */}
            <button
                onClick={handleLogin}
                disabled={isLoading || success}
                style={{
                    background: success ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)' : '#000',
                    color: '#fff',
                    border: success ? 'none' : '2px solid #fff',
                    padding: '16px 40px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    cursor: (isLoading || success) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || success) ? 0.9 : 1,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                {isLoading ? (
                    <>
                        <div className="spinner" style={{
                            width: '20px',
                            height: '20px',
                            border: '3px solid #fff',
                            borderTop: '3px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        Verifying...
                    </>
                ) : success ? (
                    <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Success! Loading game...
                    </>
                ) : (
                    <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Verify & Play
                    </>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <div className="error-message" style={{
                    marginTop: '20px',
                    padding: '12px 20px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    {error}
                    <button
                        onClick={clearError}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid #fff',
                            borderRadius: '6px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="success-message" style={{
                    marginTop: '20px',
                    padding: '12px 20px',
                    background: 'rgba(39, 174, 96, 0.2)',
                    border: '1px solid rgba(39, 174, 96, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    ✅ Login successful! Loading game...
                </div>
            )}

            {/* Instructions */}
            <div className="instructions" style={{
                marginTop: '40px',
                padding: '20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                maxWidth: '500px',
                textAlign: 'center'
            }}>
                <h3 style={{ color: '#fff', marginBottom: '10px' }}>How it works:</h3>
                <ol style={{
                    color: 'rgba(255,255,255,0.9)',
                    textAlign: 'left',
                    paddingLeft: '20px'
                }}>
                    <li style={{ marginBottom: '8px' }}>Click "Verify & Play" above</li>
                    <li style={{ marginBottom: '8px' }}>Confirm in your World App</li>
                    <li style={{ marginBottom: '8px' }}>You'll be automatically logged in</li>
                </ol>
            </div>

            {/* Add spinner animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `
            }} />
        </div>
    );
};

export default WorldIdLogin;
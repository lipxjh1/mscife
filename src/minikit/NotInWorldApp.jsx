import React from 'react';
import { WORLD_ID_CONFIG } from './config';

const NotInWorldApp = ({ onOpenInWorldApp }) => {
    const worldAppUrl = `https://world.app/`;
    const deepLink = `worldcoin://world/${WORLD_ID_CONFIG.APP_ID}?action=${WORLD_ID_CONFIG.ACTION}`;

    return (
        <div className="not-in-world-app" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            {/* Logo/Title */}
            <div className="app-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
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
                    World ID verification required
                </p>
            </div>

            {/* Warning Icon */}
            <div style={{
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px'
            }}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9V13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                          stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </div>

            {/* Message */}
            <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '30px',
                borderRadius: '16px',
                maxWidth: '500px',
                textAlign: 'center',
                marginBottom: '40px'
            }}>
                <h2 style={{
                    color: '#fff',
                    fontSize: '1.5rem',
                    marginBottom: '15px'
                }}>
                    Open in World App
                </h2>
                <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    marginBottom: '20px'
                }}>
                    To play MSCI Game with World ID, you need to open this page in the World App.
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={() => {
                            // Try deep link first
                            window.location.href = deepLink;
                            // Fallback to World App store after delay
                            setTimeout(() => {
                                window.open(worldAppUrl, '_blank');
                            }, 2000);
                        }}
                        style={{
                            background: '#000',
                            color: '#fff',
                            border: '2px solid #fff',
                            padding: '16px 32px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Open World App
                    </button>

                    <p style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.9rem'
                    }}>
                        Or scan the QR code below
                    </p>
                </div>
            </div>

            {/* QR Code Placeholder */}
            <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '30px'
            }}>
                <div style={{
                    width: '200px',
                    height: '200px',
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#666',
                    textAlign: 'center'
                }}>
                    QR Code<br/>for<br/>{window.location.href}
                </div>
            </div>

            {/* Instructions */}
            <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '12px',
                maxWidth: '500px',
                textAlign: 'center'
            }}>
                <h3 style={{ color: '#fff', marginBottom: '15px' }}>Don't have World ID?</h3>
                <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1rem',
                    marginBottom: '15px'
                }}>
                    1. Download World App from your app store
                </p>
                <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1rem',
                    marginBottom: '15px'
                }}>
                    2. Create your World ID
                </p>
                <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1rem'
                }}>
                    3. Come back here to verify and play!
                </p>
            </div>

            {/* Fallback for development */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '15px',
                    borderRadius: '8px',
                    maxWidth: '300px'
                }}>
                    <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '10px' }}>
                        Development Mode Detected
                    </p>
                    <button
                        onClick={onOpenInWorldApp}
                        style={{
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Simulate World App
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotInWorldApp;
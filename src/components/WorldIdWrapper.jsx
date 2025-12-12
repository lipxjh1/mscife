import React from 'react';
import { useMiniKit, WorldIdLogin, NotInWorldApp } from '../minikit';
import { EventBus } from '../game/EventBus';

const WorldIdWrapper = ({ children }) => {
    const { isInstalled, isReady } = useMiniKit();

    // Handle login success for dev mode
    const handleDevLogin = () => {
        console.log('🔧 Dev mode: Simulating World ID login');
        EventBus.emit('world-id-login-success', {
            user: {
                id: 'dev_user',
                username: 'dev_user',
                verified: true
            },
            tokens: {
                accessToken: 'dev_token',
                refreshToken: 'dev_refresh_token'
            }
        });
    };

    if (!isReady) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundImage: 'url(/assets/login/login_bg.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                <div style={{
                    color: 'white',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    // If running in World App, show World ID login
    if (isInstalled) {
        return <WorldIdLogin />;
    }

    // If not in World App, show fallback
    // In development, show the game with a warning
    if (process.env.NODE_ENV === 'development') {
        return (
            <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
                {children}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    right: '10px',
                    background: 'rgba(255, 193, 7, 0.9)',
                    padding: '10px',
                    borderRadius: '8px',
                    zIndex: 1000,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '14px', color: '#000' }}>
                        ⚠️ Development Mode - Not in World App
                    </span>
                    <button
                        onClick={handleDevLogin}
                        style={{
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Simulate World ID Login
                    </button>
                </div>
            </div>
        );
    }

    // In production, show NotInWorldApp component
    return <NotInWorldApp />;
};

export default WorldIdWrapper;
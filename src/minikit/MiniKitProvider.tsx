import React, { createContext, useContext, useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

const MiniKitContext = createContext<any>(null);

export const useMiniKit = () => {
    const context = useContext(MiniKitContext);
    if (!context) {
        throw new Error('useMiniKit must be used within MiniKitProvider');
    }
    return context;
};

export const MiniKitProvider = ({ children }: { children: React.ReactNode }) => {
    const [isInstalled, setIsInstalled] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('🔧 MiniKitProvider: Initializing...');

        const initMiniKit = () => {
            try {
                // ✅ BƯỚC 1: Install TRƯỚC - BẮT BUỘC!
                MiniKit.install({
                    appId: import.meta.env.VITE_WORLD_APP_ID || 'app_c1f666c83bbbc687bde452e4acb51b40'
                });
                console.log('✅ MiniKit.install() called with appId');

                // ✅ BƯỚC 2: Check SAU khi đã install
                const installed = MiniKit.isInstalled();
                console.log('📱 MiniKit.isInstalled():', installed);

                if (installed) {
                    console.log('✅ Running inside World App - MiniKit detected!');
                    setIsInstalled(true);
                } else {
                    console.log('❌ Not running in World App - showing fallback');
                    setIsInstalled(false);
                }
            } catch (err) {
                console.error('❌ MiniKit initialization error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                // ✅ Luôn set ready để render UI
                setIsReady(true);
            }
        };

        initMiniKit();
    }, []);

    const value = {
        isInstalled,
        isReady,
        error,
        MiniKit
    };

    // ✅ Loading state - chờ init xong
    if (!isReady) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#00ff88',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <div style={{ color: '#fff', fontSize: '18px' }}>
                    Đang khởi tạo MiniKit...
                </div>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // ✅ Not in World App - dùng STATE thay vì check trực tiếp
    if (!isInstalled) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '40px',
                    borderRadius: '20px',
                    maxWidth: '400px'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        fontSize: '40px'
                    }}>
                        🌍
                    </div>
                    <h1 style={{ fontSize: '28px', marginBottom: '15px' }}>
                        MỞ TRONG WORLD APP
                    </h1>
                    <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '20px' }}>
                        Vui lòng mở ứng dụng này trong World App để sử dụng đầy đủ tính năng.
                    </p>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        <p>MiniKit Status: Không tìm thấy</p>
                        <p>URL: {window.location.href}</p>
                    </div>
                    <button
                        onClick={() => {
                            window.location.href = `https://worldcoin.org/mini-app?app_id=app_c1f666c83bbbc687bde452e4acb51b40`;
                        }}
                        style={{
                            marginTop: '20px',
                            padding: '15px 30px',
                            background: '#000',
                            color: '#fff',
                            border: '2px solid #fff',
                            borderRadius: '50px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Mở World App
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Success - render app
    console.log('✅ MiniKitProvider: Rendering children - MiniKit ready');
    return (
        <MiniKitContext.Provider value={value}>
            {children}
        </MiniKitContext.Provider>
    );
};
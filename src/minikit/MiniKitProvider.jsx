import React, { createContext, useContext, useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

const MiniKitContext = createContext();

export const useMiniKit = () => {
    const context = useContext(MiniKitContext);
    if (!context) {
        throw new Error('useMiniKit must be used within MiniKitProvider');
    }
    return context;
};

export const MiniKitProvider = ({ children }) => {
    const [isInstalled, setIsInstalled] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initMiniKit = async () => {
            try {
                // Check if MiniKit is installed (running in World App)
                if (MiniKit.isInstalled()) {
                    console.log('🌍 MiniKit detected in World App');
                    setIsInstalled(true);

                    // Install MiniKit
                    await MiniKit.install();
                    console.log('✅ MiniKit installed successfully');
                    setIsReady(true);
                } else {
                    console.log('📱 MiniKit not detected - running in regular browser');
                    setIsReady(true);
                }
            } catch (err) {
                console.error('❌ MiniKit initialization error:', err);
                setError(err.message);
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

    return (
        <MiniKitContext.Provider value={value}>
            {children}
        </MiniKitContext.Provider>
    );
};
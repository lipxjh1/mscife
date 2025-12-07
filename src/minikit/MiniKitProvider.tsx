import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

interface MiniKitContextType {
  MiniKit: typeof MiniKit;
  isReady: boolean;
  isInstalled: boolean;
}

const MiniKitContext = createContext<MiniKitContextType | null>(null);

interface MiniKitProviderProps {
  children: ReactNode;
}

export const MiniKitProvider: React.FC<MiniKitProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkMiniKit = async () => {
      try {
        const installed = MiniKit.isInstalled();
        setIsInstalled(installed);

        if (installed) {
          // Initialize MiniKit
          await MiniKit.install();
          setIsReady(true);
        }
      } catch (error) {
        console.error('MiniKit initialization failed:', error);
      }
    };

    checkMiniKit();
  }, []);

  if (!isInstalled) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        padding: 20,
        textAlign: 'center',
        gap: 20
      }}>
        <img
          src="/assets/worldcoin-logo.png"
          alt="Worldcoin"
          style={{
            width: 80,
            height: 80,
            marginBottom: 20
          }}
          onError={(e) => {
            // Fallback if image not found
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <h2 style={{ fontSize: '24px', margin: 0 }}>
          Open game in World App
        </h2>
        <p style={{ fontSize: '16px', margin: 0, color: '#aaaaaa' }}>
          Please open this link in the World App to play
        </p>
        <div style={{
          marginTop: 20,
          padding: '15px 30px',
          backgroundColor: '#7C3AED',
          borderRadius: '12px'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Link copied! Open in World App
          </p>
        </div>
      </div>
    );
  }

  return (
    <MiniKitContext.Provider value={{ MiniKit, isReady, isInstalled }}>
      {children}
    </MiniKitContext.Provider>
  );
};

export const useMiniKit = () => {
  const context = useContext(MiniKitContext);
  if (!context) {
    throw new Error('useMiniKit must be used within MiniKitProvider');
  }
  return context;
};
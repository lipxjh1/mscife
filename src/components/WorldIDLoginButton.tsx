import React, { useEffect } from 'react';
import { useWorldID } from '../minikit/useWorldID';
import { useMiniKit } from '../minikit/MiniKitProvider';
import { EventBus } from '../game/EventBus';

interface WorldIDLoginButtonProps {
  onVerified?: () => void;
  onError?: (error: string) => void;
}

export const WorldIDLoginButton: React.FC<WorldIDLoginButtonProps> = ({
  onVerified,
  onError
}) => {
  const { verify, isLoading, error } = useWorldID();
  const { MiniKit } = useMiniKit();

  const handleVerify = async () => {
    const result = await verify();

    if (result.success) {
      // Emit event for Phaser
      EventBus.emit('world-id-verified');
      onVerified?.();
    } else {
      // Emit error event for Phaser
      EventBus.emit('world-id-error', result.error || error || 'Verification failed');
      onError?.(result.error || error || 'Verification failed');
    }
  };

  useEffect(() => {
    // Auto-focus for better UX
    if (!isLoading && MiniKit.isInstalled()) {
      // Add keyboard shortcut (Space to verify)
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !isLoading) {
          e.preventDefault();
          handleVerify();
        }
      };

      window.addEventListener('keydown', handleKeyPress);

      // Listen for auto-trigger event
      const handleAutoTrigger = () => {
        console.log('🎯 Auto-triggering World ID verification...');
        if (MiniKit.isInstalled() && !isLoading) {
          handleVerify();
        }
      };

      EventBus.on('auto-trigger-worldid-verify', handleAutoTrigger);

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        EventBus.off('auto-trigger-worldid-verify', handleAutoTrigger);
      };
    }
  }, [isLoading, MiniKit]);

  if (!MiniKit.isInstalled()) {
    return null; // MiniKitProvider will show the error screen
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      zIndex: 1000
    }}>
      {/* World ID Icon */}
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        boxShadow: '0 10px 30px rgba(124, 58, 237, 0.5)'
      }}>
        <svg
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          style={{ filter: 'brightness(0) invert(1)' }}
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm2 7h-8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1z"
            fill="white"
          />
        </svg>
      </div>

      {/* Welcome Text */}
      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#ffffff',
        margin: 0,
        textAlign: 'center',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
      }}>
        Welcome to MSCI Game
      </h2>

      {/* Subtitle */}
      <p style={{
        fontSize: '18px',
        color: '#aaaaaa',
        margin: 0,
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Verify your humanity to continue
      </p>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={isLoading}
        style={{
          padding: '18px 40px',
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          background: isLoading
            ? 'linear-gradient(135deg, #666666, #888888)'
            : 'linear-gradient(135deg, #7C3AED, #EC4899)',
          border: 'none',
          borderRadius: '16px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: isLoading
            ? 'none'
            : '0 8px 25px rgba(124, 58, 237, 0.5)',
          minWidth: '320px',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}
        onMouseOver={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(124, 58, 237, 0.6)';
          }
        }}
        onMouseOut={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.5)';
          }
        }}
      >
        {isLoading && (
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
        {isLoading ? "Verifying..." : "Verify with World ID & Play"}
      </button>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          marginTop: '10px'
        }}>
          <p style={{
            color: '#ef4444',
            margin: 0,
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderRadius: '8px',
        maxWidth: '400px'
      }}>
        <p style={{
          color: '#7C3AED',
          margin: 0,
          fontSize: '14px',
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          💡 Press <kbd style={{
            padding: '2px 6px',
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            borderRadius: '4px'
          }}>Space</kbd> or click to verify
        </p>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
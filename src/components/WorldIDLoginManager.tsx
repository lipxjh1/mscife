import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { WorldIDLoginButton } from './WorldIDLoginButton';
import { EventBus } from '../game/EventBus';

const WorldIDLoginManager: React.FC = () => {
  const [containerId, setContainerId] = useState<string | null>(null);

  useEffect(() => {
    // Listen for render request from Phaser
    const handleRenderRequest = (id: string) => {
      setContainerId(id);
    };

    EventBus.on('render-worldid-login', handleRenderRequest);

    // Cleanup on unmount
    return () => {
      EventBus.off('render-worldid-login', handleRenderRequest);
    };
  }, []);

  useEffect(() => {
    if (containerId) {
      const element = document.getElementById(containerId);
      if (element) {
        // Clear container
        element.innerHTML = '';

        // Create React root and render World ID button
        const root = createRoot(element);
        root.render(
          <WorldIDLoginButton
            onVerified={() => {
              // Cleanup after successful verification
              setTimeout(() => {
                element.remove();
                setContainerId(null);
              }, 500);
            }}
            onError={(error) => {
              // Keep button visible on error
              console.error('World ID verification error:', error);
            }}
          />
        );
      }
    }
  }, [containerId]);

  return null; // This component doesn't render anything directly
};

export default WorldIDLoginManager;
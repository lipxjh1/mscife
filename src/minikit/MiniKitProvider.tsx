import React, { useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export const MiniKitProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (MiniKit.isInstalled()) {
      setIsReady(true);
    }
  }, []);

  // Nếu KHÔNG mở trong World App → hiện màn hình thông báo
  if (!MiniKit.isInstalled()) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #1a0033, #000000)',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px',
        zIndex: 9999
      }}>
        <h1 style={{ fontSize: '42px', marginBottom: '20px' }}>MỞ TRONG WORLD APP</h1>
        <p style={{ fontSize: '22px' }}>Game chỉ hoạt động trong ứng dụng World</p>
        <div style={{ marginTop: '40px', fontSize: '18px', opacity: 0.8 }}>
          Vào World App → Mini Apps → Tìm "MSCI Game"
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
import React, { useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

console.log('MiniKitProvider: Bắt đầu render');

export const MiniKitProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('MiniKitProvider: Đang check MiniKit.isInstalled()...');
    console.log('MiniKit object:', MiniKit);
    console.log('MiniKit.isInstalled():', MiniKit.isInstalled());

    if (MiniKit.isInstalled()) {
      console.log('MINIKIT PHÁT HIỆN THÀNH CÔNG – GAME SẼ CHẠY');
      setIsReady(true);
    } else {
      console.log('MINIKIT KHÔNG TÌM THẤY – SẼ HIỆN MÀN HÌNH ĐEN');
    }
  }, []);

  if (!MiniKit.isInstalled()) {
    console.log('RENDER: HIỆN MÀN HÌNH "MỞ TRONG WORLD APP"');
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#000',
        color: '#0f0', fontSize: '28px', fontWeight: 'bold',
        display: 'grid', placeItems: 'center', textAlign: 'center',
        padding: '20px', fontFamily: 'monospace'
      }}>
        <div>
          <h1>MỞ TRONG WORLD APP</h1>
          <p>MiniKit: {MiniKit.isInstalled() ? 'OK' : 'KHÔNG TÌM THẤY'}</p>
          <p>URL: {window.location.href}</p>
        </div>
      </div>
    );
  }

  console.log('RENDER: CHO PHÉP VÀO GAME – MiniKit đã ready');
  return <>{children}</>;
};
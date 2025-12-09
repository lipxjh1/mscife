/**
 * Example: How to use WorldPay in a Phaser Scene
 * ===============================================
 *
 * This file demonstrates how to integrate World Pay payment
 * into any Phaser scene in your game.
 */

import { WorldPayBridge } from './WorldPayBridge';

export class TestShopScene extends Phaser.Scene {
  constructor() {
    super('TestShopScene');
    this.muskBalance = 0;
  }

  create() {
    console.log('[TestShopScene] Creating scene...');

    // Setup World Pay listeners
    this.setupWorldPay();

    // Create UI
    this.createUI();

    // Add test text
    this.add.text(400, 50, 'WORLD PAY TEST', {
      fontSize: '32px',
      fill: '#00ff00'
    }).setOrigin(0.5);
  }

  setupWorldPay() {
    // Setup payment result listeners
    WorldPayBridge.onPaymentResult(
      // Success callback
      (data) => {
        console.log('[TestShopScene] ✅ Payment success!', data);

        // Update balance
        this.muskBalance = data.newBalance || (this.muskBalance + data.muskCredited);

        // Show success message
        this.showMessage(`+${data.muskCredited} MUSK! Total: ${this.muskBalance}`, '#00ff00');

        // Update balance display
        if (this.balanceText) {
          this.balanceText.setText(`MUSK Balance: ${this.muskBalance}`);
        }
      },

      // Error callback
      (data) => {
        console.log('[TestShopScene] ❌ Payment failed:', data);

        // Show error message
        this.showMessage(`Error: ${data.error}`, '#ff0000');
      },

      // Optional: Status callback for loading
      (data) => {
        console.log('[TestShopScene] Status:', data.status, data.message);

        // Update status text
        if (this.statusText) {
          this.statusText.setText(data.message);
        }
      }
    );
  }

  createUI() {
    const centerX = 400;
    let y = 150;

    // Balance display
    this.balanceText = this.add.text(centerX, y, `MUSK Balance: ${this.muskBalance}`, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    y += 80;

    // Status text
    this.statusText = this.add.text(centerX, y, '', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    y += 60;

    // Buy buttons
    const packages = [
      { musk: 100, label: '100 MUSK (1 WLD)', color: '#4CAF50' },
      { musk: 500, label: '500 MUSK (5 WLD)', color: '#2196F3' },
      { musk: 1000, label: '1000 MUSK (10 WLD)', color: '#FF9800' },
    ];

    packages.forEach(pkg => {
      const button = this.add.text(centerX, y, pkg.label, {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: pkg.color,
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();

      button.on('pointerdown', () => {
        console.log(`[TestShopScene] Buying ${pkg.musk} MUSK...`);
        WorldPayBridge.requestPayment(pkg.musk, 'WLD');
      });

      button.on('pointerover', () => {
        button.setStyle({ backgroundColor: pkg.color + 'AA' });
      });

      button.on('pointerout', () => {
        button.setStyle({ backgroundColor: pkg.color });
      });

      y += 60;
    });

    // USDC option
    y += 20;
    const usdcButton = this.add.text(centerX, y, 'Buy 1000 MUSK (10 USDC)', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#9C27B0',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    usdcButton.on('pointerdown', () => {
      console.log('[TestShopScene] Buying 1000 MUSK with USDC...');
      WorldPayBridge.requestPayment(1000, 'USDC');
    });
  }

  showMessage(text, color = '#ffffff') {
    // Remove old message if exists
    if (this.messageText) {
      this.messageText.destroy();
    }

    // Create new message
    this.messageText = this.add.text(400, 500, text, {
      fontSize: '28px',
      fill: color,
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5);

    // Auto-hide after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.messageText) {
        this.messageText.destroy();
        this.messageText = null;
      }
    });
  }

  shutdown() {
    console.log('[TestShopScene] Shutting down...');

    // IMPORTANT: Cleanup World Pay listeners
    WorldPayBridge.cleanup();

    // Clean up other stuff
    if (this.messageText) {
      this.messageText.destroy();
    }
  }
}

// How to add this scene to your game:
/*
In your game configuration or scene list, add:

{
  key: 'TestShopScene',
  scene: TestShopScene
}

And to navigate to it:
this.scene.start('TestShopScene');
*/
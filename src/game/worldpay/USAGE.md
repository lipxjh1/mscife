# WorldPayBridge Usage Guide

## Quick Start

### 1. Import trong Phaser Scene

```javascript
import { WorldPayBridge } from '../../worldpay/WorldPayBridge';
// hoặc
import { WorldPayBridge } from '../worldpay';
```

### 2. Setup Listeners trong create()

```javascript
class ShopScene extends Phaser.Scene {
  create() {
    // Setup payment result listeners
    WorldPayBridge.onPaymentResult(
      // Success callback
      (data) => {
        console.log('✅ Payment success!');
        console.log('MUSK credited:', data.muskCredited);
        console.log('New balance:', data.newBalance);

        // Update UI
        this.updateBalanceDisplay(data.newBalance);
        this.showSuccessPopup(`+${data.muskCredited} MUSK`);
      },
      // Error callback
      (data) => {
        console.log('❌ Payment failed:', data.error);

        // Show error
        this.showErrorPopup(data.error);
      },
      // Optional: Status callback
      (data) => {
        console.log('Status:', data.status, data.message);
        this.updateStatusText(data.message);
      }
    );
  }
}
```

### 3. Request Payment

```javascript
// Basic - specify amount directly
WorldPayBridge.requestPayment(1000, 'WLD');

// With USDC
WorldPayBridge.requestPayment(500, 'USDC');

// With options
WorldPayBridge.requestPayment(1000, 'WLD', {
  showLoading: true,
  packageId: 3
});

// Using package ID (if you have predefined packages)
WorldPayBridge.requestPaymentByPackage(3, 'WLD');
```

### 4. Cleanup trong shutdown()

```javascript
class ShopScene extends Phaser.Scene {
  shutdown() {
    // QUAN TRỌNG: Cleanup để tránh memory leaks
    WorldPayBridge.cleanup();
  }
}
```

## Complete Example

```javascript
import Phaser from 'phaser';
import { WorldPayBridge } from '../worldpay/WorldPayBridge';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
    this.balance = 0;
  }

  create() {
    // Setup World Pay listeners
    this.setupWorldPay();

    // Create buy buttons
    this.createBuyButtons();
  }

  setupWorldPay() {
    WorldPayBridge.onPaymentResult(
      (data) => this.onPaymentSuccess(data),
      (data) => this.onPaymentError(data),
      (data) => this.onPaymentStatus(data)
    );
  }

  createBuyButtons() {
    // Button: Buy 1000 MUSK
    this.add.text(400, 200, '💰 Buy 1000 MUSK (10 WLD)', {
      fontSize: '24px',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 }
    })
    .setInteractive()
    .on('pointerdown', () => {
      WorldPayBridge.requestPayment(1000, 'WLD');
    });

    // Button: Buy 5000 MUSK
    this.add.text(400, 280, '💰 Buy 5000 MUSK (50 WLD)', {
      fontSize: '24px',
      backgroundColor: '#2196F3',
      padding: { x: 20, y: 10 }
    })
    .setInteractive()
    .on('pointerdown', () => {
      WorldPayBridge.requestPayment(5000, 'WLD');
    });
  }

  onPaymentSuccess(data) {
    console.log('✅ Payment success!', data);

    // Update balance
    this.balance = data.newBalance || (this.balance + data.muskCredited);

    // Show success popup
    this.showPopup(`+${data.muskCredited} MUSK`, '#4CAF50');

    // Play success sound
    this.sound.play('success');
  }

  onPaymentError(data) {
    console.log('❌ Payment failed:', data.error);

    // Show error popup
    this.showPopup(data.error, '#F44336');

    // Play error sound
    this.sound.play('error');
  }

  onPaymentStatus(data) {
    // Update loading text
    if (this.statusText) {
      this.statusText.setText(data.message);
    }
  }

  showPopup(message, color) {
    const popup = this.add.text(400, 400, message, {
      fontSize: '32px',
      backgroundColor: color,
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5);

    // Auto-hide after 3 seconds
    this.time.delayedCall(3000, () => {
      popup.destroy();
    });
  }

  shutdown() {
    // Cleanup World Pay listeners
    WorldPayBridge.cleanup();
  }
}
```

## Events Reference

| Event | Direction | Data |
|-------|-----------|------|
| `world-pay-request` | Phaser → React | `{ muskAmount, currency, packageId }` |
| `world-pay-success` | React → Phaser | `{ muskCredited, newBalance, transactionHash, depositId }` |
| `world-pay-error` | React → Phaser | `{ error, code, depositId }` |
| `world-pay-status` | React → Phaser | `{ status, message }` |

## Tips

1. **Always cleanup** - Call `WorldPayBridge.cleanup()` in `shutdown()` to prevent memory leaks
2. **Handle errors** - Always provide error callback to handle payment failures
3. **Status updates** - Use status callback to show loading progress to users
4. **Test in World App** - Payments only work inside World App, not in browser
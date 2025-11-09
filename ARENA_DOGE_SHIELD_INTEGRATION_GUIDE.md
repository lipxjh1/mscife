# Arena DOGE Shield Integration Guide
## Date: 2025-11-09

## 📋 Overview
This guide shows how to integrate the new DOGE Shield functionality with existing Arena frontend code to receive real-time inventory updates from the backend.

---

## 🗂️ New Files Created

### Core Files:
1. `src/modules/vorld-auth/core/ArenaSocketListeners.js`
   - Handles `inventory:update` events from backend
   - Manages DOGE Shield special effects
   - Updates centerData and Phaser UI

2. `src/hooks/useArenaInventory.js`
   - React hook for inventory state management
   - Integrates with centerData for compatibility
   - Provides inventory getters and setters

3. `src/components/Arena/DogeShieldNotification.jsx`
   - Special notification component for DOGE Shield
   - Enhanced animations and visual effects
   - Displays quantity and message

4. `src/components/Arena/DogeShieldNotification.css`
   - Styles for DOGE Shield notifications
   - Includes animations and mobile responsive

5. `src/components/Arena/ArenaInventoryManager.jsx`
   - Manages inventory updates from Arena
   - Coordinates between socket listeners and UI
   - Plays sound effects

6. `src/components/Arena/ArenaInventoryManager.css`
   - Styles for inventory overlay
   - Shield counter display

---

## 🔧 Integration Steps

### Step 1: Update ArenaSocketService
File: `src/services/arenaSocket.js`

Add this around line 250 (after existing event handlers):

```javascript
// Import at the top
import ArenaSocketListeners from '../modules/vorld-auth/core/ArenaSocketListeners.js';

// In ArenaSocketService class, add:
constructor() {
  // ... existing code ...
  this.arenaListeners = null;
}

// Update the connect method to include:
connect(sessionId, websocketUrl = null) {
  // ... existing connection code ...

  // After socket is connected, add:
  this.socket.on('connect', () => {
    // ... existing code ...

    // Setup Arena listeners
    this.arenaListeners = new ArenaSocketListeners(this.socket, {
      onInventoryUpdate: this.handleInventoryUpdate.bind(this),
      onDogeShieldReceived: this.handleDogeShieldReceived.bind(this),
      onPlaySound: this.handlePlaySound.bind(this),
      onUpdatePhaserUI: this.handleUpdatePhaserUI.bind(this)
    });
  });
}

// Add new methods:
handleInventoryUpdate(data) {
  console.log('[ArenaSocketService] Inventory update:', data);
  this._emit('inventory_update', data);
}

handleDogeShieldReceived(data) {
  console.log('[ArenaSocketService] DOGE Shield received:', data);
  this._emit('doge_shield_received', data);
}

handlePlaySound(soundName) {
  this._emit('play_sound', soundName);
}

handleUpdatePhaserUI(data) {
  this._emit('update_phaser_ui', data);
}
```

### Step 2: Update ArenaUI Component
File: `src/components/Arena/ArenaUI.jsx`

Add imports at the top:
```jsx
import { ArenaInventoryManager } from './ArenaInventoryManager';
import ArenaSocketListeners from '../../modules/vorld-auth/core/ArenaSocketListeners';
```

Update the component:
```jsx
const ArenaUI = () => {
  // ... existing state ...
  const [arenaSocket, setArenaSocket] = useState(null);

  useEffect(() => {
    // Import arenaSocketService (adjust path as needed)
    import('../../services/arenaSocket.js').then(module => {
      const socketService = module.default;
      setArenaSocket(socketService);

      // Connect if not already connected
      if (!socketService.isConnected) {
        // Use your session ID logic here
        socketService.connect('your_session_id');
      }
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  // ... existing useEffects ...

  return (
    <div className="arena-ui">
      {/* ... existing UI components ... */}

      {/* Add inventory manager */}
      <ArenaInventoryManager arenaSocket={arenaSocket} />

      {/* ... rest of UI ... */}
    </div>
  );
};
```

### Step 3: Update Gameplay Scene (Phaser)
File: `src/game/scenes/Gameplay.js`

Add event listener for inventory updates:

```javascript
// In create() method:
create() {
  // ... existing code ...

  // Listen for inventory updates from React
  window.game?.events?.on('inventory-update', this.handleInventoryUpdate, this);
}

// Add new method:
handleInventoryUpdate(data) {
  console.log('[Gameplay] Inventory updated:', data);

  if (data.itemCode === 'DOGE_SHIELD' && data.quantity !== undefined) {
    // Update shield count
    this.updateShieldCount(data.quantity);

    // Play visual effect
    this.playShieldEffect();
  }
}

updateShieldCount(quantity) {
  // Update centerData
  if (window.centerData && window.centerData.inventoryDictionary) {
    let shieldItem = window.centerData.inventoryDictionary['DOGE_SHIELD'];
    if (!shieldItem) {
      shieldItem = { itemId: 'DOGE_SHIELD', quantity: 0 };
      window.centerData.inventoryDictionary['DOGE_SHIELD'] = shieldItem;
    }
    shieldItem.quantity = quantity;
  }

  // Update UI button
  if (this.container_selector) {
    const allButtons = this.container_selector.list;
    for (let container of allButtons) {
      if (container.container_button_inner) {
        const image = container.container_button_inner.list.find(obj =>
          obj.texture && obj.texture.key === 'item_doge_shield'
        );
        if (image && container.text_quantity) {
          container.text_quantity.setText(quantity);

          // Add pulse animation
          this.tweens.add({
            targets: container.container_button_inner,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
          });
          break;
        }
      }
    }
  }
}

playShieldEffect() {
  // Spawn shield at random position
  this.spawnShieldItem({
    x: Math.random() * 700 + 100,
    y: Math.random() * 400 + 100
  });
}
```

### Step 4: Add Sound Files (Optional)
Create sounds directory and add:
- `/public/sounds/item_received.mp3` - Sound for receiving items
- `/public/sounds/doge_shield.mp3` - Special sound for DOGE Shield

### Step 5: Test Integration
Open browser console and test:

```javascript
// Test inventory update
window.dispatchEvent(new CustomEvent('arena:inventory_update', {
  detail: {
    userId: 'test_user',
    itemCode: 'DOGE_SHIELD',
    itemName: 'DOGE Shield',
    quantity: 5,
    change: +1,
    source: 'arena_drop',
    message: '🛡️ TEST_USER dropped DOGE Shield!'
  }
}));

// Check inventory
console.log('Current inventory:', window.centerData?.inventoryDictionary);
```

---

## 🎯 Key Features After Integration

1. **Real-time Updates**: Receive DOGE Shield updates instantly from backend
2. **Visual Notifications**: Special animated notifications for DOGE Shield
3. **Phaser Integration**: Shield count updates in game UI
4. **Sound Effects**: Audio feedback when receiving items
5. **Mobile Responsive**: Works on all devices
6. **Backward Compatible**: Doesn't break existing functionality

---

## 🐛 Troubleshooting

### Issue: Notifications not showing
- Check if `ArenaInventoryManager` is rendered
- Verify socket connection in console
- Check for JavaScript errors

### Issue: Inventory not updating in Phaser
- Ensure `window.centerData` is accessible
- Check if `Gameplay` scene is active
- Verify button selectors match actual DOM

### Issue: Sound not playing
- Check if sound files exist in `/public/sounds/`
- Browser may block autoplay - require user interaction first
- Check console for audio errors

### Issue: Socket not receiving events
- Verify backend is emitting `inventory:update` event
- Check socket namespace matches backend
- Ensure authentication is valid

---

## 📝 Code Patterns

### Emit inventory update from backend:
```javascript
namespace.emit('inventory:update', {
  userId: "streamer_id",
  itemCode: "DOGE_SHIELD",
  itemName: "DOGE Shield",
  quantity: 25,
  change: +1,
  source: "arena_drop",
  message: "🛡️ VIEWER dropped DOGE Shield for STREAMER!"
});
```

### Listen for updates in frontend:
```javascript
// Option 1: Use ArenaInventoryManager component
<ArenaInventoryManager arenaSocket={arenaSocket} />

// Option 2: Listen directly
window.addEventListener('arena:inventory_update', (event) => {
  console.log('Received:', event.detail);
});
```

---

## ✅ Testing Checklist

- [ ] Socket connects successfully
- [ ] Receive inventory update from backend
- [ ] Notification appears with correct message
- [ ] Shield count updates in UI
- [ ] Phaser game UI updates
- [ ] Sound plays (if enabled)
- [ ] Mobile responsive works
- [ ] No console errors
- [ ] Multiple shields stack correctly

---

## 🚀 Ready to Deploy!

After completing all integration steps, your frontend will be fully capable of receiving and displaying DOGE Shield updates from the Arena backend in real-time!
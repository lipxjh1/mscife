# Testing Guide: Arena DOGE Shield Integration
## Date: 2025-11-09

## 🎯 Objective
Test the frontend's ability to receive and display DOGE Shield updates from Arena backend in real-time.

---

## 📋 Prerequisites

1. **Backend Requirements:**
   - Arena server running with DOGE Shield support
   - WebSocket endpoint accessible
   - Backend emitting `inventory:update` events

2. **Frontend Requirements:**
   - All new files integrated (see Integration Guide)
   - Dev server running: `npm run dev`
   - Browser with DevTools open

3. **Testing Environment:**
   - Modern browser (Chrome, Firefox, Safari)
   - DevTools Console tab open
   - Network tab ready for WebSocket monitoring

---

## 🧪 Test Cases

### Test Case 1: Socket Connection
**Goal:** Verify WebSocket connection to Arena

**Steps:**
1. Open application in browser
2. Open DevTools Console
3. Look for connection logs:
   ```
   [ArenaWS] Initializing Arena WebSocket service...
   [ArenaWS] ✅ Connected successfully
   [ArenaSocketListeners] ✅ All listeners setup complete
   ```

**Expected Results:**
- [ ] Connection established without errors
- [ ] Socket ID displayed in console
- [ ] No `connect_error` messages

**Debug Commands:**
```javascript
// Check socket connection
window.arenaSocket?.socket?.connected

// Check socket service
console.log(window.arenaSocket)
```

---

### Test Case 2: Receive DOGE Shield (Backend Test)
**Goal:** Test receiving actual DOGE Shield from backend

**Steps:**
1. Start Arena session
2. Have viewer donate DOGE Shield
3. Monitor console for:
   ```
   [ArenaSocketListeners] 📦 Inventory update received: {itemCode: "DOGE_SHIELD", ...}
   [ArenaSocketListeners] 🛡️ DOGE Shield received!
   ```

**Expected Results:**
- [ ] Inventory update logged in console
- [ ] DOGE Shield notification appears
- [ ] Shield count increases in UI
- [ ] Phaser game UI updates
- [ ] Sound plays (if enabled)

---

### Test Case 3: Manual Event Simulation
**Goal:** Test frontend without backend dependency

**Steps:**
1. Open browser console
2. Run test command:
```javascript
// Simulate inventory update event
window.dispatchEvent(new CustomEvent('arena:inventory_update', {
  detail: {
    userId: 'test_user_123',
    itemCode: 'DOGE_SHIELD',
    itemName: 'DOGE Shield',
    quantity: 10,
    change: +1,
    source: 'arena_drop',
    message: '🛡️ TEST_VIEWER dropped DOGE Shield!'
  }
}));
```

**Expected Results:**
- [ ] Special DOGE Shield notification pops up
- [ ] Shows animation with sparkle effects
- [ ] Displays correct quantity (10)
- [ ] Shows test message
- [ ] Notification auto-dismisses after 5 seconds
- [ ] Shield counter updates in corner

---

### Test Case 4: Multiple Shield Updates
**Goal:** Test handling multiple rapid updates

**Steps:**
1. Run this script in console:
```javascript
// Test multiple rapid updates
for (let i = 1; i <= 5; i++) {
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('arena:inventory_update', {
      detail: {
        itemCode: 'DOGE_SHIELD',
        quantity: i,
        change: +1,
        message: `🛡️ Shield #${i} received!`
      }
    }));
  }, i * 500);
}
```

**Expected Results:**
- [ ] Each update increases quantity correctly
- [ ] Notifications stack or queue properly
- [ ] Final count is 5 shields
- [ ] No memory leaks or errors

---

### Test Case 5: Different Item Types
**Goal:** Test handling non-shield items

**Steps:**
1. Test with different items:
```javascript
// Test DOGE Energy
window.dispatchEvent(new CustomEvent('arena:inventory_update', {
  detail: {
    itemCode: 'DOGE_ENERGY',
    itemName: 'DOGE Energy',
    quantity: 50,
    change: +10
  }
}));

// Test regular item
window.dispatchEvent(new CustomEvent('arena:inventory_update', {
  detail: {
    itemCode: 'CHIP',
    itemName: 'Chip',
    quantity: 100,
    change: +20
  }
}));
```

**Expected Results:**
- [ ] Items update inventory state
- [ ] Regular notification appears (not special shield one)
- [ ] Icons match item type
- [ ] Quantities track correctly

---

### Test Case 6: Phaser Game Integration
**Goal:** Test Phaser scene updates

**Steps:**
1. Navigate to game scene
2. Open console
3. Trigger update:
```javascript
// Check if game is running
console.log('Game scene:', window.game?.scene?.keys?.Gameplay);

// Trigger update if game exists
if (window.game) {
  window.game.events.emit('inventory-update', {
    type: 'inventory_update',
    itemCode: 'DOGE_SHIELD',
    quantity: 15
  });
}
```

**Expected Results:**
- [ ] Shield button quantity updates
- [ ] Button animates/pulses
- [ ] centerData updates
- [ ] No Phaser errors

---

### Test Case 7: Error Handling
**Goal:** Test error scenarios

**Steps:**
1. Test invalid data:
```javascript
// Invalid item code
window.dispatchEvent(new CustomEvent('arena:inventory_update', {
  detail: {
    itemCode: null,
    quantity: undefined
  }
}));

// Missing quantity
window.dispatchEvent(new CustomEvent('arena:inventory_update', {
  detail: {
    itemCode: 'DOGE_SHIELD'
    // Missing quantity
  }
}));
```

**Expected Results:**
- [ ] Console shows error messages
- [ ] No crashes or exceptions
- [ ] Graceful error handling
- [ ] User notification of error

---

### Test Case 8: Mobile Responsive
**Goal:** Test on mobile devices

**Steps:**
1. Open DevTools Device Mode
2. Select mobile device (iPhone, Android)
3. Rotate to landscape/portrait
4. Trigger notification:
```javascript
window.dispatchEvent(new CustomEvent('arena:inventory_update', {
  detail: {
    itemCode: 'DOGE_SHIELD',
    quantity: 5,
    message: 'Mobile test!'
  }
}));
```

**Expected Results:**
- [ ] Notification fits on screen
- [ ] Text is readable
- [ ] Animations work smoothly
- [ ] Touch interactions work

---

## 🔍 Monitoring During Tests

### Console Logs to Watch:
1. Connection logs:
   - `[ArenaWS]` messages
   - `[ArenaSocketListeners]` messages
   - `[useArenaInventory]` messages

2. Event logs:
   - `arena:inventory_update` events
   - `inventory-update` Phaser events

3. Error logs:
   - Any red error messages
   - Failed WebSocket connections
   - Missing file errors

### Network Tab:
1. WebSocket connection:
   - Filter by `WS`
   - Check connection status
   - Verify message frames

### Performance:
1. Memory usage:
   - Monitor for leaks
   - Check notification cleanup

---

## 🛠️ Test Utilities

### Helper Functions:
```javascript
// Test function to emit inventory update
window.testDogeShield = (quantity = 1) => {
  window.dispatchEvent(new CustomEvent('arena:inventory_update', {
    detail: {
      userId: 'test_user',
      itemCode: 'DOGE_SHIELD',
      itemName: 'DOGE Shield',
      quantity: quantity,
      change: +1,
      source: 'test',
      message: `🛡️ Test DOGE Shield! (Qty: ${quantity})`
    }
  }));
};

// Batch test
window.testMultipleShields = (count = 5) => {
  for (let i = 1; i <= count; i++) {
    setTimeout(() => window.testDogeShield(i), i * 200);
  }
};

// Check current state
window.checkInventory = () => {
  console.log('CenterData:', window.centerData?.inventoryDictionary);
  console.log('React State:',
    document.querySelector('[data-reactroot]')?._reactInternalInstance?._state
  );
};
```

---

## ✅ Test Results Checklist

After running all tests, verify:

- [ ] Socket connects reliably
- [ ] DOGE Shield notifications appear correctly
- [ ] Quantities update accurately
- [ ] Phaser UI syncs with React state
- [ ] Sound effects play (if enabled)
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance remains good
- [ ] Memory doesn't leak

---

## 🚨 Known Issues & Solutions

### Issue: Notification doesn't appear
**Solution:** Check if `DogeShieldNotification` component is imported and rendered

### Issue: Quantity not updating
**Solution:** Verify `centerData` is accessible and not read-only

### Issue: Sound doesn't play
**Solution:** Browser may block autoplay - require user interaction first

### Issue: WebSocket fails to connect
**Solution:** Check CORS and authentication tokens

---

## 📊 Performance Metrics

Monitor:
- Notification render time: < 100ms
- Event handler execution: < 50ms
- Memory usage increase: < 1MB per test
- CPU usage during animations: < 10%

---

## ✅ Test Complete!

If all tests pass, the frontend is ready for production deployment with DOGE Shield support!
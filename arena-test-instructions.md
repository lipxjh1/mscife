# Test Instructions for New Arena Flow

## 🎯 **NEW FLOW: Init → Activate → Connect**

The backend has been updated with a new `/activate` endpoint and the frontend has been modified to use the new flow.

## 📋 **Test Steps**

### 1. **Start the Frontend**
```bash
npm start
# or
yarn start
```

### 2. **Open Browser Console**
Press F12 to open dev tools and switch to Console tab.

### 3. **Test Complete Flow (Recommended)**
1. Select "🚀 Complete Flow (Recommended)" option
2. Click "🚀 Start Complete Flow" button
3. Check console logs:
   ```
   ✅ Expected logs:
   [ArenaGameService] Complete flow: Init → Activate → Connect
   [ArenaGameService] Step 1: Initializing game...
   [ArenaGameService] Step 1 success: Game initialized {sessionId: "sess_xxx", status: "pending"}
   [ArenaGameService] Step 2: Activating session...
   [ArenaGameService] Step 2 success: Session activated {status: "active"}
   [ArenaGameService] Step 3: Connecting WebSocket...
   [ArenaGameService] ✅ Complete flow finished successfully
   ```

### 4. **Test Manual Activation (Old Methods)**
1. Select "Method 1: Callbacks" or "Method 3: Init Only"
2. Click "Initialize Only" button
3. Session should be created with status "pending"
4. Orange "🎯 Activate Session & Connect" button should appear
5. Click the activate button
6. Check console logs for activation success

### 5. **Check Status Display**
After successful initialization, you should see:
- Session ID: `sess_xxx`
- Status: 🟢 Active
- Activation: ✅ Activated
- WebSocket: 🟢 Connected
- Flow: 🚀 Complete

### 6. **Verify WebSocket Events**
Test that WebSocket is receiving events:
- Look for heartbeat messages
- Test package drops or boosts if available

## 🔍 **Console Logs to Watch**

### ✅ **SUCCESS Flow (Correct)**
```
[ArenaGameService] Game initialized successfully: {sessionId: "sess_xxx", status: "pending"}
[ArenaGameService] Activating session...
[ArenaGameService] Session activated successfully: {status: "active"}
[ArenaGameService] ✅ Backend WebSocket connected
[ArenaGameService] ✅ Complete flow finished successfully
```

### ❌ **ERROR Flow (Incorrect)**
```
[ArenaGameService] ❌ Arena connection error: Invalid namespace
[ArenaGame] WebSocket error: websocket error (repeated)
```

## 🐛 **Troubleshooting**

1. **If activation fails:**
   - Check if backend is running the latest code with `/activate` endpoint
   - Verify authentication tokens are present

2. **If WebSocket fails:**
   - Ensure session is activated before connection
   - Check if namespace is properly created on backend

3. **If no events received:**
   - Verify WebSocket connection is established
   - Check if you're joined to the correct session room

## 📊 **Expected Results**

- ✅ No more "Invalid namespace" errors
- ✅ No more repeated "websocket error" messages
- ✅ Clean flow: Init (pending) → Activate (active) → WebSocket connected
- ✅ Events should be received properly through WebSocket

## 🎮 **Test Commands (Browser Console)**

```javascript
// Test 1: Complete flow
await arenaGameService.initializeCompleteFlow('https://twitch.tv/test', 'your-token', 'start');

// Test 2: Step by step
const init = await arenaGameService.initGame('https://twitch.tv/test');
console.log('Init result:', init);

const activate = await arenaGameService.activateSession('start');
console.log('Activate result:', activate);

const ws = await arenaGameService.connectWebSocket();
console.log('WebSocket connected:', ws);

// Test 3: Check status
console.log('Connection info:', arenaGameService.getConnectionInfo());
```

## 📝 **Notes**

- The "Complete Flow" method handles everything automatically
- Old methods (1-3) now require manual activation step
- WebSocket will only connect AFTER session is activated
- Backend must be running the updated code with activation endpoint
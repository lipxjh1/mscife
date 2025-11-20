# Fix Game Socket Disconnect Notification

## Changelog
- v321 - 2025-11-19 - Added disconnect notification to correct socket file (src/game/socket.js)

## Problem
- Previous fix (v320) modified wrong file: src/services/socket.js
- Game actually uses: src/game/socket.js
- Result: No notification appeared during gameplay disconnect

## Solution
- Restored src/services/socket.js to original state
- Modified src/game/socket.js (the correct file used by game)
- Added window.dispatchEvent notification to disconnect handler
- Added helper method getDisconnectMessage()
- Kept all existing game socket logic unchanged

## Changes Made

### Restored Files
- `src/services/socket.js` - Restored to original state (removed v320 changes)

### Modified Files
- `src/game/socket.js` - Added disconnect notification (CORRECT FILE)

### Implementation Details

**Disconnect Handler Enhanced:**
```javascript
this.socket.on("disconnect", (reason) => {
    // Existing logging - UNCHANGED
    this.log("❌ Socket disconnected", {...});

    // NEW: UI notification dispatch
    window.dispatchEvent(new CustomEvent('arena:notification', {
        detail: {
            type: 'error',
            title: '⚠️ Connection Lost',
            message: this.getDisconnectMessage(reason),
            data: { reason, timestamp: Date.now() }
        }
    }));

    // Existing BehaviorSubject - UNCHANGED
    this.socketEvent.next({type: SOCKET_EVENTS.DISCONNECT, ...});
});
```

**New Helper Method:**
```javascript
getDisconnectMessage(reason) {
    const messages = {
        'ping timeout': 'Connection timeout - Check internet',
        'transport close': 'Connection lost - Attempting to reconnect...',
        'io client disconnect': 'Disconnected from server'
    };
    return messages[reason] || `Connection lost: ${reason}`;
}
```

**Connect Handler Enhanced:**
```javascript
this.socket.on("connect", () => {
    // Existing logging - UNCHANGED
    this.log("✅ Socket connected", {...});

    // NEW: Success notification
    window.dispatchEvent(new CustomEvent('arena:notification', {...}));

    // Existing logic - UNCHANGED
    this.socketEvent.next({type: SOCKET_EVENTS.CONNECT});
});
```

## Technical Details

**Socket Architecture:**
- Game uses src/game/socket.js (sta.m-sci.net)
- React UI uses src/services/socket.js (pro.m-sci.net)
- Multiple socket instances for different features

**Notification System:**
- Uses existing ArenaNotification component
- Event: window.dispatchEvent('arena:notification')
- Auto-dismiss: 5 seconds
- Types: error (disconnect), success (connect)

**Safety Measures:**
- Only ADDED code, no existing code removed
- All original logic (logging, BehaviorSubject) kept intact
- Backward compatible with game socket consumers
- No changes to socket connection configuration

## Testing

### Test Scenarios Covered:
1. ✅ Network disconnect during gameplay
2. ✅ Browser tab close/refresh
3. ✅ Server restart
4. ✅ Connection timeout
5. ✅ Successful reconnection

### Expected Behavior:
- Disconnect: Error toast with reason appears
- Reconnect: Success toast appears
- Game logging still works
- Socket events still fire correctly
- No impact on game performance

## Rollback Plan

If issues occur:
```bash
# Restore from backup
cp src/game/socket.js.backup src/game/socket.js

# Or restore from git
git checkout src/game/socket.js
```

## Files Modified
- src/game/socket.js (enhanced with notification)
- src/services/socket.js (restored to original)

## Risk Assessment
- Risk level: LOW
- Impact: Only adds notification, no logic changes
- Breaking changes: NONE
- Dependencies: Uses existing notification system

## Lessons Learned
- Always verify which file is actually used by the application
- Multiple socket instances can cause confusion
- Test in actual usage context (game) not just isolation
- Check import statements to trace file usage

## Next Steps
1. Monitor disconnect notifications in production
2. Consider consolidating socket instances
3. Plan upgrade to Option B (modal with reconnect button)
4. Add connection status indicator for persistent visibility
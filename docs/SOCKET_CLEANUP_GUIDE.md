# Socket Cleanup Pattern Guide

## Quick Reference for Developers

### Pattern cho Utility/Manager Class

```javascript
export class MySocketManager {
    constructor(socketService) {
        this.socketService = socketService;
        this.EVENTS = ['event1', 'event2', 'event3'];
    }

    setupListeners() {
        this.EVENTS.forEach(event => {
            this.socketService.on(event, this[`handle_${event}`]);
        });
    }

    cleanup() {
        this.EVENTS.forEach(event => {
            this.socketService.off(event);
        });

        console.log('[MySocketManager] Socket listeners cleaned up');
    }
}
```

### Pattern cho Singleton Class (như GameplayMultiplayerBossRoom)

```javascript
export class MySingletonClass {
    constructor() {
        // Singleton setup
    }

    cleanup() {
        const events = [
            "eventName1",
            "eventName2",
            "eventName3"
        ];

        events.forEach(event => {
            socketService.off(event);
        });

        console.log('[MySingletonClass] Socket listeners cleaned up');
    }
}

// Usage
const myInstance = new MySingletonClass();
export default myInstance;
```

### Usage trong Scene/Component

```javascript
// Khi tạo room/manager
const roomManager = new MySingletonClass();

// Khi destroy/cleanup
roomManager.cleanup();
```

## ⚠️ RULES CẦN TUÂN THỦ

1. ✅ **BẮT BUỘC:** Có socket.on() thì phải có cleanup()
2. ✅ **BẮT BUỘC:** Cleanup trong destroy() hoặc lifecycle method
3. ✅ **BẮT BUỘC:** Store events list trong constant array
4. ✅ **BẮT BUỘC:** Add console log để debug
5. ✅ **BẮT BUỘC:** Test create/destroy nhiều lần

## 🚫 KHÔNG BAO GIỜ

1. ❌ NEVER để socket.on() mà không có cleanup
2. ❌ NEVER hardcode event names
3. ❌ NEVER quên test memory usage
4. ❌ NEVER skip cleanup trong destroy()

## 🔍 MEMORY LEAK DETECTION

### Manual Test:
```javascript
// 1. Tạo object nhiều lần
for (let i = 0; i < 20; i++) {
    const room = new GameplayMultiplayerBossRoom();
    room.cleanup(); // <- IMPORTANT!
}

// 2. Monitor memory trong Chrome DevTools
// 3. Nếu memory tăng dần -> có leak
```

### Automated Test (Future):
```javascript
// TODO: Add memory test to CI/CD
describe('Memory Leaks', () => {
    it('should not leak on create/destroy', () => {
        const before = getMemoryUsage();
        for (let i = 0; i < 100; i++) {
            const room = new GameplayMultiplayerBossRoom();
            room.cleanup();
        }
        const after = getMemoryUsage();
        expect(after - before).toBeLessThan(1024); // 1KB threshold
    });
});
```

## 📋 CHECKLIST

Khi review code với socket:

- [ ] Có socket.on() ? → Phải có cleanup method
- [ ] Cleanup được gọi trong destroy() ? → Phải có
- [ ] Events stored trong constant array ? → Phải có
- [ ] Có console log trong cleanup ? → Nên có
- [ ] Test create/destroy loop ? → Phải test

## 🎯 EXAMPLES

### ✅ GOOD - Gameplay.js
```javascript
this.SOCKET_EVENTS = ["started", "update", "game_complete", "error"];

cleanupSocketEvents() {
    if (socketService.socket) {
        this.SOCKET_EVENTS.forEach((event) => {
            socketService.socket.removeAllListeners(event);
        });
    }
}
```

### ✅ GOOD - HomeBattleMultiplayerBossRoom.js
```javascript
let roomClosedHandler = null;

function RegisterRoomCloseEvents() {
    roomClosedHandler = (response) => RoomClosed(response);
    socketServiceMultiplayerBoss.on("mpboss:room:closed", roomClosedHandler);
}

function RemoveRoomCloseEvents() {
    if (roomClosedHandler) {
        socketServiceMultiplayerBoss.off("mpboss:room:closed", roomClosedHandler);
        roomClosedHandler = null;
    }
}
```

### ❌ BAD - BEFORE FIX (GameplayMultiplayerBossRoom.js)
```javascript
// ❌ socket.on() được gọi nhưng không có cleanup
socketServiceMultiplayerBoss.emit("mpboss:room:create", ...);

// ❌ KHÔNG có cleanup method
// ❌ Memory leak guarantee!
```

### ✅ FIXED - GameplayMultiplayerBossRoom.js
```javascript
cleanup() {
    const events = [
        "mpboss:room:closed",
        "mpboss:room:joined",
        "mpboss:room:ready",
        "mpboss:room:start",
        "mpboss:room:leave",
        "mpboss:room:kick",
        "mpboss:room:error"
    ];

    events.forEach(event => {
        socketServiceMultiplayerBoss.off(event);
    });

    console.log('[GameplayMultiplayerBossRoom] Socket listeners cleaned up');
}
```

---

## 📞 HELP

**Need help?**
- Check: `docs/fixes/001-fix-socket-memory-leak-multiplayer-boss.md`
- Review: `Gameplay.js` và `GameplayBoss.js` patterns
- Test: Use Chrome DevTools Memory tab
- Ask: Team lead for code review

**Remember:** Socket cleanup = Stable app! 🚀
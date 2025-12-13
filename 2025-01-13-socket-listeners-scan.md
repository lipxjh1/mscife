# 🔍 BÁO CÁO SCAN SOCKET LISTENERS - M-SCI GAME

## Ngày scan: 2025-01-13

---

## 1. SOCKET SERVICE OVERVIEW

### 1.1 Socket Instance Location
- **File:** `src/game/socket.js`, `src/game/socketBoss.js`, `src/game/socketMultiplayerBoss.js`
- **Export:** Singleton pattern với class SocketService
- **Events supported:** Multiple (connect, disconnect, error, reconnect, custom gameplay events)

### 1.2 Socket Instances Found
1. **socketService** - General gameplay socket (`src/game/socket.js`)
2. **socketServiceBoss** - Boss battle socket (`src/game/socketBoss.js`)
3. **socketServiceMultiplayerBoss** - Multiplayer boss socket (`src/game/socketMultiplayerBoss.js`)
4. **socketServiceChatGuild** - Guild chat socket (`src/game/socketChatGuild.js`)
5. **arenaSocket** - Arena PVP socket (`src/services/arenaSocket.js`)

---

## 2. DANH SÁCH TẤT CẢ SOCKET.ON()

| # | File | Dòng | Event Name | Handler | Trong function nào |
|---|------|------|------------|---------|-------------------|
| 1 | src/game/scenes/Gameplay.js | 1893 | "started" | anonymous | SetupSocket() |
| 2 | src/game/scenes/Gameplay.js | 1902 | "update" | anonymous | SetupSocket() |
| 3 | src/game/scenes/Gameplay.js | 1911 | "game_complete" | anonymous | SetupSocket() |
| 4 | src/game/scenes/Gameplay.js | 1922 | "error" | anonymous | SetupSocket() |
| 5 | src/game/scenes/GameplayBoss.js | 1343 | "joinBossBattleResult" | anonymous | InitSocketEvents() |
| 6 | src/game/scenes/GameplayBoss.js | 1352 | "attackBossResult" | anonymous | InitSocketEvents() |
| 7 | src/game/scenes/GameplayBoss.js | 1358 | "bossHealthUpdate" | anonymous | InitSocketEvents() |
| 8 | src/game/scenes/GameplayBoss.js | 1364 | "bossAttack" | anonymous | InitSocketEvents() |
| 9 | src/game/scenes/GameplayBoss.js | 1381 | "bossSpawnDrone" | anonymous | InitSocketEvents() |
| 10 | src/game/scenes/GameplayBoss.js | 1391 | "bossDefeated" | anonymous | InitSocketEvents() |
| 11 | src/game/scenes/GameplayBoss.js | 1397 | "bossBattleExpired" | anonymous | InitSocketEvents() |
| 12 | src/game/scenes/GameplayBoss.js | 1403 | "attackDroneResult" | anonymous | InitSocketEvents() |
| 13 | src/game/scenes/GameplayBoss.js | 1411 | "playerDied" | anonymous | InitSocketEvents() |
| 14 | src/game/scenes/GameplayBoss.js | 1419 | "playerResurrected" | anonymous | InitSocketEvents() |
| 15 | src/game/scenes/GameplayBoss.js | 1427 | "error" | anonymous | InitSocketEvents() |
| 16 | src/game/scenes/GameplayMultiplayerBoss.js | 1075 | "mpboss:shield:damaged" | anonymous | SetupSocket() |
| 17 | src/game/scenes/GameplayMultiplayerBoss.js | 1082 | "mpboss:boss:hp" | anonymous | SetupSocket() |
| 18 | src/game/scenes/GameplayMultiplayerBoss.js | 1089 | "mpboss:boss:attack" | anonymous | SetupSocket() |
| 19 | src/game/scenes/GameplayMultiplayerBoss.js | 1112 | "bossSpawnDrone" | anonymous | SetupSocket() |
| 20 | src/game/scenes/GameplayMultiplayerBoss.js | 1122 | "mpboss:boss:defeated" | anonymous | SetupSocket() |
| 21 | src/game/scenes/GameplayMultiplayerBoss.js | 1128 | "mpboss:battle:timeout" | anonymous | SetupSocket() |
| 22 | src/game/scenes/GameplayMultiplayerBoss.js | 1134 | "mpboss:room:closed" | anonymous | SetupSocket() |
| 23 | src/game/scenes/GameplayMultiplayerBoss.js | 1142 | "attackDroneResult" | anonymous | SetupSocket() |
| 24 | src/game/scenes/GameplayMultiplayerBoss.js | 1150 | "mpboss:player:dead" | anonymous | SetupSocket() |
| 25 | src/game/scenes/GameplayMultiplayerBoss.js | 1158 | "mpboss:player:defeated" | anonymous | SetupSocket() |
| 26 | src/game/scenes/GameplayMultiplayerBoss.js | 1164 | "mpboss:player:left" | anonymous | SetupSocket() |
| 27 | src/game/scenes/GameplayMultiplayerBoss.js | 1170 | "playerResurrected" | anonymous | SetupSocket() |
| 28 | src/game/scenes/GameplayMultiplayerBoss.js | 1178 | "error" | anonymous | SetupSocket() |
| 29 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 131 | "mpboss:room:closed" | roomClosedHandler | create() |
| 30 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 165 | "mpboss:player:left" | anonymous | create() |
| 31 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 191 | "mpboss:player:joined" | anonymous | create() |
| 32 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 214 | "mpboss:room:updated" | anonymous | create() |
| 33 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 241 | "mpboss:game:starting" | anonymous | create() |
| 34 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 273 | "mpboss:player:ready" | anonymous | create() |
| 35 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 305 | "mpboss:game:started" | anonymous | create() |

**Tổng số: 35 listeners**

---

## 3. DANH SÁCH TẤT CẢ SOCKET.OFF()

| # | File | Dòng | Event Name | Cleanup Location |
|---|------|------|------------|------------------|
| 1 | src/game/scenes/GameplayMultiplayerBoss/GameplayMultiplayerBossRoom.js | 332 | (all events) | shutdown() |
| 2 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 137 | "mpboss:room:closed" | onDestroy() |
| 3 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 174 | "mpboss:player:left" | onDestroy() |
| 4 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 200 | "mpboss:player:joined" | onDestroy() |
| 5 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 223 | "mpboss:room:updated" | onDestroy() |
| 6 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 250 | "mpboss:game:starting" | onDestroy() |
| 7 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 282 | "mpboss:player:ready" | onDestroy() |
| 8 | src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoom.js | 314 | "mpboss:game:started" | onDestroy() |
| 9 | src/game/socket.js | 285 | (dynamic) | off() method |
| 10 | src/game/socketBoss.js | 195 | (dynamic) | off() method |
| 11 | src/game/socketChatGuild.js | 195 | (dynamic) | off() method |
| 12 | src/game/socketMultiplayerBoss.js | 216 | (dynamic) | off() method |
| 13 | src/modules/vorld-auth/core/ArenaSocketListeners.js | 265-268 | arena events | cleanup() |

**Tổng số: 13 cleanup calls**

---

## 4. ❌ LISTENERS THIẾU CLEANUP (MEMORY LEAK)

### 4.1 Trong Phaser Scenes

| # | File | Dòng | Event | Cần thêm cleanup ở |
|---|------|------|-------|-------------------|
| 1 | Gameplay.js | 1893 | "started" | shutdown() |
| 2 | Gameplay.js | 1902 | "update" | shutdown() |
| 3 | Gameplay.js | 1911 | "game_complete" | shutdown() |
| 4 | Gameplay.js | 1922 | "error" | shutdown() |
| 5 | GameplayMultiplayerBoss.js | 1075 | "mpboss:shield:damaged" | shutdown() |
| 6 | GameplayMultiplayerBoss.js | 1082 | "mpboss:boss:hp" | shutdown() |
| 7 | GameplayMultiplayerBoss.js | 1089 | "mpboss:boss:attack" | shutdown() |
| 8 | GameplayMultiplayerBoss.js | 1112 | "bossSpawnDrone" | shutdown() |
| 9 | GameplayMultiplayerBoss.js | 1122 | "mpboss:boss:defeated" | shutdown() |
| 10 | GameplayMultiplayerBoss.js | 1128 | "mpboss:battle:timeout" | shutdown() |
| 11 | GameplayMultiplayerBoss.js | 1134 | "mpboss:room:closed" | shutdown() |
| 12 | GameplayMultiplayerBoss.js | 1142 | "attackDroneResult" | shutdown() |
| 13 | GameplayMultiplayerBoss.js | 1150 | "mpboss:player:dead" | shutdown() |
| 14 | GameplayMultiplayerBoss.js | 1158 | "mpboss:player:defeated" | shutdown() |
| 15 | GameplayMultiplayerBoss.js | 1164 | "mpboss:player:left" | shutdown() |
| 16 | GameplayMultiplayerBoss.js | 1170 | "playerResurrected" | shutdown() |
| 17 | GameplayMultiplayerBoss.js | 1178 | "error" | shutdown() |

**Code cần thêm vào shutdown():**
```javascript
// Trong shutdown() của Gameplay.js
if (socketService && socketService.socket) {
    const events = ["started", "update", "game_complete", "error"];
    events.forEach(event => {
        socketService.socket.off(event);
    });
}

// Trong shutdown() của GameplayMultiplayerBoss.js
if (socketServiceMultiplayerBoss) {
    const events = [
        "mpboss:shield:damaged", "mpboss:boss:hp", "mpboss:boss:attack",
        "bossSpawnDrone", "mpboss:boss:defeated", "mpboss:battle:timeout",
        "mpboss:room:closed", "attackDroneResult", "mpboss:player:dead",
        "mpboss:player:defeated", "mpboss:player:left", "playerResurrected", "error"
    ];
    events.forEach(event => {
        socketServiceMultiplayerBoss.off(event);
    });
}
```

### 4.2 Trong React Components

Không tìm thấy React components sử dụng trực tiếp socket.on(). Các components sử dụng EventBus pattern đã có cleanup đúng cách.

---

## 5. ✅ LISTENERS ĐÃ CÓ CLEANUP (OK)

| # | File | Event | Cleanup Location | Pattern |
|---|------|-------|------------------|---------|
| 1 | GameplayBoss.js | 11 events | cleanupSocketEvents() trong shutdown() | ✅ Đúng cách |
| 2 | HomeBattleMultiplayerBossRoom.js | 7 events | onDestroy() | ✅ Đúng cách |
| 3 | GameplayMultiplayerBossRoom.js | All events | shutdown() | ✅ Đúng cách |

---

## 6. IMPACT ANALYSIS

### Memory Leak Pattern:
```
Gameplay Scene (4 listeners không cleanup):
- Lần chơi 1: 4 listeners active
- Restart scene: +4 listeners (cũ vẫn còn) = 8 total
- Lần chơi 2: 8 listeners active
- Restart scene: +4 listeners = 12 total
- Lần chơi 3: 12 listeners active
...
Sau 10 lần restart: 40 listeners xử lý cùng 1 event!

GameplayMultiplayerBoss Scene (14 listeners không cleanup):
- Tương tự nhưng cộng dồn 14 listeners mỗi lần restart
- Sau 10 lần: 140 listeners!
```

### Hậu quả:
- **CPU Spike:** Mỗi event "update" được xử lý 10-140 lần thay vì 1 lần
- **Memory Increase:** Mỗi listener giữ references đến closure variables
- **Race Conditions:** Cùng event được handler nhiều lần
- **Game State Corruption:** Duplicate updates có thể gây state conflicts
- **Performance Degradation:** Frame drop khi nhận events

### Severity:
- **Gameplay.js:** 🔴 CRITICAL (update event mỗi frame!)
- **GameplayMultiplayerBoss.js:** 🔴 CRITICAL (14 events, multiplayer lag)
- **GameplayBoss.js:** ✅ FIXED (đã có cleanup)

---

## 7. ĐỀ XUẤT FIX (KHÔNG THỰC HIỆN)

### 7.1 Cho Gameplay.js (Urgent)
```javascript
// Thêm vào constructor hoặc init()
this.socketEvents = ["started", "update", "game_complete", "error"];

// Thêm vào shutdown() sau dòng 596
if (socketService && socketService.socket) {
    this.socketEvents.forEach(event => {
        socketService.socket.off(event);
        console.log(`[Gameplay] Removed socket listener: ${event}`);
    });
}
```

### 7.2 Cho GameplayMultiplayerBoss.js (Urgent)
```javascript
// Thêm vào constructor hoặc init()
this.socketEvents = [
    "mpboss:shield:damaged", "mpboss:boss:hp", "mpboss:boss:attack",
    "bossSpawnDrone", "mpboss:boss:defeated", "mpboss:battle:timeout",
    "mpboss:room:closed", "attackDroneResult", "mpboss:player:dead",
    "mpboss:player:defeated", "mpboss:player:left", "playerResurrected", "error"
];

// Thêm vào shutdown()
if (socketServiceMultiplayerBoss) {
    this.socketEvents.forEach(event => {
        socketServiceMultiplayerBoss.off(event);
        console.log(`[GameplayMultiplayerBoss] Removed socket listener: ${event}`);
    });
}
```

### 7.3 Best Practice - Socket Manager Helper
```javascript
// Tạo helper class
class SocketListenerManager {
    constructor() {
        this.listeners = new Map(); // context -> {socket, events[]}
    }

    addListeners(socket, events, context) {
        this.listeners.set(context, { socket, events });
    }

    cleanupContext(context) {
        const data = this.listeners.get(context);
        if (data) {
            data.events.forEach(event => {
                data.socket.off(event);
            });
            this.listeners.delete(context);
            console.log(`[SocketManager] Cleaned up ${data.events.length} listeners for context`);
        }
    }
}

// Sử dụng trong scene
const socketManager = new SocketListenerManager();

// Trong create():
socketManager.addListeners(socketService.socket, ["started", "update"], this);

// Trong shutdown():
socketManager.cleanupContext(this);
```

---

## 8. CHECKLIST FIX

- [x] Đã xác định tất cả socket.on() không có cleanup
- [x] Đã biết cleanup ở đâu (shutdown/useEffect return)
- [x] Đã xác định severity theo impact
- [ ] Đã backup code trước khi sửa
- [ ] Fix Gameplay.js trước tiên (critical - update event)
- [ ] Fix GameplayMultiplayerBoss.js thứ hai
- [ ] Test với console command verify listeners count
- [ ] Monitor memory trước và sau fix

---

## 9. VERIFY SAU KHI FIX

```javascript
// Paste vào Console để đếm listeners TRƯỚC fix
const socket = window.socketService?.socket || window.socket;
if (socket && socket._callbacks) {
    console.log('=== SOCKET LISTENERS COUNT (TRƯỚC FIX) ===');
    Object.keys(socket._callbacks).forEach(event => {
        console.log(`${event}: ${socket._callbacks[event]?.length || 0} listeners`);
    });
}

// Sau khi fix và restart scene, chạy lại để xem số liệu
// Nên giảm đáng kể số listeners
```

### Monitor Script:
```javascript
// Auto monitor memory và listeners
let monitorCount = 0;
const monitorInterval = setInterval(() => {
    monitorCount++;

    // Check listeners
    const socket = window.socketService?.socket;
    if (socket && socket._callbacks) {
        let totalListeners = 0;
        Object.values(socket._callbacks).forEach(listeners => {
            totalListeners += listeners?.length || 0;
        });

        console.log(`[${monitorCount}] Total socket listeners:`, totalListeners);

        // Warning nếu > 50 (có thể leak)
        if (totalListeners > 50) {
            console.warn('⚠️ HIGH LISTENER COUNT DETECTED! Possible memory leak!');
        }
    }

    // Stop sau 2 phút
    if (monitorCount >= 24) {
        clearInterval(monitorInterval);
    }
}, 5000);
```

---

## 10. ROOT CAUSE ANALYSIS

### Tại sao lại xảy ra:
1. **Inconsistent cleanup pattern:** GameplayBoss có cleanup nhưng các scene khác không
2. **No socket manager:** Mỗi scene tự quản lý listeners theo cách riêng
3. **Forgot to add cleanup:** Code mới được thêm nhưng quên cleanup
4. **Multiple socket instances:** Không có central place để track tất cả

### Pattern tốt đã có:
- **GameplayBoss.js:** Sử dụng array SOCKET_EVENTS và cleanup trong shutdown()
- **HomeBattleMultiplayerBossRoom.js:** Có cleanup trong onDestroy()

### Pattern xấu cần fix:
- **Gameplay.js:** Socket events không có array định nghĩa, không có cleanup
- **GameplayMultiplayerBoss.js:** Không có array, không có cleanup

---

*Báo cáo tạo ngày: 2025-01-13*
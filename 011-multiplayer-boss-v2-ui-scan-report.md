# SCAN REPORT: MULTIPLAYER BOSS V2 UI & COLYSEUS INTEGRATION

## 1. BACKEND COLYSEUS STATE (MCP Scan)

### 1.1 BossBattleState Schema ✅
```typescript
BossBattleState {
  // Room Info
  roomId: string
  roomCode: string  // 3-digit code for joining

  // Entities
  boss: BossState
  players: MapSchema<PlayerState>

  // Battle Info
  phase: BattlePhase  // WAITING=0, PLAYING=1, ENDED=2
  startTime: number
  endTime: number
  battleDuration: number (5 minutes default)

  // Metadata
  createdAt: number
  updatedAt: number
  victory: boolean
  mvpPlayerId: string
}
```

### 1.2 PlayerState Schema ✅
```typescript
PlayerState {
  // Identity
  userId: string
  characterId: string
  name: string
  avatar: string

  // Role in battle
  role: "host" | "guest"

  // Character Stats
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number

  // Battle Statistics
  damageDealt: number
  totalAttacks: number
  criticalHits: number
  shieldDamage: number
  hpDamage: number

  // Status
  isDead: boolean
  isReady: boolean
  isConnected: boolean
  deathCount: number
}
```

### 1.3 BossState Schema ✅
```typescript
BossState {
  // Basic Info
  bossId: string
  name: string
  level: number

  // HP System
  hp: number
  maxHp: number

  // Shield System
  shield: number
  maxShield: number

  // Combat Stats
  attack: number
  defense: number

  // Status
  isAlive: boolean
  isShieldBroken: boolean
  currentSkill: string
  rageLevel: number
}
```

### 1.4 Message Handlers ✅
Located in `/www/wwwroot/game/modules/boss-battle-v2/colyseus/rooms/BossBattleRoom.ts`:

```typescript
this.onMessage("attack", (client, message) => {
  // TODO: Handle player attack
});

this.onMessage("use-item", (client, message) => {
  // TODO: Handle item usage
});

this.onMessage("ready", (client) => {
  // TODO: Handle player ready
});

this.onMessage("chat", (client, message) => {
  // TODO: Handle in-battle chat
});
```

### 1.5 MongoDB Connection ❌
- MongoDB connection failed: "Authentication failed"
- Need to verify boss collection structure
- Boss data structure unknown (need manual configuration)

---

## 2. FRONTEND V1 (WORKING VERSION)

### 2.1 V1 File Structure ✅
```
src/game/scenes/Home/HomeBattle/HomeBattleMultiplayerBoss/
├── HomeBattleMultiplayerBoss.js (14,731 bytes) - Campaign selection
├── HomeBattleMultiplayerBossRoom.js (29,152 bytes) - Room detail
├── HomeBattleMultiplayerBossRoomList.js (18,301 bytes) - Room list
└── HomeBattleMultiplayerBossJoinRoom.js (6,905 bytes) - Join room
```

### 2.2 V1 Room Detail Layout (Ảnh 3) ✅
File: `HomeBattleMultiplayerBossRoom.js`

**Host Info Card Layout:**
```javascript
// Avatar position (lines 408-412)
let avatar = scene.add
  .image(62 + 220 / 2, 392 + 220 / 2, centerData.userInfo.Avatar)
  .setOrigin(0.5, 0.5);

// Username position (lines 414-431)
let text_user_name = scene.add
  .text(306, 448, centerData.userInfo.Username || "No user loaded", {
    fontFamily: "Russo One",
    fontSize: "48px",
    color: "#ffffff",
    shadow: {
      offsetX: 2, offsetY: 2,
      color: "#FF9D00", blur: 7, stroke: true, fill: true
    }
  });

// Host/Guest Role (lines 433-458)
let text_player_role = scene.add
  .text(306, 524, roleText, {
    fontFamily: "Russo One",
    fontSize: "48px",
    color: "#FFCC00", // Yellow for Host
  });

if (multiplayerBossRoom.IsHost()) {
  text_player_role.setColor("#FFCC00");
  text_player_role.setText("Host");
} else {
  text_player_role.setColor("#00FF44");
  text_player_role.setText("Guest");
}
```

**Room Info Layout:**
```javascript
// Room Code (lines 460-469)
let text_room_code = scene.add
  .text(62, 634, "Room code: " + roomInfo.code, {
    fontFamily: "Russo One", fontSize: "40px", color: "#ffffff"
  });

// Players Count (lines 471-482)
text_players = scene.add
  .text(62, 690, playersText, {
    fontFamily: "Russo One", fontSize: "40px", color: "#ffffff"
  });

// Boss Info (lines 484-493)
text_bossId = scene.add
  .text(62, 744, "Boss: " + roomInfo.bossData.name, {
    fontFamily: "Russo One", fontSize: "40px", color: "#ffffff"
  });

// Battle Time (lines 495-508)
let text_Battle_Time = scene.add
  .text(62, 794, "Battle Time: " + formatSecondsToHMS(roomInfo.bossData.battleTime), {
    fontFamily: "Russo One", fontSize: "40px", color: "#ffffff"
  });
```

**Timer & Status:**
```javascript
// Timer (lines 512-520)
text_time_remain = scene.add
  .text(960, 389, formatSecondsToHMS(secondsRemain), {
    fontFamily: "Russo One", fontSize: "40px", color: "#ffffff"
  }).setOrigin(1, 0);

// Status (lines 522-530)
let text_status = scene.add
  .text(960, 433, "Status: " + roomInfo.status, {
    fontFamily: "Russo One", fontSize: "40px", color: "#ffffff"
  }).setOrigin(1, 0);
```

**Play Button:**
```javascript
// Host only (lines 537-548)
if (multiplayerBossRoom.IsHost()) {
  let btn_play = CreateButton0(
    scene, container_main,
    686 + 328 / 2, 641 + 86 / 2, "Play"
  );
  btn_play.button.on("pointerdown", function () { RoomPlay(); });
}
```

### 2.3 V1 Campaign Selection (Ảnh 2) ✅
File: `HomeBattleMultiplayerBoss.js`

**4 Campaign Cards:**
```javascript
// Earth Campaign (lines 196-210)
let earth = CreateItemMap(scene, scrollablePanel, "BOSS_001");
earth.bg.setTexture("home_battle_item_bg_campain_earth");
earth.text_name.setText("Earth");

// Space Campaign (lines 212-225)
let space = CreateItemMap(scene, scrollablePanel, "BOSS_002");
space.bg.setTexture("home_battle_item_bg_campain_space");
space.text_name.setText("Space");

// Mars Campaign (lines 227-240)
let mars = CreateItemMap(scene, scrollablePanel, "BOSS_003");
mars.bg.setTexture("home_battle_item_bg_campain_mars");
mars.text_name.setText("Mars");

// Back to Earth (lines 242-257)
let return_earth = CreateItemMap(scene, scrollablePanel, "BOSS_004");
return_earth.bg.setTexture("home_battle_item_bg_campain_back_to_earth");
return_earth.text_name.setText("Return Earth");

// Additional: X-Corp (lines 259-274)
let X_Corp = CreateItemMap(scene, scrollablePanel, "BOSS_005");
X_Corp.bg.setTexture("home_battle_item_bg_campain_xcorp");
X_Corp.text_name.setText("X-Corp");
```

**Turn Display:**
```javascript
earth.setTurnStartEnd(0, 5);
space.setTurnStartEnd(0, 5);
mars.setTurnStartEnd(0, 5);
return_earth.setTurnStartEnd(0, 5);
X_Corp.setTurnStartEnd(0, 5);
```

### 2.4 V1 Socket.IO Integration ✅
File: `socketMultiplayerBoss.js`

**Events Used:**
```javascript
// Client → Server
mpboss:room:create
mpboss:room:join
mpboss:room:ready

// Server → Client
mpboss:player:joined (lines 145-169)
mpboss:player:left (lines 182-195)
mpboss:room:closed (lines 125-143)
mpboss:game:started (lines 269-287)
mpboss:player:ready (lines 227-244)
mpboss:player:unready (lines 246-264)
```

**Player Join Data Structure:**
```javascript
if (response.player) {
  let tempGuestInfo = {
    id: response.player.id,
    isReady: response.player.isReady,
    username: response.player.username,
    avatar: response.player.avatar,
  };
  multiplayerBossRoom.SetRoomGuest(tempGuestInfo);
  UpdatePlayersCount();
  CreateOtherPlayer();
}
```

---

## 3. FRONTEND V2 (CURRENT)

### 3.1 V2 File Structure ✅
```
src/modules/multiplayerBossV2/
├── index.js
├── ui/
│   └── BattleSection.js (414 lines) - 3 buttons: Create, Join, Rooms
├── scenes/
│   ├── BossSelectScene.js (~350 lines) - Campaign selection
│   ├── RoomScene.js (~150+ lines) - Room detail
│   └── RoomListScene.js
├── services/
│   ├── colyseusClient.js (150+ lines) - Colyseus connection
│   └── roomService.js
```

### 3.2 BattleSection.js ✅
**3 Buttons Implementation:**
```javascript
// Create button (lines 78-94)
btn_create.button.on("pointerdown", function () {
  import("../scenes/BossSelectScene.js").then(module => {
    module.createBossSelectScene(scene);
  });
});

// Join button (lines 97-109)
btn_join.button.on("pointerdown", function () {
  showJoinRoomPopup(scene);
});

// Rooms button (lines 112-128)
btn_rooms.button.on("pointerdown", function () {
  import("../scenes/RoomListScene.js").then(module => {
    module.createRoomListScene(scene);
  });
});
```

### 3.3 BossSelectScene.js ✅
**Campaign Cards with Background Assets:**
```javascript
const bgAssetMap = {
  "fire-dragon-1": "home_battle_item_bg_campain_earth",
  "ice-golem-2": "home_battle_item_bg_campain_space",
  "thunder-eagle-3": "home_battle_item_bg_campain_mars",
  "shadow-beast-4": "home_battle_item_bg_campain_back_to_earth",
  "light-angel-5": "home_battle_item_bg_campain_xcorp"
};
```

**Turn Display:**
```javascript
bossItem.setTurnStartEnd(0, 5);
item.text_level.setText(`${formattedStart}/${formattedEnd}`);
```

### 3.4 RoomScene.js ✅
**Basic Room UI Structure:**
```javascript
// Room title
const title = scene.add.text(0, -300, "Boss Battle Room", {
  fontFamily: cdLocalization.getCurrentFont(),
  fontSize: "56px", color: "#FFFFFF"
}).setOrigin(0.5);

// Room code display
const codeLabel = scene.add.text(0, -200, `Room Code: ${roomInfo.roomCode}`, {
  fontFamily: "Russo One", fontSize: "40px", color: "#FFD700"
}).setOrigin(0.5);
```

**Missing Components:**
- ❌ Host info card (avatar + name + role)
- ❌ Timer countdown display
- ❌ Status display ("waiting", "in battle")
- ❌ Player list with avatars
- ❌ Play button (host only)

### 3.5 Colyseus Client Integration ✅
**Basic Connection:**
```javascript
this.client = new Client(this.wsUrl);
this.currentRoom = await this.client.create(this.roomName, options);
this.currentRoom = await this.client.joinById(targetRoom.roomId, options);
```

**Missing State Listeners:**
- ❌ `room.state.players.onAdd()` - Player joined
- ❌ `room.state.players.onRemove()` - Player left
- ❌ `room.state.onChange()` - State changes
- ❌ `room.state.phase` listener - Battle phases

---

## 4. GAP ANALYSIS

### 4.1 UI Components Comparison

| Component | V1 (Socket.IO) | V2 (Colyseus) | Status |
|-----------|----------------|---------------|--------|
| **Campaign Selection** | ✅ 4 cards + backgrounds | ✅ Basic implementation | ⚠️ Needs完善 |
| **Room List** | ✅ Room cards | ✅ RoomListScene exists | ⚠️ Missing host info |
| **Room Detail** | ✅ Full UI (ảnh 3) | ⚠️ Basic structure | ❌ Critical missing |
| **Host Info Card** | ✅ Avatar + name + role | ❌ Not implemented | ❌ Missing |
| **Timer** | ✅ 00:09:48 format | ❌ Not implemented | ❌ Missing |
| **Status** | ✅ "waiting" label | ❌ Not implemented | ❌ Missing |
| **Player List** | ✅ Host + Guest cards | ❌ Not implemented | ❌ Missing |

### 4.2 Data Structure Mapping

**V1 Socket.IO Room Data:**
```javascript
{
  roomId: "abc123",
  code: "447",
  host: {
    userId: "user-123",
    username: "lipxin_4917",
    avatar: "avatar_url",
    characterId: "char-456"
  },
  guest: null,
  boss: {
    _id: "mechanical-titan",
    name: "Mechanical Titan",
    level: 10,
    battleTime: 83*60*60*1000
  },
  status: "waiting",
  closeAt: timestamp
}
```

**V2 Colyseus State Mapping:**
```typescript
// ✅ Direct mapping available
roomCode: string (V1.code)
phase: BattlePhase (V1.status)
startTime: number (V1.closeAt - battleDuration)

// ⚠️ Need to derive from players map
host: First player in players MapSchema with role="host"
guest: Second player with role="guest"

// ❌ Missing in V2
battleTime: Not in BossState schema
```

### 4.3 Real-time Sync Comparison

| Feature | V1 (Socket.IO) | V2 (Colyseus) | Implementation |
|---------|----------------|---------------|----------------|
| **Player Join** | `mpboss:player:joined` event | `room.state.players.onAdd()` | Need to implement |
| **Player Leave** | `mpboss:player:left` event | `room.state.players.onRemove()` | Need to implement |
| **Ready Status** | `mpboss:player:ready` event | `player.isReady` field sync | Need to implement |
| **Timer** | Server broadcast every second | Calculate from `startTime` | Need to implement |
| **Battle Start** | `mpboss:game:started` event | `room.state.phase = PLAYING` | Need to implement |

---

## 5. ASSETS ANALYSIS

### 5.1 Campaign Background Assets ✅
```
public/assets/home_2/home_battle/
├── home_battle_item_bg_campain.webp (fallback)
├── home_battle_item_bg_campain_earth.webp ✅
├── home_battle_item_bg_campain_space.webp ✅
├── home_battle_item_bg_campain_mars.webp ✅
├── home_battle_item_bg_campain_back_to_earth.webp ✅
├── home_battle_item_bg_campain_xcorp.webp ✅
└── home_battle_item_bg_campain_evolve.webp ✅
```

**Status:** ✅ All required campaign assets exist and are used in V2

### 5.2 UI Assets Used in V1
- `home_battle_multiplayer_bg` ✅ (used in V2)
- `share_btn_back` ✅ (close button)
- `home_battle_btn` ✅ (action buttons)

---

## 6. CRITICAL MISSING COMPONENTS

### 6.1 RoomScene Missing Features

**1. Host Info Card**
```javascript
// Missing implementation
- Host avatar display at (62 + 220/2, 392 + 220/2)
- Host username at (306, 448)
- "Host" label in yellow (#FFCC00) at (306, 524)
```

**2. Player List**
```javascript
// Missing implementation
- Guest player card similar to host
- Avatar + username + "Guest" label (#00FF44)
- Player count update
```

**3. Timer Display**
```javascript
// Missing implementation
text_time_remain = scene.add
  .text(960, 389, formatTime(elapsed), {
    fontFamily: "Russo One", fontSize: "40px"
  }).setOrigin(1, 0);
```

**4. Status Display**
```javascript
// Missing implementation
let text_status = scene.add
  .text(960, 433, "Status: " + statusText, {
    fontFamily: "Russo One", fontSize: "40px"
  }).setOrigin(1, 0);
```

**5. Play Button (Host Only)**
```javascript
// Missing implementation
if (isHost) {
  let btn_play = createButton(scene, 686 + 328/2, 641 + 86/2, "Play");
  btn_play.on("pointerdown", startBattle);
}
```

### 6.2 Colyseus State Listeners

**1. Player Management**
```javascript
// Missing in RoomScene
room.state.players.onAdd((player, sessionId) => {
  renderPlayerCard(player, sessionId);
  updatePlayerCount();
});

room.state.players.onRemove((player, sessionId) => {
  removePlayerCard(sessionId);
  updatePlayerCount();
});
```

**2. Timer Logic**
```javascript
// Missing implementation
setInterval(() => {
  if (room.state.phase === BattlePhase.PLAYING) {
    const elapsed = Date.now() - room.state.startTime;
    updateTimer(formatTime(elapsed));
  }
}, 1000);
```

**3. Phase Changes**
```javascript
// Missing implementation
room.listen("phase", (newValue, oldValue) => {
  updateStatus(getPhaseText(newValue));
  if (newValue === BattlePhase.PLAYING) {
    hidePlayButton();
  }
});
```

---

## 7. PHƯƠNG ÁN THỰC HIỆN

### PHASE 1: Complete RoomScene (Priority: CRITICAL)
**Goal:** Match ảnh 3 - Room detail với host info

**Tasks (8-10 hours):**
1. **Create Host Info Card** (2 hours)
   - Copy layout from V1: `HomeBattleMultiplayerBossRoom.js:408-458`
   - Add host avatar at position (62+110, 392+110)
   - Add host username at (306, 448) with Russo One font
   - Add "Host" label at (306, 524) in yellow (#FFCC00)

2. **Add Guest Player Card** (2 hours)
   - Implement guest card below host
   - Add guest avatar when `players.onAdd()` triggered
   - Show "Guest" label in green (#00FF44)
   - Handle player leave with `players.onRemove()`

3. **Implement Timer System** (2 hours)
   - Add timer text at (960, 389) aligned right
   - Calculate elapsed from `room.state.startTime`
   - Format as HH:MM:SS (00:09:48)
   - Update every second with setInterval

4. **Add Status Display** (1 hour)
   - Add status text at (960, 433) aligned right
   - Map phase to text: WAITING→"waiting", PLAYING→"in battle"
   - Listen for `room.state.phase` changes

5. **Add Play Button (Host Only)** (1 hour)
   - Add button at (686+164, 641+43) for host
   - Enable when all players ready
   - Disable when not host or not ready

### PHASE 2: Implement Colyseus State Sync (Priority: CRITICAL)
**Goal:** Real-time updates matching V1 Socket.IO

**Tasks (6-8 hours):**
1. **Player Join/Leave Handlers** (2 hours)
   ```javascript
   room.state.players.onAdd((player, sessionId) => {
     if (player.role === "host") {
       renderHostCard(player);
     } else if (player.role === "guest") {
       renderGuestCard(player);
     }
     updatePlayerCount();
   });
   ```

2. **Ready Status Sync** (2 hours)
   ```javascript
   // Listen for player ready changes
   room.state.players.forEach((player, sessionId) => {
     player.listen("isReady", (ready) => {
       updatePlayerReadyStatus(sessionId, ready);
       updatePlayButton();
     });
   });
   ```

3. **Battle Phase Management** (2 hours)
   ```javascript
   room.listen("phase", (newPhase) => {
     if (newPhase === BattlePhase.PLAYING) {
       hidePlayButton();
       startBattleTimer();
     } else if (newPhase === BattlePhase.ENDED) {
       showBattleResults();
     }
   });
   ```

### PHASE 3: Fix BossSelectScene (Priority: MEDIUM)
**Goal:** Match ảnh 2 - Campaign selection exactly

**Tasks (2-3 hours):**
1. **Verify Campaign Backgrounds** (1 hour)
   - Confirm all assets load correctly
   - Check V2 asset paths vs V1 paths
   - Fix any missing background images

2. **Improve Layout Matching V1** (2 hours)
   - Adjust card dimensions to match V1 (1034x368)
   - Fix text positioning and styling
   - Add hover effects matching V1

### PHASE 4: Enhance RoomListScene (Priority: MEDIUM)
**Goal:** Match ảnh 1 - Room list với host info

**Tasks (2-3 hours):**
1. **Add Host Info to Room Cards** (2 hours)
   - Add host avatar to each room card
   - Display host username and "Host" label
   - Match V1 layout exactly

2. **Improve Room Status Display** (1 hour)
   - Add player count: "1/2"
   - Add room code prominently
   - Add boss info and battle time

### PHASE 5: Backend Integration (Priority: MEDIUM)
**Tasks (2-3 hours):**
1. **Fix Room Metadata** (1 hour)
   - Add `battleTime` to BossState schema
   - Ensure room creation includes all required data

2. **Update BossBattleRoom.ts** (2 hours)
   - Implement `onJoin` with player role assignment
   - Implement `onMessage` handlers
   - Add room state initialization

---

## 8. ESTIMATED TIME & RISK

### Total Estimated Time: **20-27 hours**

- Phase 1 (RoomScene): 8-10 hours ⚠️ Critical path
- Phase 2 (Colyseus Sync): 6-8 hours ⚠️ Critical path
- Phase 3 (BossSelect): 2-3 hours
- Phase 4 (RoomList): 2-3 hours
- Phase 5 (Backend): 2-3 hours

### Risk Assessment

**High Risk:**
- Colyseus state structure may not match V1 data needs
- Timer accuracy in real-time sync
- Host role assignment logic

**Medium Risk:**
- Asset loading differences between V1 and V2
- Layout positioning differences
- Player state synchronization edge cases

**Low Risk:**
- Button styling and interactions
- Text formatting and localization
- Basic scene navigation

### Success Criteria
1. ✅ RoomScene matches ảnh 3 exactly
2. ✅ Real-time player join/leave works
3. ✅ Timer counts down correctly
4. ✅ Play button enables/disables properly
5. ✅ Campaign selection matches ảnh 2
6. ✅ Room list shows host info matching ảnh 1

---

## 9. NEXT STEPS

1. ✅ **SCAN COMPLETE** - This comprehensive report
2. ⏭️ **Approve Phương Án** - Review implementation plan
3. ⏭️ **Phase 1: RoomScene** - Start with host info card
4. ⏭️ **Phase 2: Colyseus Sync** - Add state listeners
5. ⏭️ **Phase 3-5: UI Polish** - Complete remaining scenes
6. ⏭️ **Integration Testing** - Test end-to-end flow
7. ⏭️ **Deployment** - Push to staging for testing

---

**SCAN STATUS:** ✅ COMPLETE
**REPORT DATE:** 2025-11-16
**TOTAL ESTIMATED EFFORT:** 20-27 hours
**PRIORITY ORDER:** RoomScene > Colyseus Sync > BossSelect > RoomList > Backend
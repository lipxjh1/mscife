# Phân Tích Frontend Arena Integration

## Ngày: 2025-11-01
## Người thực hiện: Claude AI

---

## 1. CẤU TRÚC FRONTEND

### 1.1 Framework và Dependencies:
```json
{
  "react": "^18.3.1",
  "phaser": "^3.87.0",
  "socket.io-client": "^4.8.1",
  "axios": "^1.7.7"
}
```

### 1.2 Files liên quan Arena:
```
src/components/Arena/
├── ArenaCountdown.jsx          ✅ Countdown UI component
├── ArenaGame.jsx              ✅ Main Arena game component
├── ArenaTab.jsx               ✅ Arena tab UI
├── ArenaUI.jsx                ✅ Arena UI overlay
├── BoostPlayer.jsx            ✅ Boost player functionality
├── GameInit.jsx               ✅ Arena game initialization
├── ItemDrop.jsx               ✅ Item drop functionality
└── ItemsCatalog.jsx           ✅ Items catalog display

src/services/
├── arena.js                   ✅ Arena API service
└── arenaSocket.js             ✅ Arena WebSocket service

src/utils/
└── vorldAuth.js               ✅ Vorld authentication helper
```

### 1.3 Cấu trúc thư mục:
```
src/
├── components/
│   └── Arena/                 ← Arena UI components
├── services/                  ← API & WebSocket services
├── utils/                     ← Helper functions
└── config/
    └── env.js                 ← Environment configuration
```

---

## 2. ARENA INITIALIZATION

### 2.1 Code gọi API init:
```javascript
// Từ src/components/Arena/GameInit.jsx:21
const response = await arenaService.initGame(streamUrl);

// Từ src/services/arena.js:101
const response = await arenaClient.post('/api/arena/games/init', {
  streamUrl
});
```

**Phân tích:**
- **API Endpoint:** `/api/arena/games/init` ✅ ĐÚNG
- **Headers:** `Authorization: Bearer ${vorldToken}` ❌ VẤN ĐỀ!
- **Token Type:** Vorld token (`vorldAccessToken`) ❌ SAI!
- **Request Body:** `{ streamUrl }` ✅ ĐÚNG

### 2.2 Token Management:
```javascript
// Từ src/services/arena.js:29
const vorldToken = getVorldToken();
config.headers.Authorization = `Bearer ${vorldToken}`;

// Từ src/utils/vorldAuth.js:16
const token = localStorage.getItem('vorldAccessToken');
```

**Phân tích:**
- **Cách lưu Vorld token:** `localStorage.getItem('vorldAccessToken')` ✅
- **Cách lưu Backend JWT:** `sessionStorage.getItem("accessToken")` ✅
- **Cách lấy token khi gọi API:** `getVorldToken()` ❌ SAI!

### 2.3 So sánh với Backend yêu cầu:

| Yêu cầu Backend | Frontend thực tế | Trạng thái |
|----------------|------------------|------------|
| Endpoint: `/api/arena/games/init` | `/api/arena/games/init` | ✅ ĐÚNG |
| Header: `Authorization: Bearer {backendJWT}` | `Authorization: Bearer {vorldToken}` | ❌ **SAI** |
| Token type: Backend JWT | Vorld token | ❌ **SAI** |

**VẤN ĐỀ NGUYÊN NHÂN LỖI 401:**
Frontend đang gửi `vorldAccessToken` thay vì `accessToken` (Backend JWT)!

---

## 3. WEBSOCKET CONNECTION

### 3.1 Socket.IO Setup:
```javascript
// Từ src/services/arenaSocket.js:2
import io from 'socket.io-client';

// Từ src/services/arenaSocket.js:65
this.socket = io(wsUrl, {
  transports: ['websocket'],
  auth: { token },
  query: websocketUrl ? {} : { sessionId },
  reconnection: true,
  timeout: 10000
});
```

**Phân tích:**
- **WebSocket URL:** `wss://airdrop-arcade.onrender.com` ❌ SAI!
- **Authentication:** `auth: { token }` với backend JWT ✅ ĐÚNG
- **Options:** transports, reconnection ✅ ĐÚNG

### 3.2 Event Listeners:
```javascript
// Từ src/services/arenaSocket.js:137-150
this.socket.on('countdown_started', (data) => {
  console.log('[ArenaWS] 📥 Event: countdown_started', data);
  this._emit('countdown_started', data);
});

this.socket.on('countdown_update', (data) => {
  console.log('[ArenaWS] 📥 Event: countdown_update', data);
  this._emit('countdown_update', data);
});

this.socket.on('arena_begins', (data) => {
  console.log('[ArenaWS] 📥 Event: arena_begins', data);
  this._emit('arena_begins', data);
});
```

**Events đang listen:**
- ✅ `countdown_started` (Backend: `ARENA_COUNTDOWN_START`)
- ✅ `countdown_update` (Backend: `countdown_update`)
- ✅ `arena_begins` (Backend: `ARENA_ACTIVE`)
- ❌ `BOOST_RECEIVED` → Frontend có `player_boosted`
- ❌ `ITEM_RECEIVED` → Frontend có `item_dropped`

### 3.3 So sánh với Backend events:

| Backend emit | Frontend listen | Trạng thái |
|--------------|-----------------|------------|
| `ARENA_COUNTDOWN_START` | `countdown_started` | ❌ **KHÁC TÊN** |
| `ARENA_ACTIVE` | `arena_begins` | ❌ **KHÁC TÊN** |
| `BOOST_RECEIVED` | `player_boosted` | ❌ **KHÁC TÊN** |
| `ITEM_RECEIVED` | `item_dropped` | ❌ **KHÁC TÊN** |

---

## 4. UI COMPONENTS ANALYSIS

### 4.1 Arena Component chính:
```javascript
// Từ src/components/Arena/ArenaUI.jsx:6-10
const [arenaCountdown, setArenaCountdown] = useState(null);
const [arenaActive, setArenaActive] = useState(false);
const [notifications, setNotifications] = useState([]);
```

**Phân tích:**
- State countdown: ✅ CÓ (`arenaCountdown`)
- Hiển thị countdown UI: ✅ CÓ (`ArenaCountdown` component)
- Logic đếm ngược: ❌ Không có auto-update, chỉ nhận từ events

### 4.2 Countdown UI:
```javascript
// Từ src/components/Arena/ArenaCountdown.jsx:4
const ArenaCountdown = ({ timeRemaining, isActive, onComplete }) => {
  // Display: {timeRemaining}
```

**Kiểm tra:**
- ✅ Có state lưu countdown (60 → 0)
- ❌ Không có useEffect/interval để auto-update
- ✅ Có hiển thị số giây trên UI với SVG circle
- ✅ Có conditional render khi countdown = 0 ("Arena Begins!")

**Ví dụ code mong muốn:**
```javascript
const [countdown, setCountdown] = useState(60);

useEffect(() => {
  socket.on('ARENA_COUNTDOWN_START', (data) => {
    setCountdown(data.secondsRemaining);
  });

  socket.on('countdown_update', (data) => {
    setCountdown(data.secondsRemaining);
  });
}, []);
```

**Thực tế:**
```javascript
// src/components/Arena/ArenaUI.jsx:13-17
const handleCountdown = (event) => {
  console.log('[Arena UI] Countdown event received:', event.detail);
  setArenaCountdown(event.detail.timeRemaining);
  setArenaActive(false);
};
```

### 4.3 Boost Notification UI:
```javascript
// Từ src/components/Arena/ArenaUI.jsx:25-40
const handleRewardNotification = (event) => {
  const notification = {
    id: `notif_${Date.now()}_${Math.random()}`,
    username: data.username || 'Anonymous',
    packageName: data.packageName || `${data.currency} Package`,
    amount: data.amount,
    currency: data.currency,
    icon: getCurrencyIcon(data.currency),
    timestamp: new Date()
  };
  setNotifications(prev => [...prev, notification]);
};
```

**Kiểm tra:**
- ✅ Có handle reward notifications
- ✅ Có hiển thị notification với animations
- ❌ Event name không match với backend

---

## 5. SO SÁNH VỚI TÀI LIỆU

### 5.1 Arena Arcade Game Documentation Flow:

**Theo tài liệu (Document 2):**
```
1. User login Vorld
2. Frontend gọi initGame với streamUrl
3. Frontend connect WebSocket
4. Nhận countdown events (60s)
5. Nhận boost events
6. Hiển thị notifications
```

**Frontend thực tế:**
```
1. ✅ Login Vorld (có Vorld auth)
2. ✅ Gọi initGame (có streamUrl)
3. ❌ Connect WebSocket sai URL
4. ❌ Countdown events khác tên
5. ❌ Boost events khác tên
6. ✅ Có notifications UI
```

### 5.2 WebSocket URL:

| Loại | URL | Frontend dùng | Trạng thái |
|------|-----|---------------|------------|
| ❌ Direct Arena | `wss://airdrop-arcade.onrender.com` | `wss://airdrop-arcade.onrender.com` | ❌ **SAI** |
| ✅ Backend Proxy | `wss://pro.m-sci.net` | Không dùng | ❌ **THIẾU** |

**Kết luận:** Frontend đang dùng Direct Arena URL thay vì Backend Proxy!

### 5.3 Authentication Token:

| Token Type | Mục đích | Frontend gửi | Trạng thái |
|------------|----------|--------------|------------|
| Backend JWT | Authenticate với Backend API | `vorldAccessToken` | ❌ **SAI TOKEN** |
| Vorld Token | Backend dùng gọi Arena API | Không gửi | ❌ **KHÔNG GỬI** |

**Kết luận:** Frontend đang nhầm lẫn 2 tokens!

---

## 6. VẤN ĐỀ PHÁT HIỆN

### 6.1 Lỗi 401 Unauthorized:

**Log từ browser:**
```
POST https://pro.m-sci.net/api/arena/games/init 401 (Unauthorized)
[Arena] Unauthorized - Token expired or invalid
```

**Nguyên nhân khả năng cao:**
```javascript
// Frontend code (SAI):
// src/services/arena.js:29
const vorldToken = getVorldToken(); // ← Vorld token
config.headers.Authorization = `Bearer ${vorldToken}`;  // ← GỬI SAI TOKEN!

// ĐÚNG phải là:
const backendToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
config.headers.Authorization = `Bearer ${backendToken}`;  // ← Backend JWT
```

**File cần check:** `src/services/arena.js:29`

### 6.2 Countdown Events không match:

**Vấn đề:** Event names khác nhau giữa backend và frontend

**Backend emit:**
- `ARENA_COUNTDOWN_START`
- `ARENA_ACTIVE`
- `BOOST_RECEIVED`
- `ITEM_RECEIVED`

**Frontend listen:**
- `countdown_started`
- `arena_begins`
- `player_boosted`
- `item_dropped`

### 6.3 WebSocket URL sai:

**Vấn đề:** Frontend connect đến Direct Arena thay vì Backend Proxy

**Current (SAI):** `wss://airdrop-arcade.onrender.com`
**Expected (ĐÚNG):** `wss://pro.m-sci.net`

**File cần check:** `src/config/env.js:30`

---

## 7. CHECKLIST SO SÁNH VỚI TÀI LIỆU

### 7.1 Initialization (Step 4 trong tài liệu):
- ❌ Gọi POST `/api/arena/games/init` với SAI token type
- ✅ Gửi đúng `streamUrl`
- ❌ Gửi sai token (Vorld thay vì Backend JWT)
- ✅ Nhận `sessionId` và `websocketUrl`

### 7.2 WebSocket (Step 5 trong tài liệu):
- ❌ Connect đến sai URL (Direct thay vì Backend)
- ❌ Listen sai event names cho countdown
- ❌ Listen sai event names cho arena active
- ❌ Listen sai event names cho boost
- ❌ Listen sai event names cho item

### 7.3 UI Display:
- ✅ Hiển thị countdown 60s → 0s (có component)
- ✅ Hiển thị "Arena Begins!" (có conditional render)
- ✅ Hiển thị boost notifications (có UI)
- ❌ Events không trigger UI do sai names

---

## 8. VẤN ĐỀ CẦN FIX

### 8.1 Token Type (Priority: CRITICAL):
**Vấn đề:** Frontend gửi sai token type

**Current (SAI):**
```javascript
// src/services/arena.js:29
const vorldToken = getVorldToken(); // ← Vorld token
config.headers.Authorization = `Bearer ${vorldToken}`;
```

**Expected (ĐÚNG):**
```javascript
const backendToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
config.headers.Authorization = `Bearer ${backendToken}`;
```

**File:** `src/services/arena.js:29`
**Line:** 29, 34

### 8.2 Event Names (Priority: HIGH):
**Vấn đề:** Event names không match với backend

**Current (SAI):**
```javascript
// Frontend listen
socket.on('countdown_started', ...);
socket.on('arena_begins', ...);
socket.on('player_boosted', ...);
```

**Expected (ĐÚNG):**
```javascript
// Backend emit
socket.on('ARENA_COUNTDOWN_START', ...);
socket.on('ARENA_ACTIVE', ...);
socket.on('BOOST_RECEIVED', ...);
```

**File:** `src/services/arenaSocket.js:137-166`

### 8.3 WebSocket URL (Priority: HIGH):
**Vấn đề:** Connect sai URL

**Current (SAI):** `wss://airdrop-arcade.onrender.com`
**Expected (ĐÚNG):** `wss://pro.m-sci.net`

**File:** `src/config/env.js:30`

### 8.4 Countdown UI Integration (Priority: MEDIUM):
**Vấn đề:** Countdown UI không nhận được events

**Missing:** Connect UI components với socket events

**File:** `src/components/Arena/ArenaUI.jsx:60-64`

---

## 9. KẾT LUẬN

### 9.1 Tình trạng Frontend:

| Component | Status | Note |
|-----------|--------|------|
| API Integration | ❌ **CRITICAL** | SAI token type → 401 error |
| WebSocket Setup | ❌ **HIGH** | Sai URL, sai event names |
| Token Management | ❌ **CRITICAL** | Nhầm lẫn Backend JWT vs Vorld token |
| Countdown UI | ✅ **GOOD** | Có component hoàn chỉnh |
| Event Handling | ❌ **HIGH** | Event names không match |

### 9.2 So với tài liệu Arena Arcade:

- **Đúng:** Có countdown UI 60s, có boost notifications, có game initialization
- **Sai:** Token type, WebSocket URL, event names
- **Thiếu:** Connection giữa UI và socket events

### 9.3 Nguyên nhân lỗi 401:
**CRITICAL:** Frontend gửi `vorldAccessToken` thay vì `accessToken` (Backend JWT) trong Authorization header!

### 9.4 Countdown UI:
**GOOD:** Có đầy đủ UI components, nhưng không nhận được events do sai event names và WebSocket connection.

---

## 10. KHUYẾN NGHỊ

### 10.1 Ưu tiên fix:
1. **Critical:** Fix token type trong Authorization header (Backend JWT thay vì Vorld token)
2. **High:** Fix WebSocket URL thành `wss://pro.m-sci.net`
3. **High:** Fix event names để match với backend
4. **Medium:** Connect UI components với socket events

### 10.2 Files cần sửa:
- [ ] `src/services/arena.js:29` - Fix token type (CRITICAL)
- [ ] `src/config/env.js:30` - Fix WebSocket URL (HIGH)
- [ ] `src/services/arenaSocket.js:137-166` - Fix event names (HIGH)
- [ ] `src/components/Arena/ArenaUI.jsx:60-64` - Connect events (MEDIUM)

### 10.3 Thứ tự fix:
1. **Đầu tiên:** Fix token type → giải quyết lỗi 401
2. **Thứ hai:** Fix WebSocket URL → kết nối thành công
3. **Thứ ba:** Fix event names → nhận được events
4. **Cuối cùng:** Connect UI → hiển thị properly

---

## PHỤ LỤC

### A. Frontend Code Samples:

**Token Management (SAI):**
```javascript
// src/services/arena.js:29
const vorldToken = getVorldToken();
config.headers.Authorization = `Bearer ${vorldToken}`;
```

**WebSocket URL (SAI):**
```javascript
// src/config/env.js:30
ARENA_WS_URL: 'wss://airdrop-arcade.onrender.com'
```

**Event Names (SAI):**
```javascript
// src/services/arenaSocket.js:137
this.socket.on('countdown_started', ...);
// Backend emits: ARENA_COUNTDOWN_START
```

### B. Browser Console Logs:

**Lỗi 401:**
```
POST https://pro.m-sci.net/api/arena/games/init 401 (Unauthorized)
[Arena] Unauthorized - Token expired or invalid
```

**Login thành công:**
```
✅ Vorld Login Response: {
  data: {
    accessToken: 'eyJhbGc...',        // Backend JWT ← CẦN GỬI
    vorldAccessToken: 'eyJhbGc...',   // Vorld token ← ĐANG GỬI SAI
  }
}
```

### C. Backend Events Reference:
```javascript
// Backend emits these events:
ARENA_COUNTDOWN_START    // Frontend cần listen: countdown_started ❌
ARENA_ACTIVE            // Frontend cần listen: arena_begins ❌
BOOST_RECEIVED          // Frontend cần listen: player_boosted ❌
ITEM_RECEIVED           // Frontend cần listen: item_dropped ❌
```

### D. Expected Flow (After Fix):
```javascript
// 1. Fix token type
const backendToken = sessionStorage.getItem("accessToken");
config.headers.Authorization = `Bearer ${backendToken}`;

// 2. Fix WebSocket URL
const wsUrl = 'wss://pro.m-sci.net';

// 3. Fix event listeners
socket.on('ARENA_COUNTDOWN_START', (data) => {
  setArenaCountdown(data.secondsRemaining);
});

// 4. Connect UI
window.addEventListener('arena:countdown', handleCountdown);
```

---

**Tóm tắt:** Frontend có đầy đủ UI components nhưng đang bị **3 lỗi nghiêm trọng** làm mất kết nối với backend: (1) Sai token type, (2) Sai WebSocket URL, (3) Sai event names. Fix 3 vấn đề này sẽ giải quyết được lỗi 401 và làm Arena hoạt động đúng.
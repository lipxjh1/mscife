# Báo Cáo Scan: Username/ID Hiển Thị "Guest" Sau Login

## 1. Thông Tin
- **Ngày:** 2025-12-12
- **Hiện tượng:** Login → "Guest", Reload → Đúng username

## 2. Data Flow Analysis

### 2.1 Flow Login Lần Đầu
```
Login Success
    ↓
Backend response: {success: true, data: {username: "xxx", id: "yyy", ...}}
    ↓
localStorage.setItem('userData', JSON.stringify(data.data))
    ↓
centerData.syncFromStorage() KHÔNG được gọi
    ↓
userInfo vẫn = {Username: "Guest", UserId: "Guest"}
    ↓
UI render: "Guest"
```

### 2.2 Flow Reload
```
Page Load
    ↓
CenterData constructor → syncFromStorage()
    ↓
localStorage.getItem('userData') → parse data
    ↓
userInfo = {Username: "xxx", UserId: "No ID"}
    ↓
UI render: Đúng username (nhưng UserId vẫn "No ID")
```

## 3. Root Cause Analysis

### 3.1 Vấn đề 1: syncFromStorage() không được gọi sau login
- **File:** `src/minikit/useWorldID.tsx`
- **Evidence:** Line 132 chỉ lưu vào localStorage, KHÔNG gọi centerData.syncFromStorage()
- **Impact:** CenterData không biết user data đã thay đổi

### 3.2 Vấn đề 2: UI không refresh sau khi data update
- **File:** `src/game/scenes/Home/HomeTopBarPlayer.js`
- **Evidence:** Line 495, 514 chỉ đọc data lúc tạo, KHÔNG listen event update
- **Impact:** UI hiển thị data cũ ngay cả khi CenterData được update

### 3.3 Vấn đề 3: Field mapping sai cho UserId
- **Backend trả về:** `{id: "..."}`
- **CenterData expect:** `{odlUserId: "..."}`
- **Mismatch:** CÓ - CenterData ưu tiên `odlUserId` nhưng backend trả về `id`

## 4. Timing Diagram

```
Timeline Login Lần Đầu:
────────────────────────────────────────
T1: Login success
T2: localStorage.setItem('userData')
T3: Game component render
T4: HomeTopBarPlayer.create() - đọc centerData.userInfo.Username = "Guest"
T5: UpdateUserInfo() được gọi sau 10 giây
    ↓
❌ syncFromStorage() KHÔNG được gọi giữa T2 và T5
❌ UI không có mechanism để update ngay lập tức
```

```
Timeline Reload:
────────────────────────────────────────
T1: Page load
T2: CenterData constructor
T3: syncFromStorage() → đọc localStorage
T4: userInfo = {Username: "xxx", UserId: "No ID"}
T5: Game component render
T6: HomeTopBarPlayer.create() - đọc đúng username
    ↓
✅ syncFromStorage() chạy TRƯỚC khi render
⚠️ UserId vẫn "No ID" do field mapping sai
```

## 5. Files Liên Quan

| File | Vai trò | Vấn đề |
|------|---------|--------|
| useWorldID.tsx | Lưu userData | Không gọi syncFromStorage() |
| CenterData.js | Quản lý user data | syncFromStorage chỉ chạy constructor |
| HomeTopBarPlayer.js | Hiển thị username | Không listen event update |
| WorldIdLogin.jsx | Emit event | Emit 'world-id-login-success' nhưng không listened |

## 6. Đề Xuất Fix

### Option 1: Gọi syncFromStorage() sau login (Recommended)
```javascript
// Trong useWorldID.tsx sau khi lưu userData
localStorage.setItem('userData', JSON.stringify(data.data));
centerData.syncFromStorage();  // THÊM
centerData.EmitPlayerInfoChange(); // THÊM
```

### Option 2: Add listener cho world-id-login-success
```javascript
// Trong game component
EventBus.on('world-id-login-success', () => {
    centerData.syncFromStorage();
    // Update UI text
    text_user_name.setText(centerData.userInfo.Username);
    text_user_id.setText("ID: " + centerData.userInfo.UserId);
});
```

### Option 3: Fix field mapping
```javascript
// Trong CenterData.syncFromStorage()
UserId: data.id || data.odlUserId || data.UserId || "No ID"
// Ưu tiên 'id' thay vì 'odlUserId'
```

### Option 4: Add player info change listener
```javascript
// Trong HomeTopBarPlayer.js CreatePlayerBar()
const updateUserInfo = () => {
    text_user_name.setText(centerData.userInfo.Username || "No user");
    text_user_id.setText("ID: " + (centerData.userInfo.UserId || "No ID"));
};
centerData.AddPlayerInfoChange(updateUserInfo);

// Cleanup
scene.events.once("shutdown", () => {
    centerData.RemovePlayerInfoChange(updateUserInfo);
});
```

## 7. Kết Luận

**Root cause chính:**
1. `syncFromStorage()` chỉ được gọi khi CenterData khởi tạo, không được gọi sau khi login
2. UI component không có mechanism để update khi data thay đổi
3. Field mapping sai: backend trả về `id` nhưng CenterData expect `odlUserId`

**Cần fix:** Gọi `syncFromStorage()` + `EmitPlayerInfoChange()` sau login, và add listener trong UI component.
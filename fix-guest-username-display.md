# Fix: Username/ID Hiển Thị "Guest" Sau Login

## Thông Tin
- **Ngày:** 2025-12-13
- **Version:** v422
- **Files sửa:**
  - src/minikit/useWorldID.tsx
  - src/game/Data/CenterData.js
  - src/game/scenes/Home/HomeTopBarPlayer.js

## Vấn Đề
- Login World ID thành công
- Username hiển thị "Guest" thay vì tên thật
- ID hiển thị "Guest" hoặc "No ID"
- Reload mới hiển thị đúng

## Nguyên Nhân
1. `syncFromStorage()` không được gọi sau login
2. Field mapping sai - không đọc `data.id`
3. UI không có listener để update khi data thay đổi

## Giải Pháp

### 1. Fix useWorldID.tsx - Gọi syncFromStorage()
```typescript
localStorage.setItem('userData', JSON.stringify(data.data));

// THÊM:
centerData.syncFromStorage();
centerData.EmitPlayerInfoChange();
```

### 2. Fix CenterData.js - Field mapping
```javascript
// Thêm data.id vào đầu
UserId: data.id || data.odlUserId || data.UserId || data.userId || "No ID",
```

### 3. Fix HomeTopBarPlayer.js - Add listener
```javascript
const updateUserDisplay = () => {
    text_user_name.setText(centerData.userInfo?.Username || "No user");
    text_user_id.setText("ID: " + (centerData.userInfo?.UserId || "No ID"));
};
centerData.AddPlayerInfoChange(updateUserDisplay);
```

## Flow Sau Khi Fix

```
Login Success
    ↓
localStorage.setItem('userData') ✅
    ↓
centerData.syncFromStorage() ✅
    ↓
centerData.EmitPlayerInfoChange() ✅
    ↓
HomeTopBarPlayer listener triggered ✅
    ↓
UI update với đúng username/ID ✅
```

## Chi Thực Hiện

### Bước 1: Thêm import centerData vào useWorldID.tsx
```typescript
import centerData from '../game/Data/CenterData.js';
```

### Bước 2: Thêm sync sau login trong useWorldID.tsx (line 141-148)
```typescript
// ⭐ THÊM: Sync vào CenterData và emit event update UI
console.log('🔄 Syncing user data to CenterData...');
centerData.syncFromStorage();
console.log('📢 Emitting player info change...');
if (typeof centerData.EmitPlayerInfoChange === 'function') {
    centerData.EmitPlayerInfoChange();
}
console.log('✅ User data synced and UI notified');
```

### Bước 3: Sửa UserId mapping trong CenterData.js (line 453-454)
```javascript
// Trước:
UserId: data.odlUserId || data.UserId || data.userId || "No ID",

// Sau:
UserId: data.id || data.odlUserId || data.UserId || data.userId || "No ID",
```

### Bước 4: Thêm listener trong HomeTopBarPlayer.js (line 523-550)
```javascript
// ⭐ THÊM: Listener để update UI khi player info thay đổi
const updateUserDisplay = () => {
    console.log('🔄 Updating user display...');
    const username = centerData.userInfo?.Username || "No user";
    const userId = centerData.userInfo?.UserId || "No ID";

    if (text_user_name && text_user_name.setText) {
        text_user_name.setText(username);
    }
    if (text_user_id && text_user_id.setText) {
        text_user_id.setText("ID: " + userId);
    }
    console.log('✅ User display updated:', username, userId);
};

// Đăng ký listener
if (typeof centerData.AddPlayerInfoChange === 'function') {
    centerData.AddPlayerInfoChange(updateUserDisplay);
    console.log('✅ Registered player info change listener');
}

// Cleanup khi scene shutdown
scene.events.once("shutdown", () => {
    if (typeof centerData.RemovePlayerInfoChange === 'function') {
        centerData.RemovePlayerInfoChange(updateUserDisplay);
        console.log('🧹 Cleaned up player info change listener');
    }
});
```

## Test Results
- [x] Login lần đầu → Username đúng
- [x] Login lần đầu → ID đúng
- [x] Reload → Vẫn đúng
- [x] Console có logs sync thành công

## Console Logs Expected Sau Login
```
🔄 Syncing user data to CenterData...
📢 Emitting player info change...
✅ User data synced and UI notified
🔄 Updating user display...
✅ User display updated: [username] [userId]
✅ Registered player info change listener
```

## Commit
```
commit 395c423
v422 - Fix hiển thị Guest sau login: sync CenterData + fix UserId mapping + add UI listener
```
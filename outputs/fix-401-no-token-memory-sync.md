# Fix: 401 NO TOKEN - Memory vs Storage Mismatch

## Thông Tin
- **Ngày:** 2025-12-12
- **Version:** v419
- **Files sửa:**
  - src/minikit/useWorldID.tsx
  - src/game/Data/APIBase.js (không cần sửa - đã có sẵn setTokens)

## Vấn Đề
- World ID login thành công, token lưu vào localStorage
- API calls báo 401 "NO TOKEN", "Had Token: false"
- Reload page thì hoạt động bình thường

## Nguyên Nhân
APIBase.js đọc token từ biến MEMORY, không phải localStorage:
1. `loadTokens()` chạy 1 lần lúc module init
2. Khi đó chưa có token → memory = null
3. Sau login, localStorage có token nhưng memory vẫn = null
4. Reload hoạt động vì module load lại → đọc token từ localStorage

## Giải Pháp

### 1. Import setTokens và clearTokens vào useWorldID.tsx
```typescript
// Thêm ở đầu file
import { setTokens, clearTokens } from '../game/Data/APIBase.js';
```

### 2. Gọi setTokens() sau khi login success
```typescript
// Sau localStorage.setItem
// ⭐ Sync tokens to APIBase memory
console.log('🔄 Syncing tokens to APIBase memory...');
setTokens(data.accessToken, data.refreshToken || '');
console.log('✅ Tokens synced to memory');
```

### 3. Gọi clearTokens() khi logout
```typescript
// Sau localStorage.removeItem
// ⭐ Clear tokens from APIBase memory
clearTokens();
```

### 4. Gọi setTokens() sau refresh token
```typescript
// Sau refresh token thành công
// ⭐ Sync new tokens to APIBase memory
setTokens(data.accessToken, data.refreshToken || '');
console.log('✅ Refreshed tokens synced to memory');
```

## Flow Sau Khi Fix

```
Login Success
    ↓
localStorage.setItem() ✅
    ↓
setTokens() → Memory updated ✅
    ↓
API call → "Had Token: true" ✅
    ↓
200 OK ✅
    ↓
🎮 VÀO GAME
```

## Code Changes

### useWorldID.tsx - Import additions:
```typescript
import { setTokens, clearTokens } from '../game/Data/APIBase.js';
```

### useWorldID.tsx - Login success callback:
```typescript
if (data.success && data.accessToken) {
    // Store tokens
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.data) {
        localStorage.setItem('userData', JSON.stringify(data.data));
    }

    // ⭐ Sync tokens to APIBase memory
    console.log('🔄 Syncing tokens to APIBase memory...');
    setTokens(data.accessToken, data.refreshToken || '');
    console.log('✅ Tokens synced to memory');

    console.log('✅ Login successful! Tokens stored.');
    return { success: true, data: data.data };
}
```

### useWorldID.tsx - Logout function:
```typescript
const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    // ⭐ Clear tokens from APIBase memory
    clearTokens();

    setError(null);
    console.log('👋 Logged out');
}, []);
```

### useWorldID.tsx - Refresh token function:
```typescript
if (data.success && data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.data) {
        localStorage.setItem('userData', JSON.stringify(data.data));
    }

    // ⭐ Sync new tokens to APIBase memory
    setTokens(data.accessToken, data.refreshToken || '');
    console.log('✅ Refreshed tokens synced to memory');

    return data;
}
```

## Test Results
- [x] Login → API 200 OK (không còn 401)
- [x] Game load ngay (không cần reload)
- [x] Refresh → Vẫn trong game
- [x] Console: "Tokens synced to memory"
- [x] Build thành công

## Console Logs Expected
```
✅ World ID Wallet Auth successful!
📥 Backend response: {success: true, accessToken: "..."}
🔄 Syncing tokens to APIBase memory...
🔑 APIBase: Setting tokens in memory
✅ APIBase: Tokens updated
✅ Tokens synced to memory
✅ Login successful! Tokens stored.
🔑 API Request: GET /api/me
📝 Token sent: Bearer eyJhbGciOi...
[API calls succeed - no more 401]
```

## Backup Files Created
- src/minikit/useWorldID.tsx.backup.20251212_142224

## Git Commit
```bash
git add src/minikit/useWorldID.tsx
git commit -m "v419 - Fix 401 NO TOKEN: Sync token memory sau World ID login

- Import setTokens và clearTokens từ APIBase
- Gọi setTokens() sau khi login thành công để sync localStorage → memory
- Gọi clearTokens() khi logout để xóa memory
- Gọi setTokens() sau refresh token để cập nhật memory
- Fix lỗi API calls báo 401 'NO TOKEN' dù login thành công

🤖 Generated with Claude Code

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```
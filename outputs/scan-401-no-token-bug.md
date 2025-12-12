# Báo Cáo Scan: 401 NO TOKEN Sau World ID Login

## 1. Thông Tin
- **Ngày:** 2025-12-12
- **Hiện tượng:** Login World ID thành công nhưng API gọi 401 "NO TOKEN"
- **Console logs quan trọng:**
  - "Login successful! Tokens stored."
  - "isWorldIdAuthenticated changed: true"
  - "Had Token: false" (APIBase.js:139)

## 2. Token Storage Analysis

### 2.1 Nơi Lưu Token (setItem)
| Login Method | Key Name | File | Line |
|--------------|----------|------|------|
| World ID | `accessToken` | /src/minikit/useWorldID.tsx | 126 |
| Google | `accessToken` | /src/pages/LinkGoogleAccount.jsx | 17 |
| Vorld | `accessToken` | /src/modules/vorld-auth/index.js | 103 |

### 2.2 Nơi Đọc Token (getItem)
| Component | Key Name | File | Line |
|-----------|----------|------|------|
| APIBase (loadTokens) | `accessToken` | /src/game/Data/APIBase.js | 176 |
| APIBase (interceptor) | Biến `accessToken` | /src/game/Data/APIBase.js | 48 |
| useWorldID (getAccessToken) | `accessToken` | /src/minikit/useWorldID.tsx | 167 |

### 2.3 Key Mismatch Detection
- **World ID setItem key:** `accessToken` ✅
- **API service getItem key:** `accessToken` ✅
- **MISMATCH:** KHÔNG - Keys match perfectly!

## 3. API Service Analysis

### 3.1 API Configuration
- **File:** /src/game/Data/APIBase.js
- **Type:** Axios với interceptor
- **Has Interceptor:** CÓ

### 3.2 Token Attachment Logic
```javascript
// APIBase.js line 46-60
apiClient.interceptors.request.use(
    (config) => {
        if (accessToken) {  // ❌ Check biến trong memory
            config.headers["Authorization"] = `Bearer ${accessToken}`;
            console.log(`🔑 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        } else {
            console.log(`❌ NO TOKEN for request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    }
);
```

### 3.3 Vấn đề tìm thấy
APIBase.js uses **biến `accessToken` trong memory**, không đọc từ localStorage mỗi request!

## 4. API Call Analysis

### 4.1 /api/me Call
- **Called from:** /src/game/Data/CenterData.js:1355
- **Function:** `RequestUserInfo()`
- **Token attached:** KHÔNG (vì biến `accessToken` trong memory = null)

### 4.2 /api/me/update-wallet Call
- **Called from:** /src/game/scenes/Preloader.js:287
- **Function:** `loadHomeSceneDirectly()`
- **Token attached:** KHÔNG

## 5. Timing Analysis

### 5.1 Sequence of Events
```
1. App khởi động → APIBase.js load → loadTokens() → accessToken = null
2. User click World ID login → useWorldID.verify()
3. Login success → localStorage.setItem('accessToken', token) ❌ KHÔNG update memory
4. State update → Game render → loadHomeSceneDirectly()
5. Game call RequestUpdateWallet() → API /api/me/update-wallet
6. Interceptor check accessToken (memory) → null → ❌ "NO TOKEN"
7. Server trả về 401
```

### 5.2 Race Condition
- **Detected:** CÓ - Critical timing issue!
- **Details:** Token được lưu trong localStorage nhưng KHÔNG được load vào memory của APIBase

## 6. Root Cause Identification

### Primary Cause
- **Vấn đề:** APIBase chỉ load token từ localStorage **một lần** lúc module init, không re-load sau khi login
- **File:** /src/game/Data/APIBase.js
- **Line:** 188 (loadTokens chỉ gọi 1 lần)
- **Code lỗi:**
```javascript
// Line 148-154: setTokens lưu vào localStorage + memory
const setTokens = (newAccessToken, newRefreshToken) => {
    accessToken = newAccessToken;  // Update memory ✅
    localStorage.setItem("accessToken", newAccessToken);  // Update storage ✅
};

// Line 175-181: loadTokens chỉ chạy lúc init
const loadTokens = () => {
    accessToken = localStorage.getItem("accessToken");  // Load from storage
};

// Line 188: Chạy 1 lần duy nhất!
loadTokens();
```

### Secondary Issues
1. **useWorldID.tsx** không gọi `setTokens()` từ APIBase.js
2. **Interceptor** đọc từ memory thay vì localStorage mỗi request

## 7. Đề Xuất Fix

### Fix 1: Import và gọi setTokens trong useWorldID.tsx (RECOMMENDED)
```typescript
// Trong useWorldID.tsx
import { setTokens } from '../../game/Data/APIBase.js';

// Line 124-134, sau khi localStorage.setItem:
if (data.success && data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    // ✅ THÊM: Update APIBase memory
    setTokens(data.accessToken, data.refreshToken);

    console.log('✅ Login successful! Tokens stored and APIBase updated.');
    return { success: true, data: data.data };
}
```

### Fix 2: Force reload tokens trong interceptor (Alternative)
```javascript
// Trong APIBase.js interceptor
apiClient.interceptors.request.use((config) => {
    // ✅ THÊM: Re-load token từ localStorage mỗi request
    const currentToken = localStorage.getItem("accessToken");
    if (currentToken) {
        accessToken = currentToken;  // Update memory
        config.headers["Authorization"] = `Bearer ${currentToken}`;
    }
    return config;
});
```

### Fix 3: Expose và gọi loadTokens sau login (Alternative)
```javascript
// Export loadTokens để useWorldID có thể gọi
export { apiClient, setTokens, clearTokens, loadTokens };

// Trong useWorldID.tsx sau login:
window.loadTokens();  // Force reload APIBase tokens
```

## 8. Files Cần Sửa

| File | Line | Thay đổi cần làm |
|------|------|------------------|
| /src/minikit/useWorldID.tsx | 4 | Import setTokens từ APIBase |
| /src/minikit/useWorldID.tsx | 134 | Thêm: setTokens(data.accessToken, data.refreshToken) |

## 9. Testing Plan
- [ ] Login World ID → Check APIBase logs show "Access Token: PRESENT"
- [ ] API /api/me call thành công → Return 200
- [ ] Game load hoàn tất → Không stuck ở loading
- [ ] Các login method khác vẫn OK → Google, Vorld không bị ảnh hưởng

## 10. Evidence Summary

**Root Cause:** World ID login chỉ lưu token vào localStorage, không update biến `accessToken` trong memory của APIBase. Kết quả là interceptor luôn gửi request với "Had Token: false".

**Solution:** Gọi `setTokens()` từ APIBase.js sau khi World ID login thành công để sync localStorage với memory.
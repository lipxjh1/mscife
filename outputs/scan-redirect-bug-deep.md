# Báo Cáo Scan Deep: Login Success Không Chuyển Scene

## 1. Thông Tin
- **Ngày:** 2025-12-12
- **Hiện tượng:** "Redirecting to game" log nhưng UI stuck ở màn hình World ID Login

## 2. Console Flow Observed
```
✅ World ID Wallet Auth successful
✅ Backend response: success
✅ Tokens stored
✅ World ID login successful in App!
✅ Redirecting to game...
❌ [STUCK HERE - không có log gì thêm]
```

## 3. App.jsx Analysis

### 3.1 handleWorldIdLoginSuccess Function
- **Line:** 325-337
- **Code:**
```jsx
const handleWorldIdLoginSuccess = (data) => {
    console.log('🎉 World ID login successful in App!', data);

    // Get current scene and notify it
    const currentScene = phaserRef.current?.scene;
    if (currentScene) {
        EventBus.emit('auth-success', {
            type: 'world-id',
            user: data.user,
            tokens: data.tokens
        });
    }
};
```
- **Vấn đề:** KHÔNG có setState nào được gọi để trigger re-render của App component!

### 3.2 Conditional Render Logic
- **Line:** 803-804
- **Điều kiện render WorldIdLogin:**
```jsx
if (isInstalled && !localStorage.getItem('accessToken')) {
    return <WorldIdLogin />;
}
```
- **Điều kiện render Game:** Game được render bên trong AuthWrapper khi isAuthenticated = true
- **Vấn đề:** App.jsx chỉ check localStorage ONE TIME khi render, KHÔNG có state để trigger re-render sau khi login

## 4. AuthWrapper.jsx Analysis

### 4.1 World ID Listener Status
- **Có listener:** CÓ
- **Line:** 41-44
- **Code:**
```jsx
const handleWorldIdLoginSuccess = (data) => {
    console.log('✅ World ID login detected in AuthWrapper', data);
    setIsAuthenticated(true);
};
```
- **Vấn đề:** Listener tồn tại và setIsAuthenticated được gọi

### 4.2 isAuthenticated Flow
- **Initial value:** false
- **Được set true khi:** Event 'world-id-login-success' được nhận
- **Vấn đề:** KHÔNG VẤN ĐỀ - AuthWrapper hoạt động đúng

## 5. WorldIdLogin.jsx Analysis

### 5.1 Success State
- **UI hiển thị "Success":** Dựa vào state `success` (line 7)
- **Component tự unmount:** KHÔNG
- **Vấn đề:** Component chỉ set success = true và emit event, nhưng KHÔNG tự unmount vì App component không re-render

## 6. State Flow Diagram

```
Login Success
    ↓
Token saved ✅ (localStorage.setItem)
    ↓
EventBus.emit('world-id-login-success') ✅
    ↓
App.jsx receives → Chỉ emit 'auth-success' cho Phaser ❌ KHÔNG setState!
    ↓
AuthWrapper receives → setIsAuthenticated(true) ✅
    ↓
State update → AuthWrapper re-render ✅
    ↓
WorldIdLogin unmount? ❌ Vẫn mount vì App KHÔNG re-render!
    ↓
Game render? ❌ Blocked vì App vẫn return WorldIdLogin
```

## 7. Root Cause Identification

### Primary Cause
- **Vấn đề:** App.jsx KHÔNG re-render sau khi login success vì handleWorldIdLoginSuccess không gọi state setter nào
- **File:** `/src/App.jsx`
- **Line:** 325-337
- **Code lỗi:**
```jsx
const handleWorldIdLoginSuccess = (data) => {
    console.log('🎉 World ID login successful in App!', data);

    // Get current scene and notify it
    const currentScene = phaserRef.current?.scene;
    if (currentScene) {
        EventBus.emit('auth-success', {
            type: 'world-id',
            user: data.user,
            tokens: data.tokens
        });
    }
    // ❌ THIẾU: Không có state update để trigger re-render!
};
```
- **Giải thích:** Component App.jsx chỉ check localStorage tại thời điểm render ban đầu. Sau khi login thành công và token được lưu, App component không biết cần re-render để hiển thị game thay vì WorldIdLogin.

### Secondary Issues
1. **Conditional render dựa trên localStorage mà không có reactivity** - App.jsx line 803 check localStorage trực tiếp
2. **WorldIdLogin component không tự unmount** - Phụ thuộc vào parent re-render

## 8. Tại Sao Reload Hoạt Động

Khi reload page:
1. Component App mount lại từ đầu
2. useEffect trong AuthWrapper check localStorage → thấy accessToken tồn tại
3. Set isAuthenticated = true
4. App.jsx check localStorage → thấy accessToken tồn tại → render AuthWrapper (sẵn sàng render children)
5. Game được render bình thường

## 9. Đề Xuất Fix

### Fix 1: Thêm state để trigger re-render trong App.jsx
```jsx
// Thêm state ở line 72
const [shouldRecheck, setShouldRecheck] = useState(false);

// Trong handleWorldIdLoginSuccess (line 325)
const handleWorldIdLoginSuccess = (data) => {
    console.log('🎉 World ID login successful in App!', data);

    // Force re-render by updating state
    setShouldRecheck(prev => !prev);

    // Get current scene and notify it
    const currentScene = phaserRef.current?.scene;
    if (currentScene) {
        EventBus.emit('auth-success', {
            type: 'world-id',
            user: data.user,
            tokens: data.tokens
        });
    }
};
```

### Fix 2: Sử dụng force update pattern (đơn giản hơn)
```jsx
// Thêm state ở line 72
const [updateKey, setUpdateKey] = useState(0);

// Trong handleWorldIdLoginSuccess (line 325)
const handleWorldIdLoginSuccess = (data) => {
    console.log('🎉 World ID login successful in App!', data);

    // Force re-render
    setUpdateKey(prev => prev + 1);

    // ... rest of the code
};
```

### Fix 3: Dùng useEffect để lắng nghe token thay đổi (khuyến khích)
```jsx
// Thêm state và useEffect sau line 76
const [tokenChecked, setTokenChecked] = useState(false);

useEffect(() => {
    const checkToken = () => {
        const hasToken = localStorage.getItem('accessToken');
        if (hasToken && !tokenChecked) {
            setTokenChecked(true);
        }
    };

    checkToken();

    EventBus.on('world-id-login-success', () => {
        setTokenChecked(true);
    });
}, [tokenChecked]);
```

## 10. Files Cần Sửa

| File | Line | Thay đổi cần làm |
|------|------|------------------|
| `/src/App.jsx` | 72 | Thêm state để trigger re-render |
| `/src/App.jsx` | 325-337 | Thêm setState trong handleWorldIdLoginSuccess |

## 11. Testing Plan

- [ ] Login World ID → Game load ngay (không cần reload)
- [ ] Console không có error
- [ ] UI không stuck ở màn hình login
- [ ] Token được lưu đúng cách
- [ ] AuthWrapper nhận được event và render children
# Vorld Auth Integration - Test Checklist

## ✅ Pre-Integration Tests

- [x] Module files exist (index.js, OTPInput.jsx, README.md)
- [x] Backups created
- [x] No syntax errors

## 🔧 Integration Tests

### App.jsx
- [x] Import vorldAuth và OTPInput không lỗi
- [x] State showVorldOTP và vorldEmail được tạo
- [x] EventBus listener 'vorld:show-otp' hoạt động
- [x] handleVorldOTPVerify function tồn tại
- [x] handleVorldOTPBack function tồn tại
- [x] OTPInput component render đúng

### Login.js
- [x] Import vorldAuth không lỗi
- [x] RequestVorldLogin method tồn tại
- [x] handleVorldLoginSuccess method tồn tại
- [x] EventBus emit 'vorld:show-otp' được gọi
- [x] EventBus listen 'vorld:otp-success' hoạt động

## 🧪 Manual Tests

### Test 1: App Loads
- [ ] npm run dev không lỗi
- [ ] Browser console không có errors
- [ ] Login scene hiển thị bình thường

### Test 2: Vorld Login Method
- [ ] Có thể gọi scene.RequestVorldLogin(email, password)
- [ ] Console log "🔐 Vorld Login requested"
- [ ] Loading popup hiển thị

### Test 3: EventBus Flow
- [ ] Phaser emit event 'vorld:show-otp'
- [ ] React nhận được event
- [ ] OTP component hiển thị
- [ ] Console logs đầy đủ

### Test 4: OTP Component
- [ ] Component render overlay đen
- [ ] 6 input boxes hiển thị
- [ ] Auto-focus vào input đầu
- [ ] Có thể nhập số
- [ ] Auto-focus next input
- [ ] Back button hoạt động

### Test 5: API Integration (nếu backend ready)
- [ ] Login API call thành công
- [ ] Response có requiresOTP: true
- [ ] OTP screen hiển thị
- [ ] Verify OTP API call thành công
- [ ] Tokens được lưu vào sessionStorage
- [ ] Navigate to Home scene

### Test 6: Error Handling
- [ ] Email trống → show error
- [ ] Password trống → show error
- [ ] Wrong credentials → show error message
- [ ] Invalid OTP → show error, clear inputs
- [ ] Network error → show error message

### Test 7: Edge Cases
- [ ] Click Back từ OTP → quay về login
- [ ] Paste OTP code → auto fill + submit
- [ ] Countdown timer → đếm từ 60 → 0
- [ ] Resend button → hiện sau 60s
- [ ] Refresh page → không crash

## 📊 Performance Tests
- [ ] OTP component render < 100ms
- [ ] No memory leaks
- [ ] No console warnings

## 🚀 How to Test Manually

### 1. Start Dev Server
```bash
cd /mnt/d/fe/fe
npm run dev
```

### 2. Open Browser
- Go to: http://localhost:5173
- Open DevTools Console (F12)

### 3. Test in Console (if you want to trigger manually)
```javascript
// In browser console, access Phaser scene
const scene = window.game.scene.getScene('Login');

// Test Vorld login
scene.RequestVorldLogin('test@example.com', 'password123');

// Check console for logs:
// 🔐 Vorld Login requested: test@example.com
```

### 4. Test OTP Component
- If backend returns requiresOTP: true
- OTP component should appear
- Try entering 6 digits
- Try paste (Ctrl+V)
- Try Back button

### 5. Check EventBus
```javascript
// In browser console
import { EventBus } from './game/EventBus';

// Listen to events
EventBus.on('vorld:show-otp', (data) => {
    console.log('OTP event received:', data);
});

EventBus.on('vorld:otp-success', (data) => {
    console.log('OTP success:', data);
});
```

## 🐛 Known Issues / Todo

- [ ] No "Login with Vorld" button in UI (methods added, but button not added to UI)
- [ ] To add button: modify Login.js create() to add btn_vorld_login
- [ ] To use: Call RequestVorldLogin instead of LoginEmail

## 📝 How to Use Vorld Auth

### Option 1: Replace existing login (recommended for testing)
In Login.js, change btn_login click handler:
```javascript
btn_login.button.on("pointerdown", () => {
    // Old: this.LoginEmail(scene, inputEmailValue, inputPasswordValue);
    // New: Use Vorld
    this.RequestVorldLogin(inputEmailValue.text, inputPasswordValue.text);
});
```

### Option 2: Add separate "Login with Vorld" button
In Login.js create() method, add:
```javascript
btn_vorld_login = this.CreateButton(
    scene,
    540,
    1427 + 114 / 2,
    "login_btn_0",
    "Login with Vorld"
);
btn_vorld_login.button.on("pointerdown", () => {
    this.RequestVorldLogin(inputEmailValue.text, inputPasswordValue.text);
});
```

## ✅ Deployment Checklist
- [x] All integration code added
- [x] No syntax errors
- [ ] Manual testing passed
- [ ] Backend API ready
- [ ] Feature flag ready (optional)
- [ ] Rollback plan ready

---

**Status:** 
- Integration: ✅ Complete
- Testing: ⏳ In Progress
- Deployment: ⏳ Pending

**Last Updated:** 2025-10-26

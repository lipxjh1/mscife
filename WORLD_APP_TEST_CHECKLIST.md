# World App MiniKit Test Checklist

## 🚀 Quick Test Checklist

### Environment Verification ✅
- [x] VITE_WORLD_APP_ID matches Developer Portal
- [x] VITE_WORLD_ID_ACTION set to 'msci-login'
- [x] VITE_WORLD_APP_URL points to correct domain
- [x] VITE_WHITELIST_ADDRESS configured

### Build Status ✅
- [x] Build completes without errors
- [x] No TypeScript compilation errors
- [x] Production build generated

### Basic Functionality Tests

#### Browser Fallback (Desktop)
- [ ] Open https://worldapp.m-sci.net in Chrome
- [ ] Verify "MỞ TRONG WORLD APP" screen appears
- [ ] Check console for MiniKit logs
- [ ] Verify no crashes or errors

#### Browser Fallback (Mobile)
- [ ] Open URL in mobile Safari/Chrome
- [ ] Verify fallback UI is responsive
- [ ] Check text readability on small screen

#### World App Detection
- [ ] Open app in World App
- [ ] Verify fallback UI NOT shown
- [ ] Check console: `MiniKit.isInstalled() = true`
- [ ] Verify game UI loads

### World ID Integration Tests

#### Verify Flow - Success Path
- [ ] Click "Verify with World ID" button
- [ ] World App popup appears
- [ ] Popup shows correct app name "MSCI GAME"
- [ ] Popup shows action "msci-login"
- [ ] Complete face/fingerprint verification
- [ ] Receive success callback
- [ ] Proof data sent to backend

#### Verify Flow - Cancel
- [ ] Start verification process
- [ ] Cancel when popup appears
- [ ] App handles cancellation gracefully
- [ ] User can retry verification

#### Verify Flow - Network Error
- [ ] Disable internet connection
- [ ] Attempt verification
- [ ] Error message displayed
- [ ] No app crash
- [ ] Can retry after reconnecting

### Wallet/Auth Tests (if implemented)

#### Wallet Connection
- [ ] Click "Connect Wallet" button
- [ ] World App auth popup appears
- [ ] Confirm authentication
- [ ] Receive wallet address
- [ ] SIWE signature generated

#### Payment Tests (if implemented)
- [ ] Initiate payment flow
- [ ] Verify payment popup details
- [ ] Confirm WLD token amount
- [ ] Verify whitelist address
- [ ] Complete transaction
- [ ] Receive transaction ID

### Error Handling Tests
- [ ] Test with invalid action ID
- [ ] Test with backend offline
- [ ] Test malformed responses
- [ ] Verify graceful error handling

### Performance Tests
- [ ] Measure initial load time (< 3s)
- [ ] Check memory usage
- [ ] Verify no memory leaks
- [ ] Test on low-end devices

## 📊 Test Results Summary

### Pass/Fail Matrix
```
Environment Setup:     ✅ PASS
Build Process:         ✅ PASS
Browser Fallback:      ⏳ PENDING
World App Init:        ⏳ PENDING
World ID Verify:       ⏳ PENDING
Wallet Auth:           ⏳ PENDING
Payment Flow:          ⏳ PENDING
Error Handling:        ⏳ PENDING
Performance:           ⏳ PENDING
```

### Critical Path Tests
1. **Must Pass for Release:**
   - World App detection
   - World ID verification
   - Error handling

2. **Important but Not Blocking:**
   - Browser fallback UI
   - Performance optimization
   - Payment flow (if implemented)

## 🛠️ Debug Commands

### Console Debugging
```javascript
// Check MiniKit status
console.log('MiniKit:', window.MiniKit);
console.log('isInstalled:', MiniKit?.isInstalled());
console.log('walletAddress:', MiniKit?.walletAddress);

// Check environment
console.log('App ID:', import.meta.env.VITE_WORLD_APP_ID);
console.log('Action:', import.meta.env.VITE_WORLD_ID_ACTION);
```

### Network Monitoring
```javascript
// Monitor API calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    console.log('🌐 API Call:', args[0]);
    const start = performance.now();
    const response = await originalFetch(...args);
    const duration = performance.now() - start;
    console.log(`⏱️ Response: ${response.status} (${duration.toFixed(2)}ms)`);
    return response;
};
```

## 📱 Device Test Setup

### Required Devices
- [ ] iPhone (iOS 16+) with World App
- [ ] Android (12+) with World App
- [ ] Desktop browser for fallback testing

### World App Version
- [ ] Using latest World App version
- [ ] User logged into World App
- [ ] Device has internet connection

### Test Accounts
- [ ] World ID verified account
- [ ] Account with WLD balance (for payment tests)

## 📝 Test Notes Template

```
Test Date: ___________
Device: _______________
World App Version: ___
Tester: ______________

Results:
- Browser Fallback: [PASS/FAIL] - Notes: _________
- World App Load: [PASS/FAIL] - Notes: __________
- World ID Verify: [PASS/FAIL] - Notes: _________
- Overall Status: [READY/NEEDS WORK]

Issues Found:
1. ________________________________________________
2. ________________________________________________

Screenshots:
- test-results/browser-fallback.png
- test-results/world-app-ui.png
- test-results/verify-popup.png
```

## 🎯 Success Criteria

### Release Ready When:
- [ ] All critical tests pass
- [ ] No blocking issues
- [ ] World ID verification works reliably
- [ ] Error handling is robust
- [ ] Performance acceptable

### Launch Checklist Final:
- [ ] Code reviewed and approved
- [ ] All tests passed
- [ ] Documentation updated
- [ ] Monitoring in place
- [ ] Rollback plan ready
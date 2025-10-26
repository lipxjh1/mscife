# Vorld Auth Module

Module đơn giản cho Vorld authentication.

## 📦 Cấu Trúc

```
src/modules/vorld-auth/
├── index.js       (150 lines)  ← Service + exports
├── OTPInput.jsx   (270 lines)  ← Component + inline styles
└── README.md      (này)        ← Documentation
```

**Total:** 3 files, ~420 lines

## 🚀 Sử Dụng

### 1. Import Module

```javascript
// From App.jsx (src/)
import vorldAuth, { OTPInput } from './modules/vorld-auth';

// From Login.js (src/game/scenes/)
import vorldAuth from '../../../modules/vorld-auth';
```

### 2. Login với Email/Password

```javascript
const result = await vorldAuth.login('user@example.com', 'password123');

if (result.success) {
  if (result.needsOTP) {
    // Show OTP component
    console.log('OTP required');
  } else {
    // Login success, tokens saved
    console.log('Login success without OTP');
  }
} else {
  // Show error
  console.error('Login failed:', result.error);
}
```

### 3. Verify OTP

```javascript
const result = await vorldAuth.verifyOTP('user@example.com', '123456');

if (result.success) {
  // Tokens saved to sessionStorage
  console.log('OTP verified, user:', result.user);
  // Navigate to game
} else {
  console.error('OTP verification failed:', result.error);
}
```

### 4. Render OTP Component

```javascript
import { OTPInput } from './modules/vorld-auth';

function App() {
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState('');

  const handleVerifyOTP = async (otp) => {
    const result = await vorldAuth.verifyOTP(email, otp);
    
    if (result.success) {
      setShowOTP(false);
      // Navigate to game
    } else {
      throw new Error(result.error);
    }
  };

  return (
    <>
      {showOTP && (
        <OTPInput
          email={email}
          onVerify={handleVerifyOTP}
          onBack={() => setShowOTP(false)}
        />
      )}
    </>
  );
}
```

## 🎮 Phaser Integration

### Login Scene (src/game/scenes/Login.js)

```javascript
import { EventBus } from '../EventBus';
import vorldAuth from '../../../modules/vorld-auth';

// In RequestLogin function
async RequestLogin(email, password) {
  const result = await vorldAuth.login(email, password);
  
  if (result.success) {
    if (result.needsOTP) {
      // Emit event to show OTP
      EventBus.emit('vorld:show-otp', { email });
    } else {
      // Login success, go to Home
      this.scene.start('Home');
    }
  } else {
    // Show error
    console.error('Login error:', result.error);
  }
}
```

### App.jsx (React)

```javascript
import { EventBus } from './game/EventBus';
import vorldAuth, { OTPInput } from './modules/vorld-auth';

function App() {
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOTPEmail] = useState('');

  useEffect(() => {
    // Listen for OTP event from Phaser
    EventBus.on('vorld:show-otp', (data) => {
      setOTPEmail(data.email);
      setShowOTP(true);
    });

    return () => EventBus.removeListener('vorld:show-otp');
  }, []);

  const handleVerifyOTP = async (otp) => {
    const result = await vorldAuth.verifyOTP(otpEmail, otp);
    
    if (result.success) {
      setShowOTP(false);
      // Emit success to Phaser
      EventBus.emit('vorld:otp-success', { user: result.user });
    } else {
      throw new Error(result.error);
    }
  };

  return (
    <>
      <PhaserGame ref={phaserRef} />
      
      {showOTP && (
        <OTPInput
          email={otpEmail}
          onVerify={handleVerifyOTP}
          onBack={() => setShowOTP(false)}
        />
      )}
    </>
  );
}
```

## 📝 API Reference

### vorldAuth.login(email, password)

**Returns:** `Promise<Object>`

```javascript
{
  success: boolean,
  needsOTP: boolean,
  data: object,
  error?: string
}
```

### vorldAuth.verifyOTP(email, otp)

**Returns:** `Promise<Object>`

```javascript
{
  success: boolean,
  user?: object,
  tokens?: {
    accessToken: string,
    refreshToken: string
  },
  error?: string
}
```

### vorldAuth.getProfile()

**Returns:** `Promise<Object>`

```javascript
{
  success: boolean,
  data?: object,
  error?: string
}
```

### vorldAuth.checkStatus()

**Returns:** `Promise<Object>`

```javascript
{
  success: boolean,
  data?: object,
  error?: string
}
```

## 🔧 Backend API

Module sử dụng các endpoints:

- `POST /api/vorld/login` - Login với email/password
- `POST /api/vorld/verify-otp` - Verify OTP code
- `GET /api/vorld/profile` - Get user profile
- `GET /api/vorld/status` - Check service status

## ✨ Features

- ✅ 6-digit OTP input
- ✅ Auto-focus next input
- ✅ Auto-submit khi đủ 6 số
- ✅ Paste support (Ctrl+V)
- ✅ Countdown timer (60s)
- ✅ Resend OTP button
- ✅ Error handling
- ✅ Loading states
- ✅ Inline styles (match codebase)
- ✅ Mobile responsive

## 📝 Changelog

### v1.0.0 (2025-10-26)
- ✅ Initial release
- ✅ Service layer với 4 methods
- ✅ OTP component với inline styles
- ✅ Full Phaser integration support
- ✅ Token management (sessionStorage)
- ✅ Documentation

## 🐛 Troubleshooting

### Import không work
- Kiểm tra relative path đúng chưa
- Không dùng @ alias (dùng ./ hoặc ../)

### OTP component không hiện
- Check showOTP state
- Check zIndex conflicts
- Verify component render

### API calls fail
- Check backend đang chạy
- Verify endpoints /api/vorld/*
- Check network tab DevTools

---

**Module Version:** 1.0.0  
**Last Updated:** 2025-10-26  
**Maintained by:** MSCI Dev Team

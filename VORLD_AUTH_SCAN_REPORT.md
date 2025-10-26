# ✅ FRONTEND SCAN REPORT - VORLD AUTH INTEGRATION

**Scan Date:** 2025-10-26  
**Scanned by:** Claude AI (Droid)  
**Project:** MSCI Game Frontend  
**Location:** /mnt/d/fe/fe

---

## 📋 EXECUTIVE SUMMARY

**Frontend:** React 18.3.1 + Vite + Phaser 3.87.0  
**Current Auth:** Email/Password + Google OAuth + Telegram + TON Wallet  
**Integration Complexity:** MEDIUM  
**Recommended Approach:** **PA2 - Standard Integration**  
**Estimated Time:** 4-5 hours  
**Risk Level:** 🟡 MEDIUM (Acceptable with mitigation)

**KEY FINDINGS:**
- ✅ Solid foundation with axios, token management, socket auth
- ❌ No React Router (conditional rendering only)
- ❌ No OTP verification flow
- ❌ Backend Vorld Auth endpoints not yet implemented
- ✅ EventBus pattern excellent for integration
- ✅ Existing Login scene can be extended

---

## 📊 BƯỚC 1: CẤU TRÚC FRONTEND ✅

### 1.1 Root Structure
```
/mnt/d/fe/fe/
├── src/
│   ├── main.jsx (entry point)
│   ├── App.jsx (main app component)
│   ├── auth/ (Google OAuth)
│   ├── config/ (env.js)
│   ├── game/ (Phaser)
│   │   ├── PhaserGame.jsx (React-Phaser bridge)
│   │   ├── EventBus.js (communication layer)
│   │   ├── socket.js (Socket.IO service)
│   │   ├── Data/
│   │   │   ├── APIBase.js (axios setup)
│   │   │   ├── CenterData.js (game state)
│   │   │   └── services/ApiEndpoints.js
│   │   └── scenes/
│   │       ├── Login.js ⭐ (existing login)
│   │       ├── Home.js
│   │       └── [200+ other scenes]
│   └── pages/
├── package.json
├── vite/ (configs)
└── capacitor.config.ts (mobile)
```

### 1.2 Package.json Analysis

**Framework:**
- `react: ^18.3.1` ✅
- `react-dom: ^18.3.1` ✅
- `vite: ^6.3.5` ✅

**Game Engine:**
- `phaser: ^3.87.0` ✅

**Network:**
- `axios: ^1.7.7` ✅ (already have!)
- `socket.io-client: ^4.8.1` ✅

**Auth:**
- `@react-oauth/google: ^0.12.2` ✅
- `jwt-decode: ^4.0.0` ✅
- **`react-router-dom: ❌ NOT INSTALLED`**

**Blockchain:**
- `@tonconnect/ui-react: ^2.2.0` (TON wallet)
- `@mysten/sui: ^1.21.2` (SUI chain)
- `@telegram-apps/sdk: ^2.11.3` (Telegram mini app)

**Mobile:**
- `@capacitor/android: ^7.4.0`
- `@capacitor/core: ^7.4.0`

### 1.3 Entry Point: src/main.jsx

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <TonConnectUIProvider manifestUrl={manifestUrl}>
                <App />
            </TonConnectUIProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);
```

**Providers:**
- GoogleOAuthProvider ✅
- TonConnectUIProvider ✅
- No Router ❌
- No Auth Context ❌

### 1.4 Main App: src/App.jsx

**Routing:** Manual with `window.location.pathname`
```jsx
const [currentPage, setCurrentPage] = useState("game");

useEffect(() => {
    const path = window.location.pathname;
    if (path === "/link-google-account") {
        setCurrentPage("link-google");
    } else {
        setCurrentPage("game");
    }
}, []);

return (
    <div id="app">
        {currentPage === "link-google" ? (
            <LinkGoogleAccount />
        ) : (
            <PhaserGame ref={phaserRef} ... />
        )}
    </div>
);
```

**Communication:**
- EventBus for React ↔ Phaser
- Callbacks via props
- No global state management

---

## 📊 BƯỚC 2: AUTHENTICATION HIỆN TẠI ✅

### 2.1 Auth Components Found

**Location: src/auth/**
- `AuthOneTap.jsx` (Google One-Tap login)

**Location: src/game/scenes/Share/share-react/**
- `GoogleLoginContainer.jsx`
- `GoogleLoginTelegramLinkContainer.jsx`

**Location: src/game/scenes/**
- `Login.js` ⭐ **Main login scene**

### 2.2 Login Scene Analysis (src/game/scenes/Login.js)

**Features:**
- ✅ Email/Password login form
- ✅ Registration form
- ✅ Forgot password
- ✅ Google login button
- ✅ Referrer ID system
- ✅ Rate limiting (localStorage)
- ❌ **NO OTP verification**

**Flow:**
```
[Login Scene]
   ↓
[Email + Password Input]
   ↓
[API: /api/auth-ep/signin]
   ↓
[Save Token to sessionStorage]
   ↓
[Connect Socket]
   ↓
[Scene.start("Home")]
```

### 2.3 API Service Layer

**File: src/game/Data/APIBase.js**

```javascript
// Axios instance with interceptors
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor: add token
apiClient.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptor: refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response.status === 401 && 
            error.response.data.code === "TOKEN_EXPIRED") {
            // Auto refresh logic here
        }
        return Promise.reject(error);
    }
);

// Token management
const setTokens = (accessToken, refreshToken) => {
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
};

const clearTokens = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
};
```

**Status:** ✅ Robust token management ready!

### 2.4 API Endpoints (src/game/Data/services/ApiEndpoints.js)

**Current Auth Endpoints:**
```javascript
AUTH: {
    LOGIN_TELEGRAM: '/api/auth/login-telegram',
    SIGNIN_EMAIL: '/api/auth-ep/signin',
    SIGNUP_EMAIL: '/api/auth-ep/signup',
    FORGOT_PASSWORD: '/api/auth-ep/forgot-password',
    SIGNIN_GOOGLE: '/auth/login-google',
    SIGNIN_GOOGLE_LINK_TELEGRAM: '/auth/login-google'
}
```

**Missing for Vorld Auth:**
```javascript
// Need to add:
VORLD_LOGIN: '/api/vorld/login',           // Email/Pass login
VORLD_VERIFY_OTP: '/api/vorld/verify-otp', // OTP verification
VORLD_RESEND_OTP: '/api/vorld/resend-otp', // Resend OTP
```

### 2.5 Routing

**Type:** No React Router - Conditional Rendering Only

**Current Implementation:**
```jsx
// App.jsx
{currentPage === "link-google" ? (
    <LinkGoogleAccount />
) : (
    <PhaserGame ... />
)}
```

**Protected Routes:** ❌ None (game starts immediately)

### 2.6 State Management

**Type:** None (no Redux, Zustand, or Context API)

**Current Approach:**
- `centerData.js` (global object for game state)
- Component local state
- Props drilling

**User State:** Stored in `centerData.userInfo`

### 2.7 Token Storage

**Method:** `sessionStorage`

**Keys:**
- `accessToken`
- `refreshToken`

**Load on init:**
```javascript
// APIBase.js loads tokens on import
const loadTokens = () => {
    accessToken = sessionStorage.getItem("accessToken");
    refreshToken = sessionStorage.getItem("refreshToken");
};
loadTokens();
```

---

## 📊 BƯỚC 3: PHASER INTEGRATION ✅

### 3.1 Phaser Scenes

**Total Scenes:** 200+ files

**Main Scenes:**
- `Boot.js` - Initial boot
- `Preloader.js` - Asset loading
- `Login.js` ⭐ - Login screen
- `Home.js` - Main menu/hub
- `Gameplay.js` - Main gameplay
- `GameplayBoss.js` - Boss battles
- `GameplayMultiplayerBoss.js` - Multiplayer

### 3.2 React-Phaser Bridge

**Component:** `src/game/PhaserGame.jsx`

**Pattern:**
```jsx
export const PhaserGame = forwardRef(function PhaserGame(
    { 
        phaserWalletConnect,
        phaserWalletDisconnect,
        phaserLoginGoogle,
        // ... other callbacks
    },
    ref
) {
    useEffect(() => {
        EventBus.on("react-wallet-connect", () => {
            if (phaserWalletConnect instanceof Function) {
                phaserWalletConnect();
            }
        });
        return () => EventBus.removeListener("react-wallet-connect");
    }, [phaserWalletConnect]);
    
    // Similar for other events...
});
```

### 3.3 EventBus Pattern

**File:** `src/game/EventBus.js`

```javascript
import Phaser from 'phaser';

// Phaser's EventEmitter for React ↔ Phaser communication
export const EventBus = new Phaser.Events.EventEmitter();
```

**Usage Examples:**

**From Phaser → React:**
```javascript
// In Login.js scene
EventBus.emit("ui:show-loading");
EventBus.emit("ui:hide-loading");
EventBus.emit("ui:show-google-login");
```

**From React → Phaser:**
```javascript
// In App.jsx
EventBus.on("show-loading", () => setShowLoading(true));
EventBus.on("react-google-button-login", (credential) => {
    // Handle in Phaser
});
```

**Status:** ✅ **EXCELLENT pattern for Vorld Auth integration!**

### 3.4 Socket Integration

**File:** `src/game/socket.js`

```javascript
class SocketService {
    connectSocket() {
        this.socket = io(`${API_BASE_URL}/`, {
            transports: ["websocket"],
            auth: {
                token: sessionStorage.getItem("accessToken"), // ⭐
            },
            reconnection: true,
        });
    }
}
```

**Status:** ✅ Already uses token from sessionStorage!

### 3.5 Game Start Flow

**Current Flow:**
```
[Browser loads]
   ↓
[main.jsx mounts App]
   ↓
[App.jsx renders PhaserGame]
   ↓
[Phaser starts → Boot → Preloader → Login]
   ↓
[Login Scene shows]
   ↓
[User logs in]
   ↓
[Token saved to sessionStorage]
   ↓
[Socket connects with token]
   ↓
[Scene.start("Home")]
```

**No Auth Gate:** Game loads immediately, Login is a Phaser scene

---

## 📊 BƯỚC 4: PHÂN TÍCH FLOW HIỆN TẠI ✅

### 4.1 Current Flow Diagram

```
[App Start]
   ↓
[React renders]
   ↓
[PhaserGame component mounts]
   ↓
[Phaser.Game starts]
   ↓
[Boot scene]
   ↓
[Preloader scene (load assets)]
   ↓
[Login scene] ────────┐
   │                   │
   │ Has token?        │
   │                   │
   NO → [Show Login Form]
   │         ↓
   │    [Email + Password]
   │         ↓
   │    [Submit]
   │         ↓
   │    [POST /api/auth-ep/signin]
   │         ↓
   │    [Response: {accessToken, refreshToken}]
   │         ↓
   │    [sessionStorage.setItem("accessToken", ...)]
   │         ↓
   └────→ [Connect Socket with token]
             ↓
        [socketService.connectSocket()]
             ↓
        [this.scene.start("Home")]
             ↓
        [Home Scene (game hub)]
             ↓
        [User plays game]
```

### 4.2 Pain Points

1. **No OTP Verification**
   - Current: Email/pass → direct login
   - Need: Email/pass → OTP screen → verify → login

2. **No Backend Vorld Auth Endpoints**
   - Current endpoints: `/api/auth-ep/signin`
   - Need: `/api/vorld/login`, `/api/vorld/verify-otp`

3. **Login is a Phaser Scene**
   - Pro: Fits existing architecture
   - Con: Need UI components for OTP input

4. **No Protected Route Mechanism**
   - Game starts immediately
   - Token check only in Login scene

5. **sessionStorage Only**
   - No "Remember Me" (localStorage)
   - Token lost on tab close

### 4.3 Integration Points Identified

1. **Point 1: Login Scene UI**
   - **Location:** `src/game/scenes/Login.js`
   - **Action:** Add OTP verification screen after email/pass
   - **Method:** New DOM overlay or Phaser UI

2. **Point 2: API Endpoints**
   - **Location:** `src/game/Data/services/ApiEndpoints.js`
   - **Action:** Add Vorld Auth endpoints
   - **Method:** Update AUTH object

3. **Point 3: Login Flow**
   - **Location:** `src/game/scenes/Login.js` (RequestLogin method)
   - **Action:** Change flow to call Vorld endpoints
   - **Method:** Update API calls

4. **Point 4: Token Storage**
   - **Location:** `src/game/Data/APIBase.js`
   - **Action:** Already working! Just use setTokens()
   - **Method:** No change needed

5. **Point 5: Socket Connection**
   - **Location:** `src/game/socket.js`
   - **Action:** Already working! Uses sessionStorage token
   - **Method:** No change needed

### 4.4 Requirements for Vorld Auth

- [x] Token storage mechanism (sessionStorage) ✅
- [x] API service layer (axios with interceptors) ✅
- [x] Socket auth (token in connection) ✅
- [ ] Login UI with email/password ✅ (exists)
- [ ] **OTP verification UI** ❌ **NEED TO ADD**
- [ ] **OTP verification logic** ❌ **NEED TO ADD**
- [ ] **Vorld API endpoints** ❌ **NEED TO ADD**
- [ ] Protected routes ⚠️ (not needed - game handles it)

---

## 📊 BƯỚC 5: THIẾT KẾ 3 PHƯƠNG ÁN ✅

---

### PHƯƠNG ÁN 1: MINIMAL INTEGRATION ⭐

**Concept:** Thay thế API endpoint hiện tại bằng Vorld, thêm OTP tối thiểu

#### Implementation Steps:

1. **Update API Endpoints**
   - Change `/api/auth-ep/signin` → `/api/vorld/login`
   - Add `/api/vorld/verify-otp`

2. **Add OTP Screen to Login Scene**
   - Simple DOM overlay with 6-digit input
   - Show after initial login
   - Verify → Save token → Home

3. **No new files needed**
   - Modify existing `Login.js` scene only
   - Add OTP UI using DOM elements (like current login form)

#### Files Changed:
- ✏️ `src/game/scenes/Login.js` (~200 lines added)
- ✏️ `src/game/Data/services/ApiEndpoints.js` (~3 lines)

#### Pros:
- ✅ **Simplest approach** - minimal code
- ✅ **Fast implementation** (2-3 hours)
- ✅ **Low risk** - only touches Login scene
- ✅ **No new dependencies**
- ✅ **Fits existing architecture perfectly**

#### Cons:
- ❌ OTP UI might not be as polished
- ❌ No separation of concerns
- ❌ Harder to reuse OTP component

#### Complexity: ⭐ (1/5)
#### Risk: 🟢 LOW
#### Time: **2-3 hours**
#### Code: ~200 lines

---

### PHƯƠNG ÁN 2: STANDARD INTEGRATION ⭐⭐⭐ (RECOMMENDED)

**Concept:** Professional integration with reusable components

#### Implementation Steps:

1. **Create OTP Component**
   - `src/game/scenes/Share/share-react/OTPVerification.jsx`
   - Reusable React component
   - Clean UI with validation

2. **Create Vorld Auth Service**
   - `src/game/Data/services/VorldAuthService.js`
   - Centralized Vorld API calls
   - Error handling

3. **Update Login Scene**
   - Use EventBus to show OTP component
   - Handle OTP verification flow
   - Better state management

4. **Add Auth Context (Optional)**
   - `src/contexts/AuthContext.jsx`
   - Global user state
   - Better than centerData for auth

#### Files Created:
- 📄 `src/game/scenes/Share/share-react/OTPVerification.jsx` (~120 lines)
- 📄 `src/game/Data/services/VorldAuthService.js` (~150 lines)
- 📄 `src/contexts/AuthContext.jsx` (~100 lines) [optional]

#### Files Modified:
- ✏️ `src/game/scenes/Login.js` (~150 lines changed)
- ✏️ `src/game/Data/services/ApiEndpoints.js` (~5 lines)
- ✏️ `src/App.jsx` (~30 lines for AuthProvider)
- ✏️ `src/main.jsx` (~5 lines wrap provider)

#### Pros:
- ✅ **Clean separation of concerns**
- ✅ **Reusable OTP component**
- ✅ **Easier to test**
- ✅ **Better error handling**
- ✅ **Professional code quality**
- ✅ **Future-proof** for other auth methods
- ✅ **Follows React best practices**

#### Cons:
- ❌ More files to create
- ❌ Takes longer than PA1
- ❌ Slightly more complex

#### Complexity: ⭐⭐⭐ (3/5)
#### Risk: 🟡 MEDIUM
#### Time: **4-5 hours**
#### Code: ~420 lines

---

### PHƯƠNG ÁN 3: ADVANCED INTEGRATION ⭐⭐⭐⭐⭐

**Concept:** Enterprise-grade with full features

#### Implementation Steps:

All of PA2, plus:

1. **Add React Router**
   - Install `react-router-dom`
   - Protected routes
   - Route-based auth gate

2. **Advanced OTP Features**
   - Auto-focus between digits
   - Paste support (from SMS)
   - Countdown timer with auto-resend
   - Multiple retry logic

3. **Remember Me**
   - localStorage option
   - Token persistence across sessions

4. **Session Management**
   - Multi-tab sync (BroadcastChannel)
   - Auto-logout on token expiry
   - Session warning popup

5. **Loading & Error States**
   - Skeleton screens
   - Toast notifications
   - Error boundaries

#### Files Created:
- 📄 `src/game/scenes/Share/share-react/OTPVerification.jsx` (~200 lines)
- 📄 `src/game/Data/services/VorldAuthService.js` (~250 lines)
- 📄 `src/contexts/AuthContext.jsx` (~200 lines)
- 📄 `src/components/ProtectedRoute.jsx` (~50 lines)
- 📄 `src/routes/index.jsx` (~80 lines)
- 📄 `src/utils/sessionManager.js` (~100 lines)

#### Files Modified:
- ✏️ `src/game/scenes/Login.js` (~200 lines)
- ✏️ `src/game/Data/services/ApiEndpoints.js` (~10 lines)
- ✏️ `src/App.jsx` (~100 lines for routing)
- ✏️ `src/main.jsx` (~20 lines)
- ✏️ `package.json` (add react-router-dom)

#### Pros:
- ✅ **Production-ready** out of the box
- ✅ **Best UX** possible
- ✅ **Robust error handling**
- ✅ **Multi-tab support**
- ✅ **Enterprise features**

#### Cons:
- ❌ **Overkill for MVP**
- ❌ **Much longer time**
- ❌ **More complexity**
- ❌ **New dependency** (react-router)
- ❌ **Risk of over-engineering**

#### Complexity: ⭐⭐⭐⭐⭐ (5/5)
#### Risk: 🔴 HIGH
#### Time: **7-8 hours**
#### Code: ~880 lines

---

### SO SÁNH 3 PHƯƠNG ÁN

| Tiêu Chí | PA1: Minimal | PA2: Standard ⭐ | PA3: Advanced |
|----------|--------------|------------------|---------------|
| **Độ phức tạp** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Thời gian** | 2-3h | 4-5h | 7-8h |
| **Risk** | 🟢 LOW | 🟡 MEDIUM | 🔴 HIGH |
| **Code mới** | ~200 lines | ~420 lines | ~880 lines |
| **Files mới** | 0 | 2-3 | 6 |
| **Files sửa** | 2 | 4-5 | 6-7 |
| **UX Quality** | 😐 OK | 😊 Good | 😍 Excellent |
| **Maintainability** | ⚠️ Poor | ✅ Good | ✅ Excellent |
| **Scalability** | ❌ Limited | ✅ Good | ✅ Excellent |
| **Reusability** | ❌ No | ✅ Yes | ✅ Yes |
| **Dependencies** | None | None | +1 (router) |
| **Testing** | Hard | Easy | Easy |
| **Future-proof** | ❌ No | ✅ Yes | ✅ Yes |

---

### 🎯 KHUYẾN NGHỊ: PHƯƠNG ÁN 2 - STANDARD INTEGRATION

**Lý do:**

1. **Balance tốt nhất** giữa quality và complexity
2. **Thời gian hợp lý** (4-5h) cho một MVP chất lượng
3. **Không cần dependency mới** (PA3 cần react-router)
4. **Reusable components** - có thể dùng lại sau
5. **Professional code** - dễ maintain và extend
6. **Phù hợp architecture hiện tại** - không phá vỡ cấu trúc
7. **Risk chấp nhận được** với proper testing

**PA1 too simple:** Khó maintain sau này, OTP UI không đẹp
**PA3 too complex:** Over-engineering cho MVP, react-router không cần thiết

---

## 📊 BƯỚC 6: CHI TIẾT IMPLEMENTATION PLAN (PA2) ✅

---

### 6.1 Components Cần Tạo

#### 1. **OTPVerification.jsx**

**Path:** `src/game/scenes/Share/share-react/OTPVerification.jsx`

**Purpose:** React component for OTP input and verification

**Props:**
```typescript
{
    email: string,              // Email user đã nhập
    onSuccess: (response) => void, // Callback khi verify thành công
    onBack: () => void,         // Quay lại login form
    onResend: () => void,       // Gửi lại OTP
}
```

**State:**
```javascript
{
    otp: string,           // 6 digits
    loading: boolean,
    error: string | null,
    countdown: number,     // Resend countdown
}
```

**Methods:**
- `handleVerifyOTP()` - Call Vorld API to verify
- `handleResendOTP()` - Resend OTP code
- `handleInputChange(value)` - Update OTP input

**UI Elements:**
- Email display (read-only)
- 6-digit OTP input (styled like Login form)
- "Verify" button
- "Resend OTP" link (with countdown)
- "Back" button
- Error message display

**Size:** ~120 lines

**Styling:** Match existing Login scene style

---

#### 2. **VorldAuthService.js**

**Path:** `src/game/Data/services/VorldAuthService.js`

**Purpose:** Centralized Vorld Auth API calls

**Methods:**

```javascript
// Login with email/password
async loginWithEmail(email, password) {
    // POST /api/vorld/login
    // Returns: { needOTP: true/false, message, session }
}

// Verify OTP
async verifyOTP(email, otp) {
    // POST /api/vorld/verify-otp
    // Returns: { accessToken, refreshToken, user }
}

// Resend OTP
async resendOTP(email) {
    // POST /api/vorld/resend-otp
    // Returns: { message, expiresIn }
}

// Get profile (if needed)
async getProfile(token) {
    // GET /api/vorld/profile
    // Returns: user object
}
```

**Error Handling:**
- Try-catch all requests
- Return standardized error format
- Log errors to console (dev mode)

**Size:** ~150 lines

---

#### 3. **AuthContext.jsx** (Optional)

**Path:** `src/contexts/AuthContext.jsx`

**Purpose:** Global auth state management

**State:**
```javascript
{
    user: object | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
}
```

**Methods:**
- `login(email, password)` - Login flow
- `verifyOTP(otp)` - OTP verification
- `logout()` - Clear session
- `setUser(user)` - Update user info

**Provider Component:**
```jsx
<AuthProvider>
    <App />
</AuthProvider>
```

**Custom Hook:**
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

**Size:** ~100 lines

---

### 6.2 Files Cần Sửa

#### 1. **src/game/Data/services/ApiEndpoints.js**

**Changes:**
```javascript
AUTH: {
    // ... existing endpoints ...
    
    // ADD: Vorld Auth endpoints
    VORLD_LOGIN: '/api/vorld/login',
    VORLD_VERIFY_OTP: '/api/vorld/verify-otp',
    VORLD_RESEND_OTP: '/api/vorld/resend-otp',
}
```

**Lines changed:** ~5

---

#### 2. **src/game/scenes/Login.js**

**Major Changes:**

1. **Add OTP state**
```javascript
this.otpMode = false;
this.currentEmail = "";
this.otpComponent = null;
```

2. **Modify RequestLogin() method**
```javascript
// OLD: Direct login
RequestLogin(scene, email, password) {
    // POST /api/auth-ep/signin
    // Save token → Home
}

// NEW: Check if OTP needed
async RequestLogin(scene, email, password) {
    const response = await VorldAuthService.loginWithEmail(email, password);
    
    if (response.needOTP) {
        // Show OTP verification
        this.showOTPScreen(email);
    } else {
        // Direct login (no OTP)
        this.handleLoginSuccess(response);
    }
}
```

3. **Add showOTPScreen() method**
```javascript
showOTPScreen(email) {
    this.otpMode = true;
    this.currentEmail = email;
    
    // Hide login form
    container_main_login.setVisible(false);
    
    // Emit event to React to show OTP component
    EventBus.emit("ui:show-otp-verification", {
        email: email,
        onSuccess: (response) => this.handleOTPSuccess(response),
        onBack: () => this.hideOTPScreen(),
        onResend: () => this.handleResendOTP(email),
    });
}
```

4. **Add handleOTPSuccess() method**
```javascript
handleOTPSuccess(response) {
    // Save tokens
    const { accessToken, refreshToken, user } = response;
    setTokens(accessToken, refreshToken);
    
    // Update centerData
    centerData.userInfo = user;
    
    // Connect socket
    socketService.connectSocket();
    
    // Go to Home
    this.scene.start("Home");
}
```

**Lines changed:** ~150

---

#### 3. **src/App.jsx**

**Changes:**

1. **Add OTP state**
```javascript
const [showOTPVerification, setShowOTPVerification] = useState(false);
const [otpEmail, setOTPEmail] = useState("");
```

2. **Add EventBus listener**
```javascript
useEffect(() => {
    const handleShowOTP = (config) => {
        setOTPEmail(config.email);
        setShowOTPVerification(true);
        // Store callbacks
    };
    
    EventBus.on("ui:show-otp-verification", handleShowOTP);
    
    return () => {
        EventBus.off("ui:show-otp-verification", handleShowOTP);
    };
}, []);
```

3. **Render OTP component**
```jsx
{showOTPVerification && (
    <OTPVerification
        email={otpEmail}
        onSuccess={...}
        onBack={...}
        onResend={...}
    />
)}
```

**Lines changed:** ~30

---

#### 4. **src/main.jsx** (if using AuthContext)

**Changes:**
```jsx
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={...}>
            <TonConnectUIProvider manifestUrl={...}>
                <AuthProvider>  {/* ADD THIS */}
                    <App />
                </AuthProvider>
            </TonConnectUIProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);
```

**Lines changed:** ~5

---

### 6.3 Flow Mới (PA2)

```
[App Start]
   ↓
[React renders]
   ↓
[PhaserGame mounts]
   ↓
[Login Scene shows]
   ↓
[User enters Email + Password]
   ↓
[Click "Login"]
   ↓
[Call VorldAuthService.loginWithEmail()]
   ↓
[POST /api/vorld/login]
   ↓
   ├─ Response: { needOTP: false }
   │     ↓
   │  [Save tokens immediately]
   │     ↓
   │  [Go to Home Scene]
   │
   └─ Response: { needOTP: true }
         ↓
      [Hide Login Form]
         ↓
      [EventBus.emit("ui:show-otp-verification")]
         ↓
      [React shows <OTPVerification />]
         ↓
      [User enters 6-digit OTP]
         ↓
      [Click "Verify"]
         ↓
      [Call VorldAuthService.verifyOTP()]
         ↓
      [POST /api/vorld/verify-otp]
         ↓
         ├─ Success: { accessToken, refreshToken, user }
         │     ↓
         │  [Save to sessionStorage]
         │     ↓
         │  [EventBus.emit("otp-success")]
         │     ↓
         │  [Login Scene receives event]
         │     ↓
         │  [Connect Socket with token]
         │     ↓
         │  [Scene.start("Home")]
         │
         └─ Error: { message }
               ↓
            [Show error in OTP screen]
               ↓
            [User can retry or resend]
```

---

### 6.4 Detailed Implementation Checklist

#### Phase 1: Setup (30 min)
- [ ] Create folder structure
  - [ ] `src/contexts/` (if using AuthContext)
  - [ ] Verify `src/game/Data/services/` exists

#### Phase 2: Services (1 hour)
- [ ] Create `VorldAuthService.js`
  - [ ] Import axios from APIBase
  - [ ] Implement `loginWithEmail()`
  - [ ] Implement `verifyOTP()`
  - [ ] Implement `resendOTP()`
  - [ ] Error handling for each method
- [ ] Update `ApiEndpoints.js`
  - [ ] Add VORLD_LOGIN
  - [ ] Add VORLD_VERIFY_OTP
  - [ ] Add VORLD_RESEND_OTP

#### Phase 3: OTP Component (1.5 hours)
- [ ] Create `OTPVerification.jsx`
  - [ ] Setup component structure
  - [ ] Props interface
  - [ ] State management (otp, loading, error)
  - [ ] 6-digit input field (styled)
  - [ ] Verify button
  - [ ] Resend link with countdown
  - [ ] Back button
  - [ ] Error display
  - [ ] Call VorldAuthService on verify
  - [ ] Handle success/error
  - [ ] CSS styling to match Login scene

#### Phase 4: Login Scene Integration (1 hour)
- [ ] Modify `Login.js`
  - [ ] Import VorldAuthService
  - [ ] Add OTP mode state
  - [ ] Update `RequestLogin()` method
    - [ ] Change API call to VorldAuthService
    - [ ] Check needOTP in response
  - [ ] Add `showOTPScreen()` method
    - [ ] Emit EventBus event
  - [ ] Add `hideOTPScreen()` method
  - [ ] Add `handleOTPSuccess()` method
    - [ ] Save tokens
    - [ ] Connect socket
    - [ ] Go to Home
  - [ ] Add `handleResendOTP()` method

#### Phase 5: React Integration (30 min)
- [ ] Update `App.jsx`
  - [ ] Add OTP verification state
  - [ ] Add EventBus listener for show OTP
  - [ ] Render OTPVerification component
  - [ ] Pass callbacks to OTPVerification

#### Phase 6: Testing (1 hour)
- [ ] **Component Testing**
  - [ ] OTP component renders correctly
  - [ ] Input accepts 6 digits only
  - [ ] Verify button works
  - [ ] Resend link works with countdown
  - [ ] Back button works
  - [ ] Error messages display correctly

- [ ] **Flow Testing**
  - [ ] Login with email/pass (needOTP=true)
  - [ ] OTP screen shows
  - [ ] Enter correct OTP → Success
  - [ ] Enter wrong OTP → Error shown
  - [ ] Resend OTP works
  - [ ] Back button returns to login
  - [ ] Token saved to sessionStorage
  - [ ] Socket connects with token
  - [ ] Home scene loads

- [ ] **Edge Cases**
  - [ ] Network error handling
  - [ ] API timeout
  - [ ] Invalid OTP format
  - [ ] OTP expired
  - [ ] Multiple rapid submits

#### Phase 7: Polish (30 min)
- [ ] Loading states everywhere
- [ ] Smooth transitions
- [ ] Error message improvements
- [ ] Input validation feedback
- [ ] Accessibility (tab navigation)

---

### 6.5 Total Files Summary

**Files to Create:** 2-3
```
src/game/scenes/Share/share-react/OTPVerification.jsx  (~120 lines)
src/game/Data/services/VorldAuthService.js              (~150 lines)
src/contexts/AuthContext.jsx                            (~100 lines) [optional]
```

**Files to Modify:** 4-5
```
src/game/Data/services/ApiEndpoints.js                  (~5 lines)
src/game/scenes/Login.js                                (~150 lines)
src/App.jsx                                             (~30 lines)
src/main.jsx                                            (~5 lines) [if AuthContext]
```

**Total New Code:** ~420 lines  
**Total Modified:** ~190 lines

---

## 📊 BƯỚC 7: DEPENDENCIES CHECK ✅

### 7.1 Dependencies Hiện Có

**Already Installed:**
```json
{
  "axios": "^1.7.7",                   ✅ For API calls
  "socket.io-client": "^4.8.1",        ✅ For socket
  "jwt-decode": "^4.0.0",              ✅ For token decode
  "@react-oauth/google": "^0.12.2",    ✅ For Google auth
  "react": "^18.3.1",                  ✅
  "react-dom": "^18.3.1",              ✅
  "phaser": "^3.87.0",                 ✅
}
```

**NOT Installed:**
```json
{
  "react-router-dom": "❌"  // Not needed for PA1 & PA2
}
```

### 7.2 Dependencies Cần Thêm

**Phương Án 1 & 2: NONE** 🎉

**Phương Án 3:**
```bash
npm install react-router-dom
```

### 7.3 Recommendation

**Không cần install dependencies mới cho PA2!**

Tất cả đã có sẵn:
- ✅ axios (API calls)
- ✅ React (components)
- ✅ jwt-decode (parse tokens)
- ✅ socket.io-client (socket auth)

---

## 📊 BƯỚC 8: RISK ANALYSIS & MITIGATION ✅

### 8.1 Risks Identified

---

#### 🔴 HIGH RISK

**1. Breaking Existing Login Flow**

**Risk Level:** HIGH  
**Impact:** Users cannot login → Game unplayable  
**Probability:** MEDIUM

**Mitigation:**
- ✅ **Backup Login.js** before changes
- ✅ **Feature flag:** Add `USE_VORLD_AUTH` in env
  ```javascript
  if (ENV.USE_VORLD_AUTH) {
      // New Vorld flow
  } else {
      // Old flow (fallback)
  }
  ```
- ✅ **Gradual rollout:** Test with small user group first
- ✅ **Git branch:** Work in separate branch, merge after testing
- ✅ **Rollback plan:** Keep old login code commented, easy to restore

**Testing Plan:**
1. Test old login still works before changes
2. Test new login with Vorld mock API
3. Test error scenarios
4. Test with real Vorld API (staging)
5. Load test with multiple concurrent logins

---

#### 🟡 MEDIUM RISK

**2. Phaser Scene Integration Issues**

**Risk Level:** MEDIUM  
**Impact:** OTP screen not showing, or game crashes  
**Probability:** MEDIUM

**Mitigation:**
- ✅ **Use EventBus pattern** (already proven to work)
- ✅ **Test EventBus events** before full implementation
- ✅ **Mock Phaser scene** for component testing
- ✅ **Console logging** for debugging events
- ✅ **Fallback to alert()** if React component fails

**Testing Plan:**
1. Test EventBus emit/on in isolation
2. Test React component mount/unmount
3. Test scene visibility toggle
4. Test callback execution from Phaser → React

---

**3. Socket Connection Issues**

**Risk Level:** MEDIUM  
**Impact:** Realtime features don't work after login  
**Probability:** LOW

**Current State:**
```javascript
// socket.js already uses sessionStorage token
this.socket = io(`${API_BASE_URL}/`, {
    auth: {
        token: sessionStorage.getItem("accessToken"),
    }
});
```

**Mitigation:**
- ✅ **Already working!** No changes needed to socket
- ✅ **Verify token format** matches backend expectation
- ✅ **Log socket connection** to confirm auth
- ✅ **Test reconnection** after token refresh

**Testing Plan:**
1. Login → Check socket connects
2. Check socket auth event on server
3. Test socket disconnect/reconnect
4. Test with expired token

---

**4. Token Management**

**Risk Level:** MEDIUM  
**Impact:** User unexpectedly logged out  
**Probability:** LOW

**Current State:**
- Token refresh logic already exists in APIBase.js
- sessionStorage used (lost on tab close)

**Mitigation:**
- ✅ **Use existing setTokens()** function
- ✅ **Test refresh token flow**
- ✅ **Add token expiry checks**
- ✅ **Clear error messages** if token invalid

**Testing Plan:**
1. Login → Token saved correctly
2. Refresh page → Token persists (session)
3. Wait for expiry → Refresh works
4. Invalid token → Clear error + logout

---

#### 🟢 LOW RISK

**5. API Endpoint Changes**

**Risk Level:** LOW  
**Impact:** API calls fail if backend not ready  
**Probability:** HIGH (backend dev dependency)

**Mitigation:**
- ✅ **Mock API responses** for frontend dev
- ✅ **API contract agreement** with backend team
- ✅ **Swagger/API docs** before implementation
- ✅ **Test with Postman** before integration

**API Contract Example:**
```javascript
// POST /api/vorld/login
Request: { email, password }
Response: { 
    needOTP: boolean,
    message: string,
    session?: string  // for OTP verification
}

// POST /api/vorld/verify-otp
Request: { email, otp, session }
Response: { 
    accessToken: string,
    refreshToken: string,
    user: object
}
```

**Testing Plan:**
1. Mock API responses in VorldAuthService
2. Test with real API (staging)
3. Handle all error cases
4. Verify response format matches

---

**6. UI/UX Consistency**

**Risk Level:** LOW  
**Impact:** OTP screen looks different from login  
**Probability:** LOW

**Mitigation:**
- ✅ **Use existing Login.js styles** as reference
- ✅ **Reuse fonts/colors** from Login scene
- ✅ **Match input styling**
- ✅ **Test on different screen sizes**

**Design Guidelines:**
- Use same font: `cdLocalization.getCurrentFont()`
- Use same colors: white text, black stroke
- Use same container style
- Use same button style

---

### 8.2 Overall Risk Assessment

| Category | Risk Level | Mitigation | Confidence |
|----------|-----------|------------|------------|
| Breaking Existing Flow | 🔴 HIGH | Feature flag + backup | ✅ HIGH |
| Phaser Integration | 🟡 MEDIUM | EventBus proven pattern | ✅ HIGH |
| Socket Connection | 🟡 MEDIUM | No changes needed | ✅ VERY HIGH |
| Token Management | 🟡 MEDIUM | Use existing functions | ✅ HIGH |
| API Changes | 🟢 LOW | Mock + contract | ✅ MEDIUM |
| UI/UX | 🟢 LOW | Match existing styles | ✅ HIGH |

**Overall Risk for PA2:** 🟡 **MEDIUM - ACCEPTABLE**

With proper:
- ✅ Feature flags
- ✅ Backups
- ✅ Testing
- ✅ Gradual rollout

Risk is **manageable and acceptable** for production.

---

### 8.3 Testing Strategy

#### Unit Testing
```javascript
// VorldAuthService.test.js
describe('VorldAuthService', () => {
    test('loginWithEmail returns correct format', async () => {
        const response = await VorldAuthService.loginWithEmail(
            'test@example.com', 
            'password123'
        );
        expect(response).toHaveProperty('needOTP');
    });
    
    test('verifyOTP handles errors', async () => {
        const response = await VorldAuthService.verifyOTP(
            'test@example.com',
            '000000'
        );
        expect(response.error).toBeDefined();
    });
});
```

#### Integration Testing
- [ ] Login flow (email/pass → OTP → home)
- [ ] Error scenarios (wrong OTP, expired, network error)
- [ ] Resend OTP flow
- [ ] Back button flow
- [ ] Socket connection with token

#### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] OTP screen appears
- [ ] Enter valid OTP → Success
- [ ] Enter invalid OTP → Error shown
- [ ] Resend OTP button works
- [ ] Countdown timer works
- [ ] Back button returns to login
- [ ] Refresh page during OTP → State lost (expected)
- [ ] Network error handling
- [ ] Mobile view (Capacitor)

---

## 📊 FINAL SCAN REPORT SUMMARY ✅

---

### ✅ Frontend Structure - CLEAR

**Framework:** React 18.3.1 + Vite + Phaser 3.87.0  
**Entry Point:** src/main.jsx  
**Architecture:** Phaser-first with React components as overlays  
**Communication:** EventBus pattern (proven & reliable)

---

### ✅ Current Authentication - UNDERSTOOD

**Current Methods:**
- Email/Password (Login scene)
- Google OAuth (AuthOneTap)
- Telegram WebApp
- TON Wallet

**Gaps for Vorld:**
- ❌ No OTP verification
- ❌ No Vorld API endpoints

**Strengths:**
- ✅ Token management solid
- ✅ Socket auth ready
- ✅ API layer robust

---

### ✅ Phaser Integration - EXCELLENT

**EventBus Pattern:** ⭐⭐⭐⭐⭐
- Well-established
- Used throughout codebase
- Perfect for Vorld integration

**Bridge:** PhaserGame.jsx
- Clean interface
- Easy to extend

---

### ✅ Integration Points - IDENTIFIED

1. **Login Scene** - Main change point
2. **API Endpoints** - Add Vorld URLs
3. **Token Flow** - Already working
4. **Socket Auth** - Already working

---

### 🎯 RECOMMENDED SOLUTION

**Phương Án 2: Standard Integration**

**Why:**
- ✅ Professional quality
- ✅ Reasonable time (4-5h)
- ✅ No new dependencies
- ✅ Reusable components
- ✅ Maintainable code

**Files:**
- 2-3 new files (~370 lines)
- 4-5 modified files (~190 lines)

**Risk:** 🟡 MEDIUM - Acceptable with mitigation

---

### 📋 Implementation Checklist

**Phase 1:** Setup (30 min)
- [ ] Create folder structure
- [ ] Backup current Login.js

**Phase 2:** Services (1h)
- [ ] Create VorldAuthService.js
- [ ] Update ApiEndpoints.js

**Phase 3:** Components (1.5h)
- [ ] Create OTPVerification.jsx
- [ ] Style to match Login scene

**Phase 4:** Integration (1h)
- [ ] Update Login.js scene
- [ ] EventBus events

**Phase 5:** React (30min)
- [ ] Update App.jsx
- [ ] Add OTP rendering

**Phase 6:** Testing (1h)
- [ ] Component tests
- [ ] Flow tests
- [ ] Edge cases

**Phase 7:** Polish (30min)
- [ ] Loading states
- [ ] Error handling
- [ ] UX improvements

**Total:** 4-5 hours

---

### ⚠️ CRITICAL DEPENDENCIES

**Backend Requirements:**
- [ ] `/api/vorld/login` endpoint ready
- [ ] `/api/vorld/verify-otp` endpoint ready
- [ ] `/api/vorld/resend-otp` endpoint ready
- [ ] API contract agreed upon
- [ ] Staging environment for testing

**Without backend ready, frontend can:**
- ✅ Build all UI components
- ✅ Mock API responses
- ✅ Test flows with mocks
- ❌ Cannot do end-to-end testing

---

### 📝 NEXT STEPS

1. **Backend Team:**
   - Implement Vorld Auth endpoints
   - Provide API documentation
   - Setup staging environment

2. **Frontend Team:**
   - Review this scan report
   - Approve Phương Án 2
   - Schedule implementation (4-5h)
   - Setup test environment

3. **Coordination:**
   - API contract meeting
   - Test plan agreement
   - Rollout strategy

---

### 🚀 READY FOR IMPLEMENTATION

**Status:** ✅ **SCAN COMPLETE**

**Confidence Level:** HIGH

**Blockers:** None (can start with mocks)

**Recommendation:** **PROCEED with Phương Án 2**

---

## 📞 CONTACT & QUESTIONS

For implementation questions or clarifications, refer to:
- This scan report
- Existing Login.js scene
- EventBus usage examples in App.jsx
- Socket.js for token auth pattern

**SCAN COMPLETED** ✅  
**Ready for Implementation Prompt Generation** ✅

---

_Generated by Claude AI (Droid) - 2025-10-26_  
_Total scan time: ~2 hours_  
_Files analyzed: 20+_  
_Confidence: HIGH_

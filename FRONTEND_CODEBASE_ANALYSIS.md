# Frontend Codebase Analysis - M-SCI Game

**Project**: M-SCI (Phaser 3 + React Game)  
**Analysis Date**: November 8, 2025  
**Scope**: Very Thorough - Complete Frontend Architecture

---

## Executive Summary

This is a sophisticated game application combining **Phaser 3** (game engine) with **React 18** (UI framework) and **Vite** (build tool). The project features:
- Complex multiplayer game with real-time WebSocket communication
- Arena game system with advanced features
- Multi-chain blockchain integration (TON, Sui)
- PWA support with service workers
- Comprehensive i18n/localization system
- Advanced asset management (61MB of optimized assets)

---

## 1. Project Structure & Directory Organization

### Root Directory Layout
```
/home/user/mscife/
├── src/                          # Source code (5.6MB)
│   ├── App.jsx                   # Main React component
│   ├── main.jsx                  # React entry point
│   ├── game/                     # Phaser 3 game code
│   ├── components/               # React components
│   ├── pages/                    # React page components
│   ├── services/                 # API and Socket services
│   ├── auth/                     # Authentication modules
│   ├── config/                   # Configuration files
│   ├── utils/                    # Utility functions
│   ├── lib/                      # Library code
│   ├── modules/                  # Feature modules
│   └── test/                     # Test files
├── public/                       # Static assets (265KB)
│   ├── assets/                   # Game assets (61MB)
│   ├── icons/                    # PWA icons
│   ├── style.css                 # Global styles
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── favicon.png
├── vite/                         # Vite config files
│   ├── config.dev.mjs            # Development config
│   └── config.prod.mjs           # Production config
├── index.html                    # HTML entry point
├── package.json                  # Dependencies
├── .eslintrc.cjs                 # ESLint config
└── capacitor.config.ts           # Capacitor mobile config
```

### Source Code Structure (`/src/`)

```
src/
├── game/                         # Phaser 3 Game Engine
│   ├── main.js                   # Game initialization
│   ├── PhaserGame.jsx            # React wrapper for Phaser game
│   ├── EventBus.js               # Event communication system
│   ├── scenes/                   # Game scenes (17 directories)
│   │   ├── Boot.js               # Startup scene
│   │   ├── Preloader.js          # Asset loading scene
│   │   ├── Home.js               # Main lobby scene
│   │   ├── Home/                 # Home sub-scenes
│   │   │   ├── HomeLobby.js      # (51KB - largest Home scene)
│   │   │   ├── HomeBattle/       # Battle scenes
│   │   │   ├── HomeInventory/    # Inventory system
│   │   │   ├── HomeShop/         # Shop interface
│   │   │   ├── HomeGacha/        # Gacha/loot system
│   │   │   ├── HomeFriends/      # Friends system
│   │   │   ├── HomeGuild/        # Guild system
│   │   │   ├── HomeReward/       # Reward system
│   │   │   └── 10+ more Home subscenes
│   │   ├── Gameplay/             # Battle gameplay scenes
│   │   ├── GameplayBoss/         # Boss battle scenes
│   │   ├── GameplayMultiplayerBoss/  # Multiplayer boss
│   │   ├── Enemy/                # Enemy behavior classes
│   │   ├── Manager/              # Manager scenes
│   │   ├── Guide/                # Tutorial/guide scenes
│   │   ├── Share/                # Shared UI components
│   │   │   └── share-react/      # React components
│   │   │       ├── LoadingOverlay.jsx
│   │   │       ├── ConfirmPopup.jsx
│   │   │       ├── GoogleLoginContainer.jsx
│   │   │       ├── VorldLoginModal.jsx
│   │   │       └── GoogleLoginTelegramLinkContainer.jsx
│   │   └── Map/                  # World map scenes
│   ├── Data/                     # Game data layer
│   │   ├── CenterData.js         # Main data (8402 lines!)
│   │   ├── CenterDataLocalization.js  # i18n strings (603 lines)
│   │   ├── CenterDataItem.js     # Item definitions (414 lines)
│   │   ├── CenterDataPlayer.js   # Player data (541 lines)
│   │   ├── APIBase.js            # API client with token refresh
│   │   └── DataBattle/           # Battle-specific data
│   ├── socket.js                 # WebSocket - Main gameplay
│   ├── socketBoss.js             # WebSocket - Boss battles
│   ├── socketMultiplayerBoss.js  # WebSocket - Multiplayer boss
│   ├── socketChatGuild.js        # WebSocket - Guild chat
│   ├── wallet/                   # Blockchain wallet integration
│   │   └── Wallet.js             # Wallet operations
│   ├── managers/                 # Game managers
│   │   ├── ItemContainerPool.js
│   │   └── BatchDataLoader.js
│   ├── plugins/                  # Game plugins
│   │   └── spine/                # Spine animation support
│   │       └── SpinePlugin.min.js
│   └── utils/                    # Game utilities
│       └── websocketUtils.js
│
├── components/                   # React Components
│   └── Arena/                    # Arena game system (main feature)
│       ├── ArenaUI.jsx           # Main UI wrapper
│       ├── ArenaGame.jsx         # Game initialization & logic
│       ├── ArenaCountdown.jsx    # Countdown timer component
│       ├── ArenaTab.jsx          # Tab navigation
│       ├── ArenaNotification.jsx # Notification system
│       ├── GameInit.jsx          # Game initialization component
│       ├── ItemsCatalog.jsx      # Item catalog/shop
│       ├── ItemDrop.jsx          # Item dropping mechanics
│       ├── BoostPlayer.jsx       # Player boost features
│       ├── PackageDropNotification.jsx
│       └── *.css                 # Component-specific styles
│
├── pages/                        # React Page Components
│   └── LinkGoogleAccount.jsx     # Google account linking
│
├── services/                     # API & WebSocket Services
│   ├── socket.js                 # Socket.IO client initialization
│   ├── arenaSocket.js            # Arena-specific socket
│   ├── arena.js                  # Arena API service (axios)
│   ├── arenaGameService.js       # Arena game service
│   └── index.js                  # Services index
│
├── auth/                         # Authentication
│   └── AuthOneTap.jsx            # Google One-Tap auth
│
├── config/                       # Configuration
│   └── env.js                    # Environment variables loader
│
├── utils/                        # Utility Functions
│   └── vorldAuth.js              # Vorld authentication helper
│
├── lib/                          # Library Code
│   └── websocketUtils.js         # WebSocket utilities
│
├── modules/                      # Feature Modules
│   └── vorld-auth/               # Vorld authentication module
│       ├── index.js
│       ├── OTPInput.jsx          # OTP input component
│       └── README.md
│
└── test/                         # Test Files
```

### Public Assets Structure (`/public/assets/` - 61MB)

```
public/assets/
├── MSCI_Translate*.csv          # Localization strings (25+ files)
├── audio/                       # Game audio
├── avatar/                      # Player avatar assets
├── fonts/                       # Web fonts (Russo One, Noto Sans variants)
├── gameplay/                    # Battle/gameplay graphics
├── home_2/                      # Home UI assets (24 subdirs)
│   ├── home_lobby/
│   ├── home_battle/
│   ├── home_shop/
│   ├── home_gacha/
│   ├── home_inventory_shop/
│   ├── home_character/
│   ├── home_guild/
│   └── 17 more...
├── item/                        # Item graphics
├── load/                        # Loading screen assets
├── login/                       # Login screen assets
└── share_2/                     # Shared UI assets (4 subdirs)
    ├── share_character_card/
    ├── share_item_card/
    ├── share_popup_reward/
    └── share_popup_input/
```

---

## 2. Framework & Library Stack

### Core Framework: React 18.3.1
- **Version**: ^18.3.1
- **Use Cases**: 
  - UI overlays and modals
  - Login/authentication flows
  - Arena game UI components
  - Loading screens and popups
  - Mobile-responsive components

### Game Engine: Phaser 3.87.0
- **Version**: ^3.87.0
- **Role**: Core game rendering and logic
- **Key Features**:
  - WEBGL renderer with anti-aliasing disabled (pixel-perfect graphics)
  - FIT scaling mode (maintains aspect ratio)
  - Audio system (Web Audio enabled)
  - Loader for assets (crossOrigin: "anonymous")
  - FPS: 60 target, min 30, with smooth stepping

### Plugins for Phaser:
1. **phaser3-rex-plugins** (^1.80.11) - Advanced UI components
2. **@esotericsoftware/spine-phaser-v3** (^4.2.83) - Spine skeletal animation support

### Build Tool: Vite 6.3.5
- **Version**: ^6.3.5
- **React Plugin**: @vitejs/plugin-react (^4.3.1)
- **Configuration**:
  - Base: "./", (relative paths)
  - Development server: port 3000
  - Production build: Manual chunks with Phaser separated
  - Minify: Terser with 2 compression passes

### WebSocket & Real-time Communication
- **socket.io-client** (^4.8.1) - WebSocket communication
- **RxJS** (^7.8.1) - Reactive programming (BehaviorSubject for state)

### Authentication & Blockchain
- **@react-oauth/google** (^0.12.2) - Google OAuth 2.0
- **@tonconnect/ui-react** (^2.2.0) - TON blockchain wallet
- **@suiet/wallet-kit** (^0.3.4) - Sui blockchain wallet
- **@mysten/sui** (^1.21.2) - Sui blockchain SDK
- **@ton/core** (^0.61.0) - TON blockchain core
- **jwt-decode** (^4.0.0) - JWT token decoding

### HTTP Client & Data Processing
- **axios** (^1.7.7) - HTTP requests with interceptors
- **papaparse** (^5.5.2) - CSV parsing (for localization)

### Mobile Support
- **@capacitor/core** (^7.4.0) - Mobile app wrapper
- **@capacitor/cli** (^7.4.0)
- **@capacitor/android** (^7.4.0)

### Telegram Integration
- **@telegram-apps/sdk** (^2.11.3) - Telegram Mini App SDK

### Utilities
- **webfontloader** (^1.6.28) - Google Fonts loader
- **buffer** (^6.0.3) - Node.js Buffer in browser
- **esbuild** (^0.25.5) - Fast bundler
- **sharp** (^0.34.4) - Image processing (dev only)
- **dotenv** (^17.2.3) - Environment variables (dev only)

### Code Quality & Build
- **ESLint** (^8.57.0) with React plugins
- **eslint-plugin-react** (^7.34.2)
- **eslint-plugin-react-hooks** (^4.6.2)
- **eslint-plugin-react-refresh** (^0.4.7)
- **autoprefixer** (^10.4.21) - CSS vendor prefixes
- **cssnano** (^7.0.7) - CSS minification
- **terser** (^5.28.1) - JavaScript minification

### AWS Integration
- **@aws-sdk/client-s3** (^3.723.0) - S3 asset uploads

---

## 3. Build Tool Configuration

### Vite Configuration Files

**Development Config** (`/vite/config.dev.mjs`):
```javascript
- Base: "./" (relative paths)
- React plugin enabled
- Dev server: port 3000
- HMR: enabled by default
```

**Production Config** (`/vite/config.prod.mjs`):
```javascript
- Base: "./" (relative paths)
- React plugin + custom Phaser message plugin
- Log Level: warning only
- Rollup Options:
  * Manual chunks: Phaser separated into own bundle
  * Minify: terser with 2 compression passes
  * Mangle: enabled
  * Comments: removed
```

### Build Scripts

```json
{
  "dev": "node log.js dev & vite --config vite/config.dev.mjs",
  "build": "node log.js build & vite build --config vite/config.prod.mjs",
  "dev-nolog": "vite --config vite/config.dev.mjs",
  "build-nolog": "vite build --config vite/config.prod.mjs",
  "convert-webp": "node scripts/convert-to-webp.js",
  "convert-webp-all": "node scripts/convert-to-webp.js ./public/assets 80 100",
  "sync:r2": "node scripts/auto-sync-r2.js",
  "sync:once": "node scripts/sync-once.js",
  "upload:r2": "node scripts/sync-once.js"
}
```

---

## 4. Configuration Files

### Environment Configuration (`/src/config/env.js`)

```javascript
// API Configuration
API_BASE_URL: https://sta.m-sci.net
API_TIMEOUT: 30000ms
WS_URL: https://sta.m-sci.net

// Development flags
IS_DEV: import.meta.env.DEV
IS_PROD: import.meta.env.PROD
ENABLE_DEBUG: bool

// OAuth Configuration
GOOGLE_CLIENT_ID: from .env

// Telegram Configuration
TELEGRAM_BOT_URL: https://t.me/MSCIgamebot/game
TELEGRAM_BOT_USERNAME: MSCIgamebot

// Game URLs
GAME_BASE_URL: https://game.m-sci.net
WEB_BASE_URL: https://sta.m-sci.net

// Arena Backend Configuration
ARENA_API_URL: https://pro.m-sci.net
ARENA_WS_URL: wss://pro.m-sci.net
VORLD_APP_ID: app_mh96pk5z_ca7db3dd
```

### HTML Entry Point (`/index.html`)

```html
- Root div: id="root"
- Module script: /src/main.jsx
- Service Worker registration: /sw.js
- Manifest: /manifest.json
- Favicon: /favicon.png
- Styles: /style.css
```

### ESLint Configuration (`/.eslintrc.cjs`)

```
- Parser: latest ES version (ES2020+)
- Environment: browser, ES2020
- Extends: eslint recommended + React plugins
- React version: 18.2
- Plugins: react, react-hooks, react-refresh
- Key rules:
  * react/jsx-no-target-blank: off
  * react-refresh/only-export-components: warn
```

### PWA Manifest (`/public/manifest.json`)

```json
{
  "name": "Musk Sci",
  "short_name": "M-SCI",
  "description": "M-SCI play your style",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#000000",
  "categories": ["games", "entertainment"],
  "icons": [SVG icon],
  "screenshots": [
    {
      "src": "/screenshot.webp",
      "sizes": "1080x1920",
      "type": "image/png"
    }
  ]
}
```

---

## 5. Component Architecture & Structure

### React Components Hierarchy

```
App.jsx (Main App)
├── PhaserGame (Phaser 3 Game Instance)
│   └── Game container div
├── ArenaUI (Arena System - NEW)
│   ├── ArenaCountdown
│   ├── PackageDropNotification
│   └── ArenaNotification
├── LoadingOverlay
├── ConfirmPopup
├── GoogleLoginContainer / GoogleLoginTelegramLinkContainer
├── VorldLoginModal
├── ArenaTab
└── AuthOneTap (lazy loaded)
```

### Arena Components (Main New Feature)

The Arena system is the latest major feature with dedicated components:

```
ArenaUI.jsx - Main UI manager
├── State: countdown, activeStatus, notifications
├── Event listeners: arena:countdown, session_activated, 
│   arena:reward_notification, immediate_item_drop
└── Child components:
    ├── ArenaCountdown.jsx
    │   ├── State: timeRemaining, isActive
    │   └── Features: Countdown timer, session activation display
    │
    ├── PackageDropNotification.jsx
    │   ├── 195 lines CSS with animations
    │   └── Features: Notification queue, auto-dismiss
    │
    └── ArenaNotification.jsx
        └── Features: Real-time notifications from WebSocket

ArenaGame.jsx - Game logic & initialization
├── State: sessionId, selectedItem, userBalance, wsStatus
├── Events: player_boosted, item_dropped, session_ended
└── Sub-components:
    ├── GameInit.jsx - Initialize arena session
    ├── ItemsCatalog.jsx - Browse & select items
    ├── ItemDrop.jsx - Drop items to other players
    └── BoostPlayer.jsx - Boost other players
```

### Shared React Components (Share Folder)

Located in `/src/game/scenes/Share/share-react/`:

1. **LoadingOverlay.jsx** - Full-screen loading spinner
2. **ConfirmPopup.jsx** - Modal confirmation dialog
3. **GoogleLoginContainer.jsx** - Google OAuth login
4. **VorldLoginModal.jsx** - Vorld authentication
5. **GoogleLoginTelegramLinkContainer.jsx** - Telegram account linking

These components use `useState`, `useEffect` for state management and communicate with EventBus.

### Phaser Scenes as React Integration Points

```
PhaserGame.jsx (forwardRef component)
├── useRef: game instance
├── useLayoutEffect: Initialize Phaser game
├── useEffect: EventBus listeners for:
│   ├── current-scene-ready
│   ├── react-wallet-connect/disconnect
│   ├── react-send-transaction
│   ├── react-nft-characters
│   ├── react-sui-wallet-connect/disconnect
│   └── react-login-google
└── Returns: <div id="game-container"></div>
```

---

## 6. State Management Solution

### Architecture: Component-Level + Event Bus Pattern

**No centralized state management library used** (no Redux, Zustand, Context API).  
Instead: Decoupled communication pattern

#### 1. **React Local State (useState)**
- Used in: React components
- Examples:
  - App.jsx: `currentPage`, `showLoading`, `showVorldOTP`, `popupConfig`
  - ArenaUI.jsx: `arenaCountdown`, `arenaActive`, `notifications`
  - ArenaGame.jsx: `sessionId`, `selectedItem`, `userBalance`, `wsStatus`

#### 2. **Phaser EventBus (Global Event Emitter)**
```javascript
// EventBus.js
export const EventBus = new Phaser.Events.EventEmitter();

// Usage:
EventBus.emit('event-name', data);
EventBus.on('event-name', handler);
EventBus.removeListener('event-name');
```

**Use Cases:**
- React ↔ Phaser scene communication
- Wallet operations (connect/disconnect)
- Transaction sending
- NFT character fetching
- Login events

#### 3. **RxJS BehaviorSubject (For WebSocket)**
Used in socket files for maintaining WebSocket state:
```javascript
// socketBoss.js, socket.js, socketMultiplayerBoss.js
import { BehaviorSubject } from 'rxjs';

this.socketEvent = new BehaviorSubject(null);
```

#### 4. **Window Events (For Cross-Document Communication)**
Arena UI uses custom window events:
```javascript
window.dispatchEvent(new CustomEvent('arena:countdown', { detail: data }));
window.addEventListener('arena:countdown', handler);
```

#### 5. **Direct Instance Management**
- Game reference stored in `useRef` within PhaserGame component
- Passed to parent App component via forwardRef callback
- Direct scene access via `phaserRef.current.scene`

### Data Flow Patterns

```
Backend → WebSocket → Socket.IO → Socket Service
                     ↓
        EventBus emit → React Component setState
                     ↓
        Window event → React Components
```

---

## 7. Routing Setup

### Architecture: State-Based Routing (No React Router)

Routing is managed entirely through state in App.jsx:

```javascript
const [currentPage, setCurrentPage] = useState("game");

// Conditional rendering:
{currentPage === "game" && <PhaserGame ... />}
{currentPage === "link-account" && <LinkGoogleAccount ... />}
```

### Known Pages
- `"game"` - Main Phaser game
- `"link-account"` - Google account linking page

### Scene Navigation
Within Phaser, scenes transition via:
```javascript
this.scene.start("SceneName");
this.scene.launch("SceneName"); // Multiple scenes
this.scene.stop("SceneName");
```

### EventBus Navigation
Events can trigger scene changes:
```javascript
EventBus.emit('scene-change', { scene: 'HomeLobby' });
```

---

## 8. API Integration Patterns

### Architecture: Axios + Socket.IO Dual Approach

#### 1. **REST API via Axios**

**Main API Client** (`/src/game/Data/APIBase.js`):
```javascript
// Base configuration
baseURL: https://sta.m-sci.net
timeout: 30000ms
headers: {
  'Content-Type': 'application/json',
  'X-App-ID': VORLD_APP_ID
}

// Interceptors:
Request:
  ├── Add Bearer token from localStorage/sessionStorage
  └── Log request details
Response:
  ├── Handle 401 Unauthorized → Token refresh
  ├── Queue failed requests during refresh
  └── Retry original request after token refresh
```

**Token Refresh Mechanism**:
```javascript
If 401 + TOKEN_EXPIRED:
  1. Set isRefreshing = true
  2. Queue failed requests
  3. Call refresh endpoint
  4. Update token
  5. Retry all queued requests
  6. Set isRefreshing = false
```

**Arena API Client** (`/src/services/arena.js`):
```javascript
// Separate axios instance for Arena backend
baseURL: https://pro.m-sci.net
headers: {
  'X-App-ID': VORLD_APP_ID
}

Authentication:
  ├── Use Backend JWT as primary (Authorization header)
  ├── Send Vorld token as X-Vorld-Token header
  └── Auto-add from sessionStorage/localStorage
```

**Arena Service Methods**:
```javascript
class ArenaService:
  - initGame(streamUrl?) → {sessionId, gameId, status, websocketUrl}
  - getSession(sessionId)
  - watchSession(sessionId)
  - finishGame(sessionId)
  - activateBoost(sessionId, targetUserId, amount)
  - dropItem(sessionId, targetUserId, itemId, quantity)
  - listPlayers(sessionId)
```

#### 2. **WebSocket Communication**

**Socket.IO Clients** (Multiple instances):
1. **Main Socket** (`/src/services/socket.js`)
   - URL: https://pro.m-sci.net
   - Transport: websocket only
   - Events: arena:countdown, session_activated, arena:reward_notification

2. **Gameplay Socket** (`/src/game/socket.js`)
   - Events: gameplay updates
   - Uses RxJS BehaviorSubject

3. **Boss Socket** (`/src/game/socketBoss.js`)
   - Events: boss battle updates

4. **Multiplayer Boss Socket** (`/src/game/socketMultiplayerBoss.js`)
   - Events: multiplayer boss battle

5. **Guild Chat Socket** (`/src/game/socketChatGuild.js`)
   - Events: real-time chat messages

**Event Flow**:
```
Backend emits → Socket.IO → emit to EventBus
             → emit to window (CustomEvent)
             → Update React state (via listener)
```

#### 3. **Data Fetching Patterns**

**Async/Await with Error Handling**:
```javascript
try {
  const response = await apiClient.get('/endpoint');
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Handle auth error
  }
  throw error;
}
```

**Streaming CSV Localization**:
```javascript
const response = await fetch('assets/MSCI_Translate.csv');
const data = Papa.parse(await response.text());
```

---

## 9. Styling Approach

### CSS Architecture: Pure CSS with Component-Level Styles

**No CSS preprocessor used** - Plain CSS files

### Global Styles (`/public/style.css`)

```css
- Font family: Russo One, Noto Sans (multi-language support)
- Color scheme: Dark theme (#000000 background)
- Button styles: Hover effects, disabled states
- Responsive design: Viewport meta tag, 100% width
```

### Component-Level CSS

Located alongside components with same filename:

1. **ArenaUI.css** (14 lines)
   - `.arena-ui`: Fixed position, pointer-events control

2. **ArenaCountdown.css** (190 lines)
   - Countdown timer styling
   - Animations: fade-in, scale, pulse
   - Grid layout for time display

3. **ArenaNotification.css** (163 lines)
   - Notification container
   - Icon styling
   - Auto-dismiss animations

4. **PackageDropNotification.css** (195 lines)
   - Floating notification cards
   - Slide-in animations
   - Queue management layout

### Styling Features

- **Animations**: CSS transitions and keyframes for UI effects
- **Layout**: Flexbox and Grid for responsive design
- **Positioning**: Fixed, absolute for overlays
- **Z-index Management**: Proper layering for UI stacking
- **Pointer Events**: Careful handling for game interaction

### Font Loading

**WebFontLoader** loads Google Fonts at startup:
```javascript
WebFont.load({
  google: {
    families: [
      "Russo One",
      "Noto Sans:900",
      "Noto Sans SC",  // Chinese
      "Noto Sans KR",  // Korean
      "Noto Sans JP"   // Japanese
    ]
  }
});
```

### CSS Variables & Theming

No CSS custom properties defined - hardcoded color values:
- Primary: `#0ec3c9` (cyan)
- Background: `#000000` (black)
- Text: `rgba(255, 255, 255, 0.87)` (white with transparency)

---

## 10. Asset Management

### Directory Structure (61MB total)

#### Localization Assets
- **MSCI_Translate.csv** (12KB) - Main translations
- **25+ Specialized CSV files** - Per-feature translations:
  - Home_Lobby, Home_Battle, Home_Shop
  - Home_Gacha, Home_Gacha, Home_Friends
  - Center_Market, Neuralink, etc.

#### Media Assets

1. **Audio** (`/audio/`)
   - Background music
   - Sound effects
   - Voice lines

2. **Avatars** (`/avatar/`)
   - Player character avatars
   - Avatar customization assets

3. **Fonts** (`/fonts/`)
   - RussoOne-Regular.ttf
   - Supporting fonts for multi-language

4. **Gameplay Graphics** (`/gameplay/`)
   - Battle scene assets
   - Enemy sprites
   - Item sprites
   - Effect animations
   - Map backgrounds

5. **Home UI** (`/home_2/` - 24 subdirectories)
   Most comprehensive asset collection:
   - home_lobby/ - Main menu
   - home_battle/ - Battle selection
   - home_character/ - Character display
   - home_inventory_shop/ - Inventory/shop UI
   - home_gacha/ - Gacha system graphics
   - home_friends/ - Social features
   - home_guild/ - Guild system
   - home_neuralink/ - Neural system
   - home_reward/ - Reward screens
   - home_notification/ - Notification icons
   - home_daily/ - Daily quest
   - home_earn/ - Earning mechanics
   - home_language/ - Language selection
   - home_vip/ - VIP system
   - home_center_market/ - Trading
   - home_user_info/ - Profile
   - home_battle_multiplayer/ - Multiplayer
   - home_first_missions/ - Tutorial
   - home_musk/ - Special system
   - home_top_bar_player/ - UI header
   - home_top_currency/ - Currency display
   - home_avatar/ - Avatar selection
   - home_guild_avatar/ - Guild avatars
   - home_mission/ - Mission system

6. **Items** (`/item/`)
   - Item icons
   - Item graphics

7. **Loading Screen** (`/load/`)
   - Loading bar graphics
   - Progress indicators

8. **Login** (`/login/`)
   - Login screen UI
   - Authentication assets

9. **Shared UI** (`/share_2/` - 4 subdirectories)
   - share_character_card/ - Character card display
   - share_item_card/ - Item card display
   - share_popup_reward/ - Reward popups
   - share_popup_input/ - Input dialogs

### Asset Loading Strategy

#### Phaser Preloader (`/src/game/scenes/Preloader.js`)
- Lazy loads assets by scene
- Pool loading for frequently used assets
- Uses `LoadPreloader(scene)` function

#### Batch Data Loader (`/src/game/managers/BatchDataLoader.js`)
- Optimized asset loading in batches
- Deferred loading for performance

#### Asset Optimization

Scripts for WebP conversion:
```bash
npm run convert-webp              # Single file conversion
npm run convert-webp-all          # Batch conversion (quality 80-100)
```

**Asset URL Management**:
- CDN URL: `https://cdn.m-sci.net/`
- R2 Cloudflare sync: `sync:r2`, `sync:once` commands
- CORS support via Vite environment variables

### Asset Reference in Code

```javascript
// Dynamic asset loading
const imageUrl = `assets/home_2/home_lobby/background.webp`;

// Localization assets
const translations = Papa.parse(data);
```

---

## 11. Build & Optimization Strategy

### Production Build Process

```bash
npm run build
```

Executes:
1. Log startup: `node log.js build`
2. Vite build with production config: `vite build --config vite/config.prod.mjs`

### Bundle Optimization

**Vite Rollup Configuration**:
```javascript
manualChunks: {
  phaser: ['phaser']  // Separate Phaser into own bundle
}

minify: 'terser'
terserOptions: {
  compress: {
    passes: 2  // 2 passes for maximum compression
  },
  mangle: true  // Minify variable names
  format: {
    comments: false  // Remove all comments
  }
}
```

### Asset Optimization

- **WebP Conversion**: PNG → WebP (80-100 quality)
- **Lazy Loading**: On-demand asset loading per scene
- **CDN Deployment**: Assets served from CDN
- **CORS**: CrossOrigin: "anonymous" for assets

### Performance Features

**Phaser Game Config**:
```javascript
render: {
  antialias: false,  // Disable for pixel-perfect graphics
  powerPreference: 'high-performance',  // Use GPU
  batchSize: 4096  // More objects per render call
}

fps: {
  target: 60,
  forceSetTimeOut: false,  // Use rAF (more efficient)
  min: 30,  // Don't drop below 30 FPS
  smoothStep: true  // Smooth FPS transitions
}
```

### Service Worker & PWA

**Service Worker** (`/public/sw.js`):
- Offline support
- Asset caching
- Background sync

**PWA Features**:
- Installable app (manifest.json)
- Standalone mode
- Icon and splash screen
- Portrait orientation

---

## 12. Database & Data Layer

### No Traditional Database

Game data is sourced from:
1. **Backend API** - Game state, user data, progression
2. **Local Storage/Session Storage** - Auth tokens, cached data
3. **Static CSV Files** - Localization strings
4. **In-Memory Game Data** - CenterData.js (8402 lines)

### CenterData.js Structure

Massive centralized data file containing:
- Game configuration
- Character definitions
- Item definitions
- Battle rules
- Map data
- NPC data
- Quest data
- Pricing information

### Data Management Classes

```javascript
CenterData.js          // Main game data (8402 lines)
CenterDataLocalization.js  // i18n strings (603 lines)
CenterDataItem.js      // Item definitions (414 lines)
CenterDataPlayer.js    // Player properties (541 lines)
CenterDataAvatar.js    // Avatar data (28 lines)
```

### Token Management

```javascript
Stored in:
  - localStorage: 'accessToken', 'refreshToken'
  - sessionStorage: 'accessToken'
  - Vorld token: Custom storage (vorldAuth utility)

Retrieved by:
  - APIBase.js interceptor
  - Arena.js interceptor
  - Auth modules
```

---

## 13. Mobile & Cross-Platform Support

### Capacitor Integration

**Config** (`/capacitor.config.ts`):
- Android support
- PWA wrapper for mobile apps

### Responsive Design

```css
Viewport: width=device-width, initial-scale=1.0
Game scale: Phaser.Scale.FIT - maintains aspect ratio
Layout: Flexbox for responsive component positioning
```

### Mobile-Specific Features

1. **Telegram Mini App SDK**
   - Integration with Telegram bot
   - Bot authentication
   - Share functionality

2. **Wallet Mobile Support**
   - TON Connect for Telegram wallet
   - Sui wallet on mobile

3. **Touch Interactions**
   - Pointer events handled by Phaser
   - Touch gestures supported

---

## 14. Authentication & Security

### Authentication Methods

1. **Google OAuth 2.0**
   - Google One-Tap login
   - Account linking

2. **Vorld Authentication**
   - Email/password auth
   - OTP input component
   - Custom Vorld token

3. **Wallet Authentication**
   - TON wallet connection
   - Sui wallet connection
   - Message signing for verification

### Token Management

```javascript
Access Token:
  - Stored in localStorage/sessionStorage
  - Sent in Authorization header
  - Refresh on 401 response

Vorld Token:
  - Custom token format
  - Sent as X-Vorld-Token header
  - Managed by vorldAuth utility

Refresh Token:
  - Stored for token renewal
  - Auto-refresh before expiry
```

### Security Headers

```javascript
apiClient.headers:
  - 'Content-Type': 'application/json'
  - 'X-App-ID': VORLD_APP_ID
  - 'Authorization': 'Bearer {token}'
  - 'X-Vorld-Token': '{vorldToken}'
```

---

## 15. Internationalization (i18n)

### Localization System

**CSV-Based Translations**:
- 25+ CSV files in `/public/assets/`
- Parsed at runtime using PapaParse
- One CSV per feature/screen

**Supported Languages**:
- English (default)
- Chinese (Simplified) - Noto Sans SC
- Korean - Noto Sans KR
- Japanese - Noto Sans JP
- Vietnamese (implied by UI)

**Implementation** (`/src/game/Data/CenterDataLocalization.js`):
```javascript
class CenterDataLocalization:
  - Load CSV files
  - Parse with PapaParse
  - Provide translation lookup
  - Support dynamic language switching
```

**Language Selection**:
- HomeLanguage.js scene for UI
- Persisted in user preferences
- Font automatically switches with language

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Source Code Size** | 5.6 MB |
| **Asset Size** | 61 MB |
| **React Components** | 14+ |
| **Game Scenes** | 17+ main scenes |
| **Lines of Game Data** | 8,402 (CenterData.js) |
| **Home Sub-Scenes** | 15+ |
| **Localization Strings** | 25+ CSV files |
| **Services** | 5 WebSocket + REST API |
| **Plugins** | 2 (RexUI, Spine) |
| **Languages Supported** | 4+ |
| **Mobile Support** | Android via Capacitor |
| **Build Tool** | Vite 6.3.5 |
| **React Version** | 18.3.1 |
| **Phaser Version** | 3.87.0 |

---

## Technology Stack Summary

### Frontend Framework
- **React** 18.3.1 - UI components
- **Phaser** 3.87.0 - Game engine
- **Vite** 6.3.5 - Build tool

### State Management
- EventBus (Phaser EventEmitter)
- React Hooks (useState, useEffect)
- RxJS BehaviorSubject (WebSocket)

### Real-Time Communication
- Socket.IO Client 4.8.1
- WebSocket with fallback transports

### Authentication
- Google OAuth 2.0
- Vorld custom auth
- TON & Sui wallet connection

### HTTP & API
- Axios 1.7.7 (with interceptors)
- Token refresh mechanism
- Arena API client

### Styling
- Pure CSS (no preprocessor)
- Component-level styles
- Google Fonts loader

### Assets & Localization
- CSV-based i18n (PapaParse)
- WebP optimization
- CDN deployment

### Mobile
- Capacitor 7.4.0
- Telegram Mini App SDK
- Responsive design

### Code Quality
- ESLint with React plugins
- Pretty strict rules
- React Refresh support

---

**END OF ANALYSIS**

# 🔍 KẾT QUẢ SCAN: Frontend World App MiniKit Integration

## 1. Cấu Trúc Project

```
src/
├── App.jsx (Main App Component - 39KB)
├── main.jsx (Entry Point - providers setup)
├── minikit/ (World App MiniKit already implemented!)
│   ├── MiniKitProvider.tsx
│   ├── useWorldID.tsx
│   ├── WorldIdLogin.jsx
│   └── index.ts
├── game/ (Phaser game engine)
│   ├── PhaserGame.jsx
│   ├── EventBus.js (React-Phaser bridge)
│   ├── scenes/ (Game scenes)
│   ├── wallet/ (TON wallet integration)
│   └── Data/ (Game data & API)
├── components/ (React components)
│   ├── Arena/ (Arena game components)
│   ├── Auth/ (Authentication wrappers)
│   └── WorldIDLoginManager.tsx
├── services/ (API & Socket services)
├── hooks/ (Custom React hooks)
├── config/ (Environment configuration)
└── pages/ (Login pages)
```

## 2. Telegram SDK Usage

### 2.1 Files sử dụng Telegram SDK:
| File | Line | Code |
|------|------|------|
| src/game/utils/telegramUtils.js | Multiple | Dùng cho Telegram features |
| src/game/Data/CenterData.js | Multiple | Telegram integration |
| src/game/scenes/Home/HomeEarn/HomeEarnWallet.js | Multiple | Telegram wallet |
| src/game/Data/CenterData.js.temp | Multiple | Backup file |

### 2.2 Telegram Initialization:
```javascript
// File: src/game/utils/telegramUtils.js
// Contains Telegram WebApp utilities
```

### 2.3 Đánh giá:
- [x] Dễ thay thế - MiniKit đã có sẵn
- [ ] Cần refactor nhiều
- [ ] Tích hợp sâu, phức tạp

## 3. TON Payment Code

### 3.1 Files sử dụng TON:
| File | Line | Code |
|------|------|------|
| src/main.jsx | 4, 31 | TonConnectUIProvider setup |
| src/App.jsx | 12-16, 397, 551 | useTonConnect hooks & sendTransaction |
| src/game/Data/CenterData.js | Multiple | TON wallet type constants |
| src/game/wallet/Wallet.js | 48-50 | ConnectSuiWallet (SUI không phải TON) |

### 3.2 Payment Flow hiện tại:
```
1. User click wallet connect → EventBus.emit("react-wallet-connect")
2. App.jsx listens → TON Connect modal opens
3. User confirms → tonConnectUI.sendTransaction(transaction)
4. Transaction sent → onSuccess/onError callbacks
5. EventBus emits result to Phaser
```

### 3.3 Đánh giá:
- Độ phức tạp: Trung bình
- Có thể reuse: 70% code (chỉ thay thế TON → MiniKit)

## 4. Authentication Flow

### 4.1 Current Auth:
- Provider: MiniKitProvider (ĐÃ CÓ SẴN!)
- Token storage: localStorage/CenterData
- API auth: Bearer token + Google OAuth
- World ID: Đã tích hợp trong minikit/

### 4.2 Files liên quan:
| File | Mô tả |
|------|-------|
| src/minikit/MiniKitProvider.tsx | MiniKit wrapper component |
| src/minikit/useWorldID.tsx | World ID hook |
| src/minikit/WorldIdLogin.jsx | World ID login component |
| src/components/WorldIDLoginManager.tsx | Login manager |
| src/modules/vorld-auth/ | Vorld authentication module |

## 5. API Service

### 5.1 API Client:
- Type: axios + fetch
- Base URL: https://wld.m-sci.net (và https://pro.m-sci.net cho arena)
- Auth header: Bearer token

### 5.2 Existing Endpoints Called:
| Endpoint | Used in |
|----------|---------|
| /api/* | src/game/Data/APIBase.js |
| /arena/* | src/services/arenaGameService.js |

## 6. Providers Structure

```jsx
<React.StrictMode>
  <MiniKitProvider>                    // ← World App MiniKit ✓
    <GoogleOAuthProvider>              // ← Google OAuth
      <TonConnectUIProvider>           // ← Cần thay thế
        <App />                        // ← Main app
      </TonConnectUIProvider>
    </GoogleOAuthProvider>
  </MiniKitProvider>
</React.StrictMode>
```

## 7. Phaser-React Communication

### 7.1 Bridge Pattern:
- EventBus: Có (src/game/EventBus.js)
- Registry: Có
- Custom: EventBus.emit/listener pattern

### 7.2 Files:
| File | Mô tả |
|------|-------|
| src/game/EventBus.js | Central event bus |
| src/game/PhaserGame.jsx | Phaser game wrapper |
| src/App.jsx | React component with EventBus listeners |

## 8. Environment Variables

### 8.1 Current:
```
VITE_API_BASE_URL=https://wld.m-sci.net
VITE_WORLD_APP_ID=app_c1f666c83bbbc687bde452e4acb51b40
VITE_WORLD_ID_ACTION=msci-login
VITE_WORLD_APP_URL=https://worldapp.m-sci.net
VITE_WHITELIST_ADDRESS=0x68f4c4fce10cf3bc0cf3aa640c719ecd047529ad
```

### 8.2 Cần thêm cho World App:
```javascript
// ĐÃ CÓ SẴN!
VITE_WORLD_APP_ID=app_c1f666c83bbbc687bde452e4acb51b40
```

## 9. Điểm Tích Hợp MiniKit

### 9.1 Initialization (MiniKit.install):
- **File:** src/minikit/MiniKitProvider.tsx ✓
- **Vị trí:** Đã implemented
- **Code hiện tại:**
```tsx
// File: src/minikit/MiniKitProvider.tsx
import { MiniKit } from '@worldcoin/minikit-js'

useEffect(() => {
  if (typeof window !== 'undefined' && !MiniKit.isInstalled()) {
    MiniKit.install({
      appId: import.meta.env.VITE_WORLD_APP_ID,
    })
  }
}, [])
```

### 9.2 Payment Integration:
- **File:** src/App.jsx - cần thay thế TON payment
- **Component:** ReactSendTransaction function (line 481-601)
- **Code cần thay thế:**
```tsx
// CẦN SỬA (line 550-551)
const result = await tonConnectUI.sendTransaction(transaction);

// THAY BẰNG:
const result = await MiniKit.commandsAsync.pay({
  token: Tokens.ETH,  // hoặc Tokens.USDC
  to: receiver,
  value: tokenToDecimals(amount, Tokens.ETH),
})
```

### 9.3 Auth Integration:
- **ĐÃ CÓ** trong src/minikit/useWorldID.tsx
- World ID login đã implement

## 10. Phương Án Thực Hiện

### Phase 1: Cleanup MiniKit (ĐÃ HOÀN THÀNH) ✓
- [x] Install @worldcoin/minikit-js
- [x] MiniKitProvider implemented
- [x] World ID login implemented

### Phase 2: Replace TON Payment (2-3 giờ)
- [ ] File src/App.jsx: Replace ReactSendTransaction
- [ ] File src/main.jsx: Remove TonConnectUIProvider
- [ ] File src/App.jsx: Remove TON imports
- [ ] File src/App.jsx: Update wallet connection logic

### Phase 3: Update Game Components (1-2 giờ)
- [ ] File src/game/wallet/Wallet.js: Update ConnectWallet function
- [ ] File src/game/scenes/Home/HomeEarn/HomeEarnWallet.js: Remove TON references
- [ ] File src/game/Data/CenterData.js: Update wallet types

### Phase 4: Cleanup (30 phút)
- [ ] File package.json: Remove @tonconnect/ui-react, @ton/core
- [ ] File .env: Remove TON config (nếu có)

## 11. Files Cần Sửa (Summary)

| File | Action | Độ phức tạp |
|------|--------|-------------|
| src/main.jsx | Remove TonConnectUIProvider | Thấp |
| src/App.jsx | Replace ReactSendTransaction | Cao |
| src/App.jsx | Remove TON imports | Trung bình |
| src/App.jsx | Update wallet state management | Trung bình |
| src/game/wallet/Wallet.js | Update ConnectWallet | Trung bình |
| src/game/Data/CenterData.js | Remove TON wallet type | Thấp |
| src/game/scenes/Home/HomeEarn/HomeEarnWallet.js | Remove TON UI | Thấp |
| package.json | Remove TON packages | Thấp |

## 12. Packages

### 12.1 Đã cài:
```bash
npm install @worldcoin/minikit-js  # ✓ ĐÃ CÓ
```

### 12.2 Có thể xóa (sau khi migrate):
```bash
npm uninstall @tonconnect/ui-react @ton/core
```

## 13. MiniKit Payment Integration Code

### 13.1 Replace TON Transaction (src/App.jsx):
```tsx
// CŨ (line 481-601):
const ReactSendTransaction = async (amount, receiver, onSuccess, onError) => {
  // ... TON transaction logic
}

// MỚI - Thay thế bằng:
const ReactSendTransaction = async (amount, receiver, onSuccess, onError) => {
  try {
    console.log("🔗 Calling MiniKit.pay...");

    const result = await MiniKit.commandsAsync.pay({
      // Reference token addresses from @worldcoin/minikit-js
      token: "0x4200000000000000000000000000000000000006", // WETH on OP Sepolia
      to: receiver,
      value: tokenToDecimals(amount, "0x4200000000000000000000000000000000000006"),
    });

    console.log("✅ SUCCESS! Payment sent:", result);

    if (onSuccess && typeof onSuccess === "function") {
      onSuccess(result);
    }
  } catch (error) {
    console.error("❌ PAYMENT FAILED:", error);

    if (onError && typeof onError === "function") {
      onError(new Error("Payment failed. Please try again."));
    }
  }
};
```

### 13.2 Update Wallet Connection (src/game/wallet/Wallet.js):
```javascript
// CẦN SỬA - Wallet connection logic
export async function ConnectWallet(onConnected, onDisconnected) {
  // World App authentication is handled by MiniKitProvider
  // Just return the wallet address from MiniKit
  if (MiniKit.isInstalled()) {
    const address = MiniKit.user?.walletAddress;
    if (address && onConnected) {
      onConnected(address);
    }
  }
}
```

## 14. Risks & Considerations

### 14.1 Breaking Changes:
- TON wallet connection sẽ không hoạt động
- Existing saved TON addresses might become invalid
- Transaction format changes (TON → ETH/USDC)

### 14.2 Cần Test:
- [x] MiniKit initialization
- [ ] MiniKit.pay() flow
- [ ] Balance update sau payment
- [ ] Error handling cho payment failures
- [ ] Wallet address format compatibility

### 14.3 Rollback Plan:
- Git branch: Tạo branch mới trước khi sửa
- Backup: package.json, src/App.jsx, src/main.jsx

## 15. Timeline Estimate

| Task | Thời gian |
|------|-----------|
| Phase 2: Replace TON Payment | 2-3 giờ |
| Phase 3: Update Game Components | 1-2 giờ |
| Phase 4: Cleanup & Testing | 1 giờ |
| **Total** | **4-6 giờ** |

## 16. Status Update

### ĐÃ HOÀN THÀNH ✓
- MiniKit SDK đã cài đặt
- MiniKitProvider đã implement
- World ID authentication đã có
- Environment variables đã config

### CẦN LÀM
- Replace TON Connect bằng MiniKit payment
- Remove TON dependencies
- Update wallet connection logic
- Test payment flow end-to-end

## 17. Next Steps

1. **Tạo branch mới:**
```bash
git checkout -b feature/migrate-ton-to-minikit
```

2. **Bắt đầu với App.jsx:**
   - Remove TON imports
   - Replace ReactSendTransaction
   - Test payment flow

3. **Test với World App:**
   - Mở game trong World App
   - Thử payment feature
   - Verify balance updates
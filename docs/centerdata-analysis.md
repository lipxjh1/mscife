# CenterData.js - Phân Tích Chi Tiết & Kế Hoạch Refactoring

**Ngày phân tích:** 2025-11-08
**File phân tích:** `src/game/Data/CenterData.js`
**Người thực hiện:** Claude AI

---

## 📊 I. TỔNG QUAN FILE

### Thống kê cơ bản:
- **Tổng số dòng:** 8,402
- **Kích thước file:** 290KB
- **Cấu trúc:** 1 class duy nhất (`CenterData`)
- **Export:** Singleton instance `centerData`
- **Số lượng properties:** 41+ (trong constructor)
- **Số lượng methods:** 520+

### Phân loại methods:
| Loại Method | Số lượng | Mô tả |
|-------------|----------|-------|
| Request (API calls) | 482 | Các hàm gọi API |
| Get/Set | 19 | Getter/Setter cho properties |
| Event handlers | 15 | Add/Remove/Emit event listeners |
| Convert/Transform | 4 | Chuyển đổi data format |
| Helper methods | 10+ | Các hàm hỗ trợ khác |

---

## 🎯 II. PHÂN TÍCH DOMAINS

### Domain Breakdown (theo số lượng API methods):

#### 1️⃣ **Market Domain** (79 methods - 16.4%)
**Chức năng:** Hệ thống marketplace để mua bán items, characters, MSCI
- `RequestCenterMarket*` (nhiều methods)
- `RequestCMarketItem*` (listing, buy, sell)
- `RequestCMarketCharacter*` (character trading)
- `RequestCMarketMSCI*` (MSCI trading)
- `RequestNeuralinkCenterMarketItem*` (neuralink item market)

**Properties liên quan:**
```javascript
this.centerMarketItems = {}
this.centerMarketCharacters = {}
```

**Đề xuất tách:** `src/game/Data/market/`
- `MarketService.js` - Core market logic
- `MarketItemService.js` - Item trading
- `MarketCharacterService.js` - Character trading
- `MarketMSCIService.js` - MSCI trading
- `MarketNeuralinkService.js` - Neuralink market
- `index.js` - Barrel export

---

#### 2️⃣ **Neuralink Domain** (52 methods - 10.8%)
**Chức năng:** Hệ thống Neuralink (upgrade, equip, market)
- `RequestNeuralinkUpgrade()`
- `RequestNeuralinkInfo()`
- `RequestNeuralinkEquip()`
- `RequestNeuralinkUnEquip()`
- `RequestNeuralinkClaim()`
- `RequestNeuralinkLiquidate()`
- `RequestNeuralinkHistory()`
- Market-related neuralink methods

**Đề xuất tách:** `src/game/Data/neuralink/`
- `NeuralinkService.js` - Core neuralink logic
- `NeuralinkEquipmentService.js` - Equip/unequip
- `NeuralinkMarketService.js` - Neuralink market (tái sử dụng market base)
- `index.js`

---

#### 3️⃣ **Battle/Boss Domain** (46 methods - 9.5%)
**Chức năng:** Hệ thống battle và boss battles
- `RequestCurrentBattle()`
- `RequestNewBattle()`
- `RequestStageInfo()`
- `RequestBossBattle*` (join, rewards, pool)
- `RequestBossActive()`
- `RequestBossSchedule()`
- `RequestBossGameplayStatus()`
- `RequestMultiplayerBossRoomList()`

**Properties liên quan:**
```javascript
this.battle = { id, bossType, health, ... }
this.StageInfo = { Id, RobotQuantity, ... }
this.selectedBossData = null
this.multiplayerBossId = ""
this.replayStage = 0
```

**Đề xuất tách:** `src/game/Data/battle/`
- `BattleService.js` - Core battle logic
- `BossService.js` - Boss battles
- `StageService.js` - Stage management
- `BattleState.js` - Battle state management
- `index.js`

---

#### 4️⃣ **Character Domain** (40 methods - 8.3%)
**Chức năng:** Quản lý characters (craft, upgrade, evolve, extract)
- `RequestCharacters()`
- `RequestCharacterInfo()`
- `RequestCharactersCraft()`
- `RequestCharactersUpLevel()`
- `RequestCharactersUpStar()`
- `RequestCharactersEvolve()`
- `RequestCharactersExtract()`
- `RequestCharactersSellMusk()`
- `ConvertToUnlockedPlayers()` - data transformer
- `loadBasicInfoForAllCharacters()` - NEW async method
- `loadFullCharacterData()` - NEW async method

**Properties liên quan:**
```javascript
this.baseCharacterInfo = {}
this.unlockedPlayer = {}
this.unlockedPlayerNFT = {}
this.unlockedPlayerNFTIds = []
this.selectedPlayerArr = []
this.basicCharacters = new Map()           // NEW
this.detailedCharacters = new Map()        // NEW
this.loadingCharacters = new Set()         // NEW
this.failedCharacters = new Set()          // NEW
```

**Event handlers:**
- `AddUnlockedPlayerChange()`
- `EmitUnlockedPlayerChange()`

**Đề xuất tách:** `src/game/Data/character/`
- `CharacterService.js` - API calls
- `CharacterDataManager.js` - Data management (Maps, lazy loading)
- `CharacterTransformers.js` - Convert functions
- `CharacterEventEmitter.js` - Event handling
- `index.js`

---

#### 5️⃣ **Guild Domain** (39 methods - 8.1%)
**Chức năng:** Guild system (create, join, donate, chat)
- `RequestGetMyGuild()`
- `RequestGetGuildList()`
- `RequestPostCreateGuild()`
- `RequestPostGuildJoin()`
- `RequestPostGuildLeave()`
- `RequestGetGuildMemberList()`
- `RequestDeleteGuildMember()`
- `RequestPostDonateGuild()`
- `RequestGetGuildDonateLeaderboard()`
- `RequestGetGuildChatHistory()`
- `RequestPostGuildChatSend()`
- Guild request management methods

**Đề xuất tách:** `src/game/Data/guild/`
- `GuildService.js` - Core guild operations
- `GuildMemberService.js` - Member management
- `GuildChatService.js` - Guild chat
- `GuildDonateService.js` - Donation system
- `index.js`

---

#### 6️⃣ **Friend Domain** (21 methods - 4.4%)
**Chức năng:** Friend system và friend chat
- `RequestAddFriend()`
- `RequestAcceptFriend()`
- `RequestRejectFriend()`
- `RequestRemoveFriend()`
- `RequestGetFriendList()`
- `RequestGetFriendRequestList()`
- `RequestGetFriendChatHistory()`
- `RequestPostFriendChatSend()`
- `RequestGetFriendChatFromTimeStamp()`

**Properties liên quan:**
```javascript
this.friendArr = [...]
```

**Đề xuất tách:** `src/game/Data/social/`
- `FriendService.js` - Friend management
- `FriendChatService.js` - Friend chat
- `index.js`

---

#### 7️⃣ **Authentication Domain** (18 methods - 3.7%)
**Chức năng:** User authentication (Telegram, Email, Google)
- `RequestLoginTelegram()`
- `RequestSigninEmail()`
- `RequestRegisterEmail()`
- `RequestEmailForgotPassword()`
- `RequestSigninGoogle()`
- `LogOut()`

**Properties liên quan:**
```javascript
this.isGoogleLogin = false
// Access token in APIBase.js
```

**Đề xuất tách:** `src/game/Data/auth/`
- `AuthService.js` - All auth methods
- `TokenManager.js` - Token handling (if needed)
- `index.js`

---

#### 8️⃣ **Wallet/NFT Domain** (18 methods - 3.7%)
**Chức năng:** Wallet management và NFT minting
- `RequestUpdateWallet()`
- `RequestWalletWithdraw()`
- `RequestMintNFTCharacter()`
- `RequestGetNFTCharacterIds()`
- `GetNftCharacters()` - import from wallet module

**Properties liên quan:**
```javascript
this.walletAddress = null
this.walletType = this.WalletType.EMPTY.KEY
this.WalletType = { EMPTY, TON, SUI, AVALANCHE }
this.receiver = null
```

**Getter/Setter:**
- `GetWalletAddress()` / `SetWalletAddress()`
- `GetReceiverAddress()` / `SetReceiverAddress()`
- `GetModalState()` / `SetModalState()`

**Đề xuất tách:** `src/game/Data/wallet/`
- `WalletService.js` - Wallet operations
- `NFTService.js` - NFT minting/management
- `WalletTypes.js` - Constants
- `index.js`

---

#### 9️⃣ **Daily/Checkin Domain** (13 methods - 2.7%)
**Chức năng:** Daily login và checkin rewards
- `RequestDaily()`
- `RequestDailyCheckin()`
- `RequestLateCheckin()`

**Properties liên quan:**
```javascript
this.userInfo.CheckedinDay = [...]
this.userInfo.LastCheckinDate = "..."
```

**Đề xuất tách:** `src/game/Data/daily/`
- `DailyService.js` - Daily rewards & checkin
- `index.js`

---

#### 🔟 **Inventory/Shop Domain** (12 methods - 2.5%)
**Chức năng:** Inventory và shop system
- `RequestInventory()`
- `RequestShop()`
- `RequestBuyItem()`
- `RequestOpenBox()`
- `RequestOpenMultiBox()`
- `ConvertToItemInventory()` - transformer
- `ConvertToItemShop()` - transformer

**Properties liên quan:**
```javascript
this.inventoryDictionary = {}
this.itemShopDictionary = {}
this.baseItemInfo = {}
```

**Event handlers:**
- `AddInventoryChange()`
- `EmitInventoryChange()`

**Đề xuất tách:** `src/game/Data/inventory/`
- `InventoryService.js` - Inventory management
- `ShopService.js` - Shop operations
- `ItemTransformers.js` - Convert functions
- `index.js`

---

#### 1️⃣1️⃣ **Transaction Domain** (12 methods - 2.5%)
**Chức năng:** Transaction history tracking
- `RequestTransactionHistory()`
- `RequestTransactionHistoryMusk()`
- `RequestTransactionHistoryChip()`
- `RequestTransactionHistoryMSCI()`

**Đề xuất tách:** `src/game/Data/transaction/`
- `TransactionService.js` - Transaction history
- `index.js`

---

#### 1️⃣2️⃣ **MSCI Domain** (12 methods - 2.5%)
**Chức năng:** MSCI token operations
- `RequestMSCIConvert()`
- `RequestMSCIDashboard()`
- `RequestMSCIHistory()`
- `RequestMSCIOrders()`
- Market-related MSCI methods (already in Market domain)

**Properties liên quan:**
```javascript
this.userInfo.MSCI = 10.23...
this.userInfo.reservedMSCI = 0
```

**Đề xuất tách:** `src/game/Data/economy/`
- `MSCIService.js` - MSCI operations
- `ChipService.js` - Chip operations
- `MuskService.js` - Musk operations
- `TokenomicService.js` - Tokenomics
- `index.js`

---

#### 1️⃣3️⃣ **VIP Domain** (11 methods - 2.3%)
**Chức năng:** VIP membership system
- `RequestVipStatus()`
- `RequestBuyVip()`
- `RequestChipDailyRewards()`

**Properties liên quan:**
```javascript
this.vipStatus = { success, data: { isActive, startDate, ... } }
this.chipDailyReward = { success, data: { chipRewards, ... } }
```

**Event handlers:**
- `AddVipStatusChange()`
- `EmitVipStatusChange()`
- `AddChipDailyRewardChange()`
- `EmitChipDailyRewardChange()`

**Đề xuất tách:** `src/game/Data/vip/`
- `VipService.js` - VIP operations
- `index.js`

---

#### 1️⃣4️⃣ **Mail Domain** (9 methods - 1.9%)
**Chức năng:** In-game mail system
- `RequestMails()`
- `RequestReadMail()`
- `RequestClaimMail()`

**Đề xuất tách:** `src/game/Data/mail/`
- `MailService.js` - Mail operations
- `index.js`

---

#### 1️⃣5️⃣ **Rank Domain** (7 methods - 1.5%)
**Chức năng:** Ranking và leaderboard
- `RequestRank()`
- `RequestMyRank()`

**Properties liên quan:**
```javascript
this.myRank = { rank, totalUsers, user: {...} }
this.rankArr = [...]
```

**Đề xuất tách:** `src/game/Data/ranking/`
- `RankingService.js` - Ranking/leaderboard
- `index.js`

---

#### 1️⃣6️⃣ **Quest/Achievement Domain** (6 methods - 1.2%)
**Chức năng:** Quest và achievement system
- `RequestQuestInfo()`
- `RequestMarkQuestDone()`
- `RequestAchievementsInfo()`
- `RequestClaimAchievement()`

**Properties liên quan:**
```javascript
this.userInfo.Quests = []
```

**Đề xuất tách:** `src/game/Data/quest/`
- `QuestService.js` - Quest management
- `AchievementService.js` - Achievement system
- `index.js`

---

#### 1️⃣7️⃣ **Spin/Gacha Domain** (6 methods - 1.2%)
**Chức năng:** Spin/gacha system
- `RequestSpin()`
- `RequestPremiumSpin()`

**Đề xuất tách:** `src/game/Data/gacha/`
- `GachaService.js` - Spin/gacha operations
- `index.js`

---

#### 1️⃣8️⃣ **User Domain** (5 methods - 1.0%)
**Chức năng:** User profile management
- `RequestUserInfo()`
- `RequestUpdateAvatar()`
- `RequestGetUserObjectID()`
- `RequestTransferMcoin()`

**Properties liên quan:**
```javascript
this.userInfo = {
  _id, UserId, Username, Avatar, Email, TelegramId,
  Chip, Musk, MSCI, reservedMusk, reservedMSCI,
  CurrentStage, Power, chipPerSecond,
  CheckedinDay, LastCheckinDate, Quests,
  isVip, teamEquipment, teamStats, battleCharacters,
  hasDeposited, inviteRewardLevel, InviteCount, ...
}
```

**Event handlers:**
- `AddPlayerInfoChange()`
- `EmitPlayerInfoChange()` - with debounce logic

**Đề xuất tách:** `src/game/Data/user/`
- `UserService.js` - User operations
- `UserProfile.js` - User profile data model
- `UserEventEmitter.js` - Event handling with debounce
- `index.js`

---

#### 1️⃣9️⃣ **Other Small Domains**

**Network (3 methods):**
- `RequestNetwork()` - invite network
- `RequestInviteFriend()`

**Misc:**
- `RequestCheckPointStatus()`
- `RequestMuskRate()`
- `RequestCharacterChipRates()`
- `GetTelegramShareUrl()`
- `GetMergedCharacters()`

**Đề xuất:** Nhóm vào `src/game/Data/misc/` hoặc merge vào các domains liên quan

---

## 🏗️ III. ĐỀ XUẤT CẤU TRÚC THƯ MỤC MỚI

```
src/game/Data/
├── CenterData.js                      # ✅ Re-export hub (~150 dòng)
├── index.js                           # ✅ Barrel export
│
├── core/                              # 🆕 Core utilities
│   ├── EventEmitter.js               # Base event emitter class
│   ├── ServiceBase.js                # Base service class (common API logic)
│   └── index.js
│
├── auth/                              # 🆕 Authentication (18 methods)
│   ├── AuthService.js                # Login, register, logout
│   └── index.js
│
├── user/                              # 🆕 User management (5 methods)
│   ├── UserService.js                # User API calls
│   ├── UserProfile.js                # User data model
│   ├── UserEventEmitter.js           # Event handling
│   └── index.js
│
├── character/                         # 🆕 Character system (40 methods)
│   ├── CharacterService.js           # Character API calls
│   ├── CharacterDataManager.js       # Maps & lazy loading logic
│   ├── CharacterTransformers.js      # Convert functions
│   ├── CharacterEventEmitter.js      # Events
│   └── index.js
│
├── inventory/                         # 🆕 Inventory & shop (12 methods)
│   ├── InventoryService.js           # Inventory operations
│   ├── ShopService.js                # Shop operations
│   ├── ItemTransformers.js           # Convert functions
│   └── index.js
│
├── battle/                            # 🆕 Battle system (46 methods)
│   ├── BattleService.js              # Battle API calls
│   ├── BossService.js                # Boss battles
│   ├── StageService.js               # Stage management
│   ├── BattleState.js                # State management
│   └── index.js
│
├── market/                            # 🆕 Marketplace (79 methods)
│   ├── MarketService.js              # Core market
│   ├── MarketItemService.js          # Item trading
│   ├── MarketCharacterService.js     # Character trading
│   ├── MarketMSCIService.js          # MSCI trading
│   ├── MarketNeuralinkService.js     # Neuralink market
│   └── index.js
│
├── neuralink/                         # 🆕 Neuralink system (52 methods)
│   ├── NeuralinkService.js           # Core neuralink
│   ├── NeuralinkEquipmentService.js  # Equipment management
│   └── index.js
│
├── economy/                           # 🆕 Economy (MSCI, Chip, Musk)
│   ├── MSCIService.js                # MSCI operations
│   ├── ChipService.js                # Chip operations (if needed)
│   ├── MuskService.js                # Musk operations (if needed)
│   ├── TokenomicService.js           # Tokenomics
│   └── index.js
│
├── wallet/                            # 🆕 Wallet & NFT (18 methods)
│   ├── WalletService.js              # Wallet operations
│   ├── NFTService.js                 # NFT minting
│   ├── WalletTypes.js                # Constants
│   └── index.js
│
├── social/                            # 🆕 Social features
│   ├── FriendService.js              # Friend management (21 methods)
│   ├── FriendChatService.js          # Friend chat
│   └── index.js
│
├── guild/                             # 🆕 Guild system (39 methods)
│   ├── GuildService.js               # Guild operations
│   ├── GuildMemberService.js         # Member management
│   ├── GuildChatService.js           # Guild chat
│   ├── GuildDonateService.js         # Donations
│   └── index.js
│
├── quest/                             # 🆕 Quest & achievement (6 methods)
│   ├── QuestService.js               # Quest management
│   ├── AchievementService.js         # Achievements
│   └── index.js
│
├── gacha/                             # 🆕 Gacha/spin (6 methods)
│   ├── GachaService.js               # Gacha operations
│   └── index.js
│
├── daily/                             # 🆕 Daily rewards (13 methods)
│   ├── DailyService.js               # Daily checkin & rewards
│   └── index.js
│
├── vip/                               # 🆕 VIP system (11 methods)
│   ├── VipService.js                 # VIP operations
│   └── index.js
│
├── mail/                              # 🆕 Mail system (9 methods)
│   ├── MailService.js                # Mail operations
│   └── index.js
│
├── ranking/                           # 🆕 Ranking (7 methods)
│   ├── RankingService.js             # Leaderboard
│   └── index.js
│
├── transaction/                       # 🆕 Transaction history (12 methods)
│   ├── TransactionService.js         # Transaction queries
│   └── index.js
│
├── misc/                              # 🆕 Miscellaneous
│   ├── NetworkService.js             # Invite network (3 methods)
│   ├── CheckpointService.js          # Checkpoint (1 method)
│   ├── RateService.js                # Musk/Chip rates (2 methods)
│   └── index.js
│
└── config/                            # 🆕 Configuration
    ├── ModalState.js                 # Modal state constants
    ├── WalletTypes.js                # Wallet type constants
    └── index.js
```

### File Size Estimates (dự đoán):

| Module | Estimated Lines | Original Lines |
|--------|----------------|----------------|
| **CenterData.js** (new) | ~150 | 8,402 |
| market/ | ~1,500 | 79 methods × ~40 lines |
| neuralink/ | ~1,000 | 52 methods × ~40 lines |
| battle/ | ~900 | 46 methods × ~40 lines |
| character/ | ~800 | 40 methods × ~40 lines |
| guild/ | ~750 | 39 methods × ~40 lines |
| social/ | ~400 | 21 methods × ~40 lines |
| auth/ | ~350 | 18 methods × ~40 lines |
| wallet/ | ~350 | 18 methods × ~40 lines |
| economy/ | ~250 | 12 methods × ~40 lines |
| inventory/ | ~250 | 12 methods × ~40 lines |
| transaction/ | ~250 | 12 methods × ~40 lines |
| daily/ | ~250 | 13 methods × ~40 lines |
| vip/ | ~220 | 11 methods × ~40 lines |
| mail/ | ~180 | 9 methods × ~40 lines |
| ranking/ | ~140 | 7 methods × ~40 lines |
| quest/ | ~120 | 6 methods × ~40 lines |
| gacha/ | ~120 | 6 methods × ~40 lines |
| user/ | ~100 | 5 methods × ~40 lines |
| misc/ | ~150 | Various |
| core/ | ~200 | New utilities |
| config/ | ~100 | Constants |
| **TOTAL** | **~8,600** | 8,402 (overhead from exports/imports) |

---

## 🔗 IV. DEPENDENCY GRAPH

```
┌─────────────────────────────────────────────────────────┐
│                    CenterData.js                        │
│                   (Re-export Hub)                       │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼───┐         ┌─────▼─────┐      ┌─────▼─────┐
    │ core/ │         │  config/  │      │   auth/   │
    └───┬───┘         └───────────┘      └─────┬─────┘
        │                                       │
        └───────────────┬───────────────────────┘
                        │
        ┌───────────────┼───────────────┬──────────────┬──────────────┐
        │               │               │              │              │
    ┌───▼───┐       ┌───▼───┐      ┌───▼────┐    ┌────▼────┐   ┌────▼────┐
    │ user/ │       │ char/ │      │ inven/ │    │ battle/ │   │ wallet/ │
    └───┬───┘       └───┬───┘      └───┬────┘    └────┬────┘   └────┬────┘
        │               │               │              │             │
        └───────────────┴───────────────┴──────────────┴─────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
        ┌───▼───┐              ┌────▼────┐            ┌─────▼─────┐
        │market/│              │neuralink│            │  economy/ │
        └───────┘              └─────────┘            └───────────┘
            │
    ┌───────┴───────┬────────┬────────┬────────┐
    │               │        │        │        │
┌───▼────┐     ┌───▼───┐  ┌─▼──┐  ┌──▼──┐  ┌─▼──┐
│ social/│     │ guild/│  │vip/│  │mail/│  │etc.│
└────────┘     └───────┘  └────┘  └─────┘  └────┘
```

### Dependency Rules:
1. **core/** - Không phụ thuộc module nào (base utilities)
2. **config/** - Không phụ thuộc module nào (constants only)
3. **auth/** - Chỉ phụ thuộc core/ và config/
4. **user/** - Phụ thuộc: core/, config/, auth/
5. **character/** - Phụ thuộc: core/, user/
6. **battle/** - Phụ thuộc: core/, user/, character/
7. **market/** - Phụ thuộc: core/, user/, character/, inventory/, neuralink/
8. **All others** - Phụ thuộc: core/, user/ (và domain-specific)

**⚠️ Circular Dependencies:** PHẢI tránh!
- Market ↔ Neuralink: Tách shared logic vào core/
- User ↔ Character: User chỉ có basic info, Character quản lý details

---

## 📝 V. KẾ HOẠCH TÁCH FILE (Thứ tự ưu tiên)

### Phase 1: Foundation (Bước 1-3)
**Mục tiêu:** Tạo base infrastructure không phụ thuộc gì

| Bước | Module | Files | Lines | Dependencies | Lý do ưu tiên |
|------|--------|-------|-------|--------------|---------------|
| 1 | config/ | ModalState.js, WalletTypes.js | ~100 | None | Pure constants |
| 2 | core/ | EventEmitter.js, ServiceBase.js | ~200 | None | Base classes |
| 3 | auth/ | AuthService.js | ~350 | core, config | Independent domain |

**Kết quả:** ~650 lines moved, foundation ready

---

### Phase 2: Core Domains (Bước 4-7)
**Mục tiêu:** Tách các domains chính, ít phụ thuộc

| Bước | Module | Files | Lines | Dependencies | Lý do |
|------|--------|-------|-------|--------------|-------|
| 4 | user/ | UserService, UserProfile, UserEventEmitter | ~100 | core, auth | Core domain |
| 5 | character/ | CharacterService, CharacterDataManager, Transformers, Events | ~800 | core, user | Nhiều methods |
| 6 | inventory/ | InventoryService, ShopService, Transformers | ~250 | core, user | Medium complexity |
| 7 | wallet/ | WalletService, NFTService, WalletTypes | ~350 | core, user, config | Independent |

**Kết quả:** ~1,500 lines moved

---

### Phase 3: Game Systems (Bước 8-12)
**Mục tiêu:** Tách các game systems phức tạp

| Bước | Module | Files | Lines | Dependencies |
|------|--------|-------|-------|--------------|
| 8 | battle/ | BattleService, BossService, StageService, BattleState | ~900 | core, user, character |
| 9 | gacha/ | GachaService | ~120 | core, user |
| 10 | quest/ | QuestService, AchievementService | ~120 | core, user |
| 11 | daily/ | DailyService | ~250 | core, user |
| 12 | vip/ | VipService | ~220 | core, user |

**Kết quả:** ~1,610 lines moved

---

### Phase 4: Complex Domains (Bước 13-15)
**Mục tiêu:** Tách các domains lớn nhất

| Bước | Module | Files | Lines | Dependencies |
|------|--------|-------|-------|--------------|
| 13 | neuralink/ | NeuralinkService, NeuralinkEquipmentService | ~1,000 | core, user, character |
| 14 | market/ | 5 service files | ~1,500 | core, user, character, inventory, neuralink |
| 15 | economy/ | MSCIService, TokenomicService | ~250 | core, user |

**Kết quả:** ~2,750 lines moved

---

### Phase 5: Social & Others (Bước 16-21)
**Mục tiêu:** Tách các domains nhỏ còn lại

| Bước | Module | Files | Lines |
|------|--------|-------|-------|
| 16 | social/ | FriendService, FriendChatService | ~400 |
| 17 | guild/ | GuildService, GuildMemberService, GuildChatService, GuildDonateService | ~750 |
| 18 | mail/ | MailService | ~180 |
| 19 | ranking/ | RankingService | ~140 |
| 20 | transaction/ | TransactionService | ~250 |
| 21 | misc/ | NetworkService, CheckpointService, RateService | ~150 |

**Kết quả:** ~1,870 lines moved

---

### Phase 6: Final Integration (Bước 22-24)

| Bước | Task | Description |
|------|------|-------------|
| 22 | Refactor CenterData.js | Convert to re-export hub (~150 lines) |
| 23 | Create barrel exports | index.js for each module |
| 24 | Full integration test | Test all imports, backward compatibility |

---

## 🎯 VI. BACKWARD COMPATIBILITY STRATEGY

### Requirement:
**100% backward compatible** - Code cũ phải hoạt động y hệt

### Strategy:

#### 1. CenterData.js mới (Re-export hub):
```javascript
/**
 * CenterData.js - Legacy compatibility layer
 * All methods re-exported for backward compatibility
 */

// Import all services
import AuthService from './auth/AuthService.js';
import UserService from './user/UserService.js';
import CharacterService from './character/CharacterService.js';
// ... import all services

// Import configs
import { ModalState, WalletTypes } from './config';

/**
 * CenterData class - Backward compatible wrapper
 */
export class CenterData {
    constructor() {
        // Initialize all services
        this.authService = new AuthService();
        this.userService = new UserService();
        this.characterService = new CharacterService();
        // ...

        // Copy all properties from services to this
        // For backward compatibility
        this.userInfo = this.userService.userInfo;
        this.vipStatus = this.userService.vipStatus;
        // ...

        // Constants
        this.ModalState = ModalState;
        this.WalletType = WalletTypes;
        // ...
    }

    // Delegate all methods to services
    RequestLoginTelegram(...args) {
        return this.authService.RequestLoginTelegram(...args);
    }

    RequestUserInfo(...args) {
        return this.userService.RequestUserInfo(...args);
    }

    // ... delegate tất cả 500+ methods
}

// Singleton instance (backward compatibility)
let centerData = new CenterData();
export default centerData;
```

#### 2. New recommended usage:
```javascript
// Old way (still works)
import centerData from '@/game/Data/CenterData';
centerData.RequestUserInfo(onSuccess, onError);

// New way (recommended)
import { UserService } from '@/game/Data/user';
const userService = new UserService();
userService.RequestUserInfo(onSuccess, onError);

// Or even better (tree-shakeable)
import { requestUserInfo } from '@/game/Data/user';
requestUserInfo(onSuccess, onError);
```

#### 3. Testing strategy:
```javascript
// Test file: CenterData.backward-compat.test.js
describe('CenterData Backward Compatibility', () => {
    test('all original methods exist', () => {
        const oldMethods = [
            'RequestLoginTelegram',
            'RequestUserInfo',
            'RequestCharacters',
            // ... tất cả 500+ methods
        ];

        oldMethods.forEach(method => {
            expect(typeof centerData[method]).toBe('function');
        });
    });

    test('all properties accessible', () => {
        expect(centerData.userInfo).toBeDefined();
        expect(centerData.ModalState).toBeDefined();
        // ...
    });

    test('methods still work correctly', () => {
        // Test actual functionality
        const result = centerData.GetAccessToken();
        expect(result).toBeDefined();
    });
});
```

---

## ⚠️ VII. RISKS & MITIGATION

### Risk 1: Circular Dependencies
**Likelihood:** High
**Impact:** High
**Mitigation:**
- Strict dependency rules (see section IV)
- Use dependency injection
- Extract shared logic to core/
- Regular dependency graph checks

### Risk 2: Breaking Changes
**Likelihood:** Medium
**Impact:** Critical
**Mitigation:**
- Maintain CenterData.js as wrapper
- 100% test coverage on backward compatibility
- Incremental refactoring (test after each step)
- Keep original file as backup

### Risk 3: Performance Regression
**Likelihood:** Low
**Impact:** Medium
**Mitigation:**
- Measure bundle size before/after
- Test initial load time
- Test hot reload performance
- Use lazy loading where appropriate

### Risk 4: Developer Confusion
**Likelihood:** Medium
**Impact:** Low
**Mitigation:**
- Comprehensive documentation
- Migration guide (EN + VI)
- Code examples
- Training session for team

### Risk 5: Merge Conflicts (during refactoring)
**Likelihood:** High
**Impact:** Medium
**Mitigation:**
- Create feature branch
- Communicate with team
- Small, incremental commits
- Merge frequently from main

---

## ✅ VIII. SUCCESS CRITERIA

### Must Have:
- [ ] All 500+ methods still accessible via CenterData
- [ ] All properties still accessible
- [ ] All tests pass (100% backward compatibility)
- [ ] App runs without errors
- [ ] No console warnings/errors
- [ ] Build succeeds

### Should Have:
- [ ] Bundle size same or smaller
- [ ] Hot reload faster (target: 50% improvement)
- [ ] Code easier to navigate (subjective, team feedback)
- [ ] Each module < 400 lines
- [ ] Clear module boundaries

### Nice to Have:
- [ ] Better tree-shaking (smaller production bundle)
- [ ] TypeScript types (future)
- [ ] Better test coverage (from ~0% to 80%+)
- [ ] Documentation in both EN and VI

---

## 📅 IX. TIMELINE ESTIMATE

### Conservative estimate (with testing):

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Foundation | Steps 1-3 | 2-3 hours |
| Phase 2: Core Domains | Steps 4-7 | 4-6 hours |
| Phase 3: Game Systems | Steps 8-12 | 4-5 hours |
| Phase 4: Complex Domains | Steps 13-15 | 6-8 hours |
| Phase 5: Social & Others | Steps 16-21 | 4-5 hours |
| Phase 6: Integration | Steps 22-24 | 3-4 hours |
| **TOTAL** | 24 steps | **23-31 hours** |

**Recommended:** Spread over 1 week (4-5 hours per day), test thoroughly each day

---

## 🚀 X. NEXT STEPS

### Immediate Actions:
1. ✅ **Review this analysis** - Get team feedback
2. ⏳ **Backup original file** - Create CenterData.js.backup
3. ⏳ **Setup test infrastructure** - Create test files
4. ⏳ **Create refactoring branch** - `feature/centerdata-refactoring`
5. ⏳ **Start Phase 1** - Tách config/ và core/

### Before Starting Refactoring:
- [ ] Team review và approval của plan này
- [ ] Notify team về refactoring (avoid conflicts)
- [ ] Backup file gốc
- [ ] Create feature branch
- [ ] Setup basic tests
- [ ] Document current bundle size & performance

### During Refactoring:
- [ ] Làm từng bước nhỏ (theo phases)
- [ ] Test sau MỖI bước (không skip)
- [ ] Commit thường xuyên với clear messages
- [ ] Update refactoring log sau mỗi bước
- [ ] Monitor console errors liên tục

### After Refactoring:
- [ ] Full regression test
- [ ] Performance comparison
- [ ] Code review
- [ ] Update documentation
- [ ] Training for team
- [ ] Monitor production for 1 week

---

## 📚 XI. APPENDIX

### A. Import/Export Examples

#### Old Import (will still work):
```javascript
import centerData from '@/game/Data/CenterData';
centerData.RequestUserInfo(onSuccess, onError);
```

#### New Import (recommended):
```javascript
import { UserService } from '@/game/Data/user';
const userService = new UserService();
userService.RequestUserInfo(onSuccess, onError);
```

#### Tree-shakeable Import (best):
```javascript
import { requestUserInfo } from '@/game/Data/user';
requestUserInfo(onSuccess, onError);
```

### B. Service Base Class Example

```javascript
// core/ServiceBase.js
export class ServiceBase {
    constructor() {
        this.apiClient = apiClient; // from APIBase.js
        this.endpoints = API_ENDPOINTS;
    }

    // Common error handling
    handleError(error, onError, defaultMessage) {
        if (onError && typeof onError === 'function') {
            onError(error.response?.data || defaultMessage);
        }
    }

    // Common success handling
    handleSuccess(result, onSuccess) {
        if (result.success && onSuccess && typeof onSuccess === 'function') {
            onSuccess(result);
        }
    }
}
```

### C. EventEmitter Base Example

```javascript
// core/EventEmitter.js
export class EventEmitter {
    constructor() {
        this.eventTarget = new EventTarget();
    }

    on(eventName, callback) {
        this.eventTarget.addEventListener(eventName, callback);
    }

    off(eventName, callback) {
        this.eventTarget.removeEventListener(eventName, callback);
    }

    emit(eventName, detail = null) {
        this.eventTarget.dispatchEvent(
            new CustomEvent(eventName, { detail })
        );
    }
}
```

### D. Sample Module Structure

```javascript
// user/UserService.js
import { ServiceBase } from '../core/ServiceBase.js';

export class UserService extends ServiceBase {
    constructor() {
        super();
        this.userInfo = { /* initial data */ };
    }

    RequestUserInfo(onSuccess, onError) {
        const url = this.endpoints.USER.GET_USER_INFO;

        this.apiClient
            .get(url)
            .then(response => {
                const result = response.data;
                if (result.success) {
                    this.userInfo = result.data;
                    this.handleSuccess(result, onSuccess);
                } else {
                    this.handleError(result, onError, 'Failed to get user info');
                }
            })
            .catch(error => {
                this.handleError(error, onError, 'Failed to get user info');
            });
    }

    // ... other user methods
}

export default UserService;
```

```javascript
// user/index.js
export { default as UserService } from './UserService.js';
export { default as UserProfile } from './UserProfile.js';
export { default as UserEventEmitter } from './UserEventEmitter.js';

import UserService from './UserService.js';
export default UserService;
```

---

## 📌 XII. NOTES

### Quan trọng:
- File gốc có **8,402 dòng** trong 1 file duy nhất
- Không có TypeScript (pure JavaScript)
- Sử dụng singleton pattern (export instance, not class)
- Rất nhiều API calls (~480 methods)
- Event-driven architecture (EventTarget)
- Debounce logic trong EmitPlayerInfoChange
- Lazy loading pattern trong character methods (NEW)
- Sử dụng Map() và Set() cho performance (NEW)

### Cần chú ý:
- `apiClient` từ APIBase.js - phải import đúng
- `API_ENDPOINTS` từ services/ApiEndpoints.js
- Token management (access token, refresh token)
- Singleton pattern - CenterData được tạo 1 lần duy nhất
- LogOut() method recreates centerData instance
- Modal state management (open/closed)
- Wallet types (TON, SUI, AVALANCHE)

### Technical Debt hiện tại:
- 8,402 dòng trong 1 file
- God Object anti-pattern
- Tight coupling
- Khó test
- Khó maintain
- Khó scale
- Merge conflicts thường xuyên

### After Refactoring sẽ giải quyết:
- ✅ Modules nhỏ, dễ quản lý (< 400 dòng/file)
- ✅ Single Responsibility Principle
- ✅ Better testability
- ✅ Better code organization
- ✅ Easier for multiple developers
- ✅ Faster hot reload
- ✅ Better tree-shaking

---

**END OF ANALYSIS**

---

**Next Action:** Review plan này với team, sau đó bắt đầu **BƯỚC 2: BACKUP VÀ SETUP TESTING**

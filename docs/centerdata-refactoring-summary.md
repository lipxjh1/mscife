# CenterData.js Refactoring - Tóm Tắt Kế Hoạch

**File:** `src/game/Data/CenterData.js`
**Hiện tại:** 8,402 dòng trong 1 file
**Mục tiêu:** Tách thành ~65 files, trung bình 132 dòng/file
**Thời gian ước tính:** 23-31 giờ

---

## 🎯 Mục Tiêu

- ✅ Giữ 100% backward compatibility
- ✅ Tăng maintainability
- ✅ Giảm merge conflicts
- ✅ Cải thiện hot reload performance (target: -50%)
- ✅ Better code organization (19 domains rõ ràng)

---

## 📊 Phân Tích Nhanh

### File hiện tại:
- **8,402 dòng** trong 1 file
- **1 class duy nhất:** `CenterData`
- **520+ methods** (482 API calls)
- **41+ properties**
- **Export:** Singleton instance

### Top 5 domains lớn nhất:
1. **Market** - 79 methods (16.4%)
2. **Neuralink** - 52 methods (10.8%)
3. **Battle/Boss** - 46 methods (9.5%)
4. **Character** - 40 methods (8.3%)
5. **Guild** - 39 methods (8.1%)

---

## 🏗️ Cấu Trúc Mới (19 Modules)

```
src/game/Data/
├── CenterData.js (~150 lines - re-export hub)
├── config/          # Constants (~100 lines)
├── core/            # Base classes (~200 lines)
├── auth/            # 18 methods (~350 lines)
├── user/            # 5 methods (~100 lines)
├── character/       # 40 methods (~800 lines)
├── inventory/       # 12 methods (~250 lines)
├── wallet/          # 18 methods (~350 lines)
├── battle/          # 46 methods (~900 lines)
├── gacha/           # 6 methods (~120 lines)
├── quest/           # 6 methods (~120 lines)
├── daily/           # 13 methods (~250 lines)
├── vip/             # 11 methods (~220 lines)
├── neuralink/       # 52 methods (~1,000 lines)
├── market/          # 79 methods (~1,500 lines)
├── economy/         # 12 methods (~250 lines)
├── social/          # 21 methods (~400 lines)
├── guild/           # 39 methods (~750 lines)
├── mail/            # 9 methods (~180 lines)
├── ranking/         # 7 methods (~140 lines)
├── transaction/     # 12 methods (~250 lines)
└── misc/            # Miscellaneous (~150 lines)
```

**Total:** ~8,600 lines (overhead từ imports/exports)

---

## 📅 Kế Hoạch 6 Phases

### Phase 1: Planning & Analysis ✅ (DONE)
- [x] Phân tích file CenterData.js
- [x] Xác định 19 domains
- [x] Thiết kế cấu trúc thư mục
- [x] Tạo tài liệu phân tích

**Files created:** `docs/centerdata-analysis.md`

---

### Phase 2: Backup & Setup Testing ⏳
**Time:** 2-3 hours

- [ ] Backup file gốc → `CenterData.js.backup`
- [ ] Tạo test suite cơ bản
- [ ] Setup testing infrastructure
- [ ] Document performance metrics (before)

**Deliverables:**
- `CenterData.js.backup`
- `__tests__/CenterData.test.js`
- Performance baseline

---

### Phase 3: Foundation Modules ⏳
**Time:** 2-3 hours
**Lines:** ~590

Modules:
1. **config/** - ModalState, WalletTypes (~100 lines)
2. **core/** - EventEmitter, ServiceBase (~200 lines)
3. **auth/** - AuthService (~350 lines)

**Dependencies:** None (foundation layer)

**Test:** Config accessible, auth methods work

---

### Phase 4: Core Domain Modules ⏳
**Time:** 4-6 hours
**Lines:** ~1,500

Modules:
1. **user/** - UserService, UserProfile, Events (~100 lines)
2. **character/** - CharacterService, DataManager, Transformers (~800 lines)
3. **inventory/** - InventoryService, ShopService (~250 lines)
4. **wallet/** - WalletService, NFTService (~350 lines)

**Dependencies:** core, config, auth

**Test:** User login, character operations, inventory working

---

### Phase 5: Game System Modules ⏳
**Time:** 4-5 hours
**Lines:** ~1,610

Modules:
1. **battle/** - BattleService, BossService, StageService (~900 lines)
2. **gacha/** - GachaService (~120 lines)
3. **quest/** - QuestService, AchievementService (~120 lines)
4. **daily/** - DailyService (~250 lines)
5. **vip/** - VipService (~220 lines)

**Dependencies:** core, user, character

**Test:** Battle system, gacha, quests working

---

### Phase 6: Complex Domain Modules ⏳
**Time:** 6-8 hours
**Lines:** ~2,750

Modules:
1. **neuralink/** - NeuralinkService, Equipment (~1,000 lines)
2. **market/** - 5 service files (~1,500 lines)
3. **economy/** - MSCIService, Tokenomics (~250 lines)

**Dependencies:** core, user, character, inventory, neuralink

**Test:** Market trading, neuralink system working

---

### Phase 7: Social & Other Modules ⏳
**Time:** 4-5 hours
**Lines:** ~1,870

Modules:
1. **social/** - FriendService, FriendChat (~400 lines)
2. **guild/** - GuildService, Members, Chat, Donate (~750 lines)
3. **mail/** - MailService (~180 lines)
4. **ranking/** - RankingService (~140 lines)
5. **transaction/** - TransactionService (~250 lines)
6. **misc/** - NetworkService, others (~150 lines)

**Dependencies:** core, user

**Test:** Friend system, guild, mail working

---

### Phase 8: Final Integration ⏳
**Time:** 3-4 hours

Tasks:
- [ ] Refactor CenterData.js → re-export hub (~150 lines)
- [ ] Create barrel exports (index.js) for all modules
- [ ] Full regression test (all 500+ methods)
- [ ] Performance comparison (before vs after)
- [ ] Update documentation
- [ ] Code review ready

**Deliverables:**
- New CenterData.js (re-export only)
- All index.js files
- Performance report
- Updated docs

---

## 🔄 Backward Compatibility Strategy

### Old code (vẫn hoạt động 100%):
```javascript
import centerData from '@/game/Data/CenterData';
centerData.RequestUserInfo(onSuccess, onError);
```

### New code (khuyến khích):
```javascript
import { UserService } from '@/game/Data/user';
const userService = new UserService();
userService.RequestUserInfo(onSuccess, onError);
```

### CenterData.js mới:
```javascript
// Re-export hub
import AuthService from './auth/AuthService.js';
import UserService from './user/UserService.js';
// ... import all services

export class CenterData {
  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
    // ...
  }

  // Delegate to services
  RequestUserInfo(...args) {
    return this.userService.RequestUserInfo(...args);
  }
  // ... delegate all 500+ methods
}

let centerData = new CenterData();
export default centerData;
```

---

## ✅ Success Criteria

### Must Have:
- [ ] All 500+ methods accessible via CenterData
- [ ] All properties accessible
- [ ] 100% backward compatibility
- [ ] All tests pass
- [ ] App runs without errors
- [ ] Build succeeds

### Should Have:
- [ ] Bundle size ≤ original
- [ ] Hot reload 50% faster
- [ ] Each module < 400 lines
- [ ] Clear module boundaries

### Nice to Have:
- [ ] Better tree-shaking
- [ ] TypeScript types (future)
- [ ] 80%+ test coverage
- [ ] Documentation (EN + VI)

---

## ⚠️ Risks & Mitigation

### Top Risks:
1. **Circular Dependencies** → Strict dependency rules, use DI
2. **Breaking Changes** → Keep CenterData wrapper, 100% tests
3. **Performance Regression** → Measure before/after, lazy loading
4. **Developer Confusion** → Comprehensive docs, migration guide
5. **Merge Conflicts** → Feature branch, small commits, communicate

---

## 📝 Testing Strategy

### After Each Module:
- Unit tests pass
- Imports work
- No console errors
- App runs

### After Each Phase:
- Full test suite
- Manual testing
- Performance check
- Commit code

### Final Testing:
- Backward compatibility 100%
- Bundle size check
- Production build
- Hot reload test
- Manual QA

---

## 🚀 Next Steps

### Immediate:
1. ✅ Review analysis document
2. ⏳ Get team approval (if needed)
3. ⏳ Start Phase 2: Backup & Testing

### Before Coding:
- [ ] Backup file gốc
- [ ] Create feature branch (already exists)
- [ ] Setup tests
- [ ] Measure baseline performance

### During Refactoring:
- [ ] Làm từng bước nhỏ
- [ ] Test sau MỖI bước
- [ ] Commit thường xuyên
- [ ] Update log

### After Refactoring:
- [ ] Full regression test
- [ ] Performance comparison
- [ ] Code review
- [ ] Documentation
- [ ] Merge to main

---

## 📚 Documents

1. **centerdata-analysis.md** - Phân tích chi tiết (1,500+ dòng)
2. **centerdata-refactoring-log.md** - Tracking log
3. **centerdata-refactoring-summary.md** - This file

---

## 💡 Key Insights

### Current Problems:
- 8,402 dòng trong 1 file → khó maintain
- God Object anti-pattern
- Merge conflicts thường xuyên
- Khó test, khó scale

### After Refactoring:
- 19 modules rõ ràng (~132 dòng/file)
- Single Responsibility Principle
- Dễ maintain, dễ test
- Multiple developers có thể work parallel
- Faster hot reload
- Better tree-shaking

---

**Status:** Phase 1 COMPLETED ✅
**Next:** Phase 2 - Backup & Setup Testing
**Timeline:** 23-31 hours total

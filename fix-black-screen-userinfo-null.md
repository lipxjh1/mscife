# Fix: Màn Hình Đen Sau Login - userInfo = null

## Thông Tin
- **Ngày:** 2025-12-12
- **Version:** v421
- **Commit gây lỗi:** 113b005 (v420)
- **Files sửa:**
  - src/game/Data/CenterData.js
  - src/game/scenes/Home.js
  - src/game/scenes/Home/HomeTopBarPlayer.js
  - src/game/scenes/Gameplay.js
  - src/components/Auth/AuthWrapper.jsx

## Vấn Đề
- Login World ID thành công
- Màn hình đen, chỉ thấy avatar + banner
- TypeError: Cannot read properties of null (reading 'CurrentStage')
- Reload page thì vào được bình thường
- Line lỗi: src/game/scenes/Home.js:55

## Nguyên Nhân
Commit v420 (113b005) thay đổi CenterData.js:
1. `userInfo` từ hardcoded object → `null`
2. `syncFromStorage()` không map field `CurrentStage`
3. Login lần đầu: localStorage chưa có data → userInfo = null
4. Home.js truy cập `userInfo.CurrentStage` → TypeError

## Flow Lỗi

```
Login World ID Success
    ↓
localStorage chưa có userData
    ↓
CenterData.userInfo = null (v420 thay đổi)
    ↓
syncFromStorage() không chạy (localStorage rỗng)
    ↓
Home scene: centerData.userInfo.CurrentStage
    ↓
❌ TypeError: Cannot read properties of null (reading 'CurrentStage')
    ↓
Màn hình đen
```

## Giải Pháp

### 1. Fix CenterData.js - Default userInfo object

**Trước:**
```javascript
this.userInfo = null;
```

**Sau:**
```javascript
this.userInfo = {
    _id: null,
    UserId: "Guest",
    Username: "Guest",
    Email: "",
    CurrentStage: 1,  // ⭐ Quan trọng nhất
    Chip: 0,
    Musk: 0,
    Msci: 0,
    Power: 0,
    IsVip: false,
    VipExpiryDate: null,
    HasDeposited: false,
    CheckedinDay: 0,
    LastCheckinDate: null,
    DailyPointReward: null,
    Avatar: "avatar_free_1",
    InviteCount: 0,
    InviteBy: null,
    InviteRewardLevel: 0
};
```

### 2. Fix CenterData.js - Map CurrentStage trong syncFromStorage()

```javascript
// Thêm vào syncFromStorage()
this.userInfo = {
    ...data,

    // Map các fields
    Username: data.username || data.Username || "No user",
    UserId: data.odlUserId || data.UserId || data.userId || "No ID",

    // ⭐ QUAN TRỌNG: CurrentStage mapping
    CurrentStage: data.currentStage || data.CurrentStage || 1,

    // Các fields khác
    Power: data.power || data.Power || 0,
    IsVip: data.isVip || data.IsVip || false,
    // ...
};

console.log('[CenterData] ✅ Synced from localStorage:');
console.log('  → Username:', this.userInfo.Username);
console.log('  → UserId:', this.userInfo.UserId);
console.log('  → CurrentStage:', this.userInfo.CurrentStage);  // Thêm log này
```

### 3. Fix Home.js - Null check

**Trước (Line 55):**
```javascript
if (centerData.userInfo.CurrentStage === 6) {
```

**Sau:**
```javascript
if (centerData.userInfo?.CurrentStage === 6) {
```

### 4. Fix các files khác

**HomeTopBarPlayer.js:**
```javascript
// Line 514
.text(228, 172, "ID: " + (centerData.userInfo?.UserId || "No ID"), {
```

**Gameplay.js:**
```javascript
// Line 266
this.CurrentStage = centerData.userInfo?.CurrentStage || 1;
```

**AuthWrapper.jsx:**
```javascript
// Line 14
const hasValidTokens = localStorage.getItem('accessToken') || centerData.userInfo?.UserId;
```

## Flow Sau Khi Fix

```
Login Success
    ↓
CenterData: userInfo = default object với CurrentStage = 1 ✅
    ↓
syncFromStorage() → Map đầy đủ fields (nếu có data) ✅
    ↓
Home.js: centerData.userInfo?.CurrentStage → 1 (hoặc giá trị từ storage) ✅
    ↓
🎮 Game render bình thường
```

## Test Results

| # | Test Case | Expected | Status |
|---|-----------|----------|--------|
| 1 | Clear localStorage + Login World ID | Vào game (không màn đen) | ✅ PASS |
| 2 | Refresh page | Vẫn trong game | ✅ PASS |
| 3 | Check Home scene | Hiển thị đầy đủ UI | ✅ PASS |
| 4 | Check Gameplay scene | Không bị crash | ✅ PASS |
| 5 | Check console | Không có TypeError | ✅ PASS |
| 6 | Login → Play game | Game hoạt động bình thường | ✅ PASS |

## Console Logs Expected

```
[CenterData] ✅ Synced from localStorage:
  → Username: [player username]
  → UserId: W[world-id]
  → CurrentStage: [stage number]

// Hoặc nếu lần đầu login:
[CenterData] ⚠️ No userData in localStorage
// Nhưng vẫn có default object nên không crash
```

## Files Changed

1. **src/game/Data/CenterData.js**
   - Thay đổi userInfo từ null → default object
   - Thêm mapping CurrentStage và các fields khác
   - Thêm console log cho CurrentStage

2. **src/game/scenes/Home.js**
   - Line 55: Thêm optional chaining (?.)

3. **src/game/scenes/Home/HomeTopBarPlayer.js**
   - Line 514: Thêm null check với fallback

4. **src/game/scenes/Gameplay.js**
   - Line 266: Thêm fallback giá trị mặc định

5. **src/components/Auth/AuthWrapper.jsx**
   - Line 14: Thêm optional chaining

## Lesson Learned

1. **Khi thay đổi data structure:** Cần update TẤT CẢ nơi sử dụng
2. **Luôn có default values:** Cho objects quan trọng để tránh null reference
3. **Optional chaining (?.):** Dùng cho TẤT CẢ truy cập nested properties có thể null
4. **Testing:** Luôn test case "first time user" với localStorage rỗng
5. **Mapping:** Đảm bảo syncFromStorage() map ĐẦY ĐỦ các fields cần thiết

## Related Commits

- **v421 (bf71cdb):** Fix màn đen - commit hiện tại
- **v420 (113b005):** Commit gây lỗi - thay đổi userInfo thành null
- **v419 (55dbcb6):** Fix 401 NO TOKEN - sync token memory

## Future Improvements

1. **TypeScript:** Sử dụng TypeScript để catch null reference errors tại compile time
2. **Unit tests:** Thêm tests cho CenterData initialization
3. **Default values:** Consider using một config object cho default values
4. **Error boundaries:** Thêm error boundaries để handle unexpected nulls

---

**Status:** ✅ FIXED
**Impact:** Critical fix - ảnh hưởng đến toàn bộ user flow
**Testing:** Đã test với localStorage rỗng và có data
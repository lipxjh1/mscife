# Báo Cáo Scan: Màn Hình Đen Sau Login + Git Diff

## 1. Thông Tin
- **Ngày:** 2025-12-12
- **Commit hiện tại:** 113b005 (v420 sửa lỗi ID)
- **Commit không lỗi:** 55dbcb6 (v419 - Fix 401 NO TOKEN)
- **Hiện tượng:** Login → Màn đen, Reload → OK

## 2. Git History Analysis

### 2.1 Commits giữa 55dbcb6 và HEAD
```
113b005 v420 sửa lỗi ID
```
Chỉ có 1 commit thay đổi giữa 2 version.

### 2.2 Files thay đổi
| File | Lines +/- | Type |
|------|-----------|------|
| src/game/Data/CenterData.js | -82 +66 | Logic thay đổi hoàn toàn |

## 3. TypeError Analysis

### 3.1 Lỗi cụ thể
```
TypeError: Cannot read properties of null (reading 'CurrentStage')
Home.js:55
```

### 3.2 File và Line gây lỗi
- **File:** src/game/scenes/Home.js
- **Line:** 55
- **Code:**
```javascript
if (centerData.userInfo.CurrentStage === 6) {
```

### 3.3 Object null là gì
- **Object:** centerData.userInfo
- **Được set từ:** CenterData constructor
- **Tại sao null:** Commit 113b005 đã thay đổi từ hardcoded object thành `null`

## 4. Git Diff Analysis

### 4.1 Thay đổi quan trọng trong CenterData.js
```diff
// TRƯỚC (Commit 55dbcb6)
this.userInfo = {
    _id: "67a1cde795124152b6d4170a",
    UserId: "A00002825",
    Username: "melochenhkb",
    CurrentStage: 21,
    // ... hardcoded data
};

// SAU (Commit 113b005)
this.userInfo = null;
this.syncFromStorage();
```

### 4.2 Thêm method syncFromStorage()
```javascript
syncFromStorage() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsed = JSON.parse(userData);
            const data = parsed.data || parsed;

            if (data && (data.username || data.Username || data.odlUserId)) {
                this.userInfo = {
                    // Map fields...
                    Username: data.username || data.Username || "No user",
                    UserId: data.odlUserId || data.UserId || data.userId || "No ID",
                    CurrentStage: data.CurrentStage || 1, // Note: không có trong mapping!
                };
            }
        } catch (e) {
            console.error('[CenterData] ❌ Failed to parse userData:', e);
        }
    }
}
```

### 4.3 Vấn đề trong syncFromStorage()
- Method `syncFromStorage()` KHÔNG map field `CurrentStage`
- Nên sau khi sync, `userInfo.CurrentStage` = undefined

## 5. Timing Analysis

### 5.1 Flow Login Lần Đầu (Bị lỗi)
```
1. World ID Login success
   ↓
2. setState(authenticated)
   ↓
3. Game render → Home scene create()
   ↓
4. centerData.userInfo = null (chưa kịp sync)
   ↓
5. if (centerData.userInfo.CurrentStage === 6) ← ERROR ❌
   ↓
6. TypeError: Cannot read properties of null
   ↓
7. Màn đen
```

### 5.2 Flow Reload (OK)
```
1. Page load
   ↓
2. CenterData constructor → syncFromStorage()
   ↓
3. Có userData trong localStorage → userInfo được fill
   ↓
4. Game render → Home scene create()
   ↓
5. if (centerData.userInfo.CurrentStage === 6) ← OK ✅
   ↓
6. Home scene render bình thường
```

## 6. Root Cause Identification

### Primary Cause
- **Vấn đề:** CenterData.js thay đổi từ hardcoded object thành null + sync từ localStorage
- **File:** src/game/Data/CenterData.js
- **Line:** 22-23
- **Commit gây lỗi:** 113b005
- **Code lỗi:**
```javascript
// Line 22-23
this.userInfo = null;
this.syncFromStorage();
```

### Secondary Issue
- **Vấn đề:** syncFromStorage() không map tất cả fields cần thiết
- **Missing fields:**
  - CurrentStage
  - CheckedinDay
  - LastCheckinDate
  - Quests
  - DailyPointReward
  - teamEquipment
  - teamStats
  - battleCharacters
  - assets
  - reservedAssets
  - dailyConversionInfo
  - hasDeposited
  - inviteRewardLevel
  - OldUser
  - InviteCount
  - SpentMusk
  - InviteBy
  - Parent1
  - Parent2
  - F1SpentMusk
  - F2SpentMusk

### Tại sao commit 55dbcb6 không lỗi
- Có hardcoded object với đầy đủ fields
- `CurrentStage: 21` được set sẵn
- Không cần sync từ localStorage

## 7. Các Files Cần Sửa Ngay

| File | Line | Vấn đề | Fix cần thiết |
|------|------|---------|---------------|
| src/game/scenes/Home.js | 55 | Check null trước khi truy cập | `if (centerData.userInfo?.CurrentStage === 6)` |
| src/game/Data/CenterData.js | 428-451 | Thiếu map CurrentStage | Thêm `CurrentStage: data.CurrentStage || 1` |
| src/game/scenes/Home/HomeTopBarPlayer.js | 495 | Check null | `centerData.userInfo?.Username` |
| src/game/scenes/Gameplay.js | 266, 1496-1532 | Check null | `centerData.userInfo?.CurrentStage` |
| src/components/Auth/AuthWrapper.jsx | 14 | Check null | `centerData.userInfo?.UserId` |

## 8. Đề Xuất Fix

### Option 1: Fix Nhanh (Recommended)
```javascript
// 1. Fix CenterData.js - Thêm CurrentStage vào mapping
this.userInfo = {
    ...data,
    Username: data.username || data.Username || "No user",
    UserId: data.odlUserId || data.UserId || data.userId || "No ID",
    CurrentStage: data.CurrentStage || 1,  // THÊM DÒNG NÀY!
    // ... các fields khác
};

// 2. Fix Home.js - Check null
if (centerData.userInfo?.CurrentStage === 6) {
    //...
}
```

### Option 2: Fix Toàn Diện
```javascript
// Tạo getter với default values
class CenterData {
    get currentUser() {
        return this.userInfo || {
            CurrentStage: 1,
            Username: "Guest",
            UserId: "NoID",
            // ... defaults
        };
    }
}

// Sử dụng:
if (centerData.currentUser.CurrentStage === 6) {
    //...
}
```

### Option 3: Sử dụng Optional Chaining
Thay thế tất cả `centerData.userInfo.X` bằng `centerData.userInfo?.X`

## 9. Files Cần Update

1. **High Priority (Gây crash):**
   - src/game/scenes/Home.js:55
   - src/game/Data/CenterData.js:428-451 (map CurrentStage)

2. **Medium Priority (Có thể gây lỗi):**
   - src/game/scenes/Home/HomeTopBarPlayer.js:495
   - src/game/scenes/Gameplay.js:266, 1496-1532
   - src/components/Auth/AuthWrapper.jsx:14

3. **Low Priority (Cần check):**
   - Tất cả files sử dụng `centerData.userInfo.` (khoảng 30+ files)

## 10. Rollback Option
```bash
# Nếu cần rollback ngay lập tức
git revert 113b005

# Hoặc checkout file cũ
git checkout 55dbcb6 -- src/game/Data/CenterData.js
```

## 11. Test Plan

1. **Test Case 1 - Login lần đầu:**
   - Clear localStorage
   - Login World ID
   - Verify không bị màn đen

2. **Test Case 2 - Reload:**
   - Reload page
   - Verify vẫn hoạt động

3. **Test Case 3 - Check các scenes:**
   - Home
   - Gameplay
   - Battle
   - Market
   - Guild

## 12. Kết Luận

Nguyên nhân chính là commit 113b005 đã thay đổi `userInfo` từ hardcoded object thành null mà không đảm bảo tất cả các places sử dụng `userInfo` đã được update để handle null case. Lỗi xảy ra ngay ở dòng đầu tiên truy cập `userInfo.CurrentStage` trong Home scene.

Cần fix:
1. Map `CurrentStage` trong `syncFromStorage()`
2. Add null checks ở tất cả places truy cập `userInfo`
3. Test kỹ toàn bộ flow login và game scenes

---

**Severity:** CRITICAL
**Priority:** IMMEDIATE
**Estimate fix:** 2-4 hours cho quick fix, 1-2 ngày cho comprehensive fix
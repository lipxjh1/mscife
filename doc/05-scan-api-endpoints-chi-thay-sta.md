# Báo Cáo Scan API Endpoints - Chỉ Thay Đổi sta.m-sci.net

## Ngày: 2025-01-21
## Người thực hiện: Claude AI

## Tổng Quan
Scan và phân tích tất cả API endpoints trong project, chỉ thay đổi sta.m-sci.net thành pro.m-sci.net, giữ nguyên play.m-sci.net và sui.m-sci.net.

## Mục Tiêu
Xác định tất cả các endpoints, chỉ thay đổi sta.m-sci.net → pro.m-sci.net, giữ nguyên play.m-sci.net và sui.m-sci.net theo yêu cầu.

## Kết Quả Scan

### Endpoints Tìm Thấy
| Endpoint | File | Line | Usage | Status | Action Required |
|----------|------|------|-------|---------|-----------------|
| sta.m-sci.net | src/game/Data/APIBase.js.backup | 7 | API chính | Backup | ✅ Already changed to pro.m-sci.net |
| pro.m-sci.net | src/game/Data/APIBase.js | 6 | API chính | Active | ✅ Target state - change complete |
| play.m-sci.net | src/game/scenes/Share/PopupCopyInviteUrl.js.backup | 148 | Web game URL | Backup | ✅ Already changed to pro.m-sci.net |
| pro.m-sci.net | src/game/scenes/Share/PopupCopyInviteUrl.js | 148 | Web game URL | Active | ⚠️ Should be play.m-sci.net (keep as is required) |
| sui.m-sci.net | src/game/scenes/Home/HomeEarn/HomeEarnWallet.js | 770 | SUI connection | Commented | ✅ Keep as is (commented) |

### Phân Tích Chi Tiết

#### sta.m-sci.net (ĐÃ ĐƯỢC THAY ĐỔI ✅)
- **File:** src/game/Data/APIBase.js
- **Line:** 6 (hiện tại), 7 (backup)
- **Code hiện tại:** `export const API_BASE_URL = "https://pro.m-sci.net";`
- **Code backup:** `export const API_BASE_URL = "https://sta.m-sci.net";`
- **Usage:** API chính cho toàn bộ ứng dụng
- **Impact:** Cao - ảnh hưởng đến tất cả API calls
- **Status:** ✅ HOÀN THÀNH - Đã thay đổi thành pro.m-sci.net

#### play.m-sci.net (CẦN KHÔI PHỤC ⚠️)
- **File:** src/game/scenes/Share/PopupCopyInviteUrl.js
- **Line:** 148
- **Code hiện tại:** `const baseUrl = "https://pro.m-sci.net/";`
- **Code backup:** `const baseUrl = "https://play.m-sci.net/";`
- **Usage:** Tạo URL mời chơi game trên web
- **Function:** getWebInviteUrl(userId)
- **Impact:** Trung bình - ảnh hưởng đến tính năng chia sẻ web game
- **Status:** ⚠️ CẦN KHÔI PHỤC - Yêu cầu giữ nguyên play.m-sci.net
- **Action Required:** Restore to play.m-sci.net

#### sui.m-sci.net (GIỮ NGUYÊN ✅)
- **File:** src/game/scenes/Home/HomeEarn/HomeEarnWallet.js
- **Line:** 770
- **Code:** `//     let suiLink = \`https://sui.m-sci.net/connect-sui?token=${centerData.GetAccessToken()}\`;`
- **Usage:** Kết nối SUI wallet (đã comment)
- **Status:** ✅ ĐẦY ĐỦ - Đã comment, không cần thay đổi
- **Action Required:** No - Keep as is

## Vấn Đề Phát Hiện

### ⚠️ QUAN TRỌNG: Phát hiện sai lệch
Trong quá trình scan, phát hiện rằng play.m-sci.net đã được thay đổi thành pro.m-sci.net trong PopupCopyInviteUrl.js, nhưng theo yêu cầu mới thì play.m-sci.net cần **GIỮ NGUYÊN**.

### Files cần khôi phục:
1. `src/game/scenes/Share/PopupCopyInviteUrl.js` - Line 148: pro.m-sci.net → play.m-sci.net

## Đề Xuất Thay Đổi

### Files Đã Hoàn Thành (Không cần thay đổi)
1. ✅ `src/game/Data/APIBase.js` - Line 6: sta.m-sci.net → pro.m-sci.net (HOÀN THÀNH)

### Files Cần Khôi Phục
1. ⚠️ `src/game/scenes/Share/PopupCopyInviteUrl.js` - Line 148: pro.m-sci.net → play.m-sci.net

### Files Giữ Nguyên
1. ✅ `src/game/scenes/Home/HomeEarn/HomeEarnWallet.js` - Line 770: sui.m-sci.net (commented)

## Kế Hoạch Thực Hiện (Khôi phục)

### Bước 1: Khôi phục play.m-sci.net
```bash
# Restore file from backup hoặc chỉnh sửa thủ công
cp src/game/scenes/Share/PopupCopyInviteUrl.js.backup src/game/scenes/Share/PopupCopyInviteUrl.js
```

Hoặc chỉnh sửa trực tiếp:
```javascript
// Line 148 trong PopupCopyInviteUrl.js
// Từ:
const baseUrl = "https://pro.m-sci.net/";
// Thành:
const baseUrl = "https://play.m-sci.net/";
```

### Bước 2: Verify
- Verify sta.m-sci.net không còn tồn tại
- Verify pro.m-sci.net chỉ còn trong APIBase.js
- Verify play.m-sci.net được khôi phục trong PopupCopyInviteUrl.js
- Verify sui.m-sci.net vẫn được comment

## Rủi Ro
- Khôi phục play.m-sci.net có thể ảnh hưởng đến các user đang sử dụng pro.m-sci.net link
- Có thể có các thay đổi khác không được phát hiện

## Next Steps
1. Khôi phục play.m-sci.net trong PopupCopyInviteUrl.js
2. Test kỹ lưỡng sau khi khôi phục
3. Xác nhận với team về yêu cầu giữ nguyên play.m-sci.net
4. Commit và push code

## Lưu Ý Quan Trọng
- ✅ **ĐÚNG:** sta.m-sci.net → pro.m-sci.net (APIBase.js)
- ⚠️ **SAI:** play.m-sci.net → pro.m-sci.net (PopupCopyInviteUrl.js)
- ✅ **ĐÚNG:** sui.m-sci.net giữ nguyên (commented)

---

## 📊 FINAL REPORT

### ✅ SCAN COMPLETED

**Summary:**
- Task: Scan API endpoints - chỉ thay đổi sta.m-sci.net
- Status: Success with findings
- Duration: completed

**Critical Finding:**
- sta.m-sci.net → pro.m-sci.net: ✅ HOÀN THÀNH
- play.m-sci.net đã bị thay đổi thành pro.m-sci.net: ⚠️ CẦN KHÔI PHỤC
- sui.m-sci.net: ✅ ĐÚNG (đã comment, giữ nguyên)

**Endpoints Analysis:**
| Endpoint | File | Line | Status | Action Required |
|----------|------|------|---------|-----------------|
| sta.m-sci.net → pro.m-sci.net | src/game/Data/APIBase.js | 6 | ✅ Complete | None |
| play.m-sci.net → pro.m-sci.net | src/game/scenes/Share/PopupCopyInviteUrl.js | 148 | ⚠️ Wrong change | Restore to play.m-sci.net |
| sui.m-sci.net | src/game/scenes/Home/HomeEarn/HomeEarnWallet.js | 770 | ✅ Correct | None |

## Checklist
- [x] Scan tất cả files
- [x] Phân tích endpoints
- [x] Phát hiện sai lệch trong play.m-sci.net
- [x] Tạo báo cáo scan chi tiết
- [ ] Khôi phục play.m-sci.net (pending confirmation)
- [ ] Test sau khi khôi phục

## Documentation
- **File:** doc/05-scan-api-endpoints-chi-thay-sta.md
- **Status:** Created
- **Content:** Full scan report với phát hiện quan trọng

**Next Steps Priority:**
1. Confirm with team về việc khôi phục play.m-sci.net
2. Khôi phục play.m-sci.net trong PopupCopyInviteUrl.js
3. Test và verify kết quả

---

## ⚠️ ACTION REQUIRED
**Cần khôi phục:** pro.m-sci.net → play.m-sci.net trong `src/game/scenes/Share/PopupCopyInviteUrl.js` line 148
**Lý do:** Theo yêu cầu spec, play.m-sci.net cần giữ nguyên

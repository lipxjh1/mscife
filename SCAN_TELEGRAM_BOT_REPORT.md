# BÁO CÁO SCAN FRONTEND - TÌM THAM CHIẾU BOT CŨ

## Ngày scan: 22/10/2025
## Project: M-SCI Game Frontend
## Bot mới: @MSCIgamebot
## URL mới: https://t.me/MSCIgamebot
## Game URL mới: https://game.m-sci.net

---

## 📊 TỔNG QUAN

- **Tổng số files đã scan:** 324 files
- **Files có vấn đề:** 2 files
- **Số chỗ cần sửa:** 3 locations

---

## ⚠️ CÁC VẤN ĐỀ TÌM THẤY

### 1. CENTER DATA - HARDCODED BOT URL

#### ❌ File: `src/game/Data/CenterData.js`
- **Dòng:** 451
- **Nội dung hiện tại:**
```javascript
const baseUrl = "https://t.me/musksci_bot/game";
```
- **Cần sửa thành:**
```javascript
const baseUrl = "https://t.me/MSCIgamebot/game";
```

---

### 2. SHARE POPUP - HARDCODED BOT USERNAME

#### ❌ File: `src/game/scenes/Share/PopupCopyInviteUrl.js`
- **Dòng:** 144
- **Nội dung hiện tại:**
```javascript
return `https://t.me/musksci_bot/game?startapp=${userId}`;
```
- **Cần sửa thành:**
```javascript
return `https://t.me/MSCIgamebot/game?startapp=${userId}`;
```

#### ❌ File: `src/game/scenes/Share/PopupCopyInviteUrl.js`
- **Dòng:** 147-149
- **Nội dung hiện tại:**
```javascript
export function getWebInviteUrl(userId) {
    const baseUrl = "https://pro.m-sci.net/";
    const urlParams = new URLSearchParams();
```
- **Cần kiểm tra:** URL `https://pro.m-sci.net/` có cần thay đổi không?

---

## ✅ FILES KHÔNG CÓ VẤN ĐỀ

- `src/App.jsx` - Không có tham chiếu bot
- `src/game/main.js` - Không có tham chiếu bot
- `src/game/PhaserGame.jsx` - Không có tham chiếu bot
- `src/pages/LinkGoogleAccount.jsx` - Chỉ xử lý token, không có bot URL
- `src/game/scenes/Share/share-react/GoogleLoginTelegramLinkContainer.jsx` - Không có tham chiếu bot
- `package.json` - Không có bot URL
- `.env` - Không có thông tin bot cũ
- `index.html` - Không có meta tags bot

---

## 📝 HƯỚNG DẪN SỬA (CHO DEV)

### Các file cần sửa theo thứ tự ưu tiên:

#### PRIORITY 1 - Critical Functions
1. `src/game/Data/CenterData.js` - Sửa dòng 451
2. `src/game/scenes/Share/PopupCopyInviteUrl.js` - Sửa dòng 144

#### PRIORITY 2 - Check URL (nếu cần)
3. `src/game/scenes/Share/PopupCopyInviteUrl.js` - Kiểm tra dòng 148

---

## 🔍 SEARCH & REPLACE GỢI Ý

Có thể dùng VSCode Find & Replace (Ctrl+Shift+H):

**Find (Exact Match):**
```
musksci_bot
```

**Replace:**
```
MSCIgamebot
```

⚠️ **CHÚ Ý:** Chỉ replace `musksci_bot`, không replace các phần khác của URL!

---

## 🧪 TESTING SAU KHI SỬA

### 1. Build test:
```bash
npm run build
```

### 2. Dev test:
```bash
npm run dev
```

### 3. Kiểm tra các chức năng:
- [ ] Share button hoạt động
- [ ] Invite link đúng bot mới
- [ ] Deep link hoạt động với bot mới
- [ ] Telegram WebApp integration hoạt động

---

## 📌 LƯU Ý QUAN TRỌNG

1. **Backup trước khi sửa:**
```bash
git checkout -b fix/update-telegram-bot
```

2. **Test kỹ sau khi sửa** - Đặc biệt:
   - Share functionality
   - Deep linking
   - Telegram WebApp integration
   - Invite system

3. **Environment variables** - Đảm bảo:
   - Không có environment variables nào cần update
   - Backend có thể cần update tương ứng

4. **Cache** - Clear cache sau khi deploy:
   - Browser cache
   - Service Worker cache

---

## 📊 STATISTICS

| Category | Count |
|----------|-------|
| Config files cần sửa | 0 |
| Source files cần sửa | 2 |
| Total locations cần sửa | 3 |
| Priority 1 (Critical) | 2 |
| Priority 2 (Check) | 1 |

---

## ✅ CHECKLIST SAU KHI SỬA

- [ ] Tất cả hardcoded `musksci_bot` đã sửa thành `MSCIgamebot`
- [ ] Build thành công
- [ ] Test local OK
- [ ] Deploy thành công
- [ ] Test production OK
- [ ] Share/Invite hoạt động với bot mới
- [ ] Deep link hoạt động với bot mới
- [ ] Telegram WebApp hoạt động với bot mới

---

## 🔎 CHI TIẾT SCAN

### Pattern đã scan:
- `@.*bot` - Tìm bot usernames
- `t\.me` - Tìm Telegram URLs
- `telegram.*=\|bot.*=\|TELEGRAM\|BOT_` - Tìm telegram variables
- `telegram.*sdk\|@telegram.*apps.*sdk` - Tìm SDK imports
- `https\?://.*game\|game\..*\.net\|game\..*\.com` - Tìm game URLs
- `musksci_bot\|MSCIgamebot` - Tìm specific bot names

### Files quan trọng đã kiểm tra:
- ✅ Config files (.env, package.json, vite configs)
- ✅ Main components (App.jsx, main.jsx)
- ✅ Game data (CenterData.js)
- ✅ Share functionality (PopupCopyInviteUrl.js)
- ✅ Auth pages (LinkGoogleAccount.jsx)
- ✅ Phaser scenes và game logic

---

## 🎯 KẾT LUẬN

Chỉ cần **2 files** và **3 locations** cần sửa để cập nhật từ `musksci_bot` sang `MSCIgamebot`. Đây là một thay đổi tương đối nhỏ và an toàn.

**Thời gian ước tính:** 15-30 phút để sửa và test
**Mức độ rủi ro:** Thấp (chỉ thay đổi bot username)
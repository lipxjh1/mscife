# HƯỚNG DẪN TEST SAU KHI SỬA TOKEN STORAGE

## 🚀 MỤC TIÊU

Kiểm tra xem fix token storage đã giải quyết được 401 errors chưa.

## 📋 CÁC BƯỚC TEST

### Bước 0: Chuẩn bị
**Test Account:**
- **Email:** huynguyen90tn@gmail.com
- **Password:** Anhyeuem11@

### Bước 1: Mở Frontend và Clear Session
1. Mở browser (Chrome recommended)
2. Đến URL: http://localhost:5173 (hoặc game.m-sci.net)
3. Mở DevTools (F12) → Console tab
4. Clear sessionStorage:
```javascript
sessionStorage.clear()
console.log('✅ SessionStorage cleared')
```

### Bước 2: Login và Check Console Logs
1. Tải lại trang (F5)
2. Click "Đăng nhập bằng Vorld" button
3. Nhập email: huynguyen90tn@gmail.com
4. Nhập password: Anhyeuem11@
5. Click "Đăng nhập"

**📸 QUAN SÁT CONSOLE LOGS:**

**Expected với fix:**
```
🔐 Vorld Login: huynguyen90tn@gmail.com
✅ Vorld Login Response: Object
✅ Tokens saved to sessionStorage           ← **NEW - từ fix**
✅ Vorld login OK - No OTP needed
✅ Tokens saved to sessionStorage (backup)   ← **NEW - từ fix**
✅ Vorld login complete, starting Home
```

**❌ Nếu thấy 401 errors:**
```
❌ Failed to load: /api/me/update-wallet:1 (401)  ← SẼ KHÔNG CÒN NẾU FIX THÀNH CÔNG
❌ Failed to load: /api/me/daily-checkin:1 (401)  ← SẼ KHÔNG CÒN NẾU FIX THÀNH CÔNG
```

### Bước 3: Verify Tokens in SessionStorage
Ở Console tab, gõ:
```javascript
console.log('Access Token:', sessionStorage.getItem('accessToken'))
console.log('Refresh Token:', sessionStorage.getItem('refreshToken'))
```

**✅ Expected nếu fix thành công:**
```
Access Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (không null)
Refresh Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (không null)
```

**❌ Nếu fix thất bại:**
```
Access Token: null
Refresh Token: null
```

### Bước 4: Check Authorization Headers
1. Mở DevTools → Network tab
2. Filter: XHR/Fetch
3. Tìm request tới `/api/me/update-wallet`

**✅ Expected nếu fix thành công:**
```
Headers Tab:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  
Status: 200 OK (KHÔNG phải 401)
```

**❌ Nếu vẫn còn lỗi:**
```
Headers Tab:
  ❌ Không có Authorization header
  Status: 401 Unauthorized
```

### Bước 5: Check API Responses
1. Click vào request `/api/me/update-wallet`
2. Xem Response tab

**✅ Expected nếu fix thành công:**
```json
{
  "success": true,
  "data": {
    "wallet": {...}
  }
}
Status: 200 OK
```

**❌ Nếu vẫn còn lỗi:**
```json
Status: 401 Unauthorized
Response: { "message": "Unauthorized" }
```

### Bước 6: Test Token Persistence
1. Như login thành công
2. Refresh trang (F5)
3. Kiểm tra lại sessionStorage:
```javascript
console.log('After refresh - Access Token:', sessionStorage.getItem('accessToken'))
```

**✅ Expected:** Tokens vẫn còn sau refresh
**❌ Nếu fix sai:** Tokens bị mất

### Bước 7: Test Complete User Flow
1. Login thành công
2. Navigate qua các sections:
   - trang chủ (Home)
   - inventory
   - shop
   - battle sections
3. Check console cho errors

**✅ Expected:** Không có 401 errors ở đâu
**❌ Nếu vẫn còn lỗi:** Có 401 errors ở các sections

---

## 📊 BẢNG KẾT QUẢ TEST

Điền kết quả từng test:

| Test # | Test Name | Expected | Actual Result | ✅ Pass / ❌ Fail |
|--------|-----------|----------|---------------|-------------------|
| 1 | Console logs show "Tokens saved" | ✅ New log lines appear | [điền kết quả] | ✅/❌ |
| 2 | Tokens in sessionStorage | ✅ 2 tokens non-null | [điền kết quả] | ✅/❌ |
| 3 | Authorization headers | ✅ Present in API calls | [điền kết quả] | ✅/❌ |
| 4 | No 401 errors | ✅ Zero 401s | [điền kết quả] | ✅/❌ |
| 5 | API responses success | ✅ Status 200 with data | [điền kết quả] | ✅/❌ |
| 6 | Token persistence | ✅ Tokens survive refresh | [điền kết quả] | ✅/❌ |
| 7 | Complete user flow | ✅ No errors anywhere | [điền kết quả] | ✅/❌ |

**Overall Result:** [X/7 PASS] 

---

## 🎯 PASS/FAIL CRITERIA

**✅ PASS THẬN BẠO:**
- 6/7 tests PASS (để lại room cho edge cases)
- Không còn 401 errors
- APIs trả về data thành công

**❌ FAIL THẬN BẠO:**
- < 4/7 tests PASS  
- Vẫn còn 401 errors
- Tokens không được lưu

---

## 🔄 ROLLBACK NẾU CẦN

Nếu test thất bại, restore backup files:

```bash
# Restore vorld-auth
cd /mnt/d/fe/fe/src/modules/vorld-auth
cp index.js.backup-20251026-152946 index.js

# Restore Login.js  
cd /mnt/d/fe/fe/src/game/scenes
cp Login.js.backup-20251026-152949 Login.js

# Rebuild
npm run build
```

---

## 📝 GHI CHÚ TEST

**Test Date:** [ghi ngày test]
**Test Time:** [ghi giờ test]
**Browser:** [Chrome/Edge/Firefox]
**Environment:** Localhost/Production
**Tester Name:** [tên bạn]

**Additional Notes:**
[ghi chú thêm về behavior]

**Overall Assessment:**
✅ SUCCESS - Fix resolves 401 errors
❌ FAILED - Still need further investigation

---

**Khi test xong, báo lại kết quả trong bảng trên để tôi tạo báo cáo cuối cùng!** 🚀

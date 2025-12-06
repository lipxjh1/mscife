# 🔍 DEBUG REPORT: Transaction Failed Khi Blockchain Thành Công

## 📅 NGÀY: 2025-12-01
## 🎯 VẤN ĐỀ: User báo "Transaction failed" nhưng blockchain đã trừ tiền

## 1. TRANSACTION STATUS
- ❌ **Không thể kiểm tra** database do không có access đến MongoDB server
- ❌ **Backend không chạy locally** (WSL2 environment)
- ✅ **Đã xác định flow frontend xử lý transaction**

## 2. ROOT CAUSE PHÁT HIỆN

### Nguyên nhân chính: Frontend báo lỗi sai thời điểm
- **File:** `/mnt/d/fe/fe/src/App.jsx:533-583`
- **Evidence:** Code `ReactSendTransaction` chỉ báo success/fail dựa trên TON Connect response

```javascript
// App.jsx:533-583
try {
    console.log("🔗 Calling tonConnectUI.sendTransaction...");
    const result = await tonConnectUI.sendTransaction(transaction);

    console.log("✅ SUCCESS! Transaction sent:", result);

    if (onSuccess && typeof onSuccess === "function") {
        onSuccess(result); // ❌ Báo success NGAY LẬP TỨC
    }
} catch (error) {
    // ... handle error
    if (onError && typeof onError === "function") {
        onError(new Error(userMessage)); // ❌ Báo failed nếu có lỗi
    }
}
```

### Vấn đề chi tiết:

1. **Frontend không chờ backend xác nhận**
   - TON Connect chỉ đảm bảo transaction được GỬI đến blockchain
   - Cần vài giây đến vài phút để transaction được confirm
   - Backend cần time để scan và process transaction

2. **Memo được tạo đúng format**
   - **File:** `/mnt/d/fe/fe/src/App.jsx:484`
   - **Code:** `.storeStringTail(\`\${centerData.userInfo.UserId || ""}|\${amount}\`)`
   - **Ví dụ:** "A000000010|0.5" ✅ Format đúng

3. **Flow xử lý hiện tại:**
   ```
   User click mua → Frontend gửi TX → Frontend báo success NGAY
                                            ↓
                                      Backend扫描 (chạy sau)
                                            ↓
                                      Backend xử lý → Cộng M-Coin
   ```

## 3. TIMELINE LỖI

```
T+0s:   User click mua 0.5 TON M-Coin
T+1s:   Frontend tạo memo "A000000010|0.5"
T+2s:   TON Connect gửi transaction
T+3s:   Frontend báo "Transaction successful" ❌ (QUÁ SỚM!)
T+10s:  Blockchain confirm transaction
T+60s:  Backend job扫描 và xử lý transaction
T+61s:  User nhận được M-Coin (nếu backend hoạt động)
```

**Vấn đề:** Frontend báo failed/success dựa trên TON Connect error, KHÔNG dựa trên backend processing结果!

## 4. GIẢ THUYẾT

| # | Giả thuyết | Khả năng | Evidence |
|---|------------|----------|----------|
| 1 | **Frontend timeout trước khi backend xử lý** | **HIGH** | Frontend báo success/fail NGAY LẬP TỨC khi TON Connect return |
| 2 | Backend job chưa chạy或delay | **HIGH** | Backend scan job có thể chạy mỗi phút, frontend báo kết quả sau 3 giây |
| 3 | UserId format không khớp (A000000010) | **MEDIUM** | Memo format看起来正确, cần verify backend parsing |
| 4 | Backend processing error nhưng không log | **LOW** | Thường có error handling |

## 5. FLOW THỰC TẾ VỀ TECHNICAL

### Frontend App.jsx:
```javascript
// 1. Gửi transaction qua TON Connect
const result = await tonConnectUI.sendTransaction(transaction);

// 2. Báo success NGAY LẬP TỨC
if (onSuccess) onSuccess(result);

// 3. User thấy "Transaction successful"
// 4. Nhưng backend chưa chắc đã xử lý xong!
```

### Backend (Expected):
1. Nhận transaction từ blockchain
2. Parse memo: "A000000010|0.5"
3. Validate user A000000010 tồn tại
4. Cộng 0.5 TON vào ví user
5. Cộng M-Coin vào account user
6. Log transaction success

## 6. ĐỀ XUẤT FIX

### 6.1 Frontend - Thêm trạng thái "Processing"
```javascript
// Thay vì success/fail, có 3 trạng thái:
// 1. "Transaction sent" (gửi thành công)
// 2. "Transaction failed" (gửi thất bại)
// 3. "Processing payment" (đang xử lý)
```

### 6.2 Backend - Thêm API endpoint để check status
```javascript
// POST /api/transaction-status
// { transactionHash, userId }
// Trả về: { status: "pending|confirmed|failed", message }
```

### 6.3 Frontend - Poll backend để check real status
```javascript
// Sau khi gửi TX, poll backend mỗi 5 giây trong 5 phút
// Khi backend confirm thì báo "Transaction successful"
// Khi backend báo lỗi thì báo "Transaction failed"
```

## 7. CÁC TEST ĐỂ VERIFY

### 7.1 Test Case 1: Normal Flow
1. User mua M-Coin 0.5 TON
2. Frontend hiển thị "Processing payment..."
3. Backend nhận và process transaction thành công
4. Frontend poll và nhận status = "confirmed"
5. Hiển thị "Transaction successful"

### 7.2 Test Case 2: Backend Error
1. User mua M-Coin 0.5 TON
2. Frontend hiển thị "Processing payment..."
3. Backend nhận transaction nhưng có lỗi (không tìm thấy user)
4. Frontend poll và nhận status = "failed"
5. Hiển thị "Transaction failed" với message cụ thể

### 7.3 Test Case 3: Timeout
1. User mua M-Coin 0.5 TON
2. Frontend hiển thị "Processing payment..."
3. Backend không process trong 5 phút
4. Frontend timeout và báo "Transaction processing timeout"
5. User cần liên hệ support

## 8. KẾT LUẬN

**Root Cause:** Frontend báo transaction status based on TON Connect response, not backend processing result.

**Impact:**
- User có thể thấy "failed" dù transaction thành công
- User có thể thấy "success" nhưng backend chưa xử lý xong
- Poor user experience và support tickets

**Priority:** HIGH - Ảnh hưởng trực tiếp đến revenue và user trust

**Next Steps:**
1. Check backend logs và database để confirm
2. Implement real-time status checking
3. Add proper transaction status UI
4. Test end-to-end flow

---

## 🔧 CÁC LỆNH ĐỂ VERIFY KHI CÓ ACCESS

```bash
# 1. Check transaction trong database
mongosh "mongodb://..." --eval "db.transactions.find({transactionId: /A000000010/}).pretty()"

# 2. Check user exists
mongosh "mongodb://..." --eval "db.users.findOne({UserId: 'A000000010'})"

# 3. Check backend logs
pm2 logs ton-scanner --lines 100

# 4. Check PM2 status
pm2 status
```

**Status:** PARTIAL INVESTIGATION COMPLETE - Need backend access for full verification
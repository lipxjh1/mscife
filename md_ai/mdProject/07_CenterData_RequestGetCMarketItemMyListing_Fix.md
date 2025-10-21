# 07. Sửa Lỗi Logic Trong CenterData.RequestGetCMarketItemMyListing

## Tóm Tắt Vấn Đề

**File**: `src/game/Data/CenterData.js`  
**Method**: `RequestGetCMarketItemMyListing`  
**Dòng**: 5743-5751  
**Mức độ nghiêm trọng**: **HIGH** - Logic error có thể gây crash hoặc trả về dữ liệu sai

## Chi Tiết Vấn Đề

### 1. Ghi Đè Tham Số Đầu Vào (Line 5744)

```javascript
// CODE SAI:
RequestGetCMarketItemMyListing(status, page, limit, onSuccess, onError) {
    status = ["active", "cancelled", "sold"]; // ❌ Ghi đè tham số đầu vào
```

**Vấn đề**:

-   Tham số `status` được truyền vào từ bên ngoài bị ghi đè hoàn toàn
-   Mất đi khả năng filter theo status cụ thể mà người dùng muốn
-   Vi phạm nguyên tắc "Don't modify input parameters"

### 2. Vòng Lặp Sai Cú Pháp (Line 5748-5750)

```javascript
// CODE SAI:
for (const key in status) {
    statusStr += key + ","; // ❌ Lặp qua index thay vì giá trị
}
```

**Vấn đề**:

-   `for...in` trên array sẽ lặp qua các **index** (0, 1, 2) thay vì **values** ("active", "cancelled", "sold")
-   Kết quả: `statusStr = "0,1,2,"` thay vì `"active,cancelled,sold,"`
-   API sẽ nhận được query string sai: `?status=0,1,2,` thay vì `?status=active,cancelled,sold,`

## Tác Hại Tiềm Ẩn

### Impact Ngắn Hạn:

-   API request trả về lỗi 400 Bad Request
-   Không thể lấy được danh sách listing của user
-   UI hiển thị lỗi hoặc không có dữ liệu

### Impact Dài Hạn:

-   Người dùng không thể quản lý các listing của mình
-   Tính năng Center Market bị hỏng hoàn toàn
-   Mất doanh thu từ giao dịch

### Ví Dụ Minh Họa:

```javascript
// Khi gọi:
centerData.RequestGetCMarketItemMyListing(
    ["active"],
    1,
    10,
    onSuccess,
    onError
);

// Code cũ sẽ tạo URL:
// /api/market-item/my-listings?status=0,1,2,&page=1&limit=10
// ❌ Server sẽ trả về lỗi vì không hiểu status "0,1,2"

// Code mới sẽ tạo URL:
// /api/market-item/my-listings?status=active,&page=1&limit=10
// ✅ Server sẽ trả về đúng danh sách listing có status "active"
```

## Giải Pháp Đã Áp Dụng

### 1. Bảo Vệ Tham Số Đầu Vào

```javascript
// CODE ĐÚNG:
const statusArray = status || ["active", "cancelled", "sold"];
```

**Cải thiện**:

-   Sử dụng `const` để tránh ghi đè
-   Fallback về giá trị mặc định nếu `status` là null/undefined
-   Giữ nguyên giá trị được truyền vào nếu có

### 2. Sửa Vòng Lặp

```javascript
// CODE ĐÚNG:
for (const statusValue of statusArray) {
    statusStr += statusValue + ",";
}
```

**Cải thiện**:

-   Sử dụng `for...of` để lặp qua **values** thay vì **keys**
-   Biến `statusValue` có tên rõ ràng, dễ hiểu
-   Kết quả chính xác: `"active,cancelled,sold,"`

## Code Hoàn Chỉnh Sau Khi Sửa

```javascript
RequestGetCMarketItemMyListing(status, page, limit, onSuccess, onError) {
    // Nếu status không được truyền vào hoặc là null/undefined, sử dụng giá trị mặc định
    const statusArray = status || ["active", "cancelled", "sold"];

    let statusStr = "";

    for (const statusValue of statusArray) {
        statusStr += statusValue + ",";
    }

    const url = `/api/market-item/my-listings?status=${statusStr}&page=${page}&limit=${limit}`;
    // ... rest of the method
}
```

## Kiểm Tra Tương Tự

Cần kiểm tra các method khác trong CenterData có pattern tương tự:

1. `RequestGetCMarketCharacterMyListings` (line 6025)
2. `RequestGetCMarketItemMyBuy` (line 5911)
3. `RequestGetCMarketCharacterMyBuy` (line 6067)

## Kết Luận

Đây là một lỗi logic nghiêm trọng có thể làm hỏng hoàn toàn tính năng Center Market. Việc sửa chữa đã:

✅ **Bảo vệ tham số đầu vào** - Không ghi đè giá trị được truyền vào  
✅ **Sửa vòng lặp** - Lặp qua values thay vì keys  
✅ **Thêm fallback** - Xử lý trường hợp status null/undefined  
✅ **Cải thiện readability** - Tên biến rõ ràng, comment giải thích

**Priority**: **HIGH** - Cần deploy ngay để tránh ảnh hưởng đến user experience.

# 08 - AlertPopup Message Conversion Enhancement

## Tổng quan thay đổi

Cải thiện hàm `CreateAlertPopup` trong file `src/game/scenes/Share/AlertPopup.js` để xử lý các trường hợp message không phải là string một cách an toàn và hiệu quả.

## Vấn đề gốc

-   Hàm `CreateAlertPopup` nhận tham số `message` và emit trực tiếp mà không validation
-   Khi `message` là object, array, null, undefined hoặc các kiểu dữ liệu khác, có thể gây lỗi hiển thị
-   Thiếu xử lý các edge case có thể dẫn đến crash hoặc hiển thị không đúng

## Giải pháp thực hiện

### 1. Thêm hàm `convertMessageToString`

```javascript
function convertMessageToString(message) {
    // Xử lý null/undefined
    if (message == null) {
        return "";
    }

    // Giữ nguyên nếu đã là string
    if (typeof message === "string") {
        return message;
    }

    // Convert object/array thành JSON
    if (typeof message === "object") {
        try {
            return JSON.stringify(message, null, 2);
        } catch (error) {
            console.warn(
                "AlertPopup: Không thể convert object thành JSON:",
                error
            );
            return "[Object không thể hiển thị]";
        }
    }

    // Convert các kiểu khác
    try {
        return String(message);
    } catch (error) {
        console.warn(
            "AlertPopup: Không thể convert message thành string:",
            error
        );
        return "[Không thể hiển thị message]";
    }
}
```

### 2. Cập nhật hàm `CreateAlertPopup`

-   Sử dụng `convertMessageToString(message)` trước khi emit
-   Cập nhật JSDoc để phản ánh tham số `message` có thể là bất kỳ kiểu dữ liệu nào

### 3. Các trường hợp được xử lý

#### Case 1: Message là string (giữ nguyên)

```javascript
CreateAlertPopup(scene, "Hello World", callback);
// Output: "Hello World"
```

#### Case 2: Message là object

```javascript
CreateAlertPopup(scene, { error: "Network failed", code: 500 }, callback);
// Output: JSON.stringify với format đẹp
```

#### Case 3: Message là array

```javascript
CreateAlertPopup(scene, ["Error 1", "Error 2"], callback);
// Output: ["Error 1", "Error 2"] dạng JSON
```

#### Case 4: Message là null/undefined

```javascript
CreateAlertPopup(scene, null, callback);
CreateAlertPopup(scene, undefined, callback);
// Output: "" (empty string)
```

#### Case 5: Message là number/boolean

```javascript
CreateAlertPopup(scene, 404, callback);
CreateAlertPopup(scene, true, callback);
// Output: "404", "true"
```

#### Case 6: Circular reference object

```javascript
const obj = { name: "test" };
obj.self = obj; // circular reference
CreateAlertPopup(scene, obj, callback);
// Output: "[Object không thể hiển thị]"
```

## Lợi ích của giải pháp

### 1. **An toàn (Safety)**

-   Không crash khi nhận object hoặc null
-   Xử lý graceful cho circular references
-   Error handling cho các trường hợp không thể convert

### 2. **Linh hoạt (Flexibility)**

-   Chấp nhận mọi kiểu dữ liệu input
-   Tự động convert phù hợp với từng kiểu
-   Giữ nguyên behavior cũ cho string input

### 3. **Debug-friendly**

-   Object được hiển thị dưới dạng JSON có format
-   Error messages rõ ràng trong console
-   Fallback messages hữu ích cho user

### 4. **Performance**

-   Chỉ convert khi cần thiết
-   Sử dụng typeof check nhanh
-   Không ảnh hưởng đến string input (case phổ biến nhất)

## Tác động đến hệ thống

### Positive Impact

-   ✅ Tăng độ ổn định của AlertPopup system
-   ✅ Giảm risk crash do invalid message type
-   ✅ Cải thiện developer experience khi debug
-   ✅ Tương thích ngược 100% với code cũ

### No Negative Impact

-   ✅ Không thay đổi API signature
-   ✅ Không ảnh hưởng performance với string input
-   ✅ Không breaking changes

## Test Cases Đề xuất

### Unit Tests

```javascript
// Test string input
expect(convertMessageToString("Hello")).toBe("Hello");

// Test object input
expect(convertMessageToString({ a: 1 })).toBe('{\n  "a": 1\n}');

// Test null/undefined
expect(convertMessageToString(null)).toBe("");
expect(convertMessageToString(undefined)).toBe("");

// Test number/boolean
expect(convertMessageToString(123)).toBe("123");
expect(convertMessageToString(true)).toBe("true");

// Test circular reference
const circular = {};
circular.self = circular;
expect(convertMessageToString(circular)).toBe("[Object không thể hiển thị]");
```

### Integration Tests

```javascript
// Test với real Phaser scene
CreateAlertPopup(scene, { error: "API failed" }, () => {
    // Verify popup hiển thị JSON formatted message
});
```

## Maintenance Notes

### Code Review Checklist

-   [ ] Hàm `convertMessageToString` handle tất cả edge cases
-   [ ] Error logging không spam console
-   [ ] Performance impact minimal cho string input
-   [ ] JSDoc documentation đầy đủ

### Future Enhancements

1. **Configurable formatting**: Cho phép custom JSON format
2. **Truncation**: Giới hạn độ dài message cho object lớn
3. **Type-specific formatting**: Custom format cho Date, Error objects
4. **Localization**: Error messages theo ngôn ngữ user

## Kết luận

Thay đổi này tăng cường độ robust của AlertPopup system mà không ảnh hưởng đến functionality hiện tại. Đây là một improvement quan trọng cho stability và developer experience của dự án.

---

**File được cập nhật:** `src/game/scenes/Share/AlertPopup.js`  
**Ngày cập nhật:** 18/09/2025  
**Tác giả:** AI Assistant  
**Review status:** Pending

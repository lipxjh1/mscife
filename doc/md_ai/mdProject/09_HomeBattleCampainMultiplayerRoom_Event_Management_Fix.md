# 09. Sửa Lỗi Event Management trong HomeBattleCampainMultiplayerRoom.js

## Tóm Tắt

Phát hiện và sửa lỗi nghiêm trọng trong cách quản lý event handlers trong file `HomeBattleCampainMultiplayerRoom.js`. Vấn đề chính là việc sử dụng anonymous functions không nhất quán giữa register và remove events, dẫn đến memory leaks và event handlers không được cleanup đúng cách.

## Vấn Đề Được Phát Hiện

### 1. **Event Handler References Không Nhất Quán**

**Mức độ nghiêm trọng**: Critical

**Mô tả vấn đề**:

-   Code cũ sử dụng anonymous functions trong cả `on()` và `off()` methods
-   JavaScript tạo ra reference mới cho mỗi anonymous function
-   `socketServiceMultiplayer.off()` không thể remove được event handler vì reference khác nhau

**Vị trí**: Lines 92-116 trong file `HomeBattleCampainMultiplayerRoom.js`

**Code có vấn đề**:

```javascript
function RegisterRoomCloseEvents() {
    socketServiceMultiplayer.on("room:closed", (response) => {
        RoomClosed(response);
    });
}

function RemoveRoomCloseEvents() {
    socketServiceMultiplayer.off("room:closed", (response) => {
        RoomClosed(response);
    });
}
```

**Tác hại tiềm ẩn**:

-   **Memory Leaks**: Event handlers cũ không được cleanup, tích tụ trong memory
-   **Duplicate Event Handling**: Có thể xử lý cùng một event nhiều lần
-   **Performance Degradation**: Càng nhiều handlers tích tụ, performance càng giảm
-   **Unpredictable Behavior**: Logic có thể chạy nhiều lần không mong muốn

**Ví dụ minh họa**:
Khi user vào/ra room nhiều lần, mỗi lần vào sẽ đăng ký thêm event handler mới, nhưng khi ra không remove được handler cũ. Sau 10 lần vào/ra, sẽ có 10 event handlers cùng xử lý một event, gây ra:

-   Game lag do xử lý quá nhiều
-   UI update nhiều lần
-   Có thể crash app trên mobile

## Giải Pháp Đã Triển Khai

### 1. **Lưu Trữ Event Handler References**

```javascript
// Store event handler references for proper cleanup
let roomClosedHandler = null;
let roomPlayerJoinedHandler = null;
```

### 2. **Register Events với Stored References**

```javascript
function RegisterRoomCloseEvents() {
    // Create and store the handler reference
    roomClosedHandler = (response) => {
        RoomClosed(response);
    };

    socketServiceMultiplayer.on("room:closed", roomClosedHandler);
}
```

### 3. **Remove Events với Proper References**

```javascript
function RemoveRoomCloseEvents() {
    // Use the stored reference for proper removal
    if (roomClosedHandler) {
        socketServiceMultiplayer.off("room:closed", roomClosedHandler);
        roomClosedHandler = null;
    }
}
```

## Lợi Ích Của Giải Pháp

### 1. **Memory Management**

-   Event handlers được cleanup đúng cách
-   Không có memory leaks
-   Performance ổn định theo thời gian

### 2. **Predictable Behavior**

-   Mỗi event chỉ có một handler active
-   Logic chạy đúng một lần cho mỗi event
-   Behavior nhất quán

### 3. **Maintainability**

-   Code rõ ràng, dễ debug
-   Handler references được quản lý tập trung
-   Dễ dàng thêm/bớt events

## Best Practices Được Áp Dụng

### 1. **Event Handler Management Pattern**

```javascript
// Pattern: Store reference → Register → Remove với reference
let handlerRef = null;

function register() {
    handlerRef = (data) => {
        /* logic */
    };
    emitter.on("event", handlerRef);
}

function remove() {
    if (handlerRef) {
        emitter.off("event", handlerRef);
        handlerRef = null;
    }
}
```

### 2. **Null Safety**

-   Kiểm tra handler reference trước khi remove
-   Set null sau khi remove để tránh reuse

### 3. **Consistent Naming**

-   Handler variables có tên mô tả rõ chức năng
-   Function names theo pattern Register/Remove

## Khuyến Nghị Tiếp Theo

### 1. **Audit Toàn Bộ Codebase**

Cần kiểm tra tất cả files khác có sử dụng pattern tương tự:

-   `socketService.js`
-   `socketBoss.js`
-   Các scene files khác có event handling

### 2. **Tạo Event Management Utility**

Tạo một utility class để quản lý events tập trung:

```javascript
class EventManager {
    constructor() {
        this.handlers = new Map();
    }

    register(emitter, eventName, handler) {
        const key = `${eventName}`;
        if (this.handlers.has(key)) {
            this.remove(emitter, eventName);
        }
        this.handlers.set(key, handler);
        emitter.on(eventName, handler);
    }

    remove(emitter, eventName) {
        const key = `${eventName}`;
        const handler = this.handlers.get(key);
        if (handler) {
            emitter.off(eventName, handler);
            this.handlers.delete(key);
        }
    }

    cleanup(emitter) {
        for (const [eventName, handler] of this.handlers) {
            emitter.off(eventName, handler);
        }
        this.handlers.clear();
    }
}
```

### 3. **Testing**

-   Tạo unit tests cho event management
-   Test memory leaks với repeated register/remove
-   Performance testing với multiple handlers

## Tác Động Dự Kiến

### 1. **Immediate Impact**

-   Giảm memory usage
-   Cải thiện stability
-   Behavior predictable hơn

### 2. **Long-term Impact**

-   Code maintainable hơn
-   Dễ dàng debug event-related issues
-   Foundation tốt cho future features

## Kết Luận

Việc sửa lỗi event management này là **critical** cho stability và performance của multiplayer features. Pattern này cần được áp dụng consistently across toàn bộ codebase để đảm bảo:

1. **Memory Safety**: Không có leaks
2. **Performance**: Optimal event handling
3. **Maintainability**: Code dễ hiểu và sửa chữa
4. **Reliability**: Behavior nhất quán và predictable

Đây là foundation quan trọng cho việc phát triển các tính năng multiplayer phức tạp hơn trong tương lai.

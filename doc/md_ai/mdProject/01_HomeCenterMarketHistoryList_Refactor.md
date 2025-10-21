# 01. Refactor HomeCenterMarketHistoryList.js theo Pattern HomeCenterMarketMain.js

## Tổng quan

Đã chỉnh sửa file `HomeCenterMarketHistoryList.js` để áp dụng pattern tổ chức từ `HomeCenterMarketMain.js`, cho phép ẩn/hiện các UI components Item, Character, MSCI thông qua các nút category.

## Các thay đổi chính

### 1. Cấu trúc Container mới

-   **container_main**: Container chính chứa toàn bộ UI
-   **container_history_main_sub**: Container con để chứa các module Item/Character/MSCI
-   **container_history_cat_buttons**: Container chứa các nút category

### 2. Import các Module con

```javascript
import {
    CreateCenterMarketHistoryListItem,
    Close as CloseItem,
    Destroy as DestroyItem,
} from "./HomeCenterMarketHistoryListItem.js";

import {
    CreateCenterMarketHistoryListCharacter,
    Close as CloseCharacter,
    Destroy as DestroyCharacter,
} from "./HomeCenterMarketHistoryListCharacter.js";

import {
    CreateCenterMarketHistoryListMSCI,
    Close as CloseMSCI,
    Destroy as DestroyMSCI,
} from "./HomeCenterMarketHistoryListMSCI.js";
```

### 3. Các nút Category

-   **btn_item**: Nút chuyển đổi sang Item history
-   **btn_character**: Nút chuyển đổi sang Character history
-   **btn_msci**: Nút chuyển đổi sang MSCI history

### 4. Logic Ẩn/Hiện

-   **ActiveItem()**: Kích hoạt Item history, ẩn Character và MSCI
-   **ActiveCharacter()**: Kích hoạt Character history, ẩn Item và MSCI
-   **ActiveMSCI()**: Kích hoạt MSCI history, ẩn Item và Character

### 5. Hàm CreateCatButton()

Tạo các nút category với:

-   Kích thước: 360x120 pixels
-   Vị trí: 3 nút nằm ngang ở vị trí y=310
-   Tương tác: hover effects và click handlers
-   Trạng thái: selected/unselected với màu sắc khác nhau

## Cập nhật các File con

### HomeCenterMarketHistoryListItem.js

-   Thay đổi import từ `container_center_market_history_sub` sang `container_history_main_sub`
-   Cập nhật container parent để sử dụng container mới
-   **Sửa lỗi**: Export hàm `Destroy` và `Close` để có thể import từ file chính

### HomeCenterMarketHistoryListCharacter.js

-   Thay đổi import từ `container_center_market_history_sub` sang `container_history_main_sub`
-   Cập nhật container parent để sử dụng container mới
-   **Sửa lỗi**: Export hàm `Destroy` và `Close` để có thể import từ file chính

### HomeCenterMarketHistoryListMSCI.js

-   Thay đổi import từ `container_center_market_history_sub` sang `container_history_main_sub`
-   Cập nhật container parent để sử dụng container mới
-   **Sửa lỗi**: Export hàm `Destroy` và `Close` để có thể import từ file chính

## Lỗi đã sửa

### Lỗi Export Destroy

**Vấn đề**: Các file con không export hàm `Destroy`, gây ra lỗi:

```
SyntaxError: The requested module does not provide an export named 'Destroy'
```

**Giải pháp**:

-   Thêm `export` keyword cho hàm `Destroy` trong tất cả 3 file con
-   Sửa hàm `Close` để truyền đúng tham số `scene` cho `Destroy`

```javascript
// Trước
function Destroy(scene) { ... }
export function Close(scene) { Destroy(); }

// Sau
export function Destroy(scene) { ... }
export function Close(scene) { Destroy(scene); }
```

## Lợi ích của Refactor

### 1. Tổ chức Code tốt hơn

-   Tách biệt rõ ràng giữa các module
-   Dễ dàng maintain và extend
-   Tuân thủ Single Responsibility Principle

### 2. UX/UI cải thiện

-   Người dùng có thể dễ dàng chuyển đổi giữa các loại history
-   Giao diện nhất quán với Main Market
-   Visual feedback rõ ràng cho trạng thái active

### 3. Performance

-   Chỉ load module cần thiết
-   Giảm memory usage khi không sử dụng
-   Tối ưu rendering performance

### 4. Maintainability

-   Code dễ đọc và hiểu
-   Dễ dàng thêm category mới
-   Pattern nhất quán trong toàn bộ project

## Cách sử dụng

```javascript
// Tạo History List với category buttons
CreateCenterMarketHistoryList(scene);

// Các hàm này được gọi tự động khi click nút:
// - ActiveItem(scene)
// - ActiveCharacter(scene)
// - ActiveMSCI(scene)

// Đóng toàn bộ History List
Close(scene);
```

## Kết luận

Refactor thành công đã tạo ra một cấu trúc code sạch sẽ, dễ maintain và có UX tốt hơn. Pattern này có thể được áp dụng cho các module khác trong project để đảm bảo tính nhất quán.

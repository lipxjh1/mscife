## 08 - HomeGuild: Pagination + reuseCellContainer cho MyRequest và xác nhận None

### Phạm vi

-   Cập nhật `src/game/scenes/Home/HomeGuild/HomeGuildMyRequest.js` để chuyển từ `scrollablePanel` sang `rexUI.gridTable` với `reuseCellContainer`, thêm phân trang cuộn vô hạn.
-   Rà soát `src/game/scenes/Home/HomeGuild/HomeGuildNone.js` xác nhận đã dùng `gridTable` + `reuseCellContainer` và đã có infinite scroll.

### Thay đổi chính

-   `HomeGuildMyRequest.js`

    -   Thêm state phân trang: `currentPage`, `totalPages`, `isUpdating`, hằng `PAGE_LIMIT = 10`.
    -   Khởi tạo danh sách bằng `gridTable` với `table.reuseCellContainer = true`.
    -   Áp dụng cơ chế infinite scroll: lắng nghe `pointermove` và `scroll`, khi `gridTable.t > 0.9` và không cập nhật thì gọi API nạp thêm trang tiếp theo.
    -   Hàm `RequestGetGuildMyRequestList`:
        -   Trang đầu: set `currentPage = 1`, đọc `result.pagination.pages` để set `totalPages`.
        -   Tạo danh sách lần đầu qua `CreateRequestItemList`.
    -   Hàm `UpdateMyRequestList`: tăng `currentPage`, gọi API và append (`setItems` + `refresh`).
    -   Chuyển item renderer sang mô hình cell tái sử dụng: `createRequestItem(scene, itemWidth, itemHeight)` và `container.updateContent(data)` để cập nhật nội dung.
    -   Cleanup trong `Destroy()`: hủy `gridTable`, reset state phân trang.

-   `HomeGuildNone.js`
    -   Đã dùng `gridTable` với `reuseCellContainer: true` sẵn.
    -   Đã có phân trang và cơ chế infinite scroll tương tự (`UpdateGuildList`, `CreateUpdateGuildList`).
    -   Không cần chỉnh.

### Lý do kỹ thuật

-   `reuseCellContainer` giúp tái sử dụng container per-cell, giảm tạo/hủy DisplayObjects => tiết kiệm CPU/GPU, tránh GC spikes, mượt hơn trên mobile.
-   Infinite scroll dựa trên `t` (scroll progress) cho UX liền mạch, không block khi chuyển trang.

### Ảnh hưởng hiệu năng

-   Giảm allocation khi cuộn danh sách dài.
-   Giảm rác bộ nhớ, hạn chế stutter trên thiết bị cấu hình thấp.

### Kiểm thử nhanh

-   Mở màn `Guild join requests`:
    -   Xác thực danh sách hiển thị đúng dữ liệu `requests`.
    -   Cuộn gần cuối danh sách (khi `t > 0.9`), hệ thống tự nạp thêm trang cho đến khi hết `totalPages`.
    -   Nhấn Cancel ở bất kỳ item sẽ gọi lại danh sách (`RequestMyList`) và render ổn định.
-   Mở màn `Guild` (None):
    -   Tìm kiếm theo tên, xác thực phân trang và append hoạt động bình thường.

### Lưu ý tích hợp

-   API `RequestGetGuildMyRequestList` cần trả `pagination.pages`. Nếu không, fallback `totalPages = 1`.
-   Đảm bảo `rexUI` đã có mặt trong scene (hiện dự án đang dùng sẵn).

### File liên quan

-   Đã sửa: `src/game/scenes/Home/HomeGuild/HomeGuildMyRequest.js`
-   Đã kiểm: `src/game/scenes/Home/HomeGuild/HomeGuildNone.js`

### 03 - Phân trang cuộn vô hạn cho Center Market Items Detail

-   **Phạm vi**: `src/game/scenes/Home/HomeCenterMarket/HomeCenterMarketMainItemsDetail.js`
-   **Mục tiêu**: Bổ sung phân trang cuộn vô hạn (lazy load) cho danh sách listing trong màn chi tiết item của Center Market, dựa theo mẫu `HomeMSCITokenomicHistory.js`.

#### Thay đổi chính

-   Thêm state phân trang: `currentPage`, `totalPages`, `isUpdating`, hằng `PAGE_LIMIT`.
-   Lấy `totalPages` từ `result.pagination.pages` của API `centerData.RequestGetCMarketItemListing`.
-   Khởi tạo trang đầu khi mở màn: gọi API trang 1, render kết quả.
-   Lắng nghe kéo/scroll của `scrollablePanel` để phát hiện khi gần cuối (`t > 0.9`) và gọi tiếp trang sau.
-   Append item mới vào panel hiện tại, không reset danh sách.
-   Chặn spam gọi API bằng `isUpdating`.

#### Hành vi người dùng

-   Khi người dùng kéo xuống gần cuối danh sách, hệ thống tự động nạp thêm listing nếu còn trang.
-   Khi mua thành công, quay về danh sách items (`CreateCenterMarketItems(scene)`) như logic sẵn có.

#### API liên quan

-   `centerData.RequestGetCMarketItemListing(itemCode, page, limit, onSuccess, onError)`
    -   Sử dụng `pagination.pages` để xác định tổng số trang.

#### Lợi ích

-   Cải thiện UX bằng cuộn vô hạn, giảm thời gian chờ ban đầu.
-   Giảm tải bộ nhớ/băng thông nhờ nạp theo trang.

#### Lưu ý hiệu năng & mobile

-   Giới hạn `PAGE_LIMIT = 10` để cân đối số lượng item mỗi lần nạp.
-   Dùng cờ `isUpdating` ngăn chặn gọi API trùng lặp khi người dùng cuộn nhanh.

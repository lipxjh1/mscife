### 04 - Phân trang cuộn vô hạn cho Center Market Order Sell Items

-   **Phạm vi**: `src/game/scenes/Home/HomeCenterMarket/HomeCenterMarketOrderSellItems.js`
-   **Mục tiêu**: Bổ sung phân trang cuộn vô hạn (lazy load) cho danh sách listing của người dùng trong Center Market, dựa theo mẫu `HomeMSCITokenomicHistory.js`.

#### Thay đổi chính

-   **Chuyển đổi kiến trúc**: Thay thế `scrollablePanel + gridSizer` bằng `gridTable` với `reuseCellContainer: true`.
-   **Thêm state phân trang**: `currentPage`, `totalPages`, `isUpdating`, hằng `PAGE_LIMIT = 10`.
-   **Lấy thông tin phân trang**: Sử dụng `result.pagination.pages` từ API `centerData.RequestGetCMarketItemMyListing`.
-   **Factory pattern**: Tạo `createSellItem(scene, itemWidth, itemHeight)` với method `updateContent(data)` để tái sử dụng cell.
-   **Logic cuộn vô hạn**: Lắng nghe kéo/scroll để phát hiện khi gần cuối (`t > 0.9`) và gọi `UpdateSellItemList()`.
-   **Append dữ liệu**: Sử dụng `gridTable.setItems([...currentItems, ...newItems])` và `gridTable.refresh()`.

#### Hành vi người dùng

-   Khi mở màn hình, hiển thị trang đầu tiên của danh sách listing.
-   Khi kéo xuống gần cuối danh sách, tự động nạp thêm listing nếu còn trang.
-   Khi hủy listing thành công, refresh toàn bộ danh sách từ trang 1.

#### API liên quan

-   `centerData.RequestGetCMarketItemMyListing(status, page, limit, onSuccess, onError)`
    -   Sử dụng `pagination.pages` để xác định tổng số trang.
    -   Response structure: `{ success, data: [...], pagination: { page, limit, total, pages } }`

#### Cải tiến hiệu năng

-   **Tái sử dụng cell**: Giảm memory footprint khi có nhiều item.
-   **Lazy loading**: Chỉ nạp dữ liệu khi cần thiết, giảm thời gian load ban đầu.
-   **Event listener tối ưu**: Gắn listener một lần, sử dụng `container.itemData` động.

#### Lưu ý kỹ thuật

-   **Cờ `isUpdating`**: Ngăn chặn gọi API trùng lặp khi người dùng cuộn nhanh.
-   **Error handling**: Xử lý lỗi API và reset trạng thái `isUpdating`.
-   **Memory management**: Sử dụng `reuseCellContainer` để tối ưu bộ nhớ.

#### So sánh với mẫu

-   **HomeMSCITokenomicHistory.js**: Cùng pattern `gridTable + reuseCellContainer + createCellContainerCallback`.
-   **HomeCenterMarketMainItemsDetail.js**: Cùng logic phân trang nhưng khác API và UI layout.
-   **HomeNeuralinkCenterMarketHistorySell.js**: Cùng scrollablePanel nhưng không có reuseCellContainer.

#### Lợi ích

-   **UX cải thiện**: Cuộn mượt mà, không cần chờ load toàn bộ dữ liệu.
-   **Performance**: Giảm tải bộ nhớ và băng thông.
-   **Maintainability**: Code dễ bảo trì với pattern nhất quán.


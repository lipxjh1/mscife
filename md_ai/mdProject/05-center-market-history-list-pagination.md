### 05 - Phân trang cuộn vô hạn cho Center Market History List

-   **Phạm vi**: `src/game/scenes/Home/HomeCenterMarket/HomeCenterMarketHistoryList.js`
-   **Mục tiêu**: Bổ sung phân trang cuộn vô hạn (lazy load) cho danh sách lịch sử listing trong Center Market, dựa theo mẫu `HomeMSCITokenomicHistory.js` và cập nhật xử lý cấu trúc dữ liệu mới.

#### Thay đổi chính

-   **Chuyển đổi kiến trúc**: Thay thế `scrollablePanel + gridSizer` bằng `gridTable` với `reuseCellContainer: true`.
-   **Thêm state phân trang**: `currentPage`, `totalPages`, `isUpdating`, hằng `PAGE_LIMIT = 10`.
-   **Cập nhật API call**: Sử dụng `centerData.RequestGetCMarketItemMyListing(page, limit, onSuccess, onError)` với tham số phân trang.
-   **Lấy thông tin phân trang**: Sử dụng `result.pagination.pages` từ response API.
-   **Factory pattern**: Tạo `createHistoryItem(scene, itemWidth, itemHeight)` với method `updateContent(data)` để tái sử dụng cell.
-   **Logic cuộn vô hạn**: Lắng nghe kéo/scroll để phát hiện khi gần cuối (`t > 0.9`) và gọi `UpdateHistoryList()`.
-   **Append dữ liệu**: Sử dụng `gridTable.setItems([...currentItems, ...newItems])` và `gridTable.refresh()`.

#### Cập nhật cấu trúc dữ liệu

-   **API Response mới**:

    ```json
    {
        "success": true,
        "data": [
            {
                "listingId": "68bea595f69883c42470ae7a",
                "itemCode": "DOGE_SHIELD",
                "itemName": "DOGE Shield",
                "quantity": 1,
                "pricePerUnit": 1,
                "totalPrice": 1,
                "status": "sold",
                "soldTo": "68660ba1595ccd94acf9fcf4",
                "soldAt": "2025-09-08T10:14:04.996Z",
                "expiresAt": "2025-10-08T09:44:53.457Z",
                "createdAt": "2025-09-08T09:44:53.457Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 4,
            "pages": 1
        }
    }
    ```

-   **Xử lý dữ liệu đơn giản hóa**:
    -   Sử dụng trực tiếp `data.itemName`, `data.totalPrice`, `data.status`
    -   Loại bỏ logic phức tạp xử lý `assetType`, `details`, `saleInfo`
    -   Hiển thị thông tin cơ bản: tên item, giá, trạng thái, thời gian tạo/bán

#### Hành vi người dùng

-   Khi mở màn hình, hiển thị trang đầu tiên của danh sách lịch sử listing.
-   Khi kéo xuống gần cuối danh sách, tự động nạp thêm lịch sử nếu còn trang.
-   Hiển thị trạng thái "SOLD" màu xanh lá cho item đã bán, kèm thời gian bán.
-   Hiển thị trạng thái khác màu trắng cho các trạng thái khác.

#### Xử lý trạng thái listing

-   **Status "sold"**:

    -   Hiển thị "SOLD" màu xanh lá (`#00ff00`)
    -   Hiển thị thời gian bán: "Sold: DD/MM/YYYY - HH:MM:SS"
    -   Ẩn thông tin thời gian bán cho trạng thái khác

-   **Status khác**:
    -   Hiển thị status màu trắng (`#ffffff`)
    -   Ẩn thông tin thời gian bán

#### Cải tiến hiệu năng

-   **Tái sử dụng cell**: Giảm memory footprint khi có nhiều item lịch sử.
-   **Lazy loading**: Chỉ nạp dữ liệu khi cần thiết, giảm thời gian load ban đầu.
-   **Event listener tối ưu**: Gắn listener một lần, sử dụng `container.itemData` động.
-   **Đơn giản hóa UI**: Loại bỏ logic phức tạp không cần thiết, tập trung vào thông tin cốt lõi.

#### Lưu ý kỹ thuật

-   **Cờ `isUpdating`**: Ngăn chặn gọi API trùng lặp khi người dùng cuộn nhanh.
-   **Error handling**: Xử lý lỗi API và reset trạng thái `isUpdating`.
-   **Memory management**: Sử dụng `reuseCellContainer` để tối ưu bộ nhớ.
-   **Data validation**: Kiểm tra `data.itemCode` trước khi load icon.

#### So sánh với mẫu

-   **HomeMSCITokenomicHistory.js**: Cùng pattern `gridTable + reuseCellContainer + createCellContainerCallback`.
-   **HomeCenterMarketOrderSellItems.js**: Cùng API nhưng khác UI layout và xử lý trạng thái.
-   **HomeNeuralinkCenterMarketHistorySell.js**: Cùng scrollablePanel nhưng không có reuseCellContainer.

#### Lợi ích

-   **UX cải thiện**: Cuộn mượt mà, không cần chờ load toàn bộ dữ liệu lịch sử.
-   **Performance**: Giảm tải bộ nhớ và băng thông nhờ tái sử dụng cell.
-   **Maintainability**: Code đơn giản hơn, dễ bảo trì với pattern nhất quán.
-   **Data clarity**: Hiển thị thông tin rõ ràng, dễ hiểu cho người dùng.

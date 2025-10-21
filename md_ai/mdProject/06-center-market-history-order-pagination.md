### 06 - Phân trang cuộn vô hạn cho Center Market History Order

-   **Phạm vi**: `src/game/scenes/Home/HomeCenterMarket/HomeCenterMarketHistoryOrder.js`
-   **Mục tiêu**: Bổ sung phân trang cuộn vô hạn (lazy load) cho danh sách lịch sử mua hàng trong Center Market, dựa theo mẫu `HomeMSCITokenomicHistory.js` và cập nhật xử lý cấu trúc dữ liệu mới.

#### Thay đổi chính

-   **Chuyển đổi kiến trúc**: Thay thế `scrollablePanel + gridSizer` bằng `gridTable` với `reuseCellContainer: true`.
-   **Thêm state phân trang**: `currentPage`, `totalPages`, `isUpdating`, hằng `PAGE_LIMIT = 10`.
-   **Cập nhật API call**: Sử dụng `centerData.RequestGetCMarketItemMyBuy(page, limit, onSuccess, onError)` với tham số phân trang.
-   **Lấy thông tin phân trang**: Sử dụng `result.pagination.pages` từ response API.
-   **Factory pattern**: Tạo `createOrderItem(scene, itemWidth, itemHeight)` với method `updateContent(data)` để tái sử dụng cell.
-   **Logic cuộn vô hạn**: Lắng nghe kéo/scroll để phát hiện khi gần cuối (`t > 0.9`) và gọi `UpdateHistoryOrder()`.
-   **Append dữ liệu**: Sử dụng `gridTable.setItems([...currentItems, ...newItems])` và `gridTable.refresh()`.

#### Cập nhật cấu trúc dữ liệu

-   **API Response mới**:

    ```json
    {
        "success": true,
        "data": [
            {
                "listingId": "68bea595f69883c42470ae7a",
                "orderId": "ORD-1757324693456-5FEKLBU",
                "seller": {
                    "id": "6866043a13d140d0dc6000dc",
                    "username": "trhiep1297"
                },
                "item": {
                    "code": "DOGE_SHIELD",
                    "name": "DOGE Shield",
                    "description": "Do not receive damage in 3s"
                },
                "quantity": 1,
                "pricePerUnit": 1,
                "totalPrice": 1,
                "purchasedAt": "2025-09-08T10:14:04.996Z",
                "status": "sold",
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
    -   Sử dụng trực tiếp `data.item.name`, `data.totalPrice`, `data.status`
    -   Loại bỏ logic phức tạp xử lý `itemDetails`, `assetType`, `fulfilledAt`
    -   Hiển thị thông tin cốt lõi: tên item, giá, số lượng, thời gian tạo/mua, người bán

#### Hành vi người dùng

-   Khi mở màn hình, hiển thị trang đầu tiên của danh sách lịch sử mua hàng.
-   Khi kéo xuống gần cuối danh sách, tự động nạp thêm lịch sử nếu còn trang.
-   Hiển thị thông tin đầy đủ: tên item, giá, số lượng, thời gian tạo, thời gian mua, người bán, trạng thái, order ID.

#### Xử lý thông tin order

-   **Thông tin cơ bản**:

    -   Tên item: `data.item.name`
    -   Giá: `data.totalPrice` M-Coin
    -   Số lượng: `data.quantity`
    -   Thời gian tạo: `data.createdAt`

-   **Thông tin mua hàng**:

    -   Thời gian mua: `data.purchasedAt` (chỉ hiển thị khi status = "sold")
    -   Người bán: `data.seller.username` (màu xanh dương)
    -   Trạng thái: `data.status` (uppercase)
    -   Order ID: `data.orderId` hoặc `data.listingId`

-   **Icon item**:
    -   Sử dụng `data.item.code` để load icon từ `centerDataItem`
    -   Ẩn icon nếu không tìm thấy item data

#### Cải tiến hiệu năng

-   **Tái sử dụng cell**: Giảm memory footprint khi có nhiều order lịch sử.
-   **Lazy loading**: Chỉ nạp dữ liệu khi cần thiết, giảm thời gian load ban đầu.
-   **Event listener tối ưu**: Gắn listener một lần, sử dụng `container.itemData` động.
-   **Đơn giản hóa UI**: Loại bỏ logic phức tạp không cần thiết, tập trung vào thông tin cốt lõi.

#### Lưu ý kỹ thuật

-   **Cờ `isUpdating`**: Ngăn chặn gọi API trùng lặp khi người dùng cuộn nhanh.
-   **Error handling**: Xử lý lỗi API và reset trạng thái `isUpdating`.
-   **Memory management**: Sử dụng `reuseCellContainer` để tối ưu bộ nhớ.
-   **Data validation**: Kiểm tra `data.item.code` trước khi load icon.

#### So sánh với mẫu

-   **HomeMSCITokenomicHistory.js**: Cùng pattern `gridTable + reuseCellContainer + createCellContainerCallback`.
-   **HomeCenterMarketHistoryList.js**: Cùng API pattern nhưng khác UI layout và xử lý dữ liệu.
-   **HomeCenterMarketOrderSellItems.js**: Cùng pattern nhưng khác API và thông tin hiển thị.

#### Lợi ích

-   **UX cải thiện**: Cuộn mượt mà, không cần chờ load toàn bộ dữ liệu lịch sử mua hàng.
-   **Performance**: Giảm tải bộ nhớ và băng thông nhờ tái sử dụng cell.
-   **Maintainability**: Code đơn giản hơn, dễ bảo trì với pattern nhất quán.
-   **Data clarity**: Hiển thị thông tin rõ ràng, dễ hiểu cho người dùng về lịch sử mua hàng.

#### Khác biệt với History List

-   **History List**: Hiển thị lịch sử bán hàng (seller perspective)
-   **History Order**: Hiển thị lịch sử mua hàng (buyer perspective)
-   **Thông tin bổ sung**: Order ID, thông tin người bán, thời gian mua hàng

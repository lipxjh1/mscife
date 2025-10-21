# 01. Cập Nhật HomeCenterMarketOrderSellCharacter.js - Phân Trang và Tái Sử Dụng Cell

## Tổng Quan Thay Đổi

File `HomeCenterMarketOrderSellCharacter.js` đã được cập nhật để bổ sung phân trang và tái sử dụng cell theo mẫu của `HomeCenterMarketOrderSellItems.js`, đồng thời cập nhật để phù hợp với cấu trúc response mới từ API `RequestGetCMarketCharacterMyListings`.

## Các Thay Đổi Chính

### 1. Cập Nhật RequestOrderSellList - Phân Trang

**Trước:**

```javascript
function RequestOrderSellList(scene) {
    CreateLoadingPopup();

    centerData.RequestGetCMarketCharacterMyListings(
        "active",
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();
            CreateCharacterList(scene, result);
        },
        (error) => {
            HideLoadingPopup();
        }
    );
}
```

**Sau:**

```javascript
function RequestOrderSellList(scene) {
    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetCMarketCharacterMyListings(
        "active",
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            // Lưu tổng số trang từ pagination
            if (
                result &&
                result.pagination &&
                typeof result.pagination.totalPages === "number"
            ) {
                totalPages = result.pagination.totalPages;
            } else {
                totalPages = 1;
            }

            // Tạo danh sách lần đầu
            CreateCharacterList(scene, result);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}
```

### 2. Thay Thế ScrollablePanel Bằng GridTable

**Trước:** Sử dụng `scrollablePanel` với `gridSizer`
**Sau:** Sử dụng `gridTable` với tái sử dụng cell

```javascript
// Tạo gridTable với tái sử dụng cell
gridTable = scene.rexUI.add
    .gridTable({
        x: posX,
        y: posY,
        width: scrollViewWidth,
        height: scrollViewHeight,
        scrollMode: 0,
        table: {
            cellWidth: itemWidth,
            cellHeight: itemHeight,
            columns: 1,
            reuseCellContainer: true, // Tái sử dụng cell
        },
        slider: {
            track: scene.rexUI.add.roundRectangle(
                0,
                0,
                20,
                10,
                10,
                0x000000,
                0.3
            ),
            thumb: scene.rexUI.add.roundRectangle(0, 0, 20, 30, 10, 0xcccccc),
        },
        mouseWheelScroller: {
            focus: false,
            speed: 0.2,
        },
        items: receivedData.data,
        createCellContainerCallback: function (cell, cellContainer) {
            var scene = cell.scene,
                item = cell.item;
            if (cellContainer === null) {
                // Chỉ tạo container một lần
                cellContainer = createCharacterItem(
                    scene,
                    itemWidth,
                    itemHeight
                );
            }
            // Cập nhật nội dung với dữ liệu mới
            cellContainer.updateContent(item);

            return cellContainer;
        },
        space: {
            left: 0,
            right: 0,
            top: 10,
            bottom: 255 / 2 + 24 / 2,
        },
    })
    .layout();
```

### 3. Thêm Infinite Scroll

```javascript
// Theo dõi tương tác kéo thả để xử lý cuộn và nạp thêm
gridTable
    .setInteractive()
    .on("pointerdown", function (pointer) {
        gridTable.startY = pointer.y;
        gridTable.isDragging = true;
        gridTable.startTime = scene.time.now;
    })
    .on("pointermove", function (pointer) {
        if (!gridTable.isDragging) return;

        const deltaY = pointer.y - gridTable.startY;
        gridTable.startY = pointer.y;

        let currentT = gridTable.t - deltaY * 0.001;
        currentT = Phaser.Math.Clamp(currentT, 0, 1);
        gridTable.setT(currentT);

        if (gridTable.t > 0.9 && !isUpdating) {
            UpdateCharacterList(scene);
        }
    })
    .on("pointerup", function () {
        gridTable.isDragging = false;
    })
    .on("pointerover", function (pointer) {
        if (gridTable.isDragging) {
            gridTable.startY = pointer.y;
        }
    });

// Thêm sự kiện cuộn chuột
gridTable.on("scroll", function () {
    if (gridTable.t > 0.9 && !isUpdating) {
        UpdateCharacterList(scene);
    }
});
```

### 4. Thêm UpdateCharacterList và CreateUpdateCharacterList

```javascript
function UpdateCharacterList(scene) {
    if (isUpdating) return;
    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    CreateLoadingPopup();

    centerData.RequestGetCMarketCharacterMyListings(
        "active",
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newItems = result && result.data ? result.data : [];
            CreateUpdateCharacterList(scene, newItems);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

function CreateUpdateCharacterList(scene, listedArray) {
    if (!listedArray || listedArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...listedArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
}
```

### 5. Cập Nhật createCharacterItem - Tái Sử Dụng Cell

**Trước:** Tạo item mới mỗi lần
**Sau:** Tái sử dụng container với `updateContent` method

```javascript
function createCharacterItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    // ... tạo các element UI ...

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        // Tạo character card
        if (container_card.list.length > 0) {
            container_card.removeAll(true);
        }

        let characterCard = CreateCharacterCard(
            scene,
            "",
            data.characterSnapshot.characterType.code,
            data.characterSnapshot.characterType.name,
            "",
            "",
            data.characterSnapshot.level,
            data.characterSnapshot.star
        );

        characterCard.setScale(200 / 444);
        container_card.add(characterCard);

        // Cập nhật các text element
        text_name.setText(data.characterSnapshot.characterType.name);
        text_level.setText(/* ... */);
        text_star.setText(/* ... */);
        text_price.setText("M-Coin: " + data.price);
        text_status.setText(data.status.toUpperCase());
        text_orderId.setText("ID: " + data.orderId);

        // Đặt màu sắc dựa trên trạng thái
        let statusColor = "#ffffff";
        switch (data.status.toUpperCase()) {
            case "ACTIVE":
                statusColor = "#00FF00";
                break;
            case "CANCELLED":
                statusColor = "#FF0000";
                break;
            case "SOLD":
                statusColor = "#FFA500";
                break;
            case "PENDING":
                statusColor = "#FFFF00";
                break;
            default:
                statusColor = "#ffffff";
                break;
        }
        text_status.setColor(statusColor);
    };

    return container;
}
```

### 6. Cập Nhật Cấu Trúc Dữ Liệu

**Trước:** Sử dụng `groupedListings` và `listingList`
**Sau:** Sử dụng `data` array trực tiếp

```javascript
// Trước
if (
    !receivedData ||
    !receivedData.groupedListings ||
    receivedData.groupedListings.length === 0
) {
    // ...
}

// Sau
if (!receivedData || !receivedData.data || receivedData.data.length === 0) {
    // ...
}
```

### 7. Cập Nhật CreateCancel và CreateCancelPriceList

-   Cập nhật đường dẫn dữ liệu từ `item.itemData.characterType` thành `item.itemData.characterSnapshot.characterType`
-   Đơn giản hóa `CreateCancelPriceList` vì mỗi item chỉ có một listing
-   Cập nhật `CreateCancelPriceItem` để hiển thị `orderId` thay vì `availableQuantity`

## Lợi Ích Của Các Thay Đổi

### 1. Performance

-   **Tái sử dụng cell:** Giảm memory usage và tăng performance khi scroll
-   **Infinite scroll:** Chỉ load dữ liệu khi cần thiết
-   **Pagination:** Giảm tải cho server và client

### 2. User Experience

-   **Smooth scrolling:** Cuộn mượt mà hơn với gridTable
-   **Loading states:** Hiển thị loading khi fetch thêm dữ liệu
-   **Responsive:** Tương tác tốt hơn với touch và mouse

### 3. Maintainability

-   **Code consistency:** Cùng pattern với `HomeCenterMarketOrderSellItems.js`
-   **Modular design:** Tách biệt logic tạo item và cập nhật content
-   **Error handling:** Xử lý lỗi tốt hơn với loading states

## Cấu Trúc Response Mới

```json
{
    "success": true,
    "message": "User listings retrieved successfully",
    "data": [
        {
            "characterSnapshot": {
                "characterType": {
                    "_id": "675800e1c3713542db09a96a",
                    "code": "david",
                    "name": "David",
                    "description": "David"
                },
                "code": "david",
                "name": "David",
                "rank": "c",
                "role": "gunner",
                "level": 1,
                "star": 1,
                "isNFT": false,
                "nftTokenId": null,
                "power": 600,
                "getMethod": "BASE"
            },
            "metadata": {
                /* ... */
            },
            "_id": "68c6c0c28b60f9f7b2a3b86b",
            "sellerId": "6866043a13d140d0dc6000dc",
            "characterId": "688ac6c3c9adab7f852a3b77",
            "price": 10,
            "status": "active",
            "orderId": "CHR-1757855938631-EG9OHOQ",
            "soldAt": null,
            "soldTo": null,
            "platformFeeRate": 0.05,
            "platformFee": 0.5,
            "sellerReceives": 9.5,
            "cancelledAt": null,
            "cancellationReason": null,
            "expiresAt": "2025-10-14T13:18:58.632Z",
            "createdAt": "2025-09-14T13:18:58.632Z",
            "updatedAt": "2025-09-14T13:18:58.632Z",
            "__v": 0,
            "isExpired": false,
            "isPurchasable": true,
            "feeBreakdown": {
                /* ... */
            },
            "id": "68c6c0c28b60f9f7b2a3b86b"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 3,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
    },
    "meta": {
        "duration": 10,
        "timestamp": "2025-09-14T13:57:38.109Z"
    }
}
```

## Kết Luận

Việc cập nhật `HomeCenterMarketOrderSellCharacter.js` đã thành công:

1. ✅ **Phân trang:** Implemented với pagination support
2. ✅ **Tái sử dụng cell:** Sử dụng gridTable với reuseCellContainer
3. ✅ **Infinite scroll:** Load thêm dữ liệu khi scroll đến cuối
4. ✅ **Cấu trúc dữ liệu mới:** Cập nhật để phù hợp với response mới
5. ✅ **Performance:** Tối ưu memory usage và rendering
6. ✅ **Consistency:** Đồng nhất với pattern của `HomeCenterMarketOrderSellItems.js`

Các thay đổi này đảm bảo tính nhất quán trong codebase và cải thiện đáng kể performance cũng như user experience.

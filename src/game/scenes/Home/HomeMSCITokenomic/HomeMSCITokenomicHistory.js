import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";

let container_main = null;

let container_history = null;

let container_buttons = null;

let maskShape = null;

let mask = null;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

let dataSaple = {
    success: true,
    data: [
        {
            date: "2025-06-07T05:01:39.534Z",
            chipAmountConverted: 1000,
            msciAmountReceived: 226.68016958071465,
            conversionRateK: 0.22668016958071466,
        },
        {
            date: "2025-06-07T04:56:35.164Z",
            chipAmountConverted: 100,
            msciAmountReceived: 22.668016958071465,
            conversionRateK: 0.22668016958071466,
        },
    ],
    pagination: {
        page: 1,
        limit: 20,
        totalPages: 1,
        totalResults: 2,
    },
};

export function CreateMSCITokenomicHistory(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    container_history = scene.add.container(0, 0);
    container_main.add(container_history);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    const lock_bg = scene.add
        .image(0, 0, "home_earn_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_history.add(lock_bg);

    let title = scene.add
        .image(
            322 + 720 / 2,
            80 + 90 / 2,
            "home_earn_chip_to_msci_history_title"
        )
        .setOrigin(0.5, 0.5);
    container_history.add(title);

    //create close btn
    const btn_close = scene.add
        .image(38 + 32 / 2, 98 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Destroy();
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_buttons.add(btn_close);

    CreateLoadingPopup();

    currentPage = 1;

    totalPages = 1;

    centerData.RequestMSCIHistory(
        currentPage,
        (result) => {
            HideLoadingPopup();

            totalPages = result.pagination.totalPages;

            CreateList(scene, result.data);
        },
        (error) => {
            HideLoadingPopup();

            //console.log("lấy quest thất bại:", error);
            // Thực hiện các hành động khi đăng nhập thất bại
        }
    );
}

let isUpdating = false;
function UpdateHistory(scene) {
    if (isUpdating) return;

    if (currentPage < totalPages) {
        isUpdating = true;

        currentPage++;

        CreateLoadingPopup();

        centerData.RequestMSCIHistory(
            currentPage,
            (result) => {
                isUpdating = false;

                HideLoadingPopup();

                CreateUpdateItemList(scene, result.data);
            },
            (error) => {
                isUpdating = false;

                HideLoadingPopup();

                //console.log("lấy quest thất bại:", error);
                // Thực hiện các hành động khi đăng nhập thất bại
            }
        );
    }
}

function CreateList(scene, arr_data) {
    //console.log("CreateList: ", arr_data);

    if (!arr_data || arr_data.length <= 0) {
        return;
    }

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1554;

    const itemWidth = 1004;
    const itemHeight = 218;
    const itemSpacing = 16;

    const posX = 38 + scrollViewWidth / 2;
    const posY = 366 + scrollViewHeight / 2;

    // Tạo một gridTable
    gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            table: {
                cellWidth: itemWidth + itemSpacing,
                cellHeight: itemHeight + itemSpacing,
                columns: 1,
                reuseCellContainer: true, // Tái sử dụng cell container
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
                thumb: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    30,
                    10,
                    0xcccccc
                ),
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.2,
            },
            items: arr_data,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo card một lần
                    cellContainer = createTokenomicHistoryItem(scene);
                }

                // Cập nhật nội dung của card với dữ liệu mới
                cellContainer.updateContent(item);

                return cellContainer;
            },
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 40,
            },
        })
        .layout();

    // Theo dõi tương tác kéo thả để xử lý cuộn
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

            if (gridTable.t > 0.9) {
                UpdateHistory(scene);
            }
        })
        .on("pointerup", function () {
            gridTable.isDragging = false;

            const endTime = scene.time.now;
            const duration = endTime - gridTable.startTime;

            // Xử lý click nhanh nếu cần
            if (duration <= 125) {
                // Xử lý click nếu cần
            }
        })
        .on("pointerover", function (pointer) {
            if (gridTable.isDragging) {
                gridTable.startY = pointer.y;
            }
        });

    container_history.add(gridTable);

    // Thêm sự kiện cuộn chuột
    gridTable.on("scroll", function () {
        if (gridTable.t > 0.9 && !isUpdating) {
            UpdateHistory(scene);
        }
    });

    maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_history.add(maskShape);

    mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function CreateUpdateItemList(scene, arr_data) {
    // Thêm dữ liệu mới vào gridTable
    if (!arr_data || arr_data.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let newItems = [...currentItems, ...arr_data];

    gridTable.setItems(newItems);
    gridTable.refresh();
}

function createTokenomicHistoryItem(scene) {
    const itemWidth = 1004;
    const itemHeight = 218;

    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    // Đặt container thành interactive để xử lý sự kiện
    container.setInteractive({ useHandCursor: true });

    let container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    let bg = scene.rexUI.add
        .roundRectangle(
            0, // Tọa độ x
            0, // Tọa độ y
            itemWidth, // Chiều rộng
            itemHeight, // Chiều cao
            0, // Độ bo góc
            0x000000, // Màu nền
            0.6 // Độ trong suốt
        )
        .setOrigin(0, 0);
    container_inner.add(bg);

    const type_icon = scene.add
        .image(32 + 75 / 2, 32 + 65 / 2, "home_earn_wallet_icon_3")
        .setTint(0xcccccc);
    container_inner.add(type_icon);

    const text_type = scene.add
        .text(139, 30, "Convert Chip to $MSCI", {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "left",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_type);

    const text_time = scene.add
        .text(139, 75, "", {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "left",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_time);

    const text_chip = scene.add
        .text(900, 30, "", {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "right",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_chip);

    const text_msci = scene.add
        .text(900, 75, "", {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "right",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_msci);

    // Hàm cập nhật nội dung
    container.updateContent = function (transaction) {
        container.transaction = transaction;

        // Cập nhật thời gian
        text_time.setText(formatDateTime(transaction.date));

        // Cập nhật thông tin Chip
        text_chip.setText("Chip: " + transaction.chipAmountConverted);

        // Cập nhật thông tin MSCI
        text_msci.setText("MSCI: " + transaction.msciAmountReceived);
    };

    return container;
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);

    // Lấy các thành phần của ngày giờ
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    // Ghép các thành phần theo định dạng mong muốn
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}

export function Destroy() {
    if (container_main) {
        container_main.destroy();
        container_main = null;
    }

    if (maskShape) {
        maskShape.destroy();
    }

    if (mask) {
        mask.destroy();
    }

    gridTable = null;
}

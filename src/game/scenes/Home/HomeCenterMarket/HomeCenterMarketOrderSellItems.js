import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import { container_center_market_order_sell_sub } from "./HomeCenterMarketOrderSell.js";

let container_main = null;

let isOpen = false;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

// Phân trang và cuộn vô hạn
let isUpdating = false;
const PAGE_LIMIT = 10;

export function CreateCenterMarketSellItems(scene) {
    Destroy(scene);

    //console.log("CreateCenterMarketSellItems");

    isOpen = false;

    container_main = scene.add.container(0, 0);
    container_center_market_order_sell_sub.add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    RequestOrderSellList(scene);

    Open(scene);
}

function RequestOrderSellList(scene) {
    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetCMarketItemMyListing(
        ["active"],
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            // Lưu tổng số trang từ pagination
            if (
                result &&
                result.pagination &&
                typeof result.pagination.pages === "number"
            ) {
                totalPages = result.pagination.pages;
            } else {
                totalPages = 1;
            }

            // Tạo danh sách lần đầu
            CreateItemList(scene, result);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

let container_list = null;

function CreateItemList(scene, receivedData) {
    //console.log("CreateCharacterList receivedData: ", receivedData);

    if (container_list) {
        container_list.destroy();
    }

    //Create friend list
    container_list = scene.add.container(0, 0);
    container_main.add(container_list);

    if (!receivedData || !receivedData.data || receivedData.data.length === 0) {
        const emptyText = scene.add
            .text(540, 600, "No Data", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 10,
            })
            .setOrigin(0.5, 0.5);
        container_list.add(emptyText);
        return;
    }

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1210;

    const itemWidth = 1020;
    const itemHeight = 215;
    const itemSpacing = 20;

    const posX = 20 + scrollViewWidth / 2;
    const posY = 583 + scrollViewHeight / 2;

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
                reuseCellContainer: true,
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
            items: receivedData.data,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = createSellItem(
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
                bottom: 215 / 2 + 24 / 2,
            },
        })
        .layout();

    container_list.add(gridTable);

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
                UpdateSellItemList(scene);
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
            UpdateSellItemList(scene);
        }
    });

    // Thiết lập mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function UpdateSellItemList(scene) {
    if (isUpdating) return;
    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    CreateLoadingPopup();

    centerData.RequestGetCMarketItemMyListing(
        ["active"],
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newItems = result && result.data ? result.data : [];
            CreateUpdateSellItemList(scene, newItems);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

function CreateUpdateSellItemList(scene, listedArray) {
    if (!listedArray || listedArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...listedArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
}

function createSellItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    const bg = scene.add
        .image(0, 0, "home_center_market_main_element_bg")
        .setOrigin(0, 0);
    container_inner.add(bg);

    const icon = scene.add
        .image(28, 33, "")
        .setScale(100 / 350)
        .setOrigin(0, 0);
    container_inner.add(icon);

    const text_name = scene.add
        .text(238, 33, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "38px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_name);

    const text_totalPrice = scene.add
        .text(238, 83, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#FFA600",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_totalPrice);

    const text_quantity = scene.add
        .text(238, 123, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_quantity);

    const text_status = scene.add
        .text(750, 88, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "38px",
            color: "#00FF00",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_status);

    const text_id = scene.add
        .text(750, 163, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#FFA600",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_id);

    const btn_cancel = CreateButton0(
        scene,
        container_inner,
        779 + 218 / 2,
        63 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Cancel"
        )
    );

    // Lắng nghe một lần, dùng container.itemData động để hành xử theo dữ liệu mới
    btn_cancel.button.removeAllListeners("pointerdown");
    btn_cancel.button.on("pointerdown", function () {
        const itemData = container.itemData;
        if (!itemData) return;
        CreateAlertPopup(
            scene,
            "Are you sure you want to cancel this listing?",
            () => {
                CreateLoadingPopup();
                centerData.RequestDeleteCMarketItemCancel(
                    itemData.listingId,
                    (result) => {
                        HideLoadingPopup();
                        RequestOrderSellList(scene);
                    },
                    (error) => {
                        HideLoadingPopup();
                        CreateAlertPopup(scene, error);
                    }
                );
            },
            () => {}
        );
    });

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        let itemCode = data.itemCode;

        let itemLocalData = centerDataItem.getItemById(itemCode);

        let baseItemData = null;

        if (itemCode.includes("_FRAGMENT_")) {
            let fragmentCode = itemCode.toLowerCase();

            baseItemData = centerData.baseItemInfo[fragmentCode];
        } else {
            baseItemData = centerData.baseItemInfo[itemCode];
        }

        icon.setTexture(itemLocalData.imgKey);

        text_name.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                baseItemData.name
            )
        );
        text_totalPrice.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Price"
            ) +
                ": " +
                data.totalPrice +
                " M-Coin"
        );
        text_quantity.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Quantity"
            ) +
                ": " +
                data.quantity
        );

        text_id.setText("ID: " + data.listingId);

        text_status.setText(data.status.toUpperCase());
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

function CreateButton0(scene, container, x, y, buttonName) {
    let btnWidth = 218;
    let btnHeight = 98;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_center_market_button_0_2")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    btn_inner_container.add(btn_container.button);

    const text = scene.add
        .text(
            btnWidth / 2,
            btnHeight / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "38px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    btn_container.setSelected = function () {
        btn_container.button.disableInteractive();

        btn_inner_container.each(function (child) {
            if (child.setTint) {
                child.clearTint();
            }
        });
    };

    btn_container.setUnselected = function () {
        btn_container.button.setInteractive();

        btn_inner_container.each(function (child) {
            if (child.setTint) {
                child.setTint(0x9a9a9a);
            }
        });
    };

    return btn_container;
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen == true) return;

    isOpen = true;
}

export function Close(scene) {
    if (isOpen == false) return;

    isOpen = false;
    Destroy();
}

function Destroy(scene) {
    if (container_main) {
        container_main.destroy();
    }
}

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

export function CreateCenterMarketSellMSCI(scene) {
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

    centerData.RequestGetCMarketMSCIMyListing(
        ["active"], // status array
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

function UpdateOrderSellList(scene) {
    if (isUpdating) return;
    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    CreateLoadingPopup();

    centerData.RequestGetCMarketMSCIMyListing(
        ["active"], // status array
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newItems = result && result.data ? result.data : [];
            CreateUpdateOrderItemList(scene, newItems);

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
    //console.log("CreateItemList receivedData: ", receivedData);

    if (container_list) {
        container_list.destroy();
    }

    //Create friend list
    container_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_main.add(container_list);

    if (!receivedData || !receivedData.data || receivedData.data.length === 0) {
        const emptyText = scene.add
            .text(540, 600, "No MSCI Sell Orders Found", {
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
    const itemSpacingWidth = 20;
    const itemSpacingHeight = 20;

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
                    cellContainer = createOrderSellItem(
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
                UpdateOrderSellList(scene);
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
            UpdateOrderSellList(scene);
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

function CreateUpdateOrderItemList(scene, listedArray) {
    if (!listedArray || listedArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...listedArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
}

function createOrderSellItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    const bg = scene.add
        .image(0, 0, "home_center_market_main_element_bg")
        .setDisplaySize(itemWidth, itemHeight)
        .setOrigin(0, 0);
    container_inner.addAt(bg, 0);

    const icon = scene.add
        .image(28 + 150 / 2, 33 + 150 / 2, "item_msci")
        .setScale(150 / 350)
        .setOrigin(0.5, 0.5);
    container_inner.add(icon);

    const text_order_id = scene.add
        .text(238, 15, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_order_id);

    const text_amount = scene.add
        .text(238, 45, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_amount);

    const text_price_per_unit = scene.add
        .text(238, 75, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#FFA600",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_price_per_unit);

    const text_created_time = scene.add
        .text(238, 105, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#87CEEB",
            align: "left",
            stroke: "#000000",
            strokeThickness: 8,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_created_time);

    const text_expires_time = scene.add
        .text(238, 140, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#FFA500",
            align: "left",
            stroke: "#000000",
            strokeThickness: 8,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_expires_time);

    const text_status = scene.add
        .text(1010, 15, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_status);

    // Tạo button cancel
    const button_cancel = CreateButton0(
        scene,
        container_inner,
        779 + 218 / 2,
        63 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Cancel"
        )
    );

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        text_order_id.setText("Order: " + data.orderId);

        text_amount.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Amount"
            ) +
                ": " +
                data.amount
        );

        text_price_per_unit.setText(data.pricePerUnit + " M-Coin/Unit");

        text_status.setText(data.status?.toUpperCase() || "UNKNOWN");

        text_created_time.setText("Created: " + formatDateTime(data.createdAt));

        text_expires_time.setText("Expires: " + formatDateTime(data.expiresAt));

        // Cập nhật event handler cho button cancel
        button_cancel.button.off("pointerdown");
        button_cancel.button.on("pointerdown", function () {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Do you want to cancel selling?"
                ),
                () => {
                    CreateLoadingPopup();

                    centerData.RequestPostCMarketMSCISellCancel(
                        data.listingId,
                        () => {
                            HideLoadingPopup();
                            RequestOrderSellList(scene);
                        },
                        () => {
                            HideLoadingPopup();
                        }
                    );
                },
                () => {}
            );
        });
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

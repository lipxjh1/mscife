import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

let container_main = null;

let container_history = null;

let container_buttons = null;

let maskShape = null;

let mask = null;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

export function CreateNeuralinkHistory(scene) {
    CreateLoadingPopup();
    centerData.RequestInventory(
        (result) => {
            HideLoadingPopup();
            Create(scene);
        },
        (error) => {
            HideLoadingPopup();
        }
    );
}

function Create(scene) {
    isUpdating = false;

    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    container_history = scene.add.container(0, 0);
    container_main.add(container_history);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    const lock_bg = scene.add
        .image(0, 0, "home_neuralink_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_history.add(lock_bg);

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

    centerData.RequestNeuralinkHistory(
        currentPage,
        (result) => {
            HideLoadingPopup();

            totalPages = result.pagination.pages;

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

        centerData.RequestNeuralinkHistory(
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
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1480;

    const itemWidth = 1020;
    const itemHeight = 215;
    const itemSpacing = 24;

    const posX = 30 + scrollViewWidth / 2;
    const posY = 382 + scrollViewHeight / 2;

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
                    cellContainer = createNeuralinkItem(scene);
                }

                // Cập nhật nội dung của card với dữ liệu mới
                cellContainer.updateContent(item);

                return cellContainer;
            },
            space: {
                left: 0,
                right: 0,
                top: 10,
                bottom: itemSpacing,
            },
        })
        .layout();

    container_history.add(gridTable);

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

function createNeuralinkItem(scene) {
    let itemWidth = 1020;
    let itemHeight = 215;

    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    let itemLocalData = centerDataItem.getItemById("NEURALINK");

    const bg = scene.add
        .image(0, 0, "home_neuralink_upgrade_element_bg")
        .setOrigin(0, 0);
    container_inner.add(bg);

    const icon = scene.add
        .image(28, 33, itemLocalData.imgKey)
        .setScale(150 / 350)
        .setOrigin(0, 0);
    container_inner.add(icon);

    const text_name = scene.add
        .text(238, 5, "Neuralink", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_name);

    const text_quantity = scene.add
        .text(238, 55, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#FFA600",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_quantity);

    const text_create_time = scene.add
        .text(238, 105, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_create_time);

    const text_status = scene.add
        .text(238, 155, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_status);

    // Hàm cập nhật nội dung
    container.updateContent = function (itemData) {
        container.itemData = itemData;

        // Cập nhật số lượng
        text_quantity.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                "Quantity: "
            ) + itemData.quantity
        );

        // Cập nhật thời gian tạo
        text_create_time.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                "Created at: "
            ) + formatDateTime(itemData.createdAt)
        );

        // Cập nhật trạng thái
        text_status.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                "Status: "
            ) + itemData.status.replaceAll("_", " ")
        );
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

import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import { CreateGuildNone } from "./HomeGuildNone.js";

export function CreateGuildMyRequest(scene) {
    LoadAssetsDone(scene);
}

let container_main = null;

let container_buttons = null;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

// Phân trang và cuộn vô hạn
let isUpdating = false;
const PAGE_LIMIT = 10;

function LoadAssetsDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.add
        .image(0, 0, "home_guild_chat_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    container_main.add(lock_bg);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    let text_title = scene.add
        .text(
            606.5,
            274,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Guild join requests"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_title);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Close(scene);

            CreateGuildNone(scene);
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

    RequestMyList(scene);
}

function RequestMyList(scene) {
    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetGuildMyRequestList(
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
            CreateRequestItemList(scene, result.requests || []);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
            CreateAlertPopup(scene, error);
        }
    );
}

let container_request_item_list = null;

function DestroyRequestItemList(scene) {
    if (container_request_item_list) {
        container_request_item_list.destroy();
        container_request_item_list = null;
    }
}

function CreateRequestItemList(scene, requestArr) {
    DestroyRequestItemList(scene);

    //Create list container
    container_request_item_list = scene.add.container(0, 0);
    container_main.add(container_request_item_list);

    // Empty state
    if (!requestArr || requestArr.length === 0) {
        const emptyText = scene.add
            .text(540, 1400, "No Requests", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 10,
            })
            .setOrigin(0.5, 0.5);
        container_request_item_list.add(emptyText);
        return;
    }

    // ScrollView config
    const scrollViewWidth = 1020;
    const scrollViewHeight = 1552;

    const itemWidth = 904;
    const itemHeight = 200;
    const itemSpacing = 20;

    const posX = 30 + scrollViewWidth / 2;
    const posY = 368 + scrollViewHeight / 2;

    // gridTable với tái sử dụng cell
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
            items: requestArr,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = createRequestItem(
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
                left: 58,
                right: 0,
                top: 40,
                bottom: 200 / 2 + 20 / 2,
            },
        })
        .layout();

    container_request_item_list.add(gridTable);

    // Drag/scroll handlers để nạp thêm
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
                UpdateMyRequestList(scene);
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

    gridTable.on("scroll", function () {
        if (gridTable.t > 0.9 && !isUpdating) {
            UpdateMyRequestList(scene);
        }
    });

    // Mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_request_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function UpdateMyRequestList(scene) {
    if (isUpdating) return;
    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    CreateLoadingPopup();

    centerData.RequestGetGuildMyRequestList(
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newRequests =
                result && result.requests ? result.requests : [];
            CreateUpdateRequestList(scene, newRequests);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

function CreateUpdateRequestList(scene, requestArray) {
    if (!requestArray || requestArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...requestArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
}

function CancelJoinGuildRequest(scene, item) {
    CreateLoadingPopup();
    centerData.RequestPostGuildMyRequestCancel(
        item.itemData.RequestId,
        (result) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, result.message);

            RequestMyList(scene);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

function createRequestItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    const bg = scene.add.image(0, 0, "home_guild_list_item_bg").setOrigin(0, 0);
    container_inner.add(bg);

    const avatar = scene.add
        .image(23 + 160 / 2, 20 + 160 / 2, "")
        .setDisplaySize(160, 160)
        .setOrigin(0.5, 0.5);
    container_inner.add(avatar);

    const text_name = scene.add
        .text(199, 20, "", {
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

    const text_id = scene.add
        .text(199, 74, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_id);

    const button_cancel = CreateButton1(
        scene,
        container_inner,
        640 + 200 / 2,
        35 + 58 / 2,
        "home_guild_btn_1",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Cancel"
        )
    );

    // Lắng nghe một lần, dùng container.itemData động để hành xử theo dữ liệu mới
    button_cancel.button.removeAllListeners("pointerdown");
    button_cancel.button.on("pointerdown", function () {
        const itemData = container.itemData;
        if (!itemData) return;

        CancelJoinGuildRequest(scene, { itemData: itemData });
    });

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        avatar.setTexture(data.Avatar);
        avatar.setScale(160 / 128);

        text_name.setText(data.GuildName);
        text_id.setText(data.GuildId);
    };

    return container;
}

function CreateButton1(scene, container, x, y, imgKey, buttonName) {
    let btnWidth = 200;
    let btnHeight = 58;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_guild_btn_0")
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

    if (imgKey != "") {
        btn_container.button.setTexture(imgKey);
    }

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

    return btn_container;
}

function Close(scene) {
    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
        container_main = null;
    }
    if (container_buttons) {
        container_buttons.destroy();
        container_buttons = null;
    }
    DestroyRequestItemList();
    if (gridTable) {
        gridTable.destroy();
        gridTable = null;
    }

    // Reset các biến global
    currentPage = 0;
    totalPages = 0;
    isUpdating = false;
}

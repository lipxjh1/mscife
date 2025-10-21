import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import cdLocalization from "../../../Data/CenterDataLocalization.js";
import {
    CreateUserInfoEquip,
    NeuralinkCheckImage,
} from "./HomeUserInfoEquip.js";

let container_main = null;

let container_popup = null;
let container_popup_0 = null;
let container_popup_1 = null;
let container_popup_close_position = { x: 0, y: 4000 };
let container_popup_open_position = { x: 0, y: 0 };

let container_item_list = null;

let isOpen = false;

let selectedRole = null;

let selectedButtonContainer = null;

export function CreateUserInfoEquipNeuralink(scene, buttonContainer, role) {
    selectedRole = role;

    selectedButtonContainer = buttonContainer;

    console.log("CreateUserInfoEquipNeuralink " + selectedRole);

    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadShopInventory(() => {
        HideLoadingPopup();
        LoadAssetsDone(scene);
    });
}

function LoadAssetsDone(scene) {
    if (container_main) {
        container_main.destroy();
    }

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const black_bg = scene.add
        .rectangle(0, 0, window.originWidth, window.originHeight)
        .setOrigin(0, 0)
        .setInteractive();
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.5;

    container_main.add(black_bg);

    container_popup = scene.add.container(
        container_popup_open_position.x,
        container_popup_open_position.y
    );
    container_main.add(container_popup);

    container_popup_0 = scene.add.container(0, 0);
    container_popup.add(container_popup_0);

    container_popup_1 = scene.add.container(0, 0);
    container_popup.add(container_popup_1);

    let lockOutClick = scene.add
        .container(540, 513 / 2)
        .setSize(1080, 513)
        .setInteractive();
    container_popup_1.add(lockOutClick);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            Close(scene);
        })
        .on("pointerover", function () {
            //console.log("btn_close over");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("btn_close out");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_popup_1.add(btn_close);

    CreateLoadingPopup();

    centerData.RequestInventory(
        () => {
            HideLoadingPopup();

            CreateItemList(scene);
        },
        (error) => {
            HideLoadingPopup();

            CreateAlertPopup("Request inventory failed\n" + error.message);
        }
    );

    Open(scene);
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    container_item_list = scene.add.container(0, 0);
    container_popup_0.add(container_item_list);

    let itemDataArr = [];

    for (let key in centerData.inventoryDictionary) {
        if (key.includes("_NEURALINK_") == true) {
            const item = centerData.inventoryDictionary[key];

            let itemData = centerDataItem.getItemById(item.code);

            if (itemData && item.quantity > 0) {
                itemDataArr.push(item);
            }
        }
    }

    const scrollViewWidth = 1080;

    const scrollViewHeight = 1407;

    const cellWidth = 450;

    const cellHeight = 550;

    const spaceWidth = 130 / 2;

    const spaceHeight = 60 / 2;

    const posX = scrollViewWidth / 2 + cellWidth / 2 + spaceWidth;

    const posY = 513 + scrollViewHeight / 2;

    const gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,

            table: {
                cellWidth: cellWidth + spaceWidth,
                cellHeight: cellHeight + spaceHeight,
                columns: 2,
                //reuseCellContainer: true, // Kích hoạt tái sử dụng cell container
            },

            mouseWheelScroller: {
                focus: false,
                speed: 1,
            },

            items: itemDataArr, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: cellWidth,
                        height: cellHeight,
                        orientation: 0,
                    });
                } else {
                    //console.log(cell.index + ": reuse cell-container");
                }

                cellContainer.add(card_item(scene, index, item));

                return cellContainer;
            },

            space: {
                // left: 50,
                // right: 0,
                // top: 36,
                // bottom: 0,
                // row: 0,
            },
        })
        .layout();

    gridTable.isDragging = false;

    scene.input.on("pointerup", (pointer) => {
        gridTable.isDragging = false;
    });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    //   const gridOrigin = scene.rexUI.add.roundRectangle(
    //     gridTable.x,
    //     gridTable.y,
    //     50,
    //     50,
    //     0,
    //     0xffffff,
    //     1
    //   );
    //   container_item_list.add(gridOrigin);

    const maskShape = scene.add
        .rectangle(540, 513 + 1407 / 2, scrollViewWidth, 1407, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function card_item(scene, i, item) {
    //console.log("Item = ", item);

    const container_card = scene.add.container(0, 0);

    container_card.item = item;

    const container_card_inner = scene.add.container(-450 / 2, -550 / 2);
    container_card.add(container_card_inner);

    // const item_bg = scene.rexUI.add.roundRectangle(
    //   0,
    //   0,
    //   437,
    //   506,
    //   0,
    //   0x000000,
    //   1
    // );
    // container_card.add(item_bg);

    let pressStartTime = 0;

    const btn_item = scene.add
        .image(0, 0, "home_inventory_shop_item_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function (pointer) {
            //console.log("btn_item clicked");

            container_item_list.gridTable.startY = pointer.y;
            container_item_list.gridTable.isDragging = true;

            pressStartTime = scene.time.now;
        })
        .on("pointermove", function (pointer) {
            //console.log("btn_item clicked");

            if (!container_item_list.gridTable.isDragging) return;

            const deltaY = pointer.y - container_item_list.gridTable.startY; // Tính độ chênh lệch so với vị trí trước đó
            container_item_list.gridTable.startY = pointer.y; // Cập nhật startY cho lần di chuyển tiếp theo

            let itemHeight = 550;

            let itemCount = container_item_list.gridTable.items.length;

            let columns = 2;

            let rows = Math.ceil(itemCount / columns);

            let maxHeight = itemHeight * rows;

            let tPerPixel = 1 * (itemHeight / maxHeight);

            let smoothVal = 0.005;

            // Tính toán giá trị T hiện tại của bảng và điều chỉnh theo deltaY
            let currentT =
                container_item_list.gridTable.t -
                deltaY * (tPerPixel * smoothVal); // Điều chỉnh tốc độ cuộn
            currentT = Phaser.Math.Clamp(currentT, 0, 1); // Đảm bảo T nằm trong phạm vi 0-1

            container_item_list.gridTable.setT(currentT); // Cập nhật vị trí cuộn của bảng
        })
        .on("pointerup", function (pointer) {
            //console.log("btn_item clicked");

            if (container_item_list.gridTable.isDragging == false) {
                //do something if it is seleted not dragging
            }

            container_item_list.gridTable.isDragging = false; // Dừng kéo

            let pressDuration = scene.time.now - pressStartTime;

            if (pressDuration < 125) {
                ClickItem(scene, container_card);
            }
        })
        .on("pointerover", function (pointer) {
            if (container_item_list.gridTable.isDragging == true) {
                container_item_list.gridTable.startY = pointer.y;
            }

            container_card.each(function (child) {
                if (child.setTint) {
                    child.setTint(0x646464); // Màu tint bạn muốn áp dụng
                }
            });
        })
        .on("pointerout", function (pointer) {
            container_card.each(function (child) {
                if (child.clearTint) {
                    child.clearTint(); // Xóa tint
                }
            });
        });
    container_card_inner.add(btn_item);

    const item_text_name = scene.add
        .text(
            450 / 2,
            53,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                item.name
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#595959",
                align: "center",
                wordWrap: { width: 410, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container_card_inner.add(item_text_name);

    const imgKey = centerDataItem.getItemById(item.code).imgKey;

    const item_img = scene.add
        .image(137 + 180 / 2, 135 + 180 / 2, imgKey)
        .setOrigin(0.5, 0.5)
        .setScale(180 / 350);
    container_card_inner.add(item_img);

    const item_text_quantity = scene.add
        .text(
            450 / 2,
            361,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "Quantity: "
            ) + item.quantity,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#595959",
                align: "center",
            }
        )
        .setOrigin(0.5, 0);
    container_card_inner.add(item_text_quantity);

    container_card.setQuantity = function (quantity) {
        item.quantity = quantity;
        item_text_quantity.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                "Quantity: "
            ) + quantity
        );
    };

    const text_atk = scene.add
        .text(450 / 2, 460, "ATK: " + item.properties.powerBonus + "%", {
            fontFamily: "Russo One",
            fontSize: "30px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_card_inner.add(text_atk);

    return container_card;
}

function ClickItem(scene, container_card) {
    if (
        container_card.item.code.includes("CONNECTED_NEURALINK_") ||
        container_card.item.code.includes("ELITE_NEURALINK_")
    ) {
        CreateLoadingPopup();
        centerData.RequestNeuralinkEquip(
            container_card.item._id,
            selectedRole,
            (result) => {
                HideLoadingPopup();

                Destroy();

                CreateLoadingPopup();
                centerData.RequestUserInfo(
                    () => {
                        HideLoadingPopup();

                        NeuralinkCheckImage(
                            scene,
                            selectedButtonContainer,
                            selectedRole
                        );
                    },
                    () => {
                        HideLoadingPopup();
                    }
                );

                CreateAlertPopup(scene, result.message);
            },
            (error) => {
                HideLoadingPopup();

                CreateAlertPopup(scene, error);
            }
        );
    }
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen == true) return;

    isOpen = true;

    container_popup.setPosition(
        container_popup_close_position.x,
        container_popup_close_position.y
    );

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_open_position.x,
        y: container_popup_open_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

export function Close(scene) {
    if (isOpen == false) return;

    container_popup.setPosition(
        container_popup_open_position.x,
        container_popup_open_position.y
    );

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_close_position.x,
        y: container_popup_close_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            isOpen = false;
            Destroy();
        },
    });
}

function Destroy(scene) {
    container_main.destroy();
}

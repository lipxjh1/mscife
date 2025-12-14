import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { CreateShop } from "../HomeShop/HomeShop.js";

import { CreateGacha } from "../HomeGacha/HomeGacha.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    CreateCharacterRewardPopup,
    CreateItemBlindBagRewardPopup,
    CreateMultiCharacterRewardPopup,
} from "../../Share/PopupReward.js";
import {
    MovePlayerBarToDefault,
    MovePlayerBarToHide,
} from "../HomeTopBarPlayer.js";
import { CreateUseItemPopup } from "../../Share/PopupUseItem.js";
import { CreateInventoryNeuralinkOptions } from "./HomeInventoryNeuralinkOptions.js";

let container_main = null;

let container_popup = null;
let container_popup_0 = null;
let container_popup_1 = null;
let container_popup_close_position = { x: 0, y: 4000 };
let container_popup_open_position = { x: 0, y: 0 };

let container_item_list = null;

let isOpen = false;

// ✅ Resource tracking for proper cleanup
const inventoryResources = {
    events: [],
    tweens: [],
    timers: []
};

export function CreateInventory(scene) {
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
    container_main.setDepth(100);

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
        .setInteractive({ useHandCursor: true }); // Thiết lập tương tác và đổi thành hình bàn tay khi hover

    // ✅ Track close button events
    const onCloseClick = function () {
        //console.log("btn_close clicked");
        Close(scene);
    };
    btn_close.on("pointerdown", onCloseClick);
    inventoryResources.events.push({ target: btn_close, event: "pointerdown", handler: onCloseClick });

    const onCloseOver = function () {
        //console.log("btn_close over");
        const tween = scene.tweens.add({
            targets: btn_close,
            scaleX: 1.2, // Phóng to 20% theo chiều ngang
            scaleY: 1.2, // Phóng to 20% theo chiều dọc
            duration: 100, // Thời gian hiệu ứng (ms)
            ease: "Power2",
        });
        inventoryResources.tweens.push(tween);
    };
    btn_close.on("pointerover", onCloseOver);
    inventoryResources.events.push({ target: btn_close, event: "pointerover", handler: onCloseOver });

    const onCloseOut = function () {
        //console.log("btn_close out");
        const tween = scene.tweens.add({
            targets: btn_close,
            scaleX: 1, // Phóng to 20% theo chiều ngang
            scaleY: 1, // Phóng to 20% theo chiều dọc
            duration: 100, // Thời gian hiệu ứng (ms)
            ease: "Power2",
        });
        inventoryResources.tweens.push(tween);
    };
    btn_close.on("pointerout", onCloseOut);
    inventoryResources.events.push({ target: btn_close, event: "pointerout", handler: onCloseOut });

    container_popup_1.add(btn_close);

    InventoryRequestToCreateItemList(scene);

    Open(scene);
}

export function InventoryRequestToCreateItemList(scene) {
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
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    if (container_item_list) {
        container_item_list.destroy();
    }

    container_item_list = scene.add.container(0, 0);
    container_popup_0.add(container_item_list);

    let itemDataArr = [];

    for (let key in centerData.inventoryDictionary) {
        if (key.includes("_fragment_") == false) {
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
    const posX = 96 + scrollViewWidth / 2 - spaceWidth;
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
                reuseCellContainer: true, // Kích hoạt tái sử dụng cell container
            },

            scroller: {
                // Tùy chỉnh scroller nếu cần
            },

            mouseWheelScroller: {
                focus: false,
                speed: 1,
            },

            items: itemDataArr, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo cấu trúc card một lần
                    cellContainer = card_item(scene);

                    // // Thêm graphics để debug
                    // const debugGraphics = scene.add.graphics();
                    // cellContainer.add(debugGraphics);
                    // cellContainer.setData("debugGraphics", debugGraphics);
                }

                // Cập nhật nội dung của card với dữ liệu item mới
                cellContainer.updateContent(item);

                // // Vẽ vùng debug
                // const graphics = cellContainer.getData("debugGraphics");
                // if (graphics) {
                //     graphics.clear();
                //     graphics.lineStyle(2, 0x00ff00, 0.7); // Màu xanh lá, hơi trong suốt
                //     // GridTable sẽ căn giữa container vào trong cell.
                //     // Nên ta sẽ vẽ hình chữ nhật từ toạ độ âm của nửa kích thước cell.
                //     graphics.strokeRect(
                //         0,
                //         0,
                //         cell.width,
                //         cell.height
                //     );
                // }

                return cellContainer;
            },

            align: "center",

            space: {
                // left: 50,
                // right: 0,
                // top: 36,
                // bottom: 0,
                // column: 34,
                // row: 34,
            },
        })
        .layout();

    // ✅ Track gridTable click event
    const onCellClick = function (cellContainer, cellIndex) {
        // Khi một cell được click, gọi hàm xử lý
        if (cellContainer && cellContainer.itemData) {
            ClickItem(scene, cellContainer.itemData);
        }
    };
    gridTable.on("cell.click", onCellClick, scene);
    inventoryResources.events.push({ target: gridTable, event: "cell.click", handler: onCellClick });

    // gridTable.on("cell.over", function (cellContainer, cellIndex) {
    //     // Hiệu ứng khi hover vào
    //     if (cellContainer) {
    //         cellContainer.each(function (child) {
    //             if (child.setTint) {
    //                 child.setTint(0x646464); // Màu tint bạn muốn áp dụng
    //             }
    //         });
    //     }
    // });

    // gridTable.on("cell.out", function (cellContainer, cellIndex) {
    //     // Bỏ hiệu ứng khi rời chuột
    //     if (cellContainer) {
    //         cellContainer.each(function (child) {
    //             if (child.clearTint) {
    //                 child.clearTint(); // Xóa tint
    //             }
    //         });
    //     }
    // });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    const maskShape = scene.add
        .rectangle(540, 513 + 1407 / 2, scrollViewWidth, 1407, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function card_item(scene) {
    const container_card = scene.add.container(0, 0);

    const spaceWidth = 130 / 2;
    const spaceHeight = 60 / 2;

    const container_card_inner = scene.add.container(
        spaceWidth / 2,
        spaceHeight / 2
    );
    container_card.add(container_card_inner);

    // Nền của card
    const btn_item = scene.add
        .image(0, 0, "home_inventory_shop_item_bg")
        .setOrigin(0, 0);
    container_card_inner.add(btn_item);

    // Tên item
    const item_text_name = scene.add
        .text(450 / 2, 53, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#595959",
            align: "center",
            wordWrap: { width: 410, useAdvancedWrap: true },
        })
        .setOrigin(0.5, 0);
    container_card_inner.add(item_text_name);

    // Hình ảnh item
    const item_img = scene.add
        .image(137 + 180 / 2, 135 + 180 / 2, "__DEFAULT") // Sử dụng texture mặc định
        .setOrigin(0.5, 0.5)
        .setScale(180 / 350);
    container_card_inner.add(item_img);

    // Text hiển thị số lượng cho fragment item (nếu có)
    const text_piece_num = scene.add
        .text(150, 140, "0", {
            fontFamily: "Russo One",
            fontSize: "64px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0)
        .setVisible(false);
    container_card_inner.add(text_piece_num);

    // Số lượng còn lại
    const item_text_quantity = scene.add
        .text(450 / 2, 361, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#595959",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_card_inner.add(item_text_quantity);

    // Hàm để cập nhật dữ liệu cho card
    container_card.updateContent = function (item) {
        container_card.itemData = item; // Lưu dữ liệu item vào container

        // Cập nhật tên
        item_text_name.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                item.name
            )
        );

        // Cập nhật hình ảnh
        const imgKey = centerDataItem.getItemById(item.code).imgKey;
        item_img.setTexture(imgKey);

        // Xử lý cho fragment items
        if (item.code.includes("fragment_")) {
            item_img.setDisplaySize(180, 180);
            text_piece_num.setVisible(true);

            if (item.code.includes("fragment_1")) {
                text_piece_num.setText("1");
            } else if (item.code.includes("fragment_2")) {
                text_piece_num.setText("2");
            } else if (item.code.includes("fragment_3")) {
                text_piece_num.setText("3");
            } else if (item.code.includes("fragment_4")) {
                text_piece_num.setText("4");
            }
        } else {
            text_piece_num.setVisible(false);
        }

        // Cập nhật số lượng
        item_text_quantity.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "Quantity: "
            ) + item.quantity
        );

        // Gán lại hàm setQuantity để có thể cập nhật từ bên ngoài
        container_card.setQuantity = function (quantity) {
            item.quantity = quantity;
            item_text_quantity.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Quantity: "
                ) + quantity
            );
        };
    };

    return container_card;
}

function ClickItem(scene, itemData) {
    if (
        itemData.code === "BOX_NFT_CHARACTER" ||
        itemData.code === "BOX_NFT_FRAGMENT"
    ) {
        if (itemData.quantity > 0) {
            CreateUseItemPopup(
                scene,
                itemData.code,
                itemData.name,
                itemData.quantity,
                itemData.description,
                () => {
                    Close(scene);

                    CreateGacha(scene);
                },
                () => {}
            );
        } else {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Do you want to buy the box?"
                ),
                () => {
                    Close(scene);

                    CreateShop(scene);
                },
                () => {}
            );
        }
    } else if (
        itemData.code === "BOX_MARCUS" ||
        itemData.code === "BOX_DAVID" ||
        itemData.code === "BOX_HENRY" ||
        itemData.code === "WORLD_BOSS_BOX" ||
        itemData.code === "ELITE_BOSS_BOX"
    ) {
        if (itemData.quantity > 0) {
            CreateUseItemPopup(
                scene,
                itemData.code,
                itemData.name,
                itemData.quantity,
                itemData.description,
                () => {
                    OpenBoxCharacter(scene, itemData);
                },
                () => {}
            );
        } else {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Do you want to buy the box?"
                ),
                () => {
                    Close(scene);

                    CreateShop(scene);
                },
                () => {}
            );
        }
    } else if (
        itemData.code === "BOX_ALL_C_RANK" ||
        itemData.code === "BOX_PREMIUM_CHARACTER"
    ) {
        if (itemData.quantity > 0) {
            CreateUseItemPopup(
                scene,
                itemData.code,
                itemData.name,
                itemData.quantity,
                itemData.description,
                () => {
                    OpenBoxMultiCharacter(scene, itemData);
                },
                () => {}
            );
        } else {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Do you want to buy the box?"
                ),
                () => {
                    Close(scene);

                    CreateShop(scene);
                },
                () => {}
            );
        }
    } else if (itemData.code === "BLIND_BAG") {
        if (itemData.quantity > 0) {
            CreateUseItemPopup(
                scene,
                itemData.code,
                itemData.name,
                itemData.quantity,
                itemData.description,
                () => {
                    OpenBlindBag(scene, itemData);
                },
                () => {}
            );
        } else {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Do you want to buy the box?"
                ),
                () => {
                    Close(scene);

                    CreateShop(scene);
                },
                () => {}
            );
        }
    } else if (
        itemData.code.includes("CONNECTED_NEURALINK_") ||
        itemData.code.includes("ELITE_NEURALINK_")
    ) {
        CreateInventoryNeuralinkOptions(scene, itemData.code);
    }
}

function OpenBoxCharacter(scene, itemData) {
    CreateLoadingPopup();

    centerData.RequestOpenBox(
        itemData.code,
        (result) => {
            HideLoadingPopup();

            // Giảm số lượng item trực tiếp
            itemData.quantity -= 1;

            // Cập nhật lại danh sách item
            if (container_item_list && container_item_list.gridTable) {
                // Sau khi giảm số lượng, cập nhật lại toàn bộ danh sách
                // Gọi lại hàm tạo danh sách item để refresh giao diện
                CreateItemList(scene);
            }

            CreateCharacterRewardPopup(
                scene,
                result.data._id,
                result.data.code,
                result.data.name,
                result.data.role,
                result.data.rank,
                result.data.level,
                result.data.star
            );
        },
        (error) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, `OpenBox failed:\n${error}`);
        }
    );
}

function OpenBoxMultiCharacter(scene, itemData) {
    CreateLoadingPopup();

    centerData.RequestOpenBox(
        itemData.code,
        (result) => {
            HideLoadingPopup();

            // Giảm số lượng item trực tiếp
            itemData.quantity -= 1;

            // Cập nhật lại danh sách item
            if (container_item_list && container_item_list.gridTable) {
                // Sau khi giảm số lượng, cập nhật lại toàn bộ danh sách
                // Gọi lại hàm tạo danh sách item để refresh giao diện
                CreateItemList(scene);
            }

            CreateMultiCharacterRewardPopup(scene, result.data);
        },
        (error) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, `OpenBox failed:\n${error}`);
        }
    );
}

function OpenBlindBag(scene, itemData) {
    CreateLoadingPopup();

    centerData.RequestOpenBox(
        itemData.code,
        (result) => {
            HideLoadingPopup();

            // Giảm số lượng item trực tiếp
            itemData.quantity -= 1;

            // Cập nhật lại danh sách item
            if (container_item_list && container_item_list.gridTable) {
                // Sau khi giảm số lượng, cập nhật lại toàn bộ danh sách
                // Gọi lại hàm tạo danh sách item để refresh giao diện
                CreateItemList(scene);
            }

            CreateItemBlindBagRewardPopup(scene, result.data);
        },
        (error) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, `OpenBox failed:\n${error}`);
        }
    );
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen == true) return;

    isOpen = true;

    MovePlayerBarToHide(scene);

    container_popup.setPosition(
        container_popup_close_position.x,
        container_popup_close_position.y
    );

    const openTween = scene.tweens.add({
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

    MovePlayerBarToDefault(scene);

    container_popup.setPosition(
        container_popup_open_position.x,
        container_popup_open_position.y
    );

    const closeTween = scene.tweens.add({
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

export function DestroyInventory(scene) {
    // ✅ Clean up all tracked events
    inventoryResources.events.forEach(({ target, event, handler }) => {
        if (target && target.off) {
            target.off(event, handler);
        }
    });

    // ✅ Stop all tracked tweens
    inventoryResources.tweens.forEach(tween => {
        if (tween && tween.isActive && tween.isActive()) {
            tween.stop();
        }
    });

    // ✅ Remove all tracked timers
    inventoryResources.timers.forEach(timer => {
        if (timer && timer.remove) {
            timer.remove();
        }
    });

    // ✅ Reset resources
    inventoryResources.events = [];
    inventoryResources.tweens = [];
    inventoryResources.timers = [];

    // ✅ Destroy containers
    if (container_main && container_main.destroy) {
        container_main.destroy();
        container_main = null;
    }

    // Reset state
    isOpen = false;
    container_popup = null;
    container_popup_0 = null;
    container_popup_1 = null;
    container_item_list = null;

    // ⚠️ IMPORTANT: NO localStorage, sessionStorage, or socket auth cleanup here!
}

// ✅ Backward compatibility
function Destroy(scene) {
    DestroyInventory(scene);
}

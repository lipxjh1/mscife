import centerData from "../../../Data/CenterData.js";
import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerDataPlayer from "../../../Data/CenterDataPlayer.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import { CreatePieceCard } from "../../Share/PieceCard.js";
import { CreateCharacterRewardPopup } from "../../Share/PopupReward.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";

let container_main = null;

let container_popup = null;
const container_popup_openPosition = { x: 0, y: 0 };
const container_popup_closePosition = { x: 0, y: 4000 };

let container_0;
let container_item_list = null;

let isOpen = false;

// Biến để theo dõi trạng thái kéo thả
let isDragging = false;
let dragStartY = 0;
const MIN_DRAG_DISTANCE = 10; // Ngưỡng xác định kéo thả (pixel)

export function CreateFragment(scene) {
    Destroy(scene);
    LoadAssetsDone(scene);
}

function LoadAssetsDone(scene) {
    container_main = scene.add.container(0, 0);
    container_main.setDepth(100);

    const lock_bg = scene.add
        .image(540, 960, "home_character_piece_bg")
        .setOrigin(0.5, 0.5)
        .setInteractive();
    container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_0 = scene.add.container(0, 0);
    container_popup.add(container_0);

    UpdateInventoryInfo(scene);

    Open(scene);
}

function UpdateInventoryInfo(scene) {
    CreateLoadingPopup();

    centerData.RequestInventory(
        () => {
            HideLoadingPopup();

            CreateItemList(scene);
        },
        (error) => {
            HideLoadingPopup();

            CreateAlertPopup(
                scene,
                "Request inventory failed\n" + error.message
            );
        }
    );
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    if (container_item_list) {
        container_item_list.destroy();
    }

    container_item_list = scene.add.container(0, 0);
    container_popup.add(container_item_list);

    let itemData = [];

    // Lấy tất cả các key (tên nhân vật)
    let char_keys = Object.keys(centerDataPlayer.dataPlayerDictionary);

    for (let i = 0; i < char_keys.length; i++) {
        let localItemData = centerDataItem.getItemById(
            char_keys[i] + "_fragment_1"
        );

        if (localItemData != null) {
            const newItem = {
                itemId: char_keys[i],
                amount: 0,
                localItemData: localItemData,
            };

            itemData.push(newItem);
        }
    }

    const scrollViewWidth = 1080;
    const scrollViewHeight = 1712;
    const spaceWidth = 20 / 2;
    const spaceHeight = 30 / 2;
    const cellWidth = 497;
    const cellHeight = 674;
    const posX = 38 + scrollViewWidth / 2;
    const posY = 208 + scrollViewHeight / 2;

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

            mouseWheelScroller: {
                focus: false,
                speed: 1,
            },

            items: itemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    item = cell.item,
                    index = cell.index;

                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = createCardContainer(scene);
                }

                // Cập nhật nội dung của card với dữ liệu item mới
                updateCardContent(cellContainer, scene, item);

                return cellContainer;
            },

            space: {
                top: 10,
                bottom: 40,
            },

            align: "center",
        })
        .layout();

    // Theo dõi trạng thái kéo thả cho toàn bộ GridTable
    scene.input.on("pointerdown", function (pointer) {
        isDragging = false;
        dragStartY = pointer.y;
    });

    scene.input.on("pointermove", function (pointer) {
        if (
            !isDragging &&
            Math.abs(pointer.y - dragStartY) > MIN_DRAG_DISTANCE
        ) {
            isDragging = true;
        }
    });

    scene.input.on("pointerup", function (pointer) {
        isDragging = false;
    });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    const maskShape = scene.add
        .rectangle(540, 208 + 1712 / 2, scrollViewWidth, 1712, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

// Tạo container cho card
function createCardContainer(scene) {
    const container = scene.add.container(0, 0);
    container.setSize(497, 674);
    return container;
}

// Cập nhật nội dung card
function updateCardContent(container, scene, item) {
    let width = 497;
    let height = 674;

    // Lưu trữ dữ liệu item
    container.itemData = item;

    // Xóa nội dung cũ nếu có
    while (container.list.length > 0) {
        container.list[0].destroy();
    }

    if (!item) return;

    // Tạo container nội dung
    const container_card_inner = scene.add.container(0, 0);
    container.add(container_card_inner);

    // Background
    const btn_item = scene.add
        .image(0, 0, "home_character_piece_item_bg")
        .setOrigin(0, 0);
    container_card_inner.add(btn_item);

    // Xử lý dữ liệu mảnh
    let total = 0;
    let fragment_1_count = 0;
    let fragment_2_count = 0;
    let fragment_3_count = 0;
    let fragment_4_count = 0;
    let lowestFragment = 0;
    let combineCheck = 0;

    // Lấy số lượng mảnh 1
    let fragment_1 = centerData.getItemOwnById(item.itemId + "_fragment_1");
    if (fragment_1) {
        fragment_1_count = fragment_1.quantity;
        total += fragment_1_count;
        lowestFragment = fragment_1_count;

        if (fragment_1_count > 0) {
            combineCheck += 1;
        }
    }

    // Lấy số lượng mảnh 2
    let fragment_2 = centerData.getItemOwnById(item.itemId + "_fragment_2");
    if (fragment_2) {
        fragment_2_count = fragment_2.quantity;
        total += fragment_2_count;

        if (fragment_2_count < lowestFragment) {
            lowestFragment = fragment_2_count;
        }

        if (fragment_2_count > 0) {
            combineCheck += 1;
        }
    }

    // Lấy số lượng mảnh 3
    let fragment_3 = centerData.getItemOwnById(item.itemId + "_fragment_3");
    if (fragment_3) {
        fragment_3_count = fragment_3.quantity;
        total += fragment_3_count;

        if (fragment_3_count < lowestFragment) {
            lowestFragment = fragment_3_count;
        }

        if (fragment_3_count > 0) {
            combineCheck += 1;
        }
    }

    // Lấy số lượng mảnh 4
    let fragment_4 = centerData.getItemOwnById(item.itemId + "_fragment_4");
    if (fragment_4) {
        fragment_4_count = fragment_4.quantity;
        total += fragment_4_count;

        if (fragment_4_count < lowestFragment) {
            lowestFragment = fragment_4_count;
        }

        if (fragment_4_count > 0) {
            combineCheck += 1;
        }
    }

    if (combineCheck < 4) {
        lowestFragment = 0;
    }

    // Cập nhật PieceCard - đã bao gồm hiển thị màn đen cho các mảnh có số lượng = 0
    const container_piece_card = CreatePieceCard(
        scene,
        "",
        item.itemId + "_fragment_1",
        fragment_1_count,
        fragment_2_count,
        fragment_3_count,
        fragment_4_count
    );
    container_piece_card.setScale(437 / 512);
    container_piece_card.setPosition(30 + 437 / 2, 30 + 437 / 2);
    container_card_inner.add(container_piece_card);

    // Fragment markers
    const item_fragment_1_mark = scene.add
        .text(30 + 10, 30 + 10, "I", {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "left",
        })
        .setStroke("#000000", 8)
        .setOrigin(0, 0);
    container_card_inner.add(item_fragment_1_mark);

    const item_fragment_2_mark = scene.add
        .text(30 + 437 / 2 + 10, 30 + 10, "II", {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "left",
        })
        .setStroke("#000000", 8)
        .setOrigin(0, 0);
    container_card_inner.add(item_fragment_2_mark);

    const item_fragment_3_mark = scene.add
        .text(30 + 10, 30 + 437 / 2 + 10, "III", {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "left",
        })
        .setStroke("#000000", 8)
        .setOrigin(0, 0);
    container_card_inner.add(item_fragment_3_mark);

    const item_fragment_4_mark = scene.add
        .text(30 + 437 / 2 + 10, 30 + 437 / 2 + 10, "IV", {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "left",
        })
        .setStroke("#000000", 8)
        .setOrigin(0, 0);
    container_card_inner.add(item_fragment_4_mark);

    // Fragment counts
    const item_fragment_1 = scene.add
        .text(30 + 437 / 2 - 10, 30 + 437 / 2 - 10, "x" + fragment_1_count, {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "right",
        })
        .setStroke("#000000", 8)
        .setOrigin(1, 1);
    container_card_inner.add(item_fragment_1);

    const item_fragment_2 = scene.add
        .text(30 + 437 - 10, 30 + 437 / 2 - 10, "x" + fragment_2_count, {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "right",
        })
        .setStroke("#000000", 8)
        .setOrigin(1, 1);
    container_card_inner.add(item_fragment_2);

    const item_fragment_3 = scene.add
        .text(30 + 437 / 2 - 10, 30 + 437 - 10, "x" + fragment_3_count, {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "right",
        })
        .setStroke("#000000", 8)
        .setOrigin(1, 1);
    container_card_inner.add(item_fragment_3);

    const item_fragment_4 = scene.add
        .text(30 + 437 - 10, 30 + 437 - 10, "x" + fragment_4_count, {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "right",
        })
        .setStroke("#000000", 8)
        .setOrigin(1, 1);
    container_card_inner.add(item_fragment_4);

    // Craft button
    const btn_craft_container = scene.add.container(38 + 437 / 2, 568 + 76 / 2);
    container_card_inner.add(btn_craft_container);

    const btn_craft_inner = scene.add.container(-437 / 2, -76 / 2);
    btn_craft_container.add(btn_craft_inner);

    const btn_craft = scene.add
        .image(0, 0, "home_character_piece_item_btn_craft")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
    btn_craft_inner.add(btn_craft);

    // Sử dụng pointerup thay vì pointerdown để phân biệt giữa kéo và click
    let pointerDownTime = 0;
    const MAX_CLICK_TIME = 300; // Thời gian tối đa cho một click (ms)

    btn_craft.on("pointerdown", function (pointer) {
        pointerDownTime = scene.time.now;
    });

    btn_craft.on("pointerup", function (pointer) {
        const clickDuration = scene.time.now - pointerDownTime;

        // Chỉ xử lý click khi không phải đang kéo và trong thời gian click hợp lệ
        if (!isDragging && clickDuration < MAX_CLICK_TIME) {
            if (combineCheck >= 4) {
                ClickItem(scene, item);
            } else {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeFragment.KEY,
                        "Fragments not enough to craft"
                    )
                );
            }
        }
    });

    const btn_craft_text = scene.add
        .text(
            437 / 2,
            76 / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeFragment.KEY,
                "Craft"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#FFF",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);
    btn_craft_inner.add(btn_craft_text);

    // Animation for button
    btn_craft.on("pointerover", function () {
        scene.tweens.add({
            targets: btn_craft_container,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            ease: "Power2",
        });
    });

    btn_craft.on("pointerout", function () {
        scene.tweens.add({
            targets: btn_craft_container,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: "Power2",
        });
    });

    //     const debugRect = scene.add.rectangle(0, 0, width, height, 0x00ff00, 0).setOrigin(0, 0);
    // debugRect.setStrokeStyle(2, 0x00ff00, 1);
    // container.add(debugRect);

    // Lưu trạng thái combineCheck vào item
    item.combineCheck = combineCheck;
}

function ClickItem(scene, item) {
    CreateAlertPopup(
        scene,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeFragment.KEY,
            `Do you want to craft?`
        ),
        () => {
            RequestCraft(scene, item);
        },
        () => {}
    );
}

function RequestCraft(scene, item) {
    CreateLoadingPopup();

    centerData.RequestCharactersCraft(
        item.itemId,
        (result) => {
            HideLoadingPopup();

            UpdateInventoryInfo(scene);

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

            CreateAlertPopup(scene, `Craft character failed\n${error}`);
        }
    );
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen) return;

    isOpen = true;

    container_popup.setPosition(
        container_popup_closePosition.x,
        container_popup_closePosition.y
    );

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_openPosition.x,
        y: container_popup_openPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

export function Close(scene) {
    if (isOpen == false) return;

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_closePosition.x,
        y: container_popup_closePosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            isOpen = false;

            Destroy();
        },
    });
}

function Destroy() {
    if (container_main) container_main.destroy();

    container_main = null;

    if (container_item_list) container_item_list.destroy();

    container_item_list = null;
}

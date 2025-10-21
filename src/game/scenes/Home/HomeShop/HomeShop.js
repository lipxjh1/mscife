import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { CreateBuyItemPopup } from "../../Share/PopupBuyItem.js";
import {
    MovePlayerBarToDefault,
    MovePlayerBarToHide,
} from "../HomeTopBarPlayer.js";

let container_main = null;

let container_popup = null;
let container_popup_0 = null;
let container_popup_1 = null;
let container_popup_close_position = { x: 0, y: 4000 };
let container_popup_open_position = { x: 0, y: 0 };

let container_item_list = null;

let isOpen = false;

export function CreateShop(scene) {
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

    centerData.RequestShop(
        () => {
            HideLoadingPopup();

            CreateItemList(scene);
        },
        (error) => {
            HideLoadingPopup();

            CreateAlertPopup("Request shop failed\n" + error.message);
        }
    );

    Open(scene);
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    container_item_list = scene.add.container(0, 0);
    container_popup_0.add(container_item_list);

    let itemDataArr = [];

    for (let key in centerData.itemShopDictionary) {
        const item = centerData.itemShopDictionary[key];

        let itemData = centerDataItem.getItemById(item.code);

        if (itemData) {
            itemDataArr.push(item);
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

    gridTable.on(
        "cell.click",
        function (cellContainer, cellIndex) {
            // Khi một cell được click, gọi hàm xử lý
            if (cellContainer && cellContainer.itemData) {
                ClickItem(scene, cellContainer.itemData);
            }
        },
        scene
    );

    // gridTable.on("cell.over", function (cellContainer, cellIndex) {
    //     // Hiệu ứng khi hover vào
    //     if (cellContainer) {
    //         cellContainer.each(function (child) {
    //             if (child.setTint) {
    //                 child.setTint(0x646464);
    //             }
    //         });
    //     }
    // });

    // gridTable.on("cell.out", function (cellContainer, cellIndex) {
    //     // Bỏ hiệu ứng khi rời chuột
    //     if (cellContainer) {
    //         cellContainer.each(function (child) {
    //             if (child.clearTint) {
    //                 child.clearTint();
    //             }
    //         });
    //     }
    // });

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
    //   ).setOrigin(0.5,0.5);
    //   container_item_list.add(gridOrigin);

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

    // Hình ảnh item (dùng placeholder)
    const item_img = scene.add
        .image(137 + 180 / 2, 135 + 180 / 2, "__DEFAULT") // Sử dụng texture mặc định
        .setOrigin(0.5, 0.5)
        .setScale(180 / 350);
    container_card_inner.add(item_img);

    // Số lượng còn lại
    const item_text_remaining = scene.add
        .text(450 / 2, 361, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#595959",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_card_inner.add(item_text_remaining);

    // Giá item
    const item_text_price = scene.add
        .text(450 / 2, 464 + 36 / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0.5);
    container_card_inner.add(item_text_price);

    // Icon loại tiền tệ
    const chip_icon = scene.add
        .image(
            item_text_price.x + item_text_price.width / 2 + 40,
            item_text_price.y,
            "home_top_currency_chip_2"
        )
        .setOrigin(0, 0.5)
        .setDisplaySize(60, 60);
    container_card_inner.add(chip_icon);

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

        // Cập nhật số lượng
        if (item.hasOwnProperty("remaining")) {
            item_text_remaining.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Remaining: "
                ) + item.remaining
            );
            item_text_remaining.setVisible(true);

            // Gán lại hàm setRemaining để có thể cập nhật từ bên ngoài
            item.setRemaining = (quantity) => {
                item.remaining = quantity;
                const remainingText =
                    item.remaining > 0
                        ? cdLocalization.getLocalization(
                              cdLocalization.GROUP_KEYS.HomeShop.KEY,
                              "Remaining: "
                          ) + item.remaining
                        : cdLocalization.getLocalization(
                              cdLocalization.GROUP_KEYS.HomeShop.KEY,
                              "Sold Out"
                          );
                item_text_remaining.setText(remainingText);
            };
        } else {
            item_text_remaining.setVisible(false);
        }

        // Cập nhật giá và icon tiền tệ
        let price = item.price;
        let isScore = false;
        if (price === 0) {
            price = item.priceScore;
            isScore = true;
        }

        item_text_price.setText(price);

        // Cập nhật vị trí icon tiền tệ sau khi set text cho giá
        chip_icon.x = item_text_price.x + item_text_price.width / 2 + 20;
        chip_icon.setTexture(
            isScore ? "home_top_currency_chip_1" : "home_top_currency_chip_2"
        );
    };

    // const gridOrigin = scene.rexUI.add.roundRectangle(
    //     container_card.x,
    //     container_card.y,
    //     50,
    //     50,
    //     0,
    //     0xffffff,
    //     1
    //   ).setOrigin(0.5,0.5);
    //   container_card.add(gridOrigin);

    return container_card;
}

function ClickItem(scene, item) {
    //console.log("Shop click item: ", item);

    CreateBuyItemPopup(
        scene,
        item.code,
        item.name,
        item.price,
        item.priceScore,
        item.remaining,
        item.description,
        (result, buyAmount) => {
            if (item.remaining) {
                item.setRemaining(item.remaining - buyAmount);
            }
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

    MovePlayerBarToDefault(scene);

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

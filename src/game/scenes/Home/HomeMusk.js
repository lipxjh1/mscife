import centerData from "../../Data/CenterData";
import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../Share/AlertPopup";

import { SendTransaction } from "../../wallet/Wallet.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../AssetLoadingManager.js";

let container_main = null;

let container_popup = null;
const container_popup_openPosition = { x: 0, y: 0 };
const container_popup_closePosition = { x: 0, y: 4000 };

let container_0;
let container_item_list = null;

const packs = {
    basic: { name: "Basic Pack", musk: 50, tonPrice: 0.5 },
    genesis: { name: "Genesis Pack", musk: 200, tonPrice: 2 },
    glory_pack: { name: "Glory Pack", musk: 500, tonPrice: 5 },
    divine_pack: { name: "Divine Pack", musk: 1000, tonPrice: 10 },
    immortal_pack: { name: "Immortal Pack", musk: 2000, tonPrice: 20 },
    emperor_pack: { name: "Emperor Pack", musk: 5000, tonPrice: 50 },
    golden_pack: { name: "Golden Pack", musk: 10000, tonPrice: 100 },
    celestial_pack: { name: "Celestial Pack", musk: 20000, tonPrice: 200 },
    god_king_pack: { name: "God King Pack", musk: 50000, tonPrice: 500 },
    legendary_pack: { name: "Legendary Pack", musk: 100000, tonPrice: 1000 },
};

export function OpenMuskContainer(scene) {
    // return; // ENABLED: Musk purchase UI - 2025-11-26

    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyMuskPack(() => {
        HideLoadingPopup();

        loadAssetDone(scene);
    });

    function loadAssetDone() {
        container_main = scene.add.container(0, 0);
        container_main.setDepth(300);

        const lock_bg = scene.rexUI.add.roundRectangle(
            originWidth / 2,
            originHeight / 2,
            originWidth,
            originHeight,
            0,
            0x000000,
            0.75
        );

        // Thiết lập tương tác
        lock_bg.setInteractive({ useHandCursor: true }); // Thêm { useHandCursor: true } để thay đổi con trỏ thành bàn tay khi di chuột vào

        // Bắt sự kiện click hoặc chạm vào
        lock_bg.on("pointerdown", function (pointer) {});

        container_main.add(lock_bg);

        container_popup = scene.add.container(0, 0);
        container_main.add(container_popup);

        container_0 = scene.add.container(0, 0);
        container_popup.add(container_0);

        const img_title = scene.add
            .image(615, 248, "home_musk_title")
            .setOrigin(0, 0);
        container_main.add(img_title);

        scene.tweens.add({
            targets: img_title,
            x: { from: 615 * 2, to: 615 },
            duration: 500,
            ease: "Power2",
            onComplete: () => {},
        });

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

        container_popup.add(btn_close);

        CreateItemList(scene);

        Open(scene);
    }
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    container_item_list = scene.add.container(0, 0);
    container_popup.add(container_item_list);

    let itemData = [];

    for (let key in packs) {
        const item = packs[key];
        itemData.push(item);
    }

    const scrollViewWidth = 1080;

    const scrollViewHeight = 1533;

    const spaceWidth = 72;

    const spaceHeight = 32;

    const cellWidth = 424;

    const cellHeight = 522;

    const posX = 80 + scrollViewWidth / 2 + cellWidth / 2;

    const posY = 387 + scrollViewHeight / 2;

    // const grid_bg = scene.rexUI.add.roundRectangle(
    //     posX,
    //     posY,
    //     scrollViewWidth,
    //     scrollViewHeight,
    //     0,
    //     0x000000,
    //     0.5
    // );
    // container_popup.add(grid_bg);

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

            items: itemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: width,
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
                top: 32 / 2,
                bottom: 32 / 2,
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

    // const gridOrigin = scene.rexUI.add.roundRectangle(
    //     gridTable.x,
    //     gridTable.y,
    //     50,
    //     50,
    //     0,
    //     0xffffff,
    //     1
    // );
    // container_item_list.add(gridOrigin);

    const maskShape = scene.add
        .rectangle(80 + 920 / 2, 387 + 1533 / 2, 1080, 1533, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function card_item(scene, i, item) {
    //console.log("Item = ", item);

    const container_card = scene.add.container(0, 0);

    const container_card_inner = scene.add.container(-424 / 2, -522 / 2);
    container_card.add(container_card_inner);

    let pressStartTime = 0;

    const btn_item = scene.add.image(0, 0, "home_musk_pack_bg").setOrigin(0, 0);
    container_card_inner.add(btn_item);

    const item_img = scene.add
        .image(52 + 319 / 2, 52 + 319 / 2, "item_musk")
        .setDisplaySize(319, 319)
        .setOrigin(0.5, 0.5);
    container_card_inner.add(item_img);

    const item_text_musk = scene.add
        .text(383, 391, "x" + item.musk, {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 2,
        })
        .setOrigin(1, 1);
    container_card_inner.add(item_text_musk);

    const btn_buy = scene.add
        .image(16 + 391 / 2, 433 + 72 / 2, "home_musk_buy_btn")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ClickItem(scene, item);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_buy,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_buy,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_card_inner.add(btn_buy);

    const item_text_buy = scene.add
        .text(102 - 20, 443, "Buy", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_card_inner.add(item_text_buy);

    const item_text_price = scene.add
        .text(322 + 30, 443, item.tonPrice + " TON", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#00FF7B",
            align: "right",
        })
        .setOrigin(1, 0);
    container_card_inner.add(item_text_price);

    return container_card;
}

function ClickItem(scene, item) {
    let wallet_address = centerData.GetWalletAddress();

    if (centerData.walletType === centerData.WalletType.SUI.KEY) {
        CreateAlertPopup(scene, "Sui Wallet is currently under development");
    } else if (wallet_address == null || wallet_address === "") {
        CreateAlertPopup(
            scene,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeMusk.KEY,
                "Wallet is not connected"
            )
        );
    } else {
        CreateAlertPopup(
            scene,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeMusk.KEY,
                `Do you want to buy {i} M-Coin with {i} TON`,
                [item.musk, item.tonPrice]
            ),
            () => {
                RequestBuyMusk(scene, item);
            },
            () => {}
        );
    }
}

function RequestBuyMusk(scene, item) {
    let receiver = centerData.GetReceiverAddress();

    if (receiver && receiver !== "") {
        SendTransaction(
            item.tonPrice,
            receiver,
            () => {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeMusk.KEY,
                        "Transaction successful\nthe process may take up to 8 hours."
                    )
                );
            },
            () => {
                CreateAlertPopup(scene, "Transaction failed");
            }
        );
    } else {
        CreateAlertPopup(scene, "No receiver found");
    }
}

function Open(scene) {
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

function Close(scene) {
    scene.tweens.add({
        targets: container_popup,
        x: container_popup_closePosition.x,
        y: container_popup_closePosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            Destroy();
        },
    });
}

function Destroy() {
    container_main.destroy();

    container_main = null;

    container_item_list = null;
}

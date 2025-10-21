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
import {
    container_menu_buttons,
    GetTradeAbleItems,
} from "./HomeCenterMarket.js";

import { container_center_market_main_sub } from "./HomeCenterMarketMain.js";
import { CreateCenterMarketItemsPieceAll } from "./HomeCenterMarketMainItemsPieceAll.js";
import {
    CreateCenterMarketItemsType,
    GetItemTypeContainerMain,
} from "./HomeCenterMarketMainItemsType.js";

let container_main = null;

let isOpen = false;

let btn_close = null;

let groupCharacterFragments = {};

export function CreateCenterMarketItemsPieceCode(scene) {
    //console.log("CreateCenterMarketCharacter");

    isOpen = false;

    Destroy();

    container_main = scene.add.container(0, 0);
    GetItemTypeContainerMain().add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    //create close btn
    btn_close = scene.add
        .image(38 + 118 / 2, 58 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ////console.log("btn_close clicked");

            Close(scene);
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

    container_menu_buttons.add(btn_close);

    RequestBuyItemList(scene);

    Open(scene);
}

export function GetFragmentByCode(code) {
    return groupCharacterFragments[code];
}

export function UpdateFragmentByCode(code, data) {
    groupCharacterFragments[code] = data;
}

function RequestBuyItemList(scene) {
    CreateLoadingPopup();

    let itemCodes = Object.keys(centerData.baseItemInfo);

    let tradableItems = GetTradeAbleItems();

    itemCodes = itemCodes.filter(
        (item) =>
            /_fragment_/.test(item) &&
            tradableItems.includes(item.toLocaleUpperCase())
    );

    centerData.RequestGetCMarketItemListingStatistics(
        itemCodes,
        (result) => {
            HideLoadingPopup();

            groupCharacterFragments = {};

            for (let i = 0; i < result.data.length; i++) {
                let itemData = result.data[i];
                let itemCode = itemData.itemCode;
                groupCharacterFragments[itemCode] = itemData;
            }

            CreateItemList(scene);
        },
        (error) => {
            HideLoadingPopup();
        }
    );
}

let container_list = null;

function CreateItemList(scene) {
    if (container_list) {
        container_list.destroy();
    }

    //Create friend list
    container_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_main.add(container_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1210;

    const columns = 1;
    const rows = Math.ceil(2 / columns);

    const itemWidth = 1020;
    const itemHeight = 215;
    const itemSpacing = 215 / 2 + 24 / 2;

    const posX = 0 + scrollViewWidth / 2;
    const posY = 583 + scrollViewHeight / 2;

    // const background = scene.add
    //     .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0xffffff)
    //     .setAlpha(0.5);
    // container_list.add(background);

    // Tạo một Scrollable Panel (bảng cuộn)
    const scrollablePanel = scene.rexUI.add
        .scrollablePanel({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            panel: {
                child: scene.rexUI.add.gridSizer({
                    width: scrollViewWidth,
                    height: scrollViewHeight,
                    column: columns,
                    row: rows,
                    columnProportions: 0,
                    rowProportions: 0,
                    space: {
                        column: itemSpacing,
                        row: itemSpacing,
                    },
                }),
                mask: {
                    padding: 1,
                },
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.2,
            },
            space: {
                left: 60,
                right: 0,
                top: 10,
                bottom: 215 / 2 + 24 / 2,
            },
        })
        .layout();

    container_list.add(scrollablePanel);

    let baseCharacterArr = Object.values(centerData.baseCharacterInfo);

    let allowItemCodes = GetTradeAbleItems();

    for (let i = 0; i < baseCharacterArr.length; i++) {
        let baseInfo = baseCharacterArr[i];

        if (
            allowItemCodes.includes(baseInfo.code.toUpperCase() + "_FRAGMENT_1")
        ) {
            let pieceKey = `${baseInfo.code}_fragment_1`;

            let itemLocalData = centerDataItem.getItemById(pieceKey);

            let count = 0;

            for (let i = 0; i < 4; i++) {
                let pieceKey = `${baseInfo.code}_fragment_${
                    i + 1
                }`.toLocaleUpperCase();
                let pieceData = GetFragmentByCode(pieceKey);
                count += pieceData.totalListings;
            }

            if (itemLocalData != null && count > 0) {
                const indexData = {
                    baseInfo: baseInfo,
                    itemLocalData: itemLocalData,
                    count: count,
                };

                let container_item = CreateItem(
                    scene,
                    scrollablePanel,
                    indexData
                );

                container_item.button_buy.button.on("pointerdown", function () {
                    CreateCenterMarketItemsPieceAll(scene, baseInfo.code);

                    Destroy();
                });
            }
        }
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateItem(scene, scrollablePanel, itemData) {
    //console.log("CreateItem itemData: ", itemData);

    let itemWidth = 1020;
    let itemHeight = 125;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add
        .image(0, 0, "home_center_market_main_element_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.icon = scene.add
        .image(28, 33, item.itemData.itemLocalData.imgKey)
        .setScale(100 / 350)
        .setOrigin(0, 0);
    container_inner.add(item.icon);

    item.text_name = scene.add
        .text(
            238,
            33,

            item.itemData.baseInfo.name +
                " " +
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                    "Pieces"
                ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_name);

    item.text_quantity = scene.add
        .text(
            238,
            143,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Quantity"
            ) +
                ": " +
                item.itemData.count,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_quantity);

    item.button_buy = CreateButton0(
        scene,
        container_inner,
        779 + 218 / 2,
        63 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Select"
        )
    );

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
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
        .image(0, 0, "home_center_market_button_0")
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

    CreateCenterMarketItemsType(scene);
}

export function Destroy(scene) {
    if (container_main) {
        container_main.destroy();
    }

    if (btn_close) {
        btn_close.destroy();
    }
}

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
import { CreateCharacterCard } from "../../Share/CharacterCard.js";
import { CreateCenterMarketSellItems } from "./HomeCenterMarketSellItems.js";

import { container_center_market_sell_sub } from "./HomeCenterMarketSell.js";
import { CreateCenterMarketSellItemsPieceCode } from "./HomeCenterMarketSellItemsPieceCode.js";

import { Destroy as DestroySellItems } from "./HomeCenterMarketSellItems.js";
import { Destroy as DestroySellItemsPieceCode } from "./HomeCenterMarketSellItemsPieceCode.js";
import { Destroy as DestroySellItemsPieceAll } from "./HomeCenterMarketSellItemsPieceAll.js";

let container_main = null;

let isOpen = false;

let groupSellItemsDefault = {};

let groupSellItemsPiece = {};

export function CreateCenterMarketSellItemsType(scene) {
    //console.log("CreateCenterMarketSellItems");

    isOpen = false;

    Destroy();

    container_main = scene.add.container(0, 0);
    container_center_market_sell_sub.add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    RequestToSellItemListType(
        scene,
        () => {
            CreateItemList(scene);
        },
        () => {}
    );

    Open(scene);
}

export function GetItemTypeContainerMain() {
    return container_main;
}

export function RequestToSellItemListType(scene, onSuccess, onError) {
    CreateLoadingPopup();

    centerData.RequestInventory(
        (result) => {
            HideLoadingPopup();

            groupItemType();

            if (onSuccess && typeof onSuccess === "function") {
                onSuccess();
            }
        },
        (error) => {
            HideLoadingPopup();

            if (onError && typeof onError === "function") {
                onError();
            }
        }
    );
}

export function GetGroupSellItems() {
    return groupSellItemsDefault;
}

export function GetGroupSellItemsPiece() {
    return groupSellItemsPiece;
}

function groupItemType() {
    groupSellItemsDefault = {};

    groupSellItemsPiece = {};

    let inventoryItemArray = Object.values(centerData.inventoryDictionary);

    inventoryItemArray.forEach((obj) => {
        // Filtrar itens CONNECTED_NEURALINK_ e ELITE_NEURALINK_
        if (
            obj.code.includes("CONNECTED_NEURALINK_") ||
            obj.code.includes("ELITE_NEURALINK_")
        ) {
            return; // Pular estes itens
        }

        if (obj.code.includes("_fragment_")) {
            let charCode = obj.code.split("_")[0];

            if (!groupSellItemsPiece[charCode]) {
                groupSellItemsPiece[charCode] = {};
            }

            if (!groupSellItemsPiece[charCode][obj.code]) {
                groupSellItemsPiece[charCode][obj.code] = {};
            }

            groupSellItemsPiece[charCode][obj.code] = obj;
        } else {
            if (!groupSellItemsDefault[obj.code]) {
                groupSellItemsDefault[obj.code] = {};
            }

            groupSellItemsDefault[obj.code] = obj;
        }
    });

    // console.log("groupItemsDefault: ", groupSellItemsDefault);

    // console.log("groupItemsPiece: ", groupSellItemsPiece);
}

let container_item_list = null;

function DestroyItemList() {
    if (container_item_list) {
        container_item_list.destroy();
    }
}

function CreateItemList(scene) {
    //console.log("CreateItemList: ");

    if (container_item_list) {
        container_item_list.destroy();
    }

    //Create friend list
    container_item_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_main.add(container_item_list);

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

    container_item_list.add(scrollablePanel);

    let container_item = CreateItem(scene, scrollablePanel);

    container_item.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Items"
        )
    );

    container_item.button_sell.button.on("pointerdown", function () {
        CreateCenterMarketSellItems(scene);

        DestroyItemList();
    });

    let container_piece = CreateItem(scene, scrollablePanel);

    container_piece.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Hero Pieces"
        )
    );

    container_piece.button_sell.button.on("pointerdown", function () {
        CreateCenterMarketSellItemsPieceCode(scene);

        DestroyItemList();
    });

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateItem(scene, scrollablePanel) {
    // console.log("CreateItem itemData: ", itemData);

    let itemWidth = 1020;
    let itemHeight = 125;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add
        .image(0, 0, "home_center_market_main_element_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.text_name = scene.add
        .text(28, 33, "Name", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "38px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_name);

    item.button_sell = CreateButton0(
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
}

export function Destroy(scene) {
    if (container_main) {
        container_main.destroy();
    }

    DestroySellItems();
    DestroySellItemsPieceCode();
    DestroySellItemsPieceAll();
}

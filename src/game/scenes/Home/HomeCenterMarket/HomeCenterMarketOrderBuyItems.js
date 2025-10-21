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

import { container_center_market_order_buy_sub } from "./HomeCenterMarketOrderBuy.js";

let container_main = null;

let isOpen = false;

export function CreateCenterMarketOrderBuyItems(scene) {
    Destroy(scene);

    isOpen = false;

    container_main = scene.add.container(0, 0);
    container_center_market_order_buy_sub.add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    const emptyText = scene.add
        .text(
            540,
            600,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "SYSTEM MAINTENANCE ANNOUNCEMENT"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 10,
            }
        )
        .setOrigin(0.5, 0.5);
    container_main.add(emptyText);

    //RequestOrderBuyList(scene);

    Open(scene);
}

function RequestOrderBuyList(scene) {
    CreateLoadingPopup();

    centerData.RequestCenterMarketOrderBuy(
        (result) => {
            HideLoadingPopup();

            //console.log("RequestCenterMarketOrderBuy result:", JSON.stringify(result, null, 2));

            // Lọc chỉ lấy đơn hàng mua game items và character fragments
            let itemOrders = result.orders.filter(
                (order) =>
                    order.tradableItemId &&
                    (order.tradableItemId.type === "GAME_ITEM" ||
                        order.tradableItemId.type === "CHARACTER_FRAGMENT")
            );

            CreateItemList(scene, itemOrders);
        },
        (error) => {
            HideLoadingPopup();
            //console.error("RequestCenterMarketOrderBuy error:", error);
        }
    );
}

let container_list = null;

function CreateItemList(scene, receivedData) {
    //console.log("CreateItemList receivedData: ", receivedData);

    if (container_list) {
        container_list.destroy();
    }

    container_list = scene.add.container(0, 0);
    container_main.add(container_list);

    if (!receivedData || receivedData.length === 0) {
        const emptyText = scene.add
            .text(540, 600, "No Data", {
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

    const columns = 1;
    const rows = Math.ceil(receivedData.length / columns);

    const itemWidth = 1020;
    const itemHeight = 165;
    const itemSpacing = 255 / 2 + 24 / 2;

    const posX = 0 + scrollViewWidth / 2;
    const posY = 583 + scrollViewHeight / 2;

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
                bottom: 255 / 2 + 24 / 2,
            },
        })
        .layout();

    container_list.add(scrollablePanel);

    for (let i = 0; i < receivedData.length; i++) {
        let indexData = receivedData[i];

        let container_item = CreateItem(scene, scrollablePanel, indexData);

        if (container_item) {
            container_item.button_cancel.button.on("pointerdown", function () {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.Main.KEY,
                        "Do you want to cancel buying?"
                    ),
                    () => {
                        CreateLoadingPopup();

                        centerData.RequestCenterMarketMSCIOrderCancel(
                            indexData._id,
                            () => {
                                HideLoadingPopup();
                                RequestOrderBuyList(scene);
                            },
                            () => {
                                HideLoadingPopup();
                            }
                        );
                    },
                    () => {}
                );
            });
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

function formatDateTime(dateString) {
    const d = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function CreateItem(scene, scrollablePanel, itemData) {
    //console.log("CreateItem itemData: ", itemData);

    const itemWidth = 1020;
    const itemHeight = 165;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    let itemCode = itemData.tradableItemId.code;
    let itemLocalData = centerDataItem.getItemById(itemCode);

    item.bg = scene.add
        .image(0, 0, "home_center_market_main_element_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    // Kiểm tra itemLocalData trước khi tạo icon
    if (!itemLocalData || !itemLocalData.imgKey) {
        //console.warn("Không tìm thấy dữ liệu itemLocalData hoặc imgKey:", itemCode, itemLocalData);
        return null;
    }

    item.icon = scene.add
        .image(28, 33, itemLocalData.imgKey)
        .setScale(100 / 350)
        .setOrigin(0, 0);
    container_inner.add(item.icon);

    let itemName = itemData.details.name || itemData.tradableItemId.code;

    let currentY = 33;
    const lineSpacing = 12;

    item.text_name = scene.add
        .text(
            238,
            currentY,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                itemName
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
    currentY += item.text_name.height + lineSpacing;

    item.text_quantity = scene.add
        .text(
            238,
            currentY,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Quantity"
            ) +
                ": " +
                item.itemData.quantity,
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

    item.text_status = scene.add
        .text(
            750,
            currentY,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Status"
            ) +
                ": " +
                itemData.status,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#00FF00",
                align: "right",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(1, 0);
    container_inner.add(item.text_status);
    currentY += item.text_quantity.height + lineSpacing;

    item.text_price = scene.add
        .text(238, currentY, "M-Coin: " + item.itemData.price, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#FFA600",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_price);
    currentY += item.text_price.height + lineSpacing;

    // CreatedAt
    item.text_create_time = scene.add
        .text(1010, 5, formatDateTime(item.itemData.createdAt), {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(item.text_create_time);

    item.button_cancel = CreateButton0(
        scene,
        container_inner,
        779 + 218 / 2,
        63 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Cancel"
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
        .image(0, 0, "home_center_market_button_0_2")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
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
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#FFF",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

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

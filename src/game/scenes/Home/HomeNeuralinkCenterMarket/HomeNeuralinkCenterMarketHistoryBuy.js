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

import { container_center_market_history_sub } from "./HomeNeuralinkCenterMarketHistory.js";

let container_main = null;

let isOpen = false;

let scrollablePanel = null;

let currentPage = 0;

let totalPages = 0;

export function CreateNeuralinkCenterMarketHistoryBuy(scene) {
    //console.log("CreateNeuralinkCenterMarketHistoryBuy");

    Destroy(scene);

    isOpen = false;

    container_main = scene.add.container(0, 0);
    container_center_market_history_sub.add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    RequestOrderBuyList(scene);

    Open(scene);
}

function RequestOrderBuyList(scene) {
    CreateLoadingPopup();

    currentPage = 1;

    totalPages = 1;

    centerData.RequestNeuralinkCenterMarketItemHistoryBuy(
        currentPage,
        (result) => {
            HideLoadingPopup();

            totalPages = result.data.pagination.pages;

            CreateScrollviewList(scene, result);
        },
        (error) => {
            HideLoadingPopup();
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

        centerData.RequestNeuralinkCenterMarketItemHistoryBuy(
            currentPage,
            (result) => {
                isUpdating = false;

                HideLoadingPopup();

                CreateUpdateItemList(scene, result);
            },
            (error) => {
                isUpdating = false;

                HideLoadingPopup();
            }
        );
    }
}

let container_scrollview_list = null;

function CreateScrollviewList(scene, receivedData) {
    //console.log("CreateScrollviewList receivedData: ", receivedData);

    if (container_scrollview_list) {
        container_scrollview_list.destroy();
    }

    //Create friend list
    container_scrollview_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_main.add(container_scrollview_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1210;

    const columns = 1;
    const rows = Math.ceil(2 / columns);

    const itemWidth = 1020;
    const itemHeight = 215;
    const itemSpacing = 10;

    const posX = 0 + scrollViewWidth / 2;
    const posY = 583 + scrollViewHeight / 2;

    scrollablePanel = scene.rexUI.add
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

    scrollablePanel.itemLenght = receivedData.data.orders.length;

    container_scrollview_list.add(scrollablePanel);

    for (let i = 0; i < receivedData.data.orders.length; i++) {
        CreateItem(scene, scrollablePanel, receivedData.data.orders[i]);
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_scrollview_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateUpdateItemList(scene, receivedData) {
    scrollablePanel.itemLenght += receivedData.data.orders.length;

    for (let i = 0; i < receivedData.data.orders.length; i++) {
        CreateItem(scene, scrollablePanel, receivedData.data.orders[i]);
    }

    scrollablePanel.layout();
}

function CreateItem(scene, scrollablePanel, itemData) {
    //console.log("CreateItem itemData: ", itemData);

    let itemWidth = 1020;
    let itemHeight = 215;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);
    item.setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function (pointer) {
            //console.log("btn_item clicked");

            scrollablePanel.startY = pointer.y;

            scrollablePanel.isDragging = true;

            item.startTime = scene.time.now; // Lấy thời gian hiện tại khi nhấn chuột
        })
        .on("pointermove", function (pointer) {
            //console.log("btn_item pointermove");

            if (!scrollablePanel.isDragging) return;

            const deltaY = pointer.y - scrollablePanel.startY; // Tính độ chênh lệch so với vị trí trước đó
            scrollablePanel.startY = pointer.y; // Cập nhật startY cho lần di chuyển tiếp theo

            let itemCount = scrollablePanel.itemLenght;

            let columns = 3;

            let rows = Math.ceil(itemCount / columns);

            let maxHeight = itemHeight * rows;

            let tPerPixel = 1 * (itemHeight / maxHeight);

            let smoothVal = 0.005;

            // Tính toán giá trị T hiện tại của bảng và điều chỉnh theo deltaY
            let currentT = scrollablePanel.t - deltaY * (tPerPixel * smoothVal); // Điều chỉnh tốc độ cuộn
            currentT = Phaser.Math.Clamp(currentT, 0, 1); // Đảm bảo T nằm trong phạm vi 0-1

            scrollablePanel.setT(currentT); // Cập nhật vị trí cuộn của bảng

            if (scrollablePanel.t > 0.9) {
                UpdateHistory(scene);
            }
        })
        .on("pointerup", function (pointer) {
            //console.log("btn_item pointerup");

            if (scrollablePanel.isDragging == false) {
                //do something if it is seleted not dragging
            }

            scrollablePanel.isDragging = false; // Dừng kéo

            const endTime = scene.time.now; // Lấy thời gian hiện tại khi thả chuột
            const duration = endTime - item.startTime; // Tính thời gian giữa hai sự kiện

            if (duration <= 125) {
            }
        })
        .on("pointerover", function (pointer) {
            if (scrollablePanel.isDragging == true) {
                scrollablePanel.startY = pointer.y;
            }
        });

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add
        .image(0, 0, "home_center_market_main_element_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.text_name = scene.add
        .text(238, 5, "Name", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_name);

    item.text_price = scene.add
        .text(238, 55, "$MSCI: " + item.itemData.price, {
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

    item.text_status = scene.add
        .text(1010, 55, item.itemData.statusInfo.status, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(item.text_status);

    item.text_id = scene.add
        .text(1010, 105, item.itemData._id, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(item.text_id);

    item.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeShop.KEY,
            item.itemData.assetIdentifier
        )
    );

    let itemLocalData = centerDataItem.getItemById(
        item.itemData.assetIdentifier
    );

    item.icon = scene.add
        .image(28 + 150 / 2, 33 + 150 / 2, itemLocalData.imgKey)
        .setScale(100 / 350)
        .setOrigin(0.5, 0.5);
    container_inner.add(item.icon);

    item.text_order_quantity = scene.add
        .text(
            238,
            105,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Order quantity"
            ) +
                ": " +
                item.itemData.quantity,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#ffffff",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_order_quantity);

    item.text_match_quantity = scene.add
        .text(
            238,
            155,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Quantity to match"
            ) +
                ": " +
                item.itemData.displayQuantity,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#ffffff",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_match_quantity);

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
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

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

import { GetItemTypeContainerMain } from "./HomeNeuralinkCenterMarketSellItemsType.js";

let container_main = null;

let isOpen = false;

let itemCodes = [];

let selectedMatchStr = "";

export function CreateNeuralinkCenterMarketSellItemsConnected(scene, matchStr) {
    //console.log("CreateNeuralinkCenterMarketSellItemsConnected");

    selectedMatchStr = matchStr;

    isOpen = false;

    Destroy();

    container_main = scene.add.container(0, 0);
    GetItemTypeContainerMain().add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    RequestBuyItemList(scene);

    Open(scene);
}

function RequestBuyItemList(scene) {
    CreateLoadingPopup();

    itemCodes = Object.keys(centerData.baseItemInfo);

    itemCodes = itemCodes.filter((item) =>
        new RegExp(selectedMatchStr).test(item)
    );

    //console.log("itemCodes: ", itemCodes);

    let type = "";

    if (selectedMatchStr === "CONNECTED_NEURALINK_") {
        type = "connected";
    } else if (selectedMatchStr === "ELITE_NEURALINK_") {
        type = "elite";
    }

    centerData.RequestNeuralinkCenterMarketItemsType(
        type,
        (result) => {
            HideLoadingPopup();

            CreateItemList(scene, result);
        },
        (error) => {
            HideLoadingPopup();
        }
    );
}

let container_list = null;

function CreateItemList(scene, receivedData) {
    //console.log("CreateItemList receivedData: ", receivedData);

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

    let inventoryItemArray = Object.values(centerData.inventoryDictionary);

    for (let i = 0; i < inventoryItemArray.length; i++) {
        const itemData = inventoryItemArray[i];

        if (itemData.code.includes(selectedMatchStr)) {
            //console.log("CreateItemList itemData: ", itemData);

            let itemLocalData = centerDataItem.getItemById(itemData.code);

            let baseInfo = centerData.baseItemInfo[itemData.code];

            if (itemLocalData != null) {
                let indexData = {
                    itemLocalData: itemLocalData,
                    baseInfo: baseInfo,
                    inventoryData: itemData,
                };

                let container_item = CreateItem(
                    scene,
                    scrollablePanel,
                    indexData
                );

                container_item.button_buy.button.on("pointerdown", function () {
                    CreateLoadingPopup();
                    centerData.RequestNeuralinkCenterMarketItemOrderBook(
                        itemData.code,
                        (result) => {
                            HideLoadingPopup();

                            container_item.itemData.respone = result;

                            CreateBuy(scene, container_item);
                        },
                        (error) => {
                            HideLoadingPopup();
                        }
                    );
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
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                item.itemData.baseInfo.name
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
                item.itemData.inventoryData.quantity,
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

let container_buy = null;

let container_buy_buttons = null;

function CreateBuy(scene, item) {
    //console.log("CreateBuy item: ", item);

    container_buy = scene.add.container(0, 0);
    container_buy.setDepth(300);

    container_buy_buttons = scene.add.container(0, 0);
    container_buy_buttons.setDepth(300);

    container_buy.item = item;

    let bg = scene.add
        .image(0, 0, "home_center_market_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_buy.add(bg);

    let bg2 = scene.add
        .image(0, 0, "home_center_market_item_bg")
        .setOrigin(0, 0);
    container_buy.add(bg2);

    let itemIcon = scene.add
        .image(0, 0, item.itemData.itemLocalData.imgKey)
        .setOrigin(0.5, 0.5)
        .setScale(350 / 500);

    itemIcon.setPosition(55 + 350 / 2, 195 + 350 / 2);

    container_buy.add(itemIcon);

    let inputQuantityValue = 0;

    CreateQuantityInput(scene, (getValue) => {
        inputQuantityValue = Number(getValue);

        SetFee();
    });

    let priceBase = item.itemData.respone.priceReference.referencePrice;

    let selectedPrice = priceBase;

    let priceFloor = item.itemData.respone.priceReference.priceBandLower;

    let priceTop = item.itemData.respone.priceReference.priceBandUpper;

    let text_quantity = scene.add
        .text(
            55 + 350 / 2,
            619,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Quantity"
            ) +
                ": " +
                item.itemData.inventoryData.quantity,
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFFFFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0);
    container_buy.add(text_quantity);

    const text_base = scene.add
        .text(
            424,
            205,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Base price"
            ) +
                ": " +
                priceBase +
                " $MSCI",
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_buy.add(text_base);

    const text_floor = scene.add
        .text(
            424,
            247,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Floor price"
            ) +
                ": " +
                priceFloor +
                " $MSCI",
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_buy.add(text_floor);

    const text_top = scene.add
        .text(
            424,
            289,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Top price"
            ) +
                ": " +
                priceTop +
                " $MSCI",
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_buy.add(text_top);

    const text_fee = scene.add
        .text(424, 331, "", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFA600", // Màu chữ (color)
            align: "left",
        })
        .setOrigin(0, 0);
    container_buy.add(text_fee);

    function SetFee() {
        //console.log("SetFree selectedPrice: ", selectedPrice);
        //console.log("SetFree inputQuantityValue: ", inputQuantityValue);

        let str = cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Transaction fee (5%): {i} $MSCI",
            [(selectedPrice * inputQuantityValue * 0.05).toFixed(1)]
        );

        text_fee.setText(str);
    }

    SetFee();

    const text_price = scene.add
        .text(424, 393, "", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFA600", // Màu chữ (color)
            align: "left",
        })
        .setOrigin(0, 0);
    container_buy.add(text_price);

    container_buy.setPrice = function (price) {
        text_price.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Order price"
            ) +
                ": " +
                price +
                " $MSCI"
        );

        selectedPrice = price;

        SetFee();
    };

    container_buy.setPrice(selectedPrice);

    CreateCancelPriceList(scene, item);

    let btn_cancel = CreateOptionsButton(
        scene,
        435 + 286 / 2,
        619 + 84 / 2,
        "home_center_market_button_2",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Cancel"
        )
    );
    container_buy_buttons.add(btn_cancel);

    btn_cancel.button.on("pointerdown", function () {
        container_buy.destroy();

        container_buy_buttons.destroy();
    });

    let btn_buy = CreateOptionsButton(
        scene,
        753 + 286 / 2,
        619 + 84 / 2,
        "home_center_market_button_1",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Sell"
        )
    );
    container_buy_buttons.add(btn_buy);

    btn_buy.button.on("pointerdown", function () {
        if (selectedPrice < priceFloor) {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Price must be higher than floor price"
                )
            );

            return;
        }

        if (inputQuantityValue <= 0) {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Quantity must not be empty"
                )
            );

            return;
        }

        if (inputQuantityValue > item.itemData.inventoryData.quantity) {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Quantity must be less than or equal to the inventory quantity"
                )
            );

            return;
        }

        if (selectedPrice > 0 && inputQuantityValue > 0) {
            CreateLoadingPopup();

            centerData.RequestNeuralinkCenterMarketOrder(
                "sell",
                item.itemData.inventoryData.code,
                selectedPrice,
                inputQuantityValue,
                () => {
                    HideLoadingPopup();

                    CreateAlertPopup(
                        scene,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.Main.KEY,
                            "Item in order"
                        )
                    );

                    CreateLoadingPopup();

                    centerData.RequestInventory(
                        () => {
                            HideLoadingPopup();

                            RequestBuyItemList(scene);
                        },
                        () => {
                            HideLoadingPopup();
                        }
                    );

                    container_buy.destroy();

                    container_buy_buttons.destroy();
                },
                (error) => {
                    HideLoadingPopup();

                    CreateAlertPopup(scene, error.message);
                }
            );
        }
    });
}

function CreateQuantityInput(scene, onValueChange) {
    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.CenterMarket.KEY,
        "Enter quantity"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-form">
    <input 
        type="number" 
        min="0" 
        id="quantityInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:597px; 
            padding: 20px; 
            border-radius:10px; 
            font-size: 36px; 
            font-family: ${fontStr};
            background-color: rgba(0, 0, 0, 0.6); /* Màu nền của input */
            color: #ffffff; /* Màu chữ của text */
            z-index: 1000; /* Đưa lên trên cùng */
        "
    />
    <style>
        #quantityInput::placeholder {
            color: #ffffff; /* Màu chữ của placeholder */
            opacity: 0.5; /* Đảm bảo hiển thị rõ ràng placeholder */
        }
        #quantityInput:focus {
            outline: none; /* Bỏ viền focus mặc định */
            border: 2px solid #ffffff; /* Thêm viền khi focus */
        }
    </style>
</form>
`;

    // Thêm input field vào game
    const form_element = scene.add
        .dom(424 + 607 / 2, 456 + 90 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_buy.add(form_element);

    // Lấy phần tử input
    const inputElement = document.getElementById("quantityInput");
    const inputForm = document.getElementById("converter-form"); // Lấy đối tượng FORM

    // Tạo handler cho sự kiện SUBMIT
    const submitHandler = (event) => {
        // NGĂN CHẶN HÀNH VI MẶC ĐỊNH của form (reload trang)
        event.preventDefault();
    };

    // Thêm listener cho sự kiện submit (khi nhấn Enter)
    if (inputForm) {
        inputForm.addEventListener("submit", submitHandler);
    }

    // Xử lý sự kiện nhập dữ liệu
    inputElement.addEventListener("input", () => {
        if (onValueChange && typeof onValueChange === "function") {
            // Chuyển đổi giá trị nhập vào thành số nguyên
            let parsedValue = parseInt(inputElement.value, 10);

            // Kiểm tra nếu giá trị không hợp lệ, đặt lại thành 0
            if (isNaN(parsedValue)) {
                parsedValue = 0;
            }

            // Đảm bảo giá trị không âm
            parsedValue = Math.max(parsedValue, 0);

            // Cập nhật giá trị của input
            inputElement.value = parsedValue;

            //console.log("inputElement.value: ", inputElement.value);

            // Gọi callback với giá trị hợp lệ
            onValueChange(parsedValue);
        }
    });

    // Xử lý sự kiện click ra ngoài
    document.addEventListener("click", (event) => {
        if (!inputElement.contains(event.target)) {
            inputElement.blur(); // Hủy trạng thái focus
        }
    });
}

let container_price_list = null;

function CreateCancelPriceList(scene, item) {
    if (container_price_list) {
        container_price_list.destroy();
    }

    //Create friend list
    container_price_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_buy.add(container_price_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1200;
    const scrollViewHeight = 1150;

    const columns = 1;
    const rows = Math.ceil(2 / columns);

    const itemWidth = 1000;
    const itemHeight = 110;
    const itemSpacing = 20;

    const posX = 0 + scrollViewWidth / 2;
    const posY = 745 + scrollViewHeight / 2;

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
                left: 80,
                right: 0,
                top: 10,
                bottom: 110 / 2 + 10 / 2,
            },
        })
        .layout();

    container_price_list.add(scrollablePanel);

    let listedPrice = {};

    if (item.itemData.respone.sellOrders) {
        for (let i = 0; i < item.itemData.respone.sellOrders.length; i++) {
            let priceData = item.itemData.respone.sellOrders[i];

            listedPrice[priceData.price] = priceData.totalQuantity;
        }
    }

    //console.log("listedPrice: ", listedPrice);

    let orderPrice = {};

    if (item.itemData.respone.buyOrders) {
        for (let i = 0; i < item.itemData.respone.buyOrders.length; i++) {
            let priceData = item.itemData.respone.buyOrders[i];

            orderPrice[priceData.price] = priceData.totalQuantity;
        }
    }

    //console.log("orderPrice: ", orderPrice);

    container_price_list.priceItemList = [];

    container_price_list.setPỉceItemSelected = function (itemContainer) {
        for (let i = 0; i < container_price_list.priceItemList.length; i++) {
            container_price_list.priceItemList[i].setSelected(false);
        }

        itemContainer.setSelected(true);
    };

    for (
        let i = 0;
        i < item.itemData.respone.priceReference.detailedPriceLevels.length;
        i++
    ) {
        let priceDetail =
            item.itemData.respone.priceReference.detailedPriceLevels[i];

        let totalQuantity = 0;

        if (listedPrice[priceDetail.price] != null) {
            totalQuantity = listedPrice[priceDetail.price];
        }

        let totalOrderQuantity = 0;

        if (orderPrice[priceDetail.price] != null) {
            totalOrderQuantity = orderPrice[priceDetail.price];
        }

        let priceData = {
            price: priceDetail.price,
            totalQuantity: totalQuantity,
            totalOrderQuantity: totalOrderQuantity,
        };

        let indexData = {
            priceData: priceData,
        };

        let container_item = CreateCancelPriceItem(
            scene,
            scrollablePanel,
            indexData
        );

        container_price_list.priceItemList.push(container_item);

        container_item.button_select.button.on("pointerdown", function () {
            container_buy.setPrice(priceData.price);

            container_price_list.setPỉceItemSelected(container_item);
        });
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_price_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateCancelPriceItem(scene, scrollablePanel, itemData) {
    //console.log("CreateCancelPriceItem itemData: ", itemData);

    let itemWidth = 1000;
    let itemHeight = 110;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add
        .image(0, 0, "home_center_market_price_element_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.text_price = scene.add
        .text(30, itemHeight / 2, item.itemData.priceData.price + " $MSCI", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#FFA600",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0.5);
    container_inner.add(item.text_price);

    item.text_count = scene.add
        .text(
            750,
            itemHeight / 2,
            "Listed: " + item.itemData.priceData.totalQuantity,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#FFA600",
                align: "right",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(1, 0.5);
    container_inner.add(item.text_count);

    item.text_order = scene.add
        .text(
            500,
            itemHeight / 2,
            "Order: " + item.itemData.priceData.totalOrderQuantity,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#FFA600",
                align: "right",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(1, 0.5);
    container_inner.add(item.text_order);

    if (
        container_buy.item.itemData.respone.priceReference.referencePrice >
        item.itemData.priceData.price
    ) {
        item.text_price.setColor("#FF5252");
    } else if (
        container_buy.item.itemData.respone.priceReference.referencePrice <
        item.itemData.priceData.price
    ) {
        item.text_price.setColor("#509CFF");
    } else {
        item.text_price.setColor("#FFFFFF");
    }

    item.button_select = CreateButton0(
        scene,
        container_inner,
        769 + 218 / 2,
        10 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Select"
        )
    );

    item.setSelected = function (isSelect) {
        if (isSelect) {
            item.bg.setTexture("home_center_market_price_element_bg_2");

            item.button_select.button.setTexture(
                "home_center_market_button_0_3"
            );
        } else {
            item.bg.setTexture("home_center_market_price_element_bg");

            item.button_select.button.setTexture("home_center_market_button_0");
        }
    };

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

function CreateOptionsButton(scene, x, y, imageKey, buttonName) {
    let btnWidth = 286;
    let btnHeight = 84;

    const btn_container = scene.add.container(x, y);
    container_buy.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, imageKey)
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
            btnHeight / 2 - 8,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "36px", // Font-size
                color: "#FFF", // Màu chữ (color)
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

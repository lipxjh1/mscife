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

import { container_center_market_main_sub } from "./HomeCenterMarketMain.js";

let container_main = null;

let isOpen = false;

// Pagination + GridTable reuse
let gridTable = null;
let currentPage = 0;
let totalPages = 0;
let isUpdating = false;
const PAGE_LIMIT = 10;

export function CreateCenterMarketMSCI(scene) {
    //console.log("CreateCenterMarketCharacter");

    Destroy();

    isOpen = false;

    container_main = scene.add.container(0, 0);
    container_center_market_main_sub.add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    CreateBuy(scene);

    Open(scene);
}

let container_buy = null;

let container_buy_buttons = null;

function CreateBuy(scene) {
    if (container_buy) {
        container_buy.destroy();
    }

    if (container_buy_buttons) {
        container_buy_buttons.destroy();
    }

    container_buy = scene.add.container(0, 0);
    container_buy.setDepth(300);
    container_main.add(container_buy);

    container_buy_buttons = scene.add.container(0, 0);
    container_buy_buttons.setDepth(300);
    container_main.add(container_buy_buttons);

    let itemLocalData = centerDataItem.getItemById("MSCI");

    const blackbg = scene.add.rectangle(
        540,
        470 + 1330 / 2,
        1080,
        1330,
        0x000000
    );
    container_buy.add(blackbg);

    let bg2 = scene.add
        .image(0, 280, "home_center_market_item_bg")
        .setOrigin(0, 0);
    container_buy.add(bg2);

    let itemIcon = scene.add
        .image(0, 0, itemLocalData.imgKey)
        .setOrigin(0.5, 0.5)
        .setScale(350 / 500);

    itemIcon.setPosition(55 + 350 / 2, 495 + 350 / 2);

    container_buy.add(itemIcon);

    const text_base = scene.add
        .text(424, 480, "$MSCI", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFA600", // Màu chữ (color)
            align: "left",
        })
        .setOrigin(0, 0);
    container_buy.add(text_base);

    const text_description = scene.add
        .text(
            424,
            480 + 42,
            "Description: $MSCI which use to craft neuralink",
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
                wordWrap: { width: 580, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_buy.add(text_description);

    const text_fee = scene.add
        .text(
            424,
            text_description.y + text_description.height,
            "Transaction fee (2%)",
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_buy.add(text_fee);

    RequestMSCIListing(scene);
}

function RequestMSCIListing(scene) {
    // Khởi tạo phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetCMarketMSCIListing(
        currentPage,
        PAGE_LIMIT,
        (result) => {
            // Lưu tổng số trang nếu có
            if (
                result &&
                result.pagination &&
                typeof result.pagination.pages === "number"
            ) {
                totalPages = result.pagination.pages;
            } else {
                totalPages = 1;
            }

            CreatePriceList(scene, result);
            isUpdating = false;
        },
        (error) => {
            isUpdating = false;
        }
    );
}

let container_price_list = null;

function CreatePriceList(scene, result) {
    if (container_price_list) {
        container_price_list.destroy();
    }

    // Root container cho danh sách
    container_price_list = scene.add.container(0, 0);
    container_buy.add(container_price_list);

    // Kích thước vùng cuộn
    const scrollViewWidth = 1200;
    const scrollViewHeight = 765;

    const itemWidth = 1000;
    const itemHeight = 110;
    const itemSpacingHeight = 20;

    const posX = 0 + scrollViewWidth / 2;
    const posY = 1015 + scrollViewHeight / 2;

    // GridTable với reuseCellContainer
    gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            table: {
                cellWidth: itemWidth,
                cellHeight: itemHeight + itemSpacingHeight,
                columns: 1,
                reuseCellContainer: true,
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.2,
            },
            slider: {
                track: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    0x000000,
                    0.3
                ),
                thumb: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    30,
                    10,
                    0xcccccc
                ),
            },
            items: result && result.data ? result.data : [],
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = CreateListingItem(
                        scene,
                        itemWidth,
                        itemHeight
                    );
                }
                cellContainer.updateContent(item);
                return cellContainer;
            },
            space: {
                left: 40,
                right: 0,
                top: 10,
                bottom: itemHeight / 2 + 10 / 2,
            },
        })
        .layout();

    container_price_list.add(gridTable);

    // Kéo thả/scroll để nạp thêm
    gridTable
        .setInteractive()
        .on("pointerdown", function (pointer) {
            gridTable.startY = pointer.y;
            gridTable.isDragging = true;
        })
        .on("pointermove", function (pointer) {
            if (!gridTable.isDragging) return;
            const deltaY = pointer.y - gridTable.startY;
            gridTable.startY = pointer.y;
            let currentT = gridTable.t - deltaY * 0.001;
            currentT = Phaser.Math.Clamp(currentT, 0, 1);
            gridTable.setT(currentT);
            if (gridTable.t > 0.9 && !isUpdating) {
                UpdateMSCIListings(scene);
            }
        })
        .on("pointerup", function () {
            gridTable.isDragging = false;
        });

    gridTable.on("scroll", function () {
        if (gridTable.t > 0.9 && !isUpdating) {
            UpdateMSCIListings(scene);
        }
    });

    // Mask cho vùng hiển thị
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_price_list.add(maskShape);
    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function CreateListingItem(scene, itemWidth, itemHeight) {
    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(0, 0);
    item.add(container_inner);

    const bg = scene.add
        .image(0, 0, "home_center_market_price_element_bg")
        .setOrigin(0, 0);
    container_inner.add(bg);

    const text_price = scene.add
        .text(30, itemHeight / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#FFA600",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 300, useAdvancedWrap: true },
        })
        .setOrigin(0, 0.5);
    container_inner.add(text_price);

    const text_count = scene.add
        .text(750, itemHeight / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#FFA600",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 300, useAdvancedWrap: true },
        })
        .setOrigin(1, 0.5);
    container_inner.add(text_count);

    const text_seller = scene.add
        .text(500, itemHeight / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#FFA600",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 300, useAdvancedWrap: true },
        })
        .setOrigin(1, 0.5);
    container_inner.add(text_seller);

    const button_select = CreateButton0(
        scene,
        container_inner,
        769 + 218 / 2,
        10 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Buy"
        )
    );

    // API update content
    item.updateContent = function (data) {
        item.itemData = data;
        if (!data) return;

        const amount = typeof data.amount === "number" ? data.amount : 0;
        const pricePerUnit =
            typeof data.pricePerUnit === "number" ? data.pricePerUnit : 0;
        const totalPrice = amount * pricePerUnit;

        // Hiển thị: giá/đơn vị, số lượng, orderId hoặc seller
        text_price.setText(totalPrice + " M-Coin");
        text_count.setText("Listed: " + amount);
        text_seller.setText(data.seller.username || "");

        // Bind hành động mua (tạm thời để trống nếu chưa có flow)
        if (button_select && button_select.button) {
            button_select.button
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", function () {
                    const itemData = item.itemData;
                    if (!itemData) return;

                    CreateAlertPopup(
                        scene,
                        `Buy this item with ${totalPrice} M-Coin?`,
                        () => {
                            if (totalPrice > centerData.userInfo.Musk) {
                                CreateAlertPopup(
                                    scene,
                                    cdLocalization.getLocalization(
                                        cdLocalization.GROUP_KEYS.Main.KEY,
                                        "Not enough M-Coin"
                                    )
                                );

                                return;
                            }

                            CreateLoadingPopup();
                            centerData.RequestPostCMarketMSCIPurchase(
                                itemData.listingId,
                                (result) => {
                                    HideLoadingPopup();
                                    CreateAlertPopup(
                                        scene,
                                        result.message,
                                        () => {},
                                        null
                                    );

                                    RequestMSCIListing(scene);
                                },
                                (error) => {
                                    HideLoadingPopup();
                                    CreateAlertPopup(
                                        scene,
                                        error,
                                        () => {},
                                        null
                                    );
                                }
                            );
                        },
                        () => {}
                    );
                });
        }
    };

    return item;
}

function UpdateMSCIListings(scene) {
    if (isUpdating) return;
    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    centerData.RequestGetCMarketMSCIListing(
        currentPage,
        PAGE_LIMIT,
        (result) => {
            const newItems = result && result.data ? result.data : [];
            CreateUpdateListingItemList(scene, newItems);
            isUpdating = false;
        },
        (error) => {
            isUpdating = false;
        }
    );
}

function CreateUpdateListingItemList(scene, listedArray) {
    if (!listedArray || listedArray.length <= 0) {
        return;
    }
    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...listedArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
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

export function Destroy(scene) {
    if (container_main) {
        container_main.destroy();
    }

    if (container_buy) {
        container_buy.destroy();
    }

    if (container_buy_buttons) {
        container_buy_buttons.destroy();
    }
}


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

export function CreateCenterMarketOrderBuyMSCI(scene) {
    Destroy(scene);

    isOpen = false;

    container_main = scene.add.container(0, 0);
    container_center_market_order_buy_sub.add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    // Maintenance message removed - Show listings instead
    // const emptyText = scene.add
    //     .text(
    //         540,
    //         600,
    //         cdLocalization.getLocalization(
    //             cdLocalization.GROUP_KEYS.Main.KEY,
    //             "SYSTEM MAINTENANCE ANNOUNCEMENT"
    //         ),
    //         {
    //             fontFamily: cdLocalization.getCurrentFont(),
    //             fontSize: "38px",
    //             color: "#ffffff",
    //             align: "center",
    //             stroke: "#000000",
    //             strokeThickness: 10,
    //         }
    //     )
    //     .setOrigin(0.5, 0.5);
    // container_main.add(emptyText);

    RequestOrderBuyList(scene); // Enabled - Load MSCI listings

    Open(scene);
}

function RequestOrderBuyList(scene) {
    CreateLoadingPopup();

    // Get active MSCI listings from market
    centerData.RequestGetCMarketMSCIListing(
        1, // page
        20, // limit - show more listings
        (result) => {
            HideLoadingPopup();

            if (result.success && result.data && result.data.listings) {
                CreateMSCIListingItems(scene, result.data.listings);
            } else {
                // Show empty state
                ShowEmptyListings(scene);
            }
        },
        (error) => {
            HideLoadingPopup();
            console.error("RequestGetCMarketMSCIListing error =>", error);

            // Show error message
            CreateAlertPopup(
                scene,
                error.message || "Failed to load M-Coin listings",
                () => {},
                null
            );
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

    let itemWidth = 1020;
    let itemHeight = 165;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    let itemLocalData = centerDataItem.getItemById("MSCI");

    item.bg = scene.add
        .image(0, 0, "home_center_market_main_element_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.icon = scene.add
        .image(28, 33, itemLocalData.imgKey)
        .setScale(100 / 350)
        .setOrigin(0, 0);
    container_inner.add(item.icon);

    item.text_name = scene.add
        .text(
            238,
            33,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "$MSCI"
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
            750,
            33,
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
                align: "right",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(1, 0);
    container_inner.add(item.text_quantity);

    let currentY = 88;
    const lineSpacing = 8;
    item.text_price = scene.add
        .text(750, currentY, "M-Coin: " + item.itemData.price, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#FFA600",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(item.text_price);
    currentY += item.text_price.height + lineSpacing;

    // Hiển thị trạng thái
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
    currentY += item.text_status.height + lineSpacing;

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

// Show empty state when no listings available
function ShowEmptyListings(scene) {
    if (container_list) {
        container_list.destroy();
    }

    container_list = scene.add.container(0, 0);
    container_main.add(container_list);

    const emptyText = scene.add
        .text(
            540,
            600,
            "No M-Coin listings available\nCreate a sell order to list your M-Coin",
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "32px",
                color: "#999999",
                align: "center",
                stroke: "#000000",
                strokeThickness: 8,
            }
        )
        .setOrigin(0.5, 0.5);
    container_list.add(emptyText);
}

// Create scrollable list of MSCI listings
function CreateMSCIListingItems(scene, listings) {
    if (container_list) {
        container_list.destroy();
    }

    container_list = scene.add.container(0, 0);
    container_main.add(container_list);

    if (!listings || listings.length === 0) {
        ShowEmptyListings(scene);
        return;
    }

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1210;

    const itemWidth = 1020;
    const itemHeight = 220;
    const itemSpacingWidth = 20;
    const itemSpacingHeight = 20;

    const posX = 20 + scrollViewWidth / 2;
    const posY = 583 + scrollViewHeight / 2;

    const columns = 1;
    const rows = Math.ceil(listings.length / columns);

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
                        column: itemSpacingWidth,
                        row: itemSpacingHeight,
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
                left: 0,
                right: 0,
                top: 10,
                bottom: itemHeight / 2 + 24 / 2,
            },
        })
        .layout();

    container_list.add(scrollablePanel);

    // Add each listing item
    for (let i = 0; i < listings.length; i++) {
        const listing = listings[i];
        CreateMSCIListingItem(scene, scrollablePanel, listing, i);
    }

    scrollablePanel.layout();

    // Thiết lập mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

// Create single listing item with buy button
function CreateMSCIListingItem(scene, scrollablePanel, listing, index) {
    const itemWidth = 1020;
    const itemHeight = 220;

    const itemContainer = scene.add.container(0, 0);
    itemContainer.setSize(itemWidth, itemHeight);

    const innerContainer = scene.add.container(0, 0);
    itemContainer.add(innerContainer);

    // Background
    const bg = scene.add
        .image(0, 0, "home_center_market_main_element_bg")
        .setDisplaySize(itemWidth, itemHeight)
        .setOrigin(0, 0);
    innerContainer.add(bg);

    // Item icon
    const itemLocalData = centerDataItem.getItemById("MSCI");
    const icon = scene.add
        .image(28 + 150 / 2, 33 + 150 / 2, itemLocalData.imgKey)
        .setScale(150 / 350)
        .setOrigin(0.5, 0.5);
    innerContainer.add(icon);

    // Seller info
    const sellerText = scene.add.text(
        238,
        15,
        "Seller: " + (listing.sellerId?.UserId || "Unknown"),
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#cccccc",
            stroke: "#000000",
            strokeThickness: 8,
        }
    );
    innerContainer.add(sellerText);

    // Amount
    const amountText = scene.add.text(
        238,
        50,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Amount"
        ) +
            ": " +
            listing.amount.toLocaleString() +
            " $MSCI",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#FFD700",
            stroke: "#000000",
            strokeThickness: 10,
        }
    );
    innerContainer.add(amountText);

    // Price per unit
    const priceText = scene.add.text(
        238,
        90,
        listing.pricePerUnit + " M-Coin per $MSCI",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#FFA600",
            stroke: "#000000",
            strokeThickness: 8,
        }
    );
    innerContainer.add(priceText);

    // Total price
    const totalText = scene.add.text(
        238,
        125,
        "Total: " + listing.totalPrice.toLocaleString() + " M-Coin",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#00ff00",
            stroke: "#000000",
            strokeThickness: 10,
        }
    );
    innerContainer.add(totalText);

    // Created time
    const timeText = scene.add.text(
        238,
        160,
        "Listed: " + formatDateTime(listing.createdAt),
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#87CEEB",
            stroke: "#000000",
            strokeThickness: 6,
        }
    );
    innerContainer.add(timeText);

    // Buy button
    const buyButton = CreateButton0(
        scene,
        innerContainer,
        779 + 218 / 2,
        63 + 98 / 2,
        "BUY"
    );

    // Buy button handler
    buyButton.button.off("pointerdown");
    buyButton.button.on("pointerdown", function () {
        HandleBuyListing(scene, listing);
    });

    // Add to scrollable panel
    scrollablePanel.getElement("panel").add(itemContainer, {
        align: "top-left",
        expand: false,
    });

    return itemContainer;
}

// Handle buy listing action
function HandleBuyListing(scene, listing) {
    // Check if trying to buy own listing
    const myUserId = scene.registry.get("UserId");
    if (listing.sellerId && listing.sellerId.UserId === myUserId) {
        CreateAlertPopup(
            scene,
            "You cannot buy your own listing!",
            () => {},
            null
        );
        return;
    }

    // Confirm purchase
    const confirmMessage =
        "Buy " +
        listing.amount.toLocaleString() +
        " $MSCI\n" +
        "for " +
        listing.totalPrice.toLocaleString() +
        " M-Coin?\n\n" +
        "Price: " +
        listing.pricePerUnit +
        " M-Coin per $MSCI";

    CreateAlertPopup(
        scene,
        confirmMessage,
        () => {
            // User confirmed - Execute purchase
            ExecutePurchase(scene, listing);
        },
        () => {
            // User cancelled
            console.log("Purchase cancelled by user");
        }
    );
}

// Execute the purchase API call
function ExecutePurchase(scene, listing) {
    CreateLoadingPopup();

    centerData.RequestPostCMarketMSCIPurchase(
        listing._id,
        (result) => {
            HideLoadingPopup();

            if (result.success) {
                // Success - Update balances and refresh
                const newMSCI = result.data?.buyer?.MSCI || 0;
                const newMusk = result.data?.buyer?.Musk || 0;

                scene.registry.set("MSCI", newMSCI);
                scene.registry.set("Musk", newMusk);

                // Show success message
                CreateAlertPopup(
                    scene,
                    "Purchase successful!\n\n" +
                        "You received: " +
                        listing.amount.toLocaleString() +
                        " $MSCI\n" +
                        "Paid: " +
                        listing.totalPrice.toLocaleString() +
                        " M-Coin\n\n" +
                        "New balance:\n" +
                        "$MSCI: " +
                        newMSCI.toLocaleString() +
                        "\n" +
                        "M-Coin: " +
                        newMusk.toLocaleString(),
                    () => {
                        // Refresh the listings
                        RequestOrderBuyList(scene);
                    },
                    null
                );
            } else {
                // Failed
                CreateAlertPopup(
                    scene,
                    result.message || "Purchase failed",
                    () => {},
                    null
                );
            }
        },
        (error) => {
            HideLoadingPopup();

            // Error
            const errorMsg =
                error.message || error.error || "Failed to purchase M-Coin";

            CreateAlertPopup(scene, "Error: " + errorMsg, () => {}, null);

            console.error("Purchase error:", error);
        }
    );
}

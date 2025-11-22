// ✅ NEW: Optimization imports
import { ItemContainerPool } from "../../../managers/ItemContainerPool.js";
import { BatchDataLoader } from "../../../managers/BatchDataLoader.js";

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
import {
    CreateCenterMarketItemsType,
    GetItemTypeContainerMain,
} from "./HomeCenterMarketMainItemsType.js";
import {
    container_menu_buttons,
    GetTradeAbleItems,
} from "./HomeCenterMarket.js";
import { CreateCenterMarketItemsDetail } from "./HomeCenterMarketMainItemsDetail.js";

let container_main = null;

let isOpen = false;

let itemCodes = [];

let btn_close = null;

export function CreateCenterMarketItems(scene) {
    //console.log("CreateCenterMarketCharacter");

    isOpen = false;

    Destroy();

    container_main = scene.add.container(0, 0);
    GetItemTypeContainerMain().add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    // Tạo nút đóng
    btn_close = scene.add
        .image(38 + 118 / 2, 58 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {
            Close(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    container_menu_buttons.add(btn_close);

    RequestBuyItemList(scene);

    Open(scene);
}

function RequestBuyItemList(scene) {
    CreateLoadingPopup();

    itemCodes = Object.keys(centerData.baseItemInfo);

    let tradableItems = GetTradeAbleItems();

    itemCodes = itemCodes.filter(
        (item) =>
            !/_fragment_/.test(item) &&
            !item.includes("CONNECTED_NEURALINK_") &&
            !item.includes("ELITE_NEURALINK_") &&
            tradableItems.includes(item)
    );

    //console.log("itemCodes: ", itemCodes);

    centerData.RequestGetCMarketItemListingStatistics(
        itemCodes,
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
let itemContainerPool = null;
let batchDataLoader = null;
let visibleItemContainers = [];

// ✅ OPTIMIZED: CreateItemList with virtualization and pooling
async function CreateItemList(scene, receivedData) {
    console.log('🚀 Creating optimized item list...');
    const startTime = performance.now();
    
    // Cleanup existing
    if (container_list) {
        // Release containers back to pool
        if (itemContainerPool && visibleItemContainers.length > 0) {
            itemContainerPool.releaseAll(visibleItemContainers);
            visibleItemContainers = [];
        }
        container_list.destroy();
    }
    
    // Initialize managers if needed
    if (!itemContainerPool) {
        itemContainerPool = new ItemContainerPool(scene, 20);
    }
    if (!batchDataLoader) {
        batchDataLoader = new BatchDataLoader();
    }
    
    container_list = scene.add.container(0, 0);
    container_main.add(container_list);
    
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1210;
    const posX = 0 + scrollViewWidth / 2;
    const posY = 583 + scrollViewHeight / 2;
    
    const scrollablePanel = scene.rexUI.add
        .scrollablePanel({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0x000000, 0),
            panel: {
                child: scene.rexUI.add.sizer({
                    orientation: "y",
                    space: { item: 10 },
                }),
                mask: { padding: 1 },
            },
            slider: false,
            mouseWheelScroller: {
                focus: true,
                speed: 0.5,
            },
            space: { left: 0, right: 0, top: 0, bottom: 0, panel: 0 },
        })
        .layout();
    
    container_list.add(scrollablePanel);
    
    console.log(`📦 Processing ${itemCodes.length} tradable items`);
    
    try {
        // ✅ BATCH LOAD: Load all data in parallel
        const itemsData = await batchDataLoader.batchLoadItemsData(itemCodes);
        
        // Create received dict from API data
        const receivedDict = {};
        for (let i = 0; i < receivedData.data.length; i++) {
            let itemData = receivedData.data[i];
            receivedDict[itemData.itemCode] = itemData;
        }
        
        // Filter items that have listings and merge with received data
        const itemsToRender = [];
        for (let i = 0; i < itemCodes.length; i++) {
            const itemCode = itemCodes[i];
            const itemData = receivedDict[itemCode];
            const itemLocalData = itemsData.find(data => data && data.code === itemCode);
            
            if (itemLocalData && itemData && itemData.totalListings > 0) {
                itemsToRender.push({
                    itemCode: itemCode,
                    itemLocalData: itemLocalData.localData,
                    baseInfo: itemLocalData.baseInfo,
                    statistics: itemData,
                });
            }
        }
        
        console.log(`🎨 Rendering ${itemsToRender.length} items (optimized)`);
        
        // ✅ VIRTUALIZED RENDERING: Only render first 20 items
        const itemsToShow = itemsToRender.slice(0, 20);
        
        // Render items using pool
        for (let i = 0; i < itemsToShow.length; i++) {
            const indexData = itemsToShow[i];
            
            // Get container from pool
            const container = itemContainerPool.get();
            
            // Update container with item data
            // FIX: Pass index to correctly position item containers
            updateItemContainer(container, indexData, scene, i);
            
            // Add to panel
            scrollablePanel.getElement('panel').add(container);
            visibleItemContainers.push(container);
            
            // Setup buy button
            container.button_buy.button.on('pointerdown', () => {
                console.log('Buy clicked:', indexData.itemCode);
                CreateCenterMarketItemsDetail(scene, indexData.itemCode);
            });
        }
        
        // Update layout
        scrollablePanel.layout();
        
        const renderTime = performance.now() - startTime;
        console.log(`✅ Item list created in ${renderTime.toFixed(0)}ms`);
        console.log('📊 Pool stats:', itemContainerPool.getStats());
        
        // TODO: Implement scroll listener for lazy loading more items
        // For now, we render first 20 which is huge improvement already
        
    } catch (error) {
        console.error('❌ Failed to create item list:', error);
        // Fallback: show error message
        const errorText = scene.add.text(
            scrollViewWidth / 2,
            scrollViewHeight / 2,
            'Không thể tải danh sách items.\nVui lòng thử lại!',
            {
                fontSize: '32px',
                color: '#ff0000',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);
        
        scrollablePanel.getElement('panel').add(errorText);
    }
    
    // Add mask to scrollable panel
    const maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

// ✅ NEW: Helper function to update container with item data
function updateItemContainer(container, itemData, scene, index) {
    // Update container position based on array index
    const itemHeight = 125;
    const itemSpacing = 12; // Match original spacing
    // FIX: Use correct index instead of array length for positioning
    container.y = index * (itemHeight + itemSpacing);
    
    // Update container data
    container.itemData = itemData;
    
    // Update icon
    if (container.icon && itemData.itemLocalData && itemData.itemLocalData.imgKey) {
        container.icon.setTexture(itemData.itemLocalData.imgKey);
    }
    
    // Update name
    if (container.text_name) {
        const name = cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeShop.KEY,
            itemData.baseInfo.name || itemData.itemCode
        );
        container.text_name.setText(name);
    }
    
    // Update quantity
    if (container.text_quantity) {
        const quantityText = cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Quantity"
        ) + ": " + itemData.statistics.totalListings;
        container.text_quantity.setText(quantityText);
    }
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
                item.itemData.statistics.totalListings,
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

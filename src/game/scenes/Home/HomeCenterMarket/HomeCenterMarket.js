import centerData from "../../../Data/CenterData.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import cdLocalization from "../../../Data/CenterDataLocalization.js";

import {
    CreateCenterMarketMain,
    IsOpen as IsOpenMarketMain,
    Close as CloseMarketMain,
} from "./HomeCenterMarketMain.js";

import {
    CreateCenterMarketSell,
    IsOpen as IsOpenMarketSell,
    Close as CloseMarketSell,
} from "./HomeCenterMarketSell.js";

import {
    CreateCenterMarketOrder,
    IsOpen as IsOpenMarketOrder,
    Close as CloseMarketOrder,
} from "./HomeCenterMarketOrder.js";

import {
    CreateCenterMarketHistory,
    IsOpen as IsOpenMarketHistory,
    Close as CloseMarketHistory,
} from "./HomeCenterMarketHistory.js";

let container_main = null;

let container_sub = null;

let container_menu_buttons = null;

let btn_market = null;
let btn_sell = null;
let btn_orders = null;
let btn_history = null;

let isOpen = false;

let tradableItems = [];

let priceGuide = {};

export { container_sub, container_menu_buttons };

// ✅ NEW: Helper functions to promisify callbacks
function lazyLoadCenterMarketAsync() {
    return new Promise((resolve, reject) => {
        try {
            AssetLoadingManager.getInstance().lazyLoadCenterMarket(() => {
                console.log('✅ Market assets loaded');
                resolve('market_assets_loaded');
            });
        } catch (error) {
            console.error('❌ Market assets failed:', error);
            reject(error);
        }
    });
}

function lazyCharacterInventoryAsync() {
    return new Promise((resolve, reject) => {
        try {
            AssetLoadingManager.getInstance().lazyCharacterInventory(() => {
                console.log('✅ Character inventory loaded');
                resolve('inventory_loaded');
            });
        } catch (error) {
            console.error('❌ Character inventory failed:', error);
            reject(error);
        }
    });
}

function lazyLoadCharacterUICardAsync(keys) {
    return new Promise((resolve, reject) => {
        try {
            AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
                keys,
                () => {
                    console.log('✅ Character UI cards loaded');
                    resolve('character_cards_loaded');
                }
            );
        } catch (error) {
            console.error('❌ Character UI cards failed:', error);
            reject(error);
        }
    });
}

function UpdateTradeAbleItemsAsync(scene) {
    return new Promise((resolve, reject) => {
        tradableItems = [];
        
        centerData.RequestGetCMarketItemTradeAbleItems(
            (result) => {
                console.log('✅ Tradable items loaded');
                tradableItems = result.data.itemCodes;
                resolve(result);
            },
            (error) => {
                console.error('❌ Tradable items failed:', error);
                reject(error);
            }
        );
    });
}

function UpdatePriceGuideAsync(scene) {
    return new Promise((resolve, reject) => {
        centerData.RequestGetCMarketItemPriceGuide(
            (result) => {
                console.log('✅ Price guide loaded');
                
                // Xử lý data response và tạo priceGuide object
                priceGuide = {};
                
                if (result && result.data) {
                    const categories = Object.keys(result.data);
                    
                    categories.forEach((category) => {
                        const items = result.data[category];
                        
                        Object.keys(items).forEach((itemCode) => {
                            const itemData = items[itemCode];
                            
                            priceGuide[itemCode] = {
                                min: itemData.min || 0,
                                max: itemData.max || 0,
                                basePrice: itemData.basePrice || 0,
                                category: category,
                            };
                        });
                    });
                }
                
                resolve(result);
            },
            (error) => {
                console.error('❌ Price guide failed:', error);
                reject(error);
            }
        );
    });
}

// ✅ NEW: Error popup helper
function ShowErrorPopup(title, message, retryCallback) {
    // Sử dụng existing AlertPopup nếu có
    if (typeof CreateAlertPopup === 'function') {
        CreateAlertPopup({
            title: title,
            message: message,
            buttons: [
                {
                    text: 'Thử lại',
                    callback: retryCallback
                },
                {
                    text: 'Đóng',
                    callback: () => {
                        console.log('User closed error popup');
                    }
                }
            ]
        });
    } else {
        // Fallback: console error
        console.error(`${title}: ${message}`);
        alert(`${title}\n${message}`);
        if (retryCallback) retryCallback();
    }
}

export async function CreateCenterMarket(scene) {
    // Show loading popup immediately
    CreateLoadingPopup();
    
    const startTime = performance.now();
    console.log('🚀 Market loading started...');
    
    try {
        // Initialize asset managers
        AssetLoadingManager.getInstance().init(scene);
        AssetPlayerLoadingManager.getInstance().init(scene);
        
        // Prepare character keys
        let keys = Object.keys(centerDataPlayer.CODE_KEY);
        let tempArr = [];
        
        for (let i = 0; i < keys.length; i++) {
            let pData = centerDataPlayer.getPlayerById(keys[i]);
            if (pData !== null) {
                tempArr.push(keys[i]);
            }
        }
        keys = tempArr;
        
        // ✅ PARALLEL LOADING: Load everything at once using Promise.all
        console.log('⏳ Loading all assets and data in parallel...');
        
        const [
            marketAssets,
            characterInventory,
            characterUICards,
            tradeableItemsData,
            priceGuideData
        ] = await Promise.all([
            lazyLoadCenterMarketAsync(),
            lazyCharacterInventoryAsync(),
            lazyLoadCharacterUICardAsync(keys),
            UpdateTradeAbleItemsAsync(scene),
            UpdatePriceGuideAsync(scene)
        ]);
        
        // All loading complete
        const loadTime = performance.now() - startTime;
        console.log(`✅ Market loaded successfully in ${loadTime.toFixed(0)}ms`);
        
        // Hide loading and show UI
        HideLoadingPopup();
        AssetsLoadDone(scene);
        
    } catch (error) {
        console.error('❌ Market loading failed:', error);
        
        // Hide loading popup
        HideLoadingPopup();
        
        // Show error message to user
        ShowErrorPopup(
            'Không thể tải Market',
            'Đã xảy ra lỗi khi tải Market. Vui lòng thử lại!',
            () => {
                // Retry button callback
                CreateCenterMarket(scene);
            }
        );
    }
}

export function GetTradeAbleItems() {
    return tradableItems;
}

export function GetPriceGuideByItemCode(itemCode) {
    if (itemCode) {
        itemCode = itemCode.toUpperCase();
    }

    if (!itemCode || !priceGuide[itemCode]) {
        return {
            min: 0,
            max: 0,
            basePrice: 0,
            category: null,
        };
    }

    return priceGuide[itemCode];
}

export function UpdateTradeAbleItems(
    scene,
    isActiveLoading,
    onSuccess,
    onError
) {
    tradableItems = [];

    if (isActiveLoading) {
        CreateLoadingPopup();
    }

    centerData.RequestGetCMarketItemTradeAbleItems(
        (result) => {
            if (isActiveLoading) {
                HideLoadingPopup();
            }

            tradableItems = result.data.itemCodes;

            if (onSuccess && typeof onSuccess === "function") {
                onSuccess(result);
            }
        },
        (error) => {
            if (isActiveLoading) {
                HideLoadingPopup();
            }

            if (onError && typeof onError === "function") {
                onError(error);
            }
        }
    );
}

export function UpdatePriceGuide(scene, isActiveLoading, onSuccess, onError) {
    if (isActiveLoading) {
        CreateLoadingPopup();
    }

    centerData.RequestGetCMarketItemPriceGuide(
        (result) => {
            if (isActiveLoading) {
                HideLoadingPopup();
            }

            // Xử lý data response và tạo priceGuide object theo cấu trúc mới
            priceGuide = {};

            if (result && result.data) {
                // Duyệt qua tất cả các rank categories
                const categories = Object.keys(result.data);

                categories.forEach((category) => {
                    const items = result.data[category];

                    // Duyệt qua từng item trong category
                    Object.keys(items).forEach((itemCode) => {
                        const itemData = items[itemCode];

                        // Tạo object cho từng item code với thông tin min, max, basePrice
                        priceGuide[itemCode] = {
                            min: itemData.min || 0,
                            max: itemData.max || 0,
                            basePrice: itemData.basePrice || 0,
                            category: category, // Thêm thông tin category để dễ tra cứu
                        };
                    });
                });
            }

            //console.log("priceGuide: ", priceGuide);

            if (onSuccess && typeof onSuccess === "function") {
                onSuccess(result);
            }
        },
        (error) => {
            if (isActiveLoading) {
                HideLoadingPopup();
            }

            if (onError && typeof onError === "function") {
                onError(error);
            }
        }
    );
}

function AssetsLoadDone(scene) {
    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    let lockBg = scene.add
        .image(0, 0, "home_center_market_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
    container_main.add(lockBg);

    container_sub = scene.add.container(0, 0);
    container_main.add(container_sub);

    container_menu_buttons = scene.add.container(0, 0);
    container_main.add(container_menu_buttons);

    btn_market = CreateMenuButton(
        scene,
        0 + 270 / 2,
        1800 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Buy"
        )
    );

    btn_market.button.on("pointerdown", function () {
        ActiveCenterMarketMain(scene);
    });

    btn_sell = CreateMenuButton(
        scene,
        270 + 270 / 2,
        1800 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Sell"
        )
    );

    btn_sell.button.on("pointerdown", function () {
        ActiveCenterMarketSell(scene);
    });

    btn_orders = CreateMenuButton(
        scene,
        540 + 270 / 2,
        1800 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Orders"
        )
    );

    btn_orders.button.on("pointerdown", function () {
        ActiveCenterMarketOrder(scene);
    });

    btn_history = CreateMenuButton(
        scene,
        810 + 270 / 2,
        1800 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "History"
        )
    );

    btn_history.button.on("pointerdown", function () {
        ActiveCenterMarketHistory(scene);
    });

    //create close btn
    const btn_close = scene.add
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

    Open(scene);
}

function ActiveCenterMarketMain(scene) {
    btn_market.setSelected();

    btn_sell.setUnselected();

    btn_orders.setUnselected();

    btn_history.setUnselected();

    CreateCenterMarketMain(scene);

    CloseMarketSell(scene);

    CloseMarketOrder(scene);

    CloseMarketHistory(scene);
}

function ActiveCenterMarketSell(scene) {
    btn_market.setUnselected();

    btn_sell.setSelected();

    btn_orders.setUnselected();

    btn_history.setUnselected();

    CreateCenterMarketSell(scene);

    CloseMarketMain(scene);

    CloseMarketOrder(scene);

    CloseMarketHistory(scene);
}

function ActiveCenterMarketOrder(scene) {
    btn_market.setUnselected();

    btn_sell.setUnselected();

    btn_orders.setSelected();

    btn_history.setUnselected();

    CreateCenterMarketOrder(scene);

    CloseMarketMain(scene);

    CloseMarketSell(scene);

    CloseMarketHistory(scene);
}

function ActiveCenterMarketHistory(scene) {
    btn_market.setUnselected();

    btn_sell.setUnselected();

    btn_orders.setUnselected();

    btn_history.setSelected();

    CreateCenterMarketHistory(scene);

    CloseMarketMain(scene);

    CloseMarketSell(scene);

    CloseMarketOrder(scene);
}

function CreateMenuButton(scene, x, y, buttonName) {
    let btnWidth = 270;
    let btnHeight = 120;

    const btn_container = scene.add.container(x, y);
    container_menu_buttons.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "center_market_menu_button")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            // scene.tweens.add({
            //     targets: btn_container,
            //     scaleX: 1.2, // Phóng to 20% theo chiều ngang
            //     scaleY: 1.2, // Phóng to 20% theo chiều dọc
            //     duration: 100, // Thời gian hiệu ứng (ms)
            //     ease: "Power2",
            // });
        })
        .on("pointerout", function () {
            // scene.tweens.add({
            //     targets: btn_container,
            //     scaleX: 1, // Phóng to 20% theo chiều ngang
            //     scaleY: 1, // Phóng to 20% theo chiều dọc
            //     duration: 100, // Thời gian hiệu ứng (ms)
            //     ease: "Power2",
            // });
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

    ActiveCenterMarketMain(scene);

    isOpen = true;
}

export function Close(scene) {
    if (isOpen == false) return;

    isOpen = false;
    Destroy();
}

function Destroy(scene) {
    container_main.destroy();
}


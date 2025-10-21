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
    CreateNeuralinkCenterMarketBuy,
    IsOpen as IsOpenMarketBuy,
    Close as CloseMarketBuy,
} from "./HomeNeuralinkCenterMarketBuy.js";

import {
    CreateNeuralinkCenterMarketSell,
    IsOpen as IsOpenMarketSell,
    Close as CloseMarketSell,
} from "./HomeNeuralinkCenterMarketSell.js";

import {
    CreateNeuralinkCenterMarketOrder,
    IsOpen as IsOpenMarketOrder,
    Close as CloseMarketOrder,
} from "./HomeNeuralinkCenterMarketOrder.js";

import {
    CreateNeuralinkCenterMarketHistory,
    IsOpen as IsOpenMarketHistory,
    Close as CloseMarketHistory,
} from "./HomeNeuralinkCenterMarketHistory.js";

let container_main = null;

let container_sub = null;

let container_menu_buttons = null;

let btn_market = null;
let btn_sell = null;
let btn_orders = null;
let btn_history = null;

let isOpen = false;

let tradableItems = [];

export { container_sub, container_menu_buttons };

export function CreateNeuralinkCenterMarket(scene) {
    CreateLoadingPopup();

    let assetsToLoad = 4;
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();

            AssetsLoadDone(scene);
        }
    };

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadCenterMarket(() => {
        onAssetLoaded();
    });

    AssetLoadingManager.getInstance().lazyCharacterInventory(() => {
        onAssetLoaded();
    });

    let keys = Object.keys(centerDataPlayer.CODE_KEY);

    let tempArr = [];

    for (let i = 0; i < keys.length; i++) {
        let pData = centerDataPlayer.getPlayerById(keys[i]);

        if (pData !== null) {
            tempArr.push(keys[i]);
        }
    }
    keys = tempArr;

    //console.log("arr_ids: ", keys);

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        keys,
        () => {
            onAssetLoaded();
        }
    );

    UpdateTradeAbleItems(scene, false, onAssetLoaded, null);
}

export function GetTradeAbleItems() {
    return tradableItems;
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

    centerData.RequestCenterMarketTradeAbleItems(
        (result) => {
            if (isActiveLoading) {
                HideLoadingPopup();
            }

            tradableItems = result.data;

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

    CreateNeuralinkCenterMarketBuy(scene);

    CloseMarketSell(scene);

    CloseMarketOrder(scene);

    CloseMarketHistory(scene);
}

function ActiveCenterMarketSell(scene) {
    btn_market.setUnselected();

    btn_sell.setSelected();

    btn_orders.setUnselected();

    btn_history.setUnselected();

    CreateNeuralinkCenterMarketSell(scene);

    CloseMarketBuy(scene);

    CloseMarketOrder(scene);

    CloseMarketHistory(scene);
}

function ActiveCenterMarketOrder(scene) {
    btn_market.setUnselected();

    btn_sell.setUnselected();

    btn_orders.setSelected();

    btn_history.setUnselected();

    CreateNeuralinkCenterMarketOrder(scene);

    CloseMarketBuy(scene);

    CloseMarketSell(scene);

    CloseMarketHistory(scene);
}

function ActiveCenterMarketHistory(scene) {
    btn_market.setUnselected();

    btn_sell.setUnselected();

    btn_orders.setUnselected();

    btn_history.setSelected();

    CreateNeuralinkCenterMarketHistory(scene);

    CloseMarketBuy(scene);

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

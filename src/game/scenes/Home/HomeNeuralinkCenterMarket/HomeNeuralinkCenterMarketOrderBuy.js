import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { container_center_market_order_sub } from "./HomeNeuralinkCenterMarketOrder.js";
import {
    CreateNeuralinkCenterMarketOrderBuyItems,
    Close as CloseNeuralink,
} from "./HomeNeuralinkCenterMarketOrderBuyItems.js";

import {
    CreateCenterMarketSellItems,
    Close as CloseDrone,
} from "../HomeCenterMarket/HomeCenterMarketOrderSellItems.js";

import {
    CreateCenterMarketSellMSCI,
    Close as CloseMSCI,
} from "../HomeCenterMarket/HomeCenterMarketOrderSellMSCI.js";

let container_center_market_order_buy = null;

let container_center_market_order_buy_sub = null;

let container_center_market_order_buy_cat_buttons = null;

let btn_neuralink = null;
let btn_drone = null;
let btn_suit = null;

let isOpen = false;

export { container_center_market_order_buy_sub };

export function CreateNeuralinkCenterMarketOrderBuy(scene) {
    //console.log("container_center_market_order_buy_sub");

    isOpen = false;

    container_center_market_order_buy = scene.add.container(0, 0);
    container_center_market_order_sub.add(container_center_market_order_buy);

    container_center_market_order_buy_sub = scene.add.container(0, 0);
    container_center_market_order_buy.add(
        container_center_market_order_buy_sub
    );

    container_center_market_order_buy_cat_buttons = scene.add.container(0, 0);
    container_center_market_order_buy.add(
        container_center_market_order_buy_cat_buttons
    );

    btn_neuralink = CreateCatButton(
        scene,
        0 + 360 / 2,
        310 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Neuralink"
        )
    );

    btn_neuralink.button.on("pointerdown", function () {
        ActiveItem(scene);
    });

    btn_drone = CreateCatButton(
        scene,
        360 + 360 / 2,
        310 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Drone"
        )
    );

    btn_drone.button.on("pointerdown", function () {
        ActiveDrone(scene);
    });
    btn_drone.button.disableInteractive();
    btn_drone.setAlpha(0.5);

    btn_suit = CreateCatButton(scene, 720 + 360 / 2, 310 + 120 / 2, "Suit");

    btn_suit.button.on("pointerdown", function () {
        ActiveSuit(scene);
    });
    btn_suit.button.disableInteractive();
    btn_suit.setAlpha(0.5);

    ActiveItem(scene);

    Open(scene);
}

function ActiveItem(scene) {
    btn_neuralink.setSelected();

    btn_drone.setUnselected();

    btn_suit.setUnselected();

    CreateNeuralinkCenterMarketOrderBuyItems(scene);

    CloseDrone(scene);

    CloseMSCI(scene);
}

function ActiveDrone(scene) {
    // btn_neuralink.setUnselected();
    // btn_drone.setSelected();
    // btn_suit.setUnselected();
    // CreateCenterMarketSellItems(scene);
    // CloseCharacter(scene);
    // CloseMSCI(scene);
}

function ActiveSuit(scene) {
    // btn_neuralink.setUnselected();
    // btn_drone.setUnselected();
    // btn_suit.setSelected();
    // CreateCenterMarketSellMSCI(scene);
    // CloseCharacter(scene);
    // CloseDrone(scene);
}

function CreateCatButton(scene, x, y, buttonName) {
    let btnWidth = 360;
    let btnHeight = 120;

    const btn_container = scene.add.container(x, y);
    container_center_market_order_buy_cat_buttons.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "center_market_cat_button")
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

    isOpen = true;
}

export function Close(scene) {
    if (isOpen == false) return;

    isOpen = false;
    Destroy();
}

function Destroy(scene) {
    container_center_market_order_buy.destroy();
}

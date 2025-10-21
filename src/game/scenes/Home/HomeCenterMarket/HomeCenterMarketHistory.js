import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { container_sub } from "./HomeCenterMarket.js";

import {
    CreateCenterMarketHistoryList,
    Close as CloseListHistory,
} from "./HomeCenterMarketHistoryList.js";

import {
    CreateCenterMarketHistoryOrder,
    Close as CloseOrderHistory,
} from "./HomeCenterMarketHistoryOrder.js";

let container_center_market_history = null;

let container_center_market_history_sub = null;

let container_center_market_history_cat_buttons = null;

let btn_buy = null;
let btn_sell = null;

let isOpen = false;

export { container_center_market_history_sub };

export function CreateCenterMarketHistory(scene) {
    //console.log("CreateCenterMarketMain");

    isOpen = false;

    container_center_market_history = scene.add.container(0, 0);
    container_sub.add(container_center_market_history);

    container_center_market_history_sub = scene.add.container(0, 0);
    container_center_market_history.add(container_center_market_history_sub);

    container_center_market_history_cat_buttons = scene.add.container(0, 0);
    container_center_market_history.add(
        container_center_market_history_cat_buttons
    );

    btn_buy = CreateCatButton(
        scene,
        0 + 540 / 2,
        170 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Buy"
        )
    );

    btn_buy.button.on("pointerdown", function () {
        ActiveBuy(scene);
    });

    btn_sell = CreateCatButton(
        scene,
        540 + 540 / 2,
        170 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Sell"
        )
    );

    btn_sell.button.on("pointerdown", function () {
        ActiveSell(scene);
    });

    ActiveBuy(scene);

    Open(scene);
}

function ActiveBuy(scene) {
    btn_buy.setSelected();

    btn_sell.setUnselected();

    CreateCenterMarketHistoryOrder(scene);

    CloseListHistory(scene);
}

function ActiveSell(scene) {
    btn_buy.setUnselected();

    btn_sell.setSelected();

    CreateCenterMarketHistoryList(scene);

    CloseOrderHistory(scene);
}

function CreateCatButton(scene, x, y, buttonName) {
    let btnWidth = 540;
    let btnHeight = 120;

    const btn_container = scene.add.container(x, y);
    container_center_market_history_cat_buttons.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "center_market_order_cat_button")
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
    container_center_market_history.destroy();

    CloseListHistory();

    CloseOrderHistory();
}

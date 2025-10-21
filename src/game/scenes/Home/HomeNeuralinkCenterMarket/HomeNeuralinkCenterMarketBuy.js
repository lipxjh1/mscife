import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { container_sub } from "./HomeNeuralinkCenterMarket.js";
import {
    CreateNeuralinkCenterMarketItemsType,
    Close as CloseItemTypes,
} from "./HomeNeuralinkCenterMarketItemsType.js";

import {
    CreateNeuralinkCenterMarketDrone,
    Close as CloseDrone,
} from "./HomeNeuralinkCenterMarketDrone.js";

import {
    CreateNeuralinkCenterMarketSuit,
    Close as CloseSuit,
} from "./HomeNeuralinkCenterMarketSuit.js";

let container_center_market_buy = null;

let container_center_market_buy_sub = null;

let container_center_market_buy_cat_buttons = null;

let btn_character = null;
let btn_items = null;
let btn_msci = null;

let isOpen = false;

export { container_center_market_buy_sub };

export function CreateNeuralinkCenterMarketBuy(scene) {
    //console.log("CreateNeuralinkCenterMarketBuy");

    isOpen = false;

    container_center_market_buy = scene.add.container(0, 0);
    container_sub.add(container_center_market_buy);

    container_center_market_buy_sub = scene.add.container(0, 0);
    container_center_market_buy.add(container_center_market_buy_sub);

    container_center_market_buy_cat_buttons = scene.add.container(0, 0);
    container_center_market_buy.add(container_center_market_buy_cat_buttons);

    btn_character = CreateCatButton(
        scene,
        0 + 360 / 2,
        310 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Neuralink"
        )
    );

    btn_character.button.on("pointerdown", function () {
        ActiveNeuralink(scene);
    });

    btn_items = CreateCatButton(
        scene,
        360 + 360 / 2,
        310 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Drone"
        )
    );

    btn_items.button.on("pointerdown", function () {
        ActiveItems(scene);
    });

    btn_msci = CreateCatButton(scene, 720 + 360 / 2, 310 + 120 / 2, "Suit");

    btn_msci.button.on("pointerdown", function () {
        ActiveMSCI(scene);
    });

    ActiveNeuralink(scene);

    Open(scene);
}

function ActiveNeuralink(scene) {
    btn_character.setSelected();

    btn_items.setUnselected();

    btn_msci.setUnselected();

    CreateNeuralinkCenterMarketItemsType(scene);

    CloseDrone(scene);

    CloseSuit(scene);
}

function ActiveItems(scene) {
    btn_character.setUnselected();

    btn_items.setSelected();

    btn_msci.setUnselected();

    CreateNeuralinkCenterMarketDrone(scene);

    CloseItemTypes(scene);

    CloseSuit(scene);
}

function ActiveMSCI(scene) {
    btn_character.setUnselected();

    btn_items.setUnselected();

    btn_msci.setSelected();

    CreateNeuralinkCenterMarketSuit(scene);

    CloseItemTypes(scene);

    CloseDrone(scene);
}

function CreateCatButton(scene, x, y, buttonName) {
    let btnWidth = 360;
    let btnHeight = 120;

    const btn_container = scene.add.container(x, y);
    container_center_market_buy_cat_buttons.add(btn_container);

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
    container_center_market_buy.destroy();
}

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
    CreateCenterMarketCharacterRole,
    Close as CloseCharacter,
    Destroy as DestroyCharacter,
} from "./HomeCenterMarketMainCharacterRole.js";

import {
    CreateCenterMarketItemsType,
    Close as CloseItems,
    Destroy as DestroyItems,
} from "./HomeCenterMarketMainItemsType.js";
import {
    CreateCenterMarketMSCI,
    Close as CloseMSCI,
    Destroy as DestroyMSCI,
} from "./HomeCenterMarketMainMSCI.js";

let container_center_market_main = null;

let container_center_market_main_sub = null;

let container_center_market_main_cat_buttons = null;

let btn_character = null;
let btn_items = null;
let btn_msci = null;

let isOpen = false;

export { container_center_market_main_sub };

export function CreateCenterMarketMain(scene) {
    //console.log("CreateCenterMarketMain");

    isOpen = false;

    container_center_market_main = scene.add.container(0, 0);
    container_sub.add(container_center_market_main);

    container_center_market_main_sub = scene.add.container(0, 0);
    container_center_market_main.add(container_center_market_main_sub);

    container_center_market_main_cat_buttons = scene.add.container(0, 0);
    container_center_market_main.add(container_center_market_main_cat_buttons);

    btn_character = CreateCatButton(
        scene,
        0 + 360 / 2,
        310 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Character"
        )
    );

    btn_character.button.on("pointerdown", function () {
        ActiveCharacter(scene);
    });

    btn_items = CreateCatButton(
        scene,
        360 + 360 / 2,
        310 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Items"
        )
    );

    btn_items.button.on("pointerdown", function () {
        ActiveItems(scene);
    });

    btn_msci = CreateCatButton(scene, 720 + 360 / 2, 310 + 120 / 2, "MSCI");

    btn_msci.button.on("pointerdown", function () {
        ActiveMSCI(scene);
    });

    ActiveItems(scene);

    Open(scene);
}

function ActiveCharacter(scene) {
    btn_character.setSelected();

    btn_items.setUnselected();

    btn_msci.setUnselected();

    CreateCenterMarketCharacterRole(scene);

    CloseItems(scene);

    CloseMSCI(scene);
}

function ActiveItems(scene) {
    btn_character.setUnselected();

    btn_items.setSelected();

    btn_msci.setUnselected();

    CreateCenterMarketItemsType(scene);

    CloseCharacter(scene);

    CloseMSCI(scene);
}

function ActiveMSCI(scene) {
    btn_character.setUnselected();

    btn_items.setUnselected();

    btn_msci.setSelected();

    CreateCenterMarketMSCI(scene);

    CloseCharacter(scene);

    CloseItems(scene);
}

function CreateCatButton(scene, x, y, buttonName) {
    let btnWidth = 360;
    let btnHeight = 120;

    const btn_container = scene.add.container(x, y);
    container_center_market_main_cat_buttons.add(btn_container);

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
    container_center_market_main.destroy();

    DestroyCharacter(scene);

    DestroyItems(scene);

    DestroyMSCI(scene);

    //console.log("HomeCenterMarketMain Destroy");
}

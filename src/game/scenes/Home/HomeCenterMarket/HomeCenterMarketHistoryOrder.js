import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import { container_center_market_history_sub } from "./HomeCenterMarketHistory.js";

// Import các module con
import {
    CreateCenterMarketHistoryOrderItem,
    Close as CloseItem,
    Destroy as DestroyItem,
} from "./HomeCenterMarketHistoryOrderItem.js";

import {
    CreateCenterMarketHistoryOrderCharacter,
    Close as CloseCharacter,
    Destroy as DestroyCharacter,
} from "./HomeCenterMarketHistoryOrderCharacter.js";

import {
    CreateCenterMarketHistoryOrderMSCI,
    Close as CloseMSCI,
    Destroy as DestroyMSCI,
} from "./HomeCenterMarketHistoryOrderMSCI.js";

let container_main = null;

let container_order_main_sub = null;

let container_order_cat_buttons = null;

let btn_item = null;
let btn_character = null;
let btn_msci = null;

let isOpen = false;

export { container_order_main_sub };

export function CreateCenterMarketHistoryOrder(scene) {
    //console.log("CreateCenterMarketHistoryOrder");

    Destroy(scene);

    isOpen = false;

    container_main = scene.add.container(0, 0);
    container_center_market_history_sub.add(container_main);

    container_order_main_sub = scene.add.container(0, 0);
    container_main.add(container_order_main_sub);

    container_order_cat_buttons = scene.add.container(0, 0);
    container_main.add(container_order_cat_buttons);

    // Tạo các nút category
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

    btn_item = CreateCatButton(
        scene,
        360 + 360 / 2,
        310 + 120 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Items"
        )
    );

    btn_item.button.on("pointerdown", function () {
        ActiveItem(scene);
    });

    btn_msci = CreateCatButton(scene, 720 + 360 / 2, 310 + 120 / 2, "MSCI");

    btn_msci.button.on("pointerdown", function () {
        ActiveMSCI(scene);
    });

    // Mặc định hiển thị Item
    ActiveItem(scene);

    Open(scene);
}

function ActiveItem(scene) {
    btn_item.setSelected();
    btn_character.setUnselected();
    btn_msci.setUnselected();

    CreateCenterMarketHistoryOrderItem(scene);
    CloseCharacter(scene);
    CloseMSCI(scene);
}

function ActiveCharacter(scene) {
    btn_item.setUnselected();
    btn_character.setSelected();
    btn_msci.setUnselected();

    CreateCenterMarketHistoryOrderCharacter(scene);
    CloseItem(scene);
    CloseMSCI(scene);
}

function ActiveMSCI(scene) {
    btn_item.setUnselected();
    btn_character.setUnselected();
    btn_msci.setSelected();

    CreateCenterMarketHistoryOrderMSCI(scene);
    CloseItem(scene);
    CloseCharacter(scene);
}

function CreateCatButton(scene, x, y, buttonName) {
    let btnWidth = 360;
    let btnHeight = 120;

    const btn_container = scene.add.container(x, y);
    container_order_cat_buttons.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "center_market_cat_button")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            // Hiệu ứng hover có thể được thêm vào đây
        })
        .on("pointerout", function () {
            // Hiệu ứng hover có thể được thêm vào đây
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
    Destroy(scene);
}

function Destroy(scene) {
    if (container_main) {
        container_main.destroy();
    }

    DestroyItem(scene);
    DestroyCharacter(scene);
    DestroyMSCI(scene);

    //console.log("HomeCenterMarketHistoryOrder Destroy");
}

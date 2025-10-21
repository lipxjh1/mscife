import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";
import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";
import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { container_center_market_order_sub } from "./HomeCenterMarketOrder.js";
import {
    CreateCenterMarketOrderBuyCharacter,
    Close as CloseCharacter,
} from "./HomeCenterMarketOrderBuyCharacter.js";
import {
    CreateCenterMarketOrderBuyItems,
    Close as CloseItems,
} from "./HomeCenterMarketOrderBuyItems.js";
import {
    CreateCenterMarketOrderBuyMSCI,
    Close as CloseMSCI,
} from "./HomeCenterMarketOrderBuyMSCI.js";

let container_center_market_order_buy = null;
let container_center_market_order_buy_sub = null;
let container_center_market_order_buy_cat_buttons = null;
let btn_character = null;
let btn_items = null;
let btn_msci = null;
let isOpen = false;

export { container_center_market_order_buy_sub };

export function CreateCenterMarketOrderBuy(scene) {
    //console.log("CreateCenterMarketMain");
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
    btn_character = CreateCatButton(
        scene,
        0 + 360 / 2,
        310 + 120 / 2,
        "Character"
    );
    btn_character.button.on("pointerdown", function () {
        ActiveCharacter(scene);
    });
    btn_items = CreateCatButton(scene, 360 + 360 / 2, 310 + 120 / 2, "Items");
    btn_items.button.on("pointerdown", function () {
        ActiveItems(scene);
    });
    btn_msci = CreateCatButton(scene, 720 + 360 / 2, 310 + 120 / 2, "MSCI");
    btn_msci.button.on("pointerdown", function () {
        ActiveMSCI(scene);
    });

    ActiveCharacter(scene);

    Open(scene);
}

function ActiveCharacter(scene) {
    btn_character.setSelected();
    btn_items.setUnselected();
    btn_msci.setUnselected();
    CreateCenterMarketOrderBuyCharacter(scene);
    CloseItems(scene);
    CloseMSCI(scene);
}

function ActiveItems(scene) {
    btn_character.setUnselected();
    btn_items.setSelected();
    btn_msci.setUnselected();
    CreateCenterMarketOrderBuyItems(scene);
    CloseCharacter(scene);
    CloseMSCI(scene);
}

function ActiveMSCI(scene) {
    btn_character.setUnselected();
    btn_items.setUnselected();
    btn_msci.setSelected();
    CreateCenterMarketOrderBuyMSCI(scene);
    CloseCharacter(scene);
    CloseItems(scene);
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
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {})
        .on("pointerover", function () {})
        .on("pointerout", function () {});
    btn_inner_container.add(btn_container.button);
    const text = scene.add
        .text(
            btnWidth / 2,
            btnHeight / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
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
    Destroy();
}

function Destroy(scene) {
    container_center_market_order_buy.destroy();
}

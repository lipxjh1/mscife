import { openTelegramLink } from "@telegram-apps/sdk";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";

import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { CreateItemCard } from "../../Share/PopupReward.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import { CreateHomeInventorySellNeuralinkPopupInput } from "./HomeInventoryNeuralinkSellInputPopup.js";
import { InventoryRequestToCreateItemList } from "./HomeInventory.js";
import { CreateUserInfoEquip } from "../HomeUserInfo/HomeUserInfoEquip.js";
import { CreateInventoryNeuralinkCombine } from "./HomeInventoryNeuralinkCombine.js";
import { HideCurrencyBar, OpenCurrencyBar } from "../HomeTopBarPlayer.js";
import { CreateNeuralinkCenterMarket } from "../HomeNeuralinkCenterMarket/HomeNeuralinkCenterMarket.js";

let container_detail = null;

export function CreateInventoryNeuralinkOptions(scene, code) {
    HideCurrencyBar(scene);

    //console.log("CreateInventoryNeuralinkOptions item: ", code);

    Destroy(scene);

    let localItemData = centerDataItem.getItemById(code);

    let itemBaseInfo = centerData.baseItemInfo[code];

    let itemInventoryData = centerData.getItemOwnById(code);

    container_detail = scene.add.container(0, 0);
    container_detail.setDepth(200);

    const lock_bg = scene.add
        .rectangle(540, 960, 1080, 1920, 0x000000)
        .setAlpha(0.75)
        .setInteractive();
    container_detail.add(lock_bg);

    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Destroy(scene);

            OpenCurrencyBar(scene);

            InventoryRequestToCreateItemList(scene);
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

    container_detail.add(btn_close);

    let itemBG = scene.add.image(540, 199 + 550 / 2, "share_item_card_bg_2");
    container_detail.add(itemBG);

    let itemCard = CreateItemCard(scene, "noId", code, "noName", null);
    container_detail.add(itemCard);
    itemCard.setPosition(540, 326 + 220 / 2);

    const item_text_name = scene.add
        .text(
            540,
            249,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                itemBaseInfo.name
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#595959",
                align: "center",
                wordWrap: { width: 410, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container_detail.add(item_text_name);

    const item_text_quantity = scene.add
        .text(540, 556, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#595959",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_detail.add(item_text_quantity);

    item_text_quantity.UpdateQuantity = function () {
        itemInventoryData = centerData.getItemOwnById(code);

        item_text_quantity.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "Quantity: "
            ) + itemInventoryData.quantity
        );
    };

    item_text_quantity.UpdateQuantity();

    const text_atk = scene.add
        .text(540, 660, "ATK: " + itemBaseInfo.properties.powerBonus + "%", {
            fontFamily: "Russo One",
            fontSize: "30px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_detail.add(text_atk);

    const btn_use = CreateButton(
        scene,
        540,
        959 + 92 / 2,
        "share_popup_alert_btn",
        "Use"
    );
    btn_use.button.on("pointerdown", async function () {
        CreateUserInfoEquip(scene);
    });
    //btn_use.button.setTint(0x646464);

    const btn_market = CreateButton(
        scene,
        540,
        1114 + 92 / 2,
        "share_popup_alert_btn",
        "Sell to market"
    );
    btn_market.button.on("pointerdown", async function () {
        CreateNeuralinkCenterMarket(scene);
    });
    //btn_market.button.setTint(0x646464);

    const btn_sell = CreateButton(
        scene,
        540,
        1269 + 92 / 2,
        "share_popup_alert_btn",
        "Liquidation"
    );
    btn_sell.button.on("pointerdown", async function () {
        centerData.RequestNeuralinkInfo((result) => {
            CreateHomeInventorySellNeuralinkPopupInput(
                scene,
                code,
                result.data.upgradeRequirements.liquidationValue,
                () => {
                    item_text_quantity.UpdateQuantity();
                },
                () => {
                    item_text_quantity.UpdateQuantity();
                }
            );
        });
    });

    if (code != "ELITE_NEURALINK_5") {
        const btn_combine = CreateButton(
            scene,
            540,
            1424 + 92 / 2,
            "share_popup_alert_btn",
            "Combine"
        );
        btn_combine.button.on("pointerdown", async function () {
            if (itemInventoryData.quantity >= 3) {
                centerData.RequestUserInfo((result) => {
                    CreateInventoryNeuralinkCombine(
                        scene,
                        code,
                        () => {
                            item_text_quantity.UpdateQuantity();
                        },
                        () => {
                            item_text_quantity.UpdateQuantity();
                        }
                    );
                });
            } else {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeShop.KEY,
                        "You need at least 3 Neuralink to combine"
                    )
                );
            }
        });
    }
}

function CreateButton(scene, x, y, imageKey, buttonName) {
    let btnWidth = 321;
    let btnHeight = 92;

    const btn_container = scene.add.container(x, y);
    container_detail.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, imageKey)
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
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "36px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    return btn_container;
}

export function Destroy(scene) {
    if (container_detail) {
        container_detail.destroy();

        container_detail = null;
    }
}

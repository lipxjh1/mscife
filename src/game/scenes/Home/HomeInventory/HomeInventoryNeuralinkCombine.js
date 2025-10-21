import centerData from "../../../Data/CenterData.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";
import centerDataItem from "../../../Data/CenterDataItem.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import { OpenCurrencyBar, HideCurrencyBar } from "../HomeTopBarPlayer.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";
import { CreateItemCard } from "../../Share/PopupReward.js";

let container_main = null;

let container_popup = null;
const container_popup_openPosition = { x: 0, y: 0 };
const container_popup_closePosition = { x: 0, y: 4000 };

let container_0;
let container_item_list = null;

let isOpen = false;

let selectedItemCode = "";

let btn_1 = null;

let btn_2 = null;

let btn_3 = null;

let btn_memory_1 = null;

let btn_memory_2 = null;

let btn_memory_3 = null;

let text_rate = null;

let quantity_to_upgrade = 0;

let usingMemory = 0;

let quantity_menory = 0;

let remainButton = null;

let onSuccessEvent = null;
let onFailedEvent = null;

export function CreateInventoryNeuralinkCombine(
    scene,
    code,
    onSuccess,
    onFailed
) {
    onSuccessEvent = onSuccess;
    onFailedEvent = onFailed;

    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyCharacterInventory(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene, code);
    });
}

function AssetsLoadDone(scene, code) {
    selectedItemCode = code;

    // let localItemData = centerDataItem.getItemById(code);

    // let itemBaseInfo = centerData.baseItemInfo[code];

    // let itemInventoryData = centerData.getItemOwnById(code);

    Destroy(scene);

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.add
        .image(540, 960, "home_character_upgrade_bg")
        .setOrigin(0.5, 0.5)
        .setInteractive();
    container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    const popup_bg = scene.add
        .image(540, 342, "home_character_upgrade_popup_bg")
        .setOrigin(0.5, 0);
    container_popup.add(popup_bg);

    container_0 = scene.add.container(0, 0);
    container_popup.add(container_0);

    const text_note = scene.add
        .text(
            540,
            850,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "useMsciKey"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 1000, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container_popup.add(text_note);

    //create close btn
    const btn_close = scene.add
        .image(30 + 32 / 2, 259 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            Close(scene);
        })
        .on("pointerover", function () {
            //console.log("btn_close over");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("btn_close out");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_main.add(btn_close);

    btn_1 = CreateSelectButton(scene, 44 + 321 / 2, 362 + 444 / 2);
    SetCardToButton(scene, btn_1, selectedItemCode);

    btn_2 = CreateSelectButton(scene, 386 + 321 / 2, 362 + 444 / 2);
    SetCardToButton(scene, btn_2, selectedItemCode);

    btn_3 = CreateSelectButton(scene, 728 + 321 / 2, 362 + 444 / 2);
    SetCardToButton(scene, btn_3, selectedItemCode);

    quantity_to_upgrade = CreateMemoryToUpgrade();

    usingMemory = 0;

    quantity_menory = 0;

    btn_memory_1 = null;
    btn_memory_2 = null;
    btn_memory_3 = null;

    remainButton = null;

    centerData.RequestInventory(() => {
        let item = centerData.getItemOwnById("MSCI_MEMORY");

        //console.log("MSCI_MEMORY: ", item);

        if (item) {
            quantity_menory = item.quantity;
        }

        remainButton = CreateRemainMSCIMemoryButton(scene);
        remainButton.setPosition(540, 1750 + 64 / 2);
        UpdateRemainMsciMemoryValue();

        if (quantity_to_upgrade > 0) {
            btn_memory_1 = CreateMemoryButton(scene, item, btn_1);
            btn_memory_1.setPosition(124 + 150 / 2, 937 + 150 / 2);

            btn_memory_2 = CreateMemoryButton(scene, item, btn_2);
            btn_memory_2.setPosition(464 + 150 / 2, 937 + 150 / 2);

            btn_memory_3 = CreateMemoryButton(scene, item, btn_3);
            btn_memory_3.setPosition(804 + 150 / 2, 937 + 150 / 2);
        }
    });

    SetSelectedNeuralinkInfo(scene);

    Open(scene);
}

function UpdateRemainMsciMemoryValue() {
    if (remainButton != null) {
        remainButton.text_value.setText(quantity_menory);
    }
}

function CreateRemainMSCIMemoryButton(scene) {
    // Tạo button với RexUI

    let btnWidth = 515;
    let btnHeight = 64;

    let container_btn = scene.add.container(0, 0);
    container_popup.add(container_btn);

    let container_inner = scene.add.container(-btnWidth / 2, -btnHeight / 2);
    container_btn.add(container_inner);

    let button = scene.add
        .image(0, 0, "home_top_currency_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("Open currency clicked");
        })
        .on("pointerover", function () {
            //console.log("ButtonBattle over");

            scene.tweens.add({
                targets: container_btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("ButtonBattle out");

            scene.tweens.add({
                targets: container_btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_inner.add(button);
    container_btn.button = button;

    let icon = scene.add
        .image(btnWidth - 64, btnHeight / 2, "item_msci_memory")
        .setDisplaySize(64, 64)
        .setOrigin(0, 0.5);
    container_inner.add(icon);
    container_btn.icon = icon;

    let text_value = scene.add
        .text(btnWidth - 73, btnHeight / 2, "000000", {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 0.5);
    container_inner.add(text_value);
    container_btn.text_value = text_value;

    return container_btn;
}

function SetSelectedNeuralinkInfo(scene) {
    const lastUnderscoreIndex = selectedItemCode.lastIndexOf("_"); // Tìm vị trí của dấu gạch dưới cuối cùng

    let nextCode = selectedItemCode;

    if (lastUnderscoreIndex !== -1) {
        let prefix = selectedItemCode.slice(0, lastUnderscoreIndex + 1); // Lấy phần "NEURALINK_MEMORY_" (bao gồm cả dấu gạch dưới)
        let numberPart = selectedItemCode.slice(lastUnderscoreIndex + 1); // Lấy phần "1"

        let number = parseInt(numberPart, 10); // Chuyển chuỗi "1" thành số 1 (cơ số 10)

        nextCode = prefix + (number + 1);

        if (prefix === "CONNECTED_NEURALINK_" && number >= 5) {
            nextCode = "ELITE_NEURALINK_1";
        }

        //console.log("nextCode: ", nextCode);
    } else {
        //console.log("Không tìm thấy dấu gạch dưới trong chuỗi.");
    }

    let itemCard = CreateItemCard(scene, "noId", nextCode, "noName", null);
    //itemCard.setPosition(540, 326 + 220 / 2);

    container_popup.add(itemCard);

    itemCard.x = 100 + 416 / 2;
    itemCard.y = 1171 - 25 + 579 / 2;

    itemCard.setScale(2);

    const info_bg = scene.rexUI.add.roundRectangle(
        543 + 439 / 2,
        1144 + 572 / 2,
        439,
        572,
        12,
        0x707070,
        0.8
    );
    container_popup.add(info_bg);

    const text_damage = scene.add
        .text(
            567,
            1168,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "Damage:"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_popup.add(text_damage);

    let itemBaseInfo = centerData.baseItemInfo[selectedItemCode];
    let itemUpgradeBaseInfo = centerData.baseItemInfo[nextCode];

    // console.log("itemBaseInfo: ", itemBaseInfo);
    // console.log("itemUpgradeBaseInfo: ", itemUpgradeBaseInfo);

    const text_current_damage = scene.add
        .text(
            567,
            1214,
            itemBaseInfo.properties.powerBonus +
                "%" +
                " => " +
                itemUpgradeBaseInfo.properties.powerBonus +
                "%",
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#D6D6D6",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_popup.add(text_current_damage);

    text_rate = scene.add
        .text(765, 1400, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "44px",
            color: "#37EBFF",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_popup.add(text_rate);

    text_rate.updateRate = function () {
        let rate = GetRate();

        let vipRateStr = "";
        if (rate > 0) {
            vipRateStr =
                "Vip " + centerData.vipStatus.data.benefits.upgradeBonus;
        }

        text_rate.setText(
            rate +
                "% " +
                vipRateStr +
                "\n" +
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                    "Success"
                )
        );
    };

    text_rate.updateRate();

    let container_upgrade_btn = scene.add.container(
        567 + 391 / 2,
        1552 + 92 / 2
    );
    container_popup.add(container_upgrade_btn);

    let container_upgrade_btn_inner = scene.add.container(-391 / 2, -92 / 2);
    container_upgrade_btn.add(container_upgrade_btn_inner);

    const btn_upgrade = scene.add
        .image(0, 0, "home_character_upgrade_btn_upgrade")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", (pointer) => {
            RequestUpgrade(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_upgrade_btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_upgrade_btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_upgrade_btn_inner.add(btn_upgrade);

    const text_up = scene.add
        .text(
            391 / 2,
            92 / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "Upgrade"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "44px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);
    container_upgrade_btn_inner.add(text_up);
}

function CreateSelectButton(scene, x, y) {
    let container_btn = scene.add.container(x, y);
    container_popup.add(container_btn);

    let container_btn_inner = scene.add.container(-321 / 2, -444 / 2);
    container_btn.add(container_btn_inner);

    const btn = scene.add
        .image(0, 0, "home_character_upgrade_select_btn")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {})
        .on("pointerout", function () {});

    container_btn_inner.add(btn);
    container_btn.btn = btn;

    return container_btn;
}

function SetCardToButton(scene, btn, code) {
    if (btn.container_card) {
        btn.container_card.destroy();
    }

    let itemCard = CreateItemCard(scene, "noId", code, "noName", null);
    //itemCard.setPosition(540, 326 + 220 / 2);

    btn.add(itemCard);
    btn.container_card = itemCard;

    // Cách kết hợp cả hai để chắc chắn nhất
    if (text_rate && text_rate.active !== false && text_rate.scene) {
        text_rate.updateRate();
    }
}

function GetRate() {
    let rate = 0;
    switch (selectedItemCode) {
        case "CONNECTED_NEURALINK_1": {
            rate = 100;

            break;
        }

        case "CONNECTED_NEURALINK_2": {
            rate = 100;

            break;
        }

        case "CONNECTED_NEURALINK_3": {
            rate = 100;

            break;
        }

        case "CONNECTED_NEURALINK_4": {
            rate = 100;

            break;
        }

        case "CONNECTED_NEURALINK_5": {
            rate = 30;

            break;
        }

        case "ELITE_NEURALINK_1": {
            rate = 20;

            break;
        }

        case "ELITE_NEURALINK_2": {
            rate = 10;

            break;
        }

        case "ELITE_NEURALINK_3": {
            rate = 5;

            break;
        }

        case "ELITE_NEURALINK_4": {
            rate = 1;

            break;
        }

        case "ELITE_NEURALINK_5": {
            rate = 0;

            break;
        }
    }

    // console.log("GetRate selectedItemCode: ", selectedItemCode);
    // console.log("GetRate: ", rate);

    return rate;
}

function RequestUpgrade(scene) {
    // Calculate total insurance amount (MSCI memory)
    let insuranceAmount = 0;

    if (quantity_to_upgrade > 0) {
        if (btn_memory_1.useMemory == true) {
            insuranceAmount += quantity_to_upgrade;
        }
        if (btn_memory_2.useMemory == true) {
            insuranceAmount += quantity_to_upgrade;
        }
        if (btn_memory_3.useMemory == true) {
            insuranceAmount += quantity_to_upgrade;
        }
    }

    CreateLoadingPopup();

    // Use the new method in centerData
    centerData.RequestComposeNeuralink(
        selectedItemCode,
        insuranceAmount,
        (result) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, result.message || "Upgrade successful");
            Close(scene);

            let itemInventoryDataNeuralink =
                centerData.getItemOwnById(selectedItemCode);
            itemInventoryDataNeuralink.quantity -= 3;

            let itemInventoryDataMSCIMemory =
                centerData.getItemOwnById("MSCI_MEMORY");
            itemInventoryDataMSCIMemory.quantity -= insuranceAmount;

            if (onSuccessEvent && typeof onSuccessEvent === "function") {
                onSuccessEvent();
            }
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error.message || "Upgrade failed");

            if (onFailedEvent && typeof onFailedEvent === "function") {
                onFailedEvent();
            }
        }
    );
}

function CreateMemoryToUpgrade() {
    let quantity = 0;
    switch (selectedItemCode) {
        case "CONNECTED_NEURALINK_1": {
            quantity = 0;

            break;
        }

        case "CONNECTED_NEURALINK_2": {
            quantity = 0;

            break;
        }

        case "CONNECTED_NEURALINK_3": {
            quantity = 0;

            break;
        }

        case "CONNECTED_NEURALINK_4": {
            quantity = 0;

            break;
        }

        case "CONNECTED_NEURALINK_5": {
            quantity = 10;

            break;
        }

        case "ELITE_NEURALINK_1": {
            quantity = 20;

            break;
        }

        case "ELITE_NEURALINK_2": {
            quantity = 30;

            break;
        }

        case "ELITE_NEURALINK_3": {
            quantity = 40;

            break;
        }

        case "ELITE_NEURALINK_4": {
            quantity = 50;

            break;
        }

        case "ELITE_NEURALINK_5": {
            quantity = 50;

            break;
        }
    }

    return quantity;
}

function CreateMemoryButton(scene, item, buttonCharacter) {
    let itemWidth = 150;
    let itemHeight = 150;

    const container_item = scene.add.container(0, 0);
    container_popup.add(container_item);

    container_item.item = item;

    container_item.useMemory = false;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    container_item.add(container_inner);
    container_item.container_inner = container_inner;

    container_item.button = scene.add
        .image(0, 0, "item_msci_memory")
        .setDisplaySize(150, 150)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerup", function () {
            //console.log("buttonCharacter: ", buttonCharacter);

            if (container_item.useMemory == false) {
                let nextQuantity = usingMemory + quantity_to_upgrade;

                // console.log("usingMemory: ", nextQuantity);
                // console.log("nextQuantity: ", nextQuantity);
                // console.log("quantity_menory: ", quantity_menory);

                if (nextQuantity <= quantity_menory) {
                    usingMemory = nextQuantity;

                    container_item.setSelected(true);
                } else {
                    CreateAlertPopup(
                        scene,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                            "Buy more MSCI Memory to use"
                        )
                    );
                }
            } else {
                usingMemory -= quantity_menory;

                container_item.setSelected(false);
            }

            //console.log("usingMemory: ", usingMemory);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_item,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_item,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_inner.add(container_item.button);

    container_item.text_quantity = scene.add
        .text(itemWidth, 0, "x" + quantity_to_upgrade, {
            fontFamily: "Russo One",
            fontSize: "44px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
        })
        .setOrigin(1, 0);
    container_inner.add(container_item.text_quantity);

    const text = scene.add
        .text(
            itemWidth / 2,
            itemHeight,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "Click to use"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "32px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 1000, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container_inner.add(text);

    container_item.tick = scene.add
        .image(itemWidth, itemHeight, "home_character_upgrade_tick")
        .setOrigin(1, 1);
    container_inner.add(container_item.tick);

    container_item.setSelected = function (isSelected = false) {
        container_item.tick.setVisible(isSelected);

        container_item.useMemory = isSelected;
    };

    container_item.setSelected(false);

    return container_item;
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen) return;

    isOpen = true;

    OpenCurrencyBar(scene);

    container_popup.setPosition(
        container_popup_closePosition.x,
        container_popup_closePosition.y
    );

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_openPosition.x,
        y: container_popup_openPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

export function Close(scene) {
    if (isOpen == false) return;

    HideCurrencyBar(scene);

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_closePosition.x,
        y: container_popup_closePosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            isOpen = false;

            Destroy();
        },
    });
}

function Destroy() {
    if (container_main) container_main.destroy();

    container_main = null;

    if (container_item_list) container_item_list.destroy();

    container_item_list = null;
}

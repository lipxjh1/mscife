import centerData from "../../../Data/CenterData.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";
import centerDataItem from "../../../Data/CenterDataItem.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    UpdateCharactersInfo,
    CreateCardOptions,
    CloseCardOptions,
} from "./HomeCharacterInventoryTeam.js";

import { CreateCharacterCard } from "../../Share/CharacterCard.js";

import { OpenCurrencyBar, HideCurrencyBar } from "../HomeTopBarPlayer.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

let container_main = null;

let container_popup = null;
const container_popup_openPosition = { x: 0, y: 0 };
const container_popup_closePosition = { x: 0, y: 4000 };

let container_0;
let container_item_list = null;

let isOpen = false;

let characterId = "";

let btn_1 = null;

let btn_memory_1 = null;

let text_rate = null;

let quantity_to_upgrade = 0;

let usingMemory = 0;

let quantity_menory = 0;

let availableHeroArr = [];

let remainButton = null;

let amountToUpgrade = 3;

export function CreateEnvolved(scene, _id) {
    characterId = _id;

    let unlockedPlayer = centerData.getUnlockedPlayerById(characterId);

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        [unlockedPlayer.envolvedProperties.code],
        () => {
            AssetsLoadDone(scene, unlockedPlayer);
        }
    );
}

function AssetsLoadDone(scene, unlockedPlayer) {
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
                "useMsciKeyEvolve"
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

    GetAvailableHeroes();

    btn_1 = CreateSelectButton(scene, 44 + 321 / 2, 362 + 444 / 2);
    btn_1.characterId = characterId;
    SetCardToButton(scene, btn_1, characterId);

    quantity_to_upgrade = CreateMemoryToEnvolved(unlockedPlayer.rank);

    usingMemory = 0;

    quantity_menory = 0;

    remainButton = null;

    btn_memory_1 = null;

    centerData.RequestInventory(() => {
        let item = centerData.getItemOwnById("MSCI_MEMORY");

        //console.log("MSCI_MEMORY: ", item);

        if (item) {
            quantity_menory = item.quantity;
        }

        remainButton = CreateRemainMSCIMemoryButton(scene);
        remainButton.setPosition(540, 1750 + 64 / 2);
        UpdateRemainMsciMemoryValue();

        btn_memory_1 = CreateMemoryButton(scene, item, btn_1);
        btn_memory_1.setPosition(540, 937 + 150 / 2);
    });

    SetSelectedCharacterInfo(scene);

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

function GetAvailableHeroes() {
    let selectedPlayer = centerData.getUnlockedPlayerById(characterId);

    availableHeroArr = [];

    let playerDict = centerData.GetMergedCharacters();

    //console.log("playerDict:", playerDict);

    // Lấy tất cả các key (tên nhân vật)
    let keys = Object.keys(playerDict);

    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];

        let unlockedPlayer = playerDict[k];

        if (
            unlockedPlayer._id != selectedPlayer._id &&
            unlockedPlayer.code == selectedPlayer.code &&
            unlockedPlayer.star == 4 &&
            unlockedPlayer.level == 10
        ) {
            availableHeroArr.push(unlockedPlayer);
        }
    }
}

function SetSelectedCharacterInfo(scene) {
    let unlockedPlayer = centerData.getUnlockedPlayerById(characterId);

    // console.log("SetCardToButton characterId: ", characterId);
    //console.log("SetSelectedCharacterInfo unlockedPlayer: ", unlockedPlayer);

    const text_availableCount = scene.add
        .text(
            547 + 336 / 2,
            507,
            1 + availableHeroArr.length + "/" + amountToUpgrade,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "128px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0);
    container_popup.add(text_availableCount);

    let container_card = CreateCharacterCard(
        scene,
        "",
        unlockedPlayer.envolvedProperties.code,
        unlockedPlayer.envolvedProperties.name,
        unlockedPlayer.envolvedProperties.role,
        unlockedPlayer.envolvedProperties.rank,
        1,
        unlockedPlayer.envolvedProperties.starLevelData[0].starLevel
    );
    container_card.setScale(410 / 319);
    container_card.x = 100 + 416 / 2;
    container_card.y = 1171 - 25 + 579 / 2;
    container_popup.add(container_card);

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

    const text_current_damage = scene.add
        .text(567, 1214, unlockedPlayer.properties.attachDamage, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#D6D6D6",
            align: "left",
        })
        .setOrigin(0, 0);
    container_popup.add(text_current_damage);

    // console.log(
    //     "unlockedPlayer.envolvedProperties.starLevelData[0]: ",
    //     unlockedPlayer.envolvedProperties.starLevelData[0]
    // );

    text_current_damage.setText(
        text_current_damage.text +
            " => " +
            unlockedPlayer.envolvedProperties.starLevelData[0].data[0]
                .attachDamage
    );

    const text_delay = scene.add
        .text(
            567,
            1274,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "Fire rate:"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_popup.add(text_delay);

    const text_current_delay = scene.add
        .text(567, 1320, unlockedPlayer.properties.attackDelay, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#D6D6D6",
            align: "left",
        })
        .setOrigin(0, 0);
    container_popup.add(text_current_delay);

    text_rate = scene.add
        .text(765, 1400, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "44px",
            color: "#37EBFF",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_popup.add(text_rate);

    let vipRateStr = "";
    if (centerData.vipStatus.data.isActive == true) {
        vipRateStr = "Vip " + centerData.vipStatus.data.benefits.upgradeBonus;
    }

    text_rate.updateRate = function () {
        let rate = GetRate();

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
            RequestEnvolved(scene, unlockedPlayer);
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
                "Evolve"
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

    container_btn.characterId = "";

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

function SetCardToButton(scene, btn, _id) {
    let unlockedPlayer = centerData.getUnlockedPlayerById(_id);

    // console.log("SetCardToButton _id: ", _id);
    // console.log("SetCardToButton unlockedPlayer: ", unlockedPlayer);

    if (btn.container_card) {
        btn.container_card.destroy();
    }

    if (_id != "") {
        let container_card = CreateCharacterCard(
            scene,
            _id,
            unlockedPlayer.code,
            unlockedPlayer.name,
            unlockedPlayer.role,
            unlockedPlayer.rank,
            unlockedPlayer.level,
            unlockedPlayer.star
        );

        btn.add(container_card);
        btn.container_card = container_card;
    }

    // Cách kết hợp cả hai để chắc chắn nhất
    if (text_rate && text_rate.active !== false && text_rate.scene) {
        text_rate.updateRate();
    }
}

let container_popup_select_main = null;
let container_popup_select_popup = null;
let container_popup_select_popup_buttons = null;

let container_popup_selected_card = null;

function CreateSelectCharacterPopupButton(scene, x, y, imageKey, buttonName) {
    let btnWidth = 346;
    let btnHeight = 94;

    const btn_container = scene.add.container(x, y);
    container_popup_select_popup_buttons.add(btn_container);

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
            20,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "36px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0);

    btn_inner_container.add(text);

    return btn_container;
}

function GetRate() {
    let rate = 0;

    let unlockedPlayer = centerData.getUnlockedPlayerById(characterId);

    // console.log("GetRate characterId: ", characterId);
    // console.log("GetRate unlockedPlayer: ", unlockedPlayer);

    if (unlockedPlayer) {
        if (unlockedPlayer.rank === centerDataPlayer.RANK_KEY.c.KEY) {
            rate = 5;
        } else if (unlockedPlayer.rank === centerDataPlayer.RANK_KEY.b.KEY) {
            rate = 5;
        } else if (unlockedPlayer.rank === centerDataPlayer.RANK_KEY.a.KEY) {
            rate = 5;
        }
    }

    return rate;
}

function RequestEnvolved(scene, unlockedPlayer) {
    let characterOfUserIds = [];

    let preserveCharacters = false;

    characterOfUserIds.push(characterId);

    for (let i = 0; i < availableHeroArr.length; i++) {
        if (characterOfUserIds.length < amountToUpgrade) {
            characterOfUserIds.push(availableHeroArr[i]._id);
        } else {
            break;
        }
    }

    if (btn_memory_1.useMemory == true) {
        preserveCharacters = true;
    }

    if (characterOfUserIds.length < amountToUpgrade) {
        CreateAlertPopup(
            scene,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "Not enough heroes to evolve"
            )
        );

        return;
    }

    CreateLoadingPopup();

    centerData.RequestCharactersEvolve(
        characterOfUserIds,
        preserveCharacters,
        (result) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, result.message);

            Close(scene);
        },
        (err) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, "Envolved failed\n" + err.message);
        }
    );
}

function CreateMemoryToEnvolved(rank) {
    let quantity = 0;
    switch (rank) {
        case centerDataPlayer.RANK_KEY.c.KEY: {
            quantity = 30;

            break;
        }

        case centerDataPlayer.RANK_KEY.b.KEY: {
            quantity = 60;

            break;
        }

        case centerDataPlayer.RANK_KEY.a.KEY: {
            quantity = 90;

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
                if (
                    buttonCharacter.characterId &&
                    buttonCharacter.characterId != ""
                ) {
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
                    CreateAlertPopup(
                        scene,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                            "Select more characters"
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

    UpdateCharactersInfo(
        scene,
        () => {
            let unlockedPlayer = centerData.getUnlockedPlayerById(characterId);

            if (unlockedPlayer != null) {
                CreateCardOptions(scene, unlockedPlayer._id);
            } else {
                CloseCardOptions(scene);
            }
        },
        () => {}
    );

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


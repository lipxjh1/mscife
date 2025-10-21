import centerData from "../../../Data/CenterData.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";
import centerDataItem from "../../../Data/CenterDataItem.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    CreateCardOptions,
    CloseCardOptions,
} from "./HomePlaytestCharacterUpStar.js";

import { CreateCharacterCard } from "../../Share/CharacterCard.js";

import { OpenCurrencyBar, HideCurrencyBar } from "../HomeTopBarPlayer.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

let container_main = null;

let container_popup = null;
const container_popup_openPosition = { x: 0, y: 0 };
const container_popup_closePosition = { x: 0, y: 4000 };

let container_0;
let container_item_list = null;

let isOpen = false;

let characterId = "";

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

let playTestAvaiableList = {};

export function CreatePlayTestUpStar(scene, _id) {
    characterId = _id;

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

    let unlockedPlayer = centerDataPlayer.playTestStarPlayer[characterId];

    CreateAvaiableList(unlockedPlayer);

    btn_1 = CreateSelectButton(scene, 44 + 321 / 2, 362 + 444 / 2);
    btn_1.characterId = characterId;
    SetCardToButton(scene, btn_1, characterId);

    btn_2 = CreateSelectButton(scene, 386 + 321 / 2, 362 + 444 / 2);
    btn_2.btn.on("pointerdown", function () {
        ButtonSelectClick(scene, btn_2);
    });

    btn_3 = CreateSelectButton(scene, 728 + 321 / 2, 362 + 444 / 2);
    btn_3.btn.on("pointerdown", function () {
        ButtonSelectClick(scene, btn_3);
    });

    quantity_to_upgrade = CreateMemoryToUpgrade(
        unlockedPlayer.rank,
        unlockedPlayer.star
    );

    usingMemory = 0;

    quantity_menory = 0;

    btn_memory_1 = null;
    btn_memory_2 = null;
    btn_memory_3 = null;

    remainButton = null;

    //
    {
        quantity_menory = 999;

        remainButton = CreateRemainMSCIMemoryButton(scene);
        remainButton.setPosition(540, 1750 + 64 / 2);
        UpdateRemainMsciMemoryValue();

        btn_memory_1 = CreateMemoryButton(scene, btn_1);
        btn_memory_1.setPosition(124 + 150 / 2, 937 + 150 / 2);

        btn_memory_2 = CreateMemoryButton(scene, btn_2);
        btn_memory_2.setPosition(464 + 150 / 2, 937 + 150 / 2);

        btn_memory_3 = CreateMemoryButton(scene, btn_3);
        btn_memory_3.setPosition(804 + 150 / 2, 937 + 150 / 2);
    }
    //

    SetSelectedCharacterInfo(scene);

    Open(scene);
}

function CreateAvaiableList(unlockedPlayer) {
    playTestAvaiableList = {};

    playTestAvaiableList[unlockedPlayer._id] = unlockedPlayer;

    for (let i = 0; i < 7; i++) {
        const copy = JSON.parse(JSON.stringify(unlockedPlayer));

        copy._id += i;

        playTestAvaiableList[copy._id] = copy;
    }
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

function SetSelectedCharacterInfo(scene) {
    let unlockedPlayer = playTestAvaiableList[characterId];

    // console.log("SetCardToButton characterId: ", characterId);
    // console.log("SetCardToButton unlockedPlayer: ", unlockedPlayer);

    let container_card = CreateCharacterCard(
        scene,
        characterId,
        unlockedPlayer.code,
        unlockedPlayer.name,
        unlockedPlayer.role,
        unlockedPlayer.rank,
        1,
        unlockedPlayer.star + 1
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
        .text(
            567,
            1214,
            unlockedPlayer.starLevelData[unlockedPlayer.star - 1].data[
                unlockedPlayer.level - 1
            ].attachDamage,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#D6D6D6",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_popup.add(text_current_damage);

    text_current_damage.setText(
        text_current_damage.text +
            " => " +
            unlockedPlayer.starLevelData[unlockedPlayer.star].data[0]
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
        .text(567, 1320, unlockedPlayer.baseProperties.attackDelay, {
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

    text_rate.updateRate = function () {
        let rate = 0;

        if (btn_2.characterId != "" || btn_3.characterId != "") {
            rate = GetRate();
        }

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

    // const text_chip = scene.add
    //     .text(765, 1520, unlockedPlayer.nextLevelProperties.chipToUpgrade, {
    //         fontFamily: "Russo One",
    //         fontSize: "44px",
    //         color: "#ffffff",
    //         align: "center",
    //     })
    //     .setOrigin(0.5, 1);
    // container_popup.add(text_chip);

    // const chip_icon = scene.add
    //     .image(
    //         765 + text_chip.width / 2, // Vị trí x tương đối với container
    //         1520, // Căn giữa theo chiều dọc
    //         "item_chip"
    //     )
    //     .setScale(46 / 350)
    //     .setOrigin(0, 1);
    // container_popup.add(chip_icon);

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
            RequestUpgrade(scene, unlockedPlayer);
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

    // const text_chip = scene.add
    //     .text(
    //         391 / 2,
    //         92 / 2,
    //         unlockedPlayer.nextLevelProperties.chipToUpgrade,
    //         {
    //             fontFamily: "Russo One",
    //             fontSize: "44px",
    //             color: "#D6D6D6",
    //             align: "right",
    //         }
    //     )
    //     .setOrigin(1, 0);
    // container_upgrade_btn_inner.add(text_chip);

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
    let unlockedPlayer = playTestAvaiableList[characterId];

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

function ButtonSelectClick(scene, btn) {
    //console.log("ButtonSelectClick");

    CreateSelectCharacterPopup(
        scene,
        (selectedId) => {
            btn.characterId = selectedId;

            //console.log("btn.characterId:", btn.characterId);

            SetCardToButton(scene, btn, btn.characterId);
        },
        () => {}
    );
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

function CreateSelectCharacterPopup(scene, onSelect, onCancel) {
    //console.log("CreateSelectCharacterPopup");

    container_popup_selected_card = null;

    container_popup_select_main = scene.add.container(0, 0);
    container_popup_select_main.setDepth(1000);

    let black_bg = scene.add
        .rectangle(540, 960, 1080, 1920, 0x000000)
        .setAlpha(0.8)
        .setInteractive();

    container_popup_select_main.add(black_bg);

    container_popup_select_popup = scene.add.container(0, 0);
    container_popup_select_main.add(container_popup_select_popup);

    container_popup_select_popup_buttons = scene.add.container(0, 0);
    container_popup_select_main.add(container_popup_select_popup_buttons);

    const popup_bg = scene.rexUI.add.roundRectangle(
        106 + 867 / 2,
        324 + 1271 / 2,
        867,
        1271,
        4,
        0x202020,
        0.8
    );
    container_popup_select_popup.add(popup_bg);

    const btn_select = CreateSelectCharacterPopupButton(
        scene,
        167 + 348 / 2,
        1487 + 94 / 2,
        "home_character_upgrade_btn_select",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
            "Select"
        )
    );
    btn_select.button.on("pointerdown", (pointer) => {
        if (onSelect && typeof onSelect === "function") {
            // console.log(
            //     "container_popup_selected_card:",
            //     container_popup_selected_card
            // );

            let _id = "";

            if (container_popup_selected_card) {
                _id = container_popup_selected_card._id;
            }

            onSelect(_id);
        }

        container_popup_select_main.destroy();
    });

    const btn_cancel = CreateSelectCharacterPopupButton(
        scene,
        571 + 348 / 2,
        1487 + 94 / 2,
        "home_character_upgrade_btn_cancel",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
            "Cancel"
        )
    );
    btn_cancel.button.on("pointerdown", (pointer) => {
        if (onSelect && typeof onSelect === "function") {
            if (onCancel && typeof onCancel === "function") {
                onCancel();
            }

            container_popup_select_main.destroy();
        }
    });

    CreateSelectCharacterItemList(scene);
}

function CreateSelectCharacterItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    if (container_item_list) {
        container_item_list.destroy();
    }

    container_item_list = scene.add.container(0, 0);
    container_popup_select_popup.add(container_item_list);

    let itemData = [];

    let btn_1_UnlockedPlayer = centerDataPlayer.playTestStarPlayer[characterId];

    let playerArray = Object.values(playTestAvaiableList);

    playerArray.forEach((obj) => {
        if (
            obj.code == btn_1_UnlockedPlayer.code &&
            obj.star == btn_1_UnlockedPlayer.star &&
            obj.level == btn_1_UnlockedPlayer.level &&
            obj._id != btn_1.characterId &&
            obj._id != btn_2.characterId &&
            obj._id != btn_3.characterId
        ) {
            let pData = centerDataPlayer.getPlayerById(obj.code);

            const newItem = {
                unlockedPlayer: obj,
                playerData: pData,
            };

            itemData.push(newItem);
        }
    });

    //console.log("itemData = ", itemData);

    const scrollViewWidth = 867;

    const scrollViewHeight = 1095;

    const spaceWidth = 36 / 2;

    const spaceHeight = 36 / 2;

    const cellWidth = 245;

    const cellHeight = 341;

    const posX = 136 + scrollViewWidth / 2 + cellWidth / 2 + spaceWidth;

    const posY = 354 + scrollViewHeight / 2;

    // const grid_bg = scene.rexUI.add.roundRectangle(
    //     posX,
    //     posY,
    //     scrollViewWidth,
    //     scrollViewHeight,
    //     0,
    //     0x000000,
    //     0.5
    // );
    // container_popup_select_popup.add(grid_bg);

    const gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,

            table: {
                cellWidth: cellWidth + spaceWidth,
                cellHeight: cellHeight + spaceHeight,
                columns: 3,
                //reuseCellContainer: true, // Kích hoạt tái sử dụng cell container
            },

            mouseWheelScroller: {
                focus: false,
                speed: 1,
            },

            items: itemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: width,
                        height: cellHeight,
                        orientation: 0,
                    });
                } else {
                    //console.log(cell.index + ": reuse cell-container");
                }

                cellContainer.add(
                    select_character_card_item(scene, index, item)
                );

                return cellContainer;
            },

            space: {
                // left: 50,
                // right: 0,
                // top: 38,
                // bottom: 0,
                // row: 0,
            },
        })
        .layout();

    gridTable.isDragging = false;

    scene.input.on("pointerup", (pointer) => {
        gridTable.isDragging = false;
    });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    // const gridOrigin = scene.rexUI.add.roundRectangle(
    //     gridTable.x,
    //     gridTable.y,
    //     50,
    //     50,
    //     0,
    //     0xffffff,
    //     1
    // );
    // container_item_list.add(gridOrigin);

    const maskShape = scene.add
        .rectangle(540, 354 + 1095 / 2, scrollViewWidth, 1095, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function select_character_card_item(scene, i, item) {
    //console.log("select_character_card_item item:", item);

    let container_card = CreateCharacterCard(
        scene,
        item.unlockedPlayer._id,
        item.unlockedPlayer.code,
        item.unlockedPlayer.name,
        item.unlockedPlayer.role,
        item.unlockedPlayer.rank,
        item.unlockedPlayer.level,
        item.unlockedPlayer.star
    );

    container_card.setScale(245 / 319);

    container_card.item = item;

    container_card.background
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function (pointer) {
            //console.log("btn_item clicked");

            container_item_list.gridTable.startY = pointer.y;

            container_item_list.gridTable.isDragging = true;

            container_card.startTime = scene.time.now; // Lấy thời gian hiện tại khi nhấn chuột
        })
        .on("pointermove", function (pointer) {
            //console.log("btn_item pointermove");

            if (!container_item_list.gridTable.isDragging) return;

            const deltaY = pointer.y - container_item_list.gridTable.startY; // Tính độ chênh lệch so với vị trí trước đó
            container_item_list.gridTable.startY = pointer.y; // Cập nhật startY cho lần di chuyển tiếp theo

            let itemHeight = 470;

            let itemCount = container_item_list.gridTable.items.length;

            let columns = 3;

            let rows = Math.ceil(itemCount / columns);

            let maxHeight = itemHeight * rows;

            let tPerPixel = 1 * (itemHeight / maxHeight);

            let smoothVal = 0.005;

            // Tính toán giá trị T hiện tại của bảng và điều chỉnh theo deltaY
            let currentT =
                container_item_list.gridTable.t -
                deltaY * (tPerPixel * smoothVal); // Điều chỉnh tốc độ cuộn
            currentT = Phaser.Math.Clamp(currentT, 0, 1); // Đảm bảo T nằm trong phạm vi 0-1

            container_item_list.gridTable.setT(currentT); // Cập nhật vị trí cuộn của bảng
        })
        .on("pointerup", function (pointer) {
            //console.log("btn_item pointerup");

            if (container_item_list.gridTable.isDragging == false) {
                //do something if it is seleted not dragging
            }

            container_item_list.gridTable.isDragging = false; // Dừng kéo

            const endTime = scene.time.now; // Lấy thời gian hiện tại khi thả chuột
            const duration = endTime - container_card.startTime; // Tính thời gian giữa hai sự kiện

            if (duration <= 125) {
                if (container_popup_selected_card) {
                    container_popup_selected_card.setUnselected();
                }

                container_popup_selected_card = container_card;

                container_popup_selected_card.setSelected();
            }
        })
        .on("pointerover", function (pointer) {
            if (container_item_list.gridTable.isDragging == true) {
                container_item_list.gridTable.startY = pointer.y;
            }

            container_card.each(function (child) {
                if (child.setTint) {
                    child.setTint(0x646464); // Màu tint bạn muốn áp dụng
                }
            });
        })
        .on("pointerout", function (pointer) {
            container_card.each(function (child) {
                if (child.clearTint) {
                    child.clearTint(); // Xóa tint
                }
            });
        });

    return container_card;
}

function GetRate() {
    let arr_ids = [];

    arr_ids.push(characterId);

    if (btn_2 && btn_2.characterId != "") {
        arr_ids.push(btn_2.characterId);
    }

    if (btn_3 && btn_3.characterId != "") {
        arr_ids.push(btn_3.characterId);
    }

    let rate = 0;

    let unlockedPlayer = centerDataPlayer.playTestStarPlayer[characterId];

    // console.log("GetRate characterId: ", characterId);
    // console.log("GetRate unlockedPlayer: ", unlockedPlayer);

    if (unlockedPlayer) {
        if (unlockedPlayer.rank === centerDataPlayer.RANK_KEY.c.KEY) {
            if (unlockedPlayer.star === 1) {
                if (arr_ids.length < 3) {
                    rate = 80;
                } else {
                    rate = 100;
                }
            } else if (unlockedPlayer.star === 2) {
                if (arr_ids.length < 3) {
                    rate = 50;
                } else {
                    rate = 80;
                }
            } else if (unlockedPlayer.star === 3) {
                if (arr_ids.length < 3) {
                    rate = 30;
                } else {
                    rate = 50;
                }
            }
        } else if (unlockedPlayer.rank === centerDataPlayer.RANK_KEY.b.KEY) {
            if (unlockedPlayer.star === 1) {
                if (arr_ids.length < 3) {
                    rate = 60;
                } else {
                    rate = 80;
                }
            } else if (unlockedPlayer.star === 2) {
                if (arr_ids.length < 3) {
                    rate = 40;
                } else {
                    rate = 60;
                }
            } else if (unlockedPlayer.star === 3) {
                if (arr_ids.length < 3) {
                    rate = 20;
                } else {
                    rate = 40;
                }
            }
        } else if (unlockedPlayer.rank === centerDataPlayer.RANK_KEY.a.KEY) {
            if (unlockedPlayer.star === 1) {
                if (arr_ids.length < 3) {
                    rate = 30;
                } else {
                    rate = 60;
                }
            } else if (unlockedPlayer.star === 2) {
                if (arr_ids.length < 3) {
                    rate = 20;
                } else {
                    rate = 40;
                }
            } else if (unlockedPlayer.star === 3) {
                if (arr_ids.length < 3) {
                    rate = 10;
                } else {
                    rate = 30;
                }
            }
        } else if (unlockedPlayer.rank === centerDataPlayer.RANK_KEY.s.KEY) {
            if (unlockedPlayer.star === 1) {
                if (arr_ids.length < 3) {
                    rate = 15;
                } else {
                    rate = 30;
                }
            } else if (unlockedPlayer.star === 2) {
                if (arr_ids.length < 3) {
                    rate = 10;
                } else {
                    rate = 20;
                }
            } else if (unlockedPlayer.star === 3) {
                if (arr_ids.length < 3) {
                    rate = 5;
                } else {
                    rate = 10;
                }
            }
        }
    }

    return rate;
}

function RequestUpgrade(scene, unlockedPlayer) {
    let characterOfUserIds = [];

    let preserveCharacterIds = [];

    characterOfUserIds.push(characterId);

    if (btn_memory_1.useMemory == true) {
        preserveCharacterIds.push(characterId);
    }

    if (btn_2.characterId != "") {
        characterOfUserIds.push(btn_2.characterId);

        if (btn_memory_2.useMemory == true) {
            preserveCharacterIds.push(btn_2.characterId);
        }
    }

    if (btn_3.characterId != "") {
        characterOfUserIds.push(btn_3.characterId);

        if (btn_memory_3.useMemory == true) {
            preserveCharacterIds.push(btn_3.characterId);
        }
    }

    if (characterOfUserIds.length < 2) {
        CreateAlertPopup(
            scene,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "Select more characters"
            )
        );

        return;
    }

    CreateAlertPopup(scene, "Up Star success");

    Close(scene);
}

function CreateMemoryToUpgrade(rank, star) {
    let quantity = 0;
    switch (rank) {
        case centerDataPlayer.RANK_KEY.c.KEY: {
            switch (star) {
                case 1: {
                    quantity = 1;

                    break;
                }

                case 2: {
                    quantity = 2;

                    break;
                }

                case 3: {
                    quantity = 3;

                    break;
                }

                case 4: {
                    quantity = 4;

                    break;
                }
            }

            break;
        }

        case centerDataPlayer.RANK_KEY.b.KEY: {
            switch (star) {
                case 1: {
                    quantity = 5;

                    break;
                }

                case 2: {
                    quantity = 6;

                    break;
                }

                case 3: {
                    quantity = 7;

                    break;
                }

                case 4: {
                    quantity = 8;

                    break;
                }
            }

            break;
        }

        case centerDataPlayer.RANK_KEY.a.KEY: {
            switch (star) {
                case 1: {
                    quantity = 9;

                    break;
                }

                case 2: {
                    quantity = 10;

                    break;
                }

                case 3: {
                    quantity = 11;

                    break;
                }

                case 4: {
                    quantity = 12;

                    break;
                }
            }

            break;
        }

        case centerDataPlayer.RANK_KEY.s.KEY: {
            switch (star) {
                case 1: {
                    quantity = 13;

                    break;
                }

                case 2: {
                    quantity = 14;

                    break;
                }

                case 3: {
                    quantity = 15;

                    break;
                }

                case 4: {
                    quantity = 16;

                    break;
                }
            }

            break;
        }
    }

    return quantity;
}

function CreateMemoryButton(scene, buttonCharacter) {
    let itemWidth = 150;
    let itemHeight = 150;

    const container_item = scene.add.container(0, 0);
    container_popup.add(container_item);

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

    let unlockedPlayer = centerDataPlayer.playTestStarPlayer[characterId];

    if (unlockedPlayer != null) {
        CreateCardOptions(scene, unlockedPlayer._id);
    } else {
        CloseCardOptions(scene);
    }

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

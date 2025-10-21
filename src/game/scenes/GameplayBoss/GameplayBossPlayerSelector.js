import centerData from "../../Data/CenterData.js";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";

import { CreateCharacterCard } from "../Share/CharacterCard.js";

let container_main = null;

let container_selector = null;

let container_btns = null;

let container_btn_gunner = null;

let container_btn_sniper = null;

let container_btn_rocket = null;

const left_card_pos = { x: 630 + 152 / 2, y: 1581 + 210 / 2 };
const right_card_pos = { x: 630 + 152 / 2 + 236, y: 1581 + 210 / 2 };
const mid_card_pos = { x: 760 + 191 / 2, y: 1554 + 264 / 2 };

const side_scale = 0.4668;
const mid_scale = 0.5617;

const mid_alpha = 1;
const side_alpha = 0.5;

let card_left = null;
let card_right = null;
let card_mid = null;

let isTween = false;

let itemData = [];

export function CreatePlayerSelector(scene) {
    container_btn_gunner = null;

    container_btn_sniper = null;

    container_btn_rocket = null;

    container_main = scene.add.container(0, 0).setDepth(100);

    container_selector = scene.add.container(0, 0).setDepth(0);
    container_main.add(container_selector);

    container_btns = scene.add.container(0, 0).setDepth(1);
    container_main.add(container_btns);

    itemData = [];

    loadPlayerButtons(scene);

    setInitialSelection();

    setupKeyboardShortcuts(scene);
}

function loadPlayerButtons(scene) {
    for (let i = 0; i < centerData.selectedPlayerArr.length; i++) {
        let unlockedPlayer = centerData.getUnlockedPlayerById(
            centerData.selectedPlayerArr[i]
        );

        let pData = centerDataPlayer.getPlayerById(unlockedPlayer.code);

        if (pData !== null) {
            const newItem = {
                unlockedPlayer: unlockedPlayer,
                playerData: pData,
            };

            itemData.push(newItem);

            if (unlockedPlayer.role === "gunner") {
                container_btn_gunner = CreateButtonSelect(scene, newItem);
                container_btn_gunner.setPosition(605 + 166 / 2, 1694 + 166 / 2);
            } else if (unlockedPlayer.role === "sniper") {
                container_btn_sniper = CreateButtonSelect(scene, newItem);
                container_btn_sniper.button.setTexture(
                    "gameplay_selector_btn_sniper"
                );
                container_btn_sniper.buttonSelected.setTexture(
                    "gameplay_selector_btn_sniper_selected"
                );
                container_btn_sniper.setPosition(702 + 166 / 2, 1510 + 166 / 2);
            } else if (unlockedPlayer.role === "rocket") {
                container_btn_rocket = CreateButtonSelect(scene, newItem);
                container_btn_rocket.button.setTexture(
                    "gameplay_selector_btn_rocket"
                );
                container_btn_rocket.buttonSelected.setTexture(
                    "gameplay_selector_btn_rocket_selected"
                );
                container_btn_rocket.setPosition(886 + 166 / 2, 1413 + 166 / 2);
            }
        }
    }
}

function setInitialSelection() {
    if (
        container_btn_gunner &&
        container_btn_gunner.item.unlockedPlayer._id ===
            centerData.selectedPlayerArr[0]
    ) {
        container_btn_gunner.setSelected();
    } else if (
        container_btn_sniper &&
        container_btn_sniper.item.unlockedPlayer._id ===
            centerData.selectedPlayerArr[0]
    ) {
        container_btn_sniper.setSelected();
    } else if (
        container_btn_rocket &&
        container_btn_rocket.item.unlockedPlayer._id ===
            centerData.selectedPlayerArr[0]
    ) {
        container_btn_rocket.setSelected();
    }
}

function setupKeyboardShortcuts(scene) {
    const keyConfig = [
        { key: "ONE", button: container_btn_gunner, role: "gunner" },
        { key: "TWO", button: container_btn_sniper, role: "sniper" },
        { key: "THREE", button: container_btn_rocket, role: "rocket" },
    ];

    keyConfig.forEach((config) => {
        if (config.button) {
            scene.input.keyboard.on(
                `keydown-${config.key}`,
                function (event) {
                    // console.log(
                    //     `Phím ${config.key
                    //         .replace("ONE", "1")
                    //         .replace("TWO", "2")
                    //         .replace("THREE", "3")} đã được nhấn! Chọn ${
                    //         config.role
                    //     }`
                    // );
                    selectPlayer(scene, config.button);
                },
                scene
            );
        }
    });
}

function selectPlayer(scene, button) {
    scene.SetPlayer(scene, button.item.unlockedPlayer._id);
    button.setSelected();

    [container_btn_gunner, container_btn_sniper, container_btn_rocket].forEach(
        (btn) => {
            if (btn && btn !== button) {
                btn.setUnselected();
            }
        }
    );
}

function CreateButtonSelect(scene, item) {
    let container_button = scene.add.container(0, 0);
    container_btns.add(container_button);

    container_button.item = item;

    let container_button_inner = scene.add.container(-194 / 2, -194 / 2);
    container_button.add(container_button_inner);

    container_button.button = scene.add
        .image(0, 0, "gameplay_selector_btn_gunner")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {
            selectPlayer(scene, container_button);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_button,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    container_button_inner.add(container_button.button);

    container_button.buttonSelected = scene.add
        .image(0, 0, "gameplay_selector_btn_gunner_selected")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_button,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    container_button_inner.add(container_button.buttonSelected);

    container_button.setSelected = function () {
        container_button.button.setVisible(false);
        container_button.button.disableInteractive();

        container_button.buttonSelected.setVisible(true);
        container_button.button.setInteractive();
    };

    container_button.setUnselected = function () {
        container_button.button.setVisible(true);
        container_button.button.setInteractive();

        container_button.buttonSelected.setVisible(false);
        container_button.buttonSelected.disableInteractive();
    };

    container_button.setUnselected();

    return container_button;
}

function CreateButtonSelectLeft(scene) {
    const btn = scene.add
        .image(672 + 65 / 2, 1638 + 95 / 2, "share_btn_next_left")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {
            LeftButtonClick(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    container_btns.add(btn);
}

function CreateButtonSelectRight(scene) {
    const btn = scene.add
        .image(974 + 65 / 2, 1638 + 95 / 2, "share_btn_next_right")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {
            RightButtonClick(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    container_btns.add(btn);
}

function LeftButtonClick(scene) {
    if (isTween) return;

    isTween = true;

    if (typeof scene.SetPlayer === "function") {
        scene.SetPlayer(scene, card_left.item.unlockedPlayer._id);
    } else {
        //console.error("SetPlayer function not found on scene.");
    }

    scene.tweens.add({
        targets: card_mid,
        x: right_card_pos.x,
        y: right_card_pos.y,
        duration: 500,
        ease: "Power2",
        delay: 0,
        onComplete: function () {
            let temp = card_right;

            card_right = card_mid;

            card_mid = card_left;

            card_left = temp;

            container_selector.bringToTop(card_left);
            container_selector.bringToTop(card_right);
            container_selector.bringToTop(card_mid);

            isTween = false;
        },
    });

    scene.tweens.add({
        targets: card_mid,
        scale: side_scale,
        duration: 500,
        ease: "Power2",
    });

    scene.tweens.add({
        targets: card_mid,
        alpha: side_alpha,
        duration: 500,
        ease: "Power2",
    });

    scene.tweens.add({
        targets: card_right,
        alpha: 0,
        duration: 250,
        ease: "Power2",
        onComplete: function () {
            if (itemData.length == 2) {
                let old = card_right;

                card_right = card_item(
                    scene,
                    card_mid.item,
                    right_card_pos.x,
                    right_card_pos.y
                );
                container_selector.add(card_right);
                card_right.setScale(side_scale);
                card_right.setAlpha(side_alpha);

                old.destroy();
            }

            card_right.setPosition(left_card_pos.x, left_card_pos.y);
        },
    });

    scene.tweens.add({
        targets: card_right,
        alpha: side_alpha,
        duration: 250,
        ease: "Power2",
        delay: 250,
    });

    scene.tweens.add({
        targets: card_left,
        x: mid_card_pos.x,
        y: mid_card_pos.y,
        duration: 500,
        ease: "Power2",
        delay: 0,
    });

    scene.tweens.add({
        targets: card_left,
        scale: mid_scale,
        duration: 500,
        ease: "Power2",
    });

    scene.tweens.add({
        targets: card_left,
        alpha: mid_alpha,
        duration: 500,
        ease: "Power2",
    });
}

function RightButtonClick(scene) {
    if (isTween) return;

    isTween = true;

    if (typeof scene.SetPlayer === "function") {
        scene.SetPlayer(scene, card_right.item.unlockedPlayer._id);
    } else {
        //console.error("SetPlayer function not found on scene.");
    }

    scene.tweens.add({
        targets: card_mid,
        x: left_card_pos.x,
        y: left_card_pos.y,
        duration: 500,
        ease: "Power2",
        delay: 0,
        onComplete: function () {
            let temp = card_left;

            card_left = card_mid;

            card_mid = card_right;

            card_right = temp;

            container_selector.bringToTop(card_left);
            container_selector.bringToTop(card_right);
            container_selector.bringToTop(card_mid);

            isTween = false;
        },
    });

    scene.tweens.add({
        targets: card_mid,
        scale: side_scale,
        duration: 500,
        ease: "Power2",
    });

    scene.tweens.add({
        targets: card_mid,
        alpha: side_alpha,
        duration: 500,
        ease: "Power2",
    });

    scene.tweens.add({
        targets: card_left,
        alpha: 0,
        duration: 250,
        ease: "Power2",
        onComplete: function () {
            if (itemData.length == 2) {
                let old = card_left;

                card_left = card_item(
                    scene,
                    card_mid.item,
                    right_card_pos.x,
                    right_card_pos.y
                );
                container_selector.add(card_left);
                card_left.setScale(side_scale);
                card_left.setAlpha(side_alpha);

                old.destroy();
            }

            card_left.setPosition(right_card_pos.x, right_card_pos.y);
        },
    });

    scene.tweens.add({
        targets: card_left,
        alpha: side_alpha,
        duration: 250,
        ease: "Power2",
        delay: 250,
    });

    scene.tweens.add({
        targets: card_right,
        x: mid_card_pos.x,
        y: mid_card_pos.y,
        duration: 500,
        ease: "Power2",
        delay: 0,
    });

    scene.tweens.add({
        targets: card_right,
        scale: mid_scale,
        duration: 500,
        ease: "Power2",
    });

    scene.tweens.add({
        targets: card_right,
        alpha: mid_alpha,
        duration: 500,
        ease: "Power2",
    });
}

function card_item(scene, item, x, y) {
    let container_card = CreateCharacterCard(scene);

    container_card.setPosition(x, y);

    container_card.item = item;

    return container_card;
}

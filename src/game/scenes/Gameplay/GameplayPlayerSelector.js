import centerData from "../../Data/CenterData.js";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";

let container_main = null;
let container_selector = null;
let container_btns = null;
let container_btn_gunner = null;
let container_btn_sniper = null;
let container_btn_rocket = null;

let itemData = [];

export function CreatePlayerSelector(scene) {
    // Khởi tạo các container
    container_btn_gunner = null;
    container_btn_sniper = null;
    container_btn_rocket = null;

    container_main = scene.add.container(0, 0).setDepth(100);
    container_selector = scene.add.container(0, 0).setDepth(0);
    container_btns = scene.add.container(0, 0).setDepth(1);

    container_main.add(container_selector);
    container_main.add(container_btns);

    itemData = [];

    // Tạo các nút nhân vật
    loadPlayerButtons(scene);

    // Thiết lập trạng thái ban đầu
    setInitialSelection();

    // Thiết lập phím tắt
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

    // Bỏ chọn các nút khác
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

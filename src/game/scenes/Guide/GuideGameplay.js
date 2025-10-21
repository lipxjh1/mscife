import centerData from "../../Data/CenterData.js";
import centerDataItem from "../../Data/CenterDataItem.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";
import { CreateHomeBattle } from "../Home/HomeBattle/HomeBattle.js";

let container_main = null;

let container_gunner = null;
let container_sniper = null;
let container_rocket = null;
let container_doge_shield = null;
let container_doge_energy = null;

let container_btn_gunner = null;
let container_btn_sniper = null;
let container_btn_rocket = null;

let step = 0;

export function CreateGuideGameplay(scene) {
    if (
        centerData.userInfo.CurrentStage > 1 ||
        centerData.selectedPlayerArr.length != 3
    ) {
        return;
    }

    scene.time.paused = true;

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const bg = scene.rexUI.add
        .roundRectangle(0, 0, 1080, 1920, 0, 0x000000, 0.8)
        .setInteractive()
        .setOrigin(0, 0);

    bg.on("pointerdown", function () {
        NextStep(scene);
    });

    container_main.add(bg);

    step = 0;

    NextStep(scene);

    return container_main;
}

function NextStep(scene) {
    if (step == 0) {
        CreateGuideGunner(scene, container_main);
    } else if (step == 1) {
        container_gunner.destroy();
        CreateGuideSniper(scene, container_main);
    } else if (step == 2) {
        container_sniper.destroy();
        CreateGuideRocket(scene, container_main);
    } else if (step == 3) {
        container_rocket.destroy();
        CreateGuideDogeShield(scene, container_main);
    } else if (step == 4) {
        container_doge_shield.destroy();
        CreateGuideDogeEnergy(scene, container_main);
    } else if (step == 5) {
        container_doge_energy.destroy();

        scene.time.paused = false;

        container_main.destroy();
    }

    step++;
}

function CreateGuideGunner(scene, container) {
    container_gunner = scene.add.container(0, 0);
    container.add(container_gunner);

    CreateText(
        scene,
        container_gunner,
        565,
        1694,
        "Gunner can be selected by clicking the button"
    );

    container_btn_gunner = CreateButtonSelect(scene, container_gunner);

    container_btn_gunner.button.setTexture("gameplay_selector_btn_gunner");
    container_btn_gunner.buttonSelected.setTexture(
        "gameplay_selector_btn_gunner_selected"
    );

    container_btn_gunner.setPosition(605 + 166 / 2, 1694 + 166 / 2);

    return container_gunner;
}

function CreateGuideSniper(scene, container) {
    container_sniper = scene.add.container(0, 0);
    container.add(container_sniper);

    CreateText(
        scene,
        container_sniper,
        662,
        1510,
        "Sniper can be selected by clicking the button"
    );

    container_btn_sniper = CreateButtonSelect(scene, container_sniper);

    container_btn_sniper.button.setTexture("gameplay_selector_btn_sniper");
    container_btn_sniper.buttonSelected.setTexture(
        "gameplay_selector_btn_sniper_selected"
    );

    container_btn_sniper.setPosition(702 + 166 / 2, 1510 + 166 / 2);

    return container_sniper;
}

function CreateGuideRocket(scene, container) {
    container_rocket = scene.add.container(0, 0);
    container.add(container_rocket);

    CreateText(
        scene,
        container_rocket,
        846,
        1413,
        "Rocket can be selected by clicking the button"
    );

    container_btn_rocket = CreateButtonSelect(scene, container_rocket);

    container_btn_rocket.button.setTexture("gameplay_selector_btn_rocket");
    container_btn_rocket.buttonSelected.setTexture(
        "gameplay_selector_btn_rocket_selected"
    );

    container_btn_rocket.setPosition(886 + 166 / 2, 1413 + 166 / 2);

    return container_rocket;
}

function CreateGuideDogeShield(scene, container) {
    container_doge_shield = scene.add.container(0, 0);
    container.add(container_doge_shield);

    CreateText(
        scene,
        container_doge_shield,
        816,
        1664,
        "Doge Shield can be selected by clicking the button \n it will protect you from damage in 3 seconds"
    );

    let code = "DOGE_SHIELD";

    let itemData = centerDataItem.getItemById(code);

    let btn = CreateButtonItemSelect(scene, container_doge_shield);

    btn.setPosition(856 + 196 / 2, 1664 + 196 / 2);
    btn.image.setTexture(itemData.imgKey);

    return container_doge_shield;
}

function CreateGuideDogeEnergy(scene, container) {
    container_doge_energy = scene.add.container(0, 0);
    container.add(container_doge_energy);

    CreateText(
        scene,
        container_doge_energy,
        816,
        1132,
        "Doge Energy can be selected by clicking the button \n it will increase your 10% damage in 30 seconds"
    );

    let code = "DOGE_ENERGY";

    let itemData = centerDataItem.getItemById(code);

    let btn = CreateButtonItemSelect(scene, container_doge_energy);

    btn.setPosition(856 + 196 / 2, 1132 + 196 / 2);
    btn.image.setTexture(itemData.imgKey);

    return container_doge_energy;
}

function CreateText(scene, container, x, y, str) {
    const container_text = scene.add.container(0, 0);
    container.add(container_text);

    let width = 540;
    let height = 480;

    const bg = scene.rexUI.add
        .roundRectangle(0, 0, width, height, 20, 0xffffff, 0.2)
        .setOrigin(1, 0);
    container_text.add(bg);

    const text = scene.add
        .text(0, 0, str, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#ffffff",
            align: "left",
            wordWrap: { width: width * 0.8, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);

    bg.setPosition(text.x + 20, text.y - 20);
    bg.setDisplaySize(text.width + 40, text.height + 40);

    container_text.add(text);

    container_text.setPosition(x, y);

    // Thiết lập scale ban đầu
    container_text.setScale(0);

    // Tạo hiệu ứng tween scale
    const textTween = scene.tweens.add({
        targets: container_text,
        scale: 1,
        duration: 500, // 0.5 giây
        ease: "Back.easeOut",
        onComplete: function () {
            // Hủy tween sau khi hoàn thành
            if (textTween) {
                textTween.remove();
            }
        },
        paused: false,
    });

    return container_text;
}

function CreateButtonSelect(scene, container) {
    let container_button = scene.add.container(0, 0);
    container.add(container_button);

    let container_button_inner = scene.add.container(-194 / 2, -194 / 2);
    container_button.add(container_button_inner);

    container_button.button = scene.add
        .image(0, 0, "gameplay_selector_btn_gunner")
        .setOrigin(0, 0);
    container_button_inner.add(container_button.button);

    container_button.buttonSelected = scene.add
        .image(0, 0, "gameplay_selector_btn_gunner_selected")
        .setOrigin(0, 0);

    container_button_inner.add(container_button.buttonSelected);

    return container_button;
}

function CreateButtonItemSelect(scene, container) {
    let container_button = scene.add.container(0, 0);
    container.add(container_button);

    let container_button_inner = scene.add.container(-196 / 2, -196 / 2);
    container_button.add(container_button_inner);
    container_button.container_button_inner = container_button_inner;

    container_button.locked = false;

    container_button.button = scene.add
        .image(0, 0, "gameplay_selector_item_btn")
        .setOrigin(0, 0);
    container_button_inner.add(container_button.button);

    container_button.image = scene.add
        .image(196 / 2, 196 / 2, "item_musk")
        .setDisplaySize(150, 150)
        .setOrigin(0.5, 0.5);
    container_button_inner.add(container_button.image);

    container_button.text_quantity = scene.add
        .text(196, 196, "", {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#ffffff",
            align: "right",
            wordWrap: { width: 250, useAdvancedWrap: true },
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(1, 1);
    container_button_inner.add(container_button.text_quantity);

    return container_button;
}

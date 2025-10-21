import centerData from "../../../Data/CenterData.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import { CreateCharacterCard } from "../../Share/CharacterCard.js";

import {
    UpdateCharactersInfo,
    CloseCardOptions,
} from "./HomeCharacterInventoryTeam.js";

import centerDataPlayer from "../../../Data/CenterDataPlayer.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import { CreateItemRewardPopup } from "../../Share/PopupReward.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

let container_main = null;

let isOpen = false;

function GetMCoinToSell(star) {
    switch (star) {
        case 1: {
            return 10000;
        }
        case 2: {
            return 20000;
        }
        case 3: {
            return 50000;
        }
        case 4: {
            return 100000;
        }
    }

    return 0;
}

export function CreateSell(scene, _id) {
    let characterId = _id;

    let unlockedPlayer = centerData.getUnlockedPlayerById(characterId);

    Destroy(scene);

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const lock_bg = scene.add
        .image(540, 960, "home_character_extract_bg")
        .setOrigin(0.5, 0.5)
        .setInteractive();
    container_main.add(lock_bg);

    const chip_icon = scene.add
        .image(905, 788, centerDataItem.getItemById("Musk").imgKey)
        .setDisplaySize(128, 128)
        .setOrigin(0.5, 0.5);
    container_main.add(chip_icon);

    const text_chip = scene.add
        .text(999, 893, "x" + GetMCoinToSell(unlockedPlayer.star), {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 1);

    container_main.add(text_chip);

    const text_0 = scene.add
        .text(
            540,
            1103,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "Are you sure you want to sell this character ?"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_0);

    const btn_extract = CreateButton(
        scene,
        container_main,
        191 + 348 / 2,
        1246 + 94 / 2,
        "home_character_extract_btn_extract",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
            "Sell"
        )
    );
    btn_extract.button.on("pointerdown", (pointer) => {
        RequestToSell(scene, characterId, GetMCoinToSell(unlockedPlayer.star));
    });

    const btn_cancel = CreateButton(
        scene,
        container_main,
        577 + 348 / 2,
        1246 + 94 / 2,
        "home_character_extract_btn_cancel",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
            "Cancel"
        )
    );
    btn_cancel.button.on("pointerdown", (pointer) => {
        Close(scene);
    });

    let container_card = CreateCharacterCard(
        scene,
        characterId,
        unlockedPlayer.code,
        unlockedPlayer.name,
        unlockedPlayer.role,
        unlockedPlayer.rank,
        unlockedPlayer.level,
        unlockedPlayer.star
    );

    container_card.setPosition(70 + 321 / 2, 566 + 443 / 2);

    container_card.setScale(443 / 470);

    container_main.add(container_card);

    Open(scene);
}

function CreateButton(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 348;
    let btnHeight = 94;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

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
                cdLocalization.GROUP_KEYS.HomeFragment.KEY,
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

function RequestToSell(scene, _id, chipWhenDecay) {
    CreateLoadingPopup();

    centerData.RequestCharactersSellMusk(
        _id,
        (result) => {
            HideLoadingPopup();

            CreateItemRewardPopup(scene, _id, "Musk", "M-Coin", chipWhenDecay);

            CloseCardOptions(scene);

            UpdateCharactersInfo(
                scene,
                () => {},
                () => {}
            );

            Close(scene);
        },
        (err) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, "Sell failed\n" + err.message);
        }
    );
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen) return;

    isOpen = true;
}

export function Close(scene) {
    if (isOpen == false) return;

    isOpen = false;

    Destroy();
}

function Destroy() {
    if (container_main) container_main.destroy();

    container_main = null;
}


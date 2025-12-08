// Removed Telegram SDK imports - using window.open() instead

import centerData from "../../Data/CenterData.js";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";
import centerDataItem from "../../Data/CenterDataItem.js";

import { AssetLoadingManager } from "../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";

import { CreateLoadingPopup, HideLoadingPopup } from "../Share/AlertPopup.js";
import { CreateCharacterCard } from "../Share/CharacterCard.js";
import { isTelegramMiniApp } from "../../utils.js";
import { playIdleAnimation } from "../../utils/spineUtils.js";

let container_main = null;

let container_popup = null;

let container_popup_buttons = null;

export function CreateFirstMissions(scene) {
    if (centerData.GetFirstMissionsDone()) {
        return;
    }

    CreateLoadingPopup();

    let assetsToLoad = 3;
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();

            AssetsLoadDone(scene);
        }
    };

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadFirstMissions(() => {
        onAssetLoaded();
    });

    let arr_ids = ["david", "henry", "marcus"];

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        arr_ids,
        () => {
            onAssetLoaded();
        }
    );

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterSpineUI(
        arr_ids,
        () => {
            onAssetLoaded();
        }
    );
}

function AssetsLoadDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    // const lock_bg = scene.rexUI.add
    //     .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.75)
    //     .setInteractive({ useHandCursor: true });

    // container_main.add(lock_bg);

    // const lock_bg = scene.add
    //     .image(0, 0, "home_user_info_bg")
    //     .setOrigin(0, 0)
    //     .setInteractive();
    // container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup_buttons = scene.add.container(0, 0);
    container_main.add(container_popup_buttons);

    CreateDavidMisson(scene);

    //CreateMissionRewardUI(scene);
}

function CreateMissionUI(
    scene,
    characterCode,
    characterName,
    itemCode,
    itemName,
    description,
    buttonName,
    quantity
) {
    let container_ui = scene.add.container(0, 0);
    container_popup.add(container_ui);

    container_ui.characterCode = characterCode;
    container_ui.characterName = characterName;
    container_ui.itemCode = itemCode;
    container_ui.itemName = itemName;
    container_ui.description = description;

    let bg = scene.add.image(0, 0, "home_first_missions_bg").setOrigin(0, 0);

    container_ui.add(bg);

    let frame_0 = scene.add
        .image(0, 0, "home_first_missions_frame_0")
        .setOrigin(0, 0);

    container_ui.add(frame_0);

    container_ui.activeFrame0 = function (boolValue) {
        frame_0.setVisible(boolValue);
    };

    if (characterCode) {
        let localData = centerDataPlayer.getPlayerById(characterCode);

        container_ui.spinePlayer = CreateSpineCharacter(
            scene,
            localData.spineUIKey
        );
        container_ui.add(container_ui.spinePlayer);
    } else {
        let bg_item = scene.add
            .image(314 + 451 / 2, 800 + 451 / 2, "home_first_missions_item_bg")
            .setOrigin(0.5, 0.5);

        container_ui.add(bg_item);

        let icon_item = scene.add
            .image(
                314 + 25 + 401 / 2,
                800 + 25 + 401 / 2,
                centerDataItem.getItemById(itemCode).imgKey
            )
            .setDisplaySize(401, 401)
            .setOrigin(0.5, 0.5);

        container_ui.add(icon_item);

        const text_quantity = scene.add
            .text(737, 1230, quantity, {
                fontFamily: "Russo One",
                fontSize: "48px",
                color: "#ffffff",
                align: "right",
                wordWrap: { width: 750, useAdvancedWrap: true },
                stroke: "#000000",
                strokeThickness: 10,
            })
            .setOrigin(1, 1);
        container_ui.add(text_quantity);
    }

    let bg_footer = scene.add
        .image(0, 1920, "home_first_missions_footer_bg")
        .setOrigin(0, 1);

    container_ui.add(bg_footer);

    let container_btn = scene.add.container(253 + 575 / 2, 1523 + 88 / 2);
    container_popup.add(container_btn);

    let container_btn_inner = scene.add.container(-575 / 2, -88 / 2);
    container_btn.add(container_btn_inner);

    let btn = scene.add
        .image(0, 0, "home_first_missions_btn")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_ui.btn = btn;

    container_btn_inner.add(btn);

    const text_btn_name = scene.add
        .text(575 / 2, 88 / 2, buttonName, {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0.5);
    container_btn_inner.add(text_btn_name);

    const text_description = scene.add
        .text(540, container_btn.y - 38 - 88 / 2, description, {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#BABABA",
            align: "center",
            wordWrap: { width: 750, useAdvancedWrap: true },
        })
        .setOrigin(0.5, 1);
    container_ui.add(text_description);

    const text_name = scene.add
        .text(540, text_description.y - text_description.height - 38, "Name", {
            fontFamily: "Russo One",
            fontSize: "64px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 1);
    container_ui.add(text_name);

    if (characterName) {
        text_name.setText(characterName);
    } else {
        text_name.setText(itemName);
    }

    return container_ui;
}

function CreateMissionRewardUI(scene) {
    let container_ui = scene.add.container(0, 0);
    container_popup.add(container_ui);

    let bg = scene.add.image(0, 0, "home_first_missions_bg").setOrigin(0, 0);

    container_ui.add(bg);

    let frame_0 = scene.add
        .image(0, 0, "home_first_missions_frame_0")
        .setOrigin(0, 0);

    container_ui.add(frame_0);

    let card_david = CreateCharacterCard(
        scene,
        "",
        "david",
        "David",
        "gunner",
        "c",
        1,
        1
    );
    card_david.setScale(275 / 444);
    card_david.setPosition(270, 860 + 275 / 2);
    container_ui.add(card_david);

    let card_henry = CreateCharacterCard(
        scene,
        "",
        "henry",
        "Henry",
        "sniper",
        "c",
        1,
        1
    );
    card_henry.setScale(275 / 444);
    card_henry.setPosition(540, 860 + 275 / 2);
    container_ui.add(card_henry);

    let card_marcus = CreateCharacterCard(
        scene,
        "",
        "marcus",
        "Marcus",
        "rocket",
        "c",
        1,
        1
    );
    card_marcus.setScale(275 / 444);
    card_marcus.setPosition(540 + 270, 860 + 275 / 2);
    container_ui.add(card_marcus);

    let container_chip = scene.add.container(311, 1202);
    container_popup.add(container_chip);

    let icon_chip = scene.add
        .image(0, 0, centerDataItem.getItemById("Chip").imgKey)
        .setDisplaySize(121, 121)
        .setOrigin(0, 0);

    container_chip.add(icon_chip);

    const text_chip = scene.add
        .text(198, 121 / 2, "x100000", {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#BABABA",
            align: "left",
        })
        .setOrigin(0, 0.5);
    container_chip.add(text_chip);

    let container_musk = scene.add.container(311, 1356);
    container_popup.add(container_musk);

    let icon_musk = scene.add
        .image(0, 0, centerDataItem.getItemById("Musk").imgKey)
        .setDisplaySize(121, 121)
        .setOrigin(0, 0);

    container_musk.add(icon_musk);

    const text_musk = scene.add
        .text(198, 121 / 2, "x10000", {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#BABABA",
            align: "left",
        })
        .setOrigin(0, 0.5);
    container_musk.add(text_musk);

    let bg_footer = scene.add
        .image(0, 1920, "home_first_missions_footer_bg")
        .setOrigin(0, 1);

    container_ui.add(bg_footer);

    let container_btn = scene.add.container(253 + 575 / 2, 1523 + 88 / 2);
    container_popup.add(container_btn);

    let container_btn_inner = scene.add.container(-575 / 2, -88 / 2);
    container_btn.add(container_btn_inner);

    let btn = scene.add
        .image(0, 0, "home_first_missions_btn")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", async function () {
            centerData.SetFirstMissionsDone(true);

            Destroy();
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_ui.btn = btn;

    container_btn_inner.add(btn);

    const text_btn_name = scene.add
        .text(575 / 2, 88 / 2, "Start", {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0.5);
    container_btn_inner.add(text_btn_name);

    return container_ui;
}

function CreateSpineCharacter(scene, spineUIKey) {
    let spawnedSpine = scene.add.spine(540, 1920, spineUIKey);

    playIdleAnimation(spawnedSpine);

    return spawnedSpine;
}

function CreateDavidMisson(scene) {
    let container_ui = CreateMissionUI(
        scene,
        "david",
        "David",
        null,
        null,
        "Get the hero",
        "Follow X"
    );

    // let container_ui = CreateCharacterUI(
    //     scene,
    //     null,
    //     null,
    //     "Chip",
    //     "",
    //     "Chips are very important points used to upgrade Heroes and exchange MSCI.",
    //     "Follow X",
    //     100000
    // );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        let url = `https://x.com/msci2049`;

        if (await isTelegramMiniApp()) {
            window.open(url, "_blank");
        } else {
            window.open(url, "_blank");
        }

        scene.time.delayedCall(3000, () => {
            container_ui.destroy();

            CreateDavidMissonReward(scene);
        });
    });
}

function CreateDavidMissonReward(scene) {
    let container_ui = CreateMissionUI(
        scene,
        "david",
        "David",
        null,
        null,
        "Congratulations on your successful receipt.",
        "Next"
    );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        container_ui.destroy();

        CreateHenryMisson(scene);
    });
}

function CreateHenryMisson(scene) {
    let container_ui = CreateMissionUI(
        scene,
        "henry",
        "Henry",
        null,
        null,
        "Get the hero",
        "Join Telegram Chanel"
    );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        let url = `https://t.me/msciofficial2049`;

        if (await isTelegramMiniApp()) {
            window.open(url, "_blank");
        } else {
            window.open(url, "_blank");
        }

        scene.time.delayedCall(3000, () => {
            container_ui.destroy();

            CreateHenryMissonReward(scene);
        });
    });
}

function CreateHenryMissonReward(scene) {
    let container_ui = CreateMissionUI(
        scene,
        "henry",
        "Henry",
        null,
        null,
        "Congratulations on your successful receipt.",
        "Next"
    );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        container_ui.destroy();

        CreateMarcusMisson(scene);
    });
}

function CreateMarcusMisson(scene) {
    let container_ui = CreateMissionUI(
        scene,
        "marcus",
        "Marcus",
        null,
        null,
        "Get the hero",
        "Join Telegram Group"
    );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        let url = `https://t.me/mscicommunity`;

        if (await isTelegramMiniApp()) {
            window.open(url, "_blank");
        } else {
            window.open(url, "_blank");
        }

        scene.time.delayedCall(3000, () => {
            container_ui.destroy();

            CreateMarcusMissonReward(scene);
        });
    });
}

function CreateMarcusMissonReward(scene) {
    let container_ui = CreateMissionUI(
        scene,
        "marcus",
        "Marcus",
        null,
        null,
        "Congratulations on your successful receipt.",
        "Next"
    );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        container_ui.destroy();

        CreateChipMisson(scene);
    });
}

function CreateChipMisson(scene) {
    let container_ui = CreateMissionUI(
        scene,
        null,
        null,
        "Chip",
        "",
        "Chips are very important points used to upgrade Heroes and exchange MSCI.",
        "Subcribe Youtube",
        100000
    );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        let url = `https://www.youtube.com/@M-SCIOfficial`;

        if (await isTelegramMiniApp()) {
            window.open(url, "_blank");
        } else {
            window.open(url, "_blank");
        }

        scene.time.delayedCall(3000, () => {
            container_ui.destroy();

            CreateChipMissonReward(scene);
        });
    });
}

function CreateChipMissonReward(scene) {
    let container_ui = CreateMissionUI(
        scene,
        null,
        null,
        "Chip",
        "",
        "Congratulations you got 100,000 chips",
        "Next",
        100000
    );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        container_ui.destroy();

        CreateMuskMisson(scene);
    });
}

function CreateMuskMisson(scene) {
    let container_ui = CreateMissionUI(
        scene,
        null,
        null,
        "Musk",
        "",
        "M-Coin is the currency used to pay for items in the shop.",
        "Follow Tiktok",
        10000
    );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        let url = `https://www.tiktok.com/@msciofficial`;

        if (await isTelegramMiniApp()) {
            window.open(url, "_blank");
        } else {
            window.open(url, "_blank");
        }

        scene.time.delayedCall(3000, () => {
            container_ui.destroy();

            CreateMuskMissonReward(scene);
        });
    });
}

function CreateMuskMissonReward(scene) {
    let container_ui = CreateMissionUI(
        scene,
        null,
        null,
        "Musk",
        "",
        "Congratulations you got 10,000 M-Coin",
        "Next",
        10000
    );

    let isWaiting = false;

    container_ui.btn.on("pointerdown", async function () {
        if (isWaiting) return;
        isWaiting = true;

        container_ui.destroy();

        CreateMissionRewardUI(scene);
    });
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;
}

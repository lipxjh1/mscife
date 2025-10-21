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

let characterIds = [];

let extractedCharacterIds = [];

let text_chip = null;
let text_number = null;
let chipPerCharacter = 0;
let btn_extract_x10 = null;

export function CreateExtract(scene, _id) {
    let selectedCharacterId = _id;

    characterIds = [];

    extractedCharacterIds = [];

    let unlockedPlayer = centerData.getUnlockedPlayerById(selectedCharacterId);
    chipPerCharacter = unlockedPlayer.properties.chipWhenDecay;

    // Giả sử playerDict là một object chứa các object
    let playerDict = centerData.GetMergedCharacters();

    // Chuyển đổi object thành mảng bằng Object.values()
    let playerArray = Object.values(playerDict);

    playerArray.forEach((obj) => {
        if (
            centerData.selectedPlayerArr.includes(obj._id) == false &&
            obj.code == unlockedPlayer.code &&
            obj.star == unlockedPlayer.star &&
            obj.level == unlockedPlayer.level
        ) {
            characterIds.push(obj._id);
        }
    });

    Destroy(scene);

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const lock_bg = scene.add
        .image(540, 960, "home_character_extract_bg")
        .setOrigin(0.5, 0.5)
        .setInteractive();
    container_main.add(lock_bg);

    const chip_icon = scene.add
        .image(905, 788, centerDataItem.getItemById("Chip").imgKey)
        .setDisplaySize(128, 128)
        .setOrigin(0.5, 0.5);
    container_main.add(chip_icon);

    text_chip = scene.add
        .text(999, 893, "x" + unlockedPlayer.properties.chipWhenDecay, {
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
                "Are you sure you want to extract this character ?"
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

    const text_1 = scene.add
        .text(
            540,
            1149,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "This process will destroy the character and cannot be undone."
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_1);

    const btn_extract = CreateButton(
        scene,
        container_main,
        191 + 348 / 2,
        1246 + 94 / 2,
        "home_character_extract_btn_extract",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
            "Extract"
        ) + " x1"
    );
    btn_extract.button.on("pointerdown", (pointer) => {
        if (characterIds.length > 0) {
            // Phân rã 1 nhân vật
            let selectedCharacterIds = [characterIds[0]];

            RequestToExtract(scene, selectedCharacterIds, chipPerCharacter);
        }
    });

    // Xác định số lượng nhân vật có thể phân rã (tối đa 10)
    const maxExtractCount = Math.min(10, characterIds.length);
    const extractX10ButtonText =
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
            "Extract"
        ) +
        " x" +
        maxExtractCount;

    btn_extract_x10 = CreateButton(
        scene,
        container_main,
        577 + 348 / 2,
        1246 + 94 / 2,
        "home_character_extract_btn_extract",
        extractX10ButtonText
    );
    btn_extract_x10.button.on("pointerdown", (pointer) => {
        if (characterIds.length > 0) {
            // Phân rã nhiều nhân vật (tối đa 10)
            let countToExtract = Math.min(10, characterIds.length);
            let selectedCharacterIds = characterIds.slice(0, countToExtract);

            RequestToExtract(
                scene,
                selectedCharacterIds,
                chipPerCharacter * countToExtract
            );
        }
    });

    const btn_cancel = CreateButton(
        scene,
        container_main,
        540,
        1593 + 94 / 2,
        "home_character_extract_btn_cancel",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
            "Cancel"
        )
    );
    btn_cancel.button.on("pointerdown", (pointer) => {
        if (extractedCharacterIds.length > 0) {
            CloseAndUpdateInventory(scene);
        }

        Close(scene);
    });

    let container_card = CreateCharacterCard(
        scene,
        selectedCharacterId,
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

    text_number = scene.add
        .text(382, 620, "x" + characterIds.length, {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 10,
            align: "right",
        })
        .setOrigin(1, 1);

    container_main.add(text_number);

    // Cập nhật text_chip để hiển thị số chip nhận được cho 1 nhân vật
    if (text_chip) {
        text_chip.setText("x" + chipPerCharacter);
    }

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

    btn_container.text = scene.add
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

    btn_inner_container.add(btn_container.text);

    return btn_container;
}

function RequestToExtract(scene, _ids, chipWhenDecay) {
    CreateLoadingPopup();

    centerData.RequestCharactersMultiExtract(
        _ids,
        (result) => {
            HideLoadingPopup();

            let removeCharacterIds = [];
            for (let i = 0; i < result.data.results.length; i++) {
                let _id = result.data.results[i].characterId;

                removeCharacterIds.push(_id);
                extractedCharacterIds.push(_id);
            }

            let newArr = characterIds.filter(
                (item) => !removeCharacterIds.includes(item)
            );

            characterIds = newArr;

            //console.log("removeCharacterIds: ", removeCharacterIds);

            //console.log("characterIds after extract: ", characterIds);

            // Cập nhật text_number hiển thị số lượng nhân vật còn lại sau khi phân rã
            if (text_number) {
                text_number.setText("x" + characterIds.length);
            }

            // Cập nhật lại text cho nút phân rã x10
            if (btn_extract_x10) {
                const newMaxExtractCount = Math.min(10, characterIds.length);
                const newButtonText =
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                        "Extract"
                    ) +
                    " x" +
                    newMaxExtractCount;

                // Tìm và cập nhật text của button
                btn_extract_x10.text.setText(newButtonText);
            }

            if (characterIds.length == 0) {
                CloseAndUpdateInventory(scene);
            }

            CreateItemRewardPopup(scene, "noId", "Chip", "Chip", chipWhenDecay);
        },
        (err) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, "Extract failed\n" + err.message);
        }
    );
}

// Hàm CreateInputField đã được xóa vì không cần nhập số lượng nữa

function CloseAndUpdateInventory(scene) {
    CloseCardOptions(scene);

    UpdateCharactersInfo(
        scene,
        () => {},
        () => {}
    );

    Close(scene);
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


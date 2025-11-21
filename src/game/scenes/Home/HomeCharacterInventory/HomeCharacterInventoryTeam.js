import centerData from "../../../Data/CenterData.js";

import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import { CreateCharacterCard, GetRoleIcon } from "../../Share/CharacterCard.js";

import { SpawnLobbyCharacter } from "../HomeLobby.js";

import { container_main } from "./HomeCharacterInventory.js";

import { CreateUpgrade } from "./HomeCharacterInventoryUpgrade.js";

import { CreateExtract } from "./HomeCharacterInventoryExtract.js";
import FaceContainer from "phaser3-rex-plugins/plugins/gameobjects/mesh/perspective/utils/FaceContainer.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { HideCurrencyBar, OptionsCurrencyBar } from "../HomeTopBarPlayer.js";
import { CreateSell } from "./HomeCharacterInventorySell.js";
import { CreateEnvolved } from "./HomeCharacterInventoryEnvolved.js";
import { playIdleAnimation } from "../../../utils/spineUtils.js";

let container_main_team = null;

let container_popup = null;
let container_popup_close_position = { x: 0, y: 4000 };
let container_popup_open_position = { x: 0, y: 0 };

let container_selected_character = null;

let container_item_list = null;

let container_filter = null;

let container_chip_rates = null;

let container_selected_left = null;
let container_selected_mid = null;
let container_selected_right = null;

let container_card_options = null;

let isOpen = false;

let filter_ranks = [];
let filter_stars = [];

let selectedCardArr = [];

let isCardOptionsOpen = false;

let groupedUnlockedPlayers = {};

export function CreateCharacterTeam(scene) {
    Destroy(scene);

    container_main_team = scene.add.container(0, 0);
    container_main_team.setDepth(100);

    const lock_bg = scene.add
        .image(540, 960, "home_character_team_bg")
        .setOrigin(0.5, 0.5)
        .setInteractive();
    container_main_team.add(lock_bg);

    container_popup = scene.add.container(
        container_popup_open_position.x,
        container_popup_open_position.y
    );
    container_main_team.add(container_popup);

    container_selected_character = scene.add.container(0, 0);
    container_main_team.add(container_selected_character);

    container_filter = scene.add.container(0, 0);
    container_main_team.add(container_filter);

    CreateFilterButtons(scene);

    UpdateCharactersInfo(scene);

    Open(scene);
}

// Hàm để gộp nhóm các object theo code, level, và star
function groupUnlockedPlayersByCodeLevelStar() {
    let grouped = {};

    // Giả sử playerDict là một object chứa các object
    let playerDict = centerData.GetMergedCharacters();

    // Chuyển đổi object thành mảng bằng Object.values()
    let playerArray = Object.values(playerDict);

    playerArray.forEach((obj) => {
        let key = `${obj.code}_${obj.level}_${obj.star}`;

        // Khởi tạo grouped[key] nếu nó chưa tồn tại
        if (!grouped[key]) {
            grouped[key] = {};
        }

        // Thêm object vào nhóm theo _id
        grouped[key][obj._id] = obj;
    });

    return grouped;
}

export function UpdateCharactersInfo(scene, onSuccess, onError) {
    CreateLoadingPopup();

    centerData.RequestMergedCharacters(
        () => {
            HideLoadingPopup();

            groupedUnlockedPlayers = groupUnlockedPlayersByCodeLevelStar();

            //console.log("groupedUnlockedPlayers:", groupedUnlockedPlayers);

            LoadCharacterUICard(scene, () => {
                CreateItemList(scene);
            });

            CreateSelectedCharacter(scene);

            if (onSuccess && typeof onSuccess === "function") {
                onSuccess();
            }
        },
        () => {
            HideLoadingPopup();

            if (onError && typeof onError === "function") {
                onError();

                CreateAlertPopup(
                    scene,
                    "Load characters failed\n" + onError.message
                );
            }
        }
    );
}

function LoadCharacterUICard(scene, onSuccess) {
    let arr_ids = centerData.getUnlockedPlayerLocalIds();

    let tempArr = [];

    for (let i = 0; i < arr_ids.length; i++) {
        let pData = centerDataPlayer.getPlayerById(arr_ids[i]);

        if (pData !== null) {
            tempArr.push(arr_ids[i]);
        }
    }
    arr_ids = tempArr;

    //console.log("arr_ids: ", arr_ids);

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        arr_ids,
        () => {
            onSuccess();

            //console.log("lazyLoadCharacterUICard load done");
        }
    );
}

export function CloseCardOptions(scene) {
    isCardOptionsOpen = false;

    if (container_card_options != null) {
        HideCurrencyBar(scene);

        container_card_options.destroy();
    }
}

function CheckSelectedCards() {
    let activeCells = [];

    for (let i = 0; i < container_item_list.gridTable.items.length; i++) {
        const cellContainer = container_item_list.gridTable.getCellContainer(i);
        if (cellContainer) {
            activeCells.push(cellContainer);

            // Lấy card từ container (đã lưu trong characterCard)
            const card = cellContainer.characterCard;

            if (card && cellContainer.itemData) {
                const unlockedPlayerId =
                    cellContainer.itemData.unlockedPlayer._id;
                if (centerData.selectedPlayerArr.includes(unlockedPlayerId)) {
                    card.setSelected();
                } else {
                    card.setUnselected();
                }
            }
        }
    }
}

export function IsCardOptionsOpen() {
    return isCardOptionsOpen;
}

export function CreateCardOptions(scene, _id) {
    //console.log("CreateCardOptions");

    CloseCardOptions(scene);

    isCardOptionsOpen = true;

    OptionsCurrencyBar(scene);

    let unlockedPlayer = centerData.getUnlockedPlayerById(_id);

    //console.log("CreateCardOptions unlockedPlayer:", unlockedPlayer);

    let pData = centerDataPlayer.getPlayerById(unlockedPlayer.code);

    let item = {
        unlockedPlayer: unlockedPlayer,
        playerData: pData,
    };

    //console.log("CreateCardOptions item: ", item);

    container_card_options = scene.add.container(0, 0);
    container_main.add(container_card_options);

    let lock_bg = scene.add
        .rectangle(0, 0, 1080, 1920, 0x000000)
        .setOrigin(0, 0)
        .setAlpha(0.01)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", (pointer) => {
            CloseCardOptions(scene);
        });

    container_card_options.add(lock_bg);

    let black_bg = scene.add
        .rectangle(540, 1920 - 979 / 2, 1080, 979, 0x000000)
        .setAlpha(0.8)
        .setInteractive();

    container_card_options.add(black_bg);

    const info_bg = scene.rexUI.add.roundRectangle(
        381 + 360 / 2,
        1252 + 470 / 2,
        360,
        470,
        12,
        0x707070,
        0.8
    );
    container_card_options.add(info_bg);

    const container_card = CreateCharacterCard(
        scene,
        item.unlockedPlayer._id,
        item.unlockedPlayer.code,
        item.unlockedPlayer.name,
        item.unlockedPlayer.role,
        item.unlockedPlayer.rank,
        item.unlockedPlayer.level,
        item.unlockedPlayer.star
    );

    container_card.setPosition(38 + 319 / 2, 1252 + 444 / 2);

    container_card_options.add(container_card);

    const text_damage = scene.add
        .text(
            405,
            1276,
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
    container_card_options.add(text_damage);

    const text_current_damage = scene.add
        .text(405, 1322, item.unlockedPlayer.properties.attachDamage, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#D6D6D6",
            align: "left",
        })
        .setOrigin(0, 0);
    container_card_options.add(text_current_damage);

    if (
        item.unlockedPlayer.nextLevelProperties &&
        item.unlockedPlayer.nextLevelProperties.attachDamage
    ) {
        const up_icon = scene.add
            .image(
                405 + text_current_damage.width + 10,
                1322 + 22 / 4,
                "home_character_option_up"
            )
            .setOrigin(0, 0);
        container_card_options.add(up_icon);

        const text_next_damage = scene.add
            .text(
                up_icon.x + up_icon.width + 10,
                1322,
                item.unlockedPlayer.nextLevelProperties.attachDamage,
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "36px",
                    color: "#D6D6D6",
                    align: "left",
                }
            )
            .setOrigin(0, 0);
        container_card_options.add(text_next_damage);
    }

    const text_delay = scene.add
        .text(
            405,
            1382,
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
    container_card_options.add(text_delay);

    const text_current_delay = scene.add
        .text(405, 1428, item.unlockedPlayer.properties.attackDelay, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#D6D6D6",
            align: "left",
        })
        .setOrigin(0, 0);
    container_card_options.add(text_current_delay);

    if (
        item.unlockedPlayer.nextLevelProperties &&
        item.unlockedPlayer.nextLevelProperties.attackDelay
    ) {
        const up_icon = scene.add
            .image(
                405 + text_current_delay.width + 10,
                1428 + 22 / 4,
                "home_character_option_up"
            )
            .setOrigin(0, 0);
        container_card_options.add(up_icon);

        const text_next_delay = scene.add
            .text(
                up_icon.x + up_icon.width + 10,
                1428,
                item.unlockedPlayer.nextLevelProperties.attackDelay,
                {
                    fontFamily: "Russo One",
                    fontSize: "36px",
                    color: "#D6D6D6",
                    align: "left",
                }
            )
            .setOrigin(0, 0);
        container_card_options.add(text_next_delay);
    }

    const btn_equip = CreateOptionsButton0(
        scene,
        764 + 286 / 2,
        1259 + 15 + 84 / 2,
        "home_character_option_btn_0",
        "Equip"
    );

    btn_equip.button.on("pointerdown", function () {
        CreateLoadingPopup();

        centerData.addToSelectedPlayer(
            item.unlockedPlayer._id,
            () => {
                HideLoadingPopup();

                CheckSelectedCards();

                CreateCardOptions(scene, item.unlockedPlayer._id);

                CreateSelectedCharacter(scene);
            },
            (error) => {
                HideLoadingPopup();

                CreateAlertPopup(scene, "Equip failed\n" + error.message);
            }
        );
    });

    const btn_unequip = CreateOptionsButton0(
        scene,
        764 + 286 / 2,
        1259 + 15 + 84 / 2,
        "home_character_option_btn_0_red",
        "Unequip"
    );

    btn_unequip.button.on("pointerdown", function () {
        CreateLoadingPopup();

        centerData.removeFromSelectedPlayer(
            item.unlockedPlayer._id,
            () => {
                HideLoadingPopup();

                CheckSelectedCards();

                CreateCardOptions(scene, item.unlockedPlayer._id);

                CreateSelectedCharacter(scene);
            },
            (error) => {
                HideLoadingPopup();

                CreateAlertPopup(scene, "Unequip failed\n" + error.message);
            }
        );
    });

    if (item.unlockedPlayer.rank == centerDataPlayer.RANK_KEY.s.KEY) {
        const btn_sell = CreateOptionsButton0(
            scene,
            764 + 286 / 2,
            1377 + 15 + 84 / 2,
            "home_character_option_btn_0",
            "Sell"
        );

        btn_sell.button.on("pointerdown", function () {
            if (
                centerData.selectedPlayerArr.includes(item.unlockedPlayer._id)
            ) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                        "Unequip to sell"
                    )
                );
            } else {
                CreateSell(scene, item.unlockedPlayer._id);
            }
        });
    } else {
        const btn_extract = CreateOptionsButton0(
            scene,
            764 + 286 / 2,
            1377 + 15 + 84 / 2,
            "home_character_option_btn_0",
            "Extract"
        );

        btn_extract.button.on("pointerdown", function () {
            if (
                centerData.selectedPlayerArr.includes(item.unlockedPlayer._id)
            ) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                        "Unequip to extract"
                    )
                );
            } else {
                CreateExtract(scene, item.unlockedPlayer._id);
            }
        });
    }

    let isMint = false;

    if (
        item.unlockedPlayer.mintedAddress &&
        item.unlockedPlayer.mintedAddress !== ""
    ) {
        isMint = true;
    }

    if (isMint == false) {
        const btn_mint = CreateOptionsButton0(
            scene,
            764 + 286 / 2,
            1495 + 15 + 84 / 2,
            "home_character_option_btn_0",
            "Mint"
        );

        btn_mint.button.on("pointerdown", function () {
            if (
                centerData.GetWalletAddress() == null ||
                centerData.GetWalletAddress() === ""
            ) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                        "Wallet is not connected"
                    )
                );
            } else {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                        "Coming soon..."
                    )
                );

                // CreateAlertPopup(
                //     scene,
                //     "Do you want to mint?",
                //     () => {
                //         //console.log("Yes to mint");

                //         CreateLoadingPopup();

                //         centerData.RequestMintNFTCharacter(
                //             item.unlockedPlayer._id,
                //             () => {
                //                 btn_mint.setVisible(false);

                //                 HideLoadingPopup();

                //                 CreateAlertPopup(
                //                     scene,
                //                     `Mint success:\n${item.unlockedPlayer._id}`,
                //                     null,
                //                     null
                //                 );

                //                 // console.log(
                //                 //     "Mint success:",
                //                 //     item.unlockedPlayer._id
                //                 // );

                //                 UpdateCharactersInfo(scene);
                //             },
                //             (error) => {
                //                 HideLoadingPopup();

                //                 btn_mint.setVisible(true);

                //                 CreateAlertPopup(
                //                     scene,
                //                     `Mint failed\n${error}`,
                //                     null,
                //                     null
                //                 );

                //                 //console.log("Mint failed");
                //             }
                //         );
                //     },
                //     null
                // );
            }
        });
    }

    const btn_cancel = CreateOptionsButton0(
        scene,
        764 + 286 / 2,
        1613 + 15 + 84 / 2,
        "home_character_option_btn_0",
        "Cancel"
    );

    btn_cancel.button.on("pointerdown", function () {
        CloseCardOptions(scene);
    });

    if (centerData.isSelectedPlayer(item.unlockedPlayer._id)) {
        btn_equip.setVisible(false);
        btn_unequip.setVisible(true);
    } else {
        btn_equip.setVisible(true);
        btn_unequip.setVisible(false);
    }

    if (item.unlockedPlayer.level < 10) {
        const btn_level_up = CreateOptionsButton1(
            scene,
            405 + 312 / 2,
            1495 + 15 + 84 / 2,
            "home_character_option_btn_1",
            "Level up"
        );

        btn_level_up.button.on("pointerdown", function () {
            UpLevel(scene, item.unlockedPlayer);
        });
    }

    if (
        item.unlockedPlayer.star < 4 &&
        item.unlockedPlayer.rank != centerDataPlayer.RANK_KEY.sc.KEY &&
        item.unlockedPlayer.rank != centerDataPlayer.RANK_KEY.sb.KEY &&
        item.unlockedPlayer.rank != centerDataPlayer.RANK_KEY.sa.KEY
    ) {
        const btn_upgrade = CreateOptionsButton1(
            scene,
            405 + 312 / 2,
            1624 + 84 / 2,
            "home_character_option_btn_1",
            "Upgrade"
        );

        btn_upgrade.button.on("pointerdown", function () {
            if (
                centerData.selectedPlayerArr.includes(item.unlockedPlayer._id)
            ) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                        "Unequip to upgrade"
                    )
                );
            } else if (item.unlockedPlayer.level < 10) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                        "The character must reach level 10 to upgrade"
                    )
                );
            } else {
                CreateUpgrade(scene, item.unlockedPlayer._id);
            }
        });
    }

    if (
        item.unlockedPlayer.envolvedProperties != null &&
        item.unlockedPlayer.rank != centerDataPlayer.RANK_KEY.s.KEY &&
        item.unlockedPlayer.rank != centerDataPlayer.RANK_KEY.sc.KEY &&
        item.unlockedPlayer.rank != centerDataPlayer.RANK_KEY.sb.KEY &&
        item.unlockedPlayer.rank != centerDataPlayer.RANK_KEY.sa.KEY &&
        item.unlockedPlayer.star == 4 &&
        item.unlockedPlayer.level == 10
    ) {
        let evolPdata = centerDataPlayer.getPlayerById(
            item.unlockedPlayer.envolvedProperties.code
        );

        if (evolPdata != null) {
            const btn_envolved = CreateOptionsButton1(
                scene,
                405 + 312 / 2,
                1624 + 84 / 2,
                "home_character_option_btn_1",
                "Evolve"
            );

            btn_envolved.button.on("pointerdown", function () {
                if (
                    centerData.selectedPlayerArr.includes(
                        item.unlockedPlayer._id
                    )
                ) {
                    CreateAlertPopup(
                        scene,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                            "Unequip to evolve"
                        )
                    );
                } else {
                    CreateEnvolved(scene, item.unlockedPlayer._id);
                }
            });
        }
    }
}

function CreateOptionsButton0(scene, x, y, imageKey, buttonName) {
    let btnWidth = 286;
    let btnHeight = 84;

    const btn_container = scene.add.container(x, y);
    container_card_options.add(btn_container);

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

function CreateOptionsButton1(scene, x, y, imageKey, buttonName) {
    let btnWidth = 320;
    let btnHeight = 84;

    const btn_container = scene.add.container(x, y);
    container_card_options.add(btn_container);

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

function UpLevel(scene, unlockedPlayer) {
    if (
        centerData.userInfo.Chip <
        unlockedPlayer.nextLevelProperties.chipToUpgrade
    ) {
        CreateAlertPopup(
            scene,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                "Not enough chip"
            )
        );

        return;
    }

    CreateAlertPopup(
        scene,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
            `Up level with {i} Chip`,
            [unlockedPlayer.nextLevelProperties.chipToUpgrade]
        ),
        () => {
            CreateLoadingPopup();

            centerData.RequestCharactersUpLevel(
                unlockedPlayer._id,
                () => {
                    CreateAlertPopup(
                        scene,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                            "Up level success"
                        )
                    );

                    // Wait for user info to update before refreshing UI
                    centerData.RequestUserInfo(() => {
                        UpdateCharactersInfo(scene, () => {
                            // Force refresh character cards with updated data
                            if (container_item_list && container_item_list.gridTable) {
                                container_item_list.gridTable.setItems(
                                    container_item_list.gridTable.items
                                );
                                container_item_list.gridTable.refresh();
                            }

                            CreateCardOptions(scene, unlockedPlayer._id);
                        });
                    });

                    HideLoadingPopup();
                },
                (error) => {
                    CreateAlertPopup(
                        scene,
                        "Up level failed\n" + error.message
                    );

                    HideLoadingPopup();
                }
            );
        },
        () => {}
    );
}

function CreateSelectedCharacter(scene) {
    if (container_selected_mid) {
        container_selected_mid.destroy();
    }
    if (container_selected_left) {
        container_selected_left.destroy();
    }
    if (container_selected_right) {
        container_selected_right.destroy();
    }

    let selectedGunner = null;
    let selectedSniper = null;
    let selectedRocket = null;

    let arrIds = [];

    for (let i = 0; i < centerData.selectedPlayerArr.length; i++) {
        let unlockedPlayer = centerData.getUnlockedPlayerById(
            centerData.selectedPlayerArr[i]
        );
        let pData = centerDataPlayer.getPlayerById(unlockedPlayer.code);

        //console.log(`pData = ${i} `, pData);
        if (pData !== null) {
            if (unlockedPlayer.role === "gunner") {
                selectedGunner = {
                    unlockedPlayer: unlockedPlayer,
                    playerData: pData,
                };

                arrIds.push(unlockedPlayer.code);
            } else if (unlockedPlayer.role === "sniper") {
                selectedSniper = {
                    unlockedPlayer: unlockedPlayer,
                    playerData: pData,
                };

                arrIds.push(unlockedPlayer.code);
            } else if (unlockedPlayer.role === "rocket") {
                selectedRocket = {
                    unlockedPlayer: unlockedPlayer,
                    playerData: pData,
                };

                arrIds.push(unlockedPlayer.code);
            }
        }
    }

    AssetPlayerLoadingManager.getInstance().init(scene);

    CreateLoadingPopup();

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterSpineUI(
        arrIds,
        () => {
            HideLoadingPopup();

            CreateSpine(scene);
        }
    );

    function CreateSpine(scene) {
        if (selectedRocket) {
            container_selected_right = scene.add.container(0, 0);
            container_selected_character.add(container_selected_right);

            let player_spine = CreateSpineCharacter(
                scene,
                selectedRocket.playerData.spineUIKey
            );
            container_selected_right.add(player_spine);
            container_selected_right.player_spine = player_spine;

            player_spine.skeleton.setToSetupPose();

            player_spine.setPosition(810 + 50, 1920 - 100);
            player_spine.setScale(1);
        }

        if (selectedSniper) {
            container_selected_mid = scene.add.container(0, 0);
            container_selected_character.add(container_selected_mid);

            let player_spine = CreateSpineCharacter(
                scene,
                selectedSniper.playerData.spineUIKey
            );
            container_selected_mid.add(player_spine);
            container_selected_mid.player_spine = player_spine;

            player_spine.skeleton.setToSetupPose();

            player_spine.setPosition(540, 1920 - 100);
            player_spine.setScale(1);
        }

        if (selectedGunner) {
            container_selected_left = scene.add.container(0, 0);
            container_selected_character.add(container_selected_left);

            let player_spine = CreateSpineCharacter(
                scene,
                selectedGunner.playerData.spineUIKey
            );
            container_selected_left.add(player_spine);
            container_selected_left.player_spine = player_spine;

            player_spine.skeleton.setToSetupPose();

            player_spine.setPosition(270 - 100, 1920 - 100);
            player_spine.setScale(1);
        }

        // const maskShape = scene.add.graphics();
        // maskShape.fillStyle(0xffffff);
        // maskShape.fillRect(540, 959 + 961 / 2, 1080, 961);
        // maskShape.setVisible(false);

        const maskShape = scene.add
            .rectangle(540, 0 + 939 / 2, 1080, 939, 0x000000)
            .setVisible(false);

        container_selected_character.add(maskShape);

        const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);

        container_selected_character.setMask(mask);
        container_selected_character.maskShape = maskShape;

        CreateCharacterChipRate(
            scene,
            selectedGunner,
            selectedSniper,
            selectedRocket
        );
    }
}

function CreateSpineCharacter(scene, spineUIKey) {
    let spawnedSpine = scene.add.spine(540, 1920, spineUIKey);

    playIdleAnimation(spawnedSpine);

    return spawnedSpine;
}

function CreateCharacterChipRate(
    scene,
    selectedGunner,
    selectedSniper,
    selectedRocket
) {
    if (container_chip_rates) {
        container_chip_rates.destroy();
    }

    centerData.RequestCharacterChipRates((result) => {
        container_chip_rates = scene.add.container(0, 0);
        container_filter.add(container_chip_rates);

        if (selectedGunner) {
            let chipGunner = getChipPerSecond(
                result.data,
                selectedGunner.unlockedPlayer.rank,
                selectedGunner.unlockedPlayer.star
            );

            const text_gunner = scene.add
                .text(170, 720, "Chip/s " + chipGunner, {
                    fontFamily: "Russo One",
                    fontSize: "36px",
                    color: "#ffffff",
                    align: "center",
                    stroke: "#000000",
                    strokeThickness: 5,
                })
                .setOrigin(0.5, 1);
            container_chip_rates.add(text_gunner);
        }

        if (selectedSniper) {
            let chipSniper = getChipPerSecond(
                result.data,
                selectedSniper.unlockedPlayer.rank,
                selectedSniper.unlockedPlayer.star
            );

            const text_sniper = scene.add
                .text(550, 720, "Chip/s " + chipSniper, {
                    fontFamily: "Russo One",
                    fontSize: "36px",
                    color: "#ffffff",
                    align: "center",
                    stroke: "#000000",
                    strokeThickness: 5,
                })
                .setOrigin(0.5, 1);
            container_chip_rates.add(text_sniper);
        }

        if (selectedRocket) {
            let chipRocket = getChipPerSecond(
                result.data,
                selectedRocket.unlockedPlayer.rank,
                selectedRocket.unlockedPlayer.star
            );

            const text_rocket = scene.add
                .text(930, 720, "Chip/s " + chipRocket, {
                    fontFamily: "Russo One",
                    fontSize: "36px",
                    color: "#ffffff",
                    align: "center",
                    stroke: "#000000",
                    strokeThickness: 5,
                })
                .setOrigin(0.5, 1);
            container_chip_rates.add(text_rocket);
        }
    });
}

function getChipPerSecond(data, rank, star) {
    // Tìm đối tượng rank phù hợp
    const rankData = data.find((item) => item.rank.toLowerCase() === rank);

    if (!rankData) {
        return 0;
    }

    // Tìm đối tượng star phù hợp trong rates của rank đã chọn
    const rateData = rankData.rates.find((rate) => rate.star === star);

    if (!rateData) {
        return 0;
    }

    // Trả về giá trị chipPerSecond
    return rateData.chipPerSecond;
}

function CreateFilterButtons(scene) {
    let filter_bg = scene.add
        .image(0, 0, "home_character_team_filter_bg")
        .setOrigin(0, 0);

    container_filter.add(filter_bg);

    filter_ranks = [
        centerDataPlayer.RANK_KEY.c.KEY,
        centerDataPlayer.RANK_KEY.b.KEY,
        centerDataPlayer.RANK_KEY.a.KEY,
        centerDataPlayer.RANK_KEY.s.KEY,
        centerDataPlayer.RANK_KEY.sc.KEY,
        centerDataPlayer.RANK_KEY.sb.KEY,
        centerDataPlayer.RANK_KEY.sa.KEY,
    ];
    filter_stars = [1, 2, 3, 4];

    //c
    {
        const btn = scene.add
            .image(65 + 73 / 2, 835 + 88 / 2, "home_character_filter_btn_c")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.c.KEY
                );
            });
        container_filter.add(btn);

        const btn_deactive = scene.add
            .image(65 + 73 / 2, 835 + 88 / 2, "home_character_filter_btn_c_d")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.c.KEY
                );
            });
        container_filter.add(btn_deactive);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    }

    //b
    {
        const btn = scene.add
            .image(146 + 73 / 2, 835 + 88 / 2, "home_character_filter_btn_b")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.b.KEY
                );
            });
        container_filter.add(btn);

        const btn_deactive = scene.add
            .image(146 + 73 / 2, 835 + 88 / 2, "home_character_filter_btn_b_d")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.b.KEY
                );
            });
        container_filter.add(btn_deactive);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    }

    //a
    {
        const btn = scene.add
            .image(231 + 73 / 2, 835 + 88 / 2, "home_character_filter_btn_a")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.a.KEY
                );
            });
        container_filter.add(btn);

        const btn_deactive = scene.add
            .image(231 + 73 / 2, 835 + 88 / 2, "home_character_filter_btn_a_d")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.a.KEY
                );
            });
        container_filter.add(btn_deactive);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    }

    //s
    {
        const btn = scene.add
            .image(316 + 73 / 2, 835 + 88 / 2, "home_character_filter_btn_s")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.s.KEY
                );

                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.sc.KEY
                );

                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.sb.KEY
                );

                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.sa.KEY
                );
            });
        container_filter.add(btn);

        const btn_deactive = scene.add
            .image(316 + 73 / 2, 835 + 88 / 2, "home_character_filter_btn_s_d")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.s.KEY
                );

                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.sc.KEY
                );

                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.sb.KEY
                );

                SetFilterRank(
                    scene,
                    btn,
                    btn_deactive,
                    centerDataPlayer.RANK_KEY.sa.KEY
                );
            });
        container_filter.add(btn_deactive);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    }

    //star 1
    {
        const btn = scene.add
            .image(
                521 + 85 / 2,
                835 + 88 / 2,
                "home_character_filter_btn_star_1"
            )
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterStar(scene, btn, btn_deactive, 1);
            });
        container_filter.add(btn);

        const btn_deactive = scene.add
            .image(
                521 + 85 / 2,
                835 + 88 / 2,
                "home_character_filter_btn_star_1_d"
            )
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterStar(scene, btn, btn_deactive, 1);
            });
        container_filter.add(btn_deactive);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    }

    //star 2
    {
        const btn = scene.add
            .image(
                615 + 111 / 2,
                835 + 88 / 2,
                "home_character_filter_btn_star_2"
            )
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterStar(scene, btn, btn_deactive, 2);
            });
        container_filter.add(btn);

        const btn_deactive = scene.add
            .image(
                615 + 111 / 2,
                835 + 88 / 2,
                "home_character_filter_btn_star_2_d"
            )
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterStar(scene, btn, btn_deactive, 2);
            });
        container_filter.add(btn_deactive);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    }

    //star 3
    {
        const btn = scene.add
            .image(
                734 + 134 / 2,
                835 + 88 / 2,
                "home_character_filter_btn_star_3"
            )
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterStar(scene, btn, btn_deactive, 3);
            });
        container_filter.add(btn);

        const btn_deactive = scene.add
            .image(
                734 + 134 / 2,
                835 + 88 / 2,
                "home_character_filter_btn_star_3_d"
            )
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterStar(scene, btn, btn_deactive, 3);
            });
        container_filter.add(btn_deactive);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    }

    //star 4
    {
        const btn = scene.add
            .image(
                879 + 162 / 2,
                835 + 88 / 2,
                "home_character_filter_btn_star_4"
            )
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterStar(scene, btn, btn_deactive, 4);
            });
        container_filter.add(btn);

        const btn_deactive = scene.add
            .image(
                879 + 162 / 2,
                835 + 88 / 2,
                "home_character_filter_btn_star_4_d"
            )
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                SetFilterStar(scene, btn, btn_deactive, 4);
            });
        container_filter.add(btn_deactive);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    }
}

function SetFilterRank(scene, btn, btn_deactive, key) {
    if (filter_ranks.includes(key) == false) {
        filter_ranks.push(key);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    } else {
        filter_ranks = filter_ranks.filter((rank) => rank !== key);

        SetFilterButtonActive(scene, btn, btn_deactive, false);
    }

    CreateItemList(scene);
}

function SetFilterStar(scene, btn, btn_deactive, starNum) {
    if (filter_stars.includes(starNum) == false) {
        filter_stars.push(starNum);

        SetFilterButtonActive(scene, btn, btn_deactive, true);
    } else {
        filter_stars = filter_stars.filter((star) => star !== starNum);

        SetFilterButtonActive(scene, btn, btn_deactive, false);
    }

    CreateItemList(scene);
}

function SetFilterButtonActive(scene, btn, btn_deactive, boolVal) {
    if (boolVal == true) {
        btn.setVisible(true);
        btn_deactive.setVisible(false);
    } else {
        btn.setVisible(false);
        btn_deactive.setVisible(true);
    }
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    if (container_item_list != null) {
        container_item_list.destroy();
    }

    container_item_list = scene.add.container(0, 0);
    container_popup.add(container_item_list);

    selectedCardArr = [];

    let itemData = [];

    let selectedItemData = [];

    let unlockedItemData = [];

    let groupArray = Object.values(groupedUnlockedPlayers);

    for (let i = 0; i < groupArray.length; i++) {
        let group = groupArray[i];

        //console.log("group: ", group);

        let keys = Object.keys(group);

        //console.log("keys: ", keys);

        if (keys.length > 0) {
            let isSelected = false;

            for (let i = 0; i < centerData.selectedPlayerArr.length; i++) {
                if (keys.includes(centerData.selectedPlayerArr[i])) {
                    isSelected = true;

                    break;
                }
            }

            //console.log("group[keys[0]]: ", group[keys[0]]);

            let pData = centerDataPlayer.getPlayerById(group[keys[0]].code);

            if (pData !== null) {
                const newItem = {
                    keys: keys,
                    group: group,
                };

                if (isSelected) {
                    selectedItemData.push(newItem);
                } else {
                    unlockedItemData.push(newItem);
                }
            }
        }
    }

    // console.log("selectedItemData:", selectedItemData);

    // console.log("unlockedItemData:", unlockedItemData);

    itemData = [...selectedItemData, ...unlockedItemData];

    // console.log("itemData:", itemData);

    let filtered = itemData.filter(
        (item) =>
            filter_ranks.includes(item.group[item.keys[0]].rank) &&
            filter_stars.includes(item.group[item.keys[0]].star)
    );

    itemData = filtered;

    const scrollViewWidth = 1080;

    const scrollViewHeight = 961;

    const spaceWidth = 23;

    const spaceHeight = 30;

    const cellWidth = 319;
    const cellHeight = 444;

    const posX = 38 + scrollViewWidth / 2;

    const posY = 959 + scrollViewHeight / 2;

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
                reuseCellContainer: true, // Kích hoạt tái sử dụng cell container
            },

            mouseWheelScroller: {
                focus: false,
                speed: 1,
            },

            items: itemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = createCardContainer(scene);
                }

                // Cập nhật nội dung của card với dữ liệu item mới
                updateCardContent(cellContainer, scene, item);

                return cellContainer;
            },

            align: "center",

            space: {
                // left: 21,
                // right: 21,
                // top: 15,
                // bottom: 0,
                // column: 34,
                // row: 34,
            },
        })
        .layout();

    gridTable.on(
        "cell.click",
        function (cellContainer, cellIndex) {
            // Khi một cell được click, gọi hàm xử lý
            if (
                cellContainer &&
                cellContainer.itemData &&
                cellContainer.characterCard
            ) {
                CreateCardOptions(
                    scene,
                    cellContainer.itemData.unlockedPlayer._id
                );
            }
        },
        scene
    );

    // gridTable.on("cell.over", function (cellContainer, cellIndex) {
    //     // Hiệu ứng khi hover vào
    //     if (cellContainer && cellContainer.characterCard) {
    //         cellContainer.characterCard.each(function (child) {
    //             if (child.setTint) {
    //                 child.setTint(0x646464); // Màu tint bạn muốn áp dụng
    //             }
    //         });
    //     }
    // });

    // gridTable.on("cell.out", function (cellContainer, cellIndex) {
    //     // Bỏ hiệu ứng khi rời chuột
    //     if (cellContainer && cellContainer.characterCard) {
    //         cellContainer.characterCard.each(function (child) {
    //             if (child.clearTint) {
    //                 child.clearTint(); // Xóa tint
    //             }
    //         });
    //     }
    // });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    // const originRect = scene.add.rectangle(gridTable.x, gridTable.y, 50, 50, 0xffffff, 1).setOrigin(0.5, 0.5);
    // container_item_list.add(originRect);

    // Tạo mask để giới hạn vùng hiển thị
    const maskShape = scene.add
        .rectangle(540, 959 + 961 / 2, 1080, 961, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

// Tạo container cho card
function createCardContainer(scene) {
    // Thay vì sử dụng label, tạo container thông thường
    const container = scene.add.container(0, 0);
    container.setSize(319, 444); // Set kích thước rõ ràng
    return container;
}

// Cập nhật nội dung card
function updateCardContent(container, scene, item) {
    let width = 319;
    let height = 444;

    // Lưu trữ dữ liệu item
    container.itemData = item;

    // Xóa nội dung cũ nếu có
    while (container.list.length > 0) {
        container.list[0].destroy();
    }

    // Xác định unlockedPlayer
    item.unlockedPlayer = null;

    for (let i = 0; i < centerData.selectedPlayerArr.length; i++) {
        if (item.keys.includes(centerData.selectedPlayerArr[i])) {
            item.unlockedPlayer = item.group[centerData.selectedPlayerArr[i]];
            break;
        }
    }

    if (item.unlockedPlayer == null) {
        item.unlockedPlayer = item.group[item.keys[0]];
    }

    // Tạo character card
    const container_card = CreateCharacterCard(
        scene,
        item.unlockedPlayer._id,
        item.unlockedPlayer.code,
        item.unlockedPlayer.name,
        item.unlockedPlayer.role,
        item.unlockedPlayer.rank,
        item.unlockedPlayer.level,
        item.unlockedPlayer.star
    );

    // Thêm trực tiếp vào container thay vì setElement
    container.add(container_card);
    container_card.x = width / 2;
    container_card.y = height / 2;

    // Đánh dấu thẻ đã chọn nếu cần
    if (
        centerData.selectedPlayerArr.includes(item.unlockedPlayer._id) === true
    ) {
        container_card.setSelected();
        selectedCardArr.push(container_card);
    }

    // Hiển thị số lượng
    const text_count = scene.add
        .text(10, 10, "x" + item.keys.length, {
            fontFamily: "Russo One",
            fontSize: "60px",
            color: "#ffffff",
            align: "left",
            strokeThickness: 1,
            shadow: {
                offsetX: 2,
                offsetY: 4,
                color: "#000000",
                blur: 0,
                stroke: true,
                fill: true,
            },
        })
        .setOrigin(0, 0);

    container_card.container_card_inner.add(text_count);

    // const debugRect = scene.add.rectangle(0, 0, width, height, 0x00ff00, 0).setOrigin(0, 0);
    // debugRect.setStrokeStyle(2, 0x00ff00, 1);
    // container.add(debugRect);

    // Lưu reference để dễ truy cập
    container.characterCard = container_card;
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen == true) return;

    isOpen = true;

    container_popup.setPosition(
        container_popup_close_position.x,
        container_popup_close_position.y
    );

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_open_position.x,
        y: container_popup_open_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

export function Close(scene) {
    if (isOpen == false) return;

    SpawnLobbyCharacter(scene);

    container_popup.setPosition(
        container_popup_open_position.x,
        container_popup_open_position.y
    );

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_close_position.x,
        y: container_popup_close_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            isOpen = false;
            Destroy();
        },
    });
}

function Destroy(scene) {
    if (container_main_team) {
        container_main_team.destroy();
    }
}

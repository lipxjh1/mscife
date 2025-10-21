import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    OpenTopBarNotice,
    HideTopBarNotice,
    MovePlayerBarToDefault,
    MovePlayerBarToHide,
    OpenCurrencyBar,
    HideCurrencyBar,
} from "../HomeTopBarPlayer.js";
import { CreateCharacterCard } from "../../Share/CharacterCard.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { playIdleAnimation } from "../../../utils/spineUtils.js";

let container_main = null;

let container_main_team = null;

let container_selected_character = null;

let container_item_list = null;

let container_card_options = null;

let container_main_buttons = null;

let container_selected_left = null;
let container_selected_mid = null;
let container_selected_right = null;

let selectedCardArr = [];

let isCardOptionsOpen = false;

let isOpen = false;

export function CreatePlaytestCharacterInventory(scene) {
    Destroy();

    isOpen = false;

    CreateLoadingPopup();

    let assetsToLoad = 2;
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();

            AssetsLoadDone(scene);
        }
    };

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyCharacterInventory(() => {
        onAssetLoaded();
    });

    let arr_ids = Object.keys(centerDataPlayer.CODE_KEY);

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        arr_ids,
        () => {
            onAssetLoaded();
        }
    );
}

function AssetsLoadDone(scene) {
    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    container_main_team = scene.add.container(0, 0);
    container_main.add(container_main_team);

    const team_bg = scene.add
        .image(540, 960, "home_character_team_bg")
        .setOrigin(0.5, 0.5)
        .setInteractive();
    container_main_team.add(team_bg);

    container_selected_character = scene.add.container(0, 0);
    container_main_team.add(container_selected_character);

    let filter_bg = scene.add
        .image(0, 0, "home_character_team_filter_bg")
        .setOrigin(0, 0);
    container_main_team.add(filter_bg);

    container_main_buttons = scene.add.container(0, 0);
    container_main.add(container_main_buttons);

    let btn_play = scene.add
        .image(615 + 330 / 2, 58 + 90 / 2, "home_character_btn_playtest")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            PlayTest(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_play,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_play,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_main_buttons.add(btn_play);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 58 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Close(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_main_buttons.add(btn_close);

    CreateItemList(scene);

    CheckSelectedCards();

    CreateSelectedCharacter(scene);

    Open(scene);
}

function PlayTest(scene) {
    // Gọi hàm PlayTest từ HomePlayTest.js thay vì định nghĩa lại ở đây
    import("./HomePlayTest.js").then((module) => {
        module.PlayTest(scene);
    });
}

function CheckSelectedCards() {
    let activeCells = [];

    for (let i = 0; i < container_item_list.gridTable.items.length; i++) {
        const cellContainer = container_item_list.gridTable.getCellContainer(i);
        if (cellContainer) {
            activeCells.push(cellContainer);

            if (
                centerDataPlayer.selectedPlayerTestArr.includes(
                    cellContainer.itemData.unlockedPlayer._id
                )
            ) {
                cellContainer.characterCard.setSelected();
            } else {
                cellContainer.characterCard.setUnselected();
            }
        }
    }
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

    for (let i = 0; i < centerDataPlayer.selectedPlayerTestArr.length; i++) {
        let unlockedPlayer =
            centerDataPlayer.playTestPlayer[
                centerDataPlayer.selectedPlayerTestArr[i]
            ];
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
    }
}

function CreateSpineCharacter(scene, spineUIKey) {
    let spawnedSpine = scene.add.spine(540, 1920, spineUIKey);

    playIdleAnimation(spawnedSpine);

    return spawnedSpine;
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    container_item_list = scene.add.container(0, 0);
    container_main_team.add(container_item_list);

    selectedCardArr = [];

    let itemData = [];

    let playerDict = centerDataPlayer.playTestPlayer;

    for (let i = 0; i < centerDataPlayer.selectedPlayerTestArr.length; i++) {
        let selectedId = centerDataPlayer.selectedPlayerTestArr[i];

        let pData = centerDataPlayer.getPlayerById(playerDict[selectedId].code);

        if (pData !== null) {
            const newItem = {
                unlockedPlayer: playerDict[selectedId],
            };

            itemData.push(newItem);
        }
    }

    //console.log("playerDict:", playerDict);

    // Lấy tất cả các key (tên nhân vật)
    let keys = Object.keys(playerDict);

    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];

        if (centerDataPlayer.selectedPlayerTestArr.includes(k) === false) {
            let pData = centerDataPlayer.getPlayerById(playerDict[k].code);

            if (pData !== null) {
                const newItem = {
                    unlockedPlayer: playerDict[k],
                };

                itemData.push(newItem);
            }
        }
    }

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

            slider: {
                track: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    0x000000,
                    0.3
                ),
                thumb: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    30,
                    10,
                    0xcccccc
                ),
            },

            items: itemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    item = cell.item;

                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = scene.add.container(0, 0);
                    cellContainer.setSize(cellWidth, cellHeight);
                }

                // Cập nhật nội dung của container với item mới
                updateCellContainer(scene, cellContainer, item);

                return cellContainer;
            },

            space: {
                // left: 21,
                // right: 21,
                // top: 15,
                // bottom: 0,
                // row: 0,
            },
        })
        .layout();

    // Xử lý sự kiện click trên cell
    gridTable.on("cell.click", function (cellContainer, cellIndex) {
        if (cellContainer && cellContainer.itemData) {
            CreateCardOptions(scene, cellContainer.itemData.unlockedPlayer._id);
        }
    });

    // Xử lý hiệu ứng hover
    gridTable.on("cell.over", function (cellContainer, cellIndex) {
        if (cellContainer && cellContainer.characterCard) {
            cellContainer.characterCard.each(function (child) {
                if (child.setTint) {
                    child.setTint(0x646464);
                }
            });
        }
    });

    gridTable.on("cell.out", function (cellContainer, cellIndex) {
        if (cellContainer && cellContainer.characterCard) {
            cellContainer.characterCard.each(function (child) {
                if (child.clearTint) {
                    child.clearTint();
                }
            });
        }
    });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    gridTable.setT(1);
    gridTable.setT(0);

    const maskShape = scene.add
        .rectangle(540, 959 + 961 / 2, 1080, 961, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

// Hàm cập nhật nội dung của cell container
function updateCellContainer(scene, container, item) {
    let width = 319;
    let height = 444;

    // Lưu trữ dữ liệu item trong container
    container.itemData = item;

    // Xóa nội dung cũ nếu có
    while (container.list.length > 0) {
        container.list[0].destroy();
    }

    // Tạo character card mới
    const characterCard = CreateCharacterCard(
        scene,
        item.unlockedPlayer._id,
        item.unlockedPlayer.code,
        item.unlockedPlayer.name,
        item.unlockedPlayer.role,
        item.unlockedPlayer.rank,
        item.unlockedPlayer.level,
        item.unlockedPlayer.star
    );

    // Thêm card vào container
    container.add(characterCard);
    container.characterCard = characterCard;
    characterCard.x = width / 2;
    characterCard.y = height / 2;

    // Kiểm tra nếu nhân vật đã được chọn thì hiển thị giao diện tương ứng
    if (
        centerDataPlayer.selectedPlayerTestArr.includes(item.unlockedPlayer._id)
    ) {
        characterCard.setSelected();
        selectedCardArr.push(characterCard);
    }

    // const debugRect = scene.add.rectangle(0, 0, width, height, 0x00ff00, 0).setOrigin(0, 0);
    // debugRect.setStrokeStyle(2, 0x00ff00, 1);
    // container.add(debugRect);
}

export function CreateCardOptions(scene, _id) {
    //console.log("CreateCardOptions _id: ", _id);

    CloseCardOptions(scene);

    isCardOptionsOpen = true;

    let unlockedPlayer = centerDataPlayer.playTestPlayer[_id];

    //console.log(`CreateCardOptions unlockedPlayer `, unlockedPlayer);

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
        .text(
            405,
            1322,
            item.unlockedPlayer.starLevelData[item.unlockedPlayer.star - 1]
                .data[item.unlockedPlayer.level - 1].attachDamage,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#D6D6D6",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_card_options.add(text_current_damage);

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
        .text(405, 1428, item.unlockedPlayer.baseProperties.attackDelay, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#D6D6D6",
            align: "left",
        })
        .setOrigin(0, 0);
    container_card_options.add(text_current_delay);

    const btn_equip = CreateOptionsButton0(
        scene,
        764 + 286 / 2,
        1259 + 15 + 84 / 2,
        "home_character_option_btn_0",
        "Equip"
    );

    btn_equip.button.on("pointerdown", function () {
        centerDataPlayer.addToSelectedTestPlayer(item.unlockedPlayer._id);

        CheckSelectedCards();

        CreateCardOptions(scene, item.unlockedPlayer._id);

        CreateSelectedCharacter(scene);
    });

    const btn_unequip = CreateOptionsButton0(
        scene,
        764 + 286 / 2,
        1259 + 15 + 84 / 2,
        "home_character_option_btn_0_red",
        "Unequip"
    );

    btn_unequip.button.on("pointerdown", function () {
        centerDataPlayer.removeFromSelectedTestPlayer(item.unlockedPlayer._id);

        CheckSelectedCards();

        CreateCardOptions(scene, item.unlockedPlayer._id);

        CreateSelectedCharacter(scene);
    });

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

    if (centerDataPlayer.isSelectedTestPlayer(item.unlockedPlayer._id)) {
        btn_equip.setVisible(false);
        btn_unequip.setVisible(true);
    } else {
        btn_equip.setVisible(true);
        btn_unequip.setVisible(false);
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

export function CloseCardOptions(scene) {
    isCardOptionsOpen = false;

    if (container_card_options != null) {
        container_card_options.destroy();
    }
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen == true) return;

    // HideTopBarNotice(scene);

    // MovePlayerBarToHide(scene);

    // HideCurrencyBar(scene);

    isOpen = true;
}

export function Close(scene) {
    if (isOpen == false) return;

    // OpenTopBarNotice(scene);

    // MovePlayerBarToDefault(scene);

    // OpenCurrencyBar(scene);

    scene.time.addEvent({
        delay: 510, // Cập nhật mỗi 16 ms (khoảng 60 FPS)
        callback: () => {
            isOpen = false;
            Destroy();
        },
    });
}

function Destroy(scene) {
    if (container_main) {
        container_main.destroy();
    }
}

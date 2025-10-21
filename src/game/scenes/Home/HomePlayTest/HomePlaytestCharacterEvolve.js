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
import { CreatePlayTestEnvolved } from "./HomePlaytestEvolve.js";

let container_main = null;

let container_main_team = null;

let container_selected_character = null;

let container_item_list = null;

let container_card_options = null;

let container_main_buttons = null;

let isCardOptionsOpen = false;

let isOpen = false;

export function CreatePlaytestCharacterEvolve(scene) {
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
        .image(540, 960, "home_character_upgrade_bg")
        .setOrigin(0.5, 0.5)
        .setInteractive();
    container_main_team.add(team_bg);

    container_selected_character = scene.add.container(0, 0);
    container_main_team.add(container_selected_character);

    container_main_buttons = scene.add.container(0, 0);
    container_main.add(container_main_buttons);

    let btn_play = scene.add
        .image(615 + 330 / 2, 58 + 90 / 2, "home_character_btn_evolvetest")
        .setOrigin(0.5, 0.5);

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

    Open(scene);
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    container_item_list = scene.add.container(0, 0);
    container_main_team.add(container_item_list);

    let itemData = [];

    let playerDict = centerDataPlayer.playTestPlayer;

    //console.log("playerDict:", playerDict);

    // Lấy tất cả các key (tên nhân vật)
    let keys = Object.keys(playerDict);

    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];

        if (playerDict[k].envolvedProperties != null) {
            let pData = centerDataPlayer.getPlayerById(playerDict[k].code);

            let evolve_pData = centerDataPlayer.getPlayerById(
                playerDict[k].envolvedProperties.code
            );

            if (pData !== null && evolve_pData != null) {
                const newItem = {
                    unlockedPlayer: playerDict[k],
                };

                itemData.push(newItem);
            }
        }
    }

    const posX = 540 + 1080 / 6 + 38 / 2;

    const posY = 248 + 1672 / 2;

    const scrollViewWidth = 1080;

    const scrollViewHeight = 1672;

    const spaceWidth = 23;

    const spaceHeight = 30;

    const gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,

            table: {
                cellWidth: 319 + spaceWidth,
                cellHeight: 444 + spaceHeight,
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
                        width: 319,
                        height: 444,
                        orientation: 0,
                    });
                } else {
                    //console.log(cell.index + ": reuse cell-container");
                }

                cellContainer.add(card_item(scene, index, item));

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

    gridTable.isDragging = false;

    scene.input.on("pointerup", (pointer) => {
        gridTable.isDragging = false;
    });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    gridTable.setT(1);
    gridTable.setT(0);

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

    // const shape = scene.add.rectangle(540, 959 + 961 / 2, 1080, 961, 0xffffff);

    // container_popup.add(shape);

    const maskShape = scene.add
        .rectangle(540, 248 + 1672 / 2, 1080, 1672, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function card_item(scene, i, item) {
    //console.log("Item = ", item);

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
                CreateCardOptions(scene, item.unlockedPlayer._id);
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

export function CreateCardOptions(scene, _id) {
    //console.log("CreateCardOptions");

    CloseCardOptions(scene);

    isCardOptionsOpen = true;

    let unlockedPlayer = centerDataPlayer.playTestPlayer[_id];

    //console.log(`unlockedPlayer `, unlockedPlayer);

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
        .rectangle(0, 0, 1080, 1920, 0x000000)
        .setOrigin(0, 0)
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
                CreatePlayTestEnvolved(scene, item.unlockedPlayer._id);
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

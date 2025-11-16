import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateGuidePlayBattle,
    DestroyGuidePlayBattle,
} from "../../Guide/GuidePlayBattle.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { CreateCampain } from "./HomeBattleCampain.js";
import { CreateBoss } from "./HomeBattleBoss.js";
import { CreateMultiplayerBoss } from "./HomeBattleMultiplayerBoss/HomeBattleMultiplayerBoss.js";
import { MultiplayerBossJoinRoomPopup } from "./HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossJoinRoom.js";

import {
    OpenCurrencyBar,
    HideCurrencyBar,
    MovePlayerBarToDefault,
    MovePlayerBarToHide,
} from "../HomeTopBarPlayer.js";
import { CreateMultiplayerBossRoomList } from "./HomeBattleMultiplayerBoss/HomeBattleMultiplayerBossRoomList.js";
import { CreateInputNumberPopup } from "../../Share/PopupInputNumber.js";
import { multiplayerBossV2 } from "../../../../modules/multiplayerBossV2/index.js";

let container_main = null;

let container_popup = null;

let container_list = null;

let container_popup_buttons = null;

let isOpen = false;

export function CreateHomeBattle(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadHomeBattle(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.rexUI.add
        .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.75)
        .setInteractive({ useHandCursor: true });

    container_main.add(lock_bg);

    // const lock_bg = scene.add
    //     .image(0, 0, "home_user_info_bg")
    //     .setOrigin(0, 0)
    //     .setInteractive();
    // container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup_buttons = scene.add.container(0, 0);
    container_main.add(container_popup_buttons);

    //Create buttons

    let title = scene.add
        .image(615 + 427 / 2, 248 + 90 / 2, "home_battle_btn_battle")
        .setOrigin(0.5, 0.5);

    container_popup_buttons.add(title);

    if (centerData.userInfo.CurrentStage > 1) {
        //create close btn
        const btn_close = scene.add
            .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {
                CloseHomeBattle(scene);
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

        container_popup_buttons.add(btn_close);
    }

    //ActiveMode(scene, MODE_KEYS.Account.KEY);

    CreateList(scene);

    OpenHomeBattle(scene);
}

function CreateList(scene) {
    //Create friend list
    container_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_popup.add(container_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1554;

    const columns = 1;
    const rows = Math.ceil(2 / columns);

    const itemWidth = 1004;
    const itemHeight = 218;
    const itemSpacing = 42;

    const posX = 38 + scrollViewWidth / 2;
    const posY = 366 + scrollViewHeight / 2;

    // const background = scene.add
    //   .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
    //   .setAlpha(0.8);

    // container_archivement.add(background);

    // Tạo một Scrollable Panel (bảng cuộn)
    const scrollablePanel = scene.rexUI.add
        .scrollablePanel({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            panel: {
                child: scene.rexUI.add.gridSizer({
                    width: scrollViewWidth,
                    height: scrollViewHeight,
                    column: columns,
                    row: rows,
                    columnProportions: 0,
                    rowProportions: 0,
                    space: {
                        column: itemSpacing,
                        row: itemSpacing,
                    },
                }),
                mask: {
                    padding: 1,
                },
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.2,
            },
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            },
        })
        .layout();

    container_list.add(scrollablePanel);

    CreateItemCampian(scene, scrollablePanel);

    if (centerData.userInfo.CurrentStage > 1) {
        CreateItemMultiplayer(scene, scrollablePanel);

        CreateItemBoss(scene, scrollablePanel);

        // Add Multiplayer Boss V2 section
        multiplayerBossV2.createBattleSection(scene, scrollablePanel);
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);

    CreateGuidePlayBattle(scene);
}

function CreateOptionsButton(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 248;
    let btnHeight = 78;

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
            17,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
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

function CreateItemCampian(scene, scrollablePanel) {
    let itemWidth = 1004;
    let itemHeight = 293;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);

    const bg = scene.add
        .image(0, 0, "home_battle_item_bg_campain")
        .setOrigin(0, 0);
    container_inner.add(bg);

    const text_mode = scene.add
        .text(
            38,
            35,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                "Campaign"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "52px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_mode);

    const text_info = scene.add
        .text(
            38,
            102,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                "CampaignContent"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: 618, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_info);

    const btn_play = CreateOptionsButton(
        scene,
        container_inner,
        746 + 248 / 2,
        199 + 78 / 2,
        "home_battle_btn",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeBattle.KEY,
            "Play"
        )
    );
    btn_play.button.on("pointerdown", function () {
        CreateCampain(scene);

        DestroyGuidePlayBattle(scene);
    });

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });
}

function CreateItemMultiplayer(scene, scrollablePanel) {
    let itemWidth = 1004;
    let itemHeight = 293;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);

    const bg = scene.add
        .image(0, 0, "home_battle_item_bg_boss")
        .setOrigin(0, 0);
    container_inner.add(bg);

    const text_mode = scene.add
        .text(
            38,
            35,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                "Multiplayer Boss"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "52px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_mode);

    const text_info = scene.add
        .text(
            38,
            102,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                "Boss fight together"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: 618, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_info);

    const btn_create_room = CreateOptionsButton(
        scene,
        container_inner,
        746 + 248 / 2,
        199 + 78 / 2,
        "home_battle_btn",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeBattle.KEY,
            "Create"
        )
    );
    btn_create_room.button.on("pointerdown", function () {
        CreateMultiplayerBoss(scene);
    });

    const btn_join_room = CreateOptionsButton(
        scene,
        container_inner,
        476 + 248 / 2,
        199 + 78 / 2,
        "home_battle_btn",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeBattle.KEY,
            "Join"
        )
    );
    btn_join_room.button.on("pointerdown", function () {
        MultiplayerBossJoinRoomPopup(scene);
    });

    const btn_room_list = CreateOptionsButton(
        scene,
        container_inner,
        206 + 248 / 2,
        199 + 78 / 2,
        "home_battle_btn",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeBattle.KEY,
            "Rooms"
        )
    );
    btn_room_list.button.on("pointerdown", function () {
        CreateMultiplayerBossRoomList(scene);
    });

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });
}

function CreateItemBoss(scene, scrollablePanel) {
    let itemWidth = 1004;
    let itemHeight = 293;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);

    const bg = scene.add
        .image(0, 0, "home_battle_item_bg_boss")
        .setOrigin(0, 0);
    container_inner.add(bg);

    const text_mode = scene.add
        .text(
            38,
            35,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                "Boss"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "52px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_mode);

    const text_info = scene.add
        .text(
            38,
            102,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                "BossContent"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: 618, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_info);

    const btn_play = CreateOptionsButton(
        scene,
        container_inner,
        746 + 248 / 2,
        199 + 78 / 2,
        "home_battle_btn",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeBattle.KEY,
            "Play"
        )
    );
    btn_play.button.on("pointerdown", function () {
        // Password check removed - direct access to Boss mode
        CreateBoss(scene);
    });

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });
}

export function IsOpen() {
    return isOpen;
}

function OpenHomeBattle(scene) {
    isOpen = true;

    HideCurrencyBar(scene);

    MovePlayerBarToHide(scene);
}

function CloseHomeBattle(scene) {
    isOpen = false;

    MovePlayerBarToDefault(scene);

    OpenCurrencyBar(scene);

    Destroy();
}

export function ShowHomeBattle(scene) {
    container_main.setPosition(0, 0);
}

export function HideHomeBattle(scene) {
    container_main.setPosition(4000, 0);
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;
}

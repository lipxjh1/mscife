import centerData from "../../../../Data/CenterData.js";

import { AssetLoadingManager } from "../../../AssetLoadingManager.js";
import { AssetPlayerLoadingManager } from "../../../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../../Share/AlertPopup.js";
import { HideHomeBattle, ShowHomeBattle } from "../HomeBattle.js";
import cdLocalization from "../../../../Data/CenterDataLocalization.js";

import { HideTopBarNotice, OpenTopBarNotice } from "../../HomeTopBarPlayer.js";

import { MultiplayerBossRoom } from "./HomeBattleMultiplayerBossRoom.js";

let container_main = null;

let container_popup = null;

let container_list = null;

let container_popup_buttons = null;

let isOpen = false;

export function CreateMultiplayerBoss(scene) {
    centerData.multiplayerBossId = "";

    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadHomeBattle(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    CreateLoadingPopup();

    centerData.RequestStageInfo(
        centerData.userInfo.CurrentStage,
        () => {
            HideLoadingPopup();

            HideHomeBattle(scene);

            container_main = scene.add.container(0, 0);
            container_main.setDepth(200);

            const lock_bg = scene.add
                .image(0, 0, "home_battle_multiplayer_bg")
                .setOrigin(0, 0)
                .setInteractive({ useHandCursor: true });

            container_main.add(lock_bg);

            container_popup = scene.add.container(0, 0);
            container_main.add(container_popup);

            container_popup_buttons = scene.add.container(0, 0);
            container_main.add(container_popup_buttons);

            //Create buttons

            if (centerData.userInfo.CurrentStage > 1) {
                //create close btn
                const btn_close = scene.add
                    .image(38 + 32 / 2, 266 + 54 / 2, "share_btn_back")
                    .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
                    .on("pointerdown", function () {
                        CloseMultiplayer(scene);

                        ShowHomeBattle(scene);
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

            OpenMultiplayer(scene);
        },
        () => {
            HideLoadingPopup();
        }
    );
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
                bottom: 293 * 0.1,
            },
        })
        .layout();

    container_list.add(scrollablePanel);

    CreateItemMapList(scene, scrollablePanel);

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateItemMapList(scene, scrollablePanel) {
    let btnArr = [];

    let earth = CreateItemMap(scene, scrollablePanel, "BOSS_001");
    btnArr.push(earth);
    earth.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "Earth"
        )
    );
    earth.bg.setTexture("home_battle_item_bg_campain_earth");
    earth.setTurnStartEnd(0, 5);
    //earth.setReplay(0, 0);

    earth.btn_create.button.on("pointerdown", function () {
        PlayMultiplayerBoss(scene, earth.bossId);
    });

    let space = CreateItemMap(scene, scrollablePanel, "BOSS_002");
    btnArr.push(space);
    space.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "Space"
        )
    );
    space.bg.setTexture("home_battle_item_bg_campain_space");
    space.setTurnStartEnd(0, 5);
    //space.setActive(false);
    space.btn_create.button.on("pointerdown", function () {
        PlayMultiplayerBoss(scene, space.bossId);
    });

    let mars = CreateItemMap(scene, scrollablePanel, "BOSS_003");
    btnArr.push(mars);
    mars.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "Mars"
        )
    );
    mars.bg.setTexture("home_battle_item_bg_campain_mars");
    mars.setTurnStartEnd(0, 5);
    //mars.setActive(false);
    mars.btn_create.button.on("pointerdown", function () {
        PlayMultiplayerBoss(scene, mars.bossId);
    });

    let return_earth = CreateItemMap(scene, scrollablePanel, "BOSS_004");
    btnArr.push(return_earth);
    return_earth.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "Return Earth"
        )
    );
    return_earth.bg.setTexture("home_battle_item_bg_campain_back_to_earth");
    return_earth.setTurnStartEnd(0, 5);
    return_earth.setActive(false);

    // Thêm click handlers cho return_earth (sẽ được enable khi unlock từ API)
    return_earth.btn_create.button.on("pointerdown", function () {
        PlayMultiplayerBoss(scene, return_earth.bossId);
    });

    let X_Corp = CreateItemMap(scene, scrollablePanel, "BOSS_005");
    btnArr.push(X_Corp);
    X_Corp.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "X-Corp"
        )
    );
    X_Corp.bg.setTexture("home_battle_item_bg_campain_xcorp");
    X_Corp.setTurnStartEnd(0, 5);
    X_Corp.setActive(false);

    // Thêm click handlers cho X_Corp (sẽ được enable khi unlock từ API)
    X_Corp.btn_create.button.on("pointerdown", function () {
        PlayMultiplayerBoss(scene, X_Corp.bossId);
    });
}

function CreateFightButton(scene, container, x, y, imageKey, buttonName) {
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
                cdLocalization.GROUP_KEYS.HomeCampian.KEY,
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

function CreateItemMap(scene, scrollablePanel, bossId) {
    let itemWidth = 1034;
    let itemHeight = 368;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.bossId = bossId;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add
        .image(0, 0, "home_battle_item_bg_campain")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.text_stage = scene.add
        .text(120, 100, "Stage: " + item.stage, {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#CCCCCC",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_stage);

    item.text_level = scene.add
        .text(974, 35, "00/00", {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#CCCCCC",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(item.text_level);

    item.turnStart = 0;
    item.turnEnd = 0;
    item.isProcessedByAPI = false;

    item.setTurnStartEnd = function (tStart, tEnd) {
        item.turnStart = tStart;
        item.turnEnd = tEnd;

        // Hiển thị theo mẫu 03/20
        const formattedStart = String(item.turnStart).padStart(2, "0");
        const formattedEnd = String(item.turnEnd).padStart(2, "0");

        // Cập nhật nội dung text
        item.text_level.setText("Turn: " + `${formattedStart}/${formattedEnd}`);

        if (item.turnStart < item.turnEnd) {
            item.setActive(true);
        } else {
            item.setActive(false);
        }
    };

    item.text_name = scene.add
        .text(38, 35, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "52px",
            color: "#CCCCCC",
            align: "left",
            stroke: "#000000",
            strokeThickness: 5,
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_name);
    item.text_name.setVisible(false);

    const btn_create = CreateFightButton(
        scene,
        container_inner,
        746 + 248 / 2,
        110 + 78 / 2, // Điều chỉnh Y cao hơn để không lấp với nút replay
        "home_battle_btn",
        "Create Room"
    );
    item.btn_create = btn_create;

    const btn_lock = CreateFightButton(
        scene,
        container_inner,
        746 + 248 / 2,
        110 + 78 / 2, // Điều chỉnh Y cao hơn để không lấp với nút replay
        "home_battle_btn_lock",
        "Create Room"
    );
    item.btn_lock = btn_lock;

    item.setActive = function (boolVal) {
        if (boolVal) {
            btn_create.setVisible(true);
            btn_create.button.setInteractive(true);
            btn_lock.setVisible(false);
        } else {
            btn_create.setVisible(false);
            btn_create.button.disableInteractive();
            btn_lock.setVisible(true);
        }
    };

    item.setPass = function () {
        btn_create.setVisible(false);
        btn_create.button.disableInteractive();
        btn_lock.setVisible(false);
        btn_create.button.disableInteractive();
    };

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

export function PlayMultiplayerBoss(scene, bossId) {
    MultiplayerBossRoom(scene, bossId);
}

export function IsOpen() {
    return isOpen;
}

function OpenMultiplayer(scene) {
    isOpen = true;

    HideTopBarNotice(scene);
}

function CloseMultiplayer(scene) {
    isOpen = false;

    OpenTopBarNotice(scene);

    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;
}

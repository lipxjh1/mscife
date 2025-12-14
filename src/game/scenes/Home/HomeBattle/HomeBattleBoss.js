import centerData from "../../../Data/CenterData.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { HideHomeBattle, ShowHomeBattle } from "./HomeBattle.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

let container_main = null;

let container_popup = null;

let container_list = null;

let container_popup_buttons = null;

let isOpen = false;

let timeCountEvents = [];

let bossActive = [];

let bossSchedule = {};

// Track all resources for cleanup
let bossResources = {
    events: [],
    tweens: [],
    timers: []
};

export function CreateBoss(scene) {
    centerData.selectedBossData = null;

    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadHomeBattle(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    HideHomeBattle(scene);

    // Reset resources
    bossResources = {
        events: [],
        tweens: [],
        timers: []
    };

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
        .image(615 + 427 / 2, 248 + 90 / 2, "home_battle_btn_boss")
        .setOrigin(0.5, 0.5);

    container_popup_buttons.add(title);

    //create close btn
    const btn_close = scene.add
        .image(38 + 32 / 2, 266 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }); // Thiết lập tương tác và đổi thành hình bàn tay khi hover

    // Track events
    const onCloseClick = function () {
        CloseCampian(scene);
        ShowHomeBattle(scene);
    };
    btn_close.on("pointerdown", onCloseClick);
    bossResources.events.push({ target: btn_close, event: "pointerdown", handler: onCloseClick });

    const onCloseOver = function () {
        scene.tweens.add({
            targets: btn_close,
            scaleX: 1.2, // Phóng to 20% theo chiều ngang
            scaleY: 1.2, // Phóng to 20% theo chiều dọc
            duration: 100, // Thời gian hiệu ứng (ms)
            ease: "Power2",
        });
    };
    btn_close.on("pointerover", onCloseOver);
    bossResources.events.push({ target: btn_close, event: "pointerover", handler: onCloseOver });

    const onCloseOut = function () {
        scene.tweens.add({
            targets: btn_close,
            scaleX: 1, // Phóng to 20% theo chiều ngang
            scaleY: 1, // Phóng to 20% theo chiều dọc
            duration: 100, // Thời gian hiệu ứng (ms)
            ease: "Power2",
        });
    };
    btn_close.on("pointerout", onCloseOut);
    bossResources.events.push({ target: btn_close, event: "pointerout", handler: onCloseOut });

    container_popup_buttons.add(btn_close);

    //ActiveMode(scene, MODE_KEYS.Account.KEY);

    OpenCampain(scene);

    RequestBossStatus(scene);
}

function RequestBossStatus(scene) {
    ClearTimeEvents();

    bossActive = [];

    bossSchedule = {};

    CreateLoadingPopup();

    let assetsToLoad = 2;
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();

            CreateList(scene);

            // Auto-register with UIManager if available
            if (scene.ui && scene.ui.register) {
                scene.ui.register(container_main, 'HomeBattleBoss');
            }
        }
    };

    centerData.RequestBossActive(
        (result) => {
            bossActive = result.data;

            onAssetLoaded();
        },
        () => {
            onAssetLoaded();
        }
    );

    centerData.RequestBossSchedule(
        (result) => {
            bossSchedule = result.schedule;

            onAssetLoaded();
        },
        () => {
            onAssetLoaded();
        }
    );
}

function CreateList(scene) {
    if (container_list) {
        container_list.destroy();
    }

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
                bottom: 293 * 0.1,
            },
        })
        .layout();

    container_list.add(scrollablePanel);

    let keys = Object.keys(bossSchedule);

    for (let i = 0; i < keys.length; i++) {
        let container_element = CreateItemMapSchedule(
            scene,
            scrollablePanel,
            bossSchedule[keys[i]]
        );
    }

    for (let i = 0; i < bossActive.length; i++) {
        CreateItemMap(scene, scrollablePanel, bossActive[i]);
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
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
        .setInteractive({ useHandCursor: true }); // Thiết lập tương tác và đổi thành hình bàn tay khi hover

    // Track events
    const onPointerDown = function () {};
    btn_container.button.on("pointerdown", onPointerDown);
    bossResources.events.push({ target: btn_container.button, event: "pointerdown", handler: onPointerDown });

    const onPointerOver = function () {
        scene.tweens.add({
            targets: btn_container,
            scaleX: 1.2, // Phóng to 20% theo chiều ngang
            scaleY: 1.2, // Phóng to 20% theo chiều dọc
            duration: 100, // Thời gian hiệu ứng (ms)
            ease: "Power2",
        });
    };
    btn_container.button.on("pointerover", onPointerOver);
    bossResources.events.push({ target: btn_container.button, event: "pointerover", handler: onPointerOver });

    const onPointerOut = function () {
        scene.tweens.add({
            targets: btn_container,
            scaleX: 1, // Phóng to 20% theo chiều ngang
            scaleY: 1, // Phóng to 20% theo chiều dọc
            duration: 100, // Thời gian hiệu ứng (ms)
            ease: "Power2",
        });
    };
    btn_container.button.on("pointerout", onPointerOut);
    bossResources.events.push({ target: btn_container.button, event: "pointerout", handler: onPointerOut });
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

function CreateItemMapSchedule(scene, scrollablePanel, bossData) {
    //console.log("CreateBoss CreateItemMap bossData: ", bossData);

    let itemWidth = 1004;
    let itemHeight = 293;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add.image(0, 0, "home_battle_item_bg_boss").setOrigin(0, 0);
    container_inner.add(item.bg);

    item.text_name = scene.add
        .text(38, 35, bossData.nextBossName, {
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

    item.text_info = scene.add
        .text(38, 102, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#CCCCCC",
            align: "left",
            stroke: "#000000",
            strokeThickness: 5,
            wordWrap: { width: 618, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_info);

    let startTime = formatDateTime(bossData.nextAppearance);

    item.text_time_start_end = scene.add
        .text(
            28,
            210,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                "Start: "
            ) + startTime,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#FFFFFF",
                align: "left",
                stroke: "#000000",
                strokeThickness: 5,
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_time_start_end);

    item.text_remainingTime = scene.add
        .text(978, 44, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFFFFF",
            align: "right",
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(1, 0);
    container_inner.add(item.text_remainingTime);

    item.SetTextTimeRemain = function (miliseconds) {
        item.text_remainingTime.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                "Time remaining: "
            ) + formatTimeRemaining(miliseconds / 1000)
        );
    };

    item.SetTextTimeRemain(bossData.timeUntilNext);

    // Tạo Timer Event để đếm ngược
    let timeEvent = scene.time.addEvent({
        delay: 1000, // 1 giây
        callback: () => {
            if (bossData.timeUntilNext < 0) {
                bossData.timeUntilNext = 0;

                timeEvent.remove();

                // Remove from tracked timers
                const index = bossResources.timers.indexOf(timeEvent);
                if (index > -1) {
                    bossResources.timers.splice(index, 1);
                }

                item.destroy();

                scrollablePanel.layout();

                RequestBossStatus(scene);
            }

            item.SetTextTimeRemain(bossData.timeUntilNext);

            bossData.timeUntilNext -= 1000;
        },
        callbackScope: this,
        loop: true,
    });

    timeCountEvents.push(timeEvent);
    // Track timer for cleanup
    bossResources.timers.push(timeEvent);

    if (bossData.health < 0) {
        bossData.health = 0;
    }

    item.text_boss_health = scene.add
        .text(
            978,
            104,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                "Health: "
            ) +
                bossData.health +
                "/" +
                bossData.maxHealth,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "24px",
                color: "#FFFFFF",
                align: "right",
                stroke: "#000000",
                strokeThickness: 5,
            }
        )
        .setOrigin(1, 0);
    container_inner.add(item.text_boss_health);

    if (bossData.shield) {
        if (bossData.shield < 0) {
            bossData.shield = 0;
        }

        item.text_boss_shield = scene.add
            .text(
                978,
                134,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                    "Shield: "
                ) +
                    bossData.shield +
                    "/" +
                    bossData.maxShield,
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "24px",
                    color: "#FFFFFF",
                    align: "right",
                    stroke: "#000000",
                    strokeThickness: 5,
                }
            )
            .setOrigin(1, 0);
        container_inner.add(item.text_boss_shield);
    }

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

function CreateItemMap(scene, scrollablePanel, bossData) {
    //console.log("CreateBoss CreateItemMap bossData: ", bossData);

    let itemWidth = 1004;
    let itemHeight = 293;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add.image(0, 0, "home_battle_item_bg_boss").setOrigin(0, 0);
    container_inner.add(item.bg);

    item.text_name = scene.add
        .text(38, 35, bossData.name, {
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

    item.text_info = scene.add
        .text(38, 102, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#CCCCCC",
            align: "left",
            stroke: "#000000",
            strokeThickness: 5,
            wordWrap: { width: 618, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_info);

    let lives = 5 - Number(bossData.myDeathCount);

    item.text_lives = scene.add
        .text(
            28,
            210,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                "Lives: "
            ) +
                lives +
                "/5",
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#CCCCCC",
                align: "left",
                stroke: "#000000",
                strokeThickness: 5,
                wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_lives);

    let startTime = formatDateTime(bossData.startTime);
    let endTime = formatDateTime(bossData.endTime);

    item.text_time_start_end = scene.add
        .text(
            978,
            14,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                "Start: "
            ) +
                startTime +
                " | " +
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                    "End: "
                ) +
                endTime,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "24px",
                color: "#FFFFFF",
                align: "right",
                stroke: "#000000",
                strokeThickness: 5,
            }
        )
        .setOrigin(1, 0);
    container_inner.add(item.text_time_start_end);

    item.text_remainingTime = scene.add
        .text(978, 44, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFFFFF",
            align: "right",
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(1, 0);
    container_inner.add(item.text_remainingTime);

    item.SetTextTimeRemain = function (miliseconds) {
        item.text_remainingTime.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                "Time remaining: "
            ) + formatTimeRemaining(miliseconds / 1000)
        );
    };

    item.SetTextTimeRemain(bossData.remainingTime);

    // Tạo Timer Event để đếm ngược
    let timeEvent = scene.time.addEvent({
        delay: 1000, // 1 giây
        callback: () => {
            bossData.remainingTime -= 1000;

            if (bossData.remainingTime < 0) {
                bossData.remainingTime = 0;

                timeEvent.remove();

                item.destroy();

                scrollablePanel.layout();

                RequestBossStatus(scene);
            }

            item.SetTextTimeRemain(bossData.remainingTime);
        },
        callbackScope: this,
        loop: true,
    });

    timeCountEvents.push(timeEvent);
    // Track timer for cleanup
    bossResources.timers.push(timeEvent);

    item.text_participantCount = scene.add
        .text(
            978,
            74,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                "Players: "
            ) + bossData.participantCount,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "24px",
                color: "#FFFFFF",
                align: "right",
                stroke: "#000000",
                strokeThickness: 5,
            }
        )
        .setOrigin(1, 0);
    container_inner.add(item.text_participantCount);

    if (bossData.health < 0) {
        bossData.health = 0;
    }

    item.text_boss_health = scene.add
        .text(
            978,
            104,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                "Health: "
            ) +
                bossData.health +
                "/" +
                bossData.maxHealth,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "24px",
                color: "#FFFFFF",
                align: "right",
                stroke: "#000000",
                strokeThickness: 5,
            }
        )
        .setOrigin(1, 0);
    container_inner.add(item.text_boss_health);

    if (bossData.shield) {
        if (bossData.shield < 0) {
            bossData.shield = 0;
        }

        item.text_boss_shield = scene.add
            .text(
                978,
                134,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                    "Shield: "
                ) +
                    bossData.shield +
                    "/" +
                    bossData.maxShield,
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "24px",
                    color: "#FFFFFF",
                    align: "right",
                    stroke: "#000000",
                    strokeThickness: 5,
                }
            )
            .setOrigin(1, 0);
        container_inner.add(item.text_boss_shield);
    }

    const btn_play = CreateFightButton(
        scene,
        container_inner,
        746 + 248 / 2,
        199 + 78 / 2,
        "home_battle_btn",
        "Fight"
    );
    item.btn_play = btn_play;

    const onPlayBoss = function () {
        centerData.selectedBossData = bossData;

        if (lives > 0 && bossData.remainingTime > 0) {
            PlayBossBattle(scene);
        } else {
            if (lives <= 0) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                        "No lives remain to play"
                    )
                );
            } else if (bossData.remainingTime <= 0) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeBoss.KEY,
                        "Boss match ended"
                    )
                );
            }
        }
    };
    btn_play.button.on("pointerdown", onPlayBoss);
    bossResources.events.push({ target: btn_play.button, event: "pointerdown", handler: onPlayBoss });

    const btn_lock = CreateFightButton(
        scene,
        container_inner,
        746 + 248 / 2,
        199 + 78 / 2,
        "home_battle_btn_lock",
        "Fight"
    );
    item.btn_lock = btn_lock;

    item.setActive = function (boolVal) {
        if (boolVal) {
            btn_play.setVisible(true);
            btn_play.button.setInteractive(true);
            btn_lock.setVisible(false);
        } else {
            btn_play.setVisible(false);
            btn_play.button.disableInteractive();
            btn_lock.setVisible(true);
        }
    };

    item.setPass = function () {
        btn_play.setVisible(false);
        btn_play.button.disableInteractive();
        btn_lock.setVisible(false);
        btn_play.button.disableInteractive();
    };

    item.setSchedule = function () {
        btn_play.setVisible(false);
        btn_play.button.disableInteractive();
        btn_lock.setVisible(false);
        btn_play.button.disableInteractive();

        item.text_lives.setVisible(false);

        item.text_participantCount.setVisible(false);

        item.bg.setTint(0x646464);
    };

    if (
        bossData.status == "active" &&
        bossData.health > 0 &&
        bossData.remainingTime > 0
    ) {
        item.setActive(true);
    } else {
        item.setActive(false);
    }

    //item.setActive(false);

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

export function PlayBossBattle(scene) {
    CreateLoadingPopup();

    let assetsToLoad = 3; // UI, Boss assets, Player
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();
            scene.scene.start("GameplayBoss");
        }
    };

    AssetLoadingManager.getInstance().init(scene);

    // 1. Tải UI gameplay
    AssetLoadingManager.getInstance().loadGameplayUI(() => {
        onAssetLoaded();
    });

    // 2. Tải assets cho boss game
    AssetLoadingManager.getInstance().loadBossAssets(() => {
        onAssetLoaded();
    });

    // 3. Tải character models
    let arrIds = centerData.getSelectedPlayerLocalIds();
    AssetPlayerLoadingManager.getInstance().init(scene);
    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterSpineGameplay(
        arrIds,
        () => {
            onAssetLoaded();
        }
    );
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);

    // Lấy các thành phần của ngày giờ
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    // Ghép các thành phần theo định dạng mong muốn
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}

function formatTimeRemaining(seconds) {
    // Tính số giờ, phút và giây
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Thêm số 0 phía trước nếu giá trị nhỏ hơn 10
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(secs).padStart(2, "0");

    // Trả về chuỗi định dạng giờ:phút:giây
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function IsOpen() {
    return isOpen;
}

function OpenCampain(scene) {
    isOpen = true;
}

function CloseCampian(scene) {
    isOpen = false;

    Destroy();
}

function ClearTimeEvents() {
    for (let i = 0; i < timeCountEvents.length; i++) {
        timeCountEvents[i].remove();
    }

    timeCountEvents = [];
}

function Destroy() {
    // Clean up all tracked events
    bossResources.events.forEach(({ target, event, handler }) => {
        if (target && target.off) {
            target.off(event, handler);
        }
    });

    // Stop all tracked tweens
    bossResources.tweens.forEach(tween => {
        if (tween && tween.isActive && tween.isActive()) {
            tween.stop();
        }
    });

    // Remove all tracked timers
    bossResources.timers.forEach(timer => {
        if (timer && timer.remove) {
            timer.remove();
        }
    });

    if (container_main) {
        container_main.destroy();
    }

    ClearTimeEvents();

    container_main = null;
    container_popup = null;
    container_list = null;
    container_popup_buttons = null;

    // Reset resources
    bossResources = {
        events: [],
        tweens: [],
        timers: []
    };
}

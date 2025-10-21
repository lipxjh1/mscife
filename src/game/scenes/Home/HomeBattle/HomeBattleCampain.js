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
import { CreateReplayPopup } from "./HomeBattleCampainReplayPopup.js";
import { CreateGuidePlayCampian } from "../../Guide/GuidePlayCampian.js";
import { HideTopBarNotice, OpenTopBarNotice } from "../HomeTopBarPlayer.js";

let container_main = null;

let container_popup = null;

let container_list = null;

let container_popup_buttons = null;

let isOpen = false;

export function CreateCampain(scene) {
    centerData.replayStage = 0;

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
                .image(0, 0, "home_battle_campaign_bg")
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
                        CloseCampian(scene);

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

            CreateGuidePlayCampian(scene);

            OpenCampain(scene);
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

    let earth = CreateItemMap(scene, scrollablePanel);
    btnArr.push(earth);
    earth.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "Earth"
        )
    );
    earth.bg.setTexture("home_battle_item_bg_campain_earth");
    earth.setLevelStartEnd(1, 20);
    //earth.setReplay(0, 0);

    earth.btn_play.button.on("pointerdown", function () {
        PlayCampain(scene);
    });

    earth.btn_replay.button.on("pointerdown", function () {
        if (earth.btn_replay.button.input) {
            CreateReplayPopup(scene, 0); // startStage = 0 để lấy các milestone: 5, 10, 15, 20
        }
    });

    let space = CreateItemMap(scene, scrollablePanel);
    btnArr.push(space);
    space.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "Space"
        )
    );
    space.bg.setTexture("home_battle_item_bg_campain_space");
    space.setLevelStartEnd(21, 40);
    //space.setActive(false);
    space.btn_play.button.on("pointerdown", function () {
        PlayCampain(scene);
    });

    space.btn_replay.button.on("pointerdown", function () {
        if (space.btn_replay.button.input) {
            CreateReplayPopup(scene, 20); // startStage = 20 để lấy các milestone: 25, 30, 35, 40
        }
    });

    let mars = CreateItemMap(scene, scrollablePanel);
    btnArr.push(mars);
    mars.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "Mars"
        )
    );
    mars.bg.setTexture("home_battle_item_bg_campain_mars");
    mars.setLevelStartEnd(41, 60);
    //mars.setActive(false);
    mars.btn_play.button.on("pointerdown", function () {
        PlayCampain(scene);
    });

    mars.btn_replay.button.on("pointerdown", function () {
        if (mars.btn_replay.button.input) {
            CreateReplayPopup(scene, 40); // startStage = 40 để lấy các milestone: 45, 50, 55, 60
        }
    });

    let return_earth = CreateItemMap(scene, scrollablePanel);
    btnArr.push(return_earth);
    return_earth.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "Return Earth"
        )
    );
    return_earth.bg.setTexture("home_battle_item_bg_campain_back_to_earth");
    return_earth.setLevelStartEnd(61, 80);
    return_earth.setActive(false);

    // Thêm click handlers cho return_earth (sẽ được enable khi unlock từ API)
    return_earth.btn_play.button.on("pointerdown", function () {
        PlayCampain(scene);
    });

    return_earth.btn_replay.button.on("pointerdown", function () {
        if (return_earth.btn_replay.button.input) {
            CreateReplayPopup(scene, 60); // startStage = 60 để lấy các milestone: 65, 70, 75, 80
        }
    });

    let X_Corp = CreateItemMap(scene, scrollablePanel);
    btnArr.push(X_Corp);
    X_Corp.text_name.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
            "X-Corp"
        )
    );
    X_Corp.bg.setTexture("home_battle_item_bg_campain_xcorp");
    X_Corp.setLevelStartEnd(81, 100);
    X_Corp.setActive(false);

    // Thêm click handlers cho X_Corp (sẽ được enable khi unlock từ API)
    X_Corp.btn_play.button.on("pointerdown", function () {
        PlayCampain(scene);
    });

    X_Corp.btn_replay.button.on("pointerdown", function () {
        if (X_Corp.btn_replay.button.input) {
            CreateReplayPopup(scene, 80); // startStage = 80 để lấy các milestone: 85, 90, 95, 100
        }
    });

    centerData.RequestCheckPointStatus(
        (result) => {
            // Tạo map để dễ dàng tìm kiếm dữ liệu theo stageId
            const stageDataMap = {};
            result.data.forEach((stageData) => {
                stageDataMap[stageData.stageId] = stageData;
            });

            // Xử lý từng campaign item
            btnArr.forEach((btn, index) => {
                if (btn != null) {
                    // Tìm dữ liệu cho stage cuối cùng của campaign này để hiển thị top player
                    const stageData = stageDataMap[btn.levelEnd];
                    if (stageData) {
                        // Cập nhật top player info
                        btn.setTopInfo(stageData.topPlayer);
                    }

                    // Đánh dấu đã được xử lý từ API
                    btn.isProcessedByAPI = true;

                    // Kiểm tra và enable replay button dựa trên current stage
                    const currentStage = centerData.userInfo.CurrentStage;

                    // Tính số stage có thể replay (các stage milestone: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100)
                    const replayStages = [];
                    // Tạo danh sách các milestone stages trong phạm vi campaign này
                    for (let i = 1; i <= 20; i++) {
                        const stageId = i * 5; // 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
                        // Chỉ lấy các stage trong phạm vi campaign và đã được unlock (chỉ cho replay khi đã vượt qua milestone)
                        if (
                            stageId >= btn.levelStart &&
                            stageId <= btn.levelEnd &&
                            currentStage > stageId
                        ) {
                            replayStages.push(stageId);
                        }
                    }

                    // console.log("Campaign:", btn.levelStart, "-", btn.levelEnd);
                    // console.log("Current stage:", currentStage);
                    // console.log("Replay stages:", replayStages);

                    // Tính tổng số replay còn lại cho các stage có thể replay
                    let availableRemainingReplays = 0;
                    let availableMaxReplays = 0;

                    // Lấy dữ liệu replay cho các stage có thể replay
                    replayStages.forEach((stageId) => {
                        const stageData = stageDataMap[stageId];
                        //console.log("Stage", stageId, "data:", stageData);
                        if (stageData) {
                            availableRemainingReplays +=
                                stageData.remainingReplays;
                            availableMaxReplays += stageData.maxReplays;
                        }
                    });

                    //console.log("availableRemainingReplays: ", availableRemainingReplays);
                    //console.log("availableMaxReplays: ", availableMaxReplays);

                    // Nếu current stage đã vượt qua campaign này, enable replay
                    if (currentStage > btn.levelEnd) {
                        // Campaign đã hoàn thành, enable replay
                        if (btn.btn_replay) {
                            btn.btn_replay.setVisible(true);
                            btn.btn_replay.button.setInteractive(true);
                            // Cập nhật text hiển thị tổng số replay còn lại
                            btn.setReplay(
                                availableRemainingReplays,
                                availableMaxReplays
                            );
                        }
                    } else if (
                        currentStage >= btn.levelStart &&
                        currentStage <= btn.levelEnd
                    ) {
                        // Đang trong campaign, kiểm tra xem có thể replay stage nào

                        // Nếu có stage có thể replay, enable replay button
                        if (replayStages.length > 0) {
                            if (btn.btn_replay) {
                                btn.btn_replay.setVisible(true);
                                btn.btn_replay.button.setInteractive(true);
                                // Cập nhật text hiển thị tổng số replay còn lại
                                btn.setReplay(
                                    availableRemainingReplays,
                                    availableMaxReplays
                                );
                            }
                        } else {
                            // Không có stage nào có thể replay
                            if (btn.btn_replay) {
                                btn.btn_replay.setVisible(false);
                                btn.btn_replay.button.disableInteractive();
                            }
                        }
                    } else {
                        // Chưa đến campaign này, disable replay
                        if (btn.btn_replay) {
                            btn.btn_replay.setVisible(false);
                            btn.btn_replay.button.disableInteractive();
                        }
                    }
                }
            });
        },
        (error) => {
            //console.error("Error loading checkpoint status:", error);
        }
    );
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

function CreateReplayButton(scene, container, x, y, imageKey) {
    let btnWidth = 380;
    let btnHeight = 90;

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
        .text(btnWidth / 2, btnHeight / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "36px", // Font-size
            color: "#FFF", // Màu chữ (color)
            align: "center",
        })
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(btn_container.text);

    btn_container.replayFrom = 0;
    btn_container.replayTo = 0;

    btn_container.setPlayTimes = function (from, to) {
        btn_container.replayFrom = from;
        btn_container.replayTo = to;

        btn_container.text.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeCampian.KEY,
                "Replay"
            ) +
                " " +
                String(btn_container.replayFrom).padStart(2, "0") +
                "/" +
                String(btn_container.replayTo).padStart(2, "0")
        );
    };

    return btn_container;
}

function CreateItemMap(scene, scrollablePanel) {
    let itemWidth = 1034;
    let itemHeight = 368;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add
        .image(0, 0, "home_battle_item_bg_campain")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

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

    const container_top = scene.add.container(417, 0);
    container_inner.add(container_top);

    item.topIcon = scene.add
        .image(0, 30, "home_battle_top_icon")
        .setDisplaySize(75, 75)
        .setOrigin(0, 0);
    container_top.add(item.topIcon);

    item.topAvatar = scene.add
        .image(120, 30, "home_battle_top_icon")
        .setDisplaySize(75, 75)
        .setOrigin(0, 0);
    container_top.add(item.topAvatar);

    item.text_top_user = scene.add
        .text(0, 105, "Top User", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFFFFF",
            align: "left",
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(0, 0);
    container_top.add(item.text_top_user);

    // item.text_top_reward = scene.add
    //     .text(0, 135, "Reward: 00 Chip/day", {
    //         fontFamily: cdLocalization.getCurrentFont(),
    //         fontSize: "24px",
    //         color: "#FFFFFF",
    //         align: "left",
    //         stroke: "#000000",
    //         strokeThickness: 5,
    //     })
    //     .setOrigin(0, 0);
    // container_top.add(item.text_top_reward);

    item.text_top_time = scene.add
        .text(0, 135, "Time: 00:00:00", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFFFFF",
            align: "left",
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(0, 0);
    container_top.add(item.text_top_time);

    item.levelStart = 0;
    item.levelEnd = 0;
    item.isProcessedByAPI = false;

    item.setLevelStartEnd = function (lvlStart, lvlEnd) {
        item.levelStart = lvlStart;
        item.levelEnd = lvlEnd;

        let currentLevel = centerData.userInfo.CurrentStage;

        const totalLevels = item.levelEnd - item.levelStart + 1;
        const levelsInStage = Math.min(
            Math.max(currentLevel - item.levelStart + 1, 0),
            totalLevels
        );

        // Hiển thị theo mẫu 03/20
        const formattedLevel = String(levelsInStage).padStart(2, "0");
        const formattedTotal = String(totalLevels).padStart(2, "0");

        // Cập nhật nội dung text
        item.text_level.setText(`${formattedLevel}/${formattedTotal}`);

        // console.log(
        //     "centerData.userInfo.CurrentStage: ",
        //     centerData.userInfo.CurrentStage
        // );
        // console.log("item.levelStart: ", item.levelStart);
        // console.log("item.levelEnd: ", item.levelEnd);

        if (
            centerData.userInfo.CurrentStage >= item.levelStart &&
            centerData.userInfo.CurrentStage <= item.levelEnd
        ) {
            item.setActive(true);

            item.text_info.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeCampian.KEY,
                    "Daily Chip reward: +"
                ) + centerData.StageInfo.DailyPointReward
            );

            CreateRewardList(scene, item.container_inner);
        } else {
            if (centerData.userInfo.CurrentStage > item.levelEnd) {
                // Chỉ xử lý nếu chưa được xử lý từ API
                if (!item.isProcessedByAPI) {
                    // Không gọi setPass() ở đây vì sẽ được xử lý bởi RequestCheckPointStatus
                    // Chỉ ẩn play button và lock button
                    btn_play.setVisible(false);
                    btn_play.button.disableInteractive();
                    btn_lock.setVisible(false);
                    btn_lock.button.disableInteractive();
                }
            } else {
                item.setActive(false);
            }
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

    const btn_play = CreateFightButton(
        scene,
        container_inner,
        746 + 248 / 2,
        110 + 78 / 2, // Điều chỉnh Y cao hơn để không lấp với nút replay
        "home_battle_btn",
        "Fight"
    );
    item.btn_play = btn_play;

    const btn_lock = CreateFightButton(
        scene,
        container_inner,
        746 + 248 / 2,
        110 + 78 / 2, // Điều chỉnh Y cao hơn để không lấp với nút replay
        "home_battle_btn_lock",
        "Fight"
    );
    item.btn_lock = btn_lock;

    const btn_replay = CreateReplayButton(
        scene,
        container_inner,
        626 + 380 / 2,
        200 + 90 / 2,
        "home_battle_btn_replay"
    );
    item.btn_replay = btn_replay;
    item.btn_replay.setVisible(false);

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

    item.setTopInfo = function (topPlayer) {
        if (topPlayer && topPlayer.username) {
            container_top.setVisible(true);

            item.topAvatar.setTexture(topPlayer.avatar);
            item.topAvatar.setDisplaySize(75, 75);

            item.text_top_user.setText(topPlayer.username);
            item.text_top_time.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeCampian.KEY,
                    "Time: "
                ) + topPlayer.completionTimeFormatted
            );
        } else {
            container_top.setVisible(false);
        }
    };

    item.setReplay = function (from, to) {
        btn_replay.setPlayTimes(from, to);
    };

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

export function PlayCampain(scene) {
    CreateLoadingPopup();

    let assetsToLoad = 4; // Tăng số lượng assets cần tải: UI, Map, Enemy, Player
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();

            scene.scene.start("Gameplay");
        }
    };

    AssetLoadingManager.getInstance().init(scene);

    let CurrentStage = centerData.userInfo.CurrentStage;

    if (centerData.replayStage > 0) {
        CurrentStage = centerData.replayStage;
    }

    // 1. Tải UI gameplay
    AssetLoadingManager.getInstance().loadGameplayUI(() => {
        onAssetLoaded();
    });

    // 2. Tải map theo stage
    const mapId =
        AssetLoadingManager.getInstance().getMapIdFromStage(CurrentStage);
    AssetLoadingManager.getInstance().loadMap(mapId, () => {
        onAssetLoaded();
    });

    // 3. Tải enemy theo range của stage
    const enemyRange =
        AssetLoadingManager.getInstance().getEnemyRangeFromStage(CurrentStage);
    AssetLoadingManager.getInstance().loadEnemyByRange(enemyRange, () => {
        onAssetLoaded();
    });

    // 4. Tải character models
    let arrIds = centerData.getSelectedPlayerLocalIds();
    AssetPlayerLoadingManager.getInstance().init(scene);
    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterSpineGameplay(
        arrIds,
        () => {
            onAssetLoaded();
        }
    );
}

function CreateRewardList(scene, fatherContainer) {
    //Create friend list
    let container_reward_list = scene.add.container(0, 0);
    fatherContainer.add(container_reward_list);

    let columns = 0;

    if (
        centerData.StageInfo.ChipReward &&
        centerData.StageInfo.ChipReward > 0
    ) {
        columns += 1;
    }

    if (centerData.StageInfo.CharacterRewards) {
        columns += centerData.StageInfo.CharacterRewards.length;
    }

    const rows = 1;

    const itemSpacing = 10;

    let itemWidth = 130;
    let itemHeight = 130;

    // Kích thước của ScrollView
    const scrollViewWidth = 650;
    const scrollViewHeight = 130;

    const posX = 24 + scrollViewWidth / 2;
    const posY = 189 + scrollViewHeight / 2;

    // const background = scene.add
    //     .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0xffffff)
    //     .setAlpha(0.4);

    // container_reward_list.add(background);

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
                    align: {
                        left: 0, //number(0 - 1),
                        right: 0, //number(0 - 1),
                        top: 1, //number(0 - 1),
                        bottom: 0, //number(0 - 1),
                        center: true, //boolean,
                    },
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

    container_reward_list.add(scrollablePanel);

    scrollablePanel.input = false;
    scrollablePanel.getElement("scroller").setEnable(false);

    CreateItemRewardList(scene, scrollablePanel);

    scrollablePanel.layout();

    // let maskShape = scene.add
    //     .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
    //     .setVisible(false);
    // container_reward_list.add(maskShape);

    // let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    // scrollablePanel.setMask(mask);
}

function CreateItemRewardList(scene, scrollablePanel) {
    let chip = CreateItemReward(scene, scrollablePanel);
    chip.text_value.setText(centerData.StageInfo.ChipReward);
    chip.icon
        .setTexture("home_top_currency_chip_1")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(100, 100);

    let arr_ids = [];

    for (let i = 0; i < centerData.StageInfo.CharacterRewards.length; i++) {
        let rewardChar = centerData.StageInfo.CharacterRewards[i];

        arr_ids.push(rewardChar.code);

        let character = CreateItemReward(scene, scrollablePanel);
        character.text_value.setText(1);

        character.text_rank = scene.add
            .text(120 / 2, 120 / 2, rewardChar.RateOfCharacter.toUpperCase(), {
                fontFamily: "Russo One",
                fontSize: "80px",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 5,
                wordWrap: { width: 120 / 2, useAdvancedWrap: true },
            })
            .setOrigin(0.5, 0.5);
        character.container_inner.add(character.text_rank);

        character.icon.setVisible(false);
    }
}

function CreateItemReward(scene, scrollablePanel) {
    //console.log("CreateItem");

    let itemWidth = 130;
    let itemHeight = 130;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    // const background = scene.add
    //     .rectangle(0, 0, 200, 200, 0xff0000)
    //     .setAlpha(0.8);

    // item.add(background);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add
        .image(0, 0, "home_battle_item_reward_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.icon = scene.add
        .image(itemWidth / 2, itemHeight / 2, "home_top_currency_chip_1")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(100, 100);
    container_inner.add(item.icon);

    item.text_value = scene.add
        .text(125, 125, 0, {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 5,
            wordWrap: { width: itemWidth, useAdvancedWrap: true },
        })
        .setOrigin(1, 1);
    container_inner.add(item.text_value);

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

export function IsOpen() {
    return isOpen;
}

function OpenCampain(scene) {
    isOpen = true;

    HideTopBarNotice(scene);
}

function CloseCampian(scene) {
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

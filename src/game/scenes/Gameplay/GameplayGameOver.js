import centerData from "../../Data/CenterData";
import cdLocalization from "../../Data/CenterDataLocalization";
import centerDataPlayer from "../../Data/CenterDataPlayer";
import { AssetLoadingManager } from "../AssetLoadingManager";
import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager";
import { CreateFirstMissions } from "../Home/HomeFirstMissions";
import { CreateAlertPopup, CreateLoadingPopup, HideLoadingPopup } from "../Share/AlertPopup";

let container_main = null;

let canClick = false;

let rewardData = null;

let container_list = null;

// Track all resources for cleanup
let gameOverResources = {
    events: [],
    tweens: []
};

// Helper to create button with event tracking
function createButtonWithTracking(scene, x, y, texture, onClick) {
    const button = scene.add
        .image(x, y, texture)
        .setInteractive({ useHandCursor: true });

    button.on("pointerdown", onClick);
    gameOverResources.events.push({ target: button, event: "pointerdown", handler: onClick });

    // Add hover effects if needed
    const onOver = () => {
        scene.tweens.add({
            targets: button,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            ease: "Power2"
        });
    };

    const onOut = () => {
        scene.tweens.add({
            targets: button,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: "Power2"
        });
    };

    button.on("pointerover", onOver);
    button.on("pointerout", onOut);
    gameOverResources.events.push({ target: button, event: "pointerover", handler: onOver });
    gameOverResources.events.push({ target: button, event: "pointerout", handler: onOut });

    return button;
}

export function CreateGameOver(scene, isVictory = false, data) {
    rewardData = data;

    // Destroy previous container if exists
    if (container_main != null) {
        container_main.destroy();
    }

    // Reset resources
    gameOverResources = {
        events: [],
        tweens: []
    };

    canClick = false;

    container_main = scene.add.container(0, 0).setDepth(200);

    const black_bg = scene.add
        .rectangle(0, 0, window.originWidth, window.originHeight)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    // Track background click (does nothing but still needs tracking)
    const onBgClick = function () {
        // Background click does nothing in game over screen
    };
    black_bg.on("pointerdown", onBgClick);
    gameOverResources.events.push({ target: black_bg, event: "pointerdown", handler: onBgClick });
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.75;

    container_main.add(black_bg);

    const popup_bg = scene.add
        .image(0, 0, "gameplay_game_over_popup_bg")
        .setOrigin(0, 0);
    container_main.add(popup_bg);

    popup_bg.setPosition(-2000, 0);

    scene.tweens.add({
        targets: popup_bg,
        x: 0,
        duration: 500,
        ease: "power2",
        delay: 0,
        onComplete: () => {},
    });

    if (isVictory) {
        const img_text = scene.add
            .image(540, 766, "gameplay_game_complete_text")
            .setOrigin(0.5, 0);

        container_main.add(img_text);

        img_text.y = -2000;
        scene.tweens.add({
            targets: img_text,
            y: 766,
            duration: 750,
            ease: "Bounce.easeOut",
            delay: 500,
            onComplete: () => {},
        });

        if (centerData.replayStage <= 0) {
            centerData.userInfo.CurrentStage += 1;
            
            const btn_next = scene.add
                .image(540, 1497, "gameplay_game_over_btn_next")
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", (pointer) => {
                    centerData.RequestUserInfo(
                        () => {
                            if (centerData.userInfo.CurrentStage > 60) {
                                CreateAlertPopup(
                                    scene,
                                    cdLocalization.getLocalization(
                                        cdLocalization.GROUP_KEYS.HomeCampian
                                            .KEY,
                                        "You have reached level "
                                    ) + 60
                                );
                            } else {
                                PlayCampain(scene);
                            }
                        },
                        (errorMessage) => {
                            CreateAlertPopup(
                                "Fail to play game\n" + errorMessage
                            );
                        }
                    );
                })
                .on("pointerover", function () {
                    scene.tweens.add({
                        targets: btn_next,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 100,
                        ease: "Power2",
                    });
                })
                .on("pointerout", function () {
                    scene.tweens.add({
                        targets: btn_next,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        ease: "Power2",
                    });
                });
            container_main.add(btn_next);
        }

        const btn_exit = scene.add
            .image(540, 1598, "gameplay_game_over_btn_exit")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                scene.scene.start("Home");
            })
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_exit,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_exit,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: "Power2",
                });
            });
        container_main.add(btn_exit);

        CreateList(scene);

        centerData.RequestVipStatus(() => {
            let dailyPointReward = rewardData.reward.dailyPointReward;

            if (
                centerData.vipStatus.data.isActive == true &&
                centerData.vipStatus.data.benefits.doubleChipRewards == true
            ) {
                dailyPointReward = rewardData.reward.dailyPointReward * 2;
            }

            if (centerData.replayStage <= 0) {
                let text_daily_chip_reward = scene.add
                    .text(
                        540,
                        1390,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.HomeCampian.KEY,
                            "Daily Chip reward: +"
                        ) + dailyPointReward,
                        {
                            fontFamily: cdLocalization.getCurrentFont(),
                            fontSize: "48px",
                            color: "#ffffff",
                            shadow: {
                                offsetX: 2,
                                offsetY: 2,
                                color: "#FF9D00",
                                blur: 7,
                                stroke: true,
                                fill: true,
                            },
                            align: "center",
                        }
                    )
                    .setOrigin(0.5, 0.5);

                container_main.add(text_daily_chip_reward);
            }
        });

        if (centerData.replayStage > 0) {
            centerData.RequestCheckPointStatus(
                (result) => {
                    let remainingReplays = 0;

                    for (let i = 0; i < result.data.length; i++) {
                        let replayData = result.data[i];

                        if (centerData.replayStage == replayData.stageId) {
                            remainingReplays = replayData.remainingReplays;
                        }
                    }

                    if (remainingReplays > 0) {
                        const btn_again = scene.add
                            .image(
                                540,
                                1497,
                                "gameplay_game_over_btn_playagain"
                            )
                            .setInteractive({ useHandCursor: true })
                            .on("pointerdown", (pointer) => {
                                PlayCampain(scene);
                            })
                            .on("pointerover", function () {
                                scene.tweens.add({
                                    targets: btn_again,
                                    scaleX: 1.2,
                                    scaleY: 1.2,
                                    duration: 100,
                                    ease: "Power2",
                                });
                            })
                            .on("pointerout", function () {
                                scene.tweens.add({
                                    targets: btn_again,
                                    scaleX: 1,
                                    scaleY: 1,
                                    duration: 100,
                                    ease: "Power2",
                                });
                            });
                        container_main.add(btn_again);
                    } else {
                        CreateAlertPopup(
                            scene,
                            cdLocalization.getLocalization(
                                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                                "No replays left"
                            )
                        );
                    }
                },
                (error) => {}
            );
        }

        if (centerData.userInfo.CurrentStage === 5) {
        }
    } else {
        const img_text = scene.add
            .image(540, 766, "gameplay_game_over_text")
            .setOrigin(0.5, 0);

        container_main.add(img_text);

        img_text.y = -2000;
        scene.tweens.add({
            targets: img_text,
            y: 766,
            duration: 750,
            ease: "Bounce.easeOut",
            delay: 500,
            onComplete: () => {},
        });

        if (centerData.replayStage > 0) {
            centerData.RequestCheckPointStatus(
                (result) => {
                    let remainingReplays = 0;

                    for (let i = 0; i < result.data.length; i++) {
                        let replayData = result.data[i];

                        if (centerData.replayStage == replayData.stageId) {
                            remainingReplays = replayData.remainingReplays;
                        }
                    }

                    if (remainingReplays > 0) {
                        const btn_again = scene.add
                            .image(
                                540,
                                1497,
                                "gameplay_game_over_btn_playagain"
                            )
                            .setInteractive({ useHandCursor: true })
                            .on("pointerdown", (pointer) => {
                                PlayCampain(scene);
                            })
                            .on("pointerover", function () {
                                scene.tweens.add({
                                    targets: btn_again,
                                    scaleX: 1.2,
                                    scaleY: 1.2,
                                    duration: 100,
                                    ease: "Power2",
                                });
                            })
                            .on("pointerout", function () {
                                scene.tweens.add({
                                    targets: btn_again,
                                    scaleX: 1,
                                    scaleY: 1,
                                    duration: 100,
                                    ease: "Power2",
                                });
                            });
                        container_main.add(btn_again);
                    } else {
                        CreateAlertPopup(
                            scene,
                            cdLocalization.getLocalization(
                                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                                "No replays left"
                            )
                        );
                    }
                },
                (error) => {}
            );
        } else {
            const btn_again = scene.add
                .image(540, 1497, "gameplay_game_over_btn_playagain")
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", (pointer) => {
                    PlayCampain(scene);
                })
                .on("pointerover", function () {
                    scene.tweens.add({
                        targets: btn_again,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 100,
                        ease: "Power2",
                    });
                })
                .on("pointerout", function () {
                    scene.tweens.add({
                        targets: btn_again,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        ease: "Power2",
                    });
                });
            container_main.add(btn_again);
        }

        const btn_exit = scene.add
            .image(540, 1598, "gameplay_game_over_btn_exit")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                scene.scene.start("Home");
            })
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_exit,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_exit,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: "Power2",
                });
            });
        container_main.add(btn_exit);
    }
}

function CreateList(scene) {
    container_list = scene.add.container(0, 0);
    container_main.add(container_list);

    let columns = 0;

    if (rewardData.reward.chipReward && rewardData.reward.chipReward > 0) {
        columns += 1;
    }

    if (rewardData.reward.characterRewards) {
        columns += rewardData.reward.characterRewards.length;
    }

    const rows = 1;

    const itemSpacing = 10;

    let itemWidth = 200;
    let itemHeight = 200;

    const scrollViewWidth = itemWidth * columns + itemSpacing * (columns - 1);
    const scrollViewHeight = 200;

    const posX = 540;
    const posY = 1143 + scrollViewHeight / 2;

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
                        left: 0,
                        right: 0,
                        top: 1,
                        bottom: 0,
                        center: true,
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

    container_list.add(scrollablePanel);

    scrollablePanel.input = false;
    scrollablePanel.getElement("scroller").setEnable(false);

    CreateItemList(scene, scrollablePanel);

    scrollablePanel.layout();
}

function CreateItemList(scene, scrollablePanel) {
    let chip = CreateItem(scene, scrollablePanel);
    chip.text_value.setText(rewardData.reward.chipReward);
    chip.icon
        .setTexture("home_top_currency_chip_1")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(170, 170);

    let arr_ids = [];

    if (rewardData.reward.characterRewards) {
        for (let i = 0; i < rewardData.reward.characterRewards.length; i++) {
            let rewardChar = rewardData.reward.characterRewards[i];

            arr_ids.push(rewardChar.code);
        }
    }

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        arr_ids,
        () => {
            for (let i = 0; i < arr_ids.length; i++) {
                let pData = centerDataPlayer.getPlayerById(arr_ids[i]);

                let character = CreateItem(scene, scrollablePanel);
                character.text_value.setText(1);

                character.icon
                    .setTexture(pData.cardImgInventoryKey)
                    .setOrigin(0.5, 0.5)
                    .setDisplaySize(170, 170);
            }

            scrollablePanel.layout();
        }
    );
}

function CreateItem(scene, scrollablePanel) {
    let itemWidth = 200;
    let itemHeight = 200;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);

    item.bg = scene.add
        .image(0, 0, "gameplay_game_complete_reward_item_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.icon = scene.add
        .image(100, 100, "home_top_currency_chip_1")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(170, 170);
    container_inner.add(item.icon);

    item.text_value = scene.add
        .text(200 - 10, 200 - 10, 0, {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
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

function PlayCampain(scene) {
    CreateLoadingPopup();

    let assetsToLoad = 4; // Tăng số lượng assets cần tải: UI, Map, Enemy, Player
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();

            // CRITICAL FIX: Ensure proper scene transition order
            // Wait a frame to ensure old scene cleanup is complete
            scene.time.delayedCall(100, () => {
                console.log('[PlayCampain] All assets loaded, starting Gameplay scene...');
                scene.scene.start("Gameplay");
            });
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
    const mapId = AssetLoadingManager.getInstance().getMapIdFromStage(CurrentStage);
    AssetLoadingManager.getInstance().loadMap(mapId, () => {
        onAssetLoaded();
    });

    // 3. Tải enemy theo range của stage
    const enemyRange = AssetLoadingManager.getInstance().getEnemyRangeFromStage(CurrentStage);
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

// Add cleanup function for Game Over screen
export function DestroyGameOver() {
    // Clean up all tracked events
    gameOverResources.events.forEach(({ target, event, handler }) => {
        if (target && target.off) {
            target.off(event, handler);
        }
    });

    // Stop all tracked tweens
    gameOverResources.tweens.forEach(tween => {
        if (tween && tween.isActive && tween.isActive()) {
            tween.stop();
        }
    });

    if (container_main && container_main.destroy) {
        container_main.destroy();
        container_main = null;
    }

    // Reset resources
    gameOverResources = {
        events: [],
        tweens: []
    };
}

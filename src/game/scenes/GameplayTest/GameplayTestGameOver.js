import centerData from "../../Data/CenterData";
import cdLocalization from "../../Data/CenterDataLocalization";
import centerDataPlayer from "../../Data/CenterDataPlayer";
import { AssetLoadingManager } from "../AssetLoadingManager";
import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager";
import { CreateFirstMissions } from "../Home/HomeFirstMissions";
import { CreateAlertPopup } from "../Share/AlertPopup";

let container_main = null;

let canClick = false;

let rewardData = null;

let container_list = null;

export function CreateGameOver(scene, isVictory = false, data) {
    rewardData = data;

    if (container_main != null) {
        container_main.destroy();
    }

    canClick = false;

    // Tạo một container
    container_main = scene.add.container(0, 0).setDepth(200); // Tọa độ của container

    const black_bg = scene.add
        .rectangle(0, 0, window.originWidth, window.originHeight)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("bg clicked");
        });
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
        targets: popup_bg, // Đối tượng chữ cần tween
        x: 0, // Chuyển từ -100 (phía trên màn hình) đến centerY (giữa màn hình)
        duration: 500, // Thời gian tween (ms)
        ease: "power2", // Kiểu easing tạo hiệu ứng nảy
        delay: 0, // Thời gian chờ 1 giây trước khi bắt đầu tween
        onComplete: () => {},
    });

    if (isVictory) {
        const img_text = scene.add
            .image(540, 766, "gameplay_game_complete_text")
            .setOrigin(0.5, 0);

        container_main.add(img_text);

        img_text.y = -2000;
        scene.tweens.add({
            targets: img_text, // Đối tượng chữ cần tween
            y: 766, // Chuyển từ -100 (phía trên màn hình) đến centerY (giữa màn hình)
            duration: 750, // Thời gian tween (ms)
            ease: "Bounce.easeOut", // Kiểu easing tạo hiệu ứng nảy
            delay: 500, // Thời gian chờ 1 giây trước khi bắt đầu tween
            onComplete: () => {},
        });

        const btn_again = scene.add
            .image(540, 1497, "gameplay_game_over_btn_playagain")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                scene.scene.start("GameplayTest");
            })
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_again,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_again,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        container_main.add(btn_again);

        const btn_exit = scene.add
            .image(540, 1598, "gameplay_game_over_btn_exit")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                scene.scene.start("Home");
            })
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_exit,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_exit,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        container_main.add(btn_exit);
    } else {
        const img_text = scene.add
            .image(540, 766, "gameplay_game_over_text")
            .setOrigin(0.5, 0);

        container_main.add(img_text);

        img_text.y = -2000;
        scene.tweens.add({
            targets: img_text, // Đối tượng chữ cần tween
            y: 766, // Chuyển từ -100 (phía trên màn hình) đến centerY (giữa màn hình)
            duration: 750, // Thời gian tween (ms)
            ease: "Bounce.easeOut", // Kiểu easing tạo hiệu ứng nảy
            delay: 500, // Thời gian chờ 1 giây trước khi bắt đầu tween
            onComplete: () => {},
        });

        const btn_again = scene.add
            .image(540, 1497, "gameplay_game_over_btn_playagain")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                scene.scene.start("GameplayTest");
            })
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_again,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_again,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        container_main.add(btn_again);

        const btn_exit = scene.add
            .image(540, 1598, "gameplay_game_over_btn_exit")
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", (pointer) => {
                scene.scene.start("Home");
            })
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_exit,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_exit,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        container_main.add(btn_exit);
    }

    // const text_continue = scene.add
    //     .text(540, 1261, "Tap to continue", {
    //         fontFamily: "Russo One",
    //         fontSize: "40px",
    //         color: "#BBCFE7",
    //         shadow: {
    //             offsetX: 0,
    //             offsetY: 0,
    //             color: "#268BFF",
    //             blur: 11.5,
    //             fill: true,
    //         },
    //     })
    //     .setOrigin(0.5, 0);

    // container_main.add(text_continue);

    // text_continue.alpha = 0;
    // scene.tweens.add({
    //     targets: text_continue, // Đối tượng chữ cần tween
    //     alpha: 1, // Chuyển từ -100 (phía trên màn hình) đến centerY (giữa màn hình)
    //     duration: 500, // Thời gian tween (ms)
    //     ease: "linear", // Kiểu easing tạo hiệu ứng nảy
    //     delay: 250, // Thời gian chờ 1 giây trước khi bắt đầu tween
    //     onComplete: () => {},
    // });

    // scene.time.delayedCall(750, () => {
    //     canClick = true;
    // });
}

function CreateList(scene) {
    //console.log("rewardData: ", rewardData);

    //Create friend list
    container_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_main.add(container_list);

    let columns = 0;

    // if (
    //     rewardData.reward.dailyPointReward &&
    //     rewardData.reward.dailyPointReward > 0
    // ) {
    //     columns += 1;

    //     console.log(
    //         "CreateList dailyPointReward: ",
    //         rewardData.reward.dailyPointReward
    //     );
    // }

    if (rewardData.reward.chipReward && rewardData.reward.chipReward > 0) {
        columns += 1;

        //console.log("CreateList chipReward: ", rewardData.reward.chipReward);
    }

    if (rewardData.reward.characterRewards) {
        columns += rewardData.reward.characterRewards.length;

        // console.log(
        //     "CreateList characterRewards: ",
        //     rewardData.reward.characterRewards
        // );
    }

    //console.log("CreateList columns: ", columns);

    const rows = 1;

    const itemSpacing = 10;

    let itemWidth = 200;
    let itemHeight = 200;

    // Kích thước của ScrollView
    const scrollViewWidth = itemWidth * columns + itemSpacing * (columns - 1);
    const scrollViewHeight = 200;

    const posX = 540;
    const posY = 1143 + scrollViewHeight / 2;

    // const background = scene.add
    //     .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0xffffff)
    //     .setAlpha(0.4);

    // container_list.add(background);

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

    container_list.add(scrollablePanel);

    scrollablePanel.input = false;
    scrollablePanel.getElement("scroller").setEnable(false);

    CreateItemList(scene, scrollablePanel);

    scrollablePanel.layout();

    // let maskShape = scene.add
    //     .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
    //     .setVisible(false);
    // container_list.add(maskShape);

    // let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    // scrollablePanel.setMask(mask);
}

function CreateItemList(scene, scrollablePanel) {
    let chip = CreateItem(scene, scrollablePanel);
    chip.text_value.setText(rewardData.reward.chipReward);
    chip.icon
        .setTexture("home_top_currency_chip_1")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(170, 170);

    let arr_ids = [];

    for (let i = 0; i < rewardData.reward.characterRewards.length; i++) {
        let rewardChar = rewardData.reward.characterRewards[i];

        arr_ids.push(rewardChar.code);
    }

    //console.log("arr_ids: ", arr_ids);

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
    //console.log("CreateItem");

    let itemWidth = 200;
    let itemHeight = 200;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    // const background = scene.add
    //     .rectangle(0, 0, 200, 200, 0xff0000)
    //     .setAlpha(0.8);

    // item.add(background);

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

    // item.text_info = scene.add
    //     .text(38, 102, "the infomation", {
    //         fontFamily: "Russo One",
    //         fontSize: "28px",
    //         color: "#CCCCCC",
    //         align: "left",
    //         wordWrap: { width: 618, useAdvancedWrap: true },
    //     })
    //     .setOrigin(0, 0);
    // container_inner.add(item.text_info);

    // const btn_play = scene.add
    //     .image(746 + 240 / 2, 199 + 70 / 2, "home_battle_btn_fight")
    //     .setOrigin(0.5, 0.5)
    //     .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
    //     .on("pointerdown", function () {})
    //     .on("pointerover", function () {
    //         scene.tweens.add({
    //             targets: btn_play,
    //             scaleX: 1.2, // Phóng to 20% theo chiều ngang
    //             scaleY: 1.2, // Phóng to 20% theo chiều dọc
    //             duration: 100, // Thời gian hiệu ứng (ms)
    //             ease: "Power2",
    //         });
    //     })
    //     .on("pointerout", function () {
    //         scene.tweens.add({
    //             targets: btn_play,
    //             scaleX: 1, // Phóng to 20% theo chiều ngang
    //             scaleY: 1, // Phóng to 20% theo chiều dọc
    //             duration: 100, // Thời gian hiệu ứng (ms)
    //             ease: "Power2",
    //         });
    //     });
    // item.btn_play = btn_play;
    // container_inner.add(btn_play);

    // const btn_lock = scene.add
    //     .image(746 + 240 / 2, 199 + 70 / 2, "home_battle_btn_fight_locked")
    //     .setOrigin(0.5, 0.5)
    //     .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
    //     .on("pointerdown", function () {})
    //     .on("pointerover", function () {
    //         scene.tweens.add({
    //             targets: btn_lock,
    //             scaleX: 1.2, // Phóng to 20% theo chiều ngang
    //             scaleY: 1.2, // Phóng to 20% theo chiều dọc
    //             duration: 100, // Thời gian hiệu ứng (ms)
    //             ease: "Power2",
    //         });
    //     })
    //     .on("pointerout", function () {
    //         scene.tweens.add({
    //             targets: btn_lock,
    //             scaleX: 1, // Phóng to 20% theo chiều ngang
    //             scaleY: 1, // Phóng to 20% theo chiều dọc
    //             duration: 100, // Thời gian hiệu ứng (ms)
    //             ease: "Power2",
    //         });
    //     });
    // item.btn_play = btn_lock;
    // container_inner.add(btn_lock);

    // item.setActive = function (boolVal) {
    //     if (boolVal) {
    //         btn_play.setVisible(true);
    //         btn_lock.setVisible(false);
    //     } else {
    //         btn_play.setVisible(false);
    //         btn_lock.setVisible(true);
    //     }
    // };

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

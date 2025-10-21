import centerData from "../../Data/CenterData.js";
import centerDataItem from "../../Data/CenterDataItem.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";
import { AssetLoadingManager } from "../AssetLoadingManager.js";
import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";
import { CreateFirstMissions } from "../Home/HomeFirstMissions.js";
import { CreateAlertPopup } from "../Share/AlertPopup.js";

let container_main = null;

let canClick = false;

let rewardData = null;

// let rewardData = {
//     rewards: [
//         {
//             userId: "6866043a13d140d0dc6000dc",
//             chip: 11250,
//             bossName: "Mechanical Titan",
//         },
//         {
//             userId: "68660ba1595ccd94acf9fcf4",
//             chip: 11250,
//             bossName: "Mechanical Titan",
//         },
//     ],
//     duration: 1,
//     timestamp: "2025-10-09T10:05:26.130Z",
// };

let yourRewardData = null;

let topData = null;

// let topData = [
//     {
//         rank: 1,
//         userId: "68660ba1595ccd94acf9fcf4",
//         username: "hiept1",
//         damage: 5600,
//         percentage: "112.00",
//     },
//     {
//         rank: 2,
//         userId: "68660ba1595ccd94acf9fcf4",
//         username: "casigia",
//         damage: 5600,
//         percentage: "112.00",
//     },
//     {
//         rank: 3,
//         userId: "68660ba1595ccd94acf9fcf4",
//         username: "abx",
//         damage: 5600,
//         percentage: "112.00",
//     },
//     {
//         rank: 4,
//         userId: "68660ba1595ccd94acf9fcf4",
//         username: "asdaty",
//         damage: 5600,
//         percentage: "112.00",
//     },
//     {
//         rank: 5,
//         userId: "68660ba1595ccd94acf9fcf4",
//         username: "sdf1256",
//         damage: 5600,
//         percentage: "112.00",
//     },
// ];

let container_top_damage_item_list = null;

let container_list = null;

let gridTable = null;

export function CreateGameOver(scene, isVictory = false, data) {
    if (container_main != null) {
        container_main.destroy();
    }

    rewardData = data;

    yourRewardData = null;

    topData = null;

    canClick = false;

    // Tạo một container
    container_main = scene.add.container(0, 0).setDepth(200); // Tọa độ của container

    const black_bg = scene.add
        .rectangle(0, 0, scene.game.config.width, scene.game.config.height)
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

    if (isVictory) {
        if (rewardData.rewards != null) {
            for (let i = 0; i < rewardData.rewards.length; i++) {
                if (rewardData.rewards[i].userId === centerData.userInfo._id) {
                    yourRewardData = rewardData.rewards[i];

                    break;
                }
            }
        }

        popup_bg.setPosition(-2000, 0);

        scene.tweens.add({
            targets: popup_bg,
            x: 0,
            duration: 500,
            ease: "power2",
            delay: 0,
            onComplete: () => {},
        });

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

        CreateList(scene);

        const btn_exit = scene.add
            .image(540, 1711 + 86 / 2, "gameplay_game_over_btn_exit")
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

        if (centerData.userInfo.CurrentStage === 5) {
            //CreateFirstMissions(scene);
        }
    } else {
        popup_bg.setPosition(-2000, 0);

        scene.tweens.add({
            targets: popup_bg, // Đối tượng chữ cần tween
            x: 0, // Chuyển từ -100 (phía trên màn hình) đến centerY (giữa màn hình)
            duration: 500, // Thời gian tween (ms)
            ease: "power2", // Kiểu easing tạo hiệu ứng nảy
            delay: 0, // Thời gian chờ 1 giây trước khi bắt đầu tween
            onComplete: () => {},
        });

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
}

function CreateBattleResult(scene, damage, damagePercent, battleType) {
    let resultBG = scene.add
        .graphics()
        .fillStyle(0x000000, 0.6)
        .fillRoundedRect(530, 482, 540, 321, 8);
    container_main.add(resultBG);

    CreateResultCell(scene, 550, 502, "Damage", damage);

    CreateResultCell(
        scene,
        550,
        502 + 87 + 10,
        "Damage %",
        damagePercent + "%"
    );

    CreateResultCell(
        scene,
        550,
        502 + 87 * 2 + 10 * 2,
        "Battle type",
        battleType
    );

    const text_result = scene.add
        .text(530, 430, "Your Result", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_main.add(text_result);
}

function CreateResultCell(scene, x, y, title, value) {
    let container_cell = scene.add.container(x, y);
    container_main.add(container_cell);

    let resultBG_1 = scene.add
        .graphics()
        .fillStyle(0x4e4e4e, 0.4)
        .fillRoundedRect(0, 0, 500, 87, 4);
    container_cell.add(resultBG_1);

    const text_title = scene.add
        .text(10, 24, title, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_cell.add(text_title);

    const text_value = scene.add
        .text(490, 24, value, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#FFA600",
            align: "right",
        })
        .setOrigin(1, 0);
    container_cell.add(text_value);

    return container_cell;
}

function CreateList(scene) {
    if (yourRewardData == null) {
        return;
    }

    container_list = scene.add.container(0, 0);
    container_main.add(container_list);

    let itemCount = 0;

    if (yourRewardData.rewards) {
        itemCount += yourRewardData.rewards.length;
    }

    if (yourRewardData.chip) {
        itemCount += 1;
    }

    let columns = 5;

    let rows = Math.ceil(itemCount / columns);

    const itemSpacing = 20;

    let itemWidth = 150;
    let itemHeight = 150;

    const scrollViewWidth = 860;
    const scrollViewHeight = 420;

    const posX = 540 + itemWidth / 2 + itemSpacing / 2;
    const posY = 1238 + scrollViewHeight / 2;

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
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
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
    chip.text_value.setText("x" + yourRewardData.chip);
    chip.icon
        .setTexture("home_top_currency_chip_1")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(140, 140);

    if (yourRewardData.rewards) {
        for (let i = 0; i < yourRewardData.rewards.length; i++) {
            let itemData = yourRewardData.rewards[i];

            let localItemData = centerDataItem.getItemById(itemData.code);

            let itemConatiner = CreateItem(scene, scrollablePanel);
            itemConatiner.text_value.setText("x" + itemData.quantity);

            itemConatiner.icon
                .setTexture(localItemData.imgKey)
                .setOrigin(0.5, 0.5)
                .setDisplaySize(140, 140);
        }
    }

    scrollablePanel.layout();
}

function CreateItem(scene, scrollablePanel) {
    let itemWidth = 150;
    let itemHeight = 150;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);

    item.bg = scene.add
        .image(0, 0, "gameplay_game_complete_reward_item_bg")
        .setDisplaySize(itemWidth, itemHeight)
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.icon = scene.add
        .image(itemWidth / 2, itemHeight / 2, "home_top_currency_chip_1")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(140, 140);
    container_inner.add(item.icon);

    item.text_value = scene.add
        .text(150 - 5, 150 - 5, 0, {
            fontFamily: "Russo One",
            fontSize: "30px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 2,
            wordWrap: { width: itemWidth, useAdvancedWrap: true },
        })
        .setOrigin(1, 1);
    container_inner.add(item.text_value);

    scrollablePanel.getElement("panel").add(item, {
        align: "top-center",
        expand: false,
    });

    return item;
}

function CreateTopDamageItemList(scene) {
    if (container_top_damage_item_list) {
        container_top_damage_item_list.destroy();
    }

    if (topData == null || topData.length <= 0) {
        return;
    }

    container_top_damage_item_list = scene.add.container(0, 0);
    container_main.add(container_top_damage_item_list);

    let list_bg = scene.add
        .graphics()
        .fillStyle(0x000000, 0.6)
        .fillRoundedRect(48, 825, 984, 360, 4);
    container_top_damage_item_list.add(list_bg);

    // Kích thước của ScrollView
    const scrollViewWidth = 984;
    const scrollViewHeight = 360;

    const itemWidth = 904;
    const itemHeight = 100;
    const itemSpacing = 10;

    const posX = 48 + scrollViewWidth / 2;
    const posY = 825 + scrollViewHeight / 2;

    // Tạo gridTable với tái sử dụng cell
    gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            table: {
                cellWidth: itemWidth + itemSpacing,
                cellHeight: itemHeight + itemSpacing,
                columns: 1,
                reuseCellContainer: true,
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
            mouseWheelScroller: {
                focus: false,
                speed: 0.2,
            },
            items: topData,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = createTopDamageItem(
                        scene,
                        itemWidth,
                        itemHeight
                    );
                }
                // Cập nhật nội dung với dữ liệu mới
                cellContainer.updateContent(item);

                return cellContainer;
            },
            space: {
                left: 40,
                right: 0,
                top: 20,
                bottom: 100 / 2 + 10 / 2,
            },
        })
        .layout();

    container_top_damage_item_list.add(gridTable);

    // Thiết lập mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_top_damage_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function CreateUpdateTopDamageList(scene, topDamageArray) {
    if (!topDamageArray || topDamageArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...topDamageArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
}

function createTopDamageItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    let bg = scene.add
        .graphics()
        .fillStyle(0x4e4e4e, 0.4)
        .fillRoundedRect(0, 0, 903, 100, 4);
    container_inner.add(bg);

    // const avatar = scene.add
    //     .image(23 + 160 / 2, 20 + 160 / 2, "")
    //     .setDisplaySize(160, 160)
    //     .setOrigin(0.5, 0.5);
    // container_inner.add(avatar);

    const text_rank = scene.add
        .text(20, 20, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 2,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_rank);

    const text_name = scene.add
        .text(198, 20, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 2,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_name);

    const text_damage = scene.add
        .text(881, 20, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#FFA600",
            align: "right",
            stroke: "#000000",
            strokeThickness: 2,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_damage);

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        // avatar.setTexture(data.Avatar);
        // avatar.setScale(160 / 128);
        text_rank.setText(data.rank + ".");
        text_name.setText(data.username);
        text_damage.setText(`Damage ${data.damage} (${data.percentage}%)`);
    };

    return container;
}

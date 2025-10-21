import centerData from "../../Data/CenterData.js";
import centerDataItem from "../../Data/CenterDataItem.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";

import { AssetLoadingManager } from "../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../Share/AlertPopup.js";

let container_main = null;

let container_popup = null;

let container_popup_tween = null;

let container_list = null;

let container_popup_buttons = null;

let isOpen = false;

export function CreateDaily(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadDaily(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    // const lock_bg = scene.rexUI.add
    //     .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.75)
    //     .setInteractive({ useHandCursor: true });

    // container_main.add(lock_bg);

    const lock_bg = scene.add
        .image(0, 0, "home_daily_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup_buttons = scene.add.container(0, 0);
    container_main.add(container_popup_buttons);

    //Create buttons

    //create close btn
    const btn_close = scene.add
        .image(253 + 575 / 2, 1738 + 106 / 2, "home_daily_btn_close")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CloseDaily(scene);
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

    //ActiveMode(scene, MODE_KEYS.Account.KEY);

    UpdateDailyStatus(scene);

    OpenDaily(scene);
}

let dataSample = {
    checkinStatus: {
        "2025-02-03": true,
        "2025-02-04": false,
        "2025-02-05": false,
        "2025-02-06": false,
        "2025-02-07": false,
        "2025-02-08": false,
    },
    rewards: {
        "2025-02-03": {
            rewardText: "Receive 1000 Chip",
            chip: 1000,
        },
        "2025-02-04": {
            rewardText: "Receive 1000 Chip",
            chip: 1000,
        },
        "2025-02-05": {
            rewardText: "Receive 1000 Chip",
            chip: 1000,
        },
        "2025-02-06": {
            rewardText: "Receive 1000 Chip",
            chip: 1000,
        },
        "2025-02-07": {
            rewardText: "Receive 1 Piece Ticket",
            item: "BOX_NFT_FRAGMENT",
            quantity: 1,
        },
        "2025-02-08": {
            rewardText:
                "Receive 1 out of 3 C rank character: Marcus, David, Henry",
            items: ["BOX_MARCUS", "BOX_DAVID", "BOX_HENRY"],
            quantity: 1,
        },
    },
};

function UpdateDailyStatus(scene) {
    centerData.RequestDaily(
        (result) => {
            container_popup.setPosition(0, 4000);

            if (container_popup_tween) {
                container_popup_tween.stop();
                scene.tweens.remove(container_popup_tween);
            }

            container_popup_tween = scene.tweens.add({
                targets: container_popup,
                x: 0,
                y: 0, // Vị trí kết thúc
                duration: 500, // Thời gian tween
                ease: "Power2", // Kiểu easing
                onComplete: () => {},
            });

            CreateList(scene, result.data);
        },
        (error) => {
            CreateAlertPopup(
                scene,
                "Get daily status failed:\n" + error.message
            );
        }
    );
}

function CreateList(scene, receivedData) {
    //Create friend list
    container_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_popup.add(container_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1448;

    const columns = 1;
    const rows = Math.ceil(2 / columns);

    const itemWidth = 1020;
    const itemHeight = 296;
    const itemSpacing = 30;

    const posX = 30 + scrollViewWidth / 2;
    const posY = 206 + scrollViewHeight / 2;

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

    let keys = Object.keys(receivedData.checkinStatus);

    // console.log("keys: ", keys);

    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];

        let itemData = {
            index: i,
            key: k,
            checkinStatus: receivedData.checkinStatus[k],
            rewards: receivedData.rewards[k],
        };

        CreateItem(scene, scrollablePanel, itemData);
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateItem(scene, scrollablePanel, itemData) {
    let itemWidth = 1020;
    let itemHeight = 296;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.rexUI.add
        .roundRectangle(0, 0, itemWidth, itemHeight, 0, 0x4e4e4e, 0.4)
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.text_info = scene.add
        .text(
            30,
            75,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeDaily.KEY,
                itemData.rewards.rewardText
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#ffffff",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_info);

    let day = "Day";

    switch (itemData.index) {
        case 0:
            day = "Monday";
            break;
        case 1:
            day = "Tuesday";
            break;
        case 2:
            day = "Wednesday";
            break;
        case 3:
            day = "Thursday";
            break;
        case 4:
            day = "Friday";
            break;
        case 5:
            day = "Saturday";
            break;
        case 6:
            day = "Sunday";
            break;
    }

    item.text_day = scene.add
        .text(
            30,
            30,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeDaily.KEY,
                day
            ) +
                " " +
                itemData.key,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_day);

    const targetDate = new Date(itemData.key); // Ngày cần so sánh
    const now = new Date(); // Ngày hiện tại

    if (targetDate < now) {
        const btn_check = scene.add
            .image(710 + 280 / 2, 116 + 64 / 2, "home_daily_item_btn_check")
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {
                CheckInClick(scene, item);
            })
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_check,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_check,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        item.btn_check = btn_check;
        container_inner.add(btn_check);

        const btn_checked = scene.add
            .image(710 + 280 / 2, 116 + 64 / 2, "home_daily_item_checked")
            .setOrigin(0.5, 0.5);
        item.btn_checked = btn_checked;
        container_inner.add(btn_checked);

        item.setChecked = function (boolVal) {
            if (boolVal) {
                btn_check.setVisible(false);
                btn_checked.setVisible(true);
            } else {
                btn_check.setVisible(true);
                btn_checked.setVisible(false);
            }
        };

        // console.log("itemData.checkinStatus: ", itemData.checkinStatus);

        if (itemData.checkinStatus == false) {
            item.setChecked(false);
        } else {
            item.setChecked(true);
        }
    }

    CreateRewardList(scene, item);

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

function CheckInClick(scene, item) {
    CreateAlertPopup(
        scene,
        "Check in with 1 M-Coin?",
        () => {
            if (centerData.userInfo.Chip >= 1) {
                centerData.RequestLateCheckin(
                    item.itemData.key,
                    (result) => {
                        CreateAlertPopup(scene, result.message);

                        item.setChecked(true);
                    },
                    (error) => {
                        CreateAlertPopup(scene, error.message);
                    }
                );
            } else {
                CreateAlertPopup(scene, "Not enough M-Coin to checkin");
            }
        },
        () => {}
    );
}

function CreateRewardList(scene, fatherContainer) {
    //Create friend list
    let container_reward_list = scene.add.container(0, 0);
    fatherContainer.container_inner.add(container_reward_list);

    let columns = 0;

    if (
        fatherContainer.itemData.rewards.chip &&
        fatherContainer.itemData.rewards.chip > 0
    ) {
        columns += 1;
    }

    if (fatherContainer.itemData.rewards.item) {
        columns += 1;
    }

    if (fatherContainer.itemData.rewards.items) {
        columns += fatherContainer.itemData.rewards.items.length;
    }

    const rows = 1;

    const itemSpacing = 10;

    let itemWidth = 130;
    let itemHeight = 130;

    // Kích thước của ScrollView
    const scrollViewWidth = 650;
    const scrollViewHeight = 130;

    const posX = 24 + scrollViewWidth / 2;
    const posY = 149 + scrollViewHeight / 2;

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

    CreateItemRewardList(scene, scrollablePanel, fatherContainer);

    scrollablePanel.layout();

    // let maskShape = scene.add
    //     .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
    //     .setVisible(false);
    // container_reward_list.add(maskShape);

    // let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    // scrollablePanel.setMask(mask);
}

function CreateItemRewardList(scene, scrollablePanel, fatherContainer) {
    if (
        fatherContainer.itemData.rewards.chip &&
        fatherContainer.itemData.rewards.chip > 0
    ) {
        let chip = CreateItemReward(scene, scrollablePanel);
        chip.text_value.setText(fatherContainer.itemData.rewards.chip);
        chip.icon
            .setTexture("home_top_currency_chip_1")
            .setOrigin(0.5, 0.5)
            .setDisplaySize(100, 100);
    }

    if (fatherContainer.itemData.rewards.item) {
        let item = CreateItemReward(scene, scrollablePanel);
        item.text_value.setText(fatherContainer.itemData.rewards.quantity);

        let imgKey = centerDataItem.getItemById(
            fatherContainer.itemData.rewards.item
        ).imgKey;

        item.icon
            .setTexture(imgKey)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(100, 100);
    }

    if (fatherContainer.itemData.rewards.items) {
        for (
            let i = 0;
            i < fatherContainer.itemData.rewards.items.length;
            i++
        ) {
            let item = CreateItemReward(scene, scrollablePanel);
            item.text_value.setText(fatherContainer.itemData.rewards.quantity);

            let imgKey = centerDataItem.getItemById(
                fatherContainer.itemData.rewards.items[i]
            ).imgKey;

            item.icon
                .setTexture(imgKey)
                .setOrigin(0.5, 0.5)
                .setDisplaySize(100, 100);
        }
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
        .image(0, 0, "home_daily_item_reward_bg")
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

function OpenDaily(scene) {
    isOpen = true;
}

function CloseDaily(scene) {
    isOpen = false;

    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;
}

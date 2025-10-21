import { CreateAlertPopup, CreateLoadingPopup,  HideLoadingPopup } from "../Share/AlertPopup.js";

import centerData from "../../Data/CenterData.js";
import centerDataItem from "../../Data/CenterDataItem.js";
import { AssetLoadingManager } from "../AssetLoadingManager.js";

let container_main = null;

let container_reward = null;

let container_buttons = null;

let maskShape = null;

let mask = null;

let scrollablePanel = null;

let dataSaple = {
    success: true,
    data: {
        chipRewards: [
            {
                id: "67ce50090a3b85dd36a1b3a2",
                sourceType: "PREMIUM_BOX",
                dailyAmount: 10000,
                startDate: "2025-03-10T02:35:53.574Z",
                endDate: "2025-04-09T02:35:53.574Z",
                active: true,
                lastClaimed: null,
                claimedDays: 0,
                totalDays: 30,
                remainingDays: 30,
                createdAt: "2025-03-10T02:35:53.576Z",
                willReceiveToday: true,
            },
        ],
        todaySummary: {
            activeRewardsCount: 1,
            expectedChipReward: 10000,
            nextRewardTime: "00:00 UTC",
        },
        totalStats: {
            totalRewards: 1,
            activeRewards: 1,
            completedRewards: 0,
            totalClaimedChips: 0,
            totalRemainingChips: 300000,
        },
    },
};

export function CreateChipReward(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyEarn(() => {
        HideLoadingPopup();
        LoadAssetsDone(scene);
    });
}

function LoadAssetsDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    container_reward = scene.add.container(0, 0);
    container_main.add(container_reward);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    const lock_bg = scene.add
        .image(0, 0, "home_earn_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_reward.add(lock_bg);

    let title = scene.add
        .image(
            394 + 648 / 2,
            80 + 90 / 2,
            "home_earn_transaction_daily_chip_reward_title"
        )
        .setOrigin(0.5, 0.5);
    container_reward.add(title);

    //create close btn
    const btn_close = scene.add
        .image(38 + 32 / 2, 98 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Destroy();
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

    container_buttons.add(btn_close);

    CreateLoadingPopup();

    centerData.RequestChipDailyRewards(
        (result) => {
            HideLoadingPopup();

            CreateList(scene, centerData.chipDailyReward.data);
        },
        (error) => {
            HideLoadingPopup();
        }
    );
}

function CreateList(scene, data) {
    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1554;

    const columns = 1;
    const rows = 1;

    const itemWidth = 1004;
    const itemHeight = 218;
    const itemSpacing = 16;

    const posX = 38 + scrollViewWidth / 2;
    const posY = 366 + scrollViewHeight / 2;

    // const background = scene.add
    //   .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
    //   .setAlpha(0.8);

    // container_archivement.add(background);

    // Tạo một Scrollable Panel (bảng cuộn)
    scrollablePanel = scene.rexUI.add
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
                bottom: 40,
            },
        })
        .layout();

    container_reward.add(scrollablePanel);

    let campainChipReward = {
        id: "",
        sourceType: "Campaign",
        dailyAmount: centerData.userInfo.DailyPointReward,
        startDate: centerData.userInfo.createdAt,
        endDate: centerData.userInfo.updatedAt,
        active: true,
        lastClaimed: null,
        claimedDays: 0,
        totalDays: 0,
        remainingDays: 0,
        createdAt: "",
        willReceiveToday: true,
    };
    CreateListItem(scene, scrollablePanel, campainChipReward);

    for (let i = 0; i < data.chipRewards.length; i++) {
        let chipRewardData = data.chipRewards[i];

        if (chipRewardData && chipRewardData.active) {
            CreateListItem(scene, scrollablePanel, chipRewardData);
        }
    }

    scrollablePanel.layout();

    maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_reward.add(maskShape);

    mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateListItem(scene, scrollablePanel, theReward) {
    const itemWidth = 1004;
    const itemHeight = 218;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.theReward = theReward;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);

    //console.log(`item.achievement${i}`, item.achievement);

    // const item_bg = scene.rexUI.add.roundRectangle(
    //   0,
    //   0,
    //   itemWidth,
    //   itemHeight,
    //   0,
    //   0xffffff
    // );
    // item_bg.setOrigin(0.5, 0.5);
    // item.add(item_bg);

    let bg = scene.rexUI.add
        .roundRectangle(
            0, // Tọa độ x
            0, // Tọa độ y
            itemWidth, // Chiều rộng
            itemHeight, // Chiều cao
            0, // Độ bo góc
            0x000000, // Màu nền
            0.6 // Độ trong suốt
        )
        .setOrigin(0, 0);
    container_inner.add(bg);

    const type_icon = scene.add
        .image(32 + 75 / 2, 32 + 65 / 2, "home_earn_wallet_icon_3")
        .setTint(0xcccccc);
    container_inner.add(type_icon);

    let status = "";
    if (item.theReward.status) {
        status = item.theReward.status;
    }

    const text_type = scene.add
        .text(
            139,
            71,
            item.theReward.sourceType.replace(/_/g, " ") + " " + status,
            {
                fontFamily: "Russo One",
                fontSize: "32px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 1);
    container_inner.add(text_type);

    const text_start_time = scene.add
        .text(139, 75, "Start: " + formatDateTime(item.theReward.startDate), {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "left",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_start_time);

    const text_end_time = scene.add
        .text(139, 110, "End: " + formatDateTime(item.theReward.endDate), {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "left",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_end_time);

    const text_remainingDays = scene.add
        .text(
            139,
            146,
            "Day remain " +
                item.theReward.remainingDays +
                "/" +
                item.theReward.totalDays,
            {
                fontFamily: "Russo One",
                fontSize: "24px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: 888, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_remainingDays);

    const text_amount = scene.add
        .text(900, 36, "+" + item.theReward.dailyAmount, {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#CCCCCC",
            align: "right",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_amount);

    const icon = scene.add.image(
        908 + 64 / 2,
        36 + 64 / 2,
        "home_top_currency_chip_1"
    );
    container_inner.add(icon);

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });
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

export function Destroy() {
    if (container_main) {
        container_main.destroy();
        container_main = null;
    }

    if (maskShape) {
        maskShape.destroy();
    }

    if (mask) {
        mask.destroy();
    }
}

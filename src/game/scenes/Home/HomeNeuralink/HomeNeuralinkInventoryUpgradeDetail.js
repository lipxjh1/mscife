// Removed Telegram SDK import - using window.open() instead

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";

import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import { GetNeuralinkInfo } from "./HomeNeuralinkUpgrade.js";
import { ActiveNeuralinkInventoryInprogress } from "./HomeNeuralinkInventoryInprogress.js";

let container_detail = null;

let container_detail_0 = null;

let container_detail_1 = null;

let detailData = {};

let timeCountEvent = null;

export function CreateNeuralinkInventoryUpgradeDetail(scene, data) {
    detailData = data;

    Create(scene);
}

function Create(scene) {
    //console.log("CreateNeuralinkUpgrade");

    Destroy();

    container_detail = scene.add.container(0, 0);
    container_detail.setDepth(300);

    container_detail_0 = scene.add.container(0, 0);
    container_detail.add(container_detail_0);

    container_detail_1 = scene.add.container(0, 0);
    container_detail.add(container_detail_1);

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

    container_detail.add(btn_close);

    const lock_bg = scene.add
        .image(0, 0, "home_neuralink_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_detail_0.add(lock_bg);

    const lock_bg1 = scene.add
        .image(0, 0, "home_neuralink_upgrade_progress_detail_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_detail_1.add(lock_bg1);

    container_detail_1.setPosition(-2000, 0);
    scene.tweens.add({
        targets: container_detail_1,
        x: 0,
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });

    let itemLocalData = centerDataItem.getItemById("NEURALINK");

    let itemImg = scene.add
        .image(540, 350 + 250 / 2, itemLocalData.imgKey)
        .setScale(250 / 350)
        .setOrigin(0.5, 0.5);
    container_detail_1.add(itemImg);

    const text_days_left = scene.add
        .text(540, 654, calculateTimeRemaining(detailData.completionDate), {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: 342, useAdvancedWrap: true },
        })
        .setOrigin(0.5, 0);
    container_detail_1.add(text_days_left);

    // Add countdown timer functionality
    let secondLeft = calculateRemainingSeconds(detailData.completionDate);

    // Update text function
    const updateTimeText = () => {
        text_days_left.setText(
            calculateTimeRemaining(detailData.completionDate)
        );
    };

    // Create timer event for countdown
    if (timeCountEvent) {
        timeCountEvent.remove();
    }

    timeCountEvent = scene.time.addEvent({
        delay: 1000, // 1 second
        callback: () => {
            if (secondLeft < 0) {
                secondLeft = 0;
                timeCountEvent.remove();
            } else {
                updateTimeText();
                secondLeft -= 1;
            }
        },
        callbackScope: this,
        loop: true,
    });

    const text_expired_time = scene.add
        .text(540, 763, formatDateTime(detailData.completionDate), {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: 680, useAdvancedWrap: true },
        })
        .setOrigin(0.5, 0);
    container_detail_1.add(text_expired_time);

    let caculatedMSCI =
        detailData.quantity * GetNeuralinkInfo().upgradeRequirements.finalCost;

    const text_detail = scene.add
        .text(
            540,
            926,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                `Your {i} Neuralink are in the refining process.`,
                [detailData.quantity]
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 680, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container_detail_1.add(text_detail);

    const text_note = scene.add
        .text(
            540,
            1178,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                `neuralink_upgrade_note_key`
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 890, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container_detail_1.add(text_note);

    const text_notice = scene.add
        .text(
            540,
            1533,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                `Get more $MSCI in Center Market`
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 611, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container_detail_1.add(text_notice);

    // const btn_upgrade = CreateButton1(
    //     scene,
    //     container_detail_1,
    //     540,
    //     1711 + 128 / 2,
    //     "home_neuralink_btn_1",
    //     "Upgrade"
    // );
    // btn_upgrade.button.on("pointerdown", async function () {
    //     CreateUpgradePopup(scene);
    // });
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

function calculateRemainingSeconds(targetDateTimeString) {
    // Convert target time string to Date object (UTC)
    const targetDate = new Date(targetDateTimeString);

    // Get current time
    const now = new Date();

    // Calculate difference in milliseconds
    // If targetDate < now, result will be negative (time has passed)
    const diffMilliseconds = targetDate.getTime() - now.getTime();

    // Convert milliseconds to seconds and round down
    const diffSeconds = Math.floor(diffMilliseconds / 1000);

    return diffSeconds;
}

function calculateTimeRemaining(targetDate) {
    // Lấy thời gian hiện tại
    const now = Date.now();

    // Chuyển đổi targetDate thành đối tượng Date
    const target = new Date(targetDate).getTime();

    // Tính khoảng thời gian còn lại (tính bằng mili giây)
    let timeDifference = target - now;

    let dayStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.Neuralink.KEY,
        `Days`
    );

    // Kiểm tra nếu thời gian đã hết
    if (timeDifference <= 0) {
        return `0 ${dayStr} 00:00:00`;
    }

    // Chuyển đổi mili giây sang ngày, giờ, phút, giây
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    timeDifference -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    timeDifference -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(timeDifference / (1000 * 60));
    timeDifference -= minutes * (1000 * 60);

    const seconds = Math.floor(timeDifference / 1000);

    // Định dạng chuỗi theo format "30 Days 00:00:00"
    const formattedTime = `${days} ${dayStr} ${String(hours).padStart(
        2,
        "0"
    )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return formattedTime;
}

export function Destroy() {
    if (timeCountEvent) {
        timeCountEvent.remove();
        timeCountEvent = null;
    }

    if (container_detail) {
        container_detail.destroy();

        container_detail = null;
    }
}

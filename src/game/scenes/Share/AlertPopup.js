import centerData from "../../Data/CenterData";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";
import centerDataItem from "../../Data/CenterDataItem.js";

import cdLocalization from "../../Data/CenterDataLocalization.js";
import { EventBus } from "../../EventBus.js";

/**
 * Convert message to string format
 * @param {any} message - Message có thể là string, object, array, null, undefined
 * @returns {string} - Message đã được convert thành string
 */
function convertMessageToString(message) {
    // Nếu message là null hoặc undefined
    if (message == null) {
        return "";
    }

    // Nếu message đã là string
    if (typeof message === "string") {
        return message;
    }

    // Nếu message là object hoặc array
    if (typeof message === "object") {
        try {
            return JSON.stringify(message, null, 2);
        } catch (error) {
            console.warn(
                "AlertPopup: Không thể convert object thành JSON:",
                error
            );
            return "[Object không thể hiển thị]";
        }
    }

    // Các trường hợp khác (number, boolean, function, etc.)
    try {
        return String(message);
    } catch (error) {
        console.warn(
            "AlertPopup: Không thể convert message thành string:",
            error
        );
        return "[Không thể hiển thị message]";
    }
}

/**
 * Hiển thị popup xác nhận React từ Scene Phaser
 * @param {Phaser.Scene} scene - Scene hiện tại
 * @param {any} message - Nội dung thông báo (string, object, array, hoặc bất kỳ kiểu dữ liệu nào)
 * @param {Function} [confirmCallback] - Callback khi người dùng xác nhận
 * @param {Function} [cancelCallback] - Callback khi người dùng hủy
 */
export function CreateAlertPopup(
    scene,
    message,
    confirmCallback,
    cancelCallback
) {
    // Định nghĩa tên các sự kiện
    const confirmEventName = "phaser:confirm-action-" + Date.now();
    const cancelEventName = "phaser:cancel-action-" + Date.now();

    if (confirmCallback) {
        EventBus.once(confirmEventName, () => {
            // Hủy listener khác nếu có
            if (cancelCallback) EventBus.off(cancelEventName);
            // Gọi callback
            confirmCallback();
        });
    }

    // Đăng ký listener cho sự kiện hủy
    if (cancelCallback) {
        EventBus.once(cancelEventName, () => {
            // Hủy listener khác nếu có
            if (confirmCallback) EventBus.off(confirmEventName);
            // Gọi callback
            cancelCallback();
        });
    }

    let showBothButtons = false;

    if (confirmCallback != null && cancelCallback != null) {
        showBothButtons = true;
    }

    // Convert message thành string trước khi emit
    const convertedMessage = convertMessageToString(message);

    // Gửi yêu cầu hiển thị popup đến React
    EventBus.emit("ui:show-popup", {
        title: "Confirm",
        message: convertedMessage,
        confirmText: cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.Main.KEY,
            "Confirm"
        ),
        cancelText: cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.Main.KEY,
            "Cancel"
        ),
        confirmEvent: confirmEventName,
        cancelEvent: cancelEventName,
        showBothButtons: showBothButtons,
    });
}

export function CreateLoadingPopup() {
    EventBus.emit("show-loading");
}

export function HideLoadingPopup() {
    EventBus.emit("hide-loading");
}

// let container_main_loading = null;

// let anim = null;
// export function CreateLoadingPopup(scene) {
//     if (container_main_loading) {
//         container_main_HideLoadingPopup();
//     }

//     container_main_loading = scene.add.container(0, 0);
//     container_main_loading.setDepth(1000);

//     const black_bg = scene.add
//         .rectangle(0, 0, window.originWidth, window.originHeight)
//         .setInteractive()
//         .setOrigin(0, 0);
//     black_bg.isFilled = true;
//     black_bg.fillColor = 0;
//     black_bg.fillAlpha = 0.5;

//     container_main_loading.add(black_bg);

//     if (anim) {
//         scene.anims.remove("load_loading_circle_animation");
//     }

//     anim = scene.anims.create({
//         key: "load_loading_circle_animation",
//         frames: scene.anims.generateFrameNumbers("load_loading_circle", {
//             start: 0,
//             end: 209,
//         }), // 0 đến 11 vì có 12 khung hình
//         frameRate: 30, // Tốc độ phát animation
//         repeat: -1, // Lặp lại vô hạn
//     });

//     const effect = scene.add
//         .sprite(540, 960, "load_loading_circle")
//         .play("load_loading_circle_animation");
//     effect.setOrigin(0.5, 0.5).setScale(2, 2); // Đặt gốc giữa sprite
//     container_main_loading.add(effect);

//     return container_main_loading;
// }


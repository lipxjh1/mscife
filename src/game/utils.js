// Removed Telegram SDK imports - using only World App MiniKit

import { EventBus } from "./EventBus";
import centerData from "./Data/CenterData";

const originWidth = 1080;
const originHeight = 1920;

// function GetCenterPosition(sizeX, sizeY) {
//     // Tính toán kích thước và tỷ lệ
//     var calX = (originWidth / 2) - (sizeX / 2);
//     var calY = (originHeight / 2) + (sizeY / 2);
//     var pos = Math.min(calX, calY); // Lấy tỷ lệ nhỏ hơn để giữ tỷ lệ

//     return pos;
// }

// // Đặt hàm vào đối tượng window
// window.GetCenterPosition = GetCenterPosition;

window.originWidth = originWidth;
window.originHeight = originHeight;

// export function copyToClipboard(text) {
//     if (navigator.clipboard) {
//         navigator.clipboard
//             .writeText(text)
//             .then(() => {
//                 //console.log("Text copied to clipboard");
//             })
//             .catch((err) => {
//                 //console.error("Failed to copy text: ", err);
//             });
//     } else {
//         //console.warn("Clipboard API not supported");
//     }
// }

// window.copyToClipboard = copyToClipboard;

async function copyToClipboard(text) {
    // Use the normal copyToClipboardNormal function since Telegram SDK is removed
    copyToClipboardNormal(text);
}

window.copyToClipboard = copyToClipboard;

function copyToClipboardNormal(text) {
    if (!navigator.clipboard) {
        // Fallback for browsers that don't support Clipboard API
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            textarea.style.left = "0";
            textarea.style.top = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const successful = document.execCommand("copy");
            document.body.removeChild(textarea);

            if (successful) {
                // Show success message
                alert("Text copied to clipboard");
            } else {
                alert("Failed to copy text");
            }
        } catch (err) {
            //console.error("Fallback: Couldn't copy text: ", err);
            alert("Failed to copy text");
        }
    } else {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                // Show success message
                alert("Text copied to clipboard");
            })
            .catch((error) => {
                //console.error("Clipboard API error: ", error);
                alert("Failed to copy text");
            });
    }
}

window.copyToClipboardNormal = copyToClipboardNormal;

let isTelegramCache = null;

/**
 * Checks if the app is running inside a Telegram Mini App.
 * The result is cached, so subsequent calls are synchronous and fast.
 * @returns {Promise<boolean>} True if running in Telegram Mini App, otherwise false.
 */
// Telegram detection removed - always return false
export async function isTelegramMiniApp() {
    return false;
}

export async function shareUrl(url) {
    // Always use window.open since Telegram SDK is removed
    window.open(url, "_blank");
}

export function forceReload() {
    if ("caches" in window) {
        caches.keys().then((names) => {
            names.forEach((name) => {
                caches.delete(name);
            });
        });
    }
    window.location.reload(true);
}

export function ShowGoogleButtonLogin() {
    EventBus.emit("ui:show-google-login");
}

export function HideGoogleButtonLogin() {
    EventBus.emit("ui:hide-google-login");
}

export function ShowGoogleButtonLoginTelegramLink() {
    if (
        centerData.userInfo.linkedAccounts.google == false &&
        centerData.GetIsGoogleLogin() == false
        // Removed isTelegramMiniApp() check - always show since Telegram SDK is removed
    ) {
        EventBus.emit("ui:show-google-login-telegram-link");
    }
}

export function HideGoogleButtonLoginTelegramLink() {
    EventBus.emit("ui:hide-google-login-telegram-link");
}

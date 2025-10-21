import {
    requestWriteAccess,
    popup,
    retrieveLaunchParams,
    openTelegramLink,
} from "@telegram-apps/sdk";

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
    try {
        // First request write access
        const status = await requestWriteAccess();

        if (status === "allowed") {
            // Create a temporary textarea element
            const textarea = document.createElement("textarea");
            textarea.value = text;

            // Make it invisible but keep it in the viewport
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            textarea.style.left = "0";
            textarea.style.top = "0";

            // Add it to the document
            document.body.appendChild(textarea);

            // Select and copy
            textarea.focus();
            textarea.select();

            try {
                // Try using the modern clipboard API first
                await navigator.clipboard.writeText(text);

                // Show success popup
                popup.open({
                    title: "Success",
                    message: "Text copied to clipboard",
                    buttons: [{ type: "ok" }],
                });
            } catch (clipboardError) {
                // Fallback to document.execCommand
                try {
                    document.execCommand("copy");

                    // Show success popup
                    popup.open({
                        title: "Success",
                        message: "Text copied to clipboard",
                        buttons: [{ type: "ok" }],
                    });
                } catch (execError) {
                    throw new Error("Failed to copy text");
                }
            }

            // Clean up
            document.body.removeChild(textarea);
        } else {
            popup.open({
                title: "Error",
                message: "Write access denied",
                buttons: [{ type: "ok" }],
            });
        }
    } catch (error) {
        //console.error("Failed to copy:", error);
        popup.open({
            title: "Error",
            message: "Failed to copy text",
            buttons: [{ type: "ok" }],
        });
    }
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
export async function isTelegramMiniApp() {
    if (isTelegramCache !== null) {
        return isTelegramCache;
    }

    try {
        const launchParams = await retrieveLaunchParams();
        isTelegramCache = !!launchParams.platform;
    } catch (error) {
        // This is expected when not running in a Telegram environment.
        isTelegramCache = false;
    }
    return isTelegramCache;
}

export async function shareUrl(url) {
    if (await isTelegramMiniApp()) {
        openTelegramLink(url);
    } else {
        window.open(url, "_blank");
    }
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
        centerData.GetIsGoogleLogin() == false &&
        isTelegramMiniApp() == false
    ) {
        EventBus.emit("ui:show-google-login-telegram-link");
    }
}

export function HideGoogleButtonLoginTelegramLink() {
    EventBus.emit("ui:hide-google-login-telegram-link");
}

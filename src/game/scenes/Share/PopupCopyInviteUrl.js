import centerData from "../../Data/CenterData";
import cdLocalization from "../../Data/CenterDataLocalization";
import { isTelegramMiniApp } from "../../utils.js";

let container_select_invite = null;

export function CreateSelectInvitePopup(scene) {
    console.log("CreateSelectInvitePopup");

    container_select_invite = scene.add.container(0, 0);
    container_select_invite.setDepth(1000);

    const lock_bg = scene.rexUI.add
        .roundRectangle(0, 0, 1080, 1920, 0, 0x000000, 0.75)
        .setOrigin(0, 0)
        .setInteractive();

    container_select_invite.add(lock_bg);

    let bg = scene.add
        .image(134, 633, "share_popup_invite_select_popup_bg")
        .setOrigin(0, 0);
    container_select_invite.add(bg);

    let text_title = scene.add
        .text(
            540,
            680,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                "Invite Friend Link"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "64px",
                fontStyle: "normal",
                color: "#FFFFFF",
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    blur: 7.2,
                    color: "#0BF",
                    fill: true,
                    stroke: false,
                },
                align: "center",
            }
        )
        .setOrigin(0.5, 0);
    container_select_invite.add(text_title);

    const btn_inviteTele = CreateSelectWalletButton(scene);
    btn_inviteTele.setPosition(164 + 751 / 2, 813 + 106 / 2);
    btn_inviteTele.text_titile.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeWallet.KEY,
            "Invite Telegram"
        )
    );
    container_select_invite.add(btn_inviteTele);

    btn_inviteTele.bg.on("pointerup", async function () {
        try {
            // Check if UserId exists before copying
            if (!centerData.userInfo || !centerData.userInfo.UserId) {
                console.error("User ID not found");
                alert("Error: User ID not found");
                return;
            }
            let inviteUrl = getTelegramInviteUrl(centerData.userInfo.UserId);
            if (await isTelegramMiniApp()) {
                window.copyToClipboard(inviteUrl);
            } else {
                window.copyToClipboardNormal(inviteUrl);
            }
            container_select_invite.destroy();
        } catch (error) {
            console.error("Error copying Telegram invite URL:", error);
            alert("Failed to copy invite URL");
        }
    });

    const btn_inviteWeb = CreateSelectWalletButton(scene);
    btn_inviteWeb.setPosition(164 + 751 / 2, 962 + 106 / 2);
    btn_inviteWeb.text_titile.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeWallet.KEY,
            "Invite Web"
        )
    );
    container_select_invite.add(btn_inviteWeb);

    btn_inviteWeb.bg.on("pointerup", async function () {
        try {
            // Check if UserId exists before copying
            if (!centerData.userInfo || !centerData.userInfo.UserId) {
                console.error("User ID not found");
                alert("Error: User ID not found");
                return;
            }
            let inviteUrl = getWebInviteUrl(centerData.userInfo.UserId);
            if (await isTelegramMiniApp()) {
                window.copyToClipboard(inviteUrl);
            } else {
                window.copyToClipboardNormal(inviteUrl);
            }
            container_select_invite.destroy();
        } catch (error) {
            console.error("Error copying Web invite URL:", error);
            alert("Failed to copy invite URL");
        }
    });

    //create close btn
    const btn_close = scene.add
        .image(164 + 32 / 2, 692 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            container_select_invite.destroy();
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

    container_select_invite.add(btn_close);
}

export function getTelegramInviteUrl(userId) {
    return `https://t.me/musksci_bot/game?startapp=${userId}`;
}

export function getWebInviteUrl(userId) {
    const baseUrl = "https://pro.m-sci.net/";
    const urlParams = new URLSearchParams();
    urlParams.set("startapp", userId);
    return `${baseUrl}?${urlParams.toString()}`;
}

function CreateSelectWalletButton(scene) {
    let btn = scene.add.container(0, 0);

    const label_inner = scene.add.container(-751 / 2, -106 / 2);
    btn.add(label_inner);

    btn.bg = scene.add
        .image(0, 0, "share_popup_invite_select_popup_btn")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerup", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    label_inner.add(btn.bg);

    btn.text_titile = scene.add
        .text(751 / 2, 106 / 2, "wallet status", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0.5, 0.5);
    label_inner.add(btn.text_titile);

    return btn;
}


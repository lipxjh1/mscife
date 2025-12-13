// Removed Telegram SDK imports - using window.open() instead

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";

import { container_main, container_popup } from "./HomeUserInfo.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { CreateBuyVip } from "../HomeBuyVip.js";
import {
    HideGoogleButtonLoginTelegramLink,
    ShowGoogleButtonLoginTelegramLink,
} from "../../../utils.js";
import { CreateUserInfoEquip } from "./HomeUserInfoEquip.js";
import {
    CreateSelectInvitePopup,
    getTelegramInviteUrl,
    getWebInviteUrl,
} from "../../Share/PopupCopyInviteUrl.js";

import { EventBus } from "../../../EventBus.js";
import { CreateFriends } from "../HomeFriends/HomeFriends.js";
// Removed TelegramUtils import - not needed without Telegram SDK

let container_account = null;

let container_account_0 = null;

let container_account_1 = null;

let btn_telegram_link_google = null;

let requestLinkGoogle = false;

let maskShape = null;

let mask = null;

let vip_medal = null;

function CreateAccount(scene) {
    CreateLoadingPopup();

    let assetsToLoad = 2;
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();
            Create(scene);
        }
    };

    centerData.RequestRank(
        (result) => {
            onAssetLoaded();
        },
        (error) => {
            onAssetLoaded();
        }
    );

    centerData.RequestMyRank(
        (result) => {
            onAssetLoaded();
        },
        (error) => {
            onAssetLoaded();
        }
    );
}

export function ActiveAccount(scene, isActive) {
    if (container_account) {
        container_account.setVisible(isActive);

        if (isActive) {
            ShowGoogleButtonLoginTelegramLink();
        } else {
            HideGoogleButtonLoginTelegramLink();
        }
    } else if (container_account == null && isActive) {
        CreateAccount(scene);
    }
}

function Create(scene) {
    Destroy(scene);

    container_account = scene.add.container(0, 0);
    container_popup.add(container_account);

    container_account_0 = scene.add.container(0, 0);
    container_account.add(container_account_0);

    container_account_1 = scene.add.container(0, 0);
    container_account.add(container_account_1);

    const lock_bg = scene.add
        .image(0, 0, "home_user_info_account_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_account_1.add(lock_bg);

    container_account_1.setPosition(-2000, 0);
    scene.tweens.add({
        targets: container_account_1,
        x: 0,
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });

    const text_chip = scene.add
        .text(56, 617, "Chip: " + centerData.userInfo.Chip, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_account_1.add(text_chip);

    const text_rank = scene.add
        .text(
            56,
            685,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAccount.KEY,
                "Rank: "
            ) + centerData.myRank.rank,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_account_1.add(text_rank);

    const text_invite = scene.add
        .text(
            56,
            753,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAccount.KEY,
                "Number of invites: "
            ) + centerData.userInfo.InviteCount,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_account_1.add(text_invite);

    const invite_by = (centerData.userInfo.InviteBy && centerData.userInfo.InviteBy.trim() !== "")
        ? centerData.userInfo.InviteBy
        : "Admin";

    const text_sponsor = scene.add
        .text(
            56,
            821,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAccount.KEY,
                "Sponsor: "
            ) + invite_by,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_account_1.add(text_sponsor);

    let vipDays = 0;

    if (centerData.vipStatus.data.remainingDays) {
        vipDays = centerData.vipStatus.data.remainingDays;
    }

    const text_vip_days = scene.add
        .text(
            56,
            889,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAccount.KEY,
                "Vip days"
            ) +
                ": " +
                vipDays,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_account_1.add(text_vip_days);

    const btn_invite = CreateButton(
        scene,
        container_account_1,
        56 + 416 / 2,
        969 + 78 / 2,
        "home_user_info_account_btn_invite_friend",
        "Invite Friend"
    );
    btn_invite.button.on("pointerdown", async function () {
        // Always use web invite URL since Telegram SDK is removed
        window.open(getWebInviteUrl(centerData.userInfo.UserId), "_blank");
    });

    const btn_share_link = CreateButton(
        scene,
        container_account_1,
        56 + 416 / 2,
        1079 + 78 / 2,
        "home_user_info_account_btn_share_link",
        "Copy Invite Friend"
    );
    btn_share_link.button.on("pointerdown", async function () {
        CreateSelectInvitePopup(scene);
    });

    const btn_buy_vip = CreateButton(
        scene,
        container_account_1,
        56 + 416 / 2,
        1189 + 78 / 2,
        "home_user_info_account_btn_share_link",
        "Buy Vip"
    );
    btn_buy_vip.button.on("pointerdown", function () {
        CreateBuyVip(scene);
    });

    vip_medal = scene.add
        .image(586 + 512 / 2, 568 + 512 / 2, "home_vip_icon")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(512, 512);
    container_account_1.add(vip_medal);

    vip_medal.checkActiveVipMedal = () => {
        if (centerData.vipStatus.data.isActive == true) {
            vip_medal.setVisible(true);
        } else {
            vip_medal.setVisible(false);
        }
    };

    vip_medal.checkActiveVipMedal();

    centerData.AddChipDailyRewardChange(vip_medal.checkActiveVipMedal);

    const btn_friends = CreateButton(
        scene,
        container_account_1,
        56 + 416 / 2,
        1299 + 78 / 2,
        "home_user_info_account_btn_share_link",
        "Friends"
    );
    btn_friends.button.on("pointerdown", function () {
        CreateFriends(scene);
    });

    centerData.AddChipDailyRewardChange(vip_medal.checkActiveVipMedal);

    // if (
    //     centerData.userInfo.Email &&
    //     centerData.userInfo.linkedAccounts.google == true &&
    //     centerData.GetIsGoogleLogin() == false
    // ) {
    //     const text_linked_google = scene.add
    //         .text(
    //             56,
    //             1409,
    //             cdLocalization.getLocalization(
    //                 cdLocalization.GROUP_KEYS.HomeAccount.KEY,
    //                 "Linked Google"
    //             ) +
    //                 ": " +
    //                 centerData.userInfo.Email,
    //             {
    //                 fontFamily: cdLocalization.getCurrentFont(),
    //                 fontSize: "36px",
    //                 color: "#ffffff",
    //                 align: "left",
    //             }
    //         )
    //         .setOrigin(0, 0);
    //     container_account_1.add(text_linked_google);
    // }

    // Removed Telegram Mini App link google section - using only World App MiniKit

    //Normal link google
    ShowGoogleButtonLoginTelegramLink();
    RegisterGoogleButtonLoginTelegramLink();

    const btn_equipment = CreateButton(
        scene,
        container_account_1,
        647 + 416 / 2,
        468 + 78 / 2,
        "home_user_info_account_btn_share_link",
        "Equipment"
    );
    btn_equipment.button.on("pointerdown", function () {
        CreateUserInfoEquip(scene);
    });
}

function _onFocus() {
    console.log("HomeUserInfoAccount Scene đã được tiếp tục.");

    if (requestLinkGoogle) {
        requestLinkGoogle = false;

        console.log(
            "HomeUserInfoAccount Check Telegram Link Google Button after link"
        );

        centerData.RequestUserInfo(
            () => {
                CheckTelegramLinkGoogleButton();
            },
            (error) => {}
        );
    }
}

function CheckTelegramLinkGoogleButton() {
    if (btn_telegram_link_google) {
        if (centerData.userInfo.linkedAccounts.google == false) {
            btn_telegram_link_google.button.enableInteractive();
            btn_telegram_link_google.setVisible(true);
        } else {
            btn_telegram_link_google.button.disableInteractive();
            btn_telegram_link_google.setVisible(false);
        }
    }
}

function handleGoogleButtonLoginTelegramLink(credentialResponse) {
    centerData.RequestSigninGoogleLinkTelegram(
        credentialResponse.credential,
        (result) => {
            HideGoogleButtonLoginTelegramLink();
        },
        (error) => {
            console.log(
                "RequestSigninGoogleLinkTelegram Google Telegram Link Error: ",
                error
            );
        }
    );
}

function handleGoogleButtonLoginTelegramLinkError() {
    console.log("Google Telegram Link Error: ");
}

function RegisterGoogleButtonLoginTelegramLink() {
    EventBus.on(
        "react-google-button-login-telegram-link",
        handleGoogleButtonLoginTelegramLink
    );
    EventBus.on(
        "react-google-button-login-error-telegram-link",
        handleGoogleButtonLoginTelegramLinkError
    );
}

function RemoveGoogleButtonLoginTelegramLink() {
    EventBus.off(
        "react-google-button-login-telegram-link",
        handleGoogleButtonLoginTelegramLink
    );
    EventBus.off(
        "react-google-button-login-error-telegram-link",
        handleGoogleButtonLoginTelegramLinkError
    );
}

function CreateButton(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 416;
    let btnHeight = 78;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, imageKey)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    btn_inner_container.add(btn_container.button);

    const text = scene.add
        .text(
            btnWidth / 2,
            btnHeight / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAccount.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "36px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    return btn_container;
}

export function Destroy(scene) {
    RemoveGoogleButtonLoginTelegramLink();

    HideGoogleButtonLoginTelegramLink();

    // Cleanup event listeners
    if (scene && scene.game && scene.game.events) {
        scene.game.events.removeListener(Phaser.Core.Events.FOCUS, _onFocus);
    }
    requestLinkGoogle = false;

    if (vip_medal) {
        centerData.RemoveChipDailyRewardChange(vip_medal.checkActiveVipMedal);
    }

    if (container_account) {
        container_account.destroy();

        container_account = null;
    }
}

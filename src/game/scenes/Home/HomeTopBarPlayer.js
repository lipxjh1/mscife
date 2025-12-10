import { AssetLoadingManager } from "../AssetLoadingManager.js";

import { IsOpen as CheckMarketOpen } from "./HomeShop/HomeShop.js";
import { IsOpen as CheckInventoryOpen } from "./HomeInventory/HomeInventory.js";
import { IsOpen as CheckCharacterInventoryOpen } from "./HomeCharacterInventory/HomeCharacterInventory.js";

import { OpenMuskContainer } from "../Home/HomeMusk.js";

import centerData from "../../Data/CenterData.js";

import { CreateLoadingPopup, HideLoadingPopup } from "../Share/AlertPopup.js";
import { CreateReward } from "./HomeReward/HomeReward.js";
import {
    CreateUserInfo,
    IsOpen as CheckUserInfoOpen,
} from "./HomeUserInfo/HomeUserInfo.js";
import centerDataAvatar from "../../Data/CenterDataAvatar.js";
import {
    CreateAvatarSelector,
    IsOpen as CheckAvatarSelectorOpen,
} from "./HomeAvatarSelector.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";
import { socketService } from "../../socket.js";

//tạo top bar bg
let top_bar_notice_container = null;
const top_bar_notice_defaultPosition = { x: 0, y: 19 };
const top_bar_notice_hidePosition = { x: 0, y: -250 };

let avatar = null;
let currentBanner = null;
let text_title = null;

let default_banner_text = import.meta.env.VITE_BANNER_DEFAULT_TEXT || "M-SCI Game";

export function CreateTopBarNotice(scene) {
    top_bar_notice_container = scene.add.container(
        top_bar_notice_defaultPosition.x,
        top_bar_notice_defaultPosition.y
    );
    top_bar_notice_container.setDepth(300);

    const bg = scene.add.rectangle(
        1080 / 2,
        200 / 2,
        1080,
        200,
        0x000000,
        0.75
    );
    top_bar_notice_container.add(bg);

    text_title = scene.add
        .text(1080, 200 / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "46px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0.5);
    top_bar_notice_container.add(text_title);

    // Default banner text
    updateBannerText(default_banner_text);

    // // Register for socket banner push events
    // socketService.on("banner_push_received", handleBannerPush);

    // // Cleanup when scene is shutdown
    // scene.events.once("shutdown", () => {
    //     cdLocalization.RemoveLocalizationChange(text_title_localization);
    //     socketService.off("banner_push_received", handleBannerPush);
    // });

    function handleBannerPush(bannerData) {
        //console.log("Received banner push:", bannerData);
        if (bannerData && bannerData.title) {
            currentBanner = bannerData;
            updateBannerText(bannerData.title);

            // If banner has a displayConfig with duration, reset banner after that time
            if (bannerData.displayConfig && bannerData.displayConfig.duration) {
                setTimeout(() => {
                    // Don't reset to default message after duration
                    // Just clear the current banner reference
                    currentBanner = null;
                }, bannerData.displayConfig.duration);
            }
        }
    }

    function updateBannerText(message) {
        text_title.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeLobby.KEY,
                message
            )
        );

        text_title.setStyle({
            fontFamily: cdLocalization.getCurrentFont(),
        });

        // Reset and restart the animation
        scene.tweens.killTweensOf(text_title);
        text_title.x = 1080;

        const speed = 100;
        const endX = -text_title.width;
        const distance = Phaser.Math.Distance.Between(1080, 0, endX, 0);
        const duration = (distance / speed) * 1000;

        scene.tweens.add({
            targets: text_title,
            x: endX,
            duration: duration,
            ease: "Linear",
            repeat: -1,
            onComplete: () => {
                // Don't reset text after animation completes
            },
        });
    }

    let text_title_localization = () => {
        text_title.setStyle({
            fontFamily: cdLocalization.getCurrentFont(),
        });

        // Only update text if there's no active banner
        if (!currentBanner) {
            updateBannerText(default_banner_text);
        }
    };

    text_title_localization();

    // Register event
    cdLocalization.AddLocalizationChange(text_title_localization);
}

export function OpenTopBarNotice(scene) {
    scene.tweens.add({
        targets: top_bar_notice_container,
        x: top_bar_notice_defaultPosition.x,
        y: top_bar_notice_defaultPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

export function HideTopBarNotice(scene) {
    scene.tweens.add({
        targets: top_bar_notice_container,
        x: top_bar_notice_hidePosition.x,
        y: top_bar_notice_hidePosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

//kết thúc tạo top bar bg

//tạo player currency
let currency_container = null;
const currency_container_defaultPosition = { x: 0, y: 0 };
const currency_container_hidePosition = { x: 540, y: 0 };
const currency_container_optionsPosition = { x: -20, y: 800 };

let btn_currency_chip_1 = null;

let btn_currency_chip_2 = null;

let currency_event_listener = null;

let currency_bar_tween = null;

export function CreateCurrencyBar(scene) {
    // currency_container
    currency_container = scene.add.container(
        currency_container_defaultPosition.x,
        currency_container_defaultPosition.y
    );
    currency_container.setDepth(300);

    // chip_bg_1
    btn_currency_chip_1 = CreateCurrencyButton(scene);

    btn_currency_chip_1.setPosition(560 + 515 / 2, 238 + 64 / 2);

    btn_currency_chip_1.icon.setTexture("home_top_currency_chip_1");

    btn_currency_chip_1.text_value.setText("0");

    btn_currency_chip_1.button.on("pointerdown", function () {
        CreateReward(scene);
    });

    // chip_bg_2
    btn_currency_chip_2 = CreateCurrencyButton(scene);

    btn_currency_chip_2.setPosition(560 + 515 / 2, 306 + 64 / 2);

    btn_currency_chip_2.icon.setTexture("home_top_currency_chip_2");

    btn_currency_chip_2.text_value.setText("0");

    btn_currency_chip_2.button.on("pointerdown", function () {
        OpenMuskContainer(scene);
    });

    // Thêm sự kiện cập nhật văn bản mới
    currency_event_listener = () => {
        if (btn_currency_chip_1 && btn_currency_chip_1.text_value) {
            btn_currency_chip_1.text_value.setText(
                centerData.userInfo?.Chip ?? 0
            );
        }

        if (btn_currency_chip_2 && btn_currency_chip_2.text_value) {
            btn_currency_chip_2.text_value.setText(
                centerData.userInfo?.Musk ?? 0
            );
        }
    };

    centerData.AddPlayerInfoChange(currency_event_listener);

    scene.events.once("shutdown", () => {
        centerData.RemovePlayerInfoChange(currency_event_listener);
    });
}

function CreateCurrencyButton(scene) {
    // Tạo button với RexUI

    let btnWidth = 515;
    let btnHeight = 64;

    let container_btn = scene.add.container(0, 0);
    currency_container.add(container_btn);

    let container_inner = scene.add.container(-btnWidth / 2, -btnHeight / 2);
    container_btn.add(container_inner);

    let button = scene.add
        .image(0, 0, "home_top_currency_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("Open currency clicked");
        })
        .on("pointerover", function () {
            //console.log("ButtonBattle over");

            scene.tweens.add({
                targets: container_btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("ButtonBattle out");

            scene.tweens.add({
                targets: container_btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_inner.add(button);
    container_btn.button = button;

    let icon = scene.add
        .image(btnWidth - 64, btnHeight / 2, "home_top_currency_chip_2")
        .setOrigin(0, 0.5);
    container_inner.add(icon);
    container_btn.icon = icon;

    let text_value = scene.add
        .text(btnWidth - 73, btnHeight / 2, "000000", {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 0.5);
    container_inner.add(text_value);
    container_btn.text_value = text_value;

    return container_btn;
}

export function OpenCurrencyBar(scene) {
    if (currency_bar_tween) {
        currency_bar_tween.stop();
        scene.tweens.remove(currency_bar_tween);
    }

    currency_bar_tween = scene.tweens.add({
        targets: currency_container,
        x: currency_container_defaultPosition.x,
        y: currency_container_defaultPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

export function HideCurrencyBar(scene) {
    //console.log("HideCurrencyBar");

    if (currency_bar_tween) {
        currency_bar_tween.stop();
        scene.tweens.remove(currency_bar_tween);
    }

    currency_bar_tween = scene.tweens.add({
        targets: currency_container,
        x: currency_container_hidePosition.x,
        y: currency_container_hidePosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

export function OptionsCurrencyBar(scene) {
    //console.log("OptionsCurrencyBar");

    if (currency_bar_tween) {
        currency_bar_tween.stop();
        scene.tweens.remove(currency_bar_tween);
    }

    currency_bar_tween = scene.tweens.add({
        targets: currency_container,
        x: currency_container_optionsPosition.x,
        y: currency_container_optionsPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

//kết thúc tạo player currency

//tạo player bar

let player_bar_Container = null;
const player_bar_defaultPosition = { x: -20, y: 145 };
const player_bar_hidePosition = { x: -1000, y: 145 };
const player_bar_accountPosition = { x: -20, y: 358 };
const player_bar_rankPosition = { x: -20 + 62, y: 353 };

let player_bar_tween = null;

let btn_Open_Player_Info = null;

export function CreatePlayerBar(scene) {
    player_bar_Container = scene.add.container(
        player_bar_defaultPosition.x,
        player_bar_defaultPosition.y
    ); // Tọa độ của container

    player_bar_Container.setDepth(300);

    btn_Open_Player_Info = scene.add
        .image(0, 0, "home_top_bar_player_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            if (
                CheckUserInfoOpen() == false &&
                CheckAvatarSelectorOpen() == false
            ) {
                CreateUserInfo(scene);
            }
        })
        .on("pointerover", function () {
            player_bar_Container.each(function (child) {
                if (child.setTint && child != avatar) {
                    child.setTint(0x646464); // Màu tint bạn muốn áp dụng
                }
            });
        })
        .on("pointerout", function () {
            player_bar_Container.each(function (child) {
                if (child.clearTint && child != avatar) {
                    child.clearTint(); // Xóa tint
                }
            });
        });
    player_bar_Container.add(btn_Open_Player_Info);

    avatar = scene.add
        .image(220 / 2 + 10, 220 / 2, "home_top_bar_player_avatar")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            if (
                CheckUserInfoOpen() == false &&
                CheckAvatarSelectorOpen() == false
            ) {
                CreateAvatarSelector(scene);
            }
        })
        .on("pointerover", function () {
            avatar.setTint(0x646464);
        })
        .on("pointerout", function () {
            avatar.clearTint();
        });

    avatar.setAvatar = function (imgKey) {
        avatar.setTexture(imgKey);
        avatar.setScale(211 / 256);
    };

    player_bar_Container.add(avatar);

    LoadAvatar(scene);

    // let text_vip_days = scene.add
    //     .text(40 + 147 / 2, 180 + 147 / 2, "", {
    //         fontFamily: cdLocalization.getCurrentFont(),
    //         fontSize: "36px",
    //         color: "#ffffff",
    //         shadow: {
    //             offsetX: 2,
    //             offsetY: 2,
    //             color: "#FF9D00",
    //             blur: 7,
    //             stroke: true,
    //             fill: true,
    //         },
    //         align: "center",
    //     })
    //     .setOrigin(0.5, 0);

    // player_bar_Container.add(text_vip_days);

    let vipIcon = scene.add
        .image(35 + 147 / 2, 125 + 147 / 2, "home_vip_icon")
        .setOrigin(0.5, 0.5);
    player_bar_Container.add(vipIcon);

    vipIcon.CheckVipIcon = function () {
        if (centerData.vipStatus.data.isActive == true) {
            vipIcon.setVisible(true);
            // text_vip_days.setVisible(true);

            // text_vip_days.setStyle({
            //     fontFamily: cdLocalization.getCurrentFont(),
            // });

            // text_vip_days.setText(
            //     centerData.vipStatus.data.remainingDays +
            //         " " +
            //         cdLocalization.getLocalization(
            //             cdLocalization.GROUP_KEYS.Main.KEY,
            //             "Days"
            //         )
            // );
        } else {
            vipIcon.setVisible(false);
            //text_vip_days.setVisible(false);
        }
    };

    vipIcon.CheckVipIcon();

    // Đăng ký event
    cdLocalization.AddLocalizationChange(vipIcon.CheckVipIcon);

    // Gỡ bỏ khi scene bị shutdown
    scene.events.once("shutdown", () => {
        cdLocalization.RemoveLocalizationChange(vipIcon.CheckVipIcon);
    });

    centerData.AddVipStatusChange(vipIcon.CheckVipIcon);

    scene.events.once("shutdown", () => {
        centerData.RemoveVipStatusChange(vipIcon.CheckVipIcon);
    });

    let text_user_name = scene.add
        .text(228, 116, centerData.userInfo.Username || "No user loaded", {
            fontFamily: "Russo One",
            fontSize: "36px",
            color: "#ffffff",
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: "#FF9D00",
                blur: 7,
                stroke: true,
                fill: true,
            },
            align: "left",
        })
        .setOrigin(0, 0);

    player_bar_Container.add(text_user_name);

    let text_user_id = scene.add
        .text(228, 172, "ID: " + centerData.userInfo.UserId, {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#D2D2D2",
        })
        .setOrigin(0, 0);

    player_bar_Container.add(text_user_id);

    DefaultPlayerBar();
}

function LoadAvatar(scene) {
    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadAvatars(() => {
        // console.log(
        //     `Avatar ${
        //         centerData.userInfo.Avatar
        //     } exist: ${centerDataAvatar.isExist(centerData.userInfo.Avatar)}`
        // );

        if (
            centerData.userInfo.Avatar &&
            centerData.userInfo.Avatar !== "" &&
            centerDataAvatar.isExist(centerData.userInfo.Avatar)
        ) {
            UpdateAvatar(scene, centerData.userInfo.Avatar);
        } else {
            let randomAvatarKey = centerDataAvatar.getRandomFreeAvatar();

            centerData.RequestUpdateAvatar(
                randomAvatarKey,
                () => {
                    UpdateAvatar(scene, randomAvatarKey);
                },
                () => {}
            );
        }
    });
}

export function UpdateAvatar(scene, avatarKey) {
    avatar.setAvatar(avatarKey);
}

function DefaultPlayerBar() {
    player_bar_Container.x = player_bar_defaultPosition.x;
    player_bar_Container.y = player_bar_defaultPosition.y;
}

export function MovePlayerBarToHide(scene) {
    if (player_bar_tween) {
        player_bar_tween.stop();
        scene.tweens.remove(player_bar_tween);
    }

    player_bar_tween = scene.tweens.add({
        targets: player_bar_Container,
        x: player_bar_hidePosition.x,
        y: player_bar_hidePosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            //console.log("Open player bar complete!"); // Thông báo khi tween hoàn thành
        },
    });
}

export function MovePlayerBarToAccount(scene) {
    if (player_bar_tween) {
        player_bar_tween.stop();
        scene.tweens.remove(player_bar_tween);
    }

    player_bar_tween = scene.tweens.add({
        targets: player_bar_Container,
        x: player_bar_accountPosition.x,
        y: player_bar_accountPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            //console.log("Close player bar complete!"); // Thông báo khi tween hoàn thành
        },
    });
}

export function MovePlayerBarToRank(scene) {
    if (player_bar_tween) {
        player_bar_tween.stop();
        scene.tweens.remove(player_bar_tween);
    }

    player_bar_tween = scene.tweens.add({
        targets: player_bar_Container,
        x: player_bar_rankPosition.x,
        y: player_bar_rankPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            //console.log("Close player bar complete!"); // Thông báo khi tween hoàn thành
        },
    });
}

export function MovePlayerBarToDefault(scene) {
    if (player_bar_tween) {
        player_bar_tween.stop();
        scene.tweens.remove(player_bar_tween);
    }

    player_bar_tween = scene.tweens.add({
        targets: player_bar_Container,
        x: player_bar_defaultPosition.x,
        y: player_bar_defaultPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            //console.log("Close player bar complete!"); // Thông báo khi tween hoàn thành
        },
    });
}


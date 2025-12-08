// Removed Telegram SDK import - using window.open() instead

import centerData from "../../Data/CenterData";

import { CreateAlertPopup, CreateLoadingPopup,  HideLoadingPopup } from "../Share/AlertPopup.js";
import { isTelegramMiniApp } from "../../utils.js";
import { create } from "domain";
import { CreateSelectInvitePopup, getWebInviteUrl } from "../Share/PopupCopyInviteUrl.js";

let container_main = null;

let container_popup = null;
const container_popup_openPosition = { x: 0, y: 0 };
const container_popup_closePosition = { x: 0, y: 4000 };

let container_friend_list = null;

export function CreateInviteFriends(scene) {
    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const lock_bg = scene.rexUI.add.roundRectangle(
        window.originWidth / 2,
        window.originHeight / 2,
        window.originWidth,
        window.originHeight,
        0,
        0x000000,
        0.75
    );

    // Thiết lập tương tác
    lock_bg.setInteractive({ useHandCursor: true }); // Thêm { useHandCursor: true } để thay đổi con trỏ thành bàn tay khi di chuột vào

    // Bắt sự kiện click hoặc chạm vào
    lock_bg.on("pointerdown", function (pointer) {});

    container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    const popup_bg = scene.add
        .image(38, 296, "home_invite_friends_bg")
        .setOrigin(0, 0);

    container_popup.add(popup_bg);

    //Create share btn
    const btn_share = scene.add
        .image(546 + 188 / 2, 464 + 65 / 2, "home_invite_friends_share_button")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", async function () {
            //console.log("btn_share clicked");

            if (await isTelegramMiniApp()) {
                window.open(centerData.GetTelegramShareUrl(), "_blank");
            } else {
                window.open(getWebInviteUrl(centerData.userInfo.UserId), "_blank");
            }

            // Tạo hiệu ứng phóng to 20% khi click
            scene.tweens.add({
                targets: btn_share,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                yoyo: true, // Tự động thu nhỏ lại sau khi phóng to
                ease: "Power2",
            });
        })
        .on("pointerover", function () {
            //console.log("btn_share over");

            scene.tweens.add({
                targets: btn_share,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("btn_share out");

            scene.tweens.add({
                targets: btn_share,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_popup.add(btn_share);

    //Create share btn
    const btn_copy = scene.add
        .image(777 + 188 / 2, 464 + 65 / 2, "home_invite_friends_copy_button")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", async function () {
            CreateSelectInvitePopup(scene);

            // Tạo hiệu ứng phóng to 20% khi click
            scene.tweens.add({
                targets: btn_copy,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                yoyo: true, // Tự động thu nhỏ lại sau khi phóng to
                ease: "Power2",
            });
        })
        .on("pointerover", function () {
            //console.log("btn_share over");

            scene.tweens.add({
                targets: btn_copy,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("btn_share out");

            scene.tweens.add({
                targets: btn_copy,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_popup.add(btn_copy);

    //text invited friends
    const text_invited_friends = scene.add.text(
        143,
        756,
        "x" + centerData.userInfo.InviteCount,
        {}
    );
    text_invited_friends.setOrigin(0, 0);
    text_invited_friends.setStyle({
        color: "#DCDCDC",
        fontFamily: "Russo One",
        fontSize: "24px",
        fontStyle: "normal",
    });
    container_popup.add(text_invited_friends);

    //text invited friends
    const text_points_earned = scene.add.text(440, 756, "x0000", {});
    text_points_earned.setOrigin(0, 0);
    text_points_earned.setStyle({
        color: "#DCDCDC",
        fontFamily: "Russo One",
        fontSize: "24px",
        fontStyle: "normal",
    });
    container_popup.add(text_points_earned);

    CreateLoadingPopup();

    centerData.RequestInviteFriend(
        (result) => {
            HideLoadingPopup();

            CreateInviteFriendList(scene, result.data);
        },
        (error) => {
            HideLoadingPopup();
        }
    );

    //create close btn
    const btn_close = scene.add
        .image(956 + 86 / 2, 240 + 86 / 2, "share_btn_close")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            CloseInviteFriend(scene);
        })
        .on("pointerover", function () {
            //console.log("btn_close over");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("btn_close out");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_popup.add(btn_close);

    OpenInviteFriend(scene);
}

function CreateInviteFriendList(scene, arr_friends_data) {
    //Create friend list
    container_friend_list = scene.add.container(0, 0);
    container_popup.add(container_friend_list);

    if (!arr_friends_data || arr_friends_data.length <= 0) {
        return;
    }

    // Kích thước của ScrollView
    const scrollViewWidth = 926;
    const scrollViewHeight = 1028;

    const columns = 1;
    const rows = Math.ceil(arr_friends_data.length / columns);

    const itemWidth = 926;
    const itemHeight = 36;
    const itemSpacing = 32;

    const posX = 540;
    const posY = 874 + 926 / 2 + itemHeight;

    // const background = scene.add
    //   .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
    //   .setAlpha(0.8);

    // container_friend_list.add(background);

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

    container_friend_list.add(scrollablePanel);

    for (let i = 0; i < arr_friends_data.length; i++) {
        const item = scene.add.container(0, 0);
        item.setSize(itemWidth, itemHeight);

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

        const text_number = scene.add
            .text(-itemWidth / 2, 0, i + 1 + ".", {
                fontFamily: "Russo One",
                fontSize: "32px",
                color: "#777",
                align: "center",
            })
            .setOrigin(0, 0.5);
        item.add(text_number);

        scrollablePanel.getElement("panel").add(item, {
            align: "top-left",
            expand: false,
        });

        const text_name = scene.add
            .text(0, 0, arr_friends_data[i].Username, {
                fontFamily: "Russo One",
                fontSize: "32px",
                color: "#777",
                align: "center",
            })
            .setOrigin(0.5, 0.5);
        item.add(text_name);

        scrollablePanel.getElement("panel").add(item, {
            align: "top-left",
            expand: false,
        });
    }

    scrollablePanel.layout();

    const maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);

    //create footer bg
    const footer_bg = scene.add
        .image(originWidth / 2, originHeight, "home_invite_friends_footer_bg")
        .setOrigin(0.5, 1);

    container_popup.add(footer_bg);
}

function OpenInviteFriend(scene) {
    container_popup.setPosition(
        container_popup_closePosition.x,
        container_popup_closePosition.y
    );

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_openPosition.x,
        y: container_popup_openPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

function CloseInviteFriend(scene) {
    scene.tweens.add({
        targets: container_popup,
        x: container_popup_closePosition.x,
        y: container_popup_closePosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            Destroy();
        },
    });
}

function Destroy() {
    container_main.destroy();
}

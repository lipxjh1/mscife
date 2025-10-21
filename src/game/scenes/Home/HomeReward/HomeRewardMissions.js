import { openLink } from "@telegram-apps/sdk";
import { openTelegramLink } from "@telegram-apps/sdk";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";

import { container_main, container_popup } from "./HomeReward.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { CreateGiftCodePopup } from "../../Share/PopupGiftCode.js";
import { isTelegramMiniApp } from "../../../utils.js";

let container_mission = null;

let maskShape = null;

let mask = null;

function CreateMission(scene) {
    CreateLoadingPopup();

    centerData.RequestQuestInfo(
        (result) => {
            HideLoadingPopup();

            CreateList(scene, result.data);
        },
        (error) => {
            HideLoadingPopup();

            //console.log("lấy quest thất bại:", error);
            // Thực hiện các hành động khi đăng nhập thất bại
        }
    );
}

export function ActiveMission(scene, isActive) {
    if (container_mission) {
        container_mission.setVisible(isActive);
    } else if (container_mission == null && isActive) {
        CreateMission(scene);
    }
}

function CreateList(scene, arr_data) {
    Destroy();

    //Create friend list
    container_mission = scene.add.container(0, 0);
    container_popup.add(container_mission);

    if (!arr_data || arr_data.length <= 0) {
        return;
    }

    arr_data.sort((a, b) => a.status - b.status);

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1538;

    const columns = 1;
    const rows = Math.ceil(arr_data.length / columns);

    const itemWidth = 1004;
    const itemHeight = 353;
    const itemSpacing = 30;

    const posX = 38 + scrollViewWidth / 2;
    const posY = 382 + scrollViewHeight / 2;

    // const background = scene.add
    //   .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
    //   .setAlpha(0.8);

    // container_mission.add(background);

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
                bottom: 40,
            },
        })
        .layout();

    container_mission.add(scrollablePanel);

    for (let i = 0; i < arr_data.length; i++) {
        const item = scene.add.container(0, 0);
        item.setSize(itemWidth, itemHeight);

        item.quest = arr_data[i];

        let container_inner = scene.add.container(-1004 / 2, -353 / 2);
        item.add(container_inner);

        //console.log(`item.quest${i}`, item.quest);

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
                1004, // Chiều rộng
                353, // Chiều cao
                0, // Độ bo góc
                0x4e4e4e, // Màu nền
                0.4 // Độ trong suốt
            )
            .setOrigin(0, 0);
        container_inner.add(bg);

        const text_title = scene.add
            .text(
                14,
                10.5,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeMission.KEY,
                    item.quest.title
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "38px",
                    color: "#ffffff",
                    align: "left",
                    wordWrap: { width: 680, useAdvancedWrap: true },
                }
            )
            .setOrigin(0, 0);
        container_inner.add(text_title);

        // const text_content = scene.add
        //     .text(14, 97, "None", {
        //         fontFamily: "Russo One",
        //         fontSize: "28px",
        //         color: "#ffffff",
        //         align: "left",
        //     })
        //     .setOrigin(0, 0);
        // container_inner.add(text_content);

        //Create go btn
        const btn_go = CreateButtonGo(
            scene,
            container_inner,
            694 + 288 / 2,
            169 + 72 / 2,
            item
        );
        item.btn_go = btn_go;

        //Create share btn
        const btn_claim = CreateButtonClaim(
            scene,
            container_inner,
            694 + 288 / 2,
            259 + 72 / 2,
            item
        );
        item.btn_claim = btn_claim;

        if (item.quest.chip && item.quest.chip > 0) {
            const containter_reward_0 = scene.add.container(
                14 + 94 / 2,
                229 + 94 / 2
            );
            container_inner.add(containter_reward_0);

            const reward_0 = scene.add
                .image(0, 0, "home_reward_item_bg")
                .setOrigin(0.5, 0.5);
            containter_reward_0.add(reward_0);

            const reward_0_chip = scene.add
                .image(0, 0, "home_top_currency_chip_1")
                .setOrigin(0.5, 0.5);
            containter_reward_0.add(reward_0_chip);

            let reward_0_text = scene.add
                .text(94 / 2 - 5, 94 / 2 - 5, "x" + item.quest.chip, {
                    fontFamily: "Russo One",
                    fontSize: "24px",
                    color: "#ffffff",
                    align: "right",
                })
                .setOrigin(1, 1);
            containter_reward_0.add(reward_0_text);
        }

        if (item.quest.musk && item.quest.musk > 0) {
            const containter_reward_1 = scene.add.container(
                132 + 94 / 2,
                229 + 94 / 2
            );
            container_inner.add(containter_reward_1);

            const reward_1 = scene.add
                .image(0, 0, "home_reward_item_bg")
                .setOrigin(0.5, 0.5);
            containter_reward_1.add(reward_1);

            const reward_1_chip = scene.add
                .image(0, 0, "home_top_currency_chip_2")
                .setOrigin(0.5, 0.5);
            containter_reward_1.add(reward_1_chip);

            let reward_1_text = scene.add
                .text(94 / 2 - 5, 94 / 2 - 5, "x" + item.quest.musk, {
                    fontFamily: "Russo One",
                    fontSize: "24px",
                    color: "#ffffff",
                    align: "right",
                })
                .setOrigin(1, 1);
            containter_reward_1.add(reward_1_text);
        }

        const btn_checked = scene.add
            .image(710 + 280 / 2, 353 / 2, "home_reward_checked")
            .setOrigin(0.5, 0.5);
        item.btn_checked = btn_checked;
        container_inner.add(btn_checked);

        item.setQuestInProcess = function () {
            item.btn_go.setVisible(true);
            item.btn_claim.setVisible(false);

            btn_checked.setVisible(false);
        };

        // Thêm một function vào container
        item.setQuestClaim = function () {
            item.btn_go.setVisible(false);
            item.btn_claim.setVisible(true);
        };

        // Thêm một function vào container
        item.setQuestDone = function () {
            item.btn_go.setVisible(false);
            item.btn_claim.setVisible(false);

            btn_checked.setVisible(true);
        };

        if (item.quest.status === 0) {
            item.setQuestInProcess();
        } else {
            item.setQuestDone();
        }

        // let item_origin = scene.add
        //     .rectangle(0, 0, 20, 20, 0x000000)
        //     .setOrigin(0.5, 0.5);
        // item.add(item_origin);

        scrollablePanel.getElement("panel").add(item, {
            align: "top-left",
            expand: false,
        });
    }

    scrollablePanel.layout();

    maskShape = scene.add
        .rectangle(0 + 1080 / 2, 382 + 1538 / 2, 1080, 1538, 0x000000)
        .setVisible(false);
    container_mission.add(maskShape);

    mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateButton0(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 288;
    let btnHeight = 72;

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
            btnHeight / 2 - 4,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeMission.KEY,
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

function CreateButtonGo(scene, container, x, y, item) {
    const btn = CreateButton0(
        scene,
        container,
        x,
        y,
        "home_reward_btn_go",
        "Go"
    );
    btn.button.on("pointerdown", async function () {
        //console.log("btn_go clicked");

        if (item.quest.code === "INVITE") {
            if (await isTelegramMiniApp()) {
                openTelegramLink(centerData.GetTelegramShareUrl());
            } else {
                window.open(
                    getWebInviteUrl(centerData.userInfo.UserId),
                    "_blank"
                );
            }
        } else {
            if (item.quest.payload.indexOf("t.me") !== -1) {
                let url = item.quest.payload;

                if (await isTelegramMiniApp()) {
                    openTelegramLink(url);
                } else {
                    window.open(url, "_blank");
                }
            } else {
                if (await isTelegramMiniApp()) {
                    // Gọi hàm openLink với url và các tùy chọn (tuỳ chọn này là không bắt buộc)
                    openLink(item.quest.payload, {
                        try_instant_view: true, // Mở bằng Telegram Instant View nếu có
                        disable_web_page_preview: true, // Tắt xem trước trang web
                    });
                } else {
                    window.open(item.quest.payload, "_blank");
                }
            }
        }

        scene.time.delayedCall(5000, () => {
            if (item.quest.code != "INVITE") {
                item.setQuestClaim();
            }
        });

        // Tạo hiệu ứng phóng to 20% khi click
        scene.tweens.add({
            targets: btn,
            scaleX: 1.2, // Phóng to 20% theo chiều ngang
            scaleY: 1.2, // Phóng to 20% theo chiều dọc
            duration: 100, // Thời gian hiệu ứng (ms)
            yoyo: true, // Tự động thu nhỏ lại sau khi phóng to
            ease: "Power2",
        });
    });

    return btn;
}

function CreateButtonClaim(scene, container, x, y, item) {
    const btn = CreateButton0(
        scene,
        container,
        x,
        y,
        "home_reward_btn_claim",
        "Claim"
    );
    btn.button.on("pointerdown", function () {
        //console.log("btn_claim clicked");

        if (item.quest.payload.indexOf("youtu.be") !== -1) {
            item.setQuestDone();

            CreateAlertPopup(
                scene,
                "Your code: 1234",
                () => {
                    CreateGiftCodePopup(scene);
                },
                () => {
                    CreateGiftCodePopup(scene);
                }
            );
        } else {
            centerData.RequestMarkQuestDone(
                item.quest.code,
                (result) => {
                    item.setQuestDone();
                },
                (error) => {
                    //console.log("RequestMarkQuestDone thất bại:", error);
                }
            );
        }

        // Tạo hiệu ứng phóng to 20% khi click
        scene.tweens.add({
            targets: btn,
            scaleX: 1.2, // Phóng to 20% theo chiều ngang
            scaleY: 1.2, // Phóng to 20% theo chiều dọc
            duration: 100, // Thời gian hiệu ứng (ms)
            yoyo: true, // Tự động thu nhỏ lại sau khi phóng to
            ease: "Power2",
        });
    });

    return btn;
}

export function Destroy() {
    if (container_mission) {
        container_mission.destroy();

        container_mission = null;
    }

    if (maskShape) {
        maskShape.destroy();
    }

    if (mask) {
        mask.destroy();
    }
}

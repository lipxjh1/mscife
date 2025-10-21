import { CreateAlertPopup, CreateLoadingPopup,  HideLoadingPopup } from "../Share/AlertPopup.js";

import centerData from "../../Data/CenterData.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";
import { CreateBuyVipPopup } from "../Share/PopupBuyVip.js";

let container_main = null;
let maskShape = null;
let mask = null;

let data = [];

export function CreateBuyVip(scene) {
    data = [
        // {
        //     code: "vip_1",
        //     title: "Vip 1",
        //     priceMusk: 1000,
        //     description: `x10 daily chip earned for a completed campaign battle\n
        //     Automatic attendance\n
        //     Increase the upgrade success rate by 10%\n
        //     50% discount on fees when trading on OTC`,
        //     imgKey: "home_vip_icon_1",
        // },
        // {
        //     code: "vip_2",
        //     title: "Vip 2",
        //     priceMusk: 500,
        //     description: `x5 daily chip earned for a completed campaign battle\n
        //     Automatic attendance\n
        //     Increase the upgrade success rate by 8%\n
        //     30% discount on fees when trading on OTC`,
        //     imgKey: "home_vip_icon_2",
        // },
        // {
        //     code: "vip_3",
        //     title: "Vip 3",
        //     priceMusk: 100,
        //     description: `x2 daily chip earned for a completed campaign battle\n
        //     Automatic attendance\n
        //     Increase the upgrade success rate by 5%\n
        //     20% discount on fees when trading on OTC`,
        //     imgKey: "home_vip_icon_3",
        // },
        {
            code: "vip",
            title: "Vip",
            priceMusk: 100,
            description: `${cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "x2 daily chip earned for a completed campaign battle"
            )}\n
            ${cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "Automatic attendance"
            )}\n
            ${cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "Increase the upgrade success rate by 5%"
            )}\n
            ${cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "20% discount on fees when trading on OTC"
            )}`,
            imgKey: "home_vip_icon",
        },
    ];

    CreateList(scene, data);
}

function CreateList(scene, arr_data) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    let container_airdrop = scene.add.container(0, 0);
    container_main.add(container_airdrop);

    // const lock_bg = scene.rexUI.add
    //     .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.75)
    //     .setInteractive({ useHandCursor: true });
    // container_airdrop.add(lock_bg);

    const lock_bg = scene.add
        .image(0, 0, "home_vip_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_airdrop.add(lock_bg);

    let title = scene.add
        .image(668 + 374 / 2, 80 + 90 / 2, "home_vip_title")
        .setOrigin(0.5, 0.5);
    container_airdrop.add(title);

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

    container_airdrop.add(btn_close);

    if (!arr_data || arr_data.length <= 0) {
        return;
    }

    const scrollViewWidth = 1080;
    const scrollViewHeight = 1538;
    const columns = 1;
    const rows = 1;
    const itemWidth = 1004;
    const itemHeight = 391;
    const itemSpacing = 30;
    const posX = 38 + scrollViewWidth / 2;
    const posY = 382 + scrollViewHeight / 2;

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

    container_airdrop.add(scrollablePanel);

    // Add scroll event handler for visibility updates
    scrollablePanel.on("scroll", function () {});

    for (let i = 0; i < arr_data.length; i++) {
        const container_airdrop_unit = scene.add.container(0, 0);
        container_airdrop_unit.setSize(itemWidth, itemHeight);
        container_airdrop_unit.itemData = arr_data[i];

        let container_inner = scene.add.container(-1004 / 2, -391 / 2);
        container_airdrop_unit.add(container_inner);

        let bg = scene.rexUI.add
            .roundRectangle(0, 0, 1004, 391, 0, 0x4e4e4e, 0.4)
            .setOrigin(0, 0);
        container_inner.add(bg);

        const text_title = scene.add
            .text(14, 10.5, "None", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "left",
                wordWrap: { width: 680, useAdvancedWrap: true },
            })
            .setOrigin(0, 0);
        container_inner.add(text_title);

        if (container_airdrop_unit.itemData.title) {
            text_title.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    container_airdrop_unit.itemData.title
                )
            );
        } else {
            text_title.setText(
                container_airdrop_unit.itemData.code.replaceAll("_", " ")
            );
        }

        const text_description = scene.add
            .text(
                14,
                97,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    container_airdrop_unit.itemData.description
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "28px",
                    color: "#ffffff",
                    align: "left",
                    wordWrap: { width: 648, useAdvancedWrap: true },
                }
            )
            .setOrigin(0, 0);
        container_inner.add(text_description);

        const icon = scene.add
            .image(
                730 + 225 / 2,
                30 + 225 / 2,
                container_airdrop_unit.itemData.imgKey
            )
            .setDisplaySize(225, 225)
            .setOrigin(0.5, 0.5);
        container_inner.add(icon);

        const btn_buy = CreateButton0(
            scene,
            container_inner,
            702 + 288 / 2,
            297 + 72 / 2,
            "home_vip_btn",
            container_airdrop_unit.itemData.priceMusk +
                " " +
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "M-Coin/month"
                )
        );
        btn_buy.button.on("pointerdown", function () {
            CreateBuyVipPopup(scene, 100);
        });
        container_airdrop_unit.btn_claim = btn_buy;

        scrollablePanel.getElement("panel").add(container_airdrop_unit, {
            align: "top-left",
            expand: false,
        });
    }

    scrollablePanel.layout();

    maskShape = scene.add
        .rectangle(0 + 1080 / 2, 382 + 1538 / 2, 1080, 1538, 0x000000)
        .setVisible(false);
    container_airdrop.add(maskShape);

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
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "28px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    return btn_container;
}

export function Destroy() {
    if (container_main) {
        container_main.destroy();
        container_main = null;
    }

    if (maskShape) {
        maskShape.destroy();
        maskShape = null;
    }

    if (mask) {
        mask.destroy();
        mask = null;
    }
}

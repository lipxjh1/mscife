import { openTelegramLink } from "@telegram-apps/sdk";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";

import { container_main, container_popup } from "./HomeNeuralinkInventory.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import { CreateMultiItemRewardPopup } from "../../Share/PopupReward.js";

let container_account = null;

let container_account_0 = null;

let container_account_1 = null;

let text_totalNeuralink = null;

let text_neuralinkToUpgrade = null;

let neuralinkInfo = null;

let Sample = {
    inventory: null,
    totalQuantity: 0,
    availableQuantity: 0,
    itemsInProcess: 2,
    affordableQuantity: 6866,
    upgradeRequirements: {
        initialCost: 1000,
        finalCost: 9000,
        waitDays: 20,
        refiningDays: 10,
    },
};

let timeCountEvents = [];

function CreateNeuralinkInventorySuccess(scene) {
    neuralinkInfo = null;

    Destroy();

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

    centerData.RequestInventory(
        (result) => {
            onAssetLoaded();
        },
        (error) => {
            onAssetLoaded();
        }
    );

    centerData.RequestNeuralinkReadyToClaim(
        (result) => {
            neuralinkInfo = result.data;
            onAssetLoaded();
        },
        (error) => {
            onAssetLoaded();
        }
    );
}

export function ActiveNeuralinkInventorySuccess(scene, isActive) {
    if (container_account) {
        Destroy();
    } else if (container_account == null && isActive) {
        CreateNeuralinkInventorySuccess(scene);
    }
}

function Create(scene) {
    console.log("CreateNeuralinkUpgrade");

    Destroy();

    container_account = scene.add.container(0, 0);
    container_popup.add(container_account);

    container_account_0 = scene.add.container(0, 0);
    container_account.add(container_account_0);

    container_account_1 = scene.add.container(0, 0);
    container_account.add(container_account_1);

    const lock_bg = scene.add
        .image(0, 0, "home_neuralink_bg")
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

    CreateItemList(scene);
}

let container_list = null;

function CreateItemList(scene) {
    console.log("CreateItemList neuralinkInfo: ", neuralinkInfo);

    if (container_list) {
        container_list.destroy();
    }

    //Create friend list
    container_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_account_1.add(container_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1480;

    const columns = 1;
    const rows = Math.ceil(2 / columns);

    const itemWidth = 1020;
    const itemHeight = 215;
    const itemSpacing = 215 / 2 + 24 / 2;

    const posX = 0 + scrollViewWidth / 2;
    const posY = 382 + scrollViewHeight / 2;

    // const background = scene.add
    //     .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0xffffff)
    //     .setAlpha(0.5);
    // container_list.add(background);

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
                left: 60,
                right: 0,
                top: 10,
                bottom: 215 / 2 + 24 / 2,
            },
        })
        .layout();

    container_list.add(scrollablePanel);

    for (let i = 0; i < neuralinkInfo.length; i++) {
        let indexData = neuralinkInfo[i];

        let container_item = CreateItem(scene, scrollablePanel, indexData);

        container_item.button_view.button.on("pointerdown", function () {
            RequestClaim(scene, indexData._id);
        });
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function RequestClaim(scene, _id) {
    CreateLoadingPopup();
    centerData.RequestNeuralinkClaim(
        _id,
        (result) => {
            HideLoadingPopup();

            let itemArr = [];
            for (let i = 0; i < result.rewards.length; i++) {
                itemArr.push({
                    itemCode: result.rewards[i].itemCode,
                    quantity: result.rewards[i].quantity,
                });
            }

            CreateMultiItemRewardPopup(scene, itemArr);

            CreateNeuralinkInventorySuccess(scene);
        },
        () => {
            HideLoadingPopup();
        }
    );
}

function CreateItem(scene, scrollablePanel, itemData) {
    //console.log("CreateItem itemData: ", itemData);

    let itemWidth = 1020;
    let itemHeight = 125;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    let itemLocalData = centerDataItem.getItemById("NEURALINK");

    item.bg = scene.add
        .image(0, 0, "home_neuralink_upgrade_element_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.icon = scene.add
        .image(28, 33, itemLocalData.imgKey)
        .setScale(150 / 350)
        .setOrigin(0, 0);
    container_inner.add(item.icon);

    item.text_name = scene.add
        .text(238, 5, "Neuralink", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_name);

    item.text_quantity = scene.add
        .text(
            238,
            55,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                "Quantity: "
            ) + item.itemData.quantity,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#FFA600",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_quantity);

    item.text_create_time = scene.add
        .text(
            238,
            105,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                "Refining at: "
            ) + formatDateTime(item.itemData.refiningStartDate),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#ffffff",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_create_time);

    item.text_next_time = scene.add
        .text(
            238,
            155,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                "Completed at: "
            ) + formatDateTime(item.itemData.completionDate),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#ffffff",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_next_time);

    item.button_view = CreateButton0(
        scene,
        container_inner,
        779 + 218 / 2,
        63 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.Neuralink.KEY,
            "Claim"
        )
    );

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

function CreateButton0(scene, container, x, y, buttonName) {
    let btnWidth = 218;
    let btnHeight = 98;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_neuralink_upgrade_btn")
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
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "30px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    btn_container.setSelected = function () {
        btn_container.button.disableInteractive();

        btn_inner_container.each(function (child) {
            if (child.setTint) {
                child.clearTint();
            }
        });
    };

    btn_container.setUnselected = function () {
        btn_container.button.setInteractive();

        btn_inner_container.each(function (child) {
            if (child.setTint) {
                child.setTint(0x9a9a9a);
            }
        });
    };

    return btn_container;
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

function ClearTimeEvents() {
    for (let i = 0; i < timeCountEvents.length; i++) {
        timeCountEvents[i].remove();
    }

    timeCountEvents = [];
}

export function Destroy() {
    ClearTimeEvents();

    if (container_account) {
        container_account.destroy();

        container_account = null;
    }
}

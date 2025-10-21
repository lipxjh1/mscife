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
import { CreateNeuralinkInventoryInprogressDetail } from "./HomeNeuralinkInventoryInprogressDetail.js";
import {
    checkUpgradeAvailability,
    CreateNeuralinkProcessUpgradePopup,
    GetTimeRemainToUpgrade,
} from "./HomeNeuralinkInventoryInprogressUpgrade.js";

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

function CreateNeuralinkInventoryProgress(scene) {
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

    centerData.RequestNeuralinkProgress(
        (result) => {
            neuralinkInfo = result.data;
            onAssetLoaded();
        },
        (error) => {
            onAssetLoaded();
        }
    );
}

export function ActiveNeuralinkInventoryInprogress(scene, isActive) {
    if (container_account) {
        Destroy();
    } else if (container_account == null && isActive) {
        CreateNeuralinkInventoryProgress(scene);
    }
}

function Create(scene) {
    //console.log("CreateNeuralinkUpgrade");

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
    //console.log("CreateItemList neuralinkInfo: ", neuralinkInfo);

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
            CreateNeuralinkInventoryInprogressDetail(scene, indexData);
        });

        container_item.button_upgrade.button.on("pointerdown", function () {
            checkUpgradeAvailability(
                scene,
                indexData.secondPaymentDeadline,
                () => {
                    CreateNeuralinkProcessUpgradePopup(
                        scene,
                        indexData._id,
                        indexData.quantity,
                        () => {
                            CreateNeuralinkInventoryProgress(scene);
                        }
                    );
                }
            );
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
                "Created at: "
            ) + formatDateTime(item.itemData.createdAt),
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
        .text(238, 155, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_next_time);

    let secondLeft = calculateRemainingSeconds(
        item.itemData.secondPaymentDeadline
    );

    //console.log("secondLeft: ", secondLeft);

    item.SetTextTimeRemain = function (seconds) {
        if (seconds <= GetTimeRemainToUpgrade()) {
            item.text_next_time.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Neuralink.KEY,
                    "Remaining Time: "
                ) + calculateTimeRemaining(item.itemData.secondPaymentDeadline)
            );

            item.text_next_time.setColor("#ff0000");
        } else {
            item.text_next_time.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Neuralink.KEY,
                    "Time to upgrade: "
                ) +
                    calculateTimeRemaining(
                        new Date(
                            Date.now() +
                                (seconds - GetTimeRemainToUpgrade()) * 1000
                        ).toISOString()
                    )
            );

            item.text_next_time.setColor("#00ff00");
        }
    };

    item.SetTextTimeRemain(secondLeft);

    item.checkActiveUpgradeButton = function () {
        if (secondLeft <= GetTimeRemainToUpgrade()) {
            item.button_view.disableInteractive();
            item.button_view.setVisible(false);

            item.button_upgrade.setInteractive();
            item.button_upgrade.setVisible(true);
        } else {
            item.button_view.setInteractive();
            item.button_view.setVisible(true);

            item.button_upgrade.disableInteractive();
            item.button_upgrade.setVisible(false);
        }
    };

    // Tạo Timer Event để đếm ngược
    let timeEvent = scene.time.addEvent({
        delay: 1000, // 1 giây
        callback: () => {
            if (secondLeft < 0) {
                secondLeft = 0;

                timeEvent.remove();
            } else {
                item.checkActiveUpgradeButton();

                item.SetTextTimeRemain(secondLeft);

                secondLeft -= 1;
            }
        },
        callbackScope: this,
        loop: true,
    });

    timeCountEvents.push(timeEvent);

    item.button_view = CreateButton0(
        scene,
        container_inner,
        779 + 218 / 2,
        63 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.Neuralink.KEY,
            "View"
        )
    );

    item.button_upgrade = CreateButton0(
        scene,
        container_inner,
        779 + 218 / 2,
        63 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.Neuralink.KEY,
            "Upgrade"
        )
    );
    item.button_upgrade.disableInteractive();
    item.button_upgrade.setVisible(false);

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

function calculateRemainingSeconds(targetDateTimeString) {
    // 1. Chuyển đổi chuỗi thời gian mục tiêu thành đối tượng Date (UTC)
    const targetDate = new Date(targetDateTimeString);

    // 2. Lấy thời gian hiện tại
    const now = new Date();

    // 3. Tính toán sự khác biệt về mili giây
    // Nếu targetDate < now, kết quả sẽ là số âm (thời gian đã trôi qua)
    const diffMilliseconds = targetDate.getTime() - now.getTime();

    // 4. Chuyển đổi mili giây sang giây và làm tròn xuống
    const diffSeconds = Math.floor(diffMilliseconds / 1000);

    return diffSeconds;
}

function formatSecondsToHMS(totalSeconds) {
    // Đảm bảo đầu vào là số nguyên không âm
    if (
        typeof totalSeconds !== "number" ||
        totalSeconds < 0 ||
        !Number.isInteger(totalSeconds)
    ) {
        console.error("Input must be a non-negative integer.");
        return null; // Hoặc ném lỗi tùy thuộc vào yêu cầu
    }

    const hours = Math.floor(totalSeconds / 3600); // 1 giờ = 3600 giây
    const minutes = Math.floor((totalSeconds % 3600) / 60); // Số giây còn lại sau khi tính giờ, chia cho 60 để ra phút
    const seconds = totalSeconds % 60; // Số giây còn lại sau khi tính phút

    // Hàm helper để thêm số 0 vào phía trước nếu số đó < 10
    function pad(num) {
        return num < 10 ? "0" + num : num;
    }

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function calculateTimeRemaining(targetDate) {
    // Lấy thời gian hiện tại
    const now = Date.now();

    // Chuyển đổi targetDate thành đối tượng Date
    const target = new Date(targetDate).getTime();

    // Tính khoảng thời gian còn lại (tính bằng mili giây)
    let timeDifference = target - now;

    let dayStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.Neuralink.KEY,
        `Days`
    );

    // Kiểm tra nếu thời gian đã hết
    if (timeDifference <= 0) {
        return `0 ${dayStr} 00:00:00`;
    }

    // Chuyển đổi mili giây sang ngày, giờ, phút, giây
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    timeDifference -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    timeDifference -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(timeDifference / (1000 * 60));
    timeDifference -= minutes * (1000 * 60);

    const seconds = Math.floor(timeDifference / 1000);

    // Định dạng chuỗi theo format "30 Days 00:00:00"
    const formattedTime = `${days} ${dayStr} ${String(hours).padStart(
        2,
        "0"
    )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return formattedTime;
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

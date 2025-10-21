import centerData from "../../Data/CenterData";
import centerDataItem from "../../Data/CenterDataItem.js";

import { AssetLoadingManager } from "../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../Share/AlertPopup.js";

let container_main = null;

let container_popup = null;

let container_popup_tween = null;

let container_list = null;

let container_popup_buttons = null;

let isOpen = false;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

let dataSample = {
    mails: [
        {
            _id: "67a7f25bf136229386754e69",
            title: "Top Power Ranking Rewards",
            content:
                "Congratulations on achieving Top 100 in Power Ranking! You have received 1000 Chips as a reward!",
            attachments: [
                {
                    quantity: 1000,
                    itemCode: "Chip",
                    _id: "67a7f25bf136229386754e6a",
                },
            ],
            sender: "System",
            isSystem: true,
            isReceived: true,
            receiver: "67a1cde795124152b6d4170a",
            isRead: true,
            createdAt: "2025-02-09T00:10:03.207Z",
            updatedAt: "2025-02-11T10:13:01.162Z",
            __v: 0,
        },
        {
            _id: "67a6a0d9f136229386754c86",
            title: "Top Power Ranking Rewards",
            content:
                "Congratulations on achieving Top 100 in Power Ranking! You have received 1000 Chips as a reward!",
            attachments: [
                {
                    quantity: 1000,
                    itemCode: "Chip",
                    _id: "67a6a0d9f136229386754c87",
                },
            ],
            sender: "System",
            isSystem: true,
            isReceived: true,
            receiver: "67a1cde795124152b6d4170a",
            isRead: true,
            createdAt: "2025-02-08T00:10:01.891Z",
            updatedAt: "2025-02-08T04:27:05.491Z",
            __v: 0,
        },
        {
            _id: "67a31fe799a0a99c2378feaa",
            title: "Top Power Ranking Rewards",
            content:
                "Congratulations on achieving Top 3 in Power Ranking! You have received 3000 Chips as a reward!",
            attachments: [
                {
                    quantity: 3000,
                    itemCode: "Chip",
                    _id: "67a31fe799a0a99c2378feab",
                },
            ],
            sender: "System",
            isSystem: true,
            isReceived: true,
            receiver: "67a1cde795124152b6d4170a",
            isRead: true,
            createdAt: "2025-02-05T08:23:03.048Z",
            updatedAt: "2025-02-06T05:14:22.093Z",
            __v: 0,
        },
        {
            _id: "67a31fe699a0a99c2378fea6",
            title: "Top Power Ranking Rewards",
            content:
                "Congratulations on achieving Top 2 in Power Ranking! You have received 5000 Chips as a reward!",
            attachments: [
                {
                    quantity: 5000,
                    itemCode: "Chip",
                    _id: "67a31fe699a0a99c2378fea7",
                },
            ],
            sender: "System",
            isSystem: true,
            isReceived: true,
            receiver: "67a1cde795124152b6d4170a",
            isRead: true,
            createdAt: "2025-02-05T08:23:02.903Z",
            updatedAt: "2025-02-06T06:23:01.594Z",
            __v: 0,
        },
        {
            _id: "67a31fe699a0a99c2378fea2",
            title: "Top Power Ranking Rewards",
            content:
                "Congratulations on achieving Top 1 in Power Ranking! You have received 10000 Chips as a reward!",
            attachments: [
                {
                    quantity: 10000,
                    itemCode: "Chip",
                    _id: "67a31fe699a0a99c2378fea3",
                },
            ],
            sender: "System",
            isSystem: true,
            isReceived: true,
            receiver: "67a1cde795124152b6d4170a",
            isRead: true,
            createdAt: "2025-02-05T08:23:02.763Z",
            updatedAt: "2025-02-08T04:29:24.897Z",
            __v: 0,
        },
    ],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalMails: 5,
        unreadMails: 0,
        mailsWithAttachments: 0,
    },
};

export function CreateNotification(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadNotification(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    // const lock_bg = scene.rexUI.add
    //     .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.75)
    //     .setInteractive({ useHandCursor: true });

    // container_main.add(lock_bg);

    let lock_bg = scene.add
        .image(540, 960, "home_notification_bg")
        .setInteractive({ useHandCursor: true });
    container_main.add(lock_bg);

    let title = scene.add
        .image(557, 58, "home_notification_title")
        .setOrigin(0, 0);
    container_main.add(title);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup_buttons = scene.add.container(0, 0);
    container_main.add(container_popup_buttons);

    //Create buttons

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 58 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CloseNotification(scene);
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

    container_popup_buttons.add(btn_close);

    //ActiveMode(scene, MODE_KEYS.Account.KEY);

    CreateNotificationStatus(scene);

    OpenNotification(scene);
}

function CreateNotificationStatus(scene) {
    currentPage = 1;

    totalPages = 1;

    centerData.RequestMails(
        currentPage,
        (result) => {
            container_popup.setPosition(0, 4000);

            if (container_popup_tween) {
                container_popup_tween.stop();
                scene.tweens.remove(container_popup_tween);
            }

            container_popup_tween = scene.tweens.add({
                targets: container_popup,
                x: 0,
                y: 0, // Vị trí kết thúc
                duration: 500, // Thời gian tween
                ease: "Power2", // Kiểu easing
                onComplete: () => {},
            });

            totalPages = result.pagination.totalPages;

            CreateList(scene, result);
        },
        (error) => {
            CreateAlertPopup(
                scene,
                "Get notification status failed:\n" + error.message
            );
        }
    );
}

let isUpdating = false;
function UpdateNotificationStatus(scene) {
    if (isUpdating) return;

    if (currentPage < totalPages) {
        isUpdating = true;

        CreateLoadingPopup();

        currentPage++;
        centerData.RequestMails(
            currentPage,
            (result) => {
                isUpdating = false;

                HideLoadingPopup();

                CreateUpdateList(scene, result);
            },
            (error) => {
                isUpdating = false;

                HideLoadingPopup();

                CreateAlertPopup(
                    scene,
                    "Get notification status failed:\n" + error.message
                );
            }
        );
    }
}

function CreateList(scene, result) {
    //Create friend list
    container_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_popup.add(container_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1713;

    const itemWidth = 1020;
    const itemHeight = 353;
    const itemSpacing = 20;

    const posX = 30 + scrollViewWidth / 2;
    const posY = 207 + scrollViewHeight / 2;

    // Tạo một gridTable
    gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            table: {
                cellWidth: itemWidth + itemSpacing,
                cellHeight: itemHeight + itemSpacing,
                columns: 1,
                reuseCellContainer: true, // Tái sử dụng cell container
            },
            slider: {
                track: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    0x000000,
                    0.3
                ),
                thumb: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    30,
                    10,
                    0xcccccc
                ),
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.2,
            },
            items: result.mails,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo card một lần
                    cellContainer = createNotificationItem(scene);
                }

                // Cập nhật nội dung của card với dữ liệu mới
                cellContainer.updateContent(item);

                return cellContainer;
            },
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: itemHeight * 0.1,
            },
        })
        .layout();

    container_list.add(gridTable);

    gridTable.on("scroll", function () {
        if (gridTable.t > 0.9 && !isUpdating) {
            UpdateNotificationStatus(scene);
        }
    });

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function CreateUpdateList(scene, result) {
    // Thêm dữ liệu mới vào gridTable
    if (!result || !result.mails || result.mails.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let newItems = [...currentItems, ...result.mails];

    gridTable.setItems(newItems);
    gridTable.refresh();
}

function createNotificationItem(scene) {
    let itemWidth = 1020;
    let itemHeight = 353;

    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    const bg = scene.rexUI.add
        .roundRectangle(0, 0, itemWidth, itemHeight, 0, 0x4e4e4e, 0.4)
        .setOrigin(0, 0);
    container_inner.add(bg);

    const text_title = scene.add
        .text(30, 30, "", {
            fontFamily: "Russo One",
            fontSize: "38px",
            color: "#ffffff",
            align: "left",
            // stroke: "#000000",
            // strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_title);

    const text_time = scene.add
        .text(990, 10, "", {
            fontFamily: "Russo One",
            fontSize: "28px",
            color: "#ffffff",
            align: "right",
            // stroke: "#000000",
            // strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_time);

    const text_info = scene.add
        .text(30, 75, "", {
            fontFamily: "Russo One",
            fontSize: "28px",
            color: "#ffffff",
            align: "left",
            // stroke: "#000000",
            // strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_info);

    const btn_claim = scene.add
        .image(710 + 280 / 2, 169 + 64 / 2, "home_notification_item_btn_claim")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_claim,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_claim,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    container_inner.add(btn_claim);

    const btn_claimed = scene.add
        .image(710 + 280 / 2, 169 + 64 / 2, "home_notification_item_checked")
        .setOrigin(0.5, 1);
    container_inner.add(btn_claimed);

    const btn_read = scene.add
        .image(710 + 280 / 2, 259 + 64 / 2, "home_notification_item_btn_read")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_read,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_read,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    container_inner.add(btn_read);

    // Container cho reward list
    const reward_container = scene.add.container(24, 220);
    container_inner.add(reward_container);

    // Hàm cập nhật nội dung
    container.updateContent = function (itemData) {
        container.itemData = itemData;

        // Cập nhật tiêu đề
        text_title.setText(itemData.title);

        text_time.setText(formatDateTime(itemData.createdAt));

        text_info.setPosition(text_info.x, text_title.x + text_title.height);
        // Cập nhật nội dung
        text_info.setText(itemData.content);

        // Cập nhật trạng thái đã nhận
        if (itemData.attachments.length > 0) {
            if (itemData.isReceived) {
                btn_claim.setVisible(false);
                btn_claimed.setVisible(true);
            } else {
                btn_claim.setVisible(true);
                btn_claimed.setVisible(false);

                // Thêm event listener cho nút claim
                btn_claim.off("pointerdown");
                btn_claim.on("pointerdown", function () {
                    ClaimClick(scene, container);
                });
            }
        } else {
            btn_claim.setVisible(false);
            btn_claimed.setVisible(false);
        }

        // Cập nhật trạng thái đã đọc
        if (itemData.isRead) {
            btn_read.setVisible(false);
        } else {
            btn_read.setVisible(true);

            // Thêm event listener cho nút read
            btn_read.off("pointerdown");
            btn_read.on("pointerdown", function () {
                ReadClick(scene, container);
            });
        }

        // Xóa reward cũ nếu có
        reward_container.removeAll(true);

        // Tạo reward list
        createRewardList(scene, reward_container, itemData);
    };

    container.setClaim = function (boolVal) {
        if (container.itemData.attachments.length > 0) {
            if (boolVal) {
                btn_claim.setVisible(false);
                btn_claimed.setVisible(true);
            } else {
                btn_claim.setVisible(true);
                btn_claimed.setVisible(false);
            }
        } else {
            btn_claim.setVisible(false);
            btn_claimed.setVisible(false);
        }
    };

    container.setRead = function (boolVal) {
        if (boolVal) {
            btn_read.setVisible(false);
        } else {
            btn_read.setVisible(true);
        }
    };

    // const debugRect = scene.add.rectangle(0, 0, itemWidth, itemHeight, 0x00ff00, 0).setOrigin(0, 0);
    // debugRect.setStrokeStyle(2, 0x00ff00, 1);
    // container.add(debugRect);

    return container;
}

function ReadClick(scene, item) {
    centerData.RequestReadMail(
        item.itemData._id,
        (result) => {
            //CreateAlertPopup(scene, result.message);

            item.setRead(true);
        },
        (error) => {
            CreateAlertPopup(scene, error.message);
        }
    );
}

function ClaimClick(scene, item) {
    centerData.RequestClaimMail(
        item.itemData._id,
        (result) => {
            CreateAlertPopup(scene, result.message);

            item.setClaim(true);
        },
        (error) => {
            CreateAlertPopup(scene, error.message);
        }
    );
}

function createRewardList(scene, container, itemData) {
    if (!itemData.attachments || itemData.attachments.length === 0) {
        return;
    }

    // Tạo grid cho phần thưởng
    const columns = itemData.attachments.length;
    const itemWidth = 130;
    const itemSpacing = 10;
    let xPos = 0;

    for (let i = 0; i < itemData.attachments.length; i++) {
        let attachItem = itemData.attachments[i];

        // Tạo reward item
        const reward_item = createRewardItem(scene, attachItem);

        // Đặt vị trí cho item
        reward_item.x = xPos;
        container.add(reward_item);

        // Tính vị trí cho item tiếp theo
        xPos += itemWidth + itemSpacing;
    }
}

function createRewardItem(scene, attachItem) {
    const itemWidth = 130;
    const itemHeight = 130;

    const item = scene.add.container(0, 0);

    const bg = scene.add
        .image(0, 0, "home_notification_item_reward_bg")
        .setOrigin(0, 0);
    item.add(bg);

    let imgKey = centerDataItem.getItemById(attachItem.itemCode).imgKey;

    const icon = scene.add
        .image(itemWidth / 2, itemHeight / 2, imgKey)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(100, 100);
    item.add(icon);

    const text_value = scene.add
        .text(125, 125, attachItem.quantity, {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 5,
            wordWrap: { width: itemWidth, useAdvancedWrap: true },
        })
        .setOrigin(1, 1);
    item.add(text_value);

    return item;
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

export function IsOpen() {
    return isOpen;
}

function OpenNotification(scene) {
    isOpen = true;
}

function CloseNotification(scene) {
    isOpen = false;

    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;
    gridTable = null;
}

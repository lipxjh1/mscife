import { Scene } from "phaser";

import centerData from "../../Data/CenterData";

import centerDataAvatar from "../../Data/CenterDataAvatar.js";

import {
    OpenCurrencyBar,
    HideCurrencyBar,
    MovePlayerBarToDefault,
    MovePlayerBarToAccount,
    MovePlayerBarToHide,
    MovePlayerBarToRank,
    UpdateAvatar,
} from "./HomeTopBarPlayer.js";
import { CreateLoadingPopup, HideLoadingPopup } from "../Share/AlertPopup.js";

let container_main = null;
let container_0 = null;
let container_1 = null;

let container_buttons = null;

let container_item_list = null;

let avatar = null;

let isOpen = false;

export function CreateAvatarSelector(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.add.image(0, 0, "home_avatar_bg").setOrigin(0, 0);
    container_main.add(lock_bg);

    container_0 = scene.add.container(0, 0);
    container_main.add(container_0);

    container_1 = scene.add.container(0, 0);
    container_main.add(container_1);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    avatar = scene.add
        .image(540, 558 + 238 / 2, "home_top_bar_player_avatar")
        .setOrigin(0.5, 0.5);
    container_1.add(avatar);

    let avatarKey = centerData.userInfo.Avatar;

    avatar.setAvatar = function (imgKey) {
        avatar.setTexture(imgKey).setScale(1.5);
    };

    if (avatarKey && avatarKey !== "" && centerDataAvatar.isExist(avatarKey)) {
        avatar.setAvatar(avatarKey);
    } else {
        let randomAvatarKey = centerDataAvatar.getRandomFreeAvatar();
        avatar.setAvatar(randomAvatarKey);
    }

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CloseAvatarSelector(scene);
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

    container_buttons.add(btn_close);

    OpenAvatarSelector(scene);

    CreateAvatarList(scene);

    CheckSelectedCards(scene);
}

export function CreateAvatarList(scene) {
    let itemData = [];

    for (let i = 0; i < centerDataAvatar.existAvatarArr.length; i++) {
        const newItem = {
            avatarKey: centerDataAvatar.existAvatarArr[i],
        };
        itemData.push(newItem);
    }

    container_item_list = scene.add.container(0, 0);
    container_0.add(container_item_list);

    const scrollViewWidth = 1080;

    const scrollViewHeight = 982;

    const spaceWidth = 10 / 2;

    const spaceHeight = 10 / 2;

    const cellWidth = 256;

    const cellHeight = 256;

    const posX = 5 + scrollViewWidth / 2 + cellWidth / 2 + spaceWidth * 2;

    const posY = 958 + scrollViewHeight / 2;

    // const grid_bg = scene.rexUI.add.roundRectangle(
    //     posX,
    //     posY,
    //     scrollViewWidth,
    //     scrollViewHeight,
    //     0,
    //     0x000000,
    //     0.5
    // );
    // container_popup_select_popup.add(grid_bg);

    const gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,

            table: {
                cellWidth: cellWidth + spaceWidth,
                cellHeight: cellHeight + spaceHeight,
                columns: 4,
                //reuseCellContainer: true, // Kích hoạt tái sử dụng cell container
            },

            mouseWheelScroller: {
                focus: false,
                speed: 1,
            },

            items: itemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: width,
                        height: cellHeight,
                        orientation: 0,
                    });
                } else {
                    //console.log(cell.index + ": reuse cell-container");
                }

                cellContainer.add(CreateAvatarItem(scene, index, item));

                return cellContainer;
            },

            space: {
                // left: 50,
                // right: 0,
                // top: 38,
                // bottom: 0,
                // row: 0,
            },
        })
        .layout();

    gridTable.isDragging = false;

    scene.input.on("pointerup", (pointer) => {
        gridTable.isDragging = false;
    });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    // const gridOrigin = scene.rexUI.add.roundRectangle(
    //     gridTable.x,
    //     gridTable.y,
    //     50,
    //     50,
    //     0,
    //     0xffffff,
    //     1
    // );
    // container_item_list.add(gridOrigin);

    const maskShape = scene.add
        .rectangle(540, 958 + 982 / 2, scrollViewWidth, 982, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function CreateAvatarItem(scene, i, item) {
    let container_card = scene.add.container(0, 0);

    container_card.item = item;

    let container_card_inner = scene.add.container(-256 / 2, -256 / 2);
    container_card.add(container_card_inner);

    let item_avatar = scene.add
        .image(256 / 2, 256 / 2, item.avatarKey)
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function (pointer) {
            //console.log("btn_item clicked");

            container_item_list.gridTable.startY = pointer.y;

            container_item_list.gridTable.isDragging = true;

            container_card.startTime = scene.time.now; // Lấy thời gian hiện tại khi nhấn chuột
        })
        .on("pointermove", function (pointer) {
            //console.log("btn_item pointermove");

            if (!container_item_list.gridTable.isDragging) return;

            const deltaY = pointer.y - container_item_list.gridTable.startY; // Tính độ chênh lệch so với vị trí trước đó
            container_item_list.gridTable.startY = pointer.y; // Cập nhật startY cho lần di chuyển tiếp theo

            let itemHeight = 256;

            let itemCount = container_item_list.gridTable.items.length;

            let columns = 3;

            let rows = Math.ceil(itemCount / columns);

            let maxHeight = itemHeight * rows;

            let tPerPixel = 1 * (itemHeight / maxHeight);

            let smoothVal = 0.005;

            // Tính toán giá trị T hiện tại của bảng và điều chỉnh theo deltaY
            let currentT =
                container_item_list.gridTable.t -
                deltaY * (tPerPixel * smoothVal); // Điều chỉnh tốc độ cuộn
            currentT = Phaser.Math.Clamp(currentT, 0, 1); // Đảm bảo T nằm trong phạm vi 0-1

            container_item_list.gridTable.setT(currentT); // Cập nhật vị trí cuộn của bảng
        })
        .on("pointerup", function (pointer) {
            //console.log("btn_item pointerup");

            if (container_item_list.gridTable.isDragging == false) {
                //do something if it is seleted not dragging
            }

            container_item_list.gridTable.isDragging = false; // Dừng kéo

            const endTime = scene.time.now; // Lấy thời gian hiện tại khi thả chuột
            const duration = endTime - container_card.startTime; // Tính thời gian giữa hai sự kiện

            if (duration <= 125) {
                SelectAvatar(scene, container_card);
            }
        })
        .on("pointerover", function (pointer) {
            if (container_item_list.gridTable.isDragging == true) {
                container_item_list.gridTable.startY = pointer.y;
            }

            container_card.each(function (child) {
                if (child.setTint) {
                    child.setTint(0x646464); // Màu tint bạn muốn áp dụng
                }
            });
        })
        .on("pointerout", function (pointer) {
            container_card.each(function (child) {
                if (child.clearTint) {
                    child.clearTint(); // Xóa tint
                }
            });
        });
    container_card_inner.add(item_avatar);

    let using = scene.add
        .image(0, 0, "home_avatar_using")
        .setDisplaySize(64, 64)
        .setOrigin(0.5, 0.5)
        .setPosition(256 * 0.75, 256 * 0.8);
    container_card_inner.add(using);

    container_card.setUsing = function (boolVal) {
        using.setVisible(boolVal);
    };

    if (centerData.userInfo.Avatar == item.avatarKey) {
        container_card.setUsing(true);
    } else {
        container_card.setUsing(false);
    }

    return container_card;
}

function CheckSelectedCards() {
    let activeCells = [];

    for (let i = 0; i < container_item_list.gridTable.items.length; i++) {
        const cellContainer = container_item_list.gridTable.getCellContainer(i);
        if (cellContainer) {
            activeCells.push(cellContainer);

            //console.log(`CellContainer at index ${i}:`, cellContainer);

            let card = cellContainer.children[0];

            if (centerData.userInfo.Avatar == card.item.avatarKey) {
                card.setUsing(true);
            } else {
                card.setUsing(false);
            }
        } else {
            //console.warn(`No CellContainer found at index ${i}`);
        }
    }

    //console.log("activeCells:", activeCells);
}

function SelectAvatar(scene, container_card) {
    CreateLoadingPopup();

    if (container_card.item.avatarKey !== centerData.userInfo.Avatar) {
        centerData.RequestUpdateAvatar(
            container_card.item.avatarKey,
            () => {
                HideLoadingPopup();

                CreateLoadingPopup();

                centerData.RequestUserInfo(
                    () => {
                        HideLoadingPopup();

                        avatar.setAvatar(container_card.item.avatarKey);

                        CheckSelectedCards();

                        UpdateAvatar(scene, container_card.item.avatarKey);
                    },
                    () => {
                        HideLoadingPopup();
                    }
                );
            },
            () => {
                HideLoadingPopup();
            }
        );
    }
}

export function IsOpen() {
    return isOpen;
}

function OpenAvatarSelector(scene) {
    isOpen = true;

    HideCurrencyBar(scene);

    MovePlayerBarToHide(scene);
}

function CloseAvatarSelector(scene) {
    isOpen = false;

    MovePlayerBarToDefault(scene);

    OpenCurrencyBar(scene);

    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;
}

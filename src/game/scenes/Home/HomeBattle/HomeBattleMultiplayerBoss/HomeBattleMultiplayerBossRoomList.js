import centerData from "../../../../Data/CenterData.js";

import { AssetLoadingManager } from "../../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../../Share/AlertPopup.js";
import { HideHomeBattle, ShowHomeBattle } from "../HomeBattle.js";
import cdLocalization from "../../../../Data/CenterDataLocalization.js";

import { HideTopBarNotice, OpenTopBarNotice } from "../../HomeTopBarPlayer.js";

import { JoinRoom } from "./HomeBattleMultiplayerBossRoom.js";

let container_main = null;

let container_popup = null;

let container_list = null;

let container_popup_buttons = null;

let isOpen = false;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

// Phân trang và cuộn vô hạn
let isUpdating = false;
const PAGE_LIMIT = 10;

export function CreateMultiplayerBossRoomList(scene) {
    centerData.multiplayerBossId = "";

    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadHomeBattle(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    HideHomeBattle(scene);

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.add
        .image(0, 0, "home_battle_multiplayer_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup_buttons = scene.add.container(0, 0);
    container_main.add(container_popup_buttons);

    //Create buttons

    //create close btn
    const btn_close = scene.add
        .image(38 + 32 / 2, 266 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CloseMultiplayer(scene);

            ShowHomeBattle(scene);
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

    RequestRoomList(scene);
}

function RequestRoomList(scene) {
    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetMultiplayerBossRoomList(
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            // Lưu tổng số trang từ pagination
            if (
                result &&
                result.pagination &&
                typeof result.pagination.totalPages === "number"
            ) {
                totalPages = result.pagination.totalPages;
            } else {
                totalPages = 1;
            }

            // Tạo danh sách lần đầu
            CreateList(scene, result.data);

            OpenMultiplayer(scene);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

function CreateList(scene, receivedData) {
    //console.log("CreateList receivedData: ", receivedData);

    if (container_list) {
        container_list.destroy();
        container_list = null;
    }

    //Create room list
    container_list = scene.add.container(0, 0);
    container_popup.add(container_list);

    if (
        !receivedData ||
        !Array.isArray(receivedData) ||
        receivedData.length === 0
    ) {
        const emptyText = scene.add
            .text(540, 1100, "No Rooms Available", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 10,
            })
            .setOrigin(0.5, 0.5);
        container_list.add(emptyText);
        return;
    }

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1554;

    const itemWidth = 1034;
    const itemHeight = 368;
    const itemSpacing = 42;

    const posX = 38 + scrollViewWidth / 2;
    const posY = 366 + scrollViewHeight / 2;

    // Tạo gridTable với tái sử dụng cell
    gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            table: {
                cellWidth: itemWidth,
                cellHeight: itemHeight,
                columns: 1,
                reuseCellContainer: true,
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
            items: receivedData,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = createRoomItem(
                        scene,
                        itemWidth,
                        itemHeight
                    );
                }
                // Cập nhật nội dung với dữ liệu mới
                cellContainer.updateContent(item);

                return cellContainer;
            },
            space: {
                left: 0,
                right: 0,
                top: 10,
                bottom: itemHeight / 2 + 24 / 2,
            },
        })
        .layout();

    container_list.add(gridTable);

    // Theo dõi tương tác kéo thả để xử lý cuộn và nạp thêm
    gridTable
        .setInteractive()
        .on("pointerdown", function (pointer) {
            gridTable.startY = pointer.y;
            gridTable.isDragging = true;
            gridTable.startTime = scene.time.now;
        })
        .on("pointermove", function (pointer) {
            if (!gridTable.isDragging) return;

            const deltaY = pointer.y - gridTable.startY;
            gridTable.startY = pointer.y;

            let currentT = gridTable.t - deltaY * 0.001;
            currentT = Phaser.Math.Clamp(currentT, 0, 1);
            gridTable.setT(currentT);

            if (gridTable.t > 0.9 && !isUpdating) {
                UpdateRoomList(scene);
            }
        })
        .on("pointerup", function () {
            gridTable.isDragging = false;
        })
        .on("pointerover", function (pointer) {
            if (gridTable.isDragging) {
                gridTable.startY = pointer.y;
            }
        });

    // Thêm sự kiện cuộn chuột
    gridTable.on("scroll", function () {
        if (gridTable.t > 0.9 && !isUpdating) {
            UpdateRoomList(scene);
        }
    });

    // Thiết lập mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function UpdateRoomList(scene) {
    if (isUpdating) return;
    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    CreateLoadingPopup();

    centerData.RequestGetMultiplayerBossRoomList(
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newRooms = result && result.data ? result.data : [];
            CreateUpdateRoomItemList(scene, newRooms);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

function CreateUpdateRoomItemList(scene, roomsArray) {
    if (!roomsArray || roomsArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...roomsArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
}

function createRoomItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    const bg = scene.add
        .image(0, 0, "home_battle_item_bg_campain")
        .setOrigin(0, 0);
    container_inner.add(bg);

    const text_stage = scene.add
        .text(120, 110, "", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#CCCCCC",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_stage);

    const text_code = scene.add
        .text(120, 160, "", {
            fontFamily: "Russo One",
            fontSize: "35px",
            color: "#FFD700",
            align: "left",
            stroke: "#000000",
            strokeThickness: 8,
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_code);

    const text_host = scene.add
        .text(120, 210, "", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#CCCCCC",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_host);

    const text_players = scene.add
        .text(910, 35, "", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#CCCCCC",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_players);

    const text_name = scene.add
        .text(38, 35, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "52px",
            color: "#CCCCCC",
            align: "left",
            stroke: "#000000",
            strokeThickness: 5,
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_name);

    const text_status = scene.add
        .text(910, 160, "", {
            fontFamily: "Russo One",
            fontSize: "35px",
            color: "#00FF00",
            align: "right",
            stroke: "#000000",
            strokeThickness: 8,
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_status);

    const btn_join = CreateFightButton(
        scene,
        container_inner,
        746 + 248 / 2,
        250 + 78 / 2,
        "home_battle_btn",
        "Join"
    );

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.roomData = data;
        if (!data) return;

        // Cập nhật background texture dựa trên boss
        bg.setTexture(GetMapTexture(data.boss ? data.boss.id : 1));

        // Cập nhật thông tin cơ bản
        text_stage.setText("Boss: " + (data.boss ? data.boss.name : "Unknown"));

        // Tính số lượng players từ cấu trúc mới
        let playerCount = 0;
        let maxPlayers = 2; // Mặc định multiplayer boss có tối đa 2 players
        if (data.players) {
            if (data.players.host && data.players.host.id) playerCount++;
            if (data.players.guest && data.players.guest.id) playerCount++;
        }

        text_players.setText("Players: " + playerCount + "/" + maxPlayers);
        text_host.setText(
            "Host: " +
                (data.players && data.players.host
                    ? data.players.host.username
                    : "Unknown")
        );
        text_code.setText("Room: " + data.code);

        // Xác định status và màu sắc
        let statusText = data.status ? data.status.toUpperCase() : "UNKNOWN";
        text_status.setText(statusText);

        if (data.status === "waiting") {
            text_status.setColor("#00FF00"); // Màu xanh lá cho waiting
        } else if (data.status === "playing") {
            text_status.setColor("#FF6600"); // Màu cam cho playing
        } else {
            text_status.setColor("#CCCCCC"); // Màu xám cho các trạng thái khác
        }

        // Cập nhật sự kiện cho nút join
        btn_join.button.removeAllListeners("pointerdown");
        btn_join.button.on("pointerdown", function () {
            // Kiểm tra điều kiện join dựa trên status và số lượng players
            let canJoin = data.status === "waiting" && playerCount < maxPlayers;
            if (canJoin) {
                JoinRoom(scene, data.code);
            } else {
                let message = "Room is not joinable!";
                if (data.status !== "waiting") {
                    message = "Room is " + data.status + "!";
                } else if (playerCount >= maxPlayers) {
                    message = "Room is full!";
                }
                CreateAlertPopup(message);
            }
        });

        // Disable nút join nếu room không thể join
        let canJoin = data.status === "waiting" && playerCount < maxPlayers;
        if (!canJoin) {
            btn_join.button.setTint(0x666666);
            btn_join.button.disableInteractive();
        } else {
            btn_join.button.clearTint();
            btn_join.button.setInteractive({ useHandCursor: true });
        }
    };

    return container;
}

function GetMapName(stage) {
    if (stage == 1) return "Earth";
    if (stage == 2) return "Space";
    if (stage == 3) return "Mars";
    if (stage == 4) return "Return Earth";
    if (stage == 5) return "X-Corp";
    return "None";
}

function GetMapTexture(bossId) {
    // Map boss ID to appropriate background texture
    if (bossId === "BOSS_001") return "home_battle_item_bg_campain_earth";
    if (bossId === "BOSS_002") return "home_battle_item_bg_campain_space";
    if (bossId === "BOSS_003") return "home_battle_item_bg_campain_mars";
    if (bossId === "BOSS_004")
        return "home_battle_item_bg_campain_back_to_earth";
    if (bossId === "BOSS_005") return "home_battle_item_bg_campain_xcorp";

    // Fallback cho các boss ID khác hoặc không xác định
    return "home_battle_item_bg_campain";
}

function CreateFightButton(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 248;
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
            17,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeCampian.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "36px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0);

    btn_inner_container.add(text);

    return btn_container;
}

export function IsOpen() {
    return isOpen;
}

function OpenMultiplayer(scene) {
    isOpen = true;

    HideTopBarNotice(scene);
}

function CloseMultiplayer(scene) {
    isOpen = false;

    OpenTopBarNotice(scene);

    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;
}


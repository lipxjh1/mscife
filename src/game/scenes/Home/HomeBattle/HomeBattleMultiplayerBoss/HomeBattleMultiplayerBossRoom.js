import centerData from "../../../../Data/CenterData.js";
import cdLocalization from "../../../../Data/CenterDataLocalization.js";
import { socketServiceMultiplayerBoss } from "../../../../socketMultiplayerBoss.js";
import { AssetLoadingManager } from "../../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../../AssetPlayerLoadingManager.js";

import multiplayerBossRoom from "../../../GameplayMultiplayerBoss/GameplayMultiplayerBossRoom.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../../Share/AlertPopup.js";

let roomInfo = null;

let currentScene = null;

let text_players = null;

let text_bossId = null;

let text_time_remain = null;

let otherPlayerCard = null;

let btn_ready = null;

let timeCountEvent = null;

export function MultiplayerBossRoom(scene, bossId) {
    //console.log("MultiplayerBossRoom bossId: ", bossId);

    currentScene = scene;

    centerData.multiplayerBossId = bossId;

    CreateLoadingPopup();

    multiplayerBossRoom.CreateRoom(
        centerData.multiplayerBossId,
        (respone) => {
            HideLoadingPopup();

            //console.log("MultiplayerBossRoom success");

            roomInfo = multiplayerBossRoom.GetRoomInfo();

            RegisterRoomEvents();

            multiplayerBossRoom.PlayerReady(
                roomInfo.roomId,
                (response) => {},
                (response) => {}
            );

            RoomSetup(roomInfo);
        },
        (response) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, response.error.message);
        }
    );
}

export function JoinRoom(scene, roomId) {
    //console.log("JoinRoom roomId: ", roomId);

    currentScene = scene;

    CreateLoadingPopup();

    multiplayerBossRoom.JoinRoom(
        roomId,
        (respone) => {
            HideLoadingPopup();

            //console.log("JoinRoom success");

            roomInfo = multiplayerBossRoom.GetRoomInfo();

            RegisterRoomEvents();

            RoomSetup(roomInfo);
        },
        (response) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, response.error.message);
        }
    );
}

// Store event handler references for proper cleanup
let roomClosedHandler = null;
let roomPlayerJoinedHandler = null;
let roomPlayerLeftHandler = null;
let roomGameStartedHandler = null;
let roomPlayerReadyHandler = null;
let roomPlayerKickedHandler = null;
let roomPlayerUnreadyHandler = null;

function RegisterRoomEvents() {
    RegisterRoomCloseEvents();
    RegisterRoomPlayerJoinedEvents();
    RegisterRoomPlayerLeftEvents();
    RegisterRoomGameStartedEvents();
    RegisterRoomPlayerReadyEvents();
    RegisterRoomPlayerKickedEvents();
    RegisterRoomPlayerUnreadyEvents();
}

function RemoveRoomEvents() {
    RemoveRoomCloseEvents();
    RemoveRoomPlayerJoinedEvents();
    RemoveRoomPlayerLeftEvents();
    RemoveRoomGameStartedEvents();
    RemoveRoomPlayerReadyEvents();
    RemoveRoomPlayerKickedEvents();
    RemoveRoomPlayerUnreadyEvents();
}

function RegisterRoomCloseEvents() {
    // Create and store the handler reference
    roomClosedHandler = (response) => {
        RoomClosed(response);
    };

    socketServiceMultiplayerBoss.on("mpboss:room:closed", roomClosedHandler);
}

function RemoveRoomCloseEvents() {
    // Use the stored reference for proper removal
    if (roomClosedHandler) {
        socketServiceMultiplayerBoss.off(
            "mpboss:room:closed",
            roomClosedHandler
        );
        roomClosedHandler = null;
    }
}

function RegisterRoomPlayerJoinedEvents() {
    // Create and store the handler reference
    roomPlayerJoinedHandler = (response) => {
        //console.log("RegisterRoomPlayerJoinedEvents response", response);

        if (response.player) {
            let tempGuestInfo = {
                id: response.player.id,
                isReady: response.player.isReady,
                username: response.player.username,
                avatar: response.player.avatar,
            };

            multiplayerBossRoom.SetRoomGuest(tempGuestInfo);

            UpdatePlayersCount();
            CreateOtherPlayer();
        }
    };

    socketServiceMultiplayerBoss.on(
        "mpboss:player:joined",
        roomPlayerJoinedHandler
    );
}

function RemoveRoomPlayerJoinedEvents() {
    // Use the stored reference for proper removal
    if (roomPlayerJoinedHandler) {
        socketServiceMultiplayerBoss.off(
            "mpboss:player:joined",
            roomPlayerJoinedHandler
        );
        roomPlayerJoinedHandler = null;
    }
}

function RegisterRoomPlayerLeftEvents() {
    // Create and store the handler reference
    roomPlayerLeftHandler = (response) => {
        multiplayerBossRoom.SetRoomGuest(null);

        UpdatePlayersCount();
        CreateOtherPlayer();
    };

    socketServiceMultiplayerBoss.on(
        "mpboss:player:left",
        roomPlayerLeftHandler
    );
}

function RemoveRoomPlayerLeftEvents() {
    // Use the stored reference for proper removal
    if (roomPlayerLeftHandler) {
        socketServiceMultiplayerBoss.off(
            "mpboss:player:left",
            roomPlayerLeftHandler
        );
        roomPlayerLeftHandler = null;
    }
}

function RegisterRoomGameStartedEvents() {
    // Create and store the handler reference
    roomGameStartedHandler = (response) => {
        LoadMultiplayerBossGameplay(currentScene);
    };

    socketServiceMultiplayerBoss.on(
        "mpboss:room:started",
        roomGameStartedHandler
    );
}

function RemoveRoomGameStartedEvents() {
    // Use the stored reference for proper removal
    if (roomGameStartedHandler) {
        socketServiceMultiplayerBoss.off(
            "mpboss:room:started",
            roomGameStartedHandler
        );
        roomGameStartedHandler = null;
    }
}

function RegisterRoomPlayerKickedEvents() {
    // Create and store the handler reference
    roomPlayerKickedHandler = (response) => {
        if (multiplayerBossRoom.IsHost() == false) {
            CreateAlertPopup(currentScene, response.reason);

            CloseRoom();
        }
    };

    socketServiceMultiplayerBoss.on(
        "mpboss:player:kicked",
        roomPlayerKickedHandler
    );
}

function RemoveRoomPlayerKickedEvents() {
    // Use the stored reference for proper removal
    if (roomPlayerKickedHandler) {
        socketServiceMultiplayerBoss.off(
            "mpboss:player:kicked",
            roomPlayerKickedHandler
        );
        roomPlayerKickedHandler = null;
    }
}

function RegisterRoomPlayerReadyEvents() {
    // Create and store the handler reference
    roomPlayerReadyHandler = (response) => {
        multiplayerBossRoom.SetRoomPlayerReady(
            response.userId,
            response.isReady
        );

        UpdateButtonReadyText();

        if (otherPlayerCard != null) {
            otherPlayerCard.UpdateReadyStatus();
        }
    };

    socketServiceMultiplayerBoss.on(
        "mpboss:player:ready",
        roomPlayerReadyHandler
    );
}

function RemoveRoomPlayerReadyEvents() {
    // Use the stored reference for proper removal
    if (roomPlayerReadyHandler) {
        socketServiceMultiplayerBoss.off(
            "mpboss:player:ready",
            roomPlayerReadyHandler
        );
        roomPlayerReadyHandler = null;
    }
}

function RegisterRoomPlayerUnreadyEvents() {
    // Create and store the handler reference
    roomPlayerUnreadyHandler = (response) => {
        multiplayerBossRoom.SetRoomPlayerReady(
            response.userId,
            response.isReady
        );

        UpdateButtonReadyText();

        if (otherPlayerCard != null) {
            otherPlayerCard.UpdateReadyStatus();
        }
    };

    socketServiceMultiplayerBoss.on(
        "mpboss:player:unready",
        roomPlayerUnreadyHandler
    );
}

function RemoveRoomPlayerUnreadyEvents() {
    // Use the stored reference for proper removal
    if (roomPlayerUnreadyHandler) {
        socketServiceMultiplayerBoss.off(
            "mpboss:player:unready",
            roomPlayerUnreadyHandler
        );
        roomPlayerUnreadyHandler = null;
    }
}

function RoomSetup(roomInfo) {
    // Dừng timer cũ nếu có trước khi tạo room mới
    StopTimeCountEvent();

    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(currentScene);

    AssetLoadingManager.getInstance().lazyLoadHomeBattleMultiplayer(() => {
        HideLoadingPopup();

        CreateRoomUI(currentScene);
    });
}

let container_main = null;

let container_buttons = null;

function CreateRoomUI(scene) {
    container_main = scene.add.container(0, 0);

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.add
        .image(0, 0, "home_battle_multiplayer_room_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    container_main.add(lock_bg);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    let text_title = scene.add
        .text(
            606.5,
            274,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Multiplayer"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_title);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            multiplayerBossRoom.LeaveRoom(
                (response) => {},
                (error) => {}
            );

            CloseRoom();
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

    let avatar = scene.add
        .image(62 + 220 / 2, 392 + 220 / 2, centerData.userInfo.Avatar)
        .setOrigin(0.5, 0.5);

    container_main.add(avatar);

    let text_user_name = scene.add
        .text(306, 448, centerData.userInfo.Username || "No user loaded", {
            fontFamily: "Russo One",
            fontSize: "48px",
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

    container_main.add(text_user_name);

    let text_player_role = scene.add
        .text(306, 524, "No player role loaded", {
            fontFamily: "Russo One",
            fontSize: "48px",
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

    container_main.add(text_player_role);

    if (multiplayerBossRoom.IsHost()) {
        text_player_role.setColor("#FFCC00");
        text_player_role.setText("Host");
    } else {
        text_player_role.setColor("#00FF44");
        text_player_role.setText("Guest");
    }

    let text_room_code = scene.add
        .text(62, 634, "Room code: " + roomInfo.code || "No room code loaded", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);

    container_main.add(text_room_code);

    text_players = scene.add
        .text(62, 690, "No players loaded", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);

    container_main.add(text_players);

    UpdatePlayersCount();

    text_bossId = scene.add
        .text(62, 744, "Boss: " + roomInfo.bossData.name || "No Boss loaded", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);

    container_main.add(text_bossId);

    let text_Battle_Time = scene.add
        .text(
            62,
            794,
            "Battle Time: " + formatSecondsToHMS(roomInfo.bossData.battleTime),
            {
                fontFamily: "Russo One",
                fontSize: "40px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_main.add(text_Battle_Time);

    let secondsRemain = calculateRemainingSeconds(roomInfo.closeAt);

    text_time_remain = scene.add
        .text(960, 389, formatSecondsToHMS(secondsRemain), {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 0);
    container_main.add(text_time_remain);

    let text_status = scene.add
        .text(960, 433, "Status: " + roomInfo.status, {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 0);
    container_main.add(text_status);

    // Bắt đầu đếm ngược thời gian
    StartTimeCountEvent();

    //Create buttons

    if (multiplayerBossRoom.IsHost()) {
        let btn_play = CreateButton0(
            scene,
            container_main,
            686 + 328 / 2,
            641 + 86 / 2,
            "Play"
        );

        btn_play.button.on("pointerdown", function () {
            RoomPlay();
        });
    } else {
        btn_ready = CreateButton0(
            scene,
            container_main,
            686 + 328 / 2,
            641 + 86 / 2,
            "Ready text"
        );

        btn_ready.button.on("pointerdown", function () {
            if (multiplayerBossRoom.roomInfo.players.guest.isReady == false) {
                multiplayerBossRoom.PlayerReady(
                    roomInfo.roomId,
                    (response) => {},
                    (response) => {}
                );
            } else {
                multiplayerBossRoom.PlayerUnready(
                    roomInfo.roomId,
                    (response) => {},
                    (response) => {}
                );
            }
        });

        btn_ready.UpdateText = function () {
            if (multiplayerBossRoom.roomInfo.players.guest.isReady) {
                btn_ready.text.setText("UnReady");
            } else {
                btn_ready.text.setText("Ready");
            }
        };

        btn_ready.UpdateText();
    }

    CreateOtherPlayer();
}

function UpdateButtonReadyText() {
    if (btn_ready) {
        btn_ready.UpdateText();
    }
}

function CreateOtherPlayer() {
    //console.log("UpdateOtherPlayerCard");

    if (multiplayerBossRoom.IsHost()) {
        //console.log("UpdateOtherPlayerCard guest");

        CreateOtherPlayerCard(
            currentScene,
            container_main,
            roomInfo.players.guest
        );
    } else {
        //console.log("UpdateOtherPlayerCard host");

        CreateOtherPlayerCard(
            currentScene,
            container_main,
            roomInfo.players.host
        );
    }
}

function CreateOtherPlayerCard(scene, container, data) {
    if (data == null || data.username == null || data.username == "") {
        if (otherPlayerCard != null) {
            otherPlayerCard.destroy();
            otherPlayerCard = null;
        }

        return;
    }

    if (otherPlayerCard != null) {
        otherPlayerCard.destroy();
        otherPlayerCard = null;
    }

    let itemWidth = 904;
    let itemHeight = 200;

    const item_container = scene.add.container(88, 916);
    item_container.setSize(itemWidth, itemHeight);
    container.add(item_container);

    item_container.itemData = data;

    let container_inner = scene.add.container(0, 0);
    item_container.add(container_inner);
    item_container.container_inner = container_inner;

    item_container.bg = scene.add
        .image(0, 0, "home_battle_multiplayer_list_item_bg")
        .setOrigin(0, 0);
    container_inner.add(item_container.bg);

    item_container.avatar = scene.add
        .image(23 + 160 / 2, 20 + 160 / 2, item_container.itemData.avatar)
        .setDisplaySize(160, 160)
        .setOrigin(0.5, 0.5);
    container_inner.add(item_container.avatar);

    item_container.text_name = scene.add
        .text(199, 20, item_container.itemData.username, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "38px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item_container.text_name);

    item_container.text_ready = scene.add
        .text(199, 74, "Ready Status", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "38px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item_container.text_ready);

    item_container.UpdateReadyStatus = function () {
        if (item_container == null || item_container.text_ready == null) {
            return;
        }

        if (item_container.itemData.isReady) {
            item_container.text_ready.setColor("#00FF44");
            item_container.text_ready.setText("Ready");
        } else {
            item_container.text_ready.setColor("#ffffff");
            item_container.text_ready.setText("Not Ready");
        }
    };

    item_container.UpdateReadyStatus();

    item_container.player_role = scene.add
        .text(199, 136, "No role loaded", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item_container.player_role);

    if (multiplayerBossRoom.IsHost()) {
        item_container.player_role.setColor("#00FF44");
        item_container.player_role.setText("Guest");
    } else {
        item_container.player_role.setColor("#FFCC00");
        item_container.player_role.setText("Host");
    }

    if (multiplayerBossRoom.IsHost()) {
        item_container.button_kick = CreateButton1(
            scene,
            container_inner,
            640 + 200 / 2,
            114 + 58 / 2,
            "home_battle_multiplayer_btn_1",
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Kick"
            )
        );

        item_container.button_kick.button.on("pointerdown", function () {
            KickPlayer(item_container.itemData.id);
        });
    }

    otherPlayerCard = item_container;
}

function KickPlayer(userId) {
    multiplayerBossRoom.KickPlayer(
        userId,
        (response) => {
            multiplayerBossRoom.SetRoomGuest(null);

            UpdatePlayersCount();

            CreateOtherPlayer();
        },
        (response) => {}
    );
}

function UpdatePlayersCount() {
    if (text_players) {
        let playersCount = 0;

        if (roomInfo.players.host.username != null) {
            playersCount = 1;
        }
        if (roomInfo.players.guest.username != null) {
            playersCount = 2;
        }

        text_players.setText(
            "Players: " +
                playersCount +
                "/" +
                multiplayerBossRoom.GetMaxPlayers()
        );
    }
}

function CreateButton0(scene, container, x, y, buttonName) {
    let btnWidth = 328;
    let btnHeight = 86;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_battle_multiplayer_btn_play")
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

    btn_container.text = scene.add
        .text(
            btnWidth / 2,
            btnHeight / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "38px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(btn_container.text);

    return btn_container;
}

function CreateButton1(scene, container, x, y, imgKey, buttonName) {
    let btnWidth = 200;
    let btnHeight = 58;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_battle_multiplayer_btn_0")
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

    if (imgKey != "") {
        btn_container.button.setTexture(imgKey);
    }

    const text = scene.add
        .text(
            btnWidth / 2,
            btnHeight / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "38px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    return btn_container;
}

function RoomClosed(response) {
    CreateAlertPopup(currentScene, response.reason);

    CloseRoom();
}

function RoomPlay() {
    multiplayerBossRoom.StartRoom(
        (response) => {},
        (response) => {
            CreateAlertPopup(currentScene, response);
        }
    );
}

function LoadMultiplayerBossGameplay(scene) {
    CreateLoadingPopup();

    let assetsToLoad = 3; // UI, Boss assets, Player
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();
            RemoveRoomEvents();
            scene.scene.start("GameplayMultiplayerBoss");
        }
    };

    AssetLoadingManager.getInstance().init(scene);

    // 1. Tải UI gameplay
    AssetLoadingManager.getInstance().loadGameplayUI(() => {
        onAssetLoaded();
    });

    // 2. Tải assets cho boss game
    AssetLoadingManager.getInstance().loadBossAssets(() => {
        onAssetLoaded();
    });

    // 3. Tải character models
    let arrIds = centerData.getSelectedPlayerLocalIds();
    AssetPlayerLoadingManager.getInstance().init(scene);
    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterSpineGameplay(
        arrIds,
        () => {
            onAssetLoaded();
        }
    );
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

// Hàm bắt đầu đếm ngược thời gian
function StartTimeCountEvent() {
    // Dừng timer cũ nếu có
    StopTimeCountEvent();

    // Tạo timer mới cập nhật mỗi giây
    timeCountEvent = currentScene.time.addEvent({
        delay: 1000, // Cập nhật mỗi 1 giây
        callback: UpdateTimeRemain,
        loop: true,
    });
}

// Hàm dừng đếm ngược thời gian
function StopTimeCountEvent() {
    if (timeCountEvent) {
        timeCountEvent.remove();
        timeCountEvent = null;
    }
}

// Hàm cập nhật thời gian còn lại
function UpdateTimeRemain() {
    if (!text_time_remain || !roomInfo) {
        return;
    }

    let secondsRemain = calculateRemainingSeconds(roomInfo.closeAt);

    // Nếu thời gian đã hết (âm hoặc 0)
    if (secondsRemain <= 0) {
        text_time_remain.setText("00:00:00");
        StopTimeCountEvent(); // Dừng timer khi hết giờ
        return;
    }

    // Cập nhật text hiển thị
    text_time_remain.setText(formatSecondsToHMS(secondsRemain));
}

function CloseRoom() {
    // Dừng timer đếm ngược
    StopTimeCountEvent();

    RemoveRoomEvents();

    multiplayerBossRoom.ResetRoom();

    if (container_main) {
        container_main.destroy();
        container_main = null;
    }

    if (container_buttons) {
        container_buttons.destroy();
        container_buttons = null;
    }
}

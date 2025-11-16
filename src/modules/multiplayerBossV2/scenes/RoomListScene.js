/**
 * Room List Scene for Multiplayer Boss V2
 *
 * Displays available rooms for joining
 * Refresh functionality and room filtering
 */

import roomService from "../services/roomService.js";
import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../../game/scenes/Share/AlertPopup.js";
import cdLocalization from "../../../game/Data/CenterDataLocalization.js";

let container_main = null;
let container_list = null;
let gridTable = null;
let currentPage = 0;
let totalPages = 0;
let isUpdating = false;
const PAGE_LIMIT = 10;
let isOpen = false;
let refreshBtn = null;
let closeBtn = null;

/**
 * Create Room List Scene
 * @param {Phaser.Scene} scene - Current scene
 */
export function createRoomListScene(scene) {
    isOpen = true;
    CreateLoadingPopup();

    // Setup UI with proper container
    setupRoomListUI(scene);

    // Load initial room data
    setTimeout(() => {
        HideLoadingPopup();
        updateRoomList();
    }, 500);
}

/**
 * Setup room list UI
 * @param {Phaser.Scene} scene - Current scene
 */
function setupRoomListUI(scene) {
    destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    // Background
    const bg = scene.add
        .image(0, 0, "home_battle_multiplayer_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    container_main.add(bg);

    // Title
    const title = scene.add.text(
        540,
        100,
        "Available Rooms",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "56px",
            color: "#FFFFFF",
            align: "center",
            stroke: "#000000",
            strokeThickness: 8
        }
    ).setOrigin(0.5);

    container_main.add(title);

    // Create close button
    closeBtn = scene.add
        .image(38 + 32 / 2, 266 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {
            closeRoomList();
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: closeBtn,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: closeBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });

    container_main.add(closeBtn);

    // Create refresh button
    refreshBtn = createButton(
        scene,
        container_main,  // ✅ Proper container
        950,
        320,
        "home_battle_btn",
        "Refresh"
    );

    refreshBtn.button.on("pointerdown", () => {
        refreshRooms();
    });

    // Create room list container
    createRoomListContainer(scene);
}

/**
 * Create room list container
 * @param {Phaser.Scene} scene - Current scene
 */
function createRoomListContainer(scene) {
    const scrollViewWidth = 1008;
    const scrollViewHeight = 1400;
    const posX = 36 + scrollViewWidth / 2;
    const posY = 380 + scrollViewHeight / 2;

    // Create scrollable panel
    gridTable = scene.rexUI.add
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
                    column: 1,
                    row: PAGE_LIMIT,
                    columnProportions: 0,
                    rowProportions: 0,
                    space: {
                        column: 0,
                        row: 20,
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
                bottom: 50,
            },
        })
        .layout();

    container_list = scene.add.container(0, 0);
    container_main.add(container_list);
    container_list.add(gridTable);

    // Create mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);

    // Add "No rooms" message initially
    showNoRoomsMessage(scene);
}

/**
 * Show empty state - No rooms available
 * UI design: Space theme with centered message and call-to-action
 * @param {Phaser.Scene} scene - Current scene
 */
function showNoRoomsMessage(scene) {
    console.log('[showNoRoomsMessage] Creating empty state UI');

    // Clear existing content safely
    if (gridTable) {
        try {
            gridTable.clear(true);
        } catch (error) {
            console.warn('[showNoRoomsMessage] Error clearing gridTable:', error);
        }
    }

    // Check if gridTable and panel exist
    if (!gridTable || !gridTable.getElement || !gridTable.getElement("panel")) {
        console.warn('[showNoRoomsMessage] gridTable or panel not available, creating simple fallback');
        showSimpleNoRoomsMessage(scene);
        return;
    }

    try {
        // Main title - "No Rooms Available"
        const titleText = scene.add.text(
            540,
            350,
            'No Rooms Available',
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "56px",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 4
            }
        );
        titleText.setOrigin(0.5);
        gridTable.getElement("panel").add(titleText, {
            align: "center",
            expand: true,
        });

        // Divider line for visual separation
        const divider = scene.add.graphics();
        divider.lineStyle(2, 0xffffff, 0.5);
        divider.lineBetween(290, 420, 790, 420);
        gridTable.getElement("panel").add(divider, {
            align: "center",
            expand: false,
        });

        // Suggestion message - "Create a room to start battling!"
        const suggestionText = scene.add.text(
            540,
            480,
            'Create a room to start battling!',
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#cccccc",
                align: "center"
            }
        );
        suggestionText.setOrigin(0.5);
        gridTable.getElement("panel").add(suggestionText, {
            align: "center",
            expand: false,
        });

        // Helpful hint - "Use the 'Create' button"
        const hintText = scene.add.text(
            540,
            550,
            'Press the "Create" button to start a new battle',
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#999999",
                align: "center"
            }
        );
        hintText.setOrigin(0.5);
        gridTable.getElement("panel").add(hintText, {
            align: "center",
            expand: false,
        });

        console.log('[showNoRoomsMessage] Empty state UI created successfully');

    } catch (error) {
        console.error('[showNoRoomsMessage] Error creating UI:', error);
        showSimpleNoRoomsMessage(scene);
    }
}

/**
 * Simple fallback for when gridTable is not available
 * @param {Phaser.Scene} scene - Current scene
 */
function showSimpleNoRoomsMessage(scene) {
    console.log('[showSimpleNoRoomsMessage] Creating simple fallback UI');

    // Create a simple container directly on scene
    const container = scene.add.container(0, 0);

    // Main title
    const titleText = scene.add.text(
        540,
        350,
        'No Rooms Available',
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "56px",
            color: "#ffffff",
            align: "center",
            stroke: "#000000",
            strokeThickness: 4
        }
    );
    titleText.setOrigin(0.5);
    container.add(titleText);

    // Suggestion message
    const suggestionText = scene.add.text(
        540,
        450,
        'Create a room to start battling!',
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#cccccc",
            align: "center"
        }
    );
    suggestionText.setOrigin(0.5);
    container.add(suggestionText);

    // Helpful hint
    const hintText = scene.add.text(
        540,
        520,
        'Press the "Create" button to start a new battle',
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#999999",
            align: "center"
        }
    );
    hintText.setOrigin(0.5);
    container.add(hintText);

    // Set depth to ensure it's visible
    container.setDepth(350);
}

/**
 * Update room list
 */
/**
 * Show error popup with message
 * @param {Phaser.Scene} scene - Current scene
 * @param {string} message - Error message to display
 */
function showErrorPopup(scene, message) {
    // Create error popup container
    const popupContainer = scene.add.container(0, 0);
    popupContainer.setDepth(1000);

    // Semi-transparent overlay
    const overlay = scene.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);
    overlay.setOrigin(0.5);
    overlay.setInteractive();
    popupContainer.add(overlay);

    // Error box background
    const errorBox = scene.add.rectangle(512, 384, 600, 300, 0x333333);
    errorBox.setOrigin(0.5);
    errorBox.setStrokeStyle(3, 0xff4444);
    popupContainer.add(errorBox);

    // Error icon
    const errorIcon = scene.add.text(512, 280, '⚠️', {
        fontSize: 48,
        align: 'center'
    });
    errorIcon.setOrigin(0.5);
    popupContainer.add(errorIcon);

    // Error title
    const errorTitle = scene.add.text(
        512,
        330,
        'Failed to Load Rooms',
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#ff4444",
            align: "center"
        }
    );
    errorTitle.setOrigin(0.5);
    popupContainer.add(errorTitle);

    // Error message
    const errorText = scene.add.text(
        512,
        390,
        message || 'Unable to connect to server.\nPlease try again later.',
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#FFFFFF",
            align: "center",
            wordWrap: { width: 500 }
        }
    );
    errorText.setOrigin(0.5);
    popupContainer.add(errorText);

    // Confirm button - "OK"
    const confirmBtn = createButton(
        scene,
        popupContainer,
        512,
        490,
        "home_battle_btn",
        "OK",
        () => {
            // Destroy all popup elements
            overlay.destroy();
            errorBox.destroy();
            errorIcon.destroy();
            errorTitle.destroy();
            errorText.destroy();
            confirmBtn.container.destroy();

            // Show empty state after closing error
            showNoRoomsMessage(scene);
        }
    );
}

/**
 * Update room list
 */
async function updateRoomList() {
    if (isUpdating) return;

    isUpdating = true;
    CreateLoadingPopup();

    try {
        const rooms = await roomService.getAvailableRooms();
        HideLoadingPopup();

        console.log(`[RoomListScene] Found ${rooms.length} rooms`);

        // Validate rooms array
        if (!rooms || !Array.isArray(rooms)) {
            console.warn('[RoomListScene] Invalid rooms data received');
            showNoRoomsMessage(container_main.scene);
            return;
        }

        // Clear existing items safely
        if (gridTable) {
            try {
                gridTable.clear(true);
            } catch (error) {
                console.warn('[RoomListScene] Error clearing gridTable:', error);
            }
        }

        if (rooms.length === 0) {
            console.log('[RoomListScene] No rooms available - showing empty state');
            showNoRoomsMessage(container_main.scene);
        } else {
            console.log(`[RoomListScene] Displaying ${rooms.length} rooms`);

            // Check if gridTable and panel exist
            if (!gridTable || !gridTable.getElement || !gridTable.getElement("panel")) {
                console.warn('[RoomListScene] gridTable or panel not available for room display');
                showSimpleRoomList(container_main.scene, rooms);
                return;
            }

            try {
                // Add room items
                rooms.forEach(room => {
                    const roomItem = createRoomItem(container_main.scene, room);
                    gridTable.getElement("panel").add(roomItem, {
                        align: "top-left",
                        expand: false,
                    });
                });

                gridTable.layout();
                console.log('[RoomListScene] Room list layout updated');

            } catch (error) {
                console.error('[RoomListScene] Error rendering room items:', error);
                showSimpleRoomList(container_main.scene, rooms);
            }
        }

    } catch (error) {
        console.error("[RoomListScene] Failed to update room list:", error);
        HideLoadingPopup();

        // Use error popup instead of alert
        showErrorPopup(
            container_main.scene,
            'Unable to connect to server.\nPlease try again later.'
        );
    }

    isUpdating = false;
}

/**
 * Simple fallback for displaying room list when gridTable is not available
 * @param {Phaser.Scene} scene - Current scene
 * @param {Array} rooms - Array of room objects
 */
function showSimpleRoomList(scene, rooms) {
    console.log('[showSimpleRoomList] Creating simple room list fallback');

    // Create a simple container
    const container = scene.add.container(0, 0);
    container.setDepth(350);

    let yOffset = 200;

    rooms.forEach((room, index) => {
        const roomText = scene.add.text(
            270,
            yOffset,
            `Room: ${room.roomCode || room.roomId?.substring(0, 6) || 'Unknown'} - ${room.clients || 0}/2 Players`,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "32px",
                color: "#ffffff",
                align: "left"
            }
        );
        container.add(roomText);

        // Join button
        const isFull = (room.clients || 0) >= 2;
        const joinBtn = scene.add.text(
            800,
            yOffset,
            isFull ? 'Full' : 'Join',
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: isFull ? "#999999" : "#00ff00",
                align: "center"
            }
        );
        joinBtn.setOrigin(0.5);

        if (!isFull) {
            joinBtn.setInteractive({ useHandCursor: true });
            joinBtn.on('pointerdown', () => {
                console.log('[showSimpleRoomList] Join room:', room.roomId);
                joinRoom(room.roomCode || room.roomId);
            });
        }

        container.add(joinBtn);
        yOffset += 80;
    });
}

/**
 * Create room item
 * @param {Phaser.Scene} scene - Current scene
 * @param {Object} roomData - Room data
 * @returns {Phaser.GameObjects.Container} Room item container
 */
function createRoomItem(scene, roomData) {
    let itemWidth = 1004;
    let itemHeight = 293; // Match V1 room card size

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);

    // Background (same as V1 room cards)
    const bg = scene.add
        .image(0, 0, "home_battle_item_bg_campain")
        .setOrigin(0, 0);
    container_inner.add(bg);

    // Host avatar placeholder (matches V1 position)
    const avatarBg = scene.add
        .image(62 + 220 / 2, 392 + 220 / 2 - 250, "share_btn_back") // Move up for room list
        .setOrigin(0.5)
        .setDisplaySize(180, 180) // Slightly smaller than room scene
        .setTint(0x666666);
    container_inner.add(avatarBg);

    // Load host avatar if available
    if (roomData.hostAvatar && roomData.hostAvatar !== '') {
        const avatarKey = `room_avatar_${roomData.roomId || Math.random()}`;

        if (!scene.textures.exists(avatarKey)) {
            scene.load.image(avatarKey, roomData.hostAvatar);
            scene.load.start();

            scene.load.once('complete', () => {
                if (avatarBg && avatarBg.scene) {
                    avatarBg.setTexture(avatarKey);
                    avatarBg.clearTint();
                }
            });
        } else {
            avatarBg.setTexture(avatarKey);
            avatarBg.clearTint();
        }
    }

    // Host username (matches V1 style)
    const hostUsername = scene.add.text(
        306,
        448 - 250, // Move up for room list
        roomData.hostName || "Unknown Host",
        {
            fontFamily: "Russo One",
            fontSize: "36px", // Slightly smaller for room list
            color: "#ffffff",
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: "#FF9D00",
                blur: 5,
                stroke: true,
                fill: true,
            },
            align: "left",
        }
    ).setOrigin(0, 0);
    container_inner.add(hostUsername);

    // "Host" label (matches V1 yellow color)
    const hostLabel = scene.add.text(
        306,
        474 - 250, // Move up for room list
        "Host",
        {
            fontFamily: "Russo One",
            fontSize: "32px", // Slightly smaller for room list
            color: "#FFCC00",
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: "#000000",
                blur: 5,
                stroke: true,
                fill: true,
            },
            align: "left",
        }
    ).setOrigin(0, 0);
    container_inner.add(hostLabel);

    // Room info panel (matches V1 positioning)
    const roomCode = scene.add.text(
        62,
        634 - 250, // Move up for room list
        `Room code: ${roomData.roomCode || "N/A"}`,
        {
            fontFamily: "Russo One",
            fontSize: "32px", // Slightly smaller for room list
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    container_inner.add(roomCode);

    // Players count
    const playersCount = scene.add.text(
        62,
        664 - 250,
        `Players: ${roomData.playerCount}/${roomData.maxPlayers}`,
        {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    container_inner.add(playersCount);

    // Boss info
    const bossInfo = scene.add.text(
        62,
        694 - 250,
        `Boss: ${roomData.boss?.name || "Unknown"}`,
        {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#FFD700",
            align: "left",
        }
    ).setOrigin(0, 0);
    container_inner.add(bossInfo);

    // Battle time
    const battleTimeText = formatSecondsToHMS((roomData.boss?.battleTime || 300000) / 1000);
    const battleTime = scene.add.text(
        62,
        724 - 250,
        `Battle Time: ${battleTimeText}`,
        {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    container_inner.add(battleTime);

    // Timer display (top right, matches V1)
    const timerText = scene.add.text(
        960,
        "00:00:00",
        {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#ffffff",
            align: "right",
        }
    ).setOrigin(1, 0);
    container_inner.add(timerText);

    // Status display (below timer, matches V1)
    const statusMap = {
        0: "waiting",     // WAITING
        1: "in battle",   // PLAYING
        2: "ended"        // ENDED
    };
    const statusText = scene.add.text(
        960,
        413 - 250,
        `Status: ${statusMap[roomData.phase] || "unknown"}`,
        {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: roomData.canJoin ? "#00FF44" : "#FF6B6B",
            align: "right",
        }
    ).setOrigin(1, 0);
    container_inner.add(statusText);

    // Join button (matches V1 positioning)
    if (roomData.canJoin) {
        const btn_join = createButton0(
            scene,
            container_inner,
            686 + 328 / 2,
            641 + 86 / 2 - 250, // Move up for room list
            "Join"
        );

        btn_join.button.on("pointerdown", () => {
            joinRoomFromList(scene, item, roomData);
        });

        container_inner.add(btn_join);
    } else {
        const btn_full = createButton0(
            scene,
            container_inner,
            686 + 328 / 2,
            641 + 86 / 2 - 250,
            roomData.playerCount >= roomData.maxPlayers ? "Full" : "In Progress"
        );

        // Disable full/in-progress buttons
        btn_full.button.setAlpha(0.5);
        btn_full.button.disableInteractive();

        container_inner.add(btn_full);
    }

    return item;
}

/**
 * Create button helper (matches V1 room scene style)
 */
function createButton0(scene, container, x, y, buttonName) {
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
        .image(0, 0, "home_battle_btn")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            if (btn_container.button.alpha === 1) {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100,
                    ease: "Power2",
                });
            }
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    btn_inner_container.add(btn_container.button);

    const text = scene.add
        .text(
            btnWidth / 2,
            17,
            buttonName,
            {
                fontFamily: "Russo One",
                fontSize: "36px",
                color: "#FFF",
                align: "center",
            }
        )
        .setOrigin(0.5, 0);

    btn_inner_container.add(text);

    return btn_container;
}

/**
 * Create button
 * @param {Phaser.Scene} scene - Current scene
 * @param {Phaser.GameObjects.Container} container - Parent container to add button to
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} texture - Button texture
 * @param {string} text - Button text
 * @returns {Object} Button object
 */
function createButton(scene, container, x, y, texture, text) {
    // Create button container
    const btnContainer = scene.add.container(x, y);

    // Add to parent container
    container.add(btnContainer);

    // Create button image
    const button = scene.add
        .image(0, 0, texture)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btnContainer,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btnContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });

    btnContainer.add(button);

    // Create button text
    const buttonText = scene.add.text(
        0,
        0,
        text,
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "20px",
            color: "#FFFFFF",
            align: "center"
        }
    ).setOrigin(0.5);

    btnContainer.add(buttonText);
    btnContainer.button = button;

    return btnContainer;
}

/**
 * Join room
 * @param {string} roomCode - Room code to join
 */
async function joinRoom(roomCode) {
    console.log(`[RoomListScene] Joining room: ${roomCode}`);

    CreateLoadingPopup();

    try {
        const result = await roomService.joinRoom(roomCode);

        if (result.success) {
            HideLoadingPopup();
            closeRoomList();

            // Navigate to room scene
            import("./RoomScene.js").then(module => {
                module.createRoomScene(container_main.scene, result.room);
            }).catch(error => {
                console.error("Failed to load RoomScene:", error);
                CreateAlertPopup(container_main.scene, "Failed to load room scene");
            });
        } else {
            HideLoadingPopup();
            CreateAlertPopup(container_main.scene, result.error || "Failed to join room");
        }
    } catch (error) {
        console.error("Join room error:", error);
        HideLoadingPopup();
        CreateAlertPopup(container_main.scene, "Failed to join room");
    }
}

/**
 * Refresh rooms list
 */
function refreshRooms() {
    if (refreshBtn) {
        // Disable button temporarily
        refreshBtn.button.disableInteractive();

        // Add rotation animation
        container_main.scene.tweens.add({
            targets: refreshBtn,
            angle: 360,
            duration: 500,
            ease: "Power2",
            onComplete: () => {
                refreshBtn.angle = 0;
                refreshBtn.button.setInteractive({ useHandCursor: true });
                updateRoomList();
            }
        });
    }
}

/**
 * Close room list scene
 */
function closeRoomList() {
    isOpen = false;
    destroy();
}

/**
 * Destroy scene elements
 */
function destroy() {
    if (container_main) {
        container_main.destroy();
    }
    container_main = null;
    container_list = null;
    gridTable = null;
    refreshBtn = null;
    closeBtn = null;
    isUpdating = false;
    currentPage = 0;
    totalPages = 0;
}

/**
 * Check if room list scene is open
 * @returns {boolean} Scene open status
 */
export function isRoomListOpen() {
    return isOpen;
}

/**
 * Join room from list
 * @param {Phaser.Scene} scene - Current scene
 * @param {Phaser.GameObjects.Container} roomItem - Room item container
 * @param {Object} roomData - Room data
 */
async function joinRoomFromList(scene, roomItem, roomData) {
    try {
        console.log('[RoomListScene] Joining room from list:', roomData);

        // Get player data from session storage
        const playerData = {
            userId: sessionStorage.getItem('userId') || 'guest-' + Date.now(),
            characterId: sessionStorage.getItem('selectedCharacter') || 'default',
            playerName: sessionStorage.getItem('username') || 'Player',
            avatar: sessionStorage.getItem('avatar') || '',
            level: parseInt(sessionStorage.getItem('playerLevel')) || 1,
            hp: parseInt(sessionStorage.getItem('playerHP')) || 1000,
            attack: parseInt(sessionStorage.getItem('playerAttack')) || 100,
            defense: parseInt(sessionStorage.getItem('playerDefense')) || 50
        };

        CreateLoadingPopup();

        // Join room
        const result = await roomService.joinRoom(roomData.roomCode, playerData);

        HideLoadingPopup();

        if (result.success) {
            console.log('[RoomListScene] Room joined successfully:', result.roomCode);

            // Destroy room list
            destroy();

            // Navigate to RoomScene
            import('./RoomScene.js').then(module => {
                module.createRoomScene(scene, {
                    room: result.room,
                    bossId: roomData.boss?.id
                });
            }).catch(error => {
                console.error('[RoomListScene] Failed to load RoomScene:', error);
                CreateAlertPopup(scene, 'Failed to load room scene');
            });

        } else {
            console.error('[RoomListScene] Failed to join room:', result.error);
            CreateAlertPopup(scene, result.error || 'Failed to join room');
        }

    } catch (error) {
        HideLoadingPopup();
        console.error('[RoomListScene] Join room error:', error);
        CreateAlertPopup(scene, 'Error joining room. Please try again.');
    }
}

/**
 * Format seconds to HH:MM:SS (matches V1 format)
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string
 */
function formatSecondsToHMS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

/**
 * Pad number with leading zero
 * @param {number} num - Number to pad
 * @returns {string} Padded string
 */
function pad(num) {
    return num.toString().padStart(2, '0');
}
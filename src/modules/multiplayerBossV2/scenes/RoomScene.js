/**
 * Room Scene for Multiplayer Boss V2
 *
 * Room waiting and preparation scene
 * Shows room code, players, ready status
 */

import roomService from "../services/roomService.js";
import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../../game/scenes/Share/AlertPopup.js";
import cdLocalization from "../../../game/Data/CenterDataLocalization.js";

let container_main = null;
let currentRoom = null;
let currentScene = null;
let text_roomCode = null;
let text_players = null;
let text_status = null;
let btn_ready = null;
let btn_leave = null;
let playerListContainer = null;
let isOpen = false;
let isReady = false;

/**
 * Create Room Scene
 * @param {Phaser.Scene} scene - Current scene
 * @param {Object} roomInfo - Room information
 */
export function createRoomScene(scene, roomInfo) {
    console.log("[RoomScene] Creating room scene", roomInfo);

    currentScene = scene;
    currentRoom = roomInfo;
    isOpen = true;
    isReady = false;

    createLoadingPopup();

    // Create UI
    setupRoomUI(scene, roomInfo);

    // Setup Colyseus event listeners
    setupColyseusListeners();

    HideLoadingPopup();
}

/**
 * Create loading popup
 */
function createLoadingPopup() {
    CreateLoadingPopup();
}

/**
 * Setup room UI
 * @param {Phaser.Scene} scene - Current scene
 * @param {Object} roomInfo - Room information
 */
function setupRoomUI(scene, roomInfo) {
    destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    // Background
    const bg = scene.add
        .image(0, 0, "home_battle_multiplayer_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    container_main.add(bg);

    // Main content container
    const contentContainer = scene.add.container(540, 960);
    container_main.add(contentContainer);

    // Room title
    const title = scene.add.text(
        0,
        -300,
        "Boss Battle Room",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "56px",
            color: "#FFFFFF",
            align: "center",
            stroke: "#000000",
            strokeThickness: 8
        }
    ).setOrigin(0.5);

    contentContainer.add(title);

    // Room code display
    const codeLabel = scene.add.text(
        0,
        -200,
        "Room Code:",
        {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#CCCCCC",
            align: "center"
        }
    ).setOrigin(0.5);

    contentContainer.add(codeLabel);

    text_roomCode = scene.add.text(
        0,
        -150,
        roomInfo.roomCode || "000",
        {
            fontFamily: "Russo One",
            fontSize: "64px",
            color: "#FFD700",
            align: "center",
            stroke: "#000000",
            strokeThickness: 10
        }
    ).setOrigin(0.5);

    contentContainer.add(text_roomCode);

    // Boss info
    if (roomInfo.bossInfo) {
        const bossLabel = scene.add.text(
            0,
            -80,
            `Boss: ${roomInfo.bossInfo.name} (Lv.${roomInfo.bossInfo.level})`,
            {
                fontFamily: "Russo One",
                fontSize: "28px",
                color: "#FF6B6B",
                align: "center"
            }
        ).setOrigin(0.5);

        contentContainer.add(bossLabel);
    }

    // Players section
    const playersLabel = scene.add.text(
        0,
        0,
        "Players:",
        {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#CCCCCC",
            align: "center"
        }
    ).setOrigin(0.5);

    contentContainer.add(playersLabel);

    // Player list container
    playerListContainer = scene.add.container(0, 60);
    contentContainer.add(playerListContainer);

    // Status text
    text_status = scene.add.text(
        0,
        200,
        "Waiting for players...",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#FFFFFF",
            align: "center"
        }
    ).setOrigin(0.5);

    contentContainer.add(text_status);

    // Buttons container
    const buttonsContainer = scene.add.container(0, 350);
    contentContainer.add(buttonsContainer);

    // Ready button
    btn_ready = createButton(
        scene,
        -150,
        0,
        "home_battle_btn",
        "Ready"
    );

    btn_ready.button.on("pointerdown", () => {
        toggleReady();
    });

    buttonsContainer.add(btn_ready);

    // Leave button
    btn_leave = createButton(
        scene,
        150,
        0,
        "share_btn_back",
        "Leave"
    );

    btn_leave.button.on("pointerdown", () => {
        leaveRoom();
    });

    buttonsContainer.add(btn_leave);

    // Initialize player list
    updatePlayerList();

    // Update initial status
    updateRoomStatus();
}

/**
 * Create button
 * @param {Phaser.Scene} scene - Current scene
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} texture - Button texture
 * @param {string} text - Button text
 * @returns {Object} Button object
 */
function createButton(scene, x, y, texture, text) {
    const btnContainer = scene.add.container(x, y);

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

    const buttonText = scene.add.text(
        0,
        0,
        text,
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFFFFF",
            align: "center"
        }
    ).setOrigin(0.5);

    btnContainer.add(text);
    btnContainer.button = button;

    return btnContainer;
}

/**
 * Setup Colyseus event listeners
 */
function setupColyseusListeners() {
    // Import colyseusClient for direct access
    import("../services/colyseusClient.js").then(module => {
        const colyseusClient = module.default;

        if (!colyseusClient) return;

        // State change listener
        colyseusClient.onStateChange = (state) => {
            console.log("[RoomScene] State changed:", state.getSummary());
            updateRoomStatus();
            updatePlayerList();
        };

        // Message listeners
        colyseusClient.onMessage = (type, message) => {
            console.log("[RoomScene] Message received:", type, message);

            switch (type) {
                case "battle-started":
                    handleBattleStarted(message);
                    break;
                case "chat":
                    handleChatMessage(message);
                    break;
            }
        };

        // Error handling
        colyseusClient.onError = (error) => {
            console.error("[RoomScene] Room error:", error);
            CreateAlertPopup(currentScene, "Connection error: " + error.message);
        };

        // Leave handling
        colyseusClient.onLeave = () => {
            console.log("[RoomScene] Left room");
            if (isOpen) {
                CreateAlertPopup(currentScene, "You have been disconnected from the room");
                closeRoomScene();
            }
        };
    }).catch(error => {
        console.error("[RoomScene] Failed to load colyseus client:", error);
    });
}

/**
 * Update player list display
 */
function updatePlayerList() {
    if (!playerListContainer) return;

    // Clear existing players
    playerListContainer.removeAll(true);

    const roomStatus = roomService.getCurrentRoomStatus();
    let players = [];

    if (roomStatus.connected && roomStatus.roomId) {
        // Get players from current room state
        const state = roomService.getCurrentState();
        if (state && state.players) {
            state.players.forEach((player, sessionId) => {
                players.push({
                    name: player.name || `Player ${sessionId.slice(0, 4)}`,
                    ready: player.isReady || false,
                    isHost: sessionId === state.players.keys().next().value
                });
            });
        }
    } else {
        // Show current player
        const playerData = roomService.getPlayerData();
        players.push({
            name: playerData.playerName,
            ready: isReady,
            isHost: true
        });
    }

    // If no players, show waiting
    if (players.length === 0) {
        const waitingText = currentScene.add.text(
            0,
            0,
            "Waiting for players to join...",
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "24px",
                color: "#CCCCCC",
                align: "center"
            }
        ).setOrigin(0.5);

        playerListContainer.add(waitingText);
    } else {
        // Display players
        players.forEach((player, index) => {
            const yOffset = index * 60;

            // Player name
            const nameText = currentScene.add.text(
                -100,
                yOffset,
                `${player.isHost ? "👑 " : ""}${player.name}`,
                {
                    fontFamily: "Russo One",
                    fontSize: "28px",
                    color: "#FFFFFF",
                    align: "left"
                }
            ).setOrigin(0, 0.5);

            playerListContainer.add(nameText);

            // Ready status
            const statusText = currentScene.add.text(
                100,
                yOffset,
                player.ready ? "✅ Ready" : "⏳ Not Ready",
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "24px",
                    color: player.ready ? "#00FF00" : "#FFD700",
                    align: "right"
                }
            ).setOrigin(1, 0.5);

            playerListContainer.add(statusText);
        });
    }
}

/**
 * Update room status display
 */
function updateRoomStatus() {
    if (!text_status) return;

    const roomStatus = roomService.getCurrentRoomStatus();
    const state = roomService.getCurrentState();

    if (!roomStatus.connected) {
        text_status.setText("Connecting to room...");
        text_status.setStyle({ color: "#FFD700" });
    } else if (!state) {
        text_status.setText("Loading room data...");
        text_status.setStyle({ color: "#FFD700" });
    } else {
        const playerCount = state.players.size || 0;
        const phase = state.phase || 0;

        if (phase === 1) {
            text_status.setText("Battle Starting...");
            text_status.setStyle({ color: "#00FF00" });
        } else if (playerCount >= 2) {
            text_status.setText("All players joined - Ready to start!");
            text_status.setStyle({ color: "#00FF00" });
        } else {
            text_status.setText(`Waiting for players... (${playerCount}/2)`);
            text_status.setStyle({ color: "#FFFFFF" });
        }
    }
}

/**
 * Toggle ready status
 */
function toggleReady() {
    if (isReady) {
        // Cancel ready
        isReady = false;
        if (btn_ready) {
            const readyText = btn_ready.children.find(child => child.text);
            if (readyText) readyText.setText("Ready");
        }
        // TODO: Send unready message when backend supports it
    } else {
        // Set ready
        isReady = true;
        if (btn_ready) {
            const readyText = btn_ready.children.find(child => child.text);
            if (readyText) readyText.setText("Cancel");
        }

        // Send ready message
        const result = roomService.sendReady();
        if (!result.success) {
            console.error("Failed to send ready:", result.error);
        }
    }

    updatePlayerList();
}

/**
 * Leave room
 */
async function leaveRoom() {
    if (confirm("Are you sure you want to leave the room?")) {
        CreateLoadingPopup();

        try {
            const result = roomService.leaveRoom();

            if (result.success) {
                HideLoadingPopup();
                closeRoomScene();
            } else {
                HideLoadingPopup();
                CreateAlertPopup(currentScene, result.error || "Failed to leave room");
            }
        } catch (error) {
            console.error("Leave room error:", error);
            HideLoadingPopup();
            CreateAlertPopup(currentScene, "Failed to leave room");
        }
    }
}

/**
 * Handle battle started message
 * @param {Object} message - Battle started message
 */
function handleBattleStarted(message) {
    console.log("[RoomScene] Battle started:", message);
    text_status.setText("BATTLE STARTED!");
    text_status.setStyle({ color: "#00FF00" });

    // TODO: Navigate to battle scene
    // For now, just show alert
    setTimeout(() => {
        CreateAlertPopup(currentScene, "Battle started! (Battle scene not implemented yet)");
    }, 1000);
}

/**
 * Handle chat message
 * @param {Object} message - Chat message
 */
function handleChatMessage(message) {
    console.log("[RoomScene] Chat message:", message);
    // TODO: Display chat messages in UI
}

/**
 * Close room scene
 */
function closeRoomScene() {
    isOpen = false;
    isReady = false;
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
    playerListContainer = null;
    text_roomCode = null;
    text_players = null;
    text_status = null;
    btn_ready = null;
    btn_leave = null;
    currentRoom = null;
    currentScene = null;
}

/**
 * Check if room scene is open
 * @returns {boolean} Scene open status
 */
export function isRoomSceneOpen() {
    return isOpen;
}
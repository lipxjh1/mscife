/**
 * Room Scene for Multiplayer Boss V2
 *
 * Matches V1 HomeBattleMultiplayerBossRoom.js layout
 * Real-time Colyseus state synchronization
 */

import colyseusClient from '../services/colyseusClient.js';
import roomService from '../services/roomService.js';
import cdLocalization from '../../../game/Data/CenterDataLocalization.js';
import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../../game/scenes/Share/AlertPopup.js";

let container_main = null;
let currentRoom = null;
let currentScene = null;
let uiElements = null;
let timerInterval = null;

/**
 * Create Boss Battle Room Scene
 * Matches V1 HomeBattleMultiplayerBossRoom.js layout exactly
 *
 * @param {Phaser.Scene} scene - Current scene
 * @param {Object} roomData - Room information
 */
export function createRoomScene(scene, roomData) {
    console.log('[RoomScene] ============================================');
    console.log('[RoomScene] CREATING ROOM SCENE');
    console.log('[RoomScene] ============================================');
    console.log('[RoomScene] Room data:', roomData);
    console.log('[RoomScene] Room object:', roomData?.room);
    console.log('[RoomScene] Room state:', roomData?.room?.state);
    console.log('[RoomScene] Room state type:', roomData?.room?.state?.constructor?.name);

    // Clean up previous scene
    destroyRoomScene();

    currentScene = scene;
    currentRoom = roomData;

    CreateLoadingPopup();

    try {
        if (!roomData?.room) {
            console.error('[RoomScene] ❌ No room object provided');
            HideLoadingPopup();
            showErrorPopup(scene, 'Room data is missing');
            return;
        }

        // ✅ CHECK STATE AVAILABILITY
        console.log('[RoomScene] Checking state availability...');
        console.log('[RoomScene] State properties:', roomData.room.state ? Object.keys(roomData.room.state) : 'NO STATE');
        console.log('[RoomScene] Players:', roomData.room.state?.players);

        // Create main container matching V1 dimensions
        container_main = scene.add.container(0, 0);
        container_main.setDepth(300);

        // Create background
        const bg = scene.add
            .image(0, 0, "home_battle_multiplayer_bg")
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true });
        container_main.add(bg);

        // ✅ SAFE CALL với fallback
        if (roomData.room.state && roomData.room.state.players) {
            console.log('[RoomScene] State available, rendering with full data');
            uiElements = {
                header: createHeader(scene, container_main),
                hostCard: createHostInfoCard(scene, container_main),
                guestCard: createGuestInfoCard(scene, container_main),
                roomInfo: createRoomInfoPanel(scene, container_main),
                timerText: createTimerDisplay(scene, container_main),
                statusText: createStatusDisplay(scene, container_main),
                playButton: createPlayButton(scene, container_main)
            };
        } else {
            console.warn('[RoomScene] State not available, using fallback rendering');
            uiElements = {
                header: createHeader(scene, container_main),
                hostCard: createHostInfoCardFallback(scene, container_main, roomData.room, roomData.bossId),
                guestCard: null,
                roomInfo: createRoomInfoPanelFallback(scene, container_main, roomData.room),
                timerText: createTimerDisplay(scene, container_main),
                statusText: createStatusDisplayFallback(scene, container_main, roomData.room),
                playButton: createPlayButtonFallback(scene, container_main, roomData.room)
            };
        }

        // Setup Colyseus real-time listeners
        setupColyseusListeners(scene, container_main, roomData, uiElements);

        // Start timer if already in playing phase
        if (colyseusClient.currentRoom?.state?.phase === 1) {
            startBattleTimer(scene, uiElements.timerText, colyseusClient.currentRoom);
        }

        HideLoadingPopup();

        console.log('[RoomScene] ✅ Room scene created successfully');

    } catch (error) {
        console.error('[RoomScene] ============================================');
        console.error('[RoomScene] ❌ CRITICAL ERROR');
        console.error('[RoomScene] ============================================');
        console.error('[RoomScene] Error:', error.message);
        console.error('[RoomScene] Stack:', error.stack);
        console.error('[RoomScene] Room data:', roomData?.room);
        console.error('[RoomScene] State:', roomData?.room?.state);
        console.error('[RoomScene] ============================================');

        HideLoadingPopup();

        // ✅ SHOW ERROR TO USER
        showErrorPopup(
            scene,
            'Failed to create room scene.\n' + error.message + '\n\nPlease try again.'
        );

        // ✅ TRY FALLBACK if room exists
        if (roomData?.room) {
            console.log('[RoomScene] Attempting fallback rendering...');
            try {
                container_main = scene.add.container(0, 0);
                const bg = scene.add
                    .image(0, 0, "home_battle_multiplayer_bg")
                    .setOrigin(0, 0)
                    .setInteractive({ useHandCursor: true });
                container_main.add(bg);

                uiElements = {
                    header: createHeader(scene, container_main),
                    hostCard: createHostInfoCardFallback(scene, container_main, roomData.room, roomData.bossId),
                    guestCard: null,
                    roomInfo: createRoomInfoPanelFallback(scene, container_main, roomData.room),
                    timerText: createTimerDisplay(scene, container_main),
                    statusText: createStatusDisplayFallback(scene, container_main, roomData.room),
                    playButton: createPlayButtonFallback(scene, container_main, roomData.room)
                };

                setupColyseusListeners(scene, container_main, roomData, uiElements);
                console.log('[RoomScene] ✅ Fallback rendering succeeded');
            } catch (fallbackError) {
                console.error('[RoomScene] Fallback also failed:', fallbackError);
                showErrorPopup(scene, 'Failed to create room interface. Please go back and try again.');
            }
        }
    }

    return container_main;
}

/**
 * Create header with Back button and title
 * Matches V1 positioning
 */
function createHeader(scene, container) {
    const headerContainer = scene.add.container(0, 0);

    // Close button (matches V1 position)
    const btn_close = scene.add
        .image(38 + 32 / 2, 266 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {
            console.log('[RoomScene] Back button clicked');
            leaveRoom(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });

    headerContainer.add(btn_close);

    // "Multiplayer" title
    const title = scene.add.text(
        540,
        100,
        "Multiplayer",
        {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#FFFFFF",
            align: "center",
            stroke: "#000000",
            strokeThickness: 6
        }
    ).setOrigin(0.5);
    headerContainer.add(title);

    container.add(headerContainer);

    return headerContainer;
}

/**
 * Create host info card
 * Exact V1 positioning: avatar at (62+110, 392+110)
 */
function createHostInfoCard(scene, container) {
    console.log('[RoomScene] Creating host info card');
    console.log('[RoomScene] Room state:', colyseusClient.currentRoom?.state);
    console.log('[RoomScene] Players:', colyseusClient.currentRoom?.state?.players);

    const room = colyseusClient.currentRoom;

    if (!room) {
        console.warn('[RoomScene] No room available for host card');
        return null;
    }

    // ✅ SAFE CHECK
    if (!room.state) {
        console.error('[RoomScene] ❌ Room state is undefined!');
        return null;
    }

    if (!room.state.players) {
        console.error('[RoomScene] ❌ Room state.players is undefined!');
        console.log('[RoomScene] Available state keys:', Object.keys(room.state));
        return null;
    }

    // ✅ CHECK if players is iterable
    const playersMap = room.state.players;

    if (typeof playersMap.forEach !== 'function' && typeof playersMap.entries !== 'function') {
        console.error('[RoomScene] ❌ Players is not iterable!');
        console.log('[RoomScene] Players type:', typeof playersMap);
        console.log('[RoomScene] Players value:', playersMap);
        return null;
    }

    console.log('[RoomScene] ✅ Players map is valid');

    // Find host player
    let hostPlayer = null;
    let hostSessionId = null;

    // ✅ SAFE ITERATION
    try {
        // Try forEach first (MapSchema)
        if (typeof playersMap.forEach === 'function') {
            playersMap.forEach((player, sessionId) => {
                console.log('[RoomScene] Checking player:', sessionId, player);
                if (player && player.role === 'host') {
                    hostPlayer = player;
                    hostSessionId = sessionId;
                }
            });
        }
        // Try entries (Map)
        else if (typeof playersMap.entries === 'function') {
            for (const [sessionId, player] of playersMap.entries()) {
                console.log('[RoomScene] Checking player:', sessionId, player);
                if (player && player.role === 'host') {
                    hostPlayer = player;
                    hostSessionId = sessionId;
                }
            }
        }
    } catch (error) {
        console.error('[RoomScene] Error iterating players:', error);
        return null;
    }

    if (!hostPlayer) {
        console.warn('[RoomScene] No host player found');
        return null;
    }

    const hostCard = scene.add.container(0, 0);

    // Avatar placeholder (will load actual image)
    const avatarBg = scene.add
        .image(62 + 220 / 2, 392 + 220 / 2, "share_btn_back")
        .setOrigin(0.5)
        .setDisplaySize(200, 200)
        .setTint(0x666666);
    hostCard.add(avatarBg);

    // Load actual avatar if available
    if (hostPlayer.avatar && hostPlayer.avatar !== '') {
        const avatarKey = `avatar_${hostPlayer.userId}`;

        if (!scene.textures.exists(avatarKey)) {
            scene.load.image(avatarKey, hostPlayer.avatar);
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

    // Username (exact V1 position)
    const username = scene.add.text(
        306,
        448,
        hostPlayer.name || "Unknown Player",
        {
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
        }
    ).setOrigin(0, 0);
    hostCard.add(username);

    // "Host" label (exact V1 position and color)
    const roleLabel = scene.add.text(
        306,
        524,
        "Host",
        {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#FFCC00", // Yellow for host
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: "#000000",
                blur: 7,
                stroke: true,
                fill: true,
            },
            align: "left",
        }
    ).setOrigin(0, 0);
    hostCard.add(roleLabel);

    container.add(hostCard);

    return {
        container: hostCard,
        avatarBg,
        username,
        roleLabel,
        playerId: hostPlayer.userId,
        sessionId: hostSessionId
    };
}

/**
 * Fallback rendering when state is not available
 * Render host info using session data instead of room state
 */
function createHostInfoCardFallback(scene, container, room, bossId) {
    console.log('[RoomScene] ============================================');
    console.log('[RoomScene] FALLBACK RENDERING MODE');
    console.log('[RoomScene] ============================================');
    console.log('[RoomScene] Using session data instead of room state');

    // Get player data from sessionStorage
    const playerData = {
        userId: sessionStorage.getItem('userId') || 'guest',
        username: sessionStorage.getItem('username') || 'Player',
        avatar: sessionStorage.getItem('avatar') || '',
        characterId: sessionStorage.getItem('selectedCharacter') || 'default',
        level: parseInt(sessionStorage.getItem('playerLevel')) || 1
    };

    console.log('[RoomScene] Player data from session:', playerData);

    // Room info from room object
    const roomCode = room.sessionId || room.id || 'UNKNOWN';

    console.log('[RoomScene] Room code:', roomCode);
    console.log('[RoomScene] Boss ID:', bossId);

    const hostCard = scene.add.container(0, 0);

    // Avatar placeholder (will load actual image)
    const avatarBg = scene.add
        .image(62 + 220 / 2, 392 + 220 / 2, "share_btn_back")
        .setOrigin(0.5)
        .setDisplaySize(200, 200)
        .setTint(0x666666);
    hostCard.add(avatarBg);

    // Load actual avatar if available
    if (playerData.avatar && playerData.avatar !== '') {
        const avatarKey = `avatar_${playerData.userId}`;

        if (!scene.textures.exists(avatarKey)) {
            scene.load.image(avatarKey, playerData.avatar);
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

    // Username (exact V1 position)
    const username = scene.add.text(
        306,
        448,
        playerData.username || "Unknown Player",
        {
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
        }
    ).setOrigin(0, 0);
    hostCard.add(username);

    // "Host" label (exact V1 position and color)
    const roleLabel = scene.add.text(
        306,
        524,
        "Host (You)",
        {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#FFCC00", // Yellow for host
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: "#000000",
                blur: 7,
                stroke: true,
                fill: true,
            },
            align: "left",
        }
    ).setOrigin(0, 0);
    hostCard.add(roleLabel);

    container.add(hostCard);

    console.log('[RoomScene] ✅ Fallback host card created');

    // ✅ SETUP STATE LISTENER để update khi state available
    setupStateFallbackListener(scene, container, room);

    return {
        container: hostCard,
        avatarBg,
        username,
        roleLabel,
        playerId: playerData.userId,
        sessionId: room.sessionId
    };
}

/**
 * Setup listener to update UI when state becomes available
 */
function setupStateFallbackListener(scene, container, room) {
    console.log('[RoomScene] Setting up fallback state listener...');

    room.onStateChange((state) => {
        console.log('[RoomScene] 🔄 State changed in fallback mode:', state);
        console.log('[RoomScene] State type:', state?.constructor?.name);
        console.log('[RoomScene] State properties:', state ? Object.keys(state) : 'NONE');

        // Check if state now has data
        if (state && state.players && Object.keys(state).length > 0) {
            console.log('[RoomScene] ✅ State now available! Reloading scene...');

            // Destroy current container and recreate with full data
            if (container_main) {
                container_main.destroy();
            }

            // Recreate with full data
            createRoomScene(scene, { room: room, bossId: currentRoom?.bossId });

            console.log('[RoomScene] ✅ Scene reloaded with full state');
        } else {
            console.log('[RoomScene] State still empty, waiting...');
        }
    });
}

/**
 * Create room info panel fallback
 */
function createRoomInfoPanelFallback(scene, container, room) {
    console.log('[RoomScene] Creating fallback room info panel');

    const roomCode = room.sessionId || room.id || 'UNKNOWN';
    const infoPanel = scene.add.container(0, 0);

    // Room code (exact V1 position)
    const text_room_code = scene.add.text(
        62,
        634,
        `Room code: ${roomCode}`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    infoPanel.add(text_room_code);

    // Players count (fallback)
    const text_players = scene.add.text(
        62,
        690,
        `Players: 1/2`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    infoPanel.add(text_players);

    // Boss info (fallback)
    const text_bossId = scene.add.text(
        62,
        744,
        `Boss: Loading...`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    infoPanel.add(text_bossId);

    // Battle time (fallback)
    const text_Battle_Time = scene.add.text(
        62,
        794,
        `Battle Time: 00:00:00`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    infoPanel.add(text_Battle_Time);

    container.add(infoPanel);

    return {
        container: infoPanel,
        roomCode: text_room_code,
        playersCount: text_players,
        bossInfo: text_bossId,
        battleTime: text_Battle_Time
    };
}

/**
 * Create status display fallback
 */
function createStatusDisplayFallback(scene, container, room) {
    const statusMap = {
        0: "waiting",     // WAITING
        1: "in battle",   // PLAYING
        2: "ended"        // ENDED
    };

    const phase = room.state?.phase || 0;
    const text_status = scene.add.text(
        960,
        433,
        `Status: ${statusMap[phase] || "loading..."}`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
        }
    ).setOrigin(1, 0);

    container.add(text_status);

    return text_status;
}

/**
 * Create play button fallback
 */
function createPlayButtonFallback(scene, container, room) {
    const btnContainer = scene.add.container(0, 0);

    // Button background (create with V1 dimensions)
    const btn_play = createButton0(
        scene,
        btnContainer,
        686 + 328 / 2,
        641 + 86 / 2,
        "Play"
    );

    // Initially disabled in fallback mode
    btn_play.button.setAlpha(0.5);
    btn_play.button.setTint(0x666666);

    // Click handler (show message in fallback mode)
    btn_play.button.on("pointerdown", function () {
        console.log('[RoomScene] Play clicked in fallback mode');
        CreateAlertPopup(scene, 'Waiting for room data to load... Please wait.');
    });

    container.add(btnContainer);

    return btn_play;
}

/**
 * Create guest info card (positioned below host)
 * Will be shown/hidden dynamically
 */
function createGuestInfoCard(scene, container) {
    const room = colyseusClient.currentRoom;

    if (!room) {
        return null;
    }

    // ✅ SAFE CHECK
    if (!room.state || !room.state.players) {
        console.log('[RoomScene] No state or players available for guest card');
        return null;
    }

    // Find guest player with safe iteration
    let guestPlayer = null;
    let guestSessionId = null;

    try {
        const playersMap = room.state.players;

        // Try forEach first (MapSchema)
        if (typeof playersMap.forEach === 'function') {
            playersMap.forEach((player, sessionId) => {
                if (player && player.role === 'guest') {
                    guestPlayer = player;
                    guestSessionId = sessionId;
                }
            });
        }
        // Try entries (Map)
        else if (typeof playersMap.entries === 'function') {
            for (const [sessionId, player] of playersMap.entries()) {
                if (player && player.role === 'guest') {
                    guestPlayer = player;
                    guestSessionId = sessionId;
                }
            }
        }
    } catch (error) {
        console.error('[RoomScene] Error finding guest player:', error);
        return null;
    }

    if (!guestPlayer) {
        console.log('[RoomScene] No guest player yet');
        return null;
    }

    const guestCard = scene.add.container(0, 0);

    // Avatar placeholder (positioned below host)
    const avatarBg = scene.add
        .image(62 + 220 / 2, 392 + 220 / 2 + 250, "share_btn_back")
        .setOrigin(0.5)
        .setDisplaySize(200, 200)
        .setTint(0x666666);
    guestCard.add(avatarBg);

    // Load actual avatar if available
    if (guestPlayer.avatar && guestPlayer.avatar !== '') {
        const avatarKey = `avatar_${guestPlayer.userId}`;

        if (!scene.textures.exists(avatarKey)) {
            scene.load.image(avatarKey, guestPlayer.avatar);
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

    // Username (below host)
    const username = scene.add.text(
        306,
        448 + 250,
        guestPlayer.name || "Unknown Player",
        {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: "#00FF44", // Green for guest
                blur: 7,
                stroke: true,
                fill: true,
            },
            align: "left",
        }
    ).setOrigin(0, 0);
    guestCard.add(username);

    // "Guest" label (green color)
    const roleLabel = scene.add.text(
        306,
        524 + 250,
        "Guest",
        {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#00FF44", // Green for guest
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: "#000000",
                blur: 7,
                stroke: true,
                fill: true,
            },
            align: "left",
        }
    ).setOrigin(0, 0);
    guestCard.add(roleLabel);

    container.add(guestCard);

    return {
        container: guestCard,
        avatarBg,
        username,
        roleLabel,
        playerId: guestPlayer.userId,
        sessionId: guestSessionId
    };
}

/**
 * Create room info panel
 * Shows: Room code, Players, Boss, Battle Time
 * Matches V1 exact positioning
 */
function createRoomInfoPanel(scene, container) {
    const room = colyseusClient.currentRoom;

    if (!room) {
        return null;
    }

    // ✅ SAFE STATE ACCESS
    if (!room.state) {
        console.warn('[RoomScene] No state available for room info panel');
        return createRoomInfoPanelFallback(scene, container, room);
    }

    const state = room.state;
    const infoPanel = scene.add.container(0, 0);

    // Room code (exact V1 position) - fallback to room.id if state.roomCode undefined
    const roomCode = state.roomCode || room.id || room.sessionId || "N/A";
    const text_room_code = scene.add.text(
        62,
        634,
        `Room code: ${roomCode}`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    infoPanel.add(text_room_code);

    // Players count (exact V1 position) - safe access with fallback
    let playersCount = 0;
    if (state.players && typeof state.players.size === 'number') {
        playersCount = state.players.size;
    } else if (state.players && typeof state.players.length === 'number') {
        playersCount = state.players.length;
    }

    const text_players = scene.add.text(
        62,
        690,
        `Players: ${playersCount}/2`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    infoPanel.add(text_players);

    // Boss info (exact V1 position) - safe access
    const bossName = state.boss?.name || "Unknown";
    const text_bossId = scene.add.text(
        62,
        744,
        `Boss: ${bossName}`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    infoPanel.add(text_bossId);

    // Battle time (convert ms to HH:MM:SS, exact V1 position)
    const battleTimeText = formatSecondsToHMS(state.battleDuration / 1000);
    const text_Battle_Time = scene.add.text(
        62,
        794,
        `Battle Time: ${battleTimeText}`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        }
    ).setOrigin(0, 0);
    infoPanel.add(text_Battle_Time);

    container.add(infoPanel);

    return {
        container: infoPanel,
        roomCode: text_room_code,
        playersCount: text_players,
        bossInfo: text_bossId,
        battleTime: text_Battle_Time
    };
}

/**
 * Create timer display (countdown)
 * Exact V1 position: top right (960, 389)
 */
function createTimerDisplay(scene, container) {
    const timerText = scene.add.text(
        960,
        389,
        "00:00:00",
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
        }
    ).setOrigin(1, 0);

    container.add(timerText);

    return timerText;
}

/**
 * Create status display
 * Exact V1 position: below timer (960, 433)
 */
function createStatusDisplay(scene, container) {
    const room = colyseusClient.currentRoom;

    if (!room) {
        return null;
    }

    const statusMap = {
        0: "waiting",     // WAITING
        1: "in battle",   // PLAYING
        2: "ended"        // ENDED
    };

    // Safe phase access with fallback
    const phase = room.state?.phase ?? 0;
    const text_status = scene.add.text(
        960,
        433,
        `Status: ${statusMap[phase] || "loading..."}`,
        {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
        }
    ).setOrigin(1, 0);

    container.add(text_status);

    return text_status;
}

/**
 * Create Play button (host only)
 * Exact V1 position: (686+164, 641+43)
 */
function createPlayButton(scene, container) {
    const room = colyseusClient.currentRoom;

    if (!room) {
        return null;
    }

    // Check if current user is host
    const isHost = checkIfHost(room);

    if (!isHost) {
        console.log('[RoomScene] Not host, no Play button');
        return null;
    }

    const btnContainer = scene.add.container(0, 0);

    // Button background (create with V1 dimensions)
    const btn_play = createButton0(
        scene,
        btnContainer,
        686 + 328 / 2,
        641 + 86 / 2,
        "Play"
    );

    // Click handler
    btn_play.button.on("pointerdown", function () {
        if (btn_play.button.alpha === 1) {  // Enabled
            console.log('[RoomScene] Play clicked - starting battle');

            // Send ready message to start battle
            room.send('ready');
        }
    });

    // Initially disabled if not all ready
    updatePlayButtonState(btn_play, room);

    container.add(btnContainer);

    return btn_play;
}

/**
 * Create button helper (matches V1 style)
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
                    scaleX: 1.2,
                    scaleY: 1.2,
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
                fontSize: "48px",
                color: "#FFF",
                align: "center",
            }
        )
        .setOrigin(0.5, 0);

    btn_inner_container.add(text);

    return btn_container;
}

/**
 * Setup Colyseus state listeners for real-time sync
 */
function setupColyseusListeners(scene, container, roomData, elements) {
    const room = colyseusClient.currentRoom;

    if (!room) {
        console.error('[RoomScene] No room for setup listeners');
        return;
    }

    console.log('[RoomScene] Setting up Colyseus listeners');

    // ✅ SAFE STATE ACCESS - Check if state and players exist
    if (!room.state || !room.state.players) {
        console.warn('[RoomScene] State or players not available, using fallback listener setup');
        // Set up a basic listener to wait for state
        room.onStateChange((state) => {
            if (state && state.players) {
                console.log('[RoomScene] State now available, setting up full listeners');
                setupColyseusListeners(scene, container, roomData, elements);
            }
        });
        return;
    }

    try {
        // 1. Listen for player join
        if (typeof room.state.players.onAdd === 'function') {
            room.state.players.onAdd((player, sessionId) => {
                console.log('[RoomScene] Player joined:', player.name, player.role);

                if (player.role === 'guest' && !elements.guestCard) {
                    // Create guest card dynamically
                    elements.guestCard = createGuestInfoCard(scene, container);
                }

                // Update players count
                updatePlayersCount(elements);

                // Update play button state
                if (elements.playButton) {
                    updatePlayButtonState(elements.playButton, room);
                }

                // Listen for this player's ready status
                if (player && typeof player.listen === 'function') {
                    player.listen('isReady', (ready) => {
                        console.log('[RoomScene] Player ready status:', player.name, ready);

                        // Update play button state
                        if (elements.playButton) {
                            updatePlayButtonState(elements.playButton, room);
                        }
                    });
                }
            });
        }

        // 2. Listen for player leave
        if (typeof room.state.players.onRemove === 'function') {
            room.state.players.onRemove((player, sessionId) => {
                console.log('[RoomScene] Player left:', player.name);

                if (player.role === 'guest' && elements.guestCard) {
                    // Remove guest card
                    elements.guestCard.container.destroy();
                    elements.guestCard = null;
                }

                // Update players count
                updatePlayersCount(elements);

                // Update play button state
                if (elements.playButton) {
                    updatePlayButtonState(elements.playButton, room);
                }
            });
        }

        // 3. Listen for battle phase changes
        if (typeof room.state.listen === 'function') {
            room.state.listen('phase', (newPhase, oldPhase) => {
                console.log('[RoomScene] Phase changed:', oldPhase, '→', newPhase);

                const statusMap = {
                    0: 'waiting',
                    1: 'in battle',
                    2: 'ended'
                };

                // Update status text
                if (elements.statusText) {
                    elements.statusText.setText(`Status: ${statusMap[newPhase] || 'loading...'}`);
                }

                if (newPhase === 1) {  // PLAYING
                    // Hide Play button
                    if (elements.playButton) {
                        elements.playButton.container.setVisible(false);
                    }

                    // Start timer
                    startBattleTimer(scene, elements.timerText, room);
                } else if (newPhase === 2) {  // ENDED
                    // Stop timer
                    stopBattleTimer();

                    // Show battle results
                    // TODO: Navigate to results scene
                    CreateAlertPopup(scene, 'Battle ended!');
                }
            });
        }

        // 4. Listen for boss changes (if any)
        if (room.state.boss && typeof room.state.boss.listen === 'function') {
            room.state.boss.listen('hp', (newHp) => {
                // Update boss HP display if needed
                console.log('[RoomScene] Boss HP changed:', newHp);
            });
        }
    } catch (error) {
        console.error('[RoomScene] Error setting up listeners:', error);
    }

    // 5. Listen for room messages
    room.onMessage('*', (type, message) => {
        console.log('[RoomScene] Room message:', type, message);

        switch (type) {
            case 'battle-started':
                console.log('[RoomScene] Battle started message received');
                break;
            case 'battle-ended':
                console.log('[RoomScene] Battle ended message received');
                break;
            default:
                break;
        }
    });

    // 6. Listen for room errors
    room.onError((code, message) => {
        console.error('[RoomScene] Room error:', code, message);
        CreateAlertPopup(scene, `Room error: ${message}`);
    });

    // 7. Listen for leave
    room.onLeave((code) => {
        console.log('[RoomScene] Left room:', code);
        stopBattleTimer();

        // Clean up and return to Home scene
        destroyRoomScene();
        scene.scene.resume('Home');
    });
}

/**
 * Start battle timer countdown
 */
function startBattleTimer(scene, timerText, room) {
    stopBattleTimer(); // Clear any existing timer

    timerInterval = setInterval(() => {
        if (!timerText || !timerText.scene) {
            stopBattleTimer();
            return;
        }

        // ✅ SAFE STATE ACCESS
        if (!room.state || room.state.phase !== 1) {  // Not PLAYING
            stopBattleTimer();
            return;
        }

        try {
            const elapsed = Date.now() - (room.state.startTime || Date.now());
            const remaining = (room.state.battleDuration || 300000) - elapsed; // Default 5 minutes

            if (remaining <= 0) {
                timerText.setText('00:00:00');
                stopBattleTimer();
                return;
            }

            const formatted = formatMillisecondsToHMS(remaining);
            timerText.setText(formatted);
        } catch (error) {
            console.error('[RoomScene] Error updating timer:', error);
            timerText.setText('00:00:00');
            stopBattleTimer();
        }
    }, 1000);
}

/**
 * Stop battle timer
 */
function stopBattleTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Check if current user is host
 */
function checkIfHost(room) {
    const currentSessionId = room.sessionId;

    // ✅ SAFE CHECK
    if (!room.state || !room.state.players) {
        console.warn('[RoomScene] No state or players available for host check');
        return false; // Assume not host if state not available
    }

    let isHost = false;
    try {
        const playersMap = room.state.players;

        // Try forEach first (MapSchema)
        if (typeof playersMap.forEach === 'function') {
            playersMap.forEach((player, sessionId) => {
                if (sessionId === currentSessionId && player && player.role === 'host') {
                    isHost = true;
                }
            });
        }
        // Try entries (Map)
        else if (typeof playersMap.entries === 'function') {
            for (const [sessionId, player] of playersMap.entries()) {
                if (sessionId === currentSessionId && player && player.role === 'host') {
                    isHost = true;
                    break;
                }
            }
        }
    } catch (error) {
        console.error('[RoomScene] Error checking host status:', error);
        return false;
    }

    return isHost;
}

/**
 * Update Play button enabled/disabled state
 */
function updatePlayButtonState(btnPlay, room) {
    if (!btnPlay || !btnPlay.button) {
        return;
    }

    // ✅ SAFE CHECK
    if (!room.state || !room.state.players) {
        console.warn('[RoomScene] No state or players available for play button update');
        // Keep button disabled in fallback mode
        btnPlay.button.setAlpha(0.5);
        btnPlay.button.setTint(0x666666);
        return;
    }

    // Check if all players are ready
    let allReady = true;
    let playerCount = 0;

    try {
        const playersMap = room.state.players;

        // Try forEach first (MapSchema)
        if (typeof playersMap.forEach === 'function') {
            playersMap.forEach((player) => {
                if (player) {
                    playerCount++;
                    if (!player.isReady) {
                        allReady = false;
                    }
                }
            });
        }
        // Try entries (Map)
        else if (typeof playersMap.entries === 'function') {
            for (const [sessionId, player] of playersMap.entries()) {
                if (player) {
                    playerCount++;
                    if (!player.isReady) {
                        allReady = false;
                    }
                }
            }
        }
    } catch (error) {
        console.error('[RoomScene] Error updating play button state:', error);
        btnPlay.button.setAlpha(0.5);
        btnPlay.button.setTint(0x666666);
        return;
    }

    // Need at least 2 players and all ready
    const canPlay = playerCount >= 2 && allReady;

    if (canPlay) {
        btnPlay.button.setAlpha(1);
        btnPlay.button.setTint(0xffffff);
    } else {
        btnPlay.button.setAlpha(0.5);
        btnPlay.button.setTint(0x666666);
    }
}

/**
 * Update players count text
 */
function updatePlayersCount(elements) {
    if (elements.roomInfo && elements.roomInfo.playersCount) {
        const room = colyseusClient.currentRoom;
        if (room) {
            // ✅ SAFE ACCESS to players count
            let playersCount = 0;
            if (room.state && room.state.players) {
                if (typeof room.state.players.size === 'number') {
                    playersCount = room.state.players.size;
                } else if (typeof room.state.players.length === 'number') {
                    playersCount = room.state.players.length;
                }
            }
            elements.roomInfo.playersCount.setText(`Players: ${playersCount}/2`);
        }
    }
}

/**
 * Leave room and cleanup
 */
function leaveRoom(scene) {
    console.log('[RoomScene] Leaving room');

    stopBattleTimer();

    const room = colyseusClient.currentRoom;
    if (room) {
        room.leave();
    }

    destroyRoomScene();
    scene.scene.resume('Home');
}

/**
 * Destroy room scene and clean up
 */
export function destroyRoomScene() {
    stopBattleTimer();

    if (container_main) {
        container_main.destroy();
        container_main = null;
    }

    currentScene = null;
    currentRoom = null;
    uiElements = null;
}

/**
 * Format seconds to HH:MM:SS (matches V1 format)
 */
function formatSecondsToHMS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

/**
 * Format milliseconds to HH:MM:SS
 */
function formatMillisecondsToHMS(ms) {
    return formatSecondsToHMS(ms / 1000);
}

/**
 * Pad number with leading zero
 */
function pad(num) {
    return num.toString().padStart(2, '0');
}

/**
 * Show error popup
 */
function showErrorPopup(scene, message) {
    console.error('[RoomScene] Showing error popup:', message);

    // Create semi-transparent overlay
    const overlay = scene.add.rectangle(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2,
        scene.cameras.main.width,
        scene.cameras.main.height,
        0x000000,
        0.7
    );

    // Error box
    const errorBox = scene.add.rectangle(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2,
        600,
        300,
        0x330000
    );

    // Error text
    const errorText = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 - 50,
        '❌ Error',
        {
            fontSize: '36px',
            fontFamily: 'Russo One',
            color: '#ff0000'
        }
    ).setOrigin(0.5);

    const messageText = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2,
        message,
        {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 550 }
        }
    ).setOrigin(0.5);

    // OK button
    const okButton = scene.add.rectangle(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 + 80,
        200,
        60,
        0x666666
    ).setInteractive({ useHandCursor: true });

    const okText = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 + 80,
        'OK',
        {
            fontSize: '28px',
            fontFamily: 'Russo One',
            color: '#ffffff'
        }
    ).setOrigin(0.5);

    okButton.on('pointerdown', () => {
        overlay.destroy();
        errorBox.destroy();
        errorText.destroy();
        messageText.destroy();
        okButton.destroy();
        okText.destroy();

        // Go back to previous scene
        if (currentScene) {
            currentScene.scene.resume('Home');
        }
    });
}

/**
 * Public API for other scenes
 */
export default {
    createRoomScene,
    destroyRoomScene,
    leaveRoom
};
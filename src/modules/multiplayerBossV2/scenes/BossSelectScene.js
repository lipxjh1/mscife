/**
 * Boss Selection Scene for Multiplayer Boss V2
 *
 * Copied and modified from HomeBattleMultiplayerBoss.js
 * Replaced Socket.IO logic with Colyseus client
 */

import roomService from "../services/roomService.js";
import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../../game/scenes/Share/AlertPopup.js";
import cdLocalization from "../../../game/Data/CenterDataLocalization.js";

let container_main = null;
let container_popup = null;
let container_list = null;
let isOpen = false;

/**
 * Create Boss Selection Scene
 * @param {Phaser.Scene} scene - Current scene
 */
export function createBossSelectScene(scene) {
    console.log("[BossSelectScene] Creating boss selection scene");

    isOpen = true;
    CreateLoadingPopup();

    // Use direct assets loading instead of AssetLoadingManager for simplicity
    setTimeout(() => {
        HideLoadingPopup();
        assetsLoadDone(scene);
    }, 500);
}

/**
 * Called when assets are loaded
 * @param {Phaser.Scene} scene - Current scene
 */
function assetsLoadDone(scene) {
    destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    // Background
    const bg = scene.add
        .image(0, 0, "home_battle_multiplayer_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    container_main.add(bg);

    // Main container
    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    // Buttons container
    const container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    // Create close button
    const btn_close = scene.add
        .image(38 + 32 / 2, 266 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {
            closeBossSelect(scene);
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

    container_buttons.add(btn_close);

    // Create boss list
    createBossList(scene);

    // Title
    const title = scene.add.text(
        540,
        100,
        "Select Boss Battle",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "48px",
            color: "#FFFFFF",
            align: "center",
            stroke: "#000000",
            strokeThickness: 6
        }
    ).setOrigin(0.5);

    container_main.add(title);
}

/**
 * Create boss selection list
 * @param {Phaser.Scene} scene - Current scene
 */
function createBossList(scene) {
    container_list = scene.add.container(0, 0);
    container_popup.add(container_list);

    const scrollViewWidth = 1080;
    const scrollViewHeight = 1554;
    const columns = 1;
    const itemSpacing = 42;

    const posX = 38 + scrollViewWidth / 2;
    const posY = 366 + scrollViewHeight / 2;

    // Create scrollable panel
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
                    row: 5,
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
                bottom: 293 * 0.1,
            },
        })
        .layout();

    container_list.add(scrollablePanel);

    // Create boss items
    createBossItems(scene, scrollablePanel);

    scrollablePanel.layout();

    // Create mask for scrollable panel
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

/**
 * Create boss items in the scrollable panel
 * @param {Phaser.Scene} scene - Current scene
 * @param {RexUI.ScrollablePanel} scrollablePanel - Panel to add items to
 */
function createBossItems(scene, scrollablePanel) {
    const bosses = roomService.getAllBosses();

    bosses.forEach((boss, index) => {
        const bossItem = createBossItem(scene, scrollablePanel, boss);
        bossItem.setTurnStartEnd(0, 5);

        // Make all bosses enabled for V2 demo
        if (boss.id === "fire-dragon-1" || boss.id === "ice-golem-2") {
            // Enable first two bosses
        } else {
            // Keep others enabled for testing
        }

        bossItem.btn_create.button.on("pointerdown", function () {
            createRoomWithBoss(scene, boss.id);
        });
    });
}

/**
 * Create a single boss item
 * @param {Phaser.Scene} scene - Current scene
 * @param {RexUI.ScrollablePanel} scrollablePanel - Panel to add item to
 * @param {Object} bossData - Boss data
 * @returns {Object} Boss item object
 */
function createBossItem(scene, scrollablePanel, bossData) {
    let itemWidth = 1034;
    let itemHeight = 368;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);
    item.bossId = bossData.id;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    // Background based on boss element
    const bgAssetMap = {
        "fire-dragon-1": "home_battle_item_bg_campain_earth", // Use earth as fallback
        "ice-golem-2": "home_battle_item_bg_campain_space",
        "thunder-eagle-3": "home_battle_item_bg_campain_mars",
        "shadow-beast-4": "home_battle_item_bg_campain_back_to_earth",
        "light-angel-5": "home_battle_item_bg_campain_xcorp"
    };

    item.bg = scene.add
        .image(0, 0, bgAssetMap[bossData.id] || "home_battle_item_bg_campain")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    // Level text
    item.text_level = scene.add
        .text(974, 35, `Lv.${bossData.level}`, {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#CCCCCC",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
        })
        .setOrigin(1, 0);
    container_inner.add(item.text_level);

    // Boss name
    item.text_name = scene.add
        .text(38, 35, bossData.name, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "52px",
            color: "#CCCCCC",
            align: "left",
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_name);

    // Boss stats
    item.text_stats = scene.add
        .text(38, 100, `HP: ${bossData.hp.toLocaleString()} | ATK: ${bossData.attack}`, {
            fontFamily: "Russo One",
            fontSize: "28px",
            color: "#FFD700",
            align: "left",
            stroke: "#000000",
            strokeThickness: 4,
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_stats);

    // Turn display
    item.turnStart = 0;
    item.turnEnd = 0;

    item.setTurnStartEnd = function (tStart, tEnd) {
        item.turnStart = tStart;
        item.turnEnd = tEnd;

        const formattedStart = String(item.turnStart).padStart(2, "0");
        const formattedEnd = String(item.turnEnd).padStart(2, "0");

        // Update level text to show turn info
        item.text_level.setText(`${formattedStart}/${formattedEnd}`);
    };

    // Create room button
    const btn_create = createFightButton(
        scene,
        container_inner,
        746 + 248 / 2,
        110 + 78 / 2,
        "home_battle_btn",
        "Create Room"
    );
    item.btn_create = btn_create;

    // Lock button (for disabled bosses)
    const btn_lock = createFightButton(
        scene,
        container_inner,
        746 + 248 / 2,
        110 + 78 / 2,
        "home_battle_btn_lock",
        "Create Room"
    );
    item.btn_lock = btn_lock;
    btn_lock.setVisible(false);

    // Set active state
    item.setActive = function (boolVal) {
        if (boolVal) {
            btn_create.setVisible(true);
            btn_create.button.setInteractive(true);
            btn_lock.setVisible(false);
        } else {
            btn_create.setVisible(false);
            btn_create.button.disableInteractive();
            btn_lock.setVisible(true);
        }
    };

    // Add to scrollable panel
    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

/**
 * Create fight button
 * @param {Phaser.Scene} scene - Current scene
 * @param {Phaser.GameObjects.Container} container - Container to add button to
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} imageKey - Image asset key
 * @param {string} buttonName - Button text
 * @returns {Phaser.GameObjects.Container} Button container
 */
function createFightButton(scene, container, x, y, imageKey, buttonName) {
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
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
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
                fontFamily: cdLocalization.getCurrentFont(),
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
 * Create room with selected boss
 * @param {Phaser.Scene} scene - Current scene
 * @param {string} bossId - Selected boss ID
 */
async function createRoomWithBoss(scene, bossId) {
    console.log('[BossSelectScene] ============================================');
    console.log('[BossSelectScene] CREATE ROOM WITH BOSS');
    console.log('[BossSelectScene] ============================================');
    console.log('[BossSelectScene] Boss ID:', bossId);

    try {
        CreateLoadingPopup();

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

        console.log('[BossSelectScene] Player data:', playerData);
        console.log('[BossSelectScene] Calling roomService.createRoom()...');

        const result = await roomService.createRoom(bossId, playerData);

        console.log('[BossSelectScene] Room service returned:', result);

        if (result.success) {
            console.log('[BossSelectScene] ✅ Room created successfully!');
            console.log('[BossSelectScene] Room object:', result.room);
            console.log('[BossSelectScene] Room code:', result.roomCode);

            // ✅ Validate room code (now from room.id)
            if (!result.roomCode || result.roomCode === 'UNKNOWN') {
                console.error('[BossSelectScene] ❌ Invalid room code!');
                console.error('[BossSelectScene] Room ID:', result.room?.id);
                console.error('[BossSelectScene] Session ID:', result.room?.sessionId);
                HideLoadingPopup();
                CreateAlertPopup(scene, "Room created but code is invalid. Please try again.");
                return;
            }

            console.log('[BossSelectScene] ✅ Room code validated:', result.roomCode);
            console.log('[BossSelectScene] Navigating to RoomScene...');

            HideLoadingPopup();
            closeBossSelect(scene);

            import("./RoomScene.js").then(module => {
                console.log('[BossSelectScene] RoomScene module loaded');
                module.createRoomScene(scene, {
                    room: result.room,
                    bossId: bossId
                });
            }).catch(error => {
                console.error('[BossSelectScene] Failed to load RoomScene:', error);
                CreateAlertPopup(scene, "Failed to load room scene");
            });

        } else {
            console.error('[BossSelectScene] ❌ Room creation failed');

            // ✅ Safe error extraction
            const errorMsg = result.error || 'Unknown error occurred';
            const errorType = result.errorType || 'Unknown';

            console.error('[BossSelectScene] Error:', errorMsg);
            console.error('[BossSelectScene] Error type:', errorType);

            HideLoadingPopup();

            // ✅ User-friendly error messages
            let userMessage = 'Failed to create room. ';

            if (result.isNetworkError) {
                userMessage = 'Cannot connect to server. Please check your connection.';
            } else if (result.isTimeout) {
                userMessage = 'Server connection timeout. Please try again.';
            } else if (errorMsg && errorMsg.includes('Failed to fetch')) {
                userMessage = 'Cannot reach server. Please try again later.';
            } else if (errorMsg && errorMsg.includes('timeout')) {
                userMessage = 'Server connection timeout. Please try again.';
            } else if (errorMsg && errorMsg.includes('ERR_FAILED')) {
                userMessage = 'Server is not responding. Please try again later.';
            } else {
                userMessage = errorMsg;
            }

            CreateAlertPopup(scene, userMessage);
        }

    } catch (error) {
        console.error('[BossSelectScene] ============================================');
        console.error('[BossSelectScene] ❌ EXCEPTION IN CREATE ROOM');
        console.error('[BossSelectScene] ============================================');
        console.error('[BossSelectScene] Error:', error);
        console.error('[BossSelectScene] Stack:', error.stack);

        HideLoadingPopup();
        CreateAlertPopup(scene, "An error occurred while creating room");
    }
}

/**
 * Close boss selection scene
 * @param {Phaser.Scene} scene - Current scene
 */
function closeBossSelect(scene) {
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
    container_popup = null;
    container_list = null;
}

/**
 * Check if scene is open
 * @returns {boolean} Scene open status
 */
export function isBossSelectOpen() {
    return isOpen;
}
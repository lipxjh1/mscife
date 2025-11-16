import cdLocalization from "../../../game/Data/CenterDataLocalization.js";
import roomService from "../services/roomService.js";
import { CreateAlertPopup } from "../../../game/scenes/Share/AlertPopup.js";

/**
 * Create Battle Section UI Component for Multiplayer Boss V2
 *
 * @param {Phaser.Scene} scene - The current scene
 * @param {RexUI.ScrollablePanel} scrollablePanel - The scrollable panel to add this section to
 */
export function createBattleSection(scene, scrollablePanel) {
    // Exact dimensions from scan
    let itemWidth = 1004;
    let itemHeight = 293;

    // Create main container with exact pattern
    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    // Create inner container with exact positioning pattern
    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);

    // Add background - reuse existing asset
    const bg = scene.add
        .image(0, 0, "home_battle_item_bg_boss")
        .setOrigin(0, 0);
    container_inner.add(bg);

    // Add "NEW" badge at exact position
    const badge = scene.add
        .text(950, 35, "NEW", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#00FF44",
            backgroundColor: "#000000",
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        })
        .setOrigin(0, 0);
    container_inner.add(badge);

    // Add title at exact position
    const text_mode = scene.add
        .text(
            38,
            35,
            "Multiplayer Boss V2",
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "52px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_mode);

    // Add description at exact position
    const text_info = scene.add
        .text(
            38,
            102,
            "Colyseus-powered real-time battles",
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#CCCCCC",
                align: "left",
                wordWrap: { width: 618, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_info);

    // Create three buttons with exact spacing pattern from Multiplayer section
    // Right button: "Create"
    const btn_create = createOptionsButton(
        scene,
        container_inner,
        746 + 248 / 2,  // X position
        199 + 78 / 2,   // Y position
        "home_battle_btn",
        "Create"
    );
    btn_create.button.on("pointerdown", function () {
        console.log("Multiplayer Boss V2: Create Room clicked");
        // CHANGED: Implement create room functionality
        import("../scenes/BossSelectScene.js").then(module => {
            module.createBossSelectScene(scene);
        }).catch(error => {
            console.error("Failed to load BossSelectScene:", error);
        });
    });

    // Middle button: "Join"
    const btn_join = createOptionsButton(
        scene,
        container_inner,
        476 + 248 / 2,  // X position
        199 + 78 / 2,   // Y position
        "home_battle_btn",
        "Join"
    );
    btn_join.button.on("pointerdown", function () {
        console.log("Multiplayer Boss V2: Join Room clicked");
        // CHANGED: Implement join room functionality
        showJoinRoomPopup(scene);
    });

    // Left button: "Rooms"
    const btn_rooms = createOptionsButton(
        scene,
        container_inner,
        206 + 248 / 2,  // X position
        199 + 78 / 2,   // Y position
        "home_battle_btn",
        "Rooms"
    );
    btn_rooms.button.on("pointerdown", function () {
        console.log("Multiplayer Boss V2: Room List clicked");
        // CHANGED: Implement room list functionality
        import("../scenes/RoomListScene.js").then(module => {
            module.createRoomListScene(scene);
        }).catch(error => {
            console.error("Failed to load RoomListScene:", error);
        });
    });

    // Add to scrollable panel using exact pattern
    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });
}

/**
 * Create Options Button - Exact copy of pattern from HomeBattle.js
 *
 * @param {Phaser.Scene} scene - The current scene
 * @param {Phaser.GameObjects.Container} container - Container to add button to
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} imageKey - Image asset key
 * @param {string} buttonName - Button text name
 * @returns {Phaser.GameObjects.Container} Button container
 */
function createOptionsButton(scene, container, x, y, imageKey, buttonName) {
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
            buttonName, // Using direct text instead of localization for V2
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
 * Show Join Room Popup
 * @param {Phaser.Scene} scene - Current scene
 */
function showJoinRoomPopup(scene) {
    // Create popup container
    const popupContainer = scene.add.container(0, 0);
    popupContainer.setDepth(1000);

    // Semi-transparent background
    const bgOverlay = scene.add.rectangle(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2,
        scene.cameras.main.width,
        scene.cameras.main.height,
        0x000000,
        0.7
    );
    bgOverlay.setInteractive();
    popupContainer.add(bgOverlay);

    // Popup background
    const popupBg = scene.add.rectangle(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2,
        600,
        400,
        0x1a1a2e
    );
    popupContainer.add(popupBg);

    // Title
    const title = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 - 150,
        "Join Room",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "48px",
            color: "#FFFFFF",
            align: "center"
        }
    ).setOrigin(0.5);
    popupContainer.add(title);

    // Input field background
    const inputBg = scene.add.rectangle(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 - 20,
        400,
        60,
        0x16213e
    );
    popupContainer.add(inputBg);

    // Create HTML input for room code
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Enter 3-digit room code';
    inputElement.maxLength = 3;
    inputElement.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -60px);
        width: 380px;
        height: 40px;
        font-size: 24px;
        text-align: center;
        background: #16213e;
        color: white;
        border: 2px solid #0f3460;
        border-radius: 8px;
        outline: none;
        z-index: 10000;
    `;

    document.body.appendChild(inputElement);
    inputElement.focus();

    // Join button
    const joinBtn = scene.add.rectangle(
        scene.cameras.main.width / 2 - 100,
        scene.cameras.main.height / 2 + 80,
        150,
        50,
        0x00b4d8
    ).setInteractive({ useHandCursor: true });
    popupContainer.add(joinBtn);

    const joinText = scene.add.text(
        scene.cameras.main.width / 2 - 100,
        scene.cameras.main.height / 2 + 80,
        "Join",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFFFFF",
            align: "center"
        }
    ).setOrigin(0.5);
    popupContainer.add(joinText);

    // Cancel button
    const cancelBtn = scene.add.rectangle(
        scene.cameras.main.width / 2 + 100,
        scene.cameras.main.height / 2 + 80,
        150,
        50,
        0xef476f
    ).setInteractive({ useHandCursor: true });
    popupContainer.add(cancelBtn);

    const cancelText = scene.add.text(
        scene.cameras.main.width / 2 + 100,
        scene.cameras.main.height / 2 + 80,
        "Cancel",
        {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFFFFF",
            align: "center"
        }
    ).setOrigin(0.5);
    popupContainer.add(cancelText);

    // Button hover effects
    [joinBtn, cancelBtn].forEach(btn => {
        btn.on("pointerover", () => {
            scene.tweens.add({
                targets: btn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });

        btn.on("pointerout", () => {
            scene.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });
    });

    // Event handlers
    joinBtn.on("pointerdown", async () => {
        const roomCode = inputElement.value.trim();

        if (!roomCode) {
            CreateAlertPopup(scene, "Please enter a room code");
            return;
        }

        if (!roomService.validateRoomCode(roomCode)) {
            CreateAlertPopup(scene, "Room code must be 3 digits");
            return;
        }

        // Disable buttons and show loading
        joinBtn.disableInteractive();
        cancelBtn.disableInteractive();

        try {
            const result = await roomService.joinRoom(roomCode);

            if (result.success) {
                cleanup();
                // Navigate to room scene
                import("../scenes/RoomScene.js").then(module => {
                    module.createRoomScene(scene, result.room);
                }).catch(error => {
                    console.error("Failed to load RoomScene:", error);
                });
            } else {
                CreateAlertPopup(scene, result.error || "Failed to join room");
            }
        } catch (error) {
            console.error("Join room error:", error);
            CreateAlertPopup(scene, "Failed to join room");
        }

        // Re-enable buttons
        joinBtn.setInteractive({ useHandCursor: true });
        cancelBtn.setInteractive({ useHandCursor: true });
    });

    cancelBtn.on("pointerdown", cleanup);
    bgOverlay.on("pointerdown", cleanup);

    // Cleanup function
    function cleanup() {
        if (inputElement.parentNode) {
            inputElement.parentNode.removeChild(inputElement);
        }
        popupContainer.destroy();
    }

    // Enter key support
    inputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinBtn.emit('pointerdown');
        }
    });

    // Cleanup on scene shutdown
    scene.events.once('shutdown', cleanup);
}
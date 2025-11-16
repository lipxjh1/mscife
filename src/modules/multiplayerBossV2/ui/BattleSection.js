import cdLocalization from "../../../game/Data/CenterDataLocalization.js";

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
        // TODO: Implement create room functionality
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
        // TODO: Implement join room functionality
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
        // TODO: Implement room list functionality
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
import ProgressBar from "../Gameplay/ProgressBar.js";

let container_main = null;
let healthBar = null;
let shieldBar = null;
let text_timer = null;

export function CreateTopBar(scene) {
    container_main = scene.add.container(0, 0).setDepth(100);

    let bg = scene.add.image(540, 0, "gameplay_top_bar_bg").setOrigin(0.5, 0);
    container_main.add(bg);

    const btn_home = scene.add
        .image(38 + 118 / 2, 30 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {
            scene.scene.start("Home");
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_home,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_home,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    container_main.add(btn_home);

    CreateHealthBar(scene);
    ActiveHealthBar(false);

    CreateShieldBar(scene);
    ActiveShieldBar(false);

    CreateTimer(scene);
}

function CreateTimer(scene) {
    text_timer = scene.add
        .text(1042, 87, "00:00", {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 0.5);
    container_main.add(text_timer);
}

export function SetTimeText(str) {
    if (text_timer) {
        text_timer.setText(str);
    }
}

export function CreateHealthBar(scene) {
    healthBar = new ProgressBar(scene, 540, 85, {
        bgTexture: "gameplay_top_bar_health_bar_0",
        fillTexture: "gameplay_top_bar_health_bar_1",
        delayedFillTexture: "gameplay_top_bar_health_bar_2",
        overlayTexture: "gameplay_top_bar_health_bar_3",
    });
    container_main.add(healthBar.container);
    UpdateHealthBar(scene, 1, 1, false);
}

export function ActiveHealthBar(boolVal) {
    if (healthBar) healthBar.setVisible(boolVal);
}

export function IsHealthBarActive() {
    return healthBar ? healthBar.isVisible() : false;
}

export function UpdateHealthBar(scene, maxHealth, currentHealth, useTween = true) {
    if (healthBar) healthBar.update(currentHealth, maxHealth, useTween);
}

export function CreateShieldBar(scene) {
    shieldBar = new ProgressBar(scene, 540, 135, {
        bgTexture: "gameplay_top_bar_health_bar_0",
        fillTexture: "gameplay_top_bar_health_bar_1",
        delayedFillTexture: "gameplay_top_bar_health_bar_4",
        overlayTexture: "gameplay_top_bar_health_bar_3",
    });
    container_main.add(shieldBar.container);
    UpdateShieldBar(scene, 1, 1, false);
}

export function ActiveShieldBar(boolVal) {
    if (shieldBar) shieldBar.setVisible(boolVal);
}

export function IsShieldBarActive() {
    return shieldBar ? shieldBar.isVisible() : false;
}

export function UpdateShieldBar(scene, maxHealth, currentHealth, useTween = true) {
    if (shieldBar) shieldBar.update(currentHealth, maxHealth, useTween);
}

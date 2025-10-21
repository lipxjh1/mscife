let crosshair_container = null;

let tween = null;

let crossHair_gunner = null;

let crossHair_rocket = null;

let crossHair_sniper = null;

export function CreateCrosshair(scene) {
    // Tạo container cho player
    crosshair_container = scene.add.container(540, 960);
    crosshair_container.setDepth(1);

    crossHair_gunner = scene.add.image(0, 0, "player_crosshair_gunner");
    crosshair_container.add(crossHair_gunner);
    crossHair_gunner.setDisplaySize(150, 150);

    crossHair_rocket = scene.add.image(0, 0, "player_crosshair_rocket");
    crosshair_container.add(crossHair_rocket);
    crossHair_rocket.setDisplaySize(150, 150);

    crossHair_sniper = scene.add.image(0, 0, "player_crosshair_sniper");
    crosshair_container.add(crossHair_sniper);
    crossHair_sniper.setDisplaySize(150, 150);

    crosshair_container.setVisible(false);
}

export function ActiveCrosshair(scene, x, y, playerRole) {
    // Nếu đã có timer đang chạy, hủy nó
    if (tween) {
        scene.tweens.remove(tween);
        tween = null;
    }

    crosshair_container.setScale(1);

    crossHair_gunner.setVisible(false);
    crossHair_rocket.setVisible(false);
    crossHair_sniper.setVisible(false);

    switch (playerRole) {
        case "gunner":
            crossHair_gunner.setVisible(true);
            break;
        case "rocket":
            crossHair_rocket.setVisible(true);
            break;
        case "sniper":
            crossHair_sniper.setVisible(true);
            break;
    }

    crosshair_container.setVisible(true);
    crosshair_container.setPosition(x, y);

    tween = scene.tweens.add({
        targets: crosshair_container,
        scale: 1.25, // Phóng to hình ảnh lên 1.5 lần
        duration: 125, // Thời gian phóng to (ms)
        yoyo: true, // Thu nhỏ lại về kích thước ban đầu
        repeat: 2, // Lặp lại 2 lần (tổng cộng là 3 lần)
        ease: "Sine.easeInOut", // Hiệu ứng easing
        onComplete: () => {
            crosshair_container.setVisible(false);
        },
    });
}

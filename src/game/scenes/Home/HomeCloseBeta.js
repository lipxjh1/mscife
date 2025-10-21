let container_main = null;

let container_popup = null;
const container_popup_openPosition = { x: 0, y: 0 };
const container_popup_closePosition = { x: 0, y: 4000 };

export function OpenCloseBeta(scene) {
    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const lock_bg = scene.rexUI.add.roundRectangle(
        originWidth / 2,
        originHeight / 2,
        originWidth,
        originHeight,
        0,
        0x000000,
        0.75
    );

    // Thiết lập tương tác
    lock_bg.setInteractive({ useHandCursor: true }); // Thêm { useHandCursor: true } để thay đổi con trỏ thành bàn tay khi di chuột vào

    // Bắt sự kiện click hoặc chạm vào
    lock_bg.on("pointerdown", function (pointer) {});

    container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    const text_img = scene.add.image(540, 960, "home_lobby_close_beta_text");
    container_popup.add(text_img);

    //create close btn
    const btn_close = scene.add
        .image(540, 1684 + 76 / 2, "home_lobby_close_beta_btn")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            Close(scene);
        })
        .on("pointerover", function () {
            //console.log("btn_close over");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("btn_close out");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_popup.add(btn_close);

    Open(scene);
}

function card_item(scene, i, item) {
    //console.log("Item = ", item);

    const container_card = scene.add.container(0, 0);

    const container_card_inner = scene.add.container(0, -592 / 2);
    container_card.add(container_card_inner);

    const item_text_buy = scene.add
        .text(109, 449, "Buy", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_card_inner.add(item_text_buy);

    return container_card;
}

function Open(scene) {
    container_popup.setPosition(
        container_popup_closePosition.x,
        container_popup_closePosition.y
    );

    scene.tweens.add({
        targets: container_popup,
        x: container_popup_openPosition.x,
        y: container_popup_openPosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });
}

function Close(scene) {
    scene.tweens.add({
        targets: container_popup,
        x: container_popup_closePosition.x,
        y: container_popup_closePosition.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            Destroy();
        },
    });
}

function Destroy() {
    container_main.destroy();

    container_main = null;
}

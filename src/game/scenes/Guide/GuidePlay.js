import centerData from "../../Data/CenterData.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";
import { CreateHomeBattle } from "../Home/HomeBattle/HomeBattle.js";

export function CreateGuidePlay(scene) {
    if (
        centerData.userInfo.CurrentStage > 1 ||
        centerData.selectedPlayerArr.length != 3
    ) {
        return;
    }

    const container = scene.add.container(0, 0);
    container.setDepth(300);

    const bg = scene.rexUI.add
        .roundRectangle(0, 0, 1080, 1920, 0, 0x000000, 0.8)
        .setInteractive()
        .setOrigin(0, 0);

    container.add(bg);

    CreateButtonBattle(scene, container);

    CreateText(scene, container);

    return container;
}

function CreateButtonBattle(scene, container) {
    const btn_battle = scene.add
        .image(0, 1126 + 273 / 2, "home_lobby_btn_battle")
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateHomeBattle(scene);

            container.destroy();
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_battle,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_battle,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container.add(btn_battle);
}

function CreateText(scene, container) {
    const container_text = scene.add.container(0, 0);
    container.add(container_text);

    let width = 540;
    let height = 480;

    const bg = scene.rexUI.add
        .roundRectangle(0, 0, width, height, 20, 0xffffff, 0.2)
        .setOrigin(0, 0);
    container_text.add(bg);

    const text = scene.add
        .text(0, 0, "Click the button select game mode to play", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#ffffff",
            align: "left",
            wordWrap: { width: width * 0.8, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);

    bg.setPosition(text.x - 20, text.y - 20);
    bg.setDisplaySize(text.width + 40, text.height + 40);

    container_text.add(text);

    container_text.setPosition(404, 1185);

    // Thiết lập scale ban đầu
    container_text.setScale(0);

    // Tạo hiệu ứng tween scale
    const textTween = scene.tweens.add({
        targets: container_text,
        scale: 1,
        duration: 500, // 0.5 giây
        ease: "Back.easeOut",
        onComplete: function () {
            // Hủy tween sau khi hoàn thành
            if (textTween) {
                textTween.remove();
            }
        },
    });
}

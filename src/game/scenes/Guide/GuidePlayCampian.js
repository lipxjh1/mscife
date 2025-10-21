import centerData from "../../Data/CenterData.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";
import { CreateHomeBattle } from "../Home/HomeBattle/HomeBattle.js";

let container = null;

export function CreateGuidePlayCampian(scene) {
    if (
        centerData.userInfo.CurrentStage > 1 ||
        centerData.selectedPlayerArr.length != 3
    ) {
        return;
    }

    container = scene.add.container(0, 0);
    container.setDepth(300);

    const bg = scene.rexUI.add
        .roundRectangle(0, 692, 1080, 1920, 0, 0x000000, 0.8)
        .setInteractive()
        .setOrigin(0, 0);

    container.add(bg);

    const text_title = scene.add
        .text(
            540,
            770,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                "Campian"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 880, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container.add(text_title);

    const text_content = scene.add
        .text(
            100,
            868,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeBattle.KEY,
                "In a battle, you'll have three characters with distinct playstyles: Gunner, Sniper, and Rocket. The Gunner boasts a high fire rate, dealing true damage to unarmored ground targets. The Sniper specializes in high damage against aerial targets, while the Rocket excels at destroying enemy armor."
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#ffffff",
                align: "left",
                wordWrap: { width: 880, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container.add(text_content);

    CreateText(scene, container);

    return container;
}

function CreateText(scene, container) {
    const container_text = scene.add.container(0, 0);
    container.add(container_text);

    let width = 540;
    let height = 480;

    const bg = scene.rexUI.add
        .roundRectangle(0, 0, width, height, 20, 0xffffff, 0.2)
        .setOrigin(1, 0);
    container_text.add(bg);

    const text = scene.add
        .text(0, 0, "Click the button to play the campian stage", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#ffffff",
            align: "right",
            wordWrap: { width: width * 0.8, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);

    bg.setPosition(text.x + 20, text.y - 20);
    bg.setDisplaySize(text.width + 40, text.height + 40);

    container_text.add(text);

    container_text.setPosition(750, 598);

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

import centerData from "../../Data/CenterData";
import cdLocalization from "../../Data/CenterDataLocalization";
import centerDataPlayer from "../../Data/CenterDataPlayer";
import { AssetLoadingManager } from "../AssetLoadingManager";
import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager";
import { CreateFirstMissions } from "../Home/HomeFirstMissions";
import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../Share/AlertPopup";

let container_main = null;

let canClick = false;

let rewardData = null;

let tweenBG = null;
let tweenText = null;

export function CreatePlayerDead(scene, data) {
    rewardData = data;

    if (container_main != null) {
        container_main.destroy();
    }

    canClick = false;

    container_main = scene.add.container(0, 0).setDepth(200);

    const black_bg = scene.add
        .rectangle(0, 0, window.originWidth, window.originHeight)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {});
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.75;

    container_main.add(black_bg);

    const popup_bg = scene.add
        .image(0, 0, "gameplay_game_over_popup_bg")
        .setOrigin(0, 0);
    container_main.add(popup_bg);

    popup_bg.setPosition(-2000, 0);

    tweenBG = scene.tweens.add({
        targets: popup_bg,
        x: 0,
        duration: 500,
        ease: "power2",
        delay: 0,
        onComplete: () => {},
    });

    const img_text = scene.add
        .image(540, 766, "gameplay_player_dead_text")
        .setOrigin(0.5, 0);

    container_main.add(img_text);

    img_text.y = -2000;
    tweenText = scene.tweens.add({
        targets: img_text,
        y: 766,
        duration: 750,
        ease: "Bounce.easeOut",
        delay: 500,
        onComplete: () => {},
    });

    const btn_exit = scene.add
        .image(540, 1598, "gameplay_game_over_btn_exit")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", (pointer) => {
            scene.scene.start("Home");
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_exit,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_exit,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: "Power2",
            });
        });
    container_main.add(btn_exit);
}

export function DestroyPlayerDead() {
    if (container_main) {
        container_main.destroy();
    }

    if (tweenBG) {
        tweenBG.remove();
    }

    if (tweenText) {
        tweenText.remove();
    }
}

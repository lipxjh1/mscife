import cdLocalization from "../../../Data/CenterDataLocalization.js";

export let container_power = null;
let isOpen = false;

import { container_achievements_sub_panel } from "./HomeRewardAchievements.js";

export function CreatePower(scene) {
    if (isOpen) return;
    isOpen = true;

    container_power = scene.add.container(1080 / 2, 1920 / 2 - 200);
    container_achievements_sub_panel.add(container_power);

    const text = scene.add
        .text(0, 0, "Coming Soon", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "48px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0.5);
    container_power.add(text);
}

export function Close() {
    if (!isOpen) return;
    isOpen = false;
    if (container_power) {
        container_power.destroy();
        container_power = null;
    }
}

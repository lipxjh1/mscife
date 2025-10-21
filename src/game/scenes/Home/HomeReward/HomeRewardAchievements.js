import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { container_popup } from "./HomeReward.js";

import {
    CreateInviteList,
    Close as CloseInvite,
} from "./HomeRewardAchievementsInvite.js";
import {
    CreateStageList,
    Close as CloseStage,
} from "./HomeRewardAchievementsStage.js";
import {
    CreatePower,
    Close as ClosePower,
} from "./HomeRewardAchievementsPower.js";

let container_achievements = null;
export let container_achievements_sub_panel = null;
let container_achievements_cat_buttons = null;

let btn_invite_cat = null;
let btn_stage_cat = null;
let btn_power_cat = null;

function CreateAchievements(scene) {
    container_achievements = scene.add.container(0, 0);
    container_popup.add(container_achievements);

    container_achievements_sub_panel = scene.add.container(0, 0);
    container_achievements.add(container_achievements_sub_panel);

    container_achievements_cat_buttons = scene.add.container(0, 0);
    container_achievements.add(container_achievements_cat_buttons);

    btn_invite_cat = CreateCatButton(scene, 0 + 360 / 2, 418, "Invite");
    btn_invite_cat.button.on("pointerdown", () => ActiveInvite(scene));

    btn_stage_cat = CreateCatButton(scene, 360 + 360 / 2, 418, "Stage");
    btn_stage_cat.button.on("pointerdown", () => ActiveStage(scene));

    btn_power_cat = CreateCatButton(scene, 720 + 360 / 2, 418, "Power");
    btn_power_cat.button.on("pointerdown", () => ActivePower(scene));

    ActiveInvite(scene);
}

export function ActiveAchievements(scene, isActive) {
    if (container_achievements) {
        container_achievements.setVisible(isActive);
    } else if (container_achievements == null && isActive) {
        CreateAchievements(scene);
    }
}

function ActiveInvite(scene) {
    btn_invite_cat.setSelected();
    btn_stage_cat.setUnselected();
    btn_power_cat.setUnselected();

    CreateInviteList(scene);

    CloseStage();
    ClosePower();
}

function ActiveStage(scene) {
    btn_invite_cat.setUnselected();
    btn_stage_cat.setSelected();
    btn_power_cat.setUnselected();

    CreateStageList(scene);

    CloseInvite();
    ClosePower();
}

function ActivePower(scene) {
    btn_invite_cat.setUnselected();
    btn_stage_cat.setUnselected();
    btn_power_cat.setSelected();

    CreatePower(scene);

    CloseInvite();
    CloseStage();
}

function CreateCatButton(scene, x, y, buttonName) {
    let btnWidth = 360,
        btnHeight = 120;
    const btn_container = scene.add.container(x, y);
    container_achievements_cat_buttons.add(btn_container);
    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);
    btn_container.button = scene.add
        .image(0, 0, "home_reward_cat_button")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
    btn_inner_container.add(btn_container.button);
    const text = scene.add
        .text(
            btnWidth / 2,
            btnHeight / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAchivevement.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#FFF",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);
    btn_inner_container.add(text);

    btn_container.setSelected = function () {
        btn_container.button.disableInteractive();
        btn_inner_container.each((child) => child.setTint && child.clearTint());
    };
    btn_container.setUnselected = function () {
        btn_container.button.setInteractive({ useHandCursor: true });
        btn_inner_container.each(
            (child) => child.setTint && child.setTint(0x9a9a9a)
        );
    };
    return btn_container;
}

export function Destroy() {
    if (container_achievements) {
        container_achievements.destroy();
        container_achievements = null;
    }
    CloseInvite();
    CloseStage();
    ClosePower();
}

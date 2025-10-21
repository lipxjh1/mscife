import centerData from "../../../Data/CenterData.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    ActiveMission,
    Destroy as DestroyMission,
} from "./HomeRewardMissions.js";

import {
    ActiveAchievements,
    Destroy as DestroyAchievements,
} from "./HomeRewardAchievements.js";

import {
    ActiveAirdrop,
    Destroy as DestroyAirdrop,
} from "./HomeRewardAirdrop.js";

import {
    HideCurrencyBar,
    MovePlayerBarToDefault,
    MovePlayerBarToHide,
    OpenCurrencyBar,
    OptionsCurrencyBar,
} from "../HomeTopBarPlayer.js";

import { IsOpen as CheckCharacterUpgradeOpen } from "../HomeCharacterInventory/HomeCharacterInventoryUpgrade.js";

import { IsOpen as CheckShopOpen } from "../HomeShop/HomeShop.js";

import { IsOpen as CheckInventoryOpen } from "../HomeInventory/HomeInventory.js";
import { IsOpen as CheckGachaOpen } from "../HomeGacha/HomeGacha.js";
import { IsCardOptionsOpen } from "../HomeCharacterInventory/HomeCharacterInventoryTeam.js";

let container_main = null;

let container_popup = null;
const container_popup_openPosition = { x: 0, y: 0 };
const container_popup_closePosition = { x: 0, y: 4000 };

let container_popup_buttons = null;

let btn_mission = null;

let btn_achivement = null;

let btn_airdrop = null;

const MODE_KEYS = {
    Mission: {
        KEY: "mission",
    },
    Achievement: {
        KEY: "achievement",
    },
    Airdrop: {
        KEY: "airdrop",
    },
};

export { container_main, container_popup };

export function CreateReward(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadReward(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.rexUI.add
        .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.75)
        .setInteractive({ useHandCursor: true });

    container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup_buttons = scene.add.container(0, 0);
    container_main.add(container_popup_buttons);

    //Create buttons

    btn_mission = scene.add
        .image(170 + 280 / 2, 248 + 90 / 2, "home_reward_btn_mission")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ActiveMode(scene, MODE_KEYS.Mission.KEY);
        });

    btn_mission.setSelected = function () {
        btn_mission.clearTint();
    };

    btn_mission.setUnselected = function () {
        btn_mission.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_mission);

    btn_achivement = scene.add
        .image(465 + 280 / 2, 248 + 90 / 2, "home_reward_btn_achivement")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ActiveMode(scene, MODE_KEYS.Achievement.KEY);
        });

    btn_achivement.setSelected = function () {
        btn_achivement.clearTint();
    };

    btn_achivement.setUnselected = function () {
        btn_achivement.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_achivement);

    btn_airdrop = scene.add
        .image(761 + 280 / 2, 248 + 90 / 2, "home_reward_btn_airdrop")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ActiveMode(scene, MODE_KEYS.Airdrop.KEY);
        });

    btn_airdrop.setSelected = function () {
        btn_airdrop.clearTint();
    };

    btn_airdrop.setUnselected = function () {
        btn_airdrop.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_airdrop);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            CloseReward(scene);
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

    container_popup_buttons.add(btn_close);

    ActiveMode(scene, MODE_KEYS.Mission.KEY);

    OpenReward(scene);
}

function ActiveMode(scene, modeKey) {
    btn_mission.setUnselected();
    btn_achivement.setUnselected();
    btn_airdrop.setUnselected();

    if (modeKey === MODE_KEYS.Mission.KEY) {
        ActiveMission(scene, true);

        ActiveAchievements(scene, false);

        ActiveAirdrop(scene, false);

        btn_mission.setSelected();
    } else if (modeKey === MODE_KEYS.Achievement.KEY) {
        ActiveMission(scene, false);

        ActiveAchievements(scene, true);

        ActiveAirdrop(scene, false);

        btn_achivement.setSelected();
    } else if (modeKey === MODE_KEYS.Airdrop.KEY) {
        ActiveMission(scene, false);

        ActiveAchievements(scene, false);

        ActiveAirdrop(scene, true);

        btn_airdrop.setSelected();
    }
}

export function CreateButton0(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 288;
    let btnHeight = 72;

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
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_container,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    btn_inner_container.add(btn_container.button);

    const text = scene.add
        .text(
            btnWidth / 2,
            20,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeTeam.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "36px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0);

    btn_inner_container.add(text);

    return btn_container;
}

function OpenReward(scene) {
    MovePlayerBarToHide(scene);

    HideCurrencyBar(scene);

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

function CloseReward(scene) {
    if (
        CheckCharacterUpgradeOpen() == false &&
        CheckShopOpen() == false &&
        CheckInventoryOpen() == false &&
        CheckGachaOpen() == false &&
        IsCardOptionsOpen() == false
    ) {
        MovePlayerBarToDefault(scene);
    }

    if (IsCardOptionsOpen() == false) {
        OpenCurrencyBar(scene);
    } else {
        OptionsCurrencyBar(scene);
    }

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

    DestroyMission();

    DestroyAchievements();

    DestroyAirdrop();
}

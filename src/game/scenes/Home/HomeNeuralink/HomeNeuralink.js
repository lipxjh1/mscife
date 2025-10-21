import centerData from "../../../Data/CenterData.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    ActiveNeuralinkUpgrade,
    Destroy as DestroyNeuralink,
} from "./HomeNeuralinkUpgrade.js";

import {
    ActiveNetwork,
    Destroy as DestroyNetwork,
} from "../HomeUserInfo/HomeUserInfoNetwork.js";

import {
    ActiveRank,
    Destroy as DestroyRank,
} from "../HomeUserInfo/HomeUserInfoRank.js";

let container_main = null;

let container_popup = null;

let container_popup_buttons = null;

let btn_neuralink = null;

let btn_drone = null;

let btn_suit = null;

let isOpen = false;

const MODE_KEYS = {
    Upgrade: {
        KEY: "upgrade",
    },
    Drone: {
        KEY: "drone",
    },
    Suit: {
        KEY: "suit",
    },
};

export { container_main, container_popup };

export function CreateHomeNeuralink(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyNeuralink(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    // const lock_bg = scene.rexUI.add
    //     .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.75)
    //     .setInteractive({ useHandCursor: true });

    // container_main.add(lock_bg);

    const lock_bg = scene.add
        .image(0, 0, "home_neuralink_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup_buttons = scene.add.container(0, 0);
    container_main.add(container_popup_buttons);

    //Create buttons

    btn_neuralink = scene.add
        .image(170 + 280 / 2, 248 + 90 / 2, "home_neuralink_btn_neuralink")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ActiveMode(scene, MODE_KEYS.Upgrade.KEY);
        });

    btn_neuralink.setSelected = function () {
        btn_neuralink.clearTint();
    };

    btn_neuralink.setUnselected = function () {
        btn_neuralink.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_neuralink);

    btn_drone = scene.add
        .image(465 + 280 / 2, 248 + 90 / 2, "home_neuralink_btn_drone")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //ActiveMode(scene, MODE_KEYS.Drone.KEY);
        });

    btn_drone.setSelected = function () {
        btn_drone.clearTint();
    };

    btn_drone.setUnselected = function () {
        btn_drone.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_drone);

    btn_suit = scene.add
        .image(761 + 280 / 2, 248 + 90 / 2, "home_neuralink_btn_suit")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //ActiveMode(scene, MODE_KEYS.Suit.KEY);
        });

    btn_suit.setSelected = function () {
        btn_suit.clearTint();
    };

    btn_suit.setUnselected = function () {
        btn_suit.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_suit);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            CloseNeuralink(scene);
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

    ActiveMode(scene, MODE_KEYS.Upgrade.KEY);

    OpenNeuralink(scene);
}

function ActiveMode(scene, modeKey) {
    btn_neuralink.setUnselected();
    btn_drone.setUnselected();
    btn_suit.setUnselected();

    if (modeKey === MODE_KEYS.Upgrade.KEY) {
        ActiveNeuralinkUpgrade(scene, true);
        ActiveNetwork(scene, false);
        ActiveRank(scene, false);

        btn_neuralink.setSelected();
    } else if (modeKey === MODE_KEYS.Drone.KEY) {
        ActiveNeuralinkUpgrade(scene, false);
        ActiveNetwork(scene, true);
        ActiveRank(scene, false);

        btn_drone.setSelected();
    } else if (modeKey === MODE_KEYS.Suit.KEY) {
        ActiveNeuralinkUpgrade(scene, false);
        ActiveNetwork(scene, false);
        ActiveRank(scene, true);

        btn_suit.setSelected();
    }
}

export function IsOpen() {
    return isOpen;
}

function OpenNeuralink(scene) {
    isOpen = true;
}

function CloseNeuralink(scene) {
    isOpen = false;
    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;

    DestroyNeuralink();

    // DestroyNetwork();

    // DestroyRank();
}

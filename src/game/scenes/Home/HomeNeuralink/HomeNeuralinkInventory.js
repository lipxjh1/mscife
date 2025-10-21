import centerData from "../../../Data/CenterData.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    ActiveNeuralinkInventoryInprogress,
    Destroy as DestroyInprogress,
} from "./HomeNeuralinkInventoryInprogress.js";

import {
    ActiveNeuralinkInventoryUpgrade,
    Destroy as DestroyUpgrade,
} from "./HomeNeuralinkInventoryUpgrade.js";

import {
    ActiveNeuralinkInventorySuccess,
    Destroy as DestroyCompleted,
} from "./HomeNeuralinkInventorySuccess.js";

let container_main = null;

let container_popup = null;

let container_popup_buttons = null;

let btn_progress = null;

let btn_upgrade = null;

let btn_success = null;

let isOpen = false;

const MODE_KEYS = {
    Inprogress: {
        KEY: "upgrade",
    },
    Upgrade: {
        KEY: "drone",
    },
    Success: {
        KEY: "suit",
    },
};

export { container_main, container_popup };

export function CreateHomeNeuralinkInventory(scene) {
    AssetsLoadDone(scene);
}

function AssetsLoadDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const lock_bg = scene.add
        .image(0, 0, "home_neuralink_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_main.add(lock_bg);

    const lock_bg1 = scene.rexUI.add
        .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.5)
        .setInteractive({ useHandCursor: true });
    container_main.add(lock_bg1);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup_buttons = scene.add.container(0, 0);
    container_main.add(container_popup_buttons);

    //Create buttons

    btn_progress = scene.add
        .image(
            170 + 280 / 2,
            248 + 90 / 2,
            "home_neuralink_inventory_btn_progress"
        )
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ActiveMode(scene, MODE_KEYS.Inprogress.KEY);
        });

    btn_progress.setSelected = function () {
        btn_progress.clearTint();
    };

    btn_progress.setUnselected = function () {
        btn_progress.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_progress);

    btn_upgrade = scene.add
        .image(
            465 + 280 / 2,
            248 + 90 / 2,
            "home_neuralink_inventory_btn_upgrade"
        )
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ActiveMode(scene, MODE_KEYS.Upgrade.KEY);
        });

    btn_upgrade.setSelected = function () {
        btn_upgrade.clearTint();
    };

    btn_upgrade.setUnselected = function () {
        btn_upgrade.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_upgrade);

    btn_success = scene.add
        .image(
            761 + 280 / 2,
            248 + 90 / 2,
            "home_neuralink_inventory_btn_success"
        )
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ActiveMode(scene, MODE_KEYS.Success.KEY);
        });

    btn_success.setSelected = function () {
        btn_success.clearTint();
    };

    btn_success.setUnselected = function () {
        btn_success.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_success);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            CloseNeuralinkInventory(scene);
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

    ActiveMode(scene, MODE_KEYS.Inprogress.KEY);

    OpenNeuralinkInventory(scene);
}

function ActiveMode(scene, modeKey) {
    btn_progress.setUnselected();
    btn_upgrade.setUnselected();
    btn_success.setUnselected();

    if (modeKey === MODE_KEYS.Inprogress.KEY) {
        ActiveNeuralinkInventoryInprogress(scene, true);
        ActiveNeuralinkInventoryUpgrade(scene, false);
        ActiveNeuralinkInventorySuccess(scene, false);

        btn_progress.setSelected();
    } else if (modeKey === MODE_KEYS.Upgrade.KEY) {
        ActiveNeuralinkInventoryInprogress(scene, false);
        ActiveNeuralinkInventoryUpgrade(scene, true);
        ActiveNeuralinkInventorySuccess(scene, false);

        btn_upgrade.setSelected();
    } else if (modeKey === MODE_KEYS.Success.KEY) {
        ActiveNeuralinkInventoryInprogress(scene, false);
        ActiveNeuralinkInventoryUpgrade(scene, false);
        ActiveNeuralinkInventorySuccess(scene, true);

        btn_success.setSelected();
    }
}

export function IsOpen() {
    return isOpen;
}

function OpenNeuralinkInventory(scene) {
    isOpen = true;
}

function CloseNeuralinkInventory(scene) {
    isOpen = false;
    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;

    DestroyInprogress();

    DestroyUpgrade();

    DestroyCompleted();
}

import centerData from "../../../Data/CenterData.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    ActiveAccount,
    Destroy as DestroyAccount,
} from "./HomeUserInfoAccount.js";

import {
    ActiveNetwork,
    Destroy as DestroyNetwork,
} from "./HomeUserInfoNetwork.js";

import { ActiveRank, Destroy as DestroyRank } from "./HomeUserInfoRank.js";

import {
    OpenCurrencyBar,
    HideCurrencyBar,
    MovePlayerBarToDefault,
    MovePlayerBarToAccount,
    MovePlayerBarToHide,
    MovePlayerBarToRank,
} from "../HomeTopBarPlayer.js";

let container_main = null;

let container_popup = null;

let container_popup_buttons = null;

let btn_account = null;

let btn_network = null;

let btn_rank = null;

let isOpen = false;

const MODE_KEYS = {
    Account: {
        KEY: "account",
    },
    Network: {
        KEY: "network",
    },
    Rank: {
        KEY: "rank",
    },
};

export { container_main, container_popup };

export function CreateUserInfo(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadUserInfo(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    // const lock_bg = scene.rexUI.add
    //     .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.75)
    //     .setInteractive({ useHandCursor: true });

    // container_main.add(lock_bg);

    const lock_bg = scene.add
        .image(0, 0, "home_user_info_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_main.add(lock_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup_buttons = scene.add.container(0, 0);
    container_main.add(container_popup_buttons);

    //Create buttons

    // btn_account = scene.add
    //     .image(170 + 280 / 2, 248 + 90 / 2, "home_user_info_btn_account")
    //     .setOrigin(0.5, 0.5)
    //     .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
    //     .on("pointerdown", function () {
    //         ActiveMode(scene, MODE_KEYS.Account.KEY);
    //     });

    btn_account = scene.add
        .image(465 + 280 / 2, 248 + 90 / 2, "home_user_info_btn_account")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ActiveMode(scene, MODE_KEYS.Account.KEY);
        });

    btn_account.setSelected = function () {
        btn_account.clearTint();
    };

    btn_account.setUnselected = function () {
        btn_account.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_account);

    // btn_network = scene.add
    //     .image(465 + 280 / 2, 248 + 90 / 2, "home_user_info_btn_network")
    //     .setOrigin(0.5, 0.5)
    //     .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
    //     .on("pointerdown", function () {
    //         ActiveMode(scene, MODE_KEYS.Network.KEY);
    //     });

    // btn_network.setSelected = function () {
    //     btn_network.clearTint();
    // };

    // btn_network.setUnselected = function () {
    //     btn_network.setTint(0x9a9a9a);
    // };

    // container_popup_buttons.add(btn_network);

    btn_rank = scene.add
        .image(761 + 280 / 2, 248 + 90 / 2, "home_user_info_btn_rank")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ActiveMode(scene, MODE_KEYS.Rank.KEY);
        });

    btn_rank.setSelected = function () {
        btn_rank.clearTint();
    };

    btn_rank.setUnselected = function () {
        btn_rank.setTint(0x9a9a9a);
    };

    container_popup_buttons.add(btn_rank);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            CloseUserInfo(scene);
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

    ActiveMode(scene, MODE_KEYS.Account.KEY);

    OpenUserInfo(scene);
}

function ActiveMode(scene, modeKey) {
    btn_account.setUnselected();
    //btn_network.setUnselected();
    btn_rank.setUnselected();

    if (modeKey === MODE_KEYS.Account.KEY) {
        ActiveAccount(scene, true);
        //ActiveNetwork(scene, false);
        ActiveRank(scene, false);

        MovePlayerBarToAccount(scene);

        btn_account.setSelected();
    } else if (modeKey === MODE_KEYS.Network.KEY) {
        ActiveAccount(scene, false);
        //ActiveNetwork(scene, true);
        ActiveRank(scene, false);

        MovePlayerBarToHide(scene);

        //btn_network.setSelected();
    } else if (modeKey === MODE_KEYS.Rank.KEY) {
        ActiveAccount(scene, false);
        //ActiveNetwork(scene, false);
        ActiveRank(scene, true);

        MovePlayerBarToRank(scene);

        btn_rank.setSelected();
    }
}

export function IsOpen() {
    return isOpen;
}

function OpenUserInfo(scene) {
    isOpen = true;

    HideCurrencyBar(scene);
}

function CloseUserInfo(scene) {
    isOpen = false;

    MovePlayerBarToDefault(scene);

    OpenCurrencyBar(scene);

    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;

    DestroyAccount(this);

    //DestroyNetwork();

    DestroyRank();
}

import centerData from "../../../Data/CenterData.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    OpenTopBarNotice,
    HideTopBarNotice,
    MovePlayerBarToHide,
    MovePlayerBarToDefault,
} from "../HomeTopBarPlayer.js";
import { OpenCurrencyBar, HideCurrencyBar } from "../HomeTopBarPlayer.js";

import {
    CreateWallet,
    Close as CloseWallet,
    IsOpen as IsWalletOpen,
} from "./HomeEarnWallet.js";

import {
    CreateMint,
    Close as CloseMint,
    IsOpen as IsMintOpen,
} from "./HomeEarnMint.js";

let container_main = null;

let container_popup = null;

let container_buttons = null;

let btn_wallet = null;
let btn_mint = null;

let isOpen = false;

export { container_main, container_popup, container_buttons };

export function CreateEarn(scene) {
    CreateLoadingPopup();

    let assetsToLoad = 2;
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();
            LoadAssetsDone(scene);
        }
    };

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyEarn(() => {
        onAssetLoaded();
    });

    let keys = Object.keys(centerDataPlayer.dataPlayerDictionary);

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        keys,
        () => {
            onAssetLoaded();
        }
    );
}

function LoadAssetsDone(scene) {
    if (IsOpen()) return;

    MovePlayerBarToHide(scene);

    HideTopBarNotice(scene);

    HideCurrencyBar(scene);

    if (container_main) {
        container_main.destroy();
    }

    container_main = scene.add.container(0, 0);
    container_main.setDepth(100);

    const lock_bg = scene.add
        .image(0, 0, "home_earn_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_main.add(lock_bg);

    // const black_bg = scene.add
    //     .rectangle(0, 0, window.originWidth, window.originHeight)
    //     .setOrigin(0, 0);
    // black_bg.isFilled = true;
    // black_bg.fillColor = 0;
    // black_bg.fillAlpha = 0.2;
    // container_main.add(black_bg);

    container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);
    container_popup.setDepth(101);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);
    container_buttons.setDepth(102);

    CreateButtons(scene);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 58 + 90 / 2, "share_btn_home_2")
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

    container_main.add(btn_close);

    Open(scene);

    HideTopBarNotice(scene);
}

function CreateButtons(scene) {
    CreateWalletButton(scene);

    CreateMintButton(scene);
}

function CreateWalletButton(scene) {
    btn_wallet = scene.add
        .image(367 + 330 / 2, 58 + 90 / 2, "home_earn_btn_wallet")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ButtonClickWallet(scene);
        });

    btn_wallet.setSelected = function () {
        btn_wallet.clearTint();
    };

    btn_wallet.setUnselected = function () {
        btn_wallet.setTint(0x9a9a9a);
    };

    container_buttons.add(btn_wallet);
}

function ButtonClickWallet(scene) {
    if (IsWalletOpen()) return;

    if (IsMintOpen()) {
        CloseMint(scene);
    }

    btn_wallet.setSelected();
    btn_mint.setUnselected();

    CreateWallet(scene);
}

function CreateMintButton(scene) {
    btn_mint = scene.add
        .image(712 + 330 / 2, 58 + 90 / 2, "home_earn_btn_mint")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            ButtonClickMint(scene);
        });

    btn_mint.setSelected = function () {
        btn_mint.clearTint();
    };

    btn_mint.setUnselected = function () {
        btn_mint.setTint(0x9a9a9a);
    };

    container_buttons.add(btn_mint);
}

function ButtonClickMint(scene) {
    if (IsMintOpen()) return;

    if (IsWalletOpen()) {
        CloseWallet(scene);
    }

    btn_wallet.setUnselected();
    btn_mint.setSelected();

    CreateMint(scene);
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen == true) return;

    isOpen = true;

    ButtonClickWallet(scene);
}

export function Close(scene) {
    if (isOpen == false) return;

    MovePlayerBarToDefault(scene);

    OpenTopBarNotice(scene);

    OpenCurrencyBar(scene);

    if (IsWalletOpen()) {
        CloseWallet(scene);
    }

    if (IsMintOpen()) {
        CloseMint(scene);
    }

    scene.time.delayedCall(510, () => {
        isOpen = false;
        Destroy();
    });
}

function Destroy(scene) {
    container_main.destroy();
}

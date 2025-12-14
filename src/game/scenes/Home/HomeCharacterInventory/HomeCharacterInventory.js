import centerData from "../../../Data/CenterData.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    OpenTopBarNotice,
    HideTopBarNotice,
    MovePlayerBarToDefault,
    MovePlayerBarToHide,
    OpenCurrencyBar,
    HideCurrencyBar,
} from "../HomeTopBarPlayer.js";

import {
    CreateCharacterTeam,
    Close as CloseCharacterTeam,
    IsOpen as CheckCharacterTeamOpen,
} from "./HomeCharacterInventoryTeam.js";

import {
    CreateFragment,
    Close as CloseFragment,
    IsOpen as CheckFragmentOpen,
} from "./HomeCharacterInventoryFragment.js";

let container_main = null;
let container_main_default_position = { x: 0, y: 0 };
let container_main_hide_position = { x: 0, y: 1000 };

let btn_team = null;
let btn_team_default_position = { x: 63 + 385 / 2, y: 1755 };
let btn_team_open_position = { x: 63 + 385 / 2, y: 1710 };

let btn_fragment = null;
let btn_fragment_default_position = { x: 635 + 385 / 2, y: 1755 };
let btn_fragment_open_position = { x: 635 + 385 / 2, y: 1710 };

let isOpen = false;

// ✅ Resource tracking for proper cleanup
const characterInventoryResources = {
    events: [],
    tweens: [],
    timers: []
};

export { container_main };

export function CreateCharacterInventory(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyCharacterInventory(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);

        //console.log("lazyCharacterInventory load done");
    });
}

function AssetsLoadDone(scene) {
    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    btn_team = scene.add
        .image(367 + 330 / 2, 58 + 90 / 2, "home_character_btn_team")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        // ✅ Track btn_team click event
    const onTeamClick = function () {
        //console.log("btn_team clicked");
        btn_team.setSelected();
        btn_fragment.setUnselected();
        CreateCharacterTeam(scene);
        CloseFragment(scene);
    };
    btn_team.on("pointerdown", onTeamClick);
    characterInventoryResources.events.push({ target: btn_team, event: "pointerdown", handler: onTeamClick });
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_team,

                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_team,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_main.add(btn_team);

    btn_team.setSelected = function () {
        btn_team.clearTint();
    };

    btn_team.setUnselected = function () {
        btn_team.setTint(0x9a9a9a);
    };

    btn_fragment = scene.add
        .image(712 + 330 / 2, 58 + 90 / 2, "home_character_btn_piece")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_team clicked");

            btn_fragment.setSelected();

            btn_team.setUnselected();

            CreateFragment(scene);

            CloseCharacterTeam(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_fragment,

                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_fragment,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_main.add(btn_fragment);

    btn_fragment.setSelected = function () {
        btn_fragment.clearTint();
    };

    btn_fragment.setUnselected = function () {
        btn_fragment.setTint(0x9a9a9a);
    };

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 58 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        // ✅ Track close button click
    const onCloseClick = function () {
        //console.log("btn_close clicked");
        Close(scene);
    };
    btn_close.on("pointerdown", onCloseClick);
    characterInventoryResources.events.push({ target: btn_close, event: "pointerdown", handler: onCloseClick });
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
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen == true) return;

    HideTopBarNotice(scene);

    MovePlayerBarToHide(scene);

    HideCurrencyBar(scene);

    CreateCharacterTeam(scene);

    btn_team.setSelected();

    btn_fragment.setUnselected();

    isOpen = true;
}

export function Close(scene) {
    //console.log("Close isOpen:", isOpen);

    if (isOpen == false) return;

    OpenTopBarNotice(scene);

    MovePlayerBarToDefault(scene);

    OpenCurrencyBar(scene);

    CloseCharacterTeam(scene);

    CloseFragment(scene);

    scene.time.addEvent({
        delay: 510, // Cập nhật mỗi 16 ms (khoảng 60 FPS)
        callback: () => {
            isOpen = false;
            Destroy();
        },
    });
}

export function DestroyCharacterInventory(scene) {
    // ✅ Clean up all tracked events
    characterInventoryResources.events.forEach(({ target, event, handler }) => {
        if (target && target.off) {
            target.off(event, handler);
        }
    });

    // ✅ Stop all tracked tweens
    characterInventoryResources.tweens.forEach(tween => {
        if (tween && tween.isActive && tween.isActive()) {
            tween.stop();
        }
    });

    // ✅ Remove all tracked timers
    characterInventoryResources.timers.forEach(timer => {
        if (timer && timer.remove) {
            timer.remove();
        }
    });

    // ✅ Reset resources
    characterInventoryResources.events = [];
    characterInventoryResources.tweens = [];
    characterInventoryResources.timers = [];

    // ✅ Destroy containers
    if (container_main && container_main.destroy) {
        container_main.destroy();
        container_main = null;
    }

    // Reset button references
    btn_team = null;
    btn_fragment = null;

    // Reset state
    isOpen = false;

    // ⚠️ IMPORTANT: NO localStorage, sessionStorage, or socket auth cleanup here!
}

// ✅ Backward compatibility
function Destroy(scene) {
    DestroyCharacterInventory(scene);
}

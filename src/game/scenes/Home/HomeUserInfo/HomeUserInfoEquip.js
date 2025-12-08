// Removed Telegram SDK import - using window.open() instead

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";

import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";
import centerDataPlayer, {
    CenterDataPlayer,
} from "../../../Data/CenterDataPlayer.js";
import { CreateUserInfoEquipNeuralink } from "./HomeUserInfoEquipNeuralink.js";

let container_detail = null;

let container_detail_0 = null;

let container_detail_1 = null;

export function CreateUserInfoEquip(scene) {
    CreateLoadingPopup();

    let assetsToLoad = 2;
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();
            Create(scene);
        }
    };

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadShopInventory(() => {
        onAssetLoaded();
    });

    AssetLoadingManager.getInstance().lazyLoadUserInfo(() => {
        HideLoadingPopup();

        onAssetLoaded();
    });
}

function Create(scene) {
    //console.log("CreateNeuralinkUpgrade");

    Destroy();

    container_detail = scene.add.container(0, 0);
    container_detail.setDepth(300);

    container_detail_0 = scene.add.container(0, 0);
    container_detail.add(container_detail_0);

    container_detail_1 = scene.add.container(0, 0);
    container_detail.add(container_detail_1);

    const lock_bg = scene.add
        .image(0, 0, "home_user_info_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_detail_0.add(lock_bg);

    const lock_bg1 = scene.add
        .image(0, 0, "home_user_info_equip_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_detail_1.add(lock_bg1);

    container_detail_1.setPosition(-2000, 0);
    scene.tweens.add({
        targets: container_detail_1,
        x: 0,
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });

    const text_neuralink = scene.add
        .text(
            90,
            523,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Neuralink"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "left",
                wordWrap: { width: 611, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_detail_1.add(text_neuralink);

    const btn_neuralink_gunner = CreateButtonAddNeuralink(
        scene,
        container_detail_1,
        414 + 150 / 2,
        474 + 150 / 2,
        "home_user_info_equip_btn"
    );
    btn_neuralink_gunner.button.on("pointerdown", async function () {
        NeuralinkButtonClick(
            scene,
            btn_neuralink_gunner,
            centerDataPlayer.ROLE_KEY.gunner.KEY
        );
    });
    NeuralinkCheckImage(
        scene,
        btn_neuralink_gunner,
        centerDataPlayer.ROLE_KEY.gunner.KEY
    );

    const btn_neuralink_sniper = CreateButtonAddNeuralink(
        scene,
        container_detail_1,
        629 + 150 / 2,
        474 + 150 / 2,
        "home_user_info_equip_btn"
    );
    btn_neuralink_sniper.button.on("pointerdown", async function () {
        NeuralinkButtonClick(
            scene,
            btn_neuralink_sniper,
            centerDataPlayer.ROLE_KEY.sniper.KEY
        );
    });
    NeuralinkCheckImage(
        scene,
        btn_neuralink_sniper,
        centerDataPlayer.ROLE_KEY.sniper.KEY
    );

    const btn_neuralink_rocket = CreateButtonAddNeuralink(
        scene,
        container_detail_1,
        844 + 150 / 2,
        474 + 150 / 2,
        "home_user_info_equip_btn"
    );
    btn_neuralink_rocket.button.on("pointerdown", async function () {
        NeuralinkButtonClick(
            scene,
            btn_neuralink_rocket,
            centerDataPlayer.ROLE_KEY.rocket.KEY
        );
    });
    NeuralinkCheckImage(
        scene,
        btn_neuralink_rocket,
        centerDataPlayer.ROLE_KEY.rocket.KEY
    );

    const btn_close = scene.add
        .image(38 + 32 / 2, 98 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Destroy();
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_detail_1.add(btn_close);
}

export function NeuralinkCheckImage(scene, buttonContaier, role) {
    if (role == centerDataPlayer.ROLE_KEY.gunner.KEY) {
        if (
            centerData.userInfo.teamEquipment.gunner != null &&
            centerData.userInfo.teamEquipment.gunner.neuralink != null
        ) {
            let localItemData = centerDataItem.getItemById(
                centerData.userInfo.teamEquipment.gunner.neuralink
            );

            buttonContaier.button.setTexture(localItemData.imgKey);

            buttonContaier.button.setScale(150 / 350);
        } else {
            buttonContaier.button.setTexture("home_user_info_equip_btn");

            buttonContaier.button.setScale(1);
        }
    } else if (role == centerDataPlayer.ROLE_KEY.sniper.KEY) {
        if (
            centerData.userInfo.teamEquipment.sniper != null &&
            centerData.userInfo.teamEquipment.sniper.neuralink != null
        ) {
            let localItemData = centerDataItem.getItemById(
                centerData.userInfo.teamEquipment.sniper.neuralink
            );

            buttonContaier.button.setTexture(localItemData.imgKey);

            buttonContaier.button.setScale(150 / 350);
        } else {
            buttonContaier.button.setTexture("home_user_info_equip_btn");

            buttonContaier.button.setScale(1);
        }
    } else {
        if (
            centerData.userInfo.teamEquipment.rocket != null &&
            centerData.userInfo.teamEquipment.rocket.neuralink != null
        ) {
            let localItemData = centerDataItem.getItemById(
                centerData.userInfo.teamEquipment.rocket.neuralink
            );

            buttonContaier.button.setTexture(localItemData.imgKey);

            buttonContaier.button.setScale(150 / 350);
        } else {
            buttonContaier.button.setTexture("home_user_info_equip_btn");

            buttonContaier.button.setScale(1);
        }
    }
}

function NeuralinkButtonClick(scene, buttonContaier, role) {
    //console.log("NeuralinkButtonClick " + role);

    if (role == centerDataPlayer.ROLE_KEY.gunner.KEY) {
        if (
            centerData.userInfo.teamEquipment.gunner &&
            centerData.userInfo.teamEquipment.gunner.neuralink
        ) {
            NeuralinkUnequip(scene, buttonContaier, role);
        } else {
            OpenNeuralinkPopup(scene, buttonContaier, role);
        }
    } else if (role == centerDataPlayer.ROLE_KEY.sniper.KEY) {
        if (
            centerData.userInfo.teamEquipment.sniper &&
            centerData.userInfo.teamEquipment.sniper.neuralink
        ) {
            NeuralinkUnequip(scene, buttonContaier, role);
        } else {
            OpenNeuralinkPopup(scene, buttonContaier, role);
        }
    } else {
        if (
            centerData.userInfo.teamEquipment.rocket &&
            centerData.userInfo.teamEquipment.rocket.neuralink
        ) {
            NeuralinkUnequip(scene, buttonContaier, role);
        } else {
            OpenNeuralinkPopup(scene, buttonContaier, role);
        }
    }
}

function NeuralinkUnequip(scene, buttonContaier, role) {
    CreateLoadingPopup();
    centerData.RequestNeuralinkUnEquip(
        role,
        () => {
            HideLoadingPopup();

            CreateLoadingPopup();
            centerData.RequestUserInfo(
                () => {
                    HideLoadingPopup();

                    NeuralinkCheckImage(scene, buttonContaier, role);
                },
                () => {
                    HideLoadingPopup();
                }
            );
        },
        () => {
            HideLoadingPopup();
        }
    );
}

function OpenNeuralinkPopup(scene, buttonContaier, role) {
    CreateUserInfoEquipNeuralink(scene, buttonContaier, role);
}

function CreateButtonAddNeuralink(scene, container, x, y, imageKey) {
    let btnWidth = 150;
    let btnHeight = 150;

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

    return btn_container;
}

export function Destroy() {
    if (container_detail) {
        container_detail.destroy();

        container_detail = null;
    }
}

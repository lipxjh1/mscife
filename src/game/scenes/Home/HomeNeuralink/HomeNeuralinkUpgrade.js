import { openTelegramLink } from "@telegram-apps/sdk";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";

import { container_main, container_popup } from "./HomeNeuralink.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { CreateNeuralinkToUpgradePopupInput } from "./HomeNeuralinkUpgradePopupInput.js";
import { CreateHomeNeuralinkInventory } from "./HomeNeuralinkInventory.js";
import { CreateNeuralinkHistory } from "./HomeNeuralinkHistory.js";
import { CreateNeuralinkCenterMarket } from "../HomeNeuralinkCenterMarket/HomeNeuralinkCenterMarket.js";

let container_account = null;

let container_account_0 = null;

let container_account_1 = null;

let text_totalNeuralink = null;

let text_neuralinkToUpgrade = null;

let neuralinkInfo = null;

let Sample = {
    inventory: null,
    totalQuantity: 0,
    availableQuantity: 0,
    itemsInProcess: 2,
    affordableQuantity: 6866,
    upgradeRequirements: {
        initialCost: 1000,
        finalCost: 9000,
        waitDays: 20,
        refiningDays: 10,
    },
};

function CreateNeuralinkUpgrade(scene) {
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

    centerData.RequestInventory(
        (result) => {
            onAssetLoaded();
        },
        (error) => {
            onAssetLoaded();
        }
    );

    centerData.RequestNeuralinkInfo(
        (result) => {
            neuralinkInfo = result.data;
            onAssetLoaded();
        },
        (error) => {
            onAssetLoaded();
        }
    );
}

export function GetNeuralinkInfo() {
    if (!neuralinkInfo) {
        return {
            upgradeRequirements: {
                initialCost: 1000,
                finalCost: 9000,
                waitDays: 20,
                refiningDays: 10,
            },
        };
    }
    return neuralinkInfo;
}

export function ActiveNeuralinkUpgrade(scene, isActive) {
    if (container_account) {
        container_account.setVisible(isActive);
    } else if (container_account == null && isActive) {
        CreateNeuralinkUpgrade(scene);
    }
}

function Create(scene) {
    //console.log("CreateNeuralinkUpgrade");

    Destroy();

    container_account = scene.add.container(0, 0);
    container_popup.add(container_account);

    container_account_0 = scene.add.container(0, 0);
    container_account.add(container_account_0);

    container_account_1 = scene.add.container(0, 0);
    container_account.add(container_account_1);

    const lock_bg = scene.add
        .image(0, 0, "home_neuralink_upgrade_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_account_1.add(lock_bg);

    container_account_1.setPosition(-2000, 0);
    scene.tweens.add({
        targets: container_account_1,
        x: 0,
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });

    let inventoryItem = centerData.getItemOwnById("NEURALINK");
    const neuralinkQuantity = inventoryItem ? inventoryItem.quantity : 0;

    let neuralink_btn = scene.add
        .image(540, 593 + 350 / 2, "item_neuralink")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: neuralink_btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: neuralink_btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_account_1.add(neuralink_btn);

    text_totalNeuralink = scene.add
        .text(699, 930, neuralinkQuantity, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 1);
    container_account_1.add(text_totalNeuralink);
    
    const btn_market = CreateButton(
        scene,
        container_account_1,
        18 + 320 / 2,
        429 + 84 / 2,
        "home_neuralink_btn_0",
        "Market"
    );
    btn_market.button.on("pointerdown", async function () {
        //CreateNeuralinkCenterMarket(scene);
    });
    
    const btn_neuralink_items = CreateButton(
        scene,
        container_account_1,
        379 + 320 / 2,
        429 + 84 / 2,
        "home_neuralink_btn_0",
        "Neuralinks"
    );
    btn_neuralink_items.button.on("pointerdown", async function () {
        CreateHomeNeuralinkInventory(scene);
    });

    const btn_neuralink_history = CreateButton(
        scene,
        container_account_1,
        740 + 320 / 2,
        429 + 84 / 2,
        "home_neuralink_btn_0",
        "History"
    );
    btn_neuralink_history.button.on("pointerdown", async function () {
        CreateNeuralinkHistory(scene);
    });

    const btn_neuralink_upgrade = CreateButton1(
        scene,
        container_account_1,
        379 + 320 / 2,
        1636 + 128 / 2,
        "home_neuralink_btn_1",
        "Upgrade"
    );
    btn_neuralink_upgrade.button.on("pointerdown", async function () {
        const initialCost =
            neuralinkInfo?.upgradeRequirements?.initialCost || 1000;
        CreateNeuralinkToUpgradePopupInput(
            scene,
            neuralinkQuantity,
            centerData.userInfo.MSCI,
            initialCost,
            () => {
                centerData.RequestInventory(() => {
                    inventoryItem = centerData.getItemOwnById("NEURALINK");
                    const updatedQuantity = inventoryItem
                        ? inventoryItem.quantity
                        : 0;
                    text_totalNeuralink.setText("x" + updatedQuantity);
                });
            },
            null
        );
    });
}

function CreateButton(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 320;
    let btnHeight = 84;

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
            btnHeight / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "36px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    return btn_container;
}

function CreateButton1(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 320;
    let btnHeight = 128;

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
            btnHeight / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "50px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    return btn_container;
}

export function Destroy() {
    if (container_account) {
        container_account.destroy();

        container_account = null;
    }
}

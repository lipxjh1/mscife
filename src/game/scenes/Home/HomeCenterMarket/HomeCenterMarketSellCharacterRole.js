import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { GetRoleIcon } from "../../Share/CharacterCard.js";

import { container_center_market_sell_sub } from "./HomeCenterMarketSell.js";
import { CreateCenterMarketSellCharacterCode } from "./HomeCenterMarketSellCharacterCode.js";

import { Destroy as DestroyCharacterCode } from "./HomeCenterMarketSellCharacterCode.js";

import { Destroy as DestroyCharacterStar } from "./HomeCenterMarketSellCharacterStar.js";

import { Destroy as DestroyCharacterSelected } from "./HomeCenterMarketSellCharacterSelected.js";

let container_main = null;

let isOpen = false;

let groupRolePlayers = {};

export function CreateCenterMarketSellCharacterRole(scene) {
    //console.log("CreateCenterMarketCharacter");

    Destroy();

    isOpen = false;

    container_main = scene.add.container(0, 0);
    container_center_market_sell_sub.add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    RequestToSellList(scene);

    Open(scene);
}

export function GetRoleContainerMain() {
    return container_main;
}

export function getGroupRolePlayers() {
    return groupRolePlayers;
}

function groupUnlockedPlayersByRole() {
    groupRolePlayers = {};

    // Giả sử playerDict là một object chứa các object
    let playerDict = centerData.GetMergedCharacters();

    // Chuyển đổi object thành mảng bằng Object.values()
    let playerArray = Object.values(playerDict);

    playerArray.forEach((obj) => {
        if (centerData.selectedPlayerArr.includes(obj._id) == false) {
            let key = `${obj.role}_${obj.code}_${obj.star}_${obj.level}`;

            if (!groupRolePlayers[obj.role]) {
                groupRolePlayers[obj.role] = {};
            }

            if (!groupRolePlayers[obj.role][obj.code]) {
                groupRolePlayers[obj.role][obj.code] = {};
            }

            if (!groupRolePlayers[obj.role][obj.code][obj.star]) {
                groupRolePlayers[obj.role][obj.code][obj.star] = {};
            }

            if (!groupRolePlayers[obj.role][obj.code][obj.star][obj.level]) {
                groupRolePlayers[obj.role][obj.code][obj.star][obj.level] = {};
            }

            groupRolePlayers[obj.role][obj.code][obj.star][obj.level][obj._id] =
                obj;
        }
    });

    //console.log("groupUnlockedPlayersByRole: ", groupRolePlayers);
}

export function GetCharacterIdByRoleCodeStarLevel(role, code, star, level) {
    const firstChildKey = Object.keys(
        groupRolePlayers[role][code][star][level]
    )[0];

    return firstChildKey;
}

export function RequestToSellList(scene, onSuccess, onError) {
    RequestToSellCharacterListRole(
        () => {
            CreateCharacterList(scene);

            if (onSuccess && typeof onSuccess === "function") {
                onSuccess();
            }
        },
        () => {
            if (onError && typeof onError === "function") {
                onError();
            }
        }
    );
}

export function RequestToSellCharacterListRole(onSuccess, onError) {
    CreateLoadingPopup();

    centerData.RequestMergedCharacters(
        () => {
            HideLoadingPopup();

            groupUnlockedPlayersByRole();

            if (onSuccess && typeof onSuccess === "function") {
                onSuccess();
            }
        },
        () => {
            HideLoadingPopup();

            if (onError && typeof onError === "function") {
                onError();
            }
        }
    );
}

let container_character_list = null;

function DestroyCharacterList() {
    if (container_character_list) {
        container_character_list.destroy();
    }
}

export function CreateCharacterList(scene) {
    if (container_character_list) {
        container_character_list.destroy();
    }

    //Create friend list
    container_character_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_main.add(container_character_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1210;

    const columns = 1;
    const rows = Math.ceil(2 / columns);

    const itemWidth = 1020;
    const itemHeight = 215;
    const itemSpacing = 215 / 2 + 24 / 2;

    const posX = 0 + scrollViewWidth / 2;
    const posY = 583 + scrollViewHeight / 2;

    // const background = scene.add
    //     .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0xffffff)
    //     .setAlpha(0.5);
    // container_list.add(background);

    // Tạo một Scrollable Panel (bảng cuộn)
    const scrollablePanel = scene.rexUI.add
        .scrollablePanel({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            panel: {
                child: scene.rexUI.add.gridSizer({
                    width: scrollViewWidth,
                    height: scrollViewHeight,
                    column: columns,
                    row: rows,
                    columnProportions: 0,
                    rowProportions: 0,
                    space: {
                        column: itemSpacing,
                        row: itemSpacing,
                    },
                }),
                mask: {
                    padding: 1,
                },
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.2,
            },
            space: {
                left: 60,
                right: 0,
                top: 10,
                bottom: 215 / 2 + 24 / 2,
            },
        })
        .layout();

    container_character_list.add(scrollablePanel);

    let roleGroupKeys = Object.keys(groupRolePlayers);

    for (let i = 0; i < roleGroupKeys.length; i++) {
        let roleKey = roleGroupKeys[i];

        let roleGroup = groupRolePlayers[roleKey];

        let indexData = {
            roleKey: roleKey,
            roleGroup: roleGroup,
        };

        let container_item = CreateItem(scene, scrollablePanel, indexData);

        container_item.button_sell.button.on("pointerdown", function () {
            CreateCenterMarketSellCharacterCode(scene, roleKey);

            DestroyCharacterList();
        });
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_character_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateItem(scene, scrollablePanel, itemData) {
    //console.log("Character Role CreateItem itemData: ", itemData);

    let itemWidth = 1020;
    let itemHeight = 125;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add
        .image(0, 0, "home_center_market_main_element_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.icon = scene.add
        .image(
            28 + 100 / 2,
            itemHeight / 2 + 100 / 2,
            GetRoleIcon(item.itemData.roleKey)
        )
        .setOrigin(0.5, 0.5);
    container_inner.add(item.icon);

    item.text_name = scene.add
        .text(238, 33, item.itemData.roleKey, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "38px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_name);

    let count = 0;

    for (const characterCode in item.itemData.roleGroup) {
        const starLevels = item.itemData.roleGroup[characterCode];

        // Duyệt qua từng số sao
        for (const starLevel in starLevels) {
            const levels = starLevels[starLevel];

            // Duyệt qua từng cấp độ
            for (const level in levels) {
                const characterCodes = levels[level];

                // Đếm số lượng mã nhân vật trong tầng cuối cùng
                count += Object.keys(characterCodes).length;
            }
        }
    }

    item.text_quantity = scene.add
        .text(
            238,
            88,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Quantity"
            ) +
                ": " +
                count,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "left",
                stroke: "#000000",
                strokeThickness: 10,
                wordWrap: { width: 650, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_inner.add(item.text_quantity);

    item.button_sell = CreateButton0(
        scene,
        container_inner,
        779 + 218 / 2,
        63 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Select"
        )
    );

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

function CreateButton0(scene, container, x, y, buttonName) {
    let btnWidth = 218;
    let btnHeight = 98;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_center_market_button_0")
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
                cdLocalization.GROUP_KEYS.Main.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "38px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    btn_container.setSelected = function () {
        btn_container.button.disableInteractive();

        btn_inner_container.each(function (child) {
            if (child.setTint) {
                child.clearTint();
            }
        });
    };

    btn_container.setUnselected = function () {
        btn_container.button.setInteractive();

        btn_inner_container.each(function (child) {
            if (child.setTint) {
                child.setTint(0x9a9a9a);
            }
        });
    };

    return btn_container;
}

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen == true) return;

    isOpen = true;
}

export function Close(scene) {
    if (isOpen == false) return;

    isOpen = false;
    Destroy();
}

export function Destroy(scene) {
    if (container_main) {
        container_main.destroy();
    }

    DestroyCharacterCode(scene);

    DestroyCharacterStar(scene);

    DestroyCharacterSelected(scene);
}

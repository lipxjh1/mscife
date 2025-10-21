import centerData from "../../../Data/CenterData.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    container_main,
    container_popup,
    container_buttons,
} from "./HomeEarn.js";

import { CreateCharacterCard } from "../../Share/CharacterCard.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

let container_main_mint = null;

let container_popup_mint = null;
let container_popup_open_position = { x: 0, y: 0 };
let container_popup_close_position = { x: 0, y: 1920 };

let container_item_list = null;

let isOpen = false;

export function CreateMint(scene) {
    if (container_main_mint) {
        container_main_mint.destroy();
    }

    container_main_mint = scene.add.container(0, 0);
    container_popup.add(container_main_mint);

    container_popup_mint = scene.add.container(0, 0);
    container_main_mint.add(container_popup_mint);
    container_popup_mint.setDepth(101);

    UpdateCharactersInfo(scene);

    Open(scene);
}

function UpdateCharactersInfo(scene) {
    CreateLoadingPopup();

    centerData.RequestCharactersNFT(
        () => {
            HideLoadingPopup();

            CreateItemList(scene);
        },
        () => {
            HideLoadingPopup();
        }
    );
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    if (container_item_list != null) {
        container_item_list.destroy();
    }

    container_item_list = scene.add.container(0, 0);
    container_popup_mint.add(container_item_list);
    container_item_list.setDepth(102);

    let itemData = [];

    let playerDict = centerData.unlockedPlayerNFT;

    //let playerDict = centerData.GetMergedCharacters();

    //console.log("playerDict:", playerDict);

    // Lấy tất cả các key (tên nhân vật)
    let keys = Object.keys(playerDict);

    for (let i = 0; i < keys.length; i++) {
        //console.log(`playerDict[${keys[i]}]:`, playerDict[keys[i]]);

        let unlockedPlayer = playerDict[keys[i]];

        let pData = centerDataPlayer.getPlayerById(playerDict[keys[i]].code);

        //console.log("pData = ", pData);

        if (pData !== null) {
            const newItem = {
                unlockedPlayer: unlockedPlayer,
            };

            itemData.push(newItem);
        }
    }

    if (itemData.length == 0) {
        let text = scene.add
            .text(
                540,
                960,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeMint.KEY,
                    "No minted character found..."
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "60px",
                    color: "#ffffff",
                    align: "center",
                    wordWrap: { width: 1000, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5, 0.5);
        container_item_list.add(text);
    }

    const scrollViewWidth = 1080;

    const scrollViewHeight = 1712;

    const spaceWidth = 24;

    const spaceHeight = 30;

    const cellWidth = 320;

    const cellHeight = 445;

    const posX = 38 + scrollViewWidth / 2 + cellWidth / 2;

    const posY = 208 + scrollViewHeight / 2;

    const gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,

            table: {
                cellWidth: cellWidth + spaceWidth,
                cellHeight: cellHeight + spaceHeight,
                columns: 3,
                //reuseCellContainer: true, // Kích hoạt tái sử dụng cell container
            },

            mouseWheelScroller: {
                focus: false,
                speed: 1,
            },

            items: itemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: cellWidth,
                        height: cellHeight,
                        orientation: 0,
                    });
                } else {
                    //console.log(cell.index + ": reuse cell-container");
                }

                cellContainer.add(card_item(scene, index, item));

                return cellContainer;
            },

            space: {
                //left: 38,
                //right: 38,
                // top: 36,
                bottom: 15,
                // row: 0,
            },
        })
        .layout();

    gridTable.isDragging = false;

    scene.input.on("pointerup", (pointer) => {
        gridTable.isDragging = false;
    });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    gridTable.setT(1);
    gridTable.setT(0);

    // const gridOrigin = scene.rexUI.add.roundRectangle(
    //     gridTable.x,
    //     gridTable.y,
    //     50,
    //     50,
    //     0,
    //     0xffffff,
    //     1
    // );
    // container_item_list.add(gridOrigin);

    // const mask_zone = scene.rexUI.add.roundRectangle(
    //     540,
    //     324 + 1596 / 2 - 15,
    //     1080,
    //     1596,
    //     0,
    //     0x000000,
    //     0.5
    // );
    // container_item_list.add(mask_zone);

    const maskShape = scene.add
        .rectangle(540, 208 + 1712 / 2, 1080, 1712, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function card_item(scene, i, item) {
    //console.log("Item = ", item);

    const container_card = CreateCharacterCard(
        scene,
        item.unlockedPlayer._id,
        item.unlockedPlayer.code,
        item.unlockedPlayer.name,
        item.unlockedPlayer.role,
        item.unlockedPlayer.rank,
        item.unlockedPlayer.level,
        item.unlockedPlayer.star
    );

    return container_card;
}

export function IsOpen() {
    return isOpen;
}

let activeTween = null;
export function Open(scene) {
    if (isOpen == true) return;

    container_popup_mint.setPosition(
        container_popup_close_position.x,
        container_popup_close_position.y
    );

    if (activeTween) {
        activeTween.stop();
        scene.tweens.remove(activeTween);
    }

    activeTween = scene.tweens.add({
        targets: container_popup_mint,
        x: container_popup_open_position.x,
        y: container_popup_open_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            isOpen = true;
        },
    });
}

export function Close(scene) {
    if (isOpen == false) return;

    if (activeTween) {
        activeTween.stop();
        scene.tweens.remove(activeTween);
    }

    activeTween = scene.tweens.add({
        targets: container_popup_mint,
        x: container_popup_close_position.x,
        y: container_popup_close_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            isOpen = false;
            Destroy();
        },
    });
}

function Destroy(scene) {
    container_main_mint.destroy();
}

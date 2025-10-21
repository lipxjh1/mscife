import centerData from "../../Data/CenterData";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";
import centerDataItem from "../../Data/CenterDataItem.js";
import { playIdleAnimation, playAttackAnimation, playCustomAnimation } from "../../utils/spineUtils.js";

import { AssetLoadingManager } from "../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";

import { CreateCharacterCard } from "./CharacterCard";
import { CreatePieceCard } from "./PieceCard";
import cdLocalization from "../../Data/CenterDataLocalization.js";

export function CreateCharacterRewardPopup(
    scene,
    _id = "",
    code = "",
    name = "",
    role = "",
    rank = "",
    level = 1,
    star = 1
) {
    let arr_ids = [code];

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        arr_ids,
        () => {
            AssetsLoadDone();
        }
    );

    function AssetsLoadDone() {
        let container_main = scene.add.container(0, 0);
        container_main.setDepth(300);

        const lock_bg = scene.rexUI.add
            .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.8)
            .setInteractive();
        container_main.add(lock_bg);

        let container_popup = scene.add.container(0, 0);
        container_main.add(container_popup);

        container_popup.setPosition(0, 2000);

        let tween = scene.tweens.add({
            targets: container_popup,
            x: 0,
            y: 0, // Vị trí kết thúc
            duration: 500, // Thời gian tween
            ease: "Power2", // Kiểu easing
            onComplete: () => {
                scene.tweens.remove(tween);
            },
        });

        const popup_bg = scene.rexUI.add
            .roundRectangle(540, 468 + 920 / 2, 594, 902, 4, 0x000000, 0.4)
            .setStrokeStyle(1, 0xffffff);
        container_popup.add(popup_bg);

        let container_card = CreateCharacterCard(
            scene,
            _id,
            code,
            name,
            role,
            rank,
            level,
            star
        );
        container_card.setScale(490 / 319);
        container_card.setPosition(295 + 490 / 2, 506 + 682 / 2);
        container_popup.add(container_card);

        const btn_claim = CreateClaimButton(
            scene,
            container_popup,
            540,
            1226 + 106 / 2,
            "share_popup_reward_btn_claim",
            "Claim"
        );
        btn_claim.button.on("pointerdown", (pointer) => {
            scene.tweens.remove(tween);

            tween = scene.tweens.add({
                targets: container_popup,
                x: 0,
                y: 2000, // Vị trí kết thúc
                duration: 500, // Thời gian tween
                ease: "Power2", // Kiểu easing
                onComplete: () => {
                    scene.tweens.remove(tween);

                    container_main.destroy();
                },
            });
        });
    }
}

export function CreateMultiCharacterRewardPopup(scene, dataArr) {
    let arr_ids = [];

    let itemData = [];

    for (let i = 0; i < dataArr.length; i++) {
        let character_data = dataArr[i];

        let pData = centerDataPlayer.getPlayerById(character_data.code);

        if (pData !== null) {
            const newItem = {
                unlockedPlayer: character_data,
            };

            arr_ids.push(character_data.code);

            itemData.push(newItem);
        }
    }

    //console.log("CreateMultiCharacterRewardPopup itemData = ", itemData);

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        arr_ids,
        () => {
            AssetsLoadDone();
        }
    );

    function AssetsLoadDone() {
        let container_main = scene.add.container(0, 0);
        container_main.setDepth(300);

        let black_bg = scene.add
            .rectangle(540, 960, 1080, 1920, 0x000000)
            .setAlpha(0.8)
            .setInteractive();

        container_main.add(black_bg);

        const popup_bg = scene.rexUI.add.roundRectangle(
            106 + 867 / 2,
            324 + 1271 / 2,
            867,
            1271,
            4,
            0x202020,
            0.8
        );
        container_main.add(popup_bg);

        let container_item_list = scene.add.container(0, 0);
        container_main.add(container_item_list);

        let container_buttons = scene.add.container(0, 0);
        container_main.add(container_buttons);

        const btn_claim = CreateClaimButton(
            scene,
            container_buttons,
            540,
            1487 + 106 / 2,
            "share_popup_reward_btn_claim",
            "Claim"
        );
        btn_claim.button.on("pointerdown", (pointer) => {
            container_main.destroy();
        });

        const scrollViewWidth = 867;

        const scrollViewHeight = 1095;

        const spaceWidth = 36 / 2;

        const spaceHeight = 36 / 2;

        const cellWidth = 245;

        const cellHeight = 341;

        const posX = 136 + scrollViewWidth / 2 + cellWidth / 2 + spaceWidth;

        const posY = 354 + scrollViewHeight / 2;

        // const grid_bg = scene.rexUI.add.roundRectangle(
        //     posX,
        //     posY,
        //     scrollViewWidth,
        //     scrollViewHeight,
        //     0,
        //     0x000000,
        //     0.5
        // );
        // container_popup_select_popup.add(grid_bg);

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
                            width: width,
                            height: cellHeight,
                            orientation: 0,
                        });
                    } else {
                        //console.log(cell.index + ": reuse cell-container");
                    }

                    cellContainer.add(
                        CreateMultiCharacterRewardPopupItem(scene, index, item)
                    );

                    return cellContainer;
                },

                space: {
                    // left: 50,
                    // right: 0,
                    // top: 38,
                    // bottom: 0,
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

        const maskShape = scene.add
            .rectangle(540, 354 + 1095 / 2, scrollViewWidth, 1095, 0x000000)
            .setVisible(false);

        const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
        gridTable.setMask(mask);
    }
}

function CreateMultiCharacterRewardPopupItem(scene, i, item) {
    let container_card = CreateCharacterCard(
        scene,
        item.unlockedPlayer._id,
        item.unlockedPlayer.code,
        item.unlockedPlayer.name,
        item.unlockedPlayer.role,
        item.unlockedPlayer.rank,
        item.unlockedPlayer.level,
        item.unlockedPlayer.star
    );

    container_card.setScale(245 / 319);

    return container_card;
}

export function CreatePieceRewardPopup(scene, _id = "", code = "", name = "") {
    let container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const lock_bg = scene.rexUI.add
        .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.8)
        .setInteractive();
    container_main.add(lock_bg);

    let container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup.setPosition(0, 2000);

    let tween = scene.tweens.add({
        targets: container_popup,
        x: 0,
        y: 0, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            scene.tweens.remove(tween);
        },
    });

    const popup_bg = scene.rexUI.add
        .roundRectangle(540, 532 + 857 / 2, 623, 857, 4, 0x000000, 0.4)
        .setStrokeStyle(1, 0xffffff);
    container_popup.add(popup_bg);

    let piece1 = 0;
    let piece2 = 0;
    let piece3 = 0;
    let piece4 = 0;

    let piece_id_num = 0;

    if (code.includes("_fragment_1")) {
        piece1 = 1;
        piece_id_num = 1;
    }

    if (code.includes("_fragment_2")) {
        piece2 = 1;
        piece_id_num = 2;
    }

    if (code.includes("_fragment_3")) {
        piece3 = 1;
        piece_id_num = 3;
    }

    if (code.includes("_fragment_4")) {
        piece4 = 1;
        piece_id_num = 4;
    }

    let container_card = CreatePieceCard(
        scene,
        _id,
        code,
        piece1,
        piece2,
        piece3,
        piece4
    );
    container_card.setScale(575 / 512);
    container_card.setPosition(252 + 575 / 2, 556 + 575 / 2);
    container_popup.add(container_card);

    const text_id_num = scene.add
        .text(284, 588, piece_id_num + ".", {
            fontFamily: "Russo One",
            fontSize: "80px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_popup.add(text_id_num);

    const text_name = scene.add
        .text(540, 1169, name, {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_popup.add(text_name);

    const btn_claim = CreateClaimButton(
        scene,
        container_popup,
        540,
        1259 + 106 / 2,
        "share_popup_reward_btn_claim",
        "Claim"
    );
    btn_claim.button.on("pointerdown", (pointer) => {
        scene.tweens.remove(tween);

        tween = scene.tweens.add({
            targets: container_popup,
            x: 0,
            y: 2000, // Vị trí kết thúc
            duration: 500, // Thời gian tween
            ease: "Power2", // Kiểu easing
            onComplete: () => {
                scene.tweens.remove(tween);

                container_main.destroy();
            },
        });
    });
}

export function CreateItemRewardPopup(
    scene,
    _id = "",
    code = "",
    name = "",
    quantity = 0
) {
    let container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const lock_bg = scene.rexUI.add
        .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.8)
        .setInteractive();
    container_main.add(lock_bg);

    let container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    container_popup.setPosition(0, 2000);

    let tween = scene.tweens.add({
        targets: container_popup,
        x: 0,
        y: 0, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            scene.tweens.remove(tween);
        },
    });

    const popup_bg = scene.rexUI.add
        .roundRectangle(540, 532 + 857 / 2, 623, 857, 4, 0x000000, 0.4)
        .setStrokeStyle(1, 0xffffff);
    container_popup.add(popup_bg);

    let img_key = centerDataItem.getItemById(code).imgKey;

    let img_pos = { x: 252 + 575 / 2, y: 556 + 575 / 2 };

    let outLineWidth = 2;

    const outline_0 = scene.rexUI.add
        .roundRectangle(
            img_pos.x,
            img_pos.y,
            575 + outLineWidth,
            575 + outLineWidth,
            4,
            0xffffff
        )
        .setOrigin(0.5, 0.5);
    container_popup.add(outline_0);

    const outline_1 = scene.rexUI.add
        .roundRectangle(
            img_pos.x,
            img_pos.y,
            575 - outLineWidth,
            575 - outLineWidth,
            4,
            0x000000
        )
        .setOrigin(0.5, 0.5);
    container_popup.add(outline_1);

    const item_img = scene.add.image(0, 0, img_key).setOrigin(0.5, 0.5);
    item_img.setScale(575 / 512);
    item_img.setPosition(img_pos.x, img_pos.y);
    container_popup.add(item_img);

    const text_quantity = scene.add
        .text(791, 1044, quantity, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "60px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 0);
    container_popup.add(text_quantity);

    const text_name = scene.add
        .text(540, 1169, name, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "52px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_popup.add(text_name);

    const btn_claim = CreateClaimButton(
        scene,
        container_popup,
        540,
        1259 + 106 / 2,
        "share_popup_reward_btn_claim",
        "Claim"
    );
    btn_claim.button.on("pointerdown", (pointer) => {
        scene.tweens.remove(tween);

        tween = scene.tweens.add({
            targets: container_popup,
            x: 0,
            y: 2000, // Vị trí kết thúc
            duration: 500, // Thời gian tween
            ease: "Power2", // Kiểu easing
            onComplete: () => {
                scene.tweens.remove(tween);

                container_main.destroy();
            },
        });
    });
}

function CreateClaimButton(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 490;
    let btnHeight = 106;

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
                cdLocalization.GROUP_KEYS.Main.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "52px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0);

    btn_inner_container.add(text);

    return btn_container;
}

export function CreateItemBlindBagRewardPopup(scene, data) {
    let container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    const lock_bg = scene.rexUI.add
        .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.8)
        .setInteractive();
    container_main.add(lock_bg);

    let spine = scene.add.spine(540, 960, "x_force_box", "x_force_box_atlas");
    spine.setScale(2);
    container_main.add(spine);

    const animName = "animation";

    playCustomAnimation(spine, animName, false);

    // Tìm animation trong dữ liệu skeleton của spine
    const animation = spine.skeleton.data.findAnimation(animName);

    let animTime = 1;

    if (animation) {
        animTime = animation.duration; // Thời gian hoạt ảnh tính bằng giây
    }

    scene.time.delayedCall(animTime * 1000, () => {
        if (data.type == "chip") {
            CreateItemRewardPopup(scene, "", "Chip", "Chip", data.amount);
        } else if (data.type == "musk") {
            CreateItemRewardPopup(scene, "", "Musk", "M-Coin", data.amount);
        }
        if (data.type == "item") {
            CreateItemRewardPopup(
                scene,
                "",
                data.code,
                data.name,
                data.quantity
            );
        }

        container_main.destroy();
    });
}

let sample = [
    {
        itemCode: "MSCI_MEMORY",
        quantity: 1,
    },
    {
        itemCode: "MSCI_MEMORY",
        quantity: 5,
    },
];

export function CreateMultiItemRewardPopup(scene, dataArr) {
    //dataArr = sample;

    //console.log("CreateMultiItemRewardPopup dataArr = ", dataArr);

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadItems(() => {
        AssetsLoadDone();
    });

    function AssetsLoadDone() {
        let container_main = scene.add.container(0, 0);
        container_main.setDepth(300);

        let black_bg = scene.add
            .rectangle(540, 960, 1080, 1920, 0x000000)
            .setAlpha(0.8)
            .setInteractive();

        container_main.add(black_bg);

        const popup_bg = scene.rexUI.add.roundRectangle(
            106 + 867 / 2,
            324 + 1271 / 2,
            867,
            1271,
            4,
            0x202020,
            0.8
        );
        container_main.add(popup_bg);

        let container_item_list = scene.add.container(0, 0);
        container_main.add(container_item_list);

        let container_buttons = scene.add.container(0, 0);
        container_main.add(container_buttons);

        const btn_claim = CreateClaimButton(
            scene,
            container_buttons,
            540,
            1487 + 106 / 2,
            "share_popup_reward_btn_claim",
            "Claim"
        );
        btn_claim.button.on("pointerdown", (pointer) => {
            container_main.destroy();
        });

        const scrollViewWidth = 867;

        const scrollViewHeight = 1095;

        const spaceWidth = 36 / 2;

        const spaceHeight = 36 / 2;

        const cellWidth = 245;

        const cellHeight = 245;

        const posX = 136 + scrollViewWidth / 2 + cellWidth / 2 + spaceWidth;

        const posY = 354 + scrollViewHeight / 2;

        // const grid_bg = scene.rexUI.add.roundRectangle(
        //     posX,
        //     posY,
        //     scrollViewWidth,
        //     scrollViewHeight,
        //     0,
        //     0x000000,
        //     0.5
        // );
        // container_popup_select_popup.add(grid_bg);

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

                items: dataArr, // Gán danh sách item vào gridTable

                createCellContainerCallback: (cell, cellContainer) => {
                    var scene = cell.scene,
                        width = cell.width,
                        height = cell.height,
                        item = cell.item,
                        index = cell.index;
                    if (cellContainer === null) {
                        cellContainer = scene.rexUI.add.label({
                            width: width,
                            height: cellHeight,
                            orientation: 0,
                        });
                    } else {
                        //console.log(cell.index + ": reuse cell-container");
                    }

                    cellContainer.add(
                        CreateMultiItemRewardPopupItem(scene, index, item)
                    );

                    return cellContainer;
                },

                space: {
                    // left: 50,
                    // right: 0,
                    // top: 38,
                    // bottom: 0,
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

        const maskShape = scene.add
            .rectangle(540, 354 + 1095 / 2, scrollViewWidth, 1095, 0x000000)
            .setVisible(false);

        const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
        gridTable.setMask(mask);
    }
}

function CreateMultiItemRewardPopupItem(scene, i, item) {
    let container_card = CreateItemCard(
        scene,
        "noId",
        item.itemCode,
        "noName",
        item.quantity
    );

    container_card.setScale(220 / 240);

    return container_card;
}

export function CreateItemCard(scene, _id, code, name, quantity) {
    const container_card = scene.add.container(0, 0);

    container_card._id = _id;
    container_card.code = code;
    container_card.name = name;
    container_card.quantity = quantity;
    container_card.localItemData = centerDataItem.getItemById(
        container_card.code
    );

    container_card.container_card_inner = scene.add.container(
        -220 / 2,
        -220 / 2
    );
    container_card.add(container_card.container_card_inner);

    const background = scene.add
        .image(0, 0, "share_item_card_bg")
        .setOrigin(0, 0);
    container_card.container_card_inner.add(background);
    container_card.background = background;

    const item_img = scene.add
        .image(220 / 2, 220 / 2, container_card.localItemData.imgKey)
        .setOrigin(0.5, 0.5)
        .setScale(180 / 350);
    container_card.container_card_inner.add(item_img);

    if (container_card.quantity) {
        const item_text_quantity = scene.add
            .text(230, 230, "x" + container_card.quantity, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#ffffff",
                align: "right",
                stroke: "#000",
                strokeThickness: 4,
            })
            .setOrigin(1, 1);
        container_card.container_card_inner.add(item_text_quantity);
    }

function getFragmentId(number) {
    switch(number) {
        case "1":
            return "I";
        case "2":
            return "II";
        case "3":
            return "III";
        case "4":
            return "IV";
        default:
            return "I";
    }
}
    
    if(code.includes("_fragment_")) {

        let fragment_id = code.split("_fragment_")[1];

        const item_text_fragment = scene.add
            .text(0, 0, getFragmentId(fragment_id), 
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#ffffff",
                align: "left",
                stroke: "#000",
                strokeThickness: 4,
            })
            .setOrigin(0, 0);
        container_card.container_card_inner.add(item_text_fragment);
        }

    return container_card;
}


import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";

import { container_main, container_popup } from "./HomeUserInfo.js";
import { GetRoleIcon } from "../../Share/CharacterCard.js";
import centerDataAvatar from "../../../Data/CenterDataAvatar.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

let container_rank = null;

let container_rank_0 = null;

let container_item_list = null;

let container_rank_1 = null;

function CreateRank(scene) {
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

    centerData.RequestRank(
        (result) => {
            onAssetLoaded();
        },
        (error) => {
            onAssetLoaded();
        }
    );

    centerData.RequestMyRank(
        (result) => {
            onAssetLoaded();
        },
        (error) => {
            onAssetLoaded();
        }
    );
}

export function ActiveRank(scene, isActive) {
    if (container_rank) {
        container_rank.setVisible(isActive);
    } else if (container_rank == null && isActive) {
        CreateRank(scene);
    }
}

function Create(scene) {
    //console.log("CreateAccount");

    Destroy();

    container_rank = scene.add.container(0, 0);
    container_popup.add(container_rank);

    container_rank_0 = scene.add.container(0, 0);
    container_rank.add(container_rank_0);

    container_rank_1 = scene.add.container(0, 0);
    container_rank.add(container_rank_1);

    const lock_bg = scene.add
        .image(0, 0, "home_user_info_rank_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_rank_0.add(lock_bg);

    container_rank_0.setPosition(-2000, 0);
    scene.tweens.add({
        targets: container_rank_0,
        x: 0,
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });

    if (centerData.myRank.rank > 0) {
        let text_top = scene.add
            .text(845, 688, "TOP " + centerData.myRank.rank, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#FFFF7E",
                align: "center",
            })
            .setOrigin(0.5, 0);
        container_rank_0.add(text_top);
    }

    if (centerData.myRank.rank === 1) {
        const icon_top_1 = scene.add
            .image(845, 545, "home_user_info_rank_icon_top_1")
            .setOrigin(0.5, 0.5)
            .setScale(331 / 165);
        container_rank_0.add(icon_top_1);
    } else if (centerData.myRank.rank === 2) {
        const icon_top_2 = scene.add
            .image(845, 545, "home_user_info_rank_icon_top_2")
            .setOrigin(0.5, 0.5)
            .setScale(331 / 165);
        container_rank_0.add(icon_top_2);
    } else if (centerData.myRank.rank === 3) {
        const icon_top_3 = scene.add
            .image(845, 545, "home_user_info_rank_icon_top_3")
            .setOrigin(0.5, 0.5)
            .setScale(331 / 165);
        container_rank_0.add(icon_top_3);
    }

    let gunnerPower = 0;
    let sniperPower = 0;
    let rocketPower = 0;
    let totalPower = 0;

    for (let i = 0; i < centerData.selectedPlayerArr.length; i++) {
        let unlockedPlayer = centerData.getUnlockedPlayerById(
            centerData.selectedPlayerArr[i]
        );

        if (unlockedPlayer.role === "gunner") {
            gunnerPower += GetAtkDamage(unlockedPlayer);
        } else if (unlockedPlayer.role === "sniper") {
            sniperPower += GetAtkDamage(unlockedPlayer);
        } else if (unlockedPlayer.role === "rocket") {
            rocketPower += GetAtkDamage(unlockedPlayer);
        }
    }

    totalPower = gunnerPower + sniperPower + rocketPower;

    const icon_gunner = scene.add
        .image(62, 600, GetRoleIcon("gunner"))
        .setOrigin(0, 0)
        .setTint(0xc0c0c0)
        .setScale(40 / 105);
    container_rank_0.add(icon_gunner);

    let text_damage_gunner = scene.add
        .text(icon_gunner.x + icon_gunner.width / 2 + 10, 603, gunnerPower, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#C0C0C0",
            align: "left",
        })
        .setOrigin(0, 0);
    container_rank_0.add(text_damage_gunner);

    const icon_sniper = scene.add
        .image(249, 600, GetRoleIcon("sniper"))
        .setOrigin(0, 0)
        .setTint(0xc0c0c0)
        .setScale(40 / 105);
    container_rank_0.add(icon_sniper);

    let text_damage_sniper = scene.add
        .text(icon_sniper.x + icon_sniper.width / 2 + 10, 603, sniperPower, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#C0C0C0",
            align: "left",
        })
        .setOrigin(0, 0);
    container_rank_0.add(text_damage_sniper);

    const icon_rocket = scene.add
        .image(425, 600, GetRoleIcon("rocket"))
        .setOrigin(0, 0)
        .setTint(0xc0c0c0)
        .setScale(40 / 105);
    container_rank_0.add(icon_rocket);

    let text_damage_rocket = scene.add
        .text(icon_rocket.x + icon_rocket.width / 2 + 10, 603, rocketPower, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#C0C0C0",
            align: "left",
        })
        .setOrigin(0, 0);
    container_rank_0.add(text_damage_rocket);

    let text_damage_total = scene.add
        .text(
            62,
            655,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeRank.KEY,
                "Your Power: "
            ) + totalPower,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_rank_0.add(text_damage_total);

    // Lấy tổng số người chơi từ cấu trúc mới (totalUsers) hoặc rơi về cấu trúc cũ (count)
    const totalUsers =
        (centerData.myRank &&
            (centerData.myRank.totalUsers || centerData.myRank.count)) ||
        0;

    let text_total_users = scene.add
        .text(
            62,
            705,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeRank.KEY,
                "Total users: "
            ) + totalUsers,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_rank_0.add(text_total_users);

    CreateItemList(scene);
}

function GetAtkDamage(unlockedPlayer) {
    let atkDamage = unlockedPlayer.properties.attachDamage;

    if (unlockedPlayer.role === centerDataPlayer.ROLE_KEY.gunner.KEY) {
        if (
            centerData.userInfo.teamEquipment.gunner &&
            centerData.userInfo.teamEquipment.gunner.neuralink
        ) {
            atkDamage +=
                atkDamage *
                (centerData.getItemBaseById(
                    centerData.userInfo.teamEquipment.gunner.neuralink
                ).properties.powerBonus /
                    100);
        }
    } else if (unlockedPlayer.role === centerDataPlayer.ROLE_KEY.sniper.KEY) {
        if (
            centerData.userInfo.teamEquipment.sniper &&
            centerData.userInfo.teamEquipment.sniper.neuralink
        ) {
            atkDamage +=
                atkDamage *
                (centerData.getItemBaseById(
                    centerData.userInfo.teamEquipment.sniper.neuralink
                ).properties.powerBonus /
                    100);
        }
    } else if (unlockedPlayer.role === centerDataPlayer.ROLE_KEY.rocket.KEY) {
        if (
            centerData.userInfo.teamEquipment.rocket &&
            centerData.userInfo.teamEquipment.rocket.neuralink
        ) {
            atkDamage +=
                atkDamage *
                (centerData.getItemBaseById(
                    centerData.userInfo.teamEquipment.rocket.neuralink
                ).properties.powerBonus /
                    100);
        }
    }

    return atkDamage;
}

function CreateItemList(scene) {
    // Tạo bảng gridTable và gán các item vào

    if (container_item_list != null) {
        container_item_list.destroy();
    }

    container_item_list = scene.add.container(0, 0);
    container_rank_0.add(container_item_list);

    let itemData = [];

    let rankArr = centerData.rankArr;

    for (let i = 0; i < rankArr.length; i++) {
        itemData.push(rankArr[i]);
    }

    const scrollViewWidth = 1080;

    const scrollViewHeight = 1044;

    const spaceWidth = 0;

    const spaceHeight = 0;

    const cellWidth = 935;

    const cellHeight = 252;

    const posX = 72 + scrollViewWidth / 2;

    const posY = 876 + scrollViewHeight / 2;

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
                columns: 1,
                reuseCellContainer: true, // Kích hoạt tái sử dụng cell container
            },

            slider: {
                track: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    0x000000,
                    0.3
                ),
                thumb: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    30,
                    10,
                    0xcccccc
                ),
            },

            mouseWheelScroller: {
                focus: false,
                speed: 1,
            },

            items: itemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    // Chỉ tạo card một lần
                    cellContainer = createRankCard(scene);
                }

                // Cập nhật nội dung của card với dữ liệu mới
                cellContainer.updateContent(item, index);

                return cellContainer;
            },

            space: {
                // left: 21,
                // right: 21,
                top: 15,
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

    // const shape = scene.add.rectangle(540, 959 + 961 / 2, 1080, 961, 0xffffff);

    // container_popup.add(shape);

    const maskShape = scene.add
        .rectangle(540, 876 + 1044 / 2, 1080, 1044, 0x000000)
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function createRankCard(scene) {
    const itemWidth = 935;
    const itemHeight = 252;

    const container_card = scene.add.container(0, 0);
    container_card.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(0, 0);
    container_card.add(container_inner);

    // Tạo các phần tử UI cơ bản
    const background = scene.add
        .image(0, 0, "home_user_info_rank_label")
        .setOrigin(0, 0);
    container_inner.add(background);

    const background_top1 = scene.add
        .image(0, 0, "home_user_info_rank_label_top_1")
        .setOrigin(0, 0)
        .setVisible(false);
    container_inner.add(background_top1);

    const background_top2 = scene.add
        .image(0, 0, "home_user_info_rank_label_top_2")
        .setOrigin(0, 0)
        .setVisible(false);
    container_inner.add(background_top2);

    const background_top3 = scene.add
        .image(0, 0, "home_user_info_rank_label_top_3")
        .setOrigin(0, 0)
        .setVisible(false);
    container_inner.add(background_top3);

    const icon_top_1 = scene.add
        .image(65, 65, "home_user_info_rank_icon_top_1")
        .setOrigin(0.5, 0.5)
        .setVisible(false);
    container_inner.add(icon_top_1);

    const icon_top_2 = scene.add
        .image(65, 65, "home_user_info_rank_icon_top_2")
        .setOrigin(0.5, 0.5)
        .setVisible(false);
    container_inner.add(icon_top_2);

    const icon_top_3 = scene.add
        .image(65, 65, "home_user_info_rank_icon_top_3")
        .setOrigin(0.5, 0.5)
        .setVisible(false);
    container_inner.add(icon_top_3);

    // Avatar
    let avatar = scene.add
        .image(241 + 160 / 2, 52 + 160 / 2, "home_top_bar_player_avatar")
        .setOrigin(0.5, 0.5)
        .setScale(160 / 220);
    container_inner.add(avatar);

    // Thông tin xếp hạng
    let text_position = scene.add
        .text(122, 148, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "64px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_inner.add(text_position);

    let text_name = scene.add
        .text(410, 52, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "42px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_inner.add(text_name);

    let text_id = scene.add
        .text(410, 107, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#e9e9e9",
            align: "left",
        })
        .setOrigin(0, 0);
    container_inner.add(text_id);

    let text_power = scene.add
        .text(410, 171, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#e9e9e9",
            align: "left",
        })
        .setOrigin(0, 0);
    container_inner.add(text_power);

    // Hàm cập nhật nội dung
    container_card.updateContent = function (item, index) {
        // Ẩn tất cả các background và icon
        background.setVisible(true);
        background_top1.setVisible(false);
        background_top2.setVisible(false);
        background_top3.setVisible(false);
        icon_top_1.setVisible(false);
        icon_top_2.setVisible(false);
        icon_top_3.setVisible(false);

        // Hiển thị các background và icon theo thứ hạng
        if (index === 0) {
            background.setVisible(false);
            background_top1.setVisible(true);
            icon_top_1.setVisible(true);
        } else if (index === 1) {
            background.setVisible(false);
            background_top2.setVisible(true);
            icon_top_2.setVisible(true);
        } else if (index === 2) {
            background.setVisible(false);
            background_top3.setVisible(true);
            icon_top_3.setVisible(true);
        }

        // Cập nhật avatar (hỗ trợ key mới và cũ)
        const avatarKey = item.avatar || item.Avatar || "";
        if (avatarKey && centerDataAvatar.isExist(avatarKey)) {
            avatar.setTexture(avatarKey);
            avatar.setScale(160 / 256);
        } else {
            let randomAvatarKey = centerDataAvatar.getRandomFreeAvatar();
            avatar.setTexture(randomAvatarKey);
            avatar.setScale(160 / 256);
        }

        // Lấy dữ liệu theo cấu trúc mới, rơi về cấu trúc cũ khi cần
        const displayRank = item.rank != null ? item.rank : index + 1;
        const displayName = item.username || item.Username || "";
        const displayUserId = item.userId || item.UserId || "";
        const displayPower = item.score != null ? item.score : 0;

        // Cập nhật thông tin xếp hạng
        text_position.setText(`${displayRank}.`);
        text_name.setText(displayName);
        text_id.setText(displayUserId);
        text_power.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeRank.KEY,
                "Power: "
            ) + displayPower
        );
    };

    // const debugRect = scene.add.rectangle(0, 0, itemWidth, itemHeight, 0x00ff00, 0).setOrigin(0, 0);
    // debugRect.setStrokeStyle(2, 0x00ff00, 1);
    // container_card.add(debugRect);

    return container_card;
}

export function Destroy() {
    if (container_rank) {
        container_rank.destroy();

        container_rank = null;
    }
}

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

let container_rank = null;

let container_rank_0 = null;

let container_rank_1 = null;

let currentNetworkIndex = 0;

let sampleData = {
    f1Users: [
        {
            _id: "678621a076ebc9af17e4a82f",
            TelegramId: 5781740370,
            InviteBy: "A000000010",
            InviteCount: 6,
            Username: "Jenny_DeFiX",
            Chip: 1055900,
            AutoRemainingTime: "1970-01-01T00:00:00.000Z",
            CheckedinDay: ["2025-01-27", "2025-01-28"],
            Musk: 10,
            originalMusk: 10,
            hasDeposited: false,
            inviteRewardLevel: 0,
            SpentMusk: 44710,
            F1SpentMusk: 0,
            F2SpentMusk: 0,
            F3SpentMusk: 0,
            F4SpentMusk: 0,
            F5SpentMusk: 0,
            Parent1: "67810d6204fdfafa48bba99b",
            Parent2: null,
            Parent3: null,
            Parent4: null,
            Parent5: null,
            battleCharacters: [
                "678671df76ebc9af17ed74c4",
                "678750e676ebc9af17f672b7",
                "678b4a623860c61288f1d0cf",
            ],
            CurrentStage: 1,
            Quests: [],
            UserId: "A00002260",
            createdAt: "2025-01-14T08:34:40.585Z",
            updatedAt: "2025-01-28T09:34:16.277Z",
            __v: 34,
            WalletId: "",
            ConsecutiveCheckinDays: 0,
            DailyPointReward: 0,
            Power: 404,
            LastCheckinDate: "2025-01-28T09:34:16.247Z",
        },
        {
            _id: "6785f81c76ebc9af17e205c9",
            TelegramId: 5875444430,
            InviteBy: "A000000010",
            InviteCount: 0,
            Username: "Mrbin2004",
            Chip: 92500,
            AutoRemainingTime: "1970-01-01T00:00:00.000Z",
            CheckedinDay: [],
            Musk: 8800,
            originalMusk: 8800,
            hasDeposited: false,
            inviteRewardLevel: 0,
            SpentMusk: 1200,
            F1SpentMusk: 0,
            F2SpentMusk: 0,
            F3SpentMusk: 0,
            F4SpentMusk: 0,
            F5SpentMusk: 0,
            Parent1: "67810d6204fdfafa48bba99b",
            Parent2: null,
            Parent3: null,
            Parent4: null,
            Parent5: null,
            battleCharacters: [
                "6785f88176ebc9af17e208bd",
                "6785f90576ebc9af17e21769",
                "6785f92c76ebc9af17e21a6e",
            ],
            CurrentStage: 1,
            Quests: [],
            UserId: "A00002254",
            createdAt: "2025-01-14T05:37:32.386Z",
            updatedAt: "2025-01-28T04:22:09.352Z",
            __v: 9,
            WalletId: "UQAjnu_nzcJm0sHSSxW6ylN_7j4XVzEwlgPdCl9I1HCg0EvE",
            DailyPointReward: 0,
            Power: 106,
        },
    ],
    pagination: {
        currentPage: 3,
        totalPages: 7,
        totalF1Users: 69,
    },
};

let netWorkObj = [
    {
        _id: "67810d6204fdfafa48bba99b",
        Username: "",
        avatarKey: "",
        container_network_index: null,
        f1Users: [],
        pagination: {
            currentPage: 3,
            totalPages: 7,
            totalF1Users: 69,
        },
    },
];

function CreateNetwork(scene) {
    CreateLoadingPopup();

    centerData.RequestInviteFriend(
        (result) => {
            HideLoadingPopup();
            Create(scene);
        },
        (error) => {
            HideLoadingPopup();
        }
    );
}

export function ActiveNetwork(scene, isActive) {
    if (container_rank) {
        container_rank.setVisible(isActive);
    } else if (container_rank == null && isActive) {
        CreateNetwork(scene);
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

    container_rank_0.setPosition(-2000, 0);
    scene.tweens.add({
        targets: container_rank_0,
        x: 0,
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {},
    });

    netWorkObj = [];

    currentNetworkIndex = 0;

    RequestNetwork(
        scene,
        1,
        centerData.userInfo._id,
        centerData.userInfo.Username,
        centerData.userInfo.Avatar
    );
}

let isUpdating = false;

function RequestNetwork(scene, page, _id, Username, avatarKey) {
    if (isUpdating) return;

    isUpdating = true;

    CreateLoadingPopup();

    centerData.RequestNetwork(
        page,
        _id,
        (result) => {
            isUpdating = false;

            HideLoadingPopup();

            if (netWorkObj[currentNetworkIndex] == null) {
                if (netWorkObj && netWorkObj[currentNetworkIndex - 1] != null) {
                    scene.tweens.add({
                        targets:
                            netWorkObj[currentNetworkIndex - 1]
                                .container_network_index,
                        x: -5000,
                        duration: 500, // Thời gian tween
                        ease: "Power2", // Kiểu easing
                        onComplete: () => {},
                    });
                }

                CreateItemList(
                    scene,
                    _id,
                    Username,
                    avatarKey,
                    result.data,
                    currentNetworkIndex
                );
            } else {
                CreateUpdateItemList(
                    scene,
                    _id,
                    result.data,
                    currentNetworkIndex
                );
            }
        },
        (error) => {
            isUpdating = false;

            HideLoadingPopup();

            CreateAlertPopup(
                scene,
                "Request network users failed\n" + error.message
            );
        }
    );
}

function CreateItemList(scene, _id, Username, avatarKey, data, networkIndex) {
    //console.log("CreateItemList:", data);

    // Tạo bảng gridTable và gán các item vào

    let container_network_index = scene.add.container(0, 0);
    container_rank_0.add(container_network_index);

    const lock_bg = scene.add
        .image(0, 0, "home_user_info_network_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_network_index.add(lock_bg);

    let container_info_0 = scene.add.container(0, 0);
    container_network_index.add(container_info_0);
    container_network_index.container_info = container_info_0;

    let container_info_1 = scene.add.container(0, 0);
    container_network_index.add(container_info_1);
    container_network_index.container_info = container_info_1;

    let text_member = scene.add
        .text(
            540,
            459,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeNetwork.KEY,
                "Network members: "
            ) + data.pagination.totalF1Users,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0);
    container_info_1.add(text_member);

    const avatar = scene.add
        .image(540, 558 + 238 / 2, "home_top_bar_player_avatar")
        .setOrigin(0.5, 0.5);
    container_info_0.add(avatar);

    if (avatarKey && avatarKey !== "" && centerDataAvatar.isExist(avatarKey)) {
        avatar.setTexture(avatarKey);
        avatar.setScale(211 / 256);
    } else {
        let randomAvatarKey = centerDataAvatar.getRandomFreeAvatar();

        avatar.setTexture(randomAvatarKey);
        avatar.setScale(211 / 256);
    }

    let text = scene.add
        .text(540, 766, Username, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_info_1.add(text);

    // const bg_text = scene.add
    //     .rectangle(
    //         540,
    //         766 + 68 / 2,
    //         text.width + 32,
    //         text.height + 18,
    //         0x000000
    //     )
    //     .setAlpha(0.6);
    // container_info_0.add(bg_text);

    let container_item_list = scene.add.container(0, 0);
    container_network_index.add(container_item_list);
    container_network_index.container_item_list = container_item_list;

    let container_network_buttons = scene.add.container(0, 0);
    container_network_index.add(container_network_buttons);
    container_network_index.container_network_buttons =
        container_network_buttons;

    let lockItemInteractive = scene.add
        .container(540, 1047 / 2)
        .setSize(1080, 1047)
        .setInteractive();
    container_network_buttons.add(lockItemInteractive);

    let lastX = 58;

    for (let i = 0; i <= currentNetworkIndex; i++) {
        let btn_container = CreateNetworkIndexButton(scene, i);

        btn_container.setPosition(
            lastX + btn_container.width / 2,
            880 + 52 / 2
        );

        lastX = lastX + btn_container.width + 108;

        container_network_buttons.add(btn_container);
    }

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 893;

    const itemWidth = 1080;
    const itemHeight = 120;
    const itemSpacing = 0;

    const posX = scrollViewWidth / 2;
    const posY = 1047 + scrollViewHeight / 2;

    // Tạo gridTable để hiển thị danh sách
    const gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            table: {
                cellWidth: itemWidth,
                cellHeight: itemHeight,
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
                speed: 0.2,
            },
            items: data.f1Users,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo cell một lần
                    cellContainer = createNetworkItem(scene);
                }

                // Cập nhật nội dung của cell với dữ liệu mới
                cellContainer.updateContent(item, networkIndex);

                return cellContainer;
            },
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            },
        })
        .layout();

    // Xử lý sự kiện cuộn
    gridTable.on("scroll", function () {
        if (gridTable.t > 0.9 && !isUpdating) {
            let pagination = netWorkObj[networkIndex].pagination;
            if (pagination.currentPage < pagination.totalPages) {
                RequestNetwork(
                    scene,
                    pagination.currentPage + 1,
                    netWorkObj[networkIndex]._id,
                    netWorkObj[networkIndex].Username,
                    netWorkObj[networkIndex].avatarKey
                );
            }
        }
    });

    // Xử lý sự kiện click vào cell
    gridTable.on("cell.click", function (cellContainer, cellIndex) {
        if (cellContainer && cellContainer.itemData) {
            ItemClick(
                scene,
                cellContainer.itemData._id,
                cellContainer.itemData.Username,
                cellContainer.itemData.Avatar
            );
        }
    });

    gridTable.on("cell.over", function (cellContainer, cellIndex) {
        if (cellContainer && cellContainer.itemData) {
            cellContainer.container_inner.list.forEach((child) => {
                if (child.setTint) {
                    child.setTint(0x646464);
                }
            });
        }
    });

    gridTable.on("cell.out", function (cellContainer, cellIndex) {
        if (cellContainer && cellContainer.itemData) {
            cellContainer.container_inner.list.forEach((child) => {
                if (child.clearTint) {
                    child.clearTint();
                }
            });
        }
    });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    netWorkObj.push({
        _id: _id,
        Username: Username,
        avatarKey: avatarKey,
        container_network_index: container_network_index,
        f1Users: data.f1Users,
        pagination: data.pagination,
    });

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function CreateNetworkIndexButton(scene, networkIndex) {
    const item_container = scene.add.container(0, 0);

    let container_inner = scene.add.container(0, 0);
    item_container.add(container_inner);
    item_container.container_inner = container_inner;

    let word = "NetWork Index";

    switch (networkIndex) {
        case 0: {
            word = "First";
            break;
        }
        case 1: {
            word = "Second";
            break;
        }
        case 2: {
            word = "Third";
            break;
        }
        case 3: {
            word = "Fourth";
            break;
        }
        case 4: {
            word = "Fifth";
            break;
        }
    }

    let text = scene.add
        .text(
            0,
            0,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeNetwork.KEY,
                word
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#B9B9B9",
                align: "left",
            }
        )
        .setOrigin(0.5, 0.5)
        .setDepth(1)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function (pointer) {
            for (let i = 0; i <= currentNetworkIndex; i++) {
                if (i > networkIndex) {
                    netWorkObj[i].container_network_index.destroy();
                }
            }

            currentNetworkIndex = networkIndex;

            let newArr = netWorkObj.slice(0, networkIndex + 1);

            netWorkObj = newArr;

            //console.log("Back to net work:", netWorkObj);

            scene.tweens.add({
                targets:
                    netWorkObj[currentNetworkIndex].container_network_index,
                x: 0,
                duration: 500, // Thời gian tween
                ease: "Power2", // Kiểu easing
                onComplete: () => {},
            });
        });
    item_container.add(text);

    item_container.setSize(text.width, text.height);

    if (networkIndex == currentNetworkIndex) {
        const bg = scene.add
            .rectangle(0, 0, text.width + 20, text.height + 20, 0x4f4f4f)
            .setAlpha(0.6)
            .setDepth(0);

        item_container.add(bg);
    }

    return item_container;
}

function CreateUpdateItemList(scene, _id, data, networkIndex) {
    let gridTable =
        netWorkObj[networkIndex].container_network_index.container_item_list
            .gridTable;

    // Lấy các item hiện tại và thêm các item mới
    let currentItems = [...netWorkObj[networkIndex].f1Users];
    let newItems = [...currentItems, ...data.f1Users];

    // Cập nhật dữ liệu trong netWorkObj
    netWorkObj[networkIndex].f1Users = newItems;
    netWorkObj[networkIndex].pagination = data.pagination;

    // Cập nhật gridTable với danh sách item mới
    gridTable.setItems(newItems);
    gridTable.refresh();
}

function createNetworkItem(scene) {
    let itemWidth = 1080;
    let itemHeight = 120;

    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(0, 0);
    container.add(container_inner);
    container.container_inner = container_inner;

    // Tạo các phần tử UI
    let text_id = scene.add
        .text(38, 34 + (52 - 36) / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_inner.add(text_id);

    let text_name = scene.add
        .text(364 - 60, 34 + (52 - 36) / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#ffffff",
            align: "left",
            wordWrap: { width: 260, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_name);

    let text_network = scene.add
        .text(592, 34 + (52 - 36) / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#00C2F8",
            align: "left",
        })
        .setOrigin(0, 0);
    container_inner.add(text_network);

    let text_information = scene.add
        .text(
            822,
            34 + (52 - 36) / 2,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeNetwork.KEY,
                "Infomation"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#00C2F8",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_inner.add(text_information);

    // Phương thức cập nhật nội dung
    container.updateContent = function (item, networkIndex) {
        container.itemData = item;
        container.networkIndex = networkIndex;

        // Cập nhật thông tin
        text_id.setText(item.UserId);
        text_name.setText(item.Username);
        text_network.setText(item.InviteCount);
    };

    // const debugRect = scene.add.rectangle(0, 0, itemWidth, itemHeight, 0x00ff00, 0).setOrigin(0, 0);
    // debugRect.setStrokeStyle(2, 0x00ff00, 1);
    // container.add(debugRect);

    return container;
}

function ItemClick(scene, _id, Username, avatarKey) {
    if (currentNetworkIndex < 5) {
        currentNetworkIndex++;

        RequestNetwork(scene, 1, _id, Username, avatarKey);
    }
}

export function Destroy() {
    if (container_rank) {
        container_rank.destroy();

        container_rank = null;
    }
}

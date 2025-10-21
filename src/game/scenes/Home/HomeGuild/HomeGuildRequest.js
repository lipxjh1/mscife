import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import { GetMyGuild } from "./HomeGuild.js";

import { CreateGuildJoined } from "./HomeGuildJoined.js";
import { CreateGuildJoinedOptions } from "./HomeGuildJoinedOptions.js";

export function CreateGuildRequest(scene) {
    LoadAssetsDone(scene);
}

let container_main = null;

let container_buttons = null;

let myGuild = null;

function LoadAssetsDone(scene) {
    Destroy();

    myGuild = GetMyGuild();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.add
        .image(0, 0, "home_guild_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    container_main.add(lock_bg);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    let text_title = scene.add
        .text(
            606.5,
            274,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Guild"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_title);

    let guildAvatar = scene.add
        .image(62 + 215 / 2, 392 + 215 / 2, myGuild.Avatar)
        .setScale(215 / 128);
    container_main.add(guildAvatar);

    let text_guild_name = scene.add
        .text(306, 406, myGuild.Name, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_main.add(text_guild_name);

    let text_guild_id = scene.add
        .text(306, 452, "ID: " + myGuild.GuildId, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#cccccc",
            align: "left",
        })
        .setOrigin(0, 0);
    container_main.add(text_guild_id);

    let text_leader_username = scene.add
        .text(
            306,
            494,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Leader"
            ) +
                ": " +
                myGuild.Leader.Username,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#cccccc",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_main.add(text_leader_username);

    let text_leader_id = scene.add
        .text(
            306,
            531,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Leader ID"
            ) +
                ": " +
                myGuild.Leader.UserId,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#cccccc",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_main.add(text_leader_id);

    let text_description = scene.add
        .text(62, 621, myGuild.Description, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_main.add(text_description);

    let text_members = scene.add
        .text(
            62,
            text_description.y + 28,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Members"
            ) +
                ": " +
                myGuild.Members +
                "/" +
                myGuild.MaxMembers,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_main.add(text_members);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Close(scene);

            CreateGuildJoinedOptions(scene);
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

    container_buttons.add(btn_close);

    RequestMemberList(scene);
}

function RequestMemberList(scene, keyword = "") {
    CreateLoadingPopup();
    centerData.RequestGetGuildRequestList(
        1,
        10,
        (result) => {
            HideLoadingPopup();
            CreateMemberItemList(scene, result.requests);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

let container_member_item_list = null;

function DestroyMemberItemList(scene) {
    if (container_member_item_list) {
        container_member_item_list.destroy();
        container_member_item_list = null;
    }
}

function CreateMemberItemList(scene, memberArr) {
    //console.log("CreateAcceptItemList: ");

    DestroyMemberItemList(scene);

    //Create friend list
    container_member_item_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_main.add(container_member_item_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1020;
    const scrollViewHeight = 1044;

    const columns = 1;
    const rows = Math.ceil(2 / columns);

    const itemWidth = 904;
    const itemHeight = 200;
    const itemSpacing = 20;

    const posX = 30 + scrollViewWidth / 2;
    const posY = 876 + scrollViewHeight / 2;

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
                left: 126,
                right: 0,
                top: 40,
                bottom: 200 / 2 + 20 / 2,
            },
        })
        .layout();

    container_member_item_list.add(scrollablePanel);

    for (let i = 0; i < memberArr.length; i++) {
        const memberData = memberArr[i];

        let container_item = CreateMemberItem(
            scene,
            scrollablePanel,
            memberData
        );

        //container_item.button_message.button.on("pointerdown", function () {});

        container_item.button_accept.button.on("pointerdown", function () {
            AcceptMember(scene, container_item);
        });

        container_item.button_reject.button.on("pointerdown", function () {
            RejectMember(scene, container_item);
        });
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_member_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function AcceptMember(scene, item) {
    CreateLoadingPopup();
    centerData.RequestPostAcceptGuildRequest(
        item.itemData._id,
        (result) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, result.message);

            CreateGuildRequest(scene);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

function RejectMember(scene, item) {
    CreateLoadingPopup();
    centerData.RequestPostRejectGuildRequest(
        item.itemData._id,
        (result) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, result.message);

            CreateGuildRequest(scene);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

function CreateMemberItem(scene, scrollablePanel, itemData) {
    // console.log("CreateItem itemData: ", itemData);

    let itemWidth = 904;
    let itemHeight = 200;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add.image(0, 0, "home_guild_list_item_bg").setOrigin(0, 0);
    container_inner.add(item.bg);

    item.avatar = scene.add
        .image(23 + 160 / 2, 20 + 160 / 2, item.itemData.Avatar)
        .setDisplaySize(160, 160)
        .setOrigin(0.5, 0.5);
    container_inner.add(item.avatar);

    item.text_name = scene.add
        .text(199, 20, item.itemData.Username, {
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

    item.text_id = scene.add
        .text(199, 74, item.itemData.UserId, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_id);

    item.button_accept = CreateButton1(
        scene,
        container_inner,
        640 + 200 / 2,
        35 + 58 / 2,
        "home_guild_btn_0",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Accept"
        )
    );

    item.button_reject = CreateButton1(
        scene,
        container_inner,
        640 + 200 / 2,
        114 + 58 / 2,
        "home_guild_btn_1",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Reject"
        )
    );

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

function CreateButton1(scene, container, x, y, imgKey, buttonName) {
    let btnWidth = 200;
    let btnHeight = 58;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_guild_btn_0")
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

    if (imgKey != "") {
        btn_container.button.setTexture(imgKey);
    }

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

    return btn_container;
}

function Close(scene) {
    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
        container_main = null;
    }
    if (container_buttons) {
        container_buttons.destroy();
        container_buttons = null;
    }
}

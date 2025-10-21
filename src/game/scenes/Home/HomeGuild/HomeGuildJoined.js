import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    HideCurrencyBar,
    MovePlayerBarToDefault,
    MovePlayerBarToHide,
    OpenCurrencyBar,
} from "../HomeTopBarPlayer.js";

import { GetMyGuild } from "./HomeGuild.js";

import { CreateGuildJoinedOptions } from "./HomeGuildJoinedOptions.js";
import {
    CreateGuildChat,
    HideInputElementChat,
    ShowInputElementChat,
} from "./HomeGuildChat.js";
import {
    CreateGuildJoinedMember,
    HideInputElementMember,
    ShowInputElementMember,
} from "./HomeGuildJoinedMembers.js";
import { CreateGuildDonate } from "./HomeGuildDonate.js";

export function CreateGuildJoined(scene) {
    LoadAssetsDone(scene);
}

let container_main = null;

let container_sub = null;

let container_buttons = null;

let myGuild = null;

function LoadAssetsDone(scene) {
    MovePlayerBarToHide(scene);
    HideCurrencyBar(scene);

    Destroy();

    myGuild = GetMyGuild();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.add
        .image(0, 0, "home_guild_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    container_main.add(lock_bg);

    container_sub = scene.add.container(0, 0);
    container_main.add(container_sub);

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

    if (myGuild.MyRole == "leader") {
    }

    let btn_donate = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        551 + 86 / 2,
        "Donate"
    );
    container_main.add(btn_donate);

    btn_donate.button.on("pointerdown", function () {
        CreateGuildDonate(scene);

        Destroy();
    });

    let btn_member = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        457 + 86 / 2,
        "Members"
    );
    container_main.add(btn_member);

    btn_member.button.on("pointerdown", function () {
        CreateGuildJoinedMember(scene);

        btn_member.setActive(false);
        btn_chat.setActive(true);
    });

    let btn_chat = CreateButton0(
        scene,
        container_buttons,
        686 + 328 / 2,
        457 + 86 / 2,
        "Chat"
    );
    container_buttons.add(btn_chat);

    btn_chat.button.on("pointerdown", function () {
        CreateGuildChat(scene);

        btn_member.setActive(true);
        btn_chat.setActive(false);
    });

    CreateGuildChat(scene);

    let btn_more = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        644 + 86 / 2,
        "More"
    );
    container_main.add(btn_more);

    btn_more.button.on("pointerdown", function () {
        CreateGuildJoinedOptions(scene);

        Destroy();
    });

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Close(scene);
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
}

export function GetGuildJoinedSubContainer() {
    return container_sub;
}

function CreateButton0(scene, container, x, y, buttonName) {
    let btnWidth = 328;
    let btnHeight = 86;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_guild_btn_play")
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

    btn_container.setActive = function (active) {
        if (active) {
            btn_container.setVisible(true);
            btn_container.button.setInteractive(true);
        } else {
            btn_container.setVisible(false);
            btn_container.button.setInteractive(false);
        }
    };

    return btn_container;
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
    MovePlayerBarToDefault(scene);

    OpenCurrencyBar(scene);

    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
        container_main = null;
    }

    if (container_sub) {
        container_sub.destroy();
        container_sub = null;
    }

    if (container_buttons) {
        container_buttons.destroy();
        container_buttons = null;
    }
}

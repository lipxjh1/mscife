import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

import { CreateGuild, GetMyGuild } from "./HomeGuild.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import { CreateGuildRequest } from "./HomeGuildRequest.js";

export function CreateGuildJoinedOptions(scene) {
    LoadAssetsDone(scene);
}

let container_main = null;

let container_buttons = null;

let myGuild = null;

function LoadAssetsDone(scene) {
    myGuild = GetMyGuild();

    container_main = scene.add.container(0, 0);

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.add
        .image(0, 0, "home_guild_bg")
        .setOrigin(0, 0)
        // .setTintFill(0x000000, 0.5)
        .setInteractive({ useHandCursor: true });

    container_main.add(lock_bg);

    const popup_bg = scene.add
        .graphics()
        .lineStyle(2, 0xffffff) // Viền 2px, màu trắng (White)
        .fillStyle(0x000000, 0.8) // Nền màu đen (Black), alpha 0.8
        .fillRect(360, 789, 360, 342) // Vẽ nền
        .strokeRect(360, 789, 360, 342);
    container_main.add(popup_bg);

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

    let btn_request = CreateButton0(
        scene,
        container_main,
        380 + 328 / 2,
        909 + 86 / 2,
        "home_guild_btn_play",
        "Reuqest"
    );
    container_main.add(btn_request);

    btn_request.button.on("pointerdown", function () {
        Destroy();

        CreateGuildRequest(scene);
    });

    if (myGuild.MyRole == "leader") {
        let btn_delete = CreateButton0(
            scene,
            container_main,
            380 + 328 / 2,
            1013 + 86 / 2,
            "home_guild_btn_play_1",
            "Delete"
        );
        container_main.add(btn_delete);

        btn_delete.button.on("pointerdown", function () {
            DeleteGuild(scene);
        });
    } else {
        let btn_leave = CreateButton0(
            scene,
            container_main,
            380 + 328 / 2,
            1013 + 86 / 2,
            "home_guild_btn_play_1",
            "Leave"
        );
        container_main.add(btn_leave);

        btn_leave.button.on("pointerdown", function () {
            LeaveGuild(scene);
        });
    }

    //create close btn
    const btn_close = scene.add
        .image(380 + 32 / 2, 829 + 54 / 2, "share_btn_back")
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

function LeaveGuild(scene) {
    CreateAlertPopup(
        scene,
        "Are you sure you want to leave this guild?",
        () => {
            CreateLoadingPopup();

            centerData.RequestPostGuildLeave(
                (result) => {
                    HideLoadingPopup();
                    CreateAlertPopup(scene, result.message);

                    Destroy();

                    CreateGuild(scene);
                },
                (error) => {
                    HideLoadingPopup();
                    CreateAlertPopup(scene, error);
                }
            );
        },
        () => {}
    );
}

function DeleteGuild(scene) {
    CreateAlertPopup(
        scene,
        "Are you sure you want to delete this guild?",
        () => {
            CreateLoadingPopup();

            centerData.RequestDeleteGuild(
                (result) => {
                    HideLoadingPopup();
                    CreateAlertPopup(scene, result.message);

                    Destroy();

                    CreateGuild(scene);
                },
                (error) => {
                    HideLoadingPopup();
                    CreateAlertPopup(scene, error);
                }
            );
        },
        () => {}
    );
}

function CreateButton0(scene, container, x, y, imgKey, buttonName) {
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
        .image(0, 0, imgKey)
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

    return btn_container;
}

function Close(scene) {
    Destroy();

    CreateGuild(scene);
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

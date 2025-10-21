import centerData from "../../Data/CenterData.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";
import { AssetLoadingManager } from "../AssetLoadingManager.js";
import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";
import { CreateFirstMissions } from "../Home/HomeFirstMissions.js";
import { CreateAlertPopup } from "../Share/AlertPopup.js";

let container_main = null;

let canRevive = false;

let reviveTimeEvent = null;

export function CreateGameRevive(scene, reviveTimes = 0, ReviveDate) {
    DestroyReviveUI();

    canRevive = false;

    // Tạo một container
    container_main = scene.add.container(0, 0).setDepth(200); // Tọa độ của container

    const black_bg = scene.add
        .rectangle(0, 0, scene.game.config.width, scene.game.config.height)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("bg clicked");
        });
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.75;

    container_main.add(black_bg);

    const popup_bg = scene.add
        .image(0, 0, "gameplay_game_over_popup_bg")
        .setOrigin(0, 0);
    container_main.add(popup_bg);

    popup_bg.setPosition(-2000, 0);

    scene.tweens.add({
        targets: popup_bg, // Đối tượng chữ cần tween
        x: 0, // Chuyển từ -100 (phía trên màn hình) đến centerY (giữa màn hình)
        duration: 500, // Thời gian tween (ms)
        ease: "power2", // Kiểu easing tạo hiệu ứng nảy
        delay: 0, // Thời gian chờ 1 giây trước khi bắt đầu tween
        onComplete: () => {},
    });

    const text_title = scene.add
        .text(332, 789, "Revive in", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "52px",
            color: "#ffffff",
            align: "left",
            fontStyle: "italic",
        })
        .setOrigin(0, 0);
    container_main.add(text_title);

    text_title.y = -2000;

    scene.tweens.add({
        targets: text_title, // Đối tượng chữ cần tween
        y: 789, // Chuyển từ -100 (phía trên màn hình) đến centerY (giữa màn hình)
        duration: 750, // Thời gian tween (ms)
        ease: "Bounce.easeOut", // Kiểu easing tạo hiệu ứng nảy
        delay: 500, // Thời gian chờ 1 giây trước khi bắt đầu tween
        onComplete: () => {},
    });

    const reviveItem = scene.add
        .image(540, 1143, "gameplay_game_revive_item")
        .setOrigin(0.5, 0);
    container_main.add(reviveItem);

    const text_revive_times = scene.add
        .text(540, 1379, "x" + reviveTimes, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_main.add(text_revive_times);

    let reviveDelay = GetReviveDelay(ReviveDate);
    if (reviveDelay < 0) {
        reviveDelay = 0;
    }

    reviveDelay += 3000;

    const text_timer = scene.add
        .text(540, 901 + 64 / 2, formatTime(reviveDelay), {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "64px",
            color: "#ffffff",
            align: "center",
            fontStyle: "italic",
        })
        .setOrigin(0.5, 0.5);
    container_main.add(text_timer);

    if (reviveTimeEvent) {
        reviveTimeEvent.remove(); // Dừng Timer Event
    }

    // Tạo Timer Event để đếm ngược
    reviveTimeEvent = scene.time.addEvent({
        delay: 1000, // 1 giây
        callback: () => {
            // reviveDelay = GetReviveDelay(ReviveDate);
            if (reviveDelay < 0) {
                reviveDelay = 0;
            }

            text_timer.setText(formatTime(reviveDelay));

            if (reviveDelay <= 0) {
                canRevive = true;

                reviveTimeEvent.remove();

                const btn_next = scene.add
                    .image(540, 1497, "gameplay_game_revive_btn")
                    .setInteractive({ useHandCursor: true })
                    .on("pointerdown", (pointer) => {
                        scene.ResurrectPlayer(scene);
                    })
                    .on("pointerover", function () {
                        scene.tweens.add({
                            targets: btn_next,
                            scaleX: 1.2, // Phóng to 20% theo chiều ngang
                            scaleY: 1.2, // Phóng to 20% theo chiều dọc
                            duration: 100, // Thời gian hiệu ứng (ms)
                            ease: "Power2",
                        });
                    })
                    .on("pointerout", function () {
                        scene.tweens.add({
                            targets: btn_next,
                            scaleX: 1, // Phóng to 20% theo chiều ngang
                            scaleY: 1, // Phóng to 20% theo chiều dọc
                            duration: 100, // Thời gian hiệu ứng (ms)
                            ease: "Power2",
                        });
                    });
                container_main.add(btn_next);
            }

            reviveDelay -= 1000;
        },
        callbackScope: this,
        loop: true,
    });

    const btn_exit = scene.add
        .image(540, 1598, "gameplay_game_over_btn_exit")
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", (pointer) => {
            scene.scene.start("Home");
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_exit,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_exit,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_main.add(btn_exit);
}

function formatTime(milisecond) {
    let seconds = milisecond / 1000;

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
}

function GetReviveDelay(ReviveDate) {
    let dateNow = new Date();

    // Tính hiệu số thời gian (đơn vị là millisecond)
    const timeDifference = ReviveDate - dateNow;

    // console.log("dateNow: ", dateNow);
    // console.log("reive date: ", ReviveDate);
    // console.log("timeDifference milisecond: ", timeDifference);

    return timeDifference;
}

export function DestroyReviveUI() {
    if (container_main) {
        container_main.destroy();
    }
}

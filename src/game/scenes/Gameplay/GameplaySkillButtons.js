import centerData from "../../Data/CenterData.js";
import centerDataItem from "../../Data/CenterDataItem.js";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";
import { AssetLoadingManager } from "../AssetLoadingManager.js";

let container_main = null;

let container_selector = null;

let gunnerUnlocked = null;
let sniperUnlocked = null;
let rocketUnlocked = null;

let btn_skillGunner = null;
let btn_skillSniper = null;
let btn_skillRocket = null;

export function CreateSkillButtons(scene) {
    gunnerUnlocked = null;
    sniperUnlocked = null;
    rocketUnlocked = null;

    btn_skillGunner = null;
    btn_skillSniper = null;
    btn_skillRocket = null;

    if (container_main) {
        container_main.destroy();
    }

    container_main = scene.add.container(0, 0).setDepth(100);

    container_selector = scene.add.container(0, 0);
    container_main.add(container_selector);

    for (let i = 0; i < centerData.selectedPlayerArr.length; i++) {
        let unlockedPlayer = centerData.getUnlockedPlayerById(
            centerData.selectedPlayerArr[i]
        );

        let pData = centerDataPlayer.getPlayerById(unlockedPlayer.code);

        //console.log(`CreatePlayerSelector pData = ${i} `, pData);

        if (pData !== null) {
            if (unlockedPlayer.role === "gunner") {
                gunnerUnlocked = unlockedPlayer;
            } else if (unlockedPlayer.role === "sniper") {
                sniperUnlocked = unlockedPlayer;
            } else if (unlockedPlayer.role === "rocket") {
                rocketUnlocked = unlockedPlayer;
            }
        }
    }

    //button gunner shoot all
    if (
        gunnerUnlocked != null &&
        gunnerUnlocked.rank == centerDataPlayer.RANK_KEY.s.KEY
    ) {
        let affectDuration = 5;

        let delay = 31;

        let btn = CreateButtonSelect(scene);

        btn.button.on("pointerdown", function () {
            if (btn.locked == false) {
                btn.setLock(delay, () => {});

                scene.SetSkillGunnerShootAll(scene, affectDuration);

                CreateSkillIntro(scene);
            }
        });

        btn.setPosition(856 + 196 / 2, 862 + 196 / 2);
        btn.image.setTexture("skill_shoot_all");

        btn_skillGunner = btn;
    }

    //button sniper hide all
    if (
        sniperUnlocked != null &&
        sniperUnlocked.rank == centerDataPlayer.RANK_KEY.s.KEY
    ) {
        let affectDuration = 5;

        let delay = 31;

        let btn = CreateButtonSelect(scene);

        btn.button.on("pointerdown", function () {
            if (btn.locked == false) {
                btn.setLock(delay, () => {});

                scene.SetSkillSniperHideAll(scene, affectDuration);

                CreateSkillIntro(scene);
            }
        });

        btn.setPosition(856 + 196 / 2, 862 + 196 / 2);
        btn.image.setTexture("skill_invisible_all");

        btn_skillSniper = btn;
    }

    //button rocket shoot all
    if (
        rocketUnlocked != null &&
        rocketUnlocked.rank == centerDataPlayer.RANK_KEY.s.KEY
    ) {
        let affectDuration = 5;

        let delay = 31;

        let btn = CreateButtonSelect(scene);

        btn.button.on("pointerdown", function () {
            if (btn.locked == false) {
                btn.setLock(delay, () => {});

                scene.SetSkillRocketShootAll(scene, affectDuration);

                CreateSkillIntro(scene);
            }
        });

        btn.setPosition(856 + 196 / 2, 862 + 196 / 2);
        btn.image.setTexture("skill_shoot_all");

        btn_skillRocket = btn;
    }
}

export function setCurrentPlayerSkill(scene) {
    let player = scene.GetCurrentPlayer();

    if (!player || !player.unlockedPlayer) {
        //console.error("Player or unlockedPlayer is undefined");
        return;
    }

    // Hide and disable all buttons first
    const disableButton = (btn) => {
        //console.log("disableButton: ", btn);

        if (btn != null && btn.button != null) {
            btn.setVisible(false);
            btn.button.disableInteractive();
        }
    };

    disableButton(btn_skillGunner);
    disableButton(btn_skillSniper);
    disableButton(btn_skillRocket);

    // Then enable the appropriate one
    if (player.unlockedPlayer.role === "gunner" && btn_skillGunner) {
        btn_skillGunner.setVisible(true);
        btn_skillGunner.button.setInteractive();
    } else if (player.unlockedPlayer.role === "sniper" && btn_skillSniper) {
        btn_skillSniper.setVisible(true);
        btn_skillSniper.button.setInteractive();
    } else if (player.unlockedPlayer.role === "rocket" && btn_skillRocket) {
        btn_skillRocket.setVisible(true);
        btn_skillRocket.button.setInteractive();
    }
}

function CreateButtonSelect(scene) {
    let container_button = scene.add.container(0, 0);
    container_selector.add(container_button);

    let container_button_inner = scene.add.container(-196 / 2, -196 / 2);
    container_button.add(container_button_inner);
    container_button.container_button_inner = container_button_inner;

    container_button.locked = false;

    container_button.button = scene.add
        .image(0, 0, "gameplay_selector_item_btn")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_button,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_button,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_button_inner.add(container_button.button);

    container_button.image = scene.add
        .image(196 / 2, 196 / 2, "item_musk")
        .setDisplaySize(150, 150)
        .setOrigin(0.5, 0.5);
    container_button_inner.add(container_button.image);

    container_button.text_quantity = scene.add
        .text(196, 196, "", {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#ffffff",
            align: "right",
            wordWrap: { width: 250, useAdvancedWrap: true },
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(1, 1);
    container_button_inner.add(container_button.text_quantity);

    container_button.setLock = function (seconds, onLockDone) {
        if (seconds >= 0) {
            container_button.locked = true;

            container_button.circle = scene.add.graphics();
            container_button.circle.fillStyle(0x000000, 0.5);
            container_button.circle.fillCircle(196 / 2, 196 / 2, 100);
            container_button_inner.add(container_button.circle);

            // Thêm tween slice 360 độ từ góc 0 giờ
            let startAngle = -90; // Góc bắt đầu (đơn vị: độ, -90° tương ứng với góc 0 giờ)
            let endAngle = 270; // Góc kết thúc (đơn vị: độ, 270° tương ứng với góc 0 giờ sau khi quay 360°)

            scene.tweens.add({
                targets: { angle: startAngle }, // Đối tượng tween
                angle: endAngle, // Giá trị cuối cùng của góc
                duration: seconds * 1000, // Thời gian chạy
                ease: "Linear", // Hiệu ứng tuyến tính
                onUpdate: (tween) => {
                    // Xóa nội dung cũ của circle
                    container_button.circle.clear();

                    // Vẽ lại hình tròn với góc mới
                    container_button.circle.fillStyle(0x000000, 0.5); // Màu nền và độ trong suốt
                    container_button.circle.slice(
                        196 / 2, // Tâm x
                        196 / 2, // Tâm y
                        100, // Bán kính
                        Phaser.Math.DegToRad(tween.targets[0].angle), // Góc bắt đầu (chuyển từ độ sang radian)
                        Phaser.Math.DegToRad(endAngle), // Góc kết thúc (chuyển từ độ sang radian)
                        false // Theo chiều kim đồng hồ
                    );
                    container_button.circle.fillPath(); // Điền màu vào slice
                },
                onComplete: () => {
                    container_button.locked = false;

                    container_button.circle.destroy();

                    if (onLockDone && typeof onLockDone === "function") {
                        onLockDone();
                    }
                },
            });
        } else {
            container_button_inner.each(function (child) {
                if (child.setTint) {
                    child.setTint(0x646464); // Màu tint bạn muốn áp dụng
                }
            });
        }
    };

    return container_button;
}

function CreateSkillIntro(scene) {
    let player = scene.GetCurrentPlayer();

    // const introImg = scene.add
    //     .image(-1080, 0, player.pData.spineGameplayKey + "_skill_intro")
    //     .setOrigin(0, 0);
    // introImg.alpha = 0.5;

    //Start
    scene.tweens.add({
        targets: introImg,
        x: 0,
        duration: 500,
        ease: "Linear",
        onComplete: () => {},
    });

    scene.tweens.add({
        targets: introImg,
        alpha: 1,
        duration: 500,
        ease: "Linear",
        onComplete: () => {},
    });

    //End
    scene.tweens.add({
        targets: introImg,
        x: -1080,
        duration: 500,
        delay: 1000,
        ease: "Linear",
        onComplete: () => {},
    });

    scene.tweens.add({
        targets: introImg,
        alpha: 0,
        duration: 500,
        delay: 1000,
        ease: "Linear",
        onComplete: () => {
            introImg.destroy();
        },
    });
}

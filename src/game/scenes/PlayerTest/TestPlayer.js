import centerData from "../../Data/CenterData.js";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";

import { CreateAudioPlayerVoice } from "../Manager/ManagerAudio.js";
import {
    playIdleAnimation,
    playShootAnimation,
} from "../../utils/spineUtils.js";

class TestPlayer {
    constructor(
        scene,
        x,
        y,
        _id,
        playerId,
        explosionPool,
        strikePool
    ) {
        this.scene = scene;

        this._id = _id;

        this.playerId = playerId;

        this.unlockedPlayer = centerDataPlayer.playTestPlayer[_id];

        this.pData = centerDataPlayer.getPlayerById(this.playerId);

        //console.log(" create player this.pData: ", this.pData);

        this.isHiding = true;

        this.shakeTween = null;

        this.isShaking = false; // Thêm cờ để theo dõi trạng thái rung

        this.isCanAttack = true;

        // Gán các object pool
        this.explosionPool = explosionPool;
        this.strikePool = strikePool;

        // Tạo container cho player
        this.container = this.scene.add.container(x, y);
        this.container.setDepth(-1);

        this.container_delay_bar = null;

        // this.player_spine = this.scene.add.spine(x, y, spineKeyData, spineKeyAtlas);

        this.player_spine = this.scene.add.spine(
            0,
            0,
            this.pData.spineGameplayKey
        );

        //console.log("this.player_spine = " + this.player_spine);

        // Thêm spine vào container
        this.container.add(this.player_spine);

        // const text_name = scene.add
        //   .text(0, 0, playerId, {
        //     fontFamily: "Russo One",
        //     fontSize: "64px",
        //     color: "#ffffff",
        //     align: "left",
        //   })
        //   .setOrigin(0, 1);

        // this.container.add(text_name);

        this.CreateDelayBar(scene);

        this.Default();
    }

    Default() {
        playIdleAnimation(this.player_spine);

        // Biến để theo dõi thời gian chờ khi bắn
        this.shootToIdleDelay = 500; // Thời gian chờ để chuyển về trạng thái idle
        this.shootTimer = null; // Biến timer
    }

    setActive(isActive) {
        this.container.setVisible(isActive);

        this.ActiveDelayBar(isActive);
    }

    CreateDelayBar(scene) {
        this.container_delay_bar = scene.add.container(0, 0);

        let delay_bar_0 = scene.add
            .image(38, 1836, "gameplay_bottom_bar_delay_bar_0")
            .setOrigin(0, 0.5);
        this.container_delay_bar.add(delay_bar_0);

        let delay_bar_1 = scene.add
            .image(38, 1836, "gameplay_bottom_bar_delay_bar_1")
            .setOrigin(0, 0.5);
        this.container_delay_bar.add(delay_bar_1);
        this.container_delay_bar.delay_bar_1 = delay_bar_1;

        let delay_bar_3 = scene.add
            .image(38, 1836, "gameplay_bottom_bar_delay_bar_2")
            .setOrigin(0, 0.5);
        this.container_delay_bar.add(delay_bar_3);

        const maskShape = scene.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(
            delay_bar_0.x,
            delay_bar_0.y - delay_bar_0.displayHeight / 2,
            delay_bar_0.displayWidth,
            delay_bar_0.displayHeight
        );

        const mask = maskShape.createGeometryMask();

        delay_bar_0.setMask(mask);
        delay_bar_1.setMask(mask);

        this.UpdateDelayBar(scene, 1, 1, 1, null);
    }

    ActiveDelayBar(boolVal) {
        this.container_delay_bar.setVisible(boolVal);
    }

    UpdateDelayBar(scene, maxVal, curVal, delayTime, onTweenComplete) {
        //console.log("scene", scene);

        //console.log("UpdateDelayBar");

        let toNormalize = curVal / maxVal;

        let toX =
            38 -
            this.container_delay_bar.delay_bar_1.displayWidth *
                (1 - toNormalize);

        if (this.container_delay_bar.delay_bar_1_tween) {
            this.container_delay_bar.delay_bar_1_tween.stop();

            this.container_delay_bar.delay_bar_1_tween.remove();
        }

        //console.log("toNormalize", toNormalize);

        // console.log(
        //     "this.container_delay_bar.delay_bar_1.displayWidth",
        //     this.container_delay_bar.delay_bar_1.displayWidth
        // );

        // console.log(
        //     "this.container_delay_bar.delay_bar_1.x",
        //     this.container_delay_bar.delay_bar_1.x
        // );

        //console.log("toX", toX);

        // Lưu tween vào một biến khi tạo tween
        this.container_delay_bar.delay_bar_1_tween = scene.tweens.add({
            targets: this.container_delay_bar.delay_bar_1,
            x: toX,
            duration: delayTime,
            ease: "Linear",
            onComplete: () => {
                if (onTweenComplete && typeof onTweenComplete === "function") {
                    onTweenComplete();
                }

                //console.log("delay_bar_1_tween done");
            },
        });
    }

    takeShoot(hitPosition) {
        if (this.isCanAttack == false) {
            return;
        }

        this.isHiding = false;

        this.isCanAttack = false;

        //console.log("this.isCanAttack: ", this.isCanAttack);

        this.createHitFX(hitPosition);

        this.scene.GetPoolAudioVFX().PlayAudioShoot(this.unlockedPlayer.role);

        // Rung chỉ khi nó không đang rung
        if (!this.isShaking) {
            this.shake();
        }

        // Nếu đã có timer đang chạy, hủy nó
        if (this.shootTimer) {
            this.scene.time.removeEvent(this.shootTimer); // Hủy bỏ timer cũ
            this.shootTimer = null; // Đặt lại giá trị của timer về null
        }

        this.UpdateDelayBar(this.scene, 1, 0, 125);

        playShootAnimation(this.player_spine);

        // Tạo timer để chuyển về trạng thái idle
        this.shootTimer = this.scene.time.delayedCall(
            this.shootToIdleDelay,
            () => {
                this.isHiding = true;

                playIdleAnimation(this.player_spine);
                this.shootTimer = null; // Đặt lại timer sau khi hoàn thành

                //CreateAudioPlayerVoice(this.scene);
            }
        );

        this.scene.time.delayedCall(125, () => {
            let tweenDelay =
                this.unlockedPlayer.baseProperties.attackDelay - 125;
            if (this.unlockedPlayer.baseProperties.attackDelay <= 0) {
                tweenDelay = 125;
            }

            this.UpdateDelayBar(this.scene, 1, 1, tweenDelay);
        });

        this.scene.time.delayedCall(
            this.unlockedPlayer.baseProperties.attackDelay,
            () => {
                this.isCanAttack = true;

                //console.log("this.isCanAttack: ", this.isCanAttack);
            }
        );
    }

    createHitFX(hitPosition) {
        if (this.unlockedPlayer.role === "rocket") {
            const effect = this.explosionPool.get(
                hitPosition.x,
                hitPosition.y
            );
            if (!effect) return;

            effect
                .setActive(true)
                .setVisible(true)
                .setDepth(-3)
                .setScale(5)
                .play("enemy_fx_explosion_animation");

            effect.on(
                "animationcomplete",
                () => {
                    this.explosionPool.killAndHide(effect);
                },
                this
            );
        } else {
            const effect = this.strikePool.get(hitPosition.x, hitPosition.y);
            if (!effect) return;

            effect
                .setActive(true)
                .setVisible(true)
                .setDepth(-3)
                .play("enemy_fx_strike_anim_animation");
            effect.on(
                "animationcomplete",
                () => {
                    this.strikePool.killAndHide(effect);
                },
                this
            );
        }
    }

    shake() {
        if (this.isShaking) return; // Ngăn không cho rung nếu đang rung

        this.isShaking = true; // Đánh dấu là đang rung

        const shakeDistance = 5; // Độ dịch chuyển khi rung
        const shakeDuration = 100; // Thời gian rung (milliseconds)
        const shakeInterval = 20; // Thời gian giữa các lần rung (milliseconds)

        // Sử dụng tween để rung
        this.shakeTween = this.scene.tweens.add({
            targets: this.player_spine, // Sử dụng spriteShoot
            x: {
                value: `+=${shakeDistance}`,
                duration: shakeInterval,
                yoyo: true,
                repeat: 2,
            },
            y: {
                value: `-=${shakeDistance}`,
                duration: shakeInterval,
                yoyo: true,
                repeat: 2,
            },
            onComplete: () => {
                this.isShaking = false; // Đánh dấu là không còn rung

                // Đảm bảo kẻ thù trở về vị trí ban đầu sau khi rung
                this.player_spine.x = 0; // Không cần làm gì ở đây, chỉ để khẳng định
            },
            duration: shakeDuration,
            repeat: 0,
        });
    }

    destroy() {
        if (this.shakeTween) {
            this.shakeTween.stop();
            this.shakeTween = null; // Xóa tham chiếu sau khi hủy
        }

        if (this.spine) {
            this.spine.removeAllListeners();
        }

        if (this.container_delay_bar) {
            this.container_delay_bar.destroy();
        }

        this.container.destroy();
    }
}

export default TestPlayer; // Đảm bảo sử dụng export default

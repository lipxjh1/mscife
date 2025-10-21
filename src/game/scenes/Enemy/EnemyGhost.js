
import centerData from "../../Data/CenterData.js";
import ProgressBar from "../Gameplay/ProgressBar.js";
import { playIdleAnimation, playCustomAnimation } from "../../utils/spineUtils.js";

export function EnemyGhostIdToKeyImage(enemyId, stage) {
    let imgKey = "";

    return imgKey;
}

export function EnemyGhostIdToKeySpine(enemyId, stage) {
    let imgKey = "";

    imgKey = "enemy_ghost_0";

    return imgKey;
}

class EnemyGhost {
    constructor(
        scene,
        id,
        enemyType,
        hp,
        shield,
        hitCount,
        delayHit,
        onHit,
        onDead
    ) {
        this.scene = scene;
        this.id = id;
        this.enemyType = enemyType;
        this.currentHp = hp;
        this.maxHp = hp;

        this.spriteKey = EnemyGhostIdToKeyImage(this.id, scene.CurrentStage);
        this.droneSpineKey = EnemyGhostIdToKeySpine(
            this.id,
            scene.CurrentStage
        );

        this.currentShield = shield;
        this.maxShield = shield;

        this.hitCount = hitCount;
        this.delayHit = delayHit;

        this.isDead = false;

        this.onHit = onHit;
        this.onDead = onDead;

        this.otherTweens = [];

        this.isAttacking = false;

        this.createDrone(scene);
    }

    createDrone(scene) {
        const randomX = Phaser.Math.Between(100, 980);

        this.spawnPoint = { x: randomX, y: 200 };

        this.container = scene.add.container(0, 0);

        scene.GetMap().AddToContainerEnemy(this.container);

        this.container.setPosition(this.spawnPoint.x, this.spawnPoint.y);

        if (this.droneSpineKey === "") {
            // Tạo sprite cho enemy
            this.droneSprite = this.scene.add
                .sprite(0, 0, this.spriteKey)
                .setOrigin(0.5, 1);

            this.droneSprite.setInteractive({
                pixelPerfect: true,
                useHandCursor: true,
            });

            // Xử lý sự kiện khi click vào sprite của enemy
            this.droneSprite.on("pointerdown", (pointer) => {
                //console.log(`Clicked on Enemy ${this.id}`);

                // Gọi hàm callback thành công nếu có
                if (this.onHit && typeof this.onHit === "function") {
                    this.onHit(pointer);
                }
            });

            // Thêm sprite vào container
            this.container.add(this.droneSprite);
        } else {
            // Tạo spine cho enemy
            this.droneSpine = this.scene.add.spine(0, 0, this.droneSpineKey);
            //console.log("spine_key = " + this.droneSpineKey);

            this.container.setScale(0.5);

            this.playIdleAnimation();

            this.droneSpine.setInteractive({ useHandCursor: true });

            // Sự kiện khi click vào spine
            this.droneSpine.on("pointerdown", (pointer) => {
                // this.droneSpine.skeleton.slots.forEach((slot) => {
                //   console.log(slot.data.name); // Hiển thị tên của mỗi slot
                // });

                //console.log(`Clicked on Enemy Drone ${this.id}`);

                // Gọi hàm callback thành công nếu có
                if (this.onHit && typeof this.onHit === "function") {
                    this.onHit(pointer);
                }
            });

            // Thêm sprite vào container
            this.container.add(this.droneSpine);
        }
        // Tính toán vị trí health bar dựa trên chiều cao enemy
        let enemyHeight = 0;
        if (this.droneSpine) {
            enemyHeight = this.droneSpine.height;
        } else if (this.droneSprite) {
            enemyHeight = this.droneSprite.height;
        }
        const healthBarY = -enemyHeight + 100;
        const shieldBarY = healthBarY + 15;

        this.healthBar = new ProgressBar(scene, 0, healthBarY, {
            bgTexture: "gameplay_top_bar_health_bar_0",
            fillTexture: "gameplay_top_bar_health_bar_1",
            delayedFillTexture: "gameplay_top_bar_health_bar_2",
            overlayTexture: "gameplay_top_bar_health_bar_3",
        });
        this.healthBar.container.setScale(0.33);
        this.container.add(this.healthBar.container);

        this.shieldBar = new ProgressBar(scene, 0, shieldBarY, {
            bgTexture: "gameplay_top_bar_health_bar_0",
            fillTexture: "gameplay_top_bar_health_bar_1",
            delayedFillTexture: "gameplay_top_bar_health_bar_4",
            overlayTexture: "gameplay_top_bar_health_bar_3",
        });
        this.shieldBar.container.setScale(0.33);
        this.container.add(this.shieldBar.container);

        this.createShield(scene);
        this.setHealth(scene, null, this.currentHp, false);
        this.setShield(scene, null, this.currentShield, false);

        this.moveDroneToSpawnPoint(scene);
        scene.AddUpdateEvent((time, delta) => this.handleUpdate(time, delta));
    }

    playIdleAnimation() {
        if (this.isDead == false) {
            playIdleAnimation(this.droneSpine);
        }
    }

    handleUpdate(time, delta) {
        if (this.isDead == true) return;

        this.updateMoveToPosition(time, delta);
    }

    setMoveToPosition(
        position = { x: 0, y: 0 },
        speed = 0,
        onMoveDoneCallBack = null
    ) {
        this.onMoveDoneCallBack = onMoveDoneCallBack;

        this.speed = speed;

        this.moveToPosition = position;

        this.isMoving = true;
    }

    stopMoveToPosition() {
        this.isMoving = false;
    }

    updateMoveToPosition(time, delta) {
        if (this.isMoving == false) return;

        // Tính khoảng cách từ player đến điểm B
        const distanceX = this.moveToPosition.x - this.container.x;
        const distanceY = this.moveToPosition.y - this.container.y;

        // Tính độ dài vector (khoảng cách Euclid)
        const distance = Math.sqrt(
            distanceX * distanceX + distanceY * distanceY
        );

        if (distance > this.speed * (delta / 1000)) {
            // Tính hướng di chuyển (normalize vector)
            const directionX = distanceX / distance;
            const directionY = distanceY / distance;

            // Cập nhật vị trí dựa trên tốc độ và delta time
            this.container.x += directionX * this.speed * (delta / 1000);
            this.container.y += directionY * this.speed * (delta / 1000);
        } else {
            // Đã đến đích, đặt chính xác vị trí
            this.container.x = this.moveToPosition.x;
            this.container.y = this.moveToPosition.y;

            this.isMoving = false;

            if (
                this.onMoveDoneCallBack &&
                typeof this.onMoveDoneCallBack === "function"
            ) {
                this.onMoveDoneCallBack();
            }
        }
    }

    moveDroneToSpawnPoint(scene) {
        const randomX = Phaser.Math.Between(
            this.container.x - 500,
            this.container.x + 500
        );
        const randomY = this.container.y - 500;

        this.container.setPosition(randomX, randomY);

        this.setMoveToPosition(this.spawnPoint, 1000, () => {
            this.startSway(scene);

            this.moveToAnyWhere(scene);

            this.createTimeToAttackArray(scene);
        });
    }

    moveToAnyWhere(scene) {
        if (this.isDead == true) return;

        const randomX = Phaser.Math.Between(100, 980);
        const randomY = Phaser.Math.Between(100, 700);

        // Tốc độ di chuyển (pixel/giây)
        const speed = 200;

        function TweenOnComplete() {
            const randomDelay = Phaser.Math.Between(1, 3);

            scene.time.delayedCall(randomDelay * 1000, () => {
                if (this.isAttacking == false) {
                    this.moveToAnyWhere(scene);
                }
            });
        }

        this.setMoveToPosition({ x: randomX, y: randomY }, speed, () => {
            TweenOnComplete.bind(this);
        });
    }

    // Cập nhật vị trí và trạng thái của thanh shield
    updateDroneShieldBar() {
        if (this.shieldBar) {
            this.shieldBar.update(this.currentShield, this.maxShield, true);
        }
    }

    // Cập nhật vị trí và trạng thái của thanh máu
    updateDroneHealthBar() {
        if (this.healthBar) {
            this.healthBar.update(this.currentHp, this.maxHp, true);
        }
    }

    takeDamage() {
        if (this.isDead == true) return;

        if (this.droneSprite) {
            // Đổi màu kẻ thù sang đỏ
            this.droneSprite.setTint(0xff0000);

            // Khôi phục màu sắc về bình thường sau 0.125 giây
            this.scene.time.delayedCall(250, () => {
                if (this.droneSprite) {
                    this.droneSprite.clearTint();
                }
            });
        } else if (this.droneSpine) {
            // Áp dụng tint bằng cách thay đổi trực tiếp giá trị RGBA cho mỗi slot
            this.droneSpine.skeleton.slots.forEach((slot) => {
                slot.color.set(1, 0.5, 0.5, 1); // Thiết lập màu đỏ nhạt (1, 0.5, 0.5, 1)
            });

            // Khôi phục màu sắc về bình thường sau 0.125 giây
            this.scene.time.delayedCall(250, () => {
                if (this.droneSpine) {
                    this.droneSpine.skeleton.slots.forEach((slot) => {
                        slot.color.set(1, 1, 1, 1); // Thiết lập màu đỏ nhạt (1, 0.5, 0.5, 1)
                    });
                }
            });
        }
    }

    setHealth(scene, pointer, setHp, useTween = true) {
        if (pointer) {
            let damage = this.currentHp - setHp;
            scene.CreateTextDamage(scene, pointer, damage);
        }
        this.currentHp = setHp;
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            this.setDroneDead(scene);
        }
        this.updateDroneHealthBar();
    }

    createShield(scene) {
        if (this.droneSpine) {
            this.container.currentShieldSprite = scene.add.image(
                0,
                -this.droneSpine.height * 0.125,
                "enemy_fx_shield"
            );

            this.container.currentShieldSprite.setDisplaySize(
                this.droneSpine.width * 1.5,
                this.droneSpine.height * 1.5
            );

            // this.container.currentShieldSprite.setPosition(
            //     0,
            //     this.container.y - this.container.currentShieldSprite.displayHeight * 1.5
            // );
            this.container.add(this.container.currentShieldSprite);
        } else {
            this.container.currentShieldSprite = scene.add.image(
                0,
                -this.droneSprite.height / 2,
                "enemy_fx_shield"
            );

            this.container.currentShieldSprite.setDisplaySize(
                this.droneSprite.width * 1.5,
                this.droneSprite.height * 1.5
            );

            this.container.add(this.container.currentShieldSprite);
        }
    }

    setShield(scene, pointer, setShield, useTween = true) {
        if (pointer) {
            let damageShield = this.currentShield - setShield;
            scene.CreateTextDamageShield(scene, pointer, damageShield);
        }
        this.currentShield = setShield;
        if (this.shieldBar) {
            const hasShield = this.currentShield > 0;
            this.shieldBar.setVisible(hasShield);
            if (hasShield) {
                this.shieldBar.update(this.currentShield, this.maxShield, useTween);
            }
        }
        if (this.container.currentShieldSprite) {
            const percent = Phaser.Math.Clamp(
                this.currentShield / this.maxShield,
                0,
                1
            );
            this.container.currentShieldSprite.setAlpha(percent);
        }
    }

    setDroneDead(scene) {
        if (this.isDead == true) return;

        this.isDead = true;

        if (this.healthBar) this.healthBar.setVisible(false);
        if (this.shieldBar) this.shieldBar.setVisible(false);

        //this.droneSpine.setVisible(false);

        scene.GetPoolAudioVFX().PlayAudioExplosion();

        let fx = scene
            .GetPoolSpriteSheet()
            .createExplosion(this.container.x, this.container.y, {
                scale: 7,
                onComplete: () => {},
            });

        fx.setDepth(0);

        if (this.droneSpine) {
            this.droneSpine.removeAllListeners();

            const animName = "die";

            playCustomAnimation(this.droneSpine, animName, false);

            // Tìm animation trong dữ liệu skeleton của spine
            const animation =
                this.droneSpine.skeleton.data.findAnimation(animName);

            let animTime = 1;

            if (animation) {
                animTime = animation.duration; // Thời gian hoạt ảnh tính bằng giây
            }

            scene.time.delayedCall(animTime * 1000, () => {
                this.droneSpine.setVisible(false);
                this.droneSpine.disableInteractive();

                // Gọi hàm callback thành công nếu có
                if (this.onDead && typeof this.onDead === "function") {
                    this.onDead();
                }

                this.destroy();
            });
        } else {
            this.droneSprite.setVisible(false);
            this.droneSprite.disableInteractive();

            // Gọi hàm callback thành công nếu có
            if (this.onDead && typeof this.onDead === "function") {
                this.onDead();
            }

            this.destroy();
        }
    }

    startSway(scene) {
        if (this.isDead == true) return;

        if (this.droneSpine) {
            const minAlpha = 0.1; // Độ mờ tối thiểu
            const maxAlpha = 1.0; // Độ mờ tối đa

            // Hàm tạo tween alpha ngẫu nhiên
            const randomAlphaTween = () => {
                const randomDuration = Phaser.Math.Between(250, 500); // Thời gian tween ngẫu nhiên (ms)
                const randomAlpha = Phaser.Math.FloatBetween(
                    minAlpha,
                    maxAlpha
                ); // Giá trị alpha ngẫu nhiên

                this.swayTweenAlpha = scene.tweens.add({
                    targets: this.droneSpine,
                    alpha: randomAlpha,
                    duration: randomDuration,
                    ease: "Linear",
                    onComplete: () => {
                        // Gọi lại hàm để tạo hiệu ứng liên tục
                        randomAlphaTween();
                    },
                });
            };

            // Bắt đầu hiệu ứng
            randomAlphaTween();
        } else {
            const minAlpha = 0.1; // Độ mờ tối thiểu
            const maxAlpha = 1.0; // Độ mờ tối đa

            // Hàm tạo tween alpha ngẫu nhiên
            const randomAlphaTween = () => {
                const randomDuration = Phaser.Math.Between(250, 500); // Thời gian tween ngẫu nhiên (ms)
                const randomAlpha = Phaser.Math.FloatBetween(
                    minAlpha,
                    maxAlpha
                ); // Giá trị alpha ngẫu nhiên

                this.swayTweenAlpha = scene.tweens.add({
                    targets: this.droneSprite,
                    alpha: randomAlpha,
                    duration: randomDuration,
                    ease: "Linear",
                    onComplete: () => {
                        // Gọi lại hàm để tạo hiệu ứng liên tục
                        randomAlphaTween();
                    },
                });
            };

            // Bắt đầu hiệu ứng
            randomAlphaTween();

            const swayDistance = Phaser.Math.Between(5, 6); // Độ dịch chuyển ngẫu nhiên từ 2 đến 10 pixels
            const swayDuration = Phaser.Math.Between(500, 600); // Thời gian lắc lư ngẫu nhiên từ 200 đến 600 milliseconds
            this.swayTween = scene.tweens.add({
                targets: this.droneSprite,
                x: {
                    value: `+=${swayDistance}`,
                    duration: swayDuration,
                    yoyo: true,
                    repeat: -1, // Lặp lại vô hạn
                },
                y: {
                    value: `-=${swayDistance}`,
                    duration: swayDuration,
                    yoyo: true,
                    repeat: -1, // Lặp lại vô hạn
                },
                ease: "Sine.easeInOut", // Hiệu ứng lắc lư mượt mà
            });
        }
    }

    createTimeToAttackArray(scene) {
        this.timeToAttackArr = [];
        this.attackTimeIndex = 0;

        let timeRemaining = 30 - this.delayHit * 4;

        for (let i = 0; i < this.hitCount; i++) {
            let ranTime = Phaser.Math.Between(this.delayHit, timeRemaining);

            timeRemaining -= ranTime;
            this.timeToAttackArr.push(ranTime);
        }

        //console.log("timeToAttackArr:", this.timeToAttackArr);

        this.attackLoop(scene);
    }

    attackLoop(scene) {
        if (this.hitCount <= 0 || this.isDead == true) return;

        //console.log("attackLoop");

        this.attackLoopEvent = scene.time.addEvent({
            delay: this.timeToAttackArr[this.attackTimeIndex] * 1000, // Thời gian delay (1 giây = 1000ms)
            callback: () => {
                this.attack(scene);

                this.attackTimeIndex++;

                // this.attackLoop(scene);

                if (this.attackTimeIndex >= this.timeToAttackArr.length) {
                    // if (this.attackLoopEvent) {
                    //     this.scene.time.removeEvent(this.attackLoopEvent); // Hủy bỏ timer cũ
                    //     this.attackLoopEvent = null; // Đặt lại giá trị của timer về null
                    // }
                }
            },
        });
    }

    attack(scene) {
        if (this.isDead == true) return;

        this.stopMoveToPosition();

        this.isAttacking = true;

        // console.log("enemy attack");
        // console.log("time now:", scene.time.now);
        // console.log("enemy attack player:", scene.GetCurrentPlayer());

        this.hitTimes = this.delayHit / 0.25;
        this.hitTimeIndex = 0;

        if (this.droneSpine) {
            if (this.swayTweenAlpha) {
                scene.tweens.remove(this.swayTweenAlpha);
            }

            this.droneSpine.alpha = 1;

            const randomX = Phaser.Math.Between(100, 980);
            const randomY = 960;

            function TweenOnComplete() {
                const animName = "attack";

                playCustomAnimation(this.droneSpine, animName, false);

                // Tìm animation trong dữ liệu skeleton của spine
                const animation =
                    this.droneSpine.skeleton.data.findAnimation(animName);

                let animTime = 1;

                if (animation) {
                    animTime = animation.duration; // Thời gian hoạt ảnh tính bằng giây
                }

                scene.CreateEnemyAttackWarning(scene);

                scene.time.delayedCall(500, () => {
                    this.hitLoop(scene);
                });

                this.scene.time.delayedCall(animTime * 1000, () => {
                    this.isAttacking = false;

                    if (this.isDead == false) {
                        this.playIdleAnimation();

                        this.startSway(scene);

                        this.moveToAnyWhere(scene);

                        this.attackLoop(scene);
                    }
                });
            }

            this.setMoveToPosition({ x: randomX, y: randomY }, 5000, () => {
                TweenOnComplete.call(this);
            });
        }
    }

    hitLoop(scene) {
        if (this.hitTimeIndex >= this.hitTimes || this.isDead == true) return;

        this.hitLoopEvent = scene.time.addEvent({
            delay: 0.25 * 1000, // Thời gian delay (1 giây = 1000ms)
            callback: () => {
                this.hit(scene);
            },
            repeat: this.hitTimes - 1,
        });
    }

    hit(scene) {
        //console.log("enemy hit player:");

        let player = scene.GetCurrentPlayer();

        if (scene.IsPlayerHiding() == false) {
            scene.SetPlayerHit(scene, this);
        } else {
            //console.log("enemy hit player is hiding");
        }

        scene.GetPoolAudioVFX().PlayAudioExplosion();

        let ranX = Phaser.Math.Between(-270, 270);

        let fx = scene.GetPoolSpriteSheet().createExplosion(540 + ranX, 1200, {
            scale: 10,
            onComplete: () => {},
        });

        fx.setDepth(-3);
    }

    // Hủy bầy drone khi Enemy chính bị phá hủy
    destroy() {
        //console.log(`Drone ${this.id} destroy`);

        this.scene.RemoveUpdateEvent((time, delta) =>
            this.handleUpdate(time, delta)
        );

        if (this.droneSpine != null) {
            this.droneSpine.destroy();
            this.droneSpine = null;
        }

        if (this.droneSprite != null) {
            this.droneSprite.destroy();
            this.droneSprite = null;
        }

        if (this.swayTween) {
            this.swayTween.remove();

            this.swayTween = null;
        }

        if (this.swayTweenAlpha) {
            this.swayTweenAlpha.remove();

            this.swayTweenAlpha = null;
        }

        if (this.attackLoopEvent) {
            this.attackLoopEvent.remove();

            this.attackLoopEvent = null;
        }

        if (this.hitLoopEvent) {
            this.hitLoopEvent.remove();

            this.hitLoopEvent = null;
        }

        for (let i = 0; i < this.otherTweens.length; i++) {
            this.otherTweens[i].remove();
        }

        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = null;
        }
        if (this.shieldBar) {
            this.shieldBar.destroy();
            this.shieldBar = null;
        }

        this.container.destroy();
    }
}

export default EnemyGhost; // Đảm bảo sử dụng export default



import centerData from "../../Data/CenterData.js";
import ProgressBar from "../Gameplay/ProgressBar.js";
import { playIdleAnimation, playAttackAnimation, playCustomAnimation } from "../../utils/spineUtils.js";

export function EnemyDroneIdToKeyImage(enemyId) {
    let imgKey = "";

    return imgKey;
}

export function EnemyDroneIdToKeySpine(enemyId) {
    let imgKey = "";

    imgKey = "enemy_drone_";

    const randomNumber = Phaser.Math.Between(0, 2);

    imgKey = imgKey + randomNumber;

    return imgKey;
}

class BossDrones {
    constructor(
        scene,
        id,
        enemyType,
        hp,
        maxHp,
        shield,
        maxShield,
        hitCount,
        delayHit,
        onHit,
        onDead
    ) {
        this.scene = scene;
        this.id = id;
        this.enemyType = enemyType;
        this.currentHp = hp;
        this.maxHp = maxHp;

        this.spriteKey = EnemyDroneIdToKeyImage(this.id);
        this.spineKey = EnemyDroneIdToKeySpine(this.id);

        this.currentShield = shield;
        this.maxShield = maxShield;

        this.hitCount = hitCount;
        this.delayHit = delayHit;

        this.isDead = false;

        this.onHit = onHit;
        this.onDead = onDead;

        this.otherTweens = [];

        this.createDrone(scene);
    }

    createDrone(scene) {
        const randomX = Phaser.Math.Between(100, 980);

        this.spawnPoint = { x: randomX, y: 200 };

        this.container = scene.add.container(0, 0);

        this.container.setPosition(this.spawnPoint.x, this.spawnPoint.y);

        if (this.spineKey === "") {
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
            this.droneSpine = this.scene.add.spine(
                0,
                0,
                this.spineKey,
                this.spineKey + "_atlas"
            );
            //console.log("spine_key = " + this.spineKey);

            playIdleAnimation(this.droneSpine);

            this.droneSpine.setInteractive({ useHandCursor: true });

            // Sự kiện khi click vào spine
            this.droneSpine.on("pointerdown", (pointer) => {
                // this.spine.skeleton.slots.forEach((slot) => {
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

    handleUpdate(time, delta) {
        if (this.isDead == true) return;

        this.updateMoveToPosition(time, delta);

        this.updateSway(time, delta);
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

            this.startDroneAttacks(scene);
        });
    }

    moveToAnyWhere(scene) {
        const randomX = Phaser.Math.Between(100, 980);
        const randomY = Phaser.Math.Between(100, 700);

        // Tốc độ di chuyển (pixel/giây)
        const speed = 200;

        this.setMoveToPosition({ x: randomX, y: randomY }, speed, () => {
            this.moveToAnyWhere(scene);
        });
    }

    // Cập nhật vị trí và trạng thái của thanh máu
    updateDroneHealthBar() {
        if (this.healthBar) {
            this.healthBar.update(this.currentHp, this.maxHp, true);
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

            this.setDroneDead(scene, false);
        }

        this.updateDroneHealthBar();
    }

    createShield(scene) {
        if (this.droneSpine) {
            this.container.currentShieldSprite = scene.add.image(
                0,
                -this.droneSpine.height / 2,
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

        if (this.currentShield <= 0) {
        }
    }

    setDroneDead(scene, isHitPlayer = false) {
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
                // console.log(
                //     `Thời gian của hoạt ảnh ${animName}: ${animTime} giây`
                // );
            }

            scene.time.delayedCall(animTime * 1000, () => {
                if (this.droneSpine) {
                    this.droneSpine.destroy();
                }

                this.droneSpine = null;

                if (isHitPlayer) {
                    scene.SetPlayerHit(scene, this);

                    scene.SetDroneEnemyExplode(this.id);
                }

                // Gọi hàm callback thành công nếu có
                if (this.onDead && typeof this.onDead === "function") {
                    this.onDead();
                }

                this.destroy();
            });
        } else {
            this.droneSprite.destroy();
            this.droneSprite = null;

            if (isHitPlayer) {
                scene.SetPlayerHit(scene, this);

                scene.SetDroneEnemyExplode(this.id);
            }

            // Gọi hàm callback thành công nếu có
            if (this.onDead && typeof this.onDead === "function") {
                this.onDead();
            }

            this.destroy();
        }
    }

    // Phương thức lắc lư nhẹ với độ ngẫu nhiên
    startSway() {
        this.swayAngle = 0; // Góc dao động
        this.swaySpeed = 0.05; // Tốc độ dao động
        this.swayDistance = 5; // Khoảng cách dao động (pixel)
        this.isSwaying = true; // Cờ để bật/tắt hiệu ứng
        this.swayOrigin = { x: this.droneSpine.x, y: this.droneSpine.y };
    }

    updateSway(time, delta) {
        if (this.isSwaying == null || this.isSwaying == false) return;

        //console.log("this.isSwaying: ", this.isSwaying);

        // Tăng góc dao động
        this.swayAngle += this.swaySpeed;

        // Tính toán dao động dựa trên hàm sin
        const swayOffsetX = Math.sin(this.swayAngle) * this.swayDistance;
        const swayOffsetY = Math.cos(this.swayAngle) * this.swayDistance;

        // Áp dụng dao động vào vị trí của container
        this.droneSpine.x = this.swayOrigin.x + swayOffsetX;
        this.droneSpine.y = this.swayOrigin.y + swayOffsetY;
    }

    // Chọn drone để thực hiện cuộc tấn công
    startDroneAttacks(scene) {
        let ranTime = Phaser.Math.Between(5, 25);

        this.attackTimer = scene.time.addEvent({
            delay: ranTime * 1000,
            callback: () => {
                this.stopMoveToPosition();

                this.launchDroneAttack(scene);
            },
        });
    }

    // Drone tấn công
    launchDroneAttack(scene) {
        // Xác định vị trí mục tiêu để tấn công
        const targetX = Phaser.Math.Between(100, 540); // Vị trí tấn công trên trục X
        const targetY = 1215; // Vị trí tấn công trên trục Y

        // Tạo tween để di chuyển drone
        let tweenMove = scene.tweens.add({
            targets: this.container,
            x: targetX,
            y: targetY,
            duration: this.delayHit * 1000, // Thời gian bay
            onComplete: () => {
                this.doExplode(scene); // Gọi hàm xử lý khi drone đến mục tiêu
            },
        });
        this.otherTweens.push(tweenMove);

        let tweenScale = scene.tweens.add({
            targets: this.container,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: this.delayHit * 1000, // Thời gian bay
            onComplete: () => {},
        });
        this.otherTweens.push(tweenScale);
    }

    doExplode(scene) {
        //console.log("doExplode");
        scene.CreateEnemyAttackWarning(scene);
        if (this.droneSpine) {
            const color = { r: 1, g: 1, b: 1 };
            let tweenColor = scene.tweens.add({
                targets: color,
                r: 1,
                g: 0.5,
                b: 0.5,
                duration: 1000,
                onUpdate: () => {
                    if (this.isDead == false) {
                        this.droneSpine.skeleton.slots.forEach((slot) => {
                            slot.color.set(color.r, color.g, color.b, 1);
                        });
                    }
                },
            });
            this.otherTweens.push(tweenColor);
        } else {
            let tweenColor = scene.tweens.add({
                targets: this.droneSprite,
                tint: 0xff0000, // Đổi tint thành màu đỏ
                duration: 1000, // Thời gian tween (1 giây)
            });
            this.otherTweens.push(tweenColor);
        }
        scene.time.delayedCall(
            1000, // 1 giây
            () => {
                if (this.isDead == false) {
                    this.setDroneDead(scene, true);
                }
            }
        );
    }

    // Hủy bầy drone khi Enemy chính bị phá hủy
    destroy() {
        //console.log(`Drone ${this.id} destroy`);

        this.scene.RemoveUpdateEvent((time, delta) =>
            this.handleUpdate(time, delta)
        );

        if (this.attackTimer) {
            this.attackTimer.remove();

            this.attackTimer = null;
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

        // CRITICAL FIX: Remove from Phaser update lists BEFORE destroy
        // This prevents Phaser from calling preUpdate() on destroyed objects
        if (this.container) {
            if (this.scene && this.scene.sys) {
                if (this.scene.sys.updateList) {
                    this.scene.sys.updateList.remove(this.container);
                }
                if (this.scene.sys.displayList) {
                    this.scene.sys.displayList.remove(this.container);
                }
            }
            this.container.destroy();
        }
    }
}

export default BossDrones; // Đảm bảo sử dụng export default

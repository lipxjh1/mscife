import { repeat } from "rxjs";
import {
    ActiveHealthBar,
    ActiveShieldBar,
    IsHealthBarActive,
    IsShieldBarActive,
    UpdateHealthBar,
    UpdateShieldBar,
} from "../GameplayBoss/GameplayBossTopBar.js";

import centerData from "../../Data/CenterData.js";
import { Scale } from "phaser";
import MathLookup from "../../utils/MathLookup.js";
import {
    playIdleAnimation,
    playCustomAnimation,
    destroySpine,
} from "../../utils/spineUtils.js";

export function BossIdToKeyImage(bossId) {
    let imgKey = "";

    return imgKey;
}

export function BossIdToKeySpine(bossId) {
    let imgKey = "";

    imgKey = "gameplay_enemy_boss_0";

    return imgKey;
}

class Boss {
    constructor(
        scene,
        id,
        bossType,
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
        this.bossType = bossType;
        this.spriteKey = BossIdToKeyImage(this.bossType);
        this.spineKey = BossIdToKeySpine(this.bossType);
        this.currentHp = hp;
        this.maxHp = maxHp;

        this.currentShield = shield;
        this.maxShield = maxShield;

        this.hitCount = hitCount;
        this.delayHit = delayHit;

        this.isDead = false;

        this.swayTween = null;

        this.onDead = onDead;

        this.onSpawnPoint = false;

        this.isMoving = false;
        this.onMoveDoneCallBack = null;
        this.speed = 0;
        this.moveToPosition = { x: 0, y: 0 };

        // Tạo container cho boss
        this.container = this.scene.add.container(540, 960);

        if (this.spineKey === "") {
            // Tạo sprite cho boss
            this.sprite = this.scene.add
                .sprite(0, 0, this.spriteKey)
                .setOrigin(0.5, 1);

            this.sprite.setInteractive({
                pixelPerfect: true,
                useHandCursor: true,
            });

            // Xử lý sự kiện khi click vào sprite của boss
            this.sprite.on("pointerdown", (pointer) => {
                //console.log(`Clicked on boss ${this.id}`);

                // Gọi hàm callback thành công nếu có
                if (onHit && typeof onHit === "function") {
                    onHit(pointer);
                }
            });

            // Thêm sprite vào container
            this.container.add(this.sprite);
        } else {
            // Tạo spine cho boss
            // CRITICAL FIX: Add safety check for spine loading
            // Prevents NULL POINTER error during scene transitions
            try {
                // Check if spine asset is loaded
                if (!this.scene.cache.custom.spine || !this.scene.cache.custom.spine.has(this.spineKey)) {
                    console.error(`[Boss] Spine key not found in cache: ${this.spineKey}`);
                    console.log('[Boss] Attempting to reload spine asset...');

                    // Mark this boss for deferred creation
                    this.spineLoadFailed = true;
                    return; // Don't create spine yet
                }

                this.spine = this.scene.add.spine(
                    0,
                    480,
                    this.spineKey,
                    this.spineKey + "_atlas"
                );
                //console.log("spine_key = " + this.spineKey);

                this.playIdleAnimation();

                this.spine.setInteractive({ useHandCursor: true });

                // Sự kiện khi click vào spine
                this.spine.on("pointerdown", (pointer) => {
                    // this.spine.skeleton.slots.forEach((slot) => {
                    //   console.log(slot.data.name); // Hiển thị tên của mỗi slot
                    // });

                    //console.log(`Clicked on boss ${this.id}`);

                    // Gọi hàm callback thành công nếu có
                    if (onHit && typeof onHit === "function") {
                        onHit(pointer);
                    }
                });

                // Thêm sprite vào container
                this.container.add(this.spine);

            } catch (error) {
                console.error('[Boss] Error creating spine:', error);
                this.spineLoadFailed = true;
            }
        }

        scene.GetMap().AddToContainerEnemy(this.container);
        this.spawnPoint = { x: this.container.x, y: this.container.y };

        ActiveHealthBar(true);
        UpdateHealthBar(scene, this.maxHp, this.currentHp);

        if (this.currentShield > 0) {
            ActiveShieldBar(true);

            UpdateShieldBar(scene, this.maxShield, this.currentShield);
        }

        this.createShield(scene);
        this.setShield(scene, null, this.currentShield);

        // Bắt đầu lắc lư nhẹ
        this.startSway();

        this.dropFromSky(scene);

        //this.createTimeToAttackArray(scene);

        scene.AddUpdateEvent((time, delta) => this.handleUpdate(time, delta));
    }

    playIdleAnimation() {
        if (this.isDead == false) {
            playIdleAnimation(this.spine);
        }
    }

    handleUpdate(time, delta) {
        // CRITICAL: Check if boss is being destroyed first
        if (this.isDead == true) return;

        // CRITICAL: Validate scene exists
        if (!this.scene || this.scene.destroyed) {
            console.warn('[Boss] handleUpdate: scene is null or destroyed, cleaning up');
            this.destroy();
            return;
        }

        try {
            // Validate container exists
            if (!this.container) {
                console.warn('[Boss] handleUpdate: container is null, destroying boss');
                this.destroy();
                return;
            }

            this.updateMoveToPosition(time, delta);

            // Only update sway if spine exists
            if (this.spine) {
                this.updateSway(time, delta);
            }

        } catch (error) {
            console.error('[Boss] handleUpdate error:', error);
            console.error('[Boss] Error stack:', error.stack);
            // Cleanup on error to prevent further crashes
            this.destroy();
        }
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

        // OPTIMIZATION: Use squared distance for comparison (eliminate Math.sqrt)
        const distanceSq = distanceX * distanceX + distanceY * distanceY;
        const moveDistance = this.speed * (delta / 1000);
        const moveDistanceSq = moveDistance * moveDistance;

        if (distanceSq > moveDistanceSq) {
            // Only calculate Math.sqrt when needed for normalization
            const distance = Math.sqrt(distanceSq);
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

    createTimeToAttackArray(scene, hitCount, delayHit) {
        if (this.attackLoopEvent) {
            this.scene.time.removeEvent(this.attackLoopEvent); // Hủy bỏ timer cũ
            this.attackLoopEvent = null; // Đặt lại giá trị của timer về null
        }

        this.hitCount = hitCount;
        this.delayHit = delayHit;

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
        if (this.hitCount <= 0) return;

        //console.log("attackLoop");

        this.attackLoopEvent = scene.time.addEvent({
            delay: this.timeToAttackArr[this.attackTimeIndex] * 1000, // Thời gian delay (1 giây = 1000ms)
            callback: () => {
                this.attack(scene);

                this.attackTimeIndex++;

                this.attackLoop(scene);

                if (this.attackTimeIndex >= this.timeToAttackArr.length) {
                    // if (this.attackLoopEvent) {
                    //     this.scene.time.removeEvent(this.attackLoopEvent); // Hủy bỏ timer cũ
                    //     this.attackLoopEvent = null; // Đặt lại giá trị của timer về null
                    // }
                }
            },
        });
    }

    attack(scene, hitDuration = 2) {
        //console.log("boss attack");

        this.delayHit = hitDuration;
        this.hitTimes = this.delayHit / 0.25;
        this.hitTimeIndex = 0;

        scene.CreateEnemyAttackWarning(scene);

        if (this.spine) {
            const animName = "shoot";

            playCustomAnimation(this.spine, animName, false);

            // Tìm animation trong dữ liệu skeleton của spine
            const animation = this.spine.skeleton.data.findAnimation(animName);

            let animTime = 1;

            if (animation) {
                animTime = animation.duration; // Thời gian hoạt ảnh tính bằng giây
                // console.log(
                //     `Thời gian của hoạt ảnh ${animName}: ${animTime} giây`
                // );
            }

            this.scene.time.delayedCall(animTime * 1000, () => {
                this.playIdleAnimation();
            });
        }

        scene.time.delayedCall(1000, () => {
            this.hitLoop(scene);
        });
    }

    hitLoop(scene) {
        if (this.hitTimeIndex >= this.hitTimes) return;

        this.hitLoopEvent = scene.time.addEvent({
            delay: 0.25 * 1000, // Thời gian delay (1 giây = 1000ms)
            callback: () => {
                this.hit(scene);
            },
            repeat: this.hitTimes - 1,
        });
    }

    hit(scene) {
        //console.log("boss hit player:");

        let player = scene.GetCurrentPlayer();

        if (scene.IsPlayerHiding() == false) {
            scene.SetPlayerHit(scene, this);
        } else {
            //console.log("boss hit player is hiding");
        }

        scene.GetPoolAudioVFX().PlayAudioExplosion();

        let ranX = Phaser.Math.Between(-270, 270);

        let fx = scene.GetPoolSpriteSheet().createExplosion(540 + ranX, 1200, {
            scale: 10,
            onComplete: () => {},
        });

        fx.setDepth(-3);
    }

    dropFromSky(scene) {
        this.container.y = this.spawnPoint.y - 4000;

        this.setMoveToPosition(this.spawnPoint, 2500, () => {});
    }

    // Phương thức giảm máu
    takeDamage() {
        if (this.sprite) {
            // Đổi màu kẻ thù sang đỏ
            this.sprite.setTint(0xff0000);

            // Khôi phục màu sắc về bình thường sau 0.125 giây
            this.scene.time.delayedCall(125, () => {
                this.sprite.clearTint();
            });
        } else if (this.spine) {
            // Áp dụng tint bằng cách thay đổi trực tiếp giá trị RGBA cho mỗi slot
            this.spine.skeleton.slots.forEach((slot) => {
                slot.color.set(1, 0.5, 0.5, 1); // Thiết lập màu đỏ nhạt (1, 0.5, 0.5, 1)
            });

            // Khôi phục màu sắc về bình thường sau 0.125 giây
            this.scene.time.delayedCall(125, () => {
                this.spine.skeleton.slots.forEach((slot) => {
                    slot.color.set(1, 1, 1, 1); // Thiết lập màu đỏ nhạt (1, 0.5, 0.5, 1)
                });
            });

            const animName = "get_hit";

            playCustomAnimation(this.spine, animName, false);

            // Tìm animation trong dữ liệu skeleton của spine
            const animation = this.spine.skeleton.data.findAnimation(animName);

            let animTime = 1;

            if (animation) {
                animTime = animation.duration; // Thời gian hoạt ảnh tính bằng giây
                // console.log(
                //     `Thời gian của hoạt ảnh ${animName}: ${animTime} giây`
                // );
            }

            this.scene.time.delayedCall(animTime * 1000, () => {
                this.playIdleAnimation();
            });
        }
    }

    setHealth(scene, pointer, setHp) {
        //console.log("set health: ", this.id);

        if (pointer) {
            let damage = this.currentHp - setHp;

            scene.CreateTextDamage(scene, pointer, damage);
        }

        this.currentHp = setHp;

        if (this.currentHp > 0 && IsHealthBarActive() == false) {
            ActiveHealthBar(true);
        }

        UpdateHealthBar(scene, this.maxHp, this.currentHp);

        if (this.currentHp <= 0) {
            ActiveHealthBar(false);

            let fx = scene
                .GetPoolSpriteSheet()
                .createExplosion(
                    this.container.x + 100,
                    this.container.y - 500,
                    {
                        scale: 7,
                        onComplete: () => {},
                    }
                );

            fx.setDepth(-3);

            scene.GetPoolAudioVFX().PlayAudioExplosion();

            this.die();
        }
    }

    createShield(scene) {
        this.container.currentShieldSprite = scene.add.image(
            0,
            0,
            "enemy_fx_shield"
        );

        // this.container.currentShieldSprite.setPosition(
        //     0,
        //     this.container.y -
        //         this.container.currentShieldSprite.displayHeight * 1.5
        // );

        this.container.currentShieldSprite.setPosition(
            0,
            -this.container.currentShieldSprite.displayHeight * 0.75
        );

        this.container.add(this.container.currentShieldSprite);
    }

    setShield(scene, pointer, setShield) {
        if (pointer) {
            let damageShield = this.currentShield - setShield;

            scene.CreateTextDamageShield(scene, pointer, damageShield);
        }

        this.currentShield = setShield;

        if (this.currentShield > 0 && IsShieldBarActive() == false) {
            ActiveShieldBar(true);
        }

        UpdateShieldBar(scene, this.maxShield, this.currentShield);

        this.container.currentShieldSprite.setAlpha(
            this.currentShield / this.maxShield
        );

        if (this.currentShield <= 0) {
            ActiveShieldBar(false);
        }
    }

    // Phương thức xử lý khi boss chết
    die() {
        if (this.isDead == true) return;

        this.isDead = true;

        this.hitCount = [];

        if (this.attackLoopEvent) {
            this.scene.time.removeEvent(this.attackLoopEvent); // Hủy bỏ timer cũ
            this.attackLoopEvent = null; // Đặt lại giá trị của timer về null
        }

        this.hitTimes = [];

        if (this.hitLoopEvent) {
            this.scene.time.removeEvent(this.hitLoopEvent); // Hủy bỏ timer cũ
            this.hitLoopEvent = null; // Đặt lại giá trị của timer về null
        }

        //console.log(`boss ${this.id} đã chết!`);
        this.destroy();

        // Gọi hàm callback thành công nếu có
        if (this.onDead && typeof this.onDead === "function") {
            this.onDead();
        }
    }

    destroy() {
        console.log(`[Boss] Destroying boss: ${this.id || 'unnamed'}`);

        // ⚠️ CRITICAL: Set isDead = true IMMEDIATELY to stop handleUpdate()
        this.isDead = true;

        try {
            // Step 1: Remove update event
            this.scene.RemoveUpdateEvent((time, delta) =>
                this.handleUpdate(time, delta)
            );

            // Step 2: Clear tweens
            if (this.swayTween) {
                this.swayTween.remove();
                this.swayTween = null;
            }

            // Step 3: Clear all scene tweens for this container
            if (this.scene && this.scene.tweens) {
                this.scene.tweens.killTweensOf(this.container);
            }

            // Step 4: Cleanup timers
            if (this.attackLoopEvent) {
                this.scene.time.removeEvent(this.attackLoopEvent);
                this.attackLoopEvent = null;
            }

            if (this.hitLoopEvent) {
                this.scene.time.removeEvent(this.hitLoopEvent);
                this.hitLoopEvent = null;
            }

            // Step 5: Play death animation then destroy spine properly
            if (this.spine) {
                this.spine.removeAllListeners();

                const animName = "die";
                playCustomAnimation(this.spine, animName, false);

                // Tìm animation trong dữ liệu skeleton của spine
                const animation = this.spine.skeleton.data.findAnimation(animName);

                let animTime = 1;

                if (animation) {
                    animTime = animation.duration; // Thời gian hoạt ảnh tính bằng giây
                }

                // Wait for death animation then cleanup spine properly
                this.scene.time.delayedCall(animTime * 1000, () => {
                    if (this.spine) {
                        // Use new destroySpine function for proper cleanup
                        destroySpine(this.spine, this.scene);
                        this.spine = null;
                    }

                    // Destroy container after spine cleanup
                    if (this.container) {
                        // CRITICAL FIX: Remove from Phaser update lists BEFORE destroy
                        // This prevents Phaser from calling preUpdate() on destroyed objects
                        if (this.scene && this.scene.sys) {
                            if (this.scene.sys.updateList) {
                                this.scene.sys.updateList.remove(this.container);
                            }
                            if (this.scene.sys.displayList) {
                                this.scene.sys.displayList.remove(this.container);
                            }
                        }

                        // Now safe to destroy
                        this.container.destroy();
                    }
                });
            } else {
                // No spine, destroy container directly
                if (this.container) {
                    // CRITICAL FIX: Remove from Phaser update lists BEFORE destroy
                    // This prevents Phaser from calling preUpdate() on destroyed objects
                    if (this.scene && this.scene.sys) {
                        if (this.scene.sys.updateList) {
                            this.scene.sys.updateList.remove(this.container);
                        }
                        if (this.scene.sys.displayList) {
                            this.scene.sys.displayList.remove(this.container);
                        }
                    }

                    // Now safe to destroy
                    this.container.destroy();
                }
            }

            console.log('[Boss] Boss destroy initiated');

        } catch (error) {
            console.error('[Boss] Error during destroy:', error);
        }
    }

    // //old health bar
    // // Cập nhật vị trí và trạng thái của thanh máu
    // updateHealthBar() {
    //   this.healthBar.clear();
    //   const barWidth = 500; // Độ rộng của thanh máu
    //   const barHeight = 10; // Chiều cao của thanh máu
    //   const barX = -barWidth / 2; // Vị trí thanh máu trên trục X (trong container)

    //   let barY = 0;
    //   if (this.sprite) {
    //     barY = -this.sprite.height - 50; // Vị trí thanh máu trên trục Y, ở trên đầu boss
    //   } else {
    //     barY = -this.spine.height - 50;
    //   }

    //   // Viền của thanh máu (màu đen)
    //   this.healthBar.fillStyle(0x000000);
    //   this.healthBar.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    //   // Phần máu còn lại (màu xanh lá)
    //   const healthPercentage = this.currentHp / this.maxHp; // Tính phần trăm máu còn lại
    //   this.healthBar.fillStyle(0x00ff00); // Màu xanh lá cây cho máu
    //   this.healthBar.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    // }

    // Phương thức lắc lư nhẹ với độ ngẫu nhiên
    startSway() {
        this.swayAngle = 0; // Góc dao động
        this.swaySpeed = 0.05; // Tốc độ dao động
        this.swayDistance = 10; // Khoảng cách dao động (pixel)
        this.isSwaying = true; // Cờ để bật/tắt hiệu ứng
        this.swayOrigin = { x: this.spine.x, y: this.spine.y };
    }

    updateSway(time, delta) {
        if (this.isSwaying == null || this.isSwaying == false) return;

        // CRITICAL: Check if spine still exists
        if (!this.spine) {
            console.warn('[Boss] updateSway: spine is null, disabling sway');
            this.isSwaying = false;
            return;
        }

        try {
            // Tăng góc dao động
            this.swayAngle += this.swaySpeed;

            // OPTIMIZATION: Use MathLookup for faster sin/cos operations
            // Convert radians to degrees for MathLookup
            const swayAngleDegrees = this.swayAngle * 180 / Math.PI;
            const { sin, cos } = MathLookup.getSinCos(swayAngleDegrees);

            // Tính toán dao động dựa trên lookup table
            const swayOffsetX = sin * this.swayDistance;
            const swayOffsetY = cos * this.swayDistance;

            // Áp dụng dao động vào vị trí của container
            this.spine.x = this.swayOrigin.x + swayOffsetX;
            this.spine.y = this.swayOrigin.y + swayOffsetY;
        } catch (error) {
            console.error('[Boss] updateSway error:', error);
            this.isSwaying = false; // Disable sway on error
        }
    }
}

export default Boss; // Đảm bảo sử dụng export default

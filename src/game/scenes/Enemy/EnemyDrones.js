import centerData from "../../Data/CenterData.js";
import ProgressBar from "../Gameplay/ProgressBar.js";
import MathLookup from "../../utils/MathLookup.js";
import {
    playIdleAnimation,
    playAttackAnimation,
    playCustomAnimation,
} from "../../utils/spineUtils.js";

export function EnemyDroneIdToKeyImage(enemyId, stage) {
    let imgKey = "";

    return imgKey;
}

export function EnemyDroneIdToKeySpine(enemyId, stage) {
    let imgKey = "";

    if (stage <= 20) {
        imgKey = "enemy_drone_";

        const randomNumber = Phaser.Math.Between(0, 2);

        imgKey = imgKey + randomNumber;
    } else if (stage > 20 && stage <= 40) {
        imgKey = "enemy_drone_";

        const randomNumber = Phaser.Math.Between(3, 5);

        imgKey = imgKey + randomNumber;
    } else {
        imgKey = "enemy_drone_";

        const randomNumber = Phaser.Math.Between(0, 2);

        imgKey = imgKey + randomNumber;
    }

    return imgKey;
}

class EnemyDrones {
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

        this.spriteKey = EnemyDroneIdToKeyImage(this.id, scene.CurrentStage);
        this.spineKey = EnemyDroneIdToKeySpine(this.id, scene.CurrentStage);

        this.currentShield = shield;
        this.maxShield = shield;

        this.hitCount = hitCount;
        this.delayHit = delayHit;

        this.isDead = false;

        this.onHit = onHit;
        this.onDead = onDead;

        this.otherTweens = [];

        // Performance optimization: Cache frequently accessed properties
        this._cachedSlots = null;
        this._cachedSlotCount = 0;

        this.createDrone(scene);
    }

    createDrone(scene) {
        const randomX = Phaser.Math.Between(100, 980);

        this.spawnPoint = { x: randomX, y: 200 };

        this.container = scene.add.container(0, 0);
        this.container.setPosition(this.spawnPoint.x, this.spawnPoint.y);

        if (this.spineKey === "") {
            this.droneSprite = this.scene.add
                .sprite(0, 0, this.spriteKey)
                .setOrigin(0.5, 1);
            this.droneSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
            this.droneSprite.on("pointerdown", (pointer) => {
                if (this.onHit && typeof this.onHit === "function") {
                    this.onHit(pointer);
                }
            });
            this.container.add(this.droneSprite);
        } else {
            this.droneSpine = this.scene.add.spine(0, 0, this.spineKey);
            playIdleAnimation(this.droneSpine);
            this.droneSpine.setInteractive({ useHandCursor: true });
            this.droneSpine.on("pointerdown", (pointer) => {
                if (this.onHit && typeof this.onHit === "function") {
                    this.onHit(pointer);
                }
            });
            this.container.add(this.droneSpine);

            // Update slots cache for performance
            this._updateSlotsCache();
        }
        if (scene.CurrentStage > 40) {
            this.container.setScale(0.75);
        }

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

        // Calculate distance components
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

            // Apply movement with normalized direction
            this.container.x += directionX * this.speed * (delta / 1000);
            this.container.y += directionY * this.speed * (delta / 1000);
        } else {
            // Snap to target when close enough
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

        // Movement speed (pixels/second)
        const speed = 200;

        this.setMoveToPosition({ x: randomX, y: randomY }, speed, () => {
            this.moveToAnyWhere(scene);
        });
    }

    // Update health and shield bar position and status
    updateDroneHealthBar() {
        if (this.healthBar) {
            this.healthBar.update(this.currentHp, this.maxHp, true);
        }
    }

    /**
     * Update slots cache for performance optimization
     * Call this when spine is created or changed
     */
    _updateSlotsCache() {
        if (this.droneSpine && this.droneSpine.skeleton && this.droneSpine.skeleton.slots) {
            this._cachedSlots = this.droneSpine.skeleton.slots;
            this._cachedSlotCount = this._cachedSlots.length;
            return true;
        }
        return false;
    }

    takeDamage() {
        if (this.isDead == true) return;

        if (this.droneSprite) {
            // Change enemy color to red
            this.droneSprite.setTint(0xff0000);

            // Restore normal color after 0.125 seconds
            this.scene.time.delayedCall(250, () => {
                if (this.droneSprite) {
                    this.droneSprite.clearTint();
                }
            });
        } else if (this.droneSpine) {
            // OPTIMIZATION: Use cached slots and for loop instead of forEach (2x faster)
            if (!this._cachedSlots) {
                this._updateSlotsCache();
            }

            if (this._cachedSlots) {
                // Apply red tint using cached slots and for loop
                for (let i = 0; i < this._cachedSlotCount; i++) {
                    this._cachedSlots[i].color.set(1, 0.5, 0.5, 1); // Light red tint
                }

                // Restore normal color after 0.125 seconds
                this.scene.time.delayedCall(250, () => {
                    if (!this._cachedSlots) return;

                    for (let i = 0; i < this._cachedSlotCount; i++) {
                        this._cachedSlots[i].color.set(1, 1, 1, 1); // Normal color
                    }
                });
            }
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
    }

    setDroneDead(scene, isHitPlayer = false) {
        if (this.isDead == true) return;
        this.isDead = true;
        if (this.healthBar) this.healthBar.setVisible(false);
        if (this.shieldBar) this.shieldBar.setVisible(false);

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

            // Find animation in spine skeleton data
            const animation =
                this.droneSpine.skeleton.data.findAnimation(animName);

            let animTime = 1;

            if (animation) {
                animTime = animation.duration; // Animation duration in seconds
                // console.log(
                //     `Thời gian của hoạt ảnh ${animName}: ${animTime} giây`
                // );
            }

            scene.time.delayedCall(animTime * 1000, () => {
                this.droneSpine.setVisible(false);
                this.droneSpine.disableInteractive();

                if (isHitPlayer) {
                    scene.SetPlayerHit(scene, this);

                    scene.SetDroneEnemyExplode(this.id);
                }

                // Call success callback if exists
                if (this.onDead && typeof this.onDead === "function") {
                    this.onDead();
                }

                this.destroy();
            });
        } else {
            this.droneSprite.setVisible(false);
            this.droneSprite.disableInteractive();

            if (isHitPlayer) {
                scene.SetPlayerHit(scene, this);

                scene.SetDroneEnemyExplode(this.id);
            }

            // Call success callback if exists
            if (this.onDead && typeof this.onDead === "function") {
                this.onDead();
            }

            this.destroy();
        }
    }

    // Start light swaying with random amplitude
    startSway() {
        this.swayAngle = 0; // Sway angle
        this.swaySpeed = 0.05; // Sway speed
        this.swayDistance = 5; // Sway distance (pixels)
        this.isSwaying = true; // Flag to enable/disable effect
        this.swayOrigin = { x: this.droneSpine.x, y: this.droneSpine.y };
    }

    updateSway(time, delta) {
        if (this.isSwaying == null || this.isSwaying == false) return;

        //console.log("this.isSwaying: ", this.isSwaying);

        // OPTIMIZATION: Normalize angle to prevent large values
        this.swayAngle += this.swaySpeed;
        if (this.swayAngle > 360) {
            this.swayAngle -= 360;
        }

        // OPTIMIZATION: Use lookup table for sin/cos (10-20x faster)
        // Get both sin and cos in one call for better performance
        const { sin, cos } = MathLookup.getSinCos(this.swayAngle);

        // Calculate sway offset using lookup table values
        const swayOffsetX = sin * this.swayDistance;
        const swayOffsetY = cos * this.swayDistance;

        // Apply sway to container position
        this.droneSpine.x = this.swayOrigin.x + swayOffsetX;
        this.droneSpine.y = this.swayOrigin.y + swayOffsetY;
    }

    // Select drone to launch attack
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

    // Drone attack
    launchDroneAttack(scene) {
        // Determine target position for attack
        const targetX = Phaser.Math.Between(100, 540); // Attack position on X axis
        const targetY = 1215; // Attack position on Y axis

        // Create tween to move drone
        let tweenMove = scene.tweens.add({
            targets: this.container,
            x: targetX,
            y: targetY,
            duration: this.delayHit * 1000, // Flight time
            onComplete: () => {
                this.doExplode(scene); // Call handler when drone reaches target
            },
        });
        this.otherTweens.push(tweenMove);

        let tweenScale = scene.tweens.add({
            targets: this.container,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: this.delayHit * 1000, // Flight time
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
                        // OPTIMIZATION: Use cached slots and for loop (2x faster)
                        if (!this._cachedSlots) {
                            this._updateSlotsCache();
                        }

                        if (this._cachedSlots) {
                            for (let i = 0; i < this._cachedSlotCount; i++) {
                                this._cachedSlots[i].color.set(color.r, color.g, color.b, 1);
                            }
                        }
                    }
                },
            });
            this.otherTweens.push(tweenColor);
        } else {
            let tweenColor = scene.tweens.add({
                targets: this.droneSprite,
                tint: 0xff0000, // Change tint to red
                duration: 1000, // Tween duration (1 second)
            });
            this.otherTweens.push(tweenColor);
        }

        scene.time.delayedCall(
            1000, // 1 second
            () => {
                if (this.isDead == false) {
                    this.setDroneDead(scene, true);
                }
            }
        );
    }

    // Destroy drone swarm when main enemy is destroyed
    destroy() {
        //console.log(`Drone ${this.id} destroy`);

        // Clean up event listeners (Fix #3 - Memory Leak)
        if (this.droneSprite) {
            this.droneSprite.off('pointerdown');
            console.log(`[EnemyDrones] Removed droneSprite event listeners`);
        }
        if (this.droneSpine) {
            this.droneSpine.off('pointerdown');
            console.log(`[EnemyDrones] Removed droneSpine event listeners`);
        }

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

        // Clean up cached references
        this._cachedSlots = null;
        this._cachedSlotCount = 0;
    }
}

export default EnemyDrones; // Ensure using export default
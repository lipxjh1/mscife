import { Scene } from "phaser";

import { CreateTopBar } from "./GameplayTest/GameplayTestTopBar.js";
import { SetTimeText } from "./GameplayTest/GameplayTestTopBar.js";
import {
    CreateShieldBar,
    ActiveShieldBar,
    UpdateShieldBar,
    IsShieldBarActive,
} from "./GameplayTest/GameplayTestTopBar.js";

import { CreateGameOver } from "./GameplayTest/GameplayTestGameOver.js";

import { CreateCrosshair } from "./Player/Crosshair.js";
import { ActiveCrosshair } from "./Player/Crosshair.js";

import { CreateMap as CreateMapEarth } from "./PlayTestMap/PlayTestMapEarth.js";

import TestEnemy, { ENEMY_KEYS } from "./EnemyTest/TestEnemy.js";
import TestEnemyDrones from "./EnemyTest/TestEnemyDrones.js";
import TestPlayer from "./PlayerTest/TestPlayer.js";

import PoolDamageNumber from "./Gameplay/PoolDamageNumber.js";

import { CreateItemsSelector } from "./GameplayTest/GameplayTestItemSelector.js";

import { CreatePlayerSelector } from "./GameplayTest/GameplayTestPlayerSelector.js";
import centerDataPlayer from "../Data/CenterDataPlayer.js";
import PoolSpriteSheet from "./Gameplay/PoolSpriteSheetVFX.js";
import PoolAudioVFX from "./Gameplay/PoolAudioVFX.js";
import { on } from "@telegram-apps/sdk";
import { isTelegramMiniApp } from "../utils.js";

export class GameplayTest extends Scene {
    constructor() {
        super("GameplayTest");

        this.customEvents = {}; // Lưu trữ các event custom
    }

    init() {
        this.currentEnemyIndex = -1;

        this.countdownTime = 0;

        this.map = null;

        this.img_warning = null;
        this.warningTween = null;
        this.warningDesstroyDelay = null;

        this.spawnedPlayerArr = [];
        this.player = null;
        this.isPlayerDead = false;

        this.battle = null;

        this.usingShield = false;

        this.usingEnergy = false;

        this.stageEnemiesCount = 0;

        this.stageEnemies = {};

        this.killedEnemies = [];

        this.isGamOverCreated = false;

        // Thêm biến lưu timestamp khi blur
        this.blurTimestamp = 0;

        // Tạo các handler functions để có thể remove chúng sau này
        this.handleBlur = () => {
            console.log(
                "Trò chơi mất focus (chuyển sang tab khác hoặc thu nhỏ)!"
            );
            this.Blur();
        };

        this.handleFocus = () => {
            console.log("Trò chơi lấy lại focus (quay lại tab)!");
            this.Focus();
        };

        this.battleData = {
            gameId: "gameId_1",
            id: 1,
            drones: [
                {
                    id: "DRONE_0",
                    currentHp: 800,
                    maxHp: 800,
                    currentShield: 0,
                    maxShield: 0,
                    hitCount: 2,
                    delayHit: 1,
                    spawnDelay: {
                        min: 0,
                        max: 3,
                    },
                },
                {
                    id: "DRONE_1",
                    currentHp: 800,
                    maxHp: 800,
                    currentShield: 0,
                    maxShield: 0,
                    hitCount: 2,
                    delayHit: 1,
                    spawnDelay: {
                        min: 0,
                        max: 3,
                    },
                },
                {
                    id: "DRONE_2",
                    currentHp: 800,
                    maxHp: 800,
                    currentShield: 0,
                    maxShield: 0,
                    hitCount: 2,
                    delayHit: 1,
                    spawnDelay: {
                        min: 0,
                        max: 3,
                    },
                },
                {
                    id: "DRONE_1",
                    currentHp: 800,
                    maxHp: 800,
                    currentShield: 800,
                    maxShield: 800,
                    hitCount: 2,
                    delayHit: 1,
                    spawnDelay: {
                        min: 2,
                        max: 5,
                    },
                },
            ],
            robots: [
                {
                    id: "ROBOT_0",
                    currentHp: 4000,
                    maxHp: 4000,
                    currentShield: 0,
                    maxShield: 0,
                    hitCount: 5,
                    delayHit: 2,
                    spawnDelay: {
                        min: 0,
                        max: 3,
                    },
                },
                {
                    id: "ROBOT_1",
                    currentHp: 4000,
                    maxHp: 4000,
                    currentShield: 0,
                    maxShield: 0,
                    hitCount: 5,
                    delayHit: 2,
                    spawnDelay: {
                        min: 0,
                        max: 3,
                    },
                },
                {
                    id: "ROBOT_2",
                    currentHp: 4000,
                    maxHp: 4000,
                    currentShield: 0,
                    maxShield: 0,
                    hitCount: 5,
                    delayHit: 2,
                    spawnDelay: {
                        min: 0,
                        max: 3,
                    },
                },
                {
                    id: "ROBOT_3",
                    currentHp: 4000,
                    maxHp: 4000,
                    currentShield: 4000,
                    maxShield: 4000,
                    hitCount: 5,
                    delayHit: 2,
                    spawnDelay: {
                        min: 2,
                        max: 5,
                    },
                },
                {
                    id: "ROBOT_4",
                    currentHp: 4000,
                    maxHp: 4000,
                    currentShield: 4000,
                    maxShield: 4000,
                    hitCount: 5,
                    delayHit: 2,
                    spawnDelay: {
                        min: 2,
                        max: 5,
                    },
                },
            ],
            startTime: "2025-03-11T08:31:10.530Z",
            endTime: "2025-03-11T08:31:42.530Z",
        };

        this.startGameId = "";
    }

    preload() {}

    create() {
        // Xử lý âm thanh cho iOS và các thiết bị khác
        this.setupAudio();

        this.createUpdateEvent();

        // Tạo animations một lần duy nhất
        this.anims.create({
            key: "enemy_fx_explosion_animation",
            frames: this.anims.generateFrameNumbers("enemy_fx_explosion", {
                start: 0,
                end: 10,
            }),
            frameRate: 30,
            repeat: 0,
        });

        this.anims.create({
            key: "enemy_fx_strike_anim_animation",
            frames: this.anims.generateFrameNumbers("enemy_fx_strike_anim", {
                start: 0,
                end: 11,
            }),
            frameRate: 30,
            repeat: 0,
        });

        // Tạo object pools cho hiệu ứng
        this.explosionPool = this.add.group({
            defaultKey: "enemy_fx_explosion",
            maxSize: 10,
            createCallback: (item) => {
                item.setOrigin(0.5, 0.5);
            },
            removeCallback: (item) => {
                item.off("animationcomplete");
            },
        });

        this.strikePool = this.add.group({
            defaultKey: "enemy_fx_strike_anim",
            maxSize: 10,
            createCallback: (item) => {
                item.setOrigin(0.5, 0.5);
            },
            removeCallback: (item) => {
                item.off("animationcomplete");
            },
        });

        this.damagePool = new PoolDamageNumber(this, {
            maxPoolSize: 15,
            textStyle: {
                fontFamily: "Russo One",
                fontSize: "68px",
                color: "#ba0606",
                stroke: "#000",
                strokeThickness: 4,
            },
            distance: 500,
            duration: 1200,
            fadeOutDuration: 600,
        });

        this.damagePoolShield = new PoolDamageNumber(this, {
            maxPoolSize: 15,
            textStyle: {
                fontFamily: "Russo One",
                fontSize: "68px",
                color: "#035efc",
                stroke: "#000",
                strokeThickness: 4,
            },
            distance: 500,
            duration: 1200,
            fadeOutDuration: 600,
        });

        // Khởi tạo PoolSpriteSheet trong scene.
        this.poolSpriteSheet = new PoolSpriteSheet(this, 10);

        this.audioVFX = new PoolAudioVFX(this);

        CreateCrosshair(this);

        CreatePlayerSelector(this);

        CreateItemsSelector(this);

        CreateTopBar(this);

        // Tạo shield bar
        CreateShieldBar(this);
        ActiveShieldBar(false);

        //CreateSkillButtons(this);

        // Tạo bản đồ
        this.CreateMap(this);

        //Tạo player
        this.CreatePlayer(this);

        this.SetupStage(this);

        if (isTelegramMiniApp()) {
            this.changeVisibilityListener = on(
                "visibility_changed",
                (payload) => {
                    console.log("visibility_changed:", payload);
                    if (payload.is_visible) {
                        this.handleFocus();
                    } else {
                        this.handleBlur();
                    }
                }
            );
        } else {
            // Lắng nghe sự kiện BLUR và FOCUS
            this.game.events.addListener(
                Phaser.Core.Events.BLUR,
                this.handleBlur
            );
            this.game.events.addListener(
                Phaser.Core.Events.FOCUS,
                this.handleFocus
            );
        }

        this.events.once("shutdown", () => {
            this.shutdown();
        });
    }

    // Thêm các phương thức xử lý blur/focus
    Blur() {
        this.blurTimestamp = Date.now();
        // Tạm dừng âm thanh
        this.sound.pauseAll();
    }

    Focus() {
        const focusTimestamp = Date.now();

        if (this.blurTimestamp > 0) {
            const durationInMs = focusTimestamp - this.blurTimestamp;
            const durationInSeconds = durationInMs / 1000;

            // Cập nhật thời gian đếm ngược
            this.countdownTime -= durationInSeconds;
            if (this.countdownTime < 0) {
                this.countdownTime = 0;
            }
            SetTimeText(this.formatTime(this.countdownTime));
            this.blurTimestamp = 0;
        }

        // Tiếp tục âm thanh
        this.sound.resumeAll();
    }

    setupAudio() {
        this.sound.pauseOnBlur = false;

        // Thêm multiple event listeners để đảm bảo audio được unlock
        const unlockAudio = () => {
            try {
                this.sound.unlock();
            } catch (error) {
                console.warn("Failed to unlock audio in GameplayTest:", error);
            }
        };

        // Thêm nhiều event listeners để đảm bảo audio được unlock
        this.input.on("pointerdown", unlockAudio, this);
        this.input.on("pointerup", unlockAudio, this);
        this.input.on("pointermove", unlockAudio, this);

        // Thêm touch events cho mobile
        this.input.on("touchstart", unlockAudio, this);
        this.input.on("touchend", unlockAudio, this);
        this.input.on("touchmove", unlockAudio, this);

        // Thêm keyboard events
        this.input.keyboard.on("keydown", unlockAudio, this);
        this.input.keyboard.on("keyup", unlockAudio, this);

        // Thêm gamepad events (kiểm tra trước khi sử dụng)
        if (this.input.gamepad) {
            this.input.gamepad.on("down", unlockAudio, this);
            this.input.gamepad.on("up", unlockAudio, this);
        }

        // Thêm window events
        this.events.on("wake", unlockAudio, this);
        this.events.on("resume", unlockAudio, this);

        // Thử unlock audio ngay lập tức nếu có thể
        this.time.delayedCall(100, unlockAudio, [], this);

        // Retry sau 1 giây
        this.time.delayedCall(1000, unlockAudio, [], this);

        // Retry sau 3 giây
        this.time.delayedCall(3000, unlockAudio, [], this);
    }

    GetPoolSpriteSheet() {
        return this.poolSpriteSheet;
    }

    GetPoolAudioVFX() {
        return this.audioVFX;
    }

    update(time, delta) {
        this.EmitUpdateEvent(time, delta);
    }

    AddUpdateEvent(callback) {
        if (this.currentUpdateEvent) {
            this.currentUpdateEvent.on("update", callback);
        }
    }

    RemoveUpdateEvent(callback) {
        if (this.currentUpdateEvent) {
            this.currentUpdateEvent.off("update", callback);
        }
    }

    EmitUpdateEvent(time, delta) {
        // Phát event update để các enemy lắng nghe
        if (this.currentUpdateEvent) {
            this.currentUpdateEvent.emit("update", time, delta);
        }
    }

    // Tạo event update để các enemy lắng nghe
    createUpdateEvent() {
        this.currentUpdateEvent = new Phaser.Events.EventEmitter();
        this.customEvents["update"] = this.currentUpdateEvent;
    }

    // Hủy toàn bộ custom events
    destroyCustomEvents() {
        for (let eventName in this.customEvents) {
            const eventEmitter = this.customEvents[eventName];
            if (eventEmitter) {
                eventEmitter.removeAllListeners();
            }
        }
        this.customEvents = {};
    }

    shutdown() {
        console.log("Scene gameplay test shutdown triggered");

        // Cleanup damage pools
        if (this.damagePool) {
            this.damagePool.destroy();
        }
        if (this.damagePoolShield) {
            this.damagePoolShield.destroy();
        }

        // Cleanup stage time event
        if (this.stageTimeEvent) {
            this.stageTimeEvent.remove();
        }

        // Hủy đăng ký sự kiện BLUR và FOCUS
        if (this.game && this.game.events) {
            this.game.events.removeListener(
                Phaser.Core.Events.BLUR,
                this.handleBlur
            );
            this.game.events.removeListener(
                Phaser.Core.Events.FOCUS,
                this.handleFocus
            );
        }

        if (this.changeVisibilityListener) {
            this.changeVisibilityListener();
        }

        this.destroyCustomEvents();
    }

    // Override scene destroy
    destroy() {
        //console.log("Scene destroy triggered");

        this.destroyCustomEvents();
    }

    shakeCamera(camera, duration) {
        camera.shake(duration, 0.01); // Thời gian và cường độ rung
    }

    CreateMap(scene) {
        this.map = CreateMapEarth(scene, 1);
    }

    GetMap() {
        return this.map;
    }

    CreatePlayer(scene) {
        for (
            let i = 0;
            i < centerDataPlayer.selectedPlayerTestArr.length;
            i++
        ) {
            let unlockedPlayer =
                centerDataPlayer.playTestPlayer[
                    centerDataPlayer.selectedPlayerTestArr[i]
                ];

            this.spawnedPlayerArr.push(
                new TestPlayer(
                    scene,
                    300,
                    1920,
                    centerDataPlayer.selectedPlayerTestArr[i],
                    unlockedPlayer.code,
                    this.explosionPool,
                    this.strikePool
                )
            );
        }

        this.SetPlayer(scene, centerDataPlayer.selectedPlayerTestArr[0]);
    }

    SetPlayer(scene, _id) {
        //console.log("SetPlayer: ", _id);

        for (let i = 0; i < this.spawnedPlayerArr.length; i++) {
            let p = this.spawnedPlayerArr[i];

            if (p._id === _id) {
                p.setActive(true);
                this.player = p;
            } else {
                p.setActive(false);
            }
        }
    }

    GetCurrentPlayer() {
        return this.player;
    }

    IsPlayerHiding() {
        return this.player.isHiding;
    }

    SetPlayerHit(scene, enemy) {
        if (this.isPlayerDead == true || this.usingShield == true) return;

        this.isPlayerDead = true;

        this.CreateGameOverUI(scene, false);
    }

    CreateGameOverUI(scene, isVictory = false, data) {
        if (this.isGamOverCreated == true) return;

        this.isGamOverCreated = true;

        CreateGameOver(scene, isVictory, data);
    }

    updateCountdown(scene) {
        if (this.countdownTime >= 0) {
            this.countdownTime--;

            SetTimeText(this.formatTime(this.countdownTime));

            // Kiểm tra nếu thời gian đã hết
            if (this.countdownTime < 0) {
                this.CreateGameOverUI(scene, false);
                this.stageTimeEvent.remove(); // Dừng Timer Event
            }
        }
    }

    // Định dạng thời gian thành mm:ss
    formatTime(seconds) {
        if (seconds < 0) {
            return "00:00";
        }

        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    }

    SetupStage(scene) {
        this.startGameId = this.battleData.gameId;

        const mergedArray = [
            ...this.battleData.robots,
            ...this.battleData.drones,
        ];

        this.stageEnemiesCount = mergedArray.length;

        //console.log("this.stageEnemiesCount: ", this.stageEnemiesCount);

        for (let i = 0; i < mergedArray.length; i++) {
            let enemy = mergedArray[i];

            let activeDelayTime = Phaser.Math.Between(
                enemy.spawnDelay.min,
                enemy.spawnDelay.max
            );

            scene.time.delayedCall(activeDelayTime * 1000, () => {
                let spawnedEnemy = this.CreateEnemy(
                    scene,
                    enemy.id,
                    this.ConvertEnemyIdToEnemyType(enemy),
                    enemy.maxHp,
                    enemy.maxShield,
                    enemy.hitCount,
                    enemy.delayHit
                );

                this.stageEnemies[enemy.id] = {
                    id: enemy.id,
                    enemy: spawnedEnemy,
                };

                //console.log("this.stageEnemies: ", this.stageEnemies);
            });
        }

        const endDate = new Date(this.battleData.endTime);
        const startDate = new Date(this.battleData.startTime);

        // Tính hiệu số thời gian (đơn vị là millisecond)
        const timeDifference = endDate - startDate;

        // Chuyển đổi millisecond thành giây
        const secondsDifference = timeDifference / 1000;

        this.countdownTime = secondsDifference;

        if (this.stageTimeEvent) {
            this.stageTimeEvent.remove(); // Dừng Timer Event
        }

        // Tạo Timer Event để đếm ngược
        this.stageTimeEvent = this.time.addEvent({
            delay: 1000, // 1 giây
            callback: this.updateCountdown.bind(this, scene),
            callbackScope: this,
            loop: true,
        });
    }

    ConvertEnemyIdToEnemyType(enemy) {
        if (enemy.id.includes("ROBOT")) {
            if (enemy.maxShield > 0) {
                return ENEMY_KEYS.TANK.KEY;
            } else {
                return ENEMY_KEYS.NORMAL.KEY;
            }
        } else if (enemy.id.includes("DRONE")) {
            return ENEMY_KEYS.DRONE.KEY;
        }

        return null;
    }

    CreateEnemyAttackWarning(scene) {
        if (this.img_warning == null) {
            this.img_warning = scene.add
                .image(540, 230 + 190 / 2, "gameplay_enemy_attack_warning")
                .setOrigin(0.5, 0.5);
        } else {
            this.img_warning.setVisible(true);
        }

        if (this.warningTween) {
            this.warningTween.remove();
        }

        if (this.warningDesstroyDelay) {
            this.warningDesstroyDelay.remove();
        }

        // Tạo tween nhấp nháy
        this.warningTween = scene.tweens.add({
            targets: this.img_warning,
            alpha: 0, // Nhấp nháy alpha
            ease: "Linear",
            duration: 125, // Thời gian mỗi lần nhấp nháy (0.25 giây)
            yoyo: true, // Quay lại trạng thái ban đầu
            repeat: 5, // Lặp lại 5 lần (3 nhấp nháy = 6 trạng thái alpha)
            onComplete: () => {
                // Đảm bảo alpha trở về 1
                this.img_warning.setAlpha(1);

                // Hủy sprite sau 1 giây
                this.warningDesstroyDelay = scene.time.delayedCall(250, () => {
                    this.img_warning.setVisible(false);
                });
            },
        });
    }

    CreateTextDamage(scene, pointer, damage) {
        this.damagePool.create(pointer.x, pointer.y, damage);
    }

    CreateTextDamageShield(scene, pointer, damage) {
        this.damagePoolShield.create(pointer.x, pointer.y, damage);
    }

    CreateEnemy(
        scene,
        enemyId,
        enemyType,
        enemyHealth,
        enemyShield,
        enemyhitCount,
        enemydelayHit
    ) {
        //console.log("create enemy: ", enemyId);

        if (enemyType === "normal") {
            return this.CreateNormalEnemy(
                scene,
                enemyId,
                enemyType,
                enemyHealth,
                enemyShield,
                enemyhitCount,
                enemydelayHit
            );
        } else if (enemyType === "tank") {
            return this.CreateTankEnemy(
                scene,
                enemyId,
                enemyType,
                enemyHealth,
                enemyShield,
                enemyhitCount,
                enemydelayHit
            );
        } else if (enemyType === "drone") {
            return this.CreateDroneEnemy(
                scene,
                enemyId,
                enemyType,
                enemyHealth,
                enemyShield,
                enemyhitCount,
                enemydelayHit
            );
        }

        return null;
    }

    CreateNormalEnemy(
        scene,
        enemyId,
        enemyType,
        enemyHealth,
        enemyShield,
        enemyhitCount,
        enemydelayHit
    ) {
        let newEnemy = new TestEnemy(
            scene,
            enemyId,
            enemyType,
            enemyHealth,
            enemyShield,
            enemyhitCount,
            enemydelayHit,
            (pointer) => {
                this.CheckHitNormalEnemy(scene, pointer, newEnemy);
            },
            () => {
                this.OnEnemyDead(scene, newEnemy);
            }
        );

        return newEnemy;
    }

    CreateTankEnemy(
        scene,
        enemyId,
        enemyType,
        enemyHealth,
        enemyShield,
        enemyhitCount,
        enemydelayHit
    ) {
        let newEnemy = new TestEnemy(
            scene,
            enemyId,
            enemyType,
            enemyHealth,
            enemyShield,
            enemyhitCount,
            enemydelayHit,
            (pointer) => {
                this.CheckHitTankEnemy(scene, pointer, newEnemy);
            },
            () => {
                this.OnEnemyDead(scene, newEnemy);
            }
        );

        return newEnemy;
    }

    CreateDroneEnemy(
        scene,
        enemyId,
        enemyType,
        enemyHealth,
        enemyShield,
        enemyhitCount,
        enemydelayHit
    ) {
        let newEnemy = new TestEnemyDrones(
            scene,
            enemyId,
            enemyType,
            enemyHealth,
            enemyShield,
            enemyhitCount,
            enemydelayHit,
            (pointer) => {
                //console.log("CheckHitDroneEnemy");

                this.CheckHitDroneEnemy(scene, pointer, newEnemy);
            },
            () => {
                this.OnEnemyDead(scene, newEnemy);
            }
        );

        return newEnemy;
    }

    CheckHitNormalEnemy(scene, pointer, normalEnemy) {
        if (this.player.isCanAttack == false) {
            return;
        }

        //console.log("CheckHitNormalEnemy id:", normalEnemy.id);

        if (normalEnemy instanceof TestEnemy) {
            if (normalEnemy.currentHp > 0) {
                // Gọi phương thức takeDamage hoặc các hành động khác khi click
                normalEnemy.takeDamage();

                this.player.takeShoot(pointer);

                if (normalEnemy.currentShield <= 0) {
                    let atkDamage =
                        this.player.unlockedPlayer.starLevelData[
                            this.player.unlockedPlayer.star - 1
                        ].data[this.player.unlockedPlayer.level - 1]
                            .attachDamage;

                    if (this.usingEnergy == true) {
                        atkDamage += atkDamage * 0.1;
                    }

                    let caculatedHealth = normalEnemy.currentHp - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedHealth = Phaser.Math.Clamp(
                        caculatedHealth,
                        0,
                        normalEnemy.currentHp
                    );

                    normalEnemy.setHealth(scene, pointer, caculatedHealth);

                    this.CreateTextDamage(
                        scene,
                        pointer,
                        Math.floor(atkDamage)
                    );
                } else {
                    let atkDamage =
                        this.player.unlockedPlayer.starLevelData[
                            this.player.unlockedPlayer.star - 1
                        ].data[this.player.unlockedPlayer.level - 1]
                            .attachDamage;

                    if (this.usingEnergy == true) {
                        atkDamage += atkDamage * 0.1;
                    }

                    if (this.player.unlockedPlayer.role === "gunner") {
                        atkDamage = atkDamage * 0.2;
                    } else if (this.player.unlockedPlayer.role === "rocket") {
                        atkDamage = atkDamage * 10;
                    } else if (this.player.unlockedPlayer.role === "sniper") {
                        //atkDamage = atkDamage;
                    }

                    let caculatedShield = normalEnemy.currentShield - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedShield = Phaser.Math.Clamp(
                        caculatedShield,
                        0,
                        normalEnemy.currentShield
                    );

                    normalEnemy.setShield(scene, pointer, caculatedShield);

                    this.CreateTextDamageShield(
                        scene,
                        pointer,
                        Math.floor(atkDamage)
                    );
                }

                ActiveCrosshair(
                    this,
                    pointer.x,
                    pointer.y,
                    this.player.unlockedPlayer.role
                );
            }
        }
    }

    CheckHitTankEnemy(scene, pointer, tankEnemy) {
        if (this.player.isCanAttack == false) {
            return;
        }

        if (tankEnemy instanceof TestEnemy) {
            if (tankEnemy.currentHp > 0) {
                // Gọi phương thức takeDamage hoặc các hành động khác khi click
                tankEnemy.takeDamage();

                this.player.takeShoot(pointer);

                if (tankEnemy.currentShield <= 0) {
                    let atkDamage =
                        this.player.unlockedPlayer.starLevelData[
                            this.player.unlockedPlayer.star - 1
                        ].data[this.player.unlockedPlayer.level - 1]
                            .attachDamage;

                    if (this.usingEnergy == true) {
                        atkDamage += atkDamage * 0.1;
                    }

                    let caculatedHealth = tankEnemy.currentHp - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedHealth = Phaser.Math.Clamp(
                        caculatedHealth,
                        0,
                        tankEnemy.currentHp
                    );

                    tankEnemy.setHealth(scene, pointer, caculatedHealth);

                    this.CreateTextDamage(
                        scene,
                        pointer,
                        Math.floor(atkDamage)
                    );
                } else {
                    let atkDamage =
                        this.player.unlockedPlayer.starLevelData[
                            this.player.unlockedPlayer.star - 1
                        ].data[this.player.unlockedPlayer.level - 1]
                            .attachDamage;

                    if (this.usingEnergy == true) {
                        atkDamage += atkDamage * 0.1;
                    }

                    if (this.player.unlockedPlayer.role === "gunner") {
                        atkDamage = atkDamage * 0.2;
                    } else if (this.player.unlockedPlayer.role === "rocket") {
                        atkDamage = atkDamage * 10;
                    } else if (this.player.unlockedPlayer.role === "sniper") {
                        //atkDamage = atkDamage;
                    }

                    let caculatedShield = tankEnemy.currentShield - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedShield = Phaser.Math.Clamp(
                        caculatedShield,
                        0,
                        tankEnemy.currentShield
                    );

                    tankEnemy.setShield(scene, pointer, caculatedShield);

                    this.CreateTextDamageShield(
                        scene,
                        pointer,
                        Math.floor(atkDamage)
                    );
                }

                ActiveCrosshair(
                    this,
                    pointer.x,
                    pointer.y,
                    this.player.unlockedPlayer.role
                );
            }
        }
    }

    CheckHitDroneEnemy(scene, pointer, droneEnemy) {
        if (this.player.isCanAttack == false) {
            return;
        }

        // console.log(
        //     "CheckHitDroneEnemy player role:",
        //     this.player.unlockedPlayer.role
        // );

        if (droneEnemy instanceof TestEnemyDrones) {
            if (droneEnemy.currentHp > 0) {
                this.player.takeShoot(pointer);

                if (droneEnemy.currentShield <= 0) {
                    let atkDamage =
                        this.player.unlockedPlayer.starLevelData[
                            this.player.unlockedPlayer.star - 1
                        ].data[this.player.unlockedPlayer.level - 1]
                            .attachDamage;

                    if (this.usingEnergy == true) {
                        atkDamage += atkDamage * 0.1;
                    }

                    if (this.player.unlockedPlayer.role === "gunner") {
                        atkDamage = atkDamage * 0.2;
                    } else if (this.player.unlockedPlayer.role === "sniper") {
                        atkDamage = atkDamage * 10;
                    } else if (this.player.unlockedPlayer.role === "rocket") {
                        //atkDamage = atkDamage;
                    }

                    let caculatedHealth = droneEnemy.currentHp - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedHealth = Phaser.Math.Clamp(
                        caculatedHealth,
                        0,
                        droneEnemy.currentHp
                    );

                    droneEnemy.setHealth(scene, pointer, caculatedHealth);

                    this.CreateTextDamage(
                        scene,
                        pointer,
                        Math.floor(atkDamage)
                    );
                } else {
                    let atkDamage =
                        this.player.unlockedPlayer.starLevelData[
                            this.player.unlockedPlayer.star - 1
                        ].data[this.player.unlockedPlayer.level - 1]
                            .attachDamage;

                    if (this.usingEnergy == true) {
                        atkDamage += atkDamage * 0.1;
                    }

                    if (this.player.unlockedPlayer.role === "gunner") {
                        atkDamage = atkDamage * 0.2;
                    } else if (
                        this.player.unlockedPlayer.role === "rocket" ||
                        this.player.unlockedPlayer.role === "sniper"
                    ) {
                        atkDamage = atkDamage * 10;
                    }

                    let caculatedShield = droneEnemy.currentShield - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedShield = Phaser.Math.Clamp(
                        caculatedShield,
                        0,
                        droneEnemy.currentShield
                    );

                    droneEnemy.setShield(scene, pointer, caculatedShield);

                    this.CreateTextDamageShield(
                        scene,
                        pointer,
                        Math.floor(atkDamage)
                    );
                }

                ActiveCrosshair(
                    this,
                    pointer.x,
                    pointer.y,
                    this.player.unlockedPlayer.role
                );
            }
        }
    }

    OnEnemyDead(scene, enemy) {
        if (this.killedEnemies.includes(enemy.id) == false) {
            this.killedEnemies.push(enemy.id);
        }

        //console.log("this.killedEnemies: ", this.killedEnemies);

        if (this.stageEnemiesCount == this.killedEnemies.length) {
            this.CreateGameOverUI(scene, true);
        }
    }

    UseEnergy(scene, energySeconds) {
        this.usingEnergy = true;

        scene.time.delayedCall(energySeconds * 1000, () => {
            this.usingEnergy = false;
        });
    }

    UseShield(scene, shieldSeconds) {
        this.usingShield = true;

        let img = scene.add.image(0, 0, "player_shield").setOrigin(0, 0);

        this.map.AddToContainerObstacles(img);

        let tween = scene.tweens.add({
            targets: img, // Đối tượng mà tween sẽ tác động
            alpha: 0.25, // Giá trị alpha cuối cùng (to)
            duration: 1000, // Thời gian chạy (2 giây = 2000ms)
            ease: "Linear", // Hiệu ứng chuyển động tuyến tính
            yoyo: true, // Quay ngược lại sau khi hoàn thành
            repeat: -1, // Lặp lại vô hạn
        });

        scene.time.delayedCall(shieldSeconds * 1000, () => {
            this.usingShield = false;

            tween.stop();
            scene.tweens.remove(tween);

            img.destroy();
        });
    }
}

export default GameplayTest;

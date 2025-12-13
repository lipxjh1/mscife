import { Scene } from "phaser";

import { CreatePlayerSelector } from "./GameplayBoss/GameplayBossPlayerSelector.js";

import { CreateTopBar } from "./GameplayBoss/GameplayBossTopBar.js";
import { SetTimeText } from "./GameplayBoss/GameplayBossTopBar.js";

import { CreateGameOver } from "./GameplayMultiplayerBoss/GameplayMultiplayerBossGameOver.js";

import { CreateCrosshair } from "./Player/Crosshair.js";
import { ActiveCrosshair } from "./Player/Crosshair.js";

import { CreateMap as CreateMapBoss } from "./Map/MapBoss.js";

import Boss from "./Boss/Boss.js";
import BossDrones from "./Boss/BossDrones.js";
import Player from "./Player/Player.js";

import PoolDamageNumber from "./Gameplay/PoolDamageNumber.js";

import centerData from "../Data/CenterData.js";
import centerDataPlayer from "../Data/CenterDataPlayer.js";

import { CreateItemsSelector } from "./Gameplay/GameplayItemSelector.js";
import cdLocalization from "../Data/CenterDataLocalization.js";
import {
    CreateGameRevive,
    DestroyReviveUI,
} from "./GameplayBoss/GameplayBossRevive.js";
import PoolSpriteSheet from "./Gameplay/PoolSpriteSheetVFX.js";
import PoolAudioVFX from "./Gameplay/PoolAudioVFX.js";
import BossTitan from "./Boss/BossTitan.js";
// Removed Telegram SDK import - using generic visibility handling
import { isTelegramMiniApp } from "../utils.js";
import {
    CreateTopDamageBar,
    StopRequestTopDamageLoop,
} from "./GameplayBoss/GameplayBossTopDamage.js";

import { socketServiceMultiplayerBoss } from "../socketMultiplayerBoss.js";
import multiplayerBossRoom from "./GameplayMultiplayerBoss/GameplayMultiplayerBossRoom.js";
import {
    CreatePlayerDead,
    DestroyPlayerDead,
} from "./GameplayMultiplayerBoss/GameplayMultiplayerBossPlayerDead.js";
import { CreateAlertPopup } from "./Share/AlertPopup.js";

export class GameplayMultiplayerBoss extends Scene {
    constructor() {
        super("GameplayMultiplayerBoss");
        this.SOCKET_EVENTS = [
            "bossSpawnDrone",
            "attackDroneResult",
            "playerResurrected",
            "mpboss:battle:timeout",
            "mpboss:battle:gameover",
            "mpboss:shield:damaged",
            "mpboss:boss:hp",
            "mpboss:boss:defeated",
            "mpboss:player:dead",
            "mpboss:player:defeated",
            "mpboss:player:left",
            "error",
        ];

        this.customEvents = {};
    }

    init() {
        this.socketInited = false;

        this.currentEnemyIndex = -1;

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

        this.boss = null;

        this.stageEnemiesCount = 0;

        this.stageEnemies = {};

        this.killedEnemies = [];

        this.isGamOverCreated = false;

        this.battleData = null;

        this.startGameId = "";

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
            this.Focus(this);
        };

        this.cleanupSocketEvents(); // Đảm bảo cleanup trước khi init
        this.InitSocketEvents(this);
        this.SocketJoinBossBattle(this);

        this.events.once("shutdown", () => {
            this.shutdown();
        });

        this.StopTimeCountEvent();
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
                end: 9,
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

        //CreateSkillButtons(this);

        // Tạo bản đồ
        this.CreateMap(this);

        // //Tạo player
        this.CreatePlayer(this);

        // Use generic visibility handling for all platforms
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

    // Thêm các phương thức xử lý blur/focus
    Blur() {
        this.blurTimestamp = Date.now();
        // Tạm dừng âm thanh
        this.sound.pauseAll();
    }

    Focus(scene) {
        const focusTimestamp = Date.now();

        if (this.blurTimestamp > 0) {
            this.UpdateTimeRemain(scene);
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
                console.warn("Failed to unlock audio in GameplayBoss:", error);
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
        console.log("Scene boss shutdown triggered");

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

        // Cleanup socket events
        this.cleanupSocketEvents();

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
        //console.log("Scene boss destroy triggered");
        this.cleanupSocketEvents();

        this.destroyCustomEvents();
    }

    shakeCamera(camera, duration) {
        camera.shake(duration, 0.01); // Thời gian và cường độ rung
    }

    CreateMap(scene) {
        this.map = CreateMapBoss(scene, 0);

        //console.log("this.map: ", this.map);

        const text_map_name = scene.add
            .text(45, 150, multiplayerBossRoom.roomInfo.bossData.name, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "48px",
                color: "#ffffff",
                align: "left",
                wordWrap: { width: 250, useAdvancedWrap: true },
                stroke: "#000000",
                strokeThickness: 1,
                shadow: {
                    offsetX: 2,
                    offsetY: 4,
                    color: "#000000",
                    blur: 0,
                    stroke: true,
                    fill: true,
                },
            })
            .setOrigin(0, 0);
    }

    GetMap() {
        return this.map;
    }

    CreatePlayer(scene) {
        for (let i = 0; i < centerData.selectedPlayerArr.length; i++) {
            this.spawnedPlayerArr.push(
                new Player(
                    scene,
                    300,
                    1920,
                    centerData.selectedPlayerArr[i],
                    centerData.getUnlockedPlayerById(
                        centerData.selectedPlayerArr[i]
                    ).code,
                    this.explosionPool,
                    this.strikePool
                )
            );
        }

        this.SetPlayer(scene, centerData.selectedPlayerArr[0]);
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

        this.SocketBossHitPlayer();
    }

    GameExit() {
        if (this.battleData != null) {
            this.SocketBossHitPlayer();
            this.SocketRoomLeave();
        }
    }

    CreateGameOverUI(scene, isVictory = false, data) {
        if (this.isGamOverCreated == true) return;

        this.isGamOverCreated = true;

        StopRequestTopDamageLoop();

        DestroyPlayerDead();

        CreateGameOver(scene, isVictory, data);
    }

    // Hàm bắt đầu đếm ngược thời gian
    StartTimeCountEvent(scene) {
        // Dừng timer cũ nếu có
        this.StopTimeCountEvent();

        // Tạo timer mới cập nhật mỗi giây
        this.timeCountEvent = scene.time.addEvent({
            delay: 1000, // Cập nhật mỗi 1 giây
            callback: () => {
                this.UpdateTimeRemain(scene);
            },
            loop: true,
        });
    }

    // Hàm dừng đếm ngược thời gian
    StopTimeCountEvent() {
        if (this.timeCountEvent) {
            this.timeCountEvent.remove();
            this.timeCountEvent = null;
        }
    }

    // Hàm cập nhật thời gian còn lại
    UpdateTimeRemain(scene) {
        if (!this.battleData) {
            return;
        }

        let secondsRemain = this.calculateRemainingSeconds(
            this.battleData.bossData.endAt
        );

        // Nếu thời gian đã hết (âm hoặc 0)
        if (secondsRemain <= 0) {
            this.StopTimeCountEvent(); // Dừng timer khi hết giờ

            SetTimeText("00:00:00");

            this.CreateGameOverUI(scene, false);

            return;
        }

        SetTimeText(this.formatTime(secondsRemain));
    }

    calculateRemainingSeconds(targetDateTimeString) {
        // 1. Chuyển đổi chuỗi thời gian mục tiêu thành đối tượng Date (UTC)
        const targetDate = new Date(targetDateTimeString);

        // 2. Lấy thời gian hiện tại
        const now = new Date();

        // 3. Tính toán sự khác biệt về mili giây
        // Nếu targetDate < now, kết quả sẽ là số âm (thời gian đã trôi qua)
        const diffMilliseconds = targetDate.getTime() - now.getTime();

        // 4. Chuyển đổi mili giây sang giây và làm tròn xuống
        const diffSeconds = Math.floor(diffMilliseconds / 1000);

        return diffSeconds;
    }

    // Định dạng thời gian thành hh:mm:ss
    formatTime(seconds) {
        if (seconds < 0) {
            return "00:00";
        }

        // Tính số giờ, phút và giây
        let hours = Math.floor(seconds / 3600); // 1 giờ = 3600 giây
        let remainingSeconds = Math.floor(seconds % 3600); // Số giây còn lại sau khi trừ đi giờ
        let minutes = Math.floor(remainingSeconds / 60); // 1 phút = 60 giây
        let secs = Math.floor(remainingSeconds % 60); // Số giây còn lại

        // Thêm số 0 vào trước nếu giá trị nhỏ hơn 10
        hours = String(hours).padStart(2, "0");
        minutes = String(minutes).padStart(2, "0");
        secs = String(secs).padStart(2, "0");

        // Trả về định dạng "hh:mm:ss"
        return `${hours}:${minutes}:${secs}`;
    }

    SetupStage(scene) {
        //CreateTopDamageBar(scene, this.battleData.bossData.id);

        this.isPlayerDead = false;

        // const reviveDate = new Date(
        //     this.battleData.playerState.nextResurrectionTime
        // );

        // this.CheckPlayerCanRevive(
        //     scene,
        //     this.battleData.playerState.resurrectionsRemaining,
        //     reviveDate
        // );

        this.boss = this.CreateBoss(
            scene,
            this.battleData.bossData.id,
            "WorldBoss",
            this.battleData.bossData.bossHP,
            this.battleData.bossData.maxHP,
            this.battleData.bossData.shield,
            this.battleData.bossData.maxShield,
            0,
            0
        );

        this.StartTimeCountEvent(scene);

        // const CheckBattle = () => {
        //     centerData.RequestBossGameplayStatus(
        //         this.battleData.bossBattle.id,
        //         (result) => {
        //             if (
        //                 result.data == null ||
        //                 result.data.status == "defeated" ||
        //                 result.data.status == "expired"
        //             ) {
        //                 this.CreateGameOverUI(scene, false);
        //             }
        //         },
        //         () => {
        //             this.CreateGameOverUI(scene, false);
        //         }
        //     );
        // };

        // // Gọi lần đầu tiên
        // CheckBattle();

        // // Gọi định kỳ sau mỗi 10 giây
        // this.time.addEvent({
        //     delay: 10000, // 10 giây (10000ms)
        //     callback: () => {
        //         CheckBattle();
        //     }, // Hàm được gọi mỗi lần lặp
        //     callbackScope: this,
        //     loop: true, // Đặt thành true để vòng lặp liên tục
        // });
    }

    SetupDrones(scene, dronesArr) {
        if (this.stageEnemiesCount > 0) {
            this.stageEnemiesCount = 0;

            let keys = Object.keys(this.stageEnemies);

            for (let i = 0; i < keys.length; i++) {
                if (
                    this.stageEnemies[keys[i]].enemy &&
                    this.stageEnemies[keys[i]].enemy.isDead == false
                ) {
                    this.stageEnemies[keys[i]].enemy.setDroneDead(scene, false);
                }
            }

            this.stageEnemies = {};
        }

        this.stageEnemiesCount += dronesArr.length;

        //console.log("this.stageEnemiesCount: ", this.stageEnemiesCount);

        for (let i = 0; i < dronesArr.length; i++) {
            let enemy = dronesArr[i];

            if (enemy.hp > 0) {
                let spawnedEnemy = this.CreateDroneEnemy(
                    scene,
                    enemy.id,
                    enemy.type,
                    enemy.hp,
                    enemy.maxHp,
                    enemy.shield,
                    enemy.maxShield,
                    1,
                    2
                );

                this.stageEnemies[enemy.id] = {
                    id: enemy.id,
                    enemy: spawnedEnemy,
                };
            }

            //console.log("this.stageEnemies: ", this.stageEnemies);
        }
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
        this.warningTween = this.tweens.add({
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
                this.warningDesstroyDelay = this.time.delayedCall(250, () => {
                    this.img_warning.setVisible(false);
                });
            },
        });
    }

    CreateTextDamage(scene, pointer, damage) {
        this.damagePool.create(pointer.x, pointer.y, Math.floor(damage));
    }

    CreateTextDamageShield(scene, pointer, damage) {
        //console.log("CreateTextDamageShield");

        this.damagePoolShield.create(pointer.x, pointer.y, Math.floor(damage));
    }

    CreateBoss(
        scene,
        enemyId,
        enemyType,
        enemyHealth,
        enemyMaxHealth,
        enemyShield,
        enemyMaxShield,
        enemyhitCount,
        enemydelayHit
    ) {
        let newEnemy = null;

        if (enemyType == "WorldBoss") {
            newEnemy = new BossTitan(
                scene,
                enemyId,
                enemyType,
                enemyHealth,
                enemyMaxHealth,
                enemyShield,
                enemyMaxShield,
                enemyhitCount,
                enemydelayHit,
                (pointer) => {
                    this.CheckHitBoss(scene, pointer, newEnemy);
                },
                () => {}
            );
        } else {
            newEnemy = new Boss(
                scene,
                enemyId,
                enemyType,
                enemyHealth,
                enemyMaxHealth,
                enemyShield,
                enemyMaxShield,
                enemyhitCount,
                enemydelayHit,
                (pointer) => {
                    this.CheckHitBoss(scene, pointer, newEnemy);
                },
                () => {}
            );
        }

        return newEnemy;
    }

    GetAtkDamage() {
        let atkDamage = this.player.unlockedPlayer.properties.attachDamage;

        if (
            this.player.unlockedPlayer.role ===
            centerDataPlayer.ROLE_KEY.gunner.KEY
        ) {
            if (
                centerData.userInfo.teamEquipment.gunner &&
                centerData.userInfo.teamEquipment.gunner.neuralink
            ) {
                atkDamage +=
                    atkDamage *
                    (centerData.getItemBaseById(
                        centerData.userInfo.teamEquipment.gunner.neuralink
                    ).properties.powerBonus /
                        100);
            }
        } else if (
            this.player.unlockedPlayer.role ===
            centerDataPlayer.ROLE_KEY.sniper.KEY
        ) {
            if (
                centerData.userInfo.teamEquipment.sniper &&
                centerData.userInfo.teamEquipment.sniper.neuralink
            ) {
                atkDamage +=
                    atkDamage *
                    (centerData.getItemBaseById(
                        centerData.userInfo.teamEquipment.sniper.neuralink
                    ).properties.powerBonus /
                        100);
            }
        } else if (
            this.player.unlockedPlayer.role ===
            centerDataPlayer.ROLE_KEY.rocket.KEY
        ) {
            if (
                centerData.userInfo.teamEquipment.rocket &&
                centerData.userInfo.teamEquipment.rocket.neuralink
            ) {
                atkDamage +=
                    atkDamage *
                    (centerData.getItemBaseById(
                        centerData.userInfo.teamEquipment.rocket.neuralink
                    ).properties.powerBonus /
                        100);
            }
        }

        return atkDamage;
    }

    CheckHitBoss(scene, pointer, boss) {
        //console.log("CheckHitBoss boss: ", boss);

        if (this.player.isCanAttack == false) {
            return;
        }

        if (boss.currentHp > 0) {
            // Gọi phương thức takeDamage hoặc các hành động khác khi click
            boss.takeDamage();

            this.player.takeShoot(pointer);

            if (boss.currentShield <= 0) {
                let atkDamage = this.GetAtkDamage();

                if (this.usingEnergy == true) {
                    atkDamage += atkDamage * 0.1;
                }

                let caculatedHealth = boss.currentHp - atkDamage;

                // Clamp giá trị để không thấp hơn 0
                caculatedHealth = Phaser.Math.Clamp(
                    caculatedHealth,
                    0,
                    boss.currentHp
                );

                //boss.setHealth(scene, pointer, caculatedHealth);

                this.CreateTextDamage(scene, pointer, atkDamage);
            } else {
                let atkDamage = this.GetAtkDamage();

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

                let caculatedShield = boss.currentShield - atkDamage;

                // Clamp giá trị để không thấp hơn 0
                caculatedShield = Phaser.Math.Clamp(
                    caculatedShield,
                    0,
                    boss.currentShield
                );

                //boss.setShield(scene, pointer, caculatedShield);

                this.CreateTextDamageShield(scene, pointer, atkDamage);
            }

            this.SocketAttackBoss(scene);

            ActiveCrosshair(
                this,
                pointer.x,
                pointer.y,
                this.player.unlockedPlayer.role
            );
        }
    }

    CreateDroneEnemy(
        scene,
        enemyId,
        enemyType,
        enemyHealth,
        enemyMaxHealth,
        enemyShield,
        enemyMaxShield,
        enemyhitCount,
        enemydelayHit
    ) {
        let newEnemy = new BossDrones(
            scene,
            enemyId,
            enemyType,
            enemyHealth,
            enemyMaxHealth,
            enemyShield,
            enemyMaxShield,
            enemyhitCount,
            enemydelayHit,
            (pointer) => {
                this.CheckHitDroneEnemy(scene, pointer, newEnemy);
            },
            () => {
                this.OnEnemyDead(scene, newEnemy);
            }
        );

        return newEnemy;
    }

    CheckHitDroneEnemy(scene, pointer, droneEnemy) {
        // console.log("CheckHitDroneEnemy droneEnemy: ", droneEnemy);
        // console.log("CheckHitDroneEnemy droneEnemy.id: ", droneEnemy.id);

        if (this.player.isCanAttack == false) {
            return;
        }

        if (droneEnemy instanceof BossDrones) {
            if (droneEnemy.currentHp > 0) {
                this.player.takeShoot(pointer);

                if (droneEnemy.currentShield <= 0) {
                    let atkDamage = this.GetAtkDamage();

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

                    //droneEnemy.setHealth(scene, pointer, caculatedHealth);

                    this.CreateTextDamage(scene, pointer, atkDamage);
                } else {
                    let atkDamage = this.GetAtkDamage();

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

                    //droneEnemy.setShield(scene, pointer, caculatedShield);

                    this.CreateTextDamageShield(scene, pointer, atkDamage);
                }

                this.SocketAttackDrone(droneEnemy.id);

                ActiveCrosshair(
                    this,
                    pointer.x,
                    pointer.y,
                    this.player.unlockedPlayer.role
                );
            }
        }
    }

    SetDroneEnemyExplode(id) {
        this.SocketDroneExplode(id);
    }

    ResurrectPlayer(scene) {
        this.SocketResurrectPlayer();
    }

    OnEnemyDead(scene, enemy) {
        if (this.killedEnemies.includes(enemy.id) == false) {
            this.killedEnemies.push(enemy.id);
        }

        //console.log("this.killedEnemies: ", this.killedEnemies);
    }

    // Cleanup tất cả socket events
    cleanupSocketEvents() {
        if (socketServiceMultiplayerBoss.socket) {
            //console.log("Cleaning up socket events...");
            // Xóa tất cả các event đã đăng ký
            this.SOCKET_EVENTS.forEach((event) => {
                socketServiceMultiplayerBoss.socket.removeAllListeners(event);
                //console.log(`Removed all listeners for event: ${event}`);
            });
        }
        this.socketInited = false;
    }

    InitSocketEvents(scene) {
        if (this.socketInited) {
            return;
        }

        if (!socketServiceMultiplayerBoss.socket) {
            //console.warn("Socket not initialized");
            return;
        }

        socketServiceMultiplayerBoss.on("mpboss:shield:damaged", (respone) => {
            //console.log("mpboss:shield:damaged: ", respone);

            this.SocketUpdateBossHealth(scene, respone);
            return respone;
        });

        socketServiceMultiplayerBoss.on("mpboss:boss:hp", (respone) => {
            //console.log("mpboss:boss:hp: ", respone);

            this.SocketUpdateBossHealth(scene, respone);
            return respone;
        });

        socketServiceMultiplayerBoss.on("mpboss:boss:attack", (data) => {
            if (this.boss instanceof Boss) {
                let randomHitCount = Phaser.Math.RND.integerInRange(1, 5);

                this.boss.createTimeToAttackArray(scene, randomHitCount, 2);
            } else if (this.boss instanceof BossTitan) {
                let abilityTypes = ["attack", "area_attack", "stun"];

                let selectedAbility = Phaser.Math.RND.pick(abilityTypes);

                let randomHitCount = Phaser.Math.RND.integerInRange(1, 5);

                this.boss.createTimeToAttackArray(
                    scene,
                    selectedAbility,
                    randomHitCount,
                    2
                );
            }

            return data;
        });

        socketServiceMultiplayerBoss.on("bossSpawnDrone", (data) => {
            //console.log("bossSpawnDrone: ", data);

            this.battleData.bossBattle["drones"] = data.drones;

            this.SetupDrones(scene, data.drones);

            return data;
        });

        socketServiceMultiplayerBoss.on("mpboss:boss:defeated", (respone) => {
            //console.log("mpboss:boss:defeated: ", respone);

            this.CreateGameOverUI(scene, true, respone);
        });

        socketServiceMultiplayerBoss.on("mpboss:battle:timeout", (data) => {
            //console.log("mpboss:battle:timeout: ", data);

            this.CreateGameOverUI(scene, false, data);
        });

        socketServiceMultiplayerBoss.on("mpboss:room:closed", (data) => {
            //console.log("mpboss:battle:timeout: ", data);

            this.CreateGameOverUI(scene, false, data);

            CreateAlertPopup(scene, data.reason);
        });

        socketServiceMultiplayerBoss.on("attackDroneResult", (data) => {
            //console.log("attackDroneResult: ", data);

            this.SocketUpdateAttackDroneResult(scene, data);

            return data;
        });

        socketServiceMultiplayerBoss.on("mpboss:player:dead", (data) => {
            //console.log("mpboss:player:dead: ", data);

            this.socketUpdatePlayerDied(scene, data);

            return data;
        });

        socketServiceMultiplayerBoss.on("mpboss:player:defeated", (data) => {
            //console.log("mpboss:player:defeated: ", data);

            this.CreateGameOverUI(scene, false, data);
        });

        socketServiceMultiplayerBoss.on("mpboss:player:left", (data) => {
            //console.log("mpboss:player:left: ", data);

            this.CreateGameOverUI(scene, false, data);
        });

        socketServiceMultiplayerBoss.on("playerResurrected", (data) => {
            //console.log("playerResurrected: ", data);

            this.socketUpdatePlayerResurrected(scene, data);

            return data;
        });

        socketServiceMultiplayerBoss.on("error", (data) => {
            //console.log("error: ", data);

            return data;
        });

        this.socketInited = true;
        //console.log("Socket events initialized");
    }

    SocketUpdateAttackDroneResult(scene, data) {
        if (
            this.stageEnemiesCount > 0 &&
            this.stageEnemies[data.droneId] != null
        ) {
            let enemy = this.stageEnemies[data.droneId].enemy;

            enemy.setHealth(scene, null, data.droneHealth);

            if (data.droneShield != null) {
                enemy.setShield(scene, null, enemy.droneShield);
            }
        }
    }

    SocketJoinBossBattle(scene) {
        socketServiceMultiplayerBoss.emit(
            "mpboss:battle:start",
            {
                roomId: multiplayerBossRoom.roomInfo.roomId,
            },
            (respone) => {
                //console.log("SocketJoinBossBattle respone: ", respone);

                if (respone.data) {
                    if (this.stageEnemiesCount == 0) {
                        this.battleData = respone.data;
                        this.battleData.roomId =
                            multiplayerBossRoom.roomInfo.roomId;
                        this.SetupStage(scene);
                    }
                }
            }
        );
    }

    SocketUpdateAttackBossResult(scene, data) {
        this.battleData.bossData.bossHP = data.currentHP;
        this.battleData.bossData.shield = data.currentShield;

        this.boss.setHealth(scene, null, this.battleData.bossData.bossHP);
        this.boss.setShield(scene, null, this.battleData.bossData.shield);
    }

    SocketUpdateBossHealth(scene, data) {
        if (data.shield != null) {
            this.battleData.bossData.shield = data.shield;
            this.boss.setShield(scene, null, this.battleData.bossData.shield);
        }

        if (data.currentHP != null) {
            this.battleData.bossData.bossHP = data.currentHP;
            this.boss.setHealth(scene, null, this.battleData.bossData.bossHP);
        }
    }

    SocketAttackBoss(scene) {
        // console.log("SocketAttackBoss bossBattleId:", bossId);
        // console.log("SocketAttackBoss characterId:", this.player._id);

        socketServiceMultiplayerBoss.emit(
            "mpboss:battle:attack",
            {
                roomId: this.battleData.roomId,
                characterId: this.player._id,
            },
            (respone) => {
                this.SocketUpdateAttackBossResult(scene, respone.data);
            }
        );
    }

    SocketAttackDrone(hitDroneId) {
        socketServiceMultiplayerBoss.emit("attackDrone", {
            bossBattleId: this.battleData.bossBattle.id,
            characterId: this.player._id,
            droneId: hitDroneId,
        });
    }

    SocketDroneExplode(id) {
        let eData = this.stageEnemies[id];

        // console.log("SocketDroneExplode e:", eData);
        // console.log("SocketDroneExplode id:", eData.id);
        // console.log("SocketDroneExplode currentHp:", eData.enemy.currentHp);

        if (eData.enemy != null && eData.enemy.currentHp > 0) {
            socketServiceMultiplayerBoss.emit("drone_explode", {
                bossBattleId: this.battleData.bossBattle.id,
                droneId: id,
            });
        }
    }

    SocketBossHitPlayer() {
        //console.log("mpboss:boss:hit");

        let playerId = "";

        if (multiplayerBossRoom.IsHost()) {
            playerId = multiplayerBossRoom.roomInfo.players.host.id;
        } else {
            playerId = multiplayerBossRoom.roomInfo.players.guest.id;
        }

        socketServiceMultiplayerBoss.emit(
            "mpboss:boss:hit",
            {
                roomId: this.battleData.roomId,
                playerId: playerId,
            },
            (respone) => {
                //console.log("mpboss:boss:hit", respone);
            }
        );
    }

    SocketRoomLeave() {
        multiplayerBossRoom.LeaveRoom(
            (respone) => {
                //console.log("mpboss:room:leave respone", respone);
            },
            (error) => {
                //console.log("mpboss:room:leave error", error);
            }
        );
    }

    socketUpdatePlayerDied(scene, data) {
        let playerId = "";

        if (multiplayerBossRoom.IsHost()) {
            playerId = multiplayerBossRoom.roomInfo.players.host.id;
        } else {
            playerId = multiplayerBossRoom.roomInfo.players.guest.id;
        }

        if (data.playerId === playerId) {
            CreatePlayerDead(scene, data);
        }
    }

    socketUpdatePlayerResurrected(scene, data) {
        this.isPlayerDead = data.isDead;

        this.battleData.playerState.isDead = this.isPlayerDead;

        this.usingEnergy = false;
        this.usingShield = false;

        CreateItemsSelector(scene);

        this.SetupDrones(scene, []);

        DestroyReviveUI();
    }

    CheckPlayerCanRevive(scene, reviveTimes, ReviveDate) {
        if (
            this.battleData.playerState.isDead == true &&
            this.battleData.playerState.resurrectionsRemaining > 0
        ) {
            CreateGameRevive(scene, reviveTimes, ReviveDate);
        }
    }

    SocketResurrectPlayer() {
        //console.log("SocketResurrectPlayer");

        socketServiceMultiplayerBoss.emit("resurrectPlayer", {
            bossBattleId: this.battleData.bossBattle.id,
        });
    }

    SocketUseItem(itemCode) {
        socketServiceMultiplayerBoss.emit(
            "mpboss:player:useItem",
            {
                roomId: this.battleData.roomId,
                itemCode: itemCode,
            },
            (respone) => {
                //console.log("mpboss:player:useItem respone: ", respone);
            }
        );
    }

    UseEnergy(scene, energySeconds) {
        this.usingEnergy = true;

        this.time.delayedCall(energySeconds * 1000, () => {
            this.usingEnergy = false;
        });
    }

    UseShield(scene, shieldSeconds) {
        this.usingShield = true;

        let img = scene.add.image(0, 0, "player_shield").setOrigin(0, 0);

        this.map.AddToContainerObstacles(img);

        let tween = this.tweens.add({
            targets: img, // Đối tượng mà tween sẽ tác động
            alpha: 0.25, // Giá trị alpha cuối cùng (to)
            duration: 1000, // Thời gian chạy (2 giây = 2000ms)
            ease: "Linear", // Hiệu ứng chuyển động tuyến tính
            yoyo: true, // Quay ngược lại sau khi hoàn thành
            repeat: -1, // Lặp lại vô hạn
        });

        this.time.delayedCall(shieldSeconds * 1000, () => {
            this.usingShield = false;

            tween.stop();
            this.tweens.remove(tween);

            img.destroy();
        });
    }
}

export default GameplayMultiplayerBoss;

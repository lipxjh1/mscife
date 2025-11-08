import { Scene } from "phaser";

import { CreatePlayerSelector } from "./Gameplay/GameplayPlayerSelector.js";

// ✅ NEW: Battle System Optimizer for Load On Demand
class BattleSystemOptimizer {
    constructor() {
        this.battleDataCache = new Map();
        this.preloadedCharacters = new Set();
        this.loadingPromises = new Map();
    }
    
    // ✅ NEW: Preload battle characters with assets and data
    async preloadBattleCharacters(characterIds) {
        console.log('BattleSystemOptimizer: Preloading characters', characterIds);
        
        const promises = characterIds.map(id => {
            if (this.preloadedCharacters.has(id)) {
                return Promise.resolve();
            }
            
            this.preloadedCharacters.add(id);
            
            return Promise.all([
                this.preloadCharacterAssets(id),
                this.preloadCharacterData(id)
            ]);
        });
        
        await Promise.all(promises);
        console.log('BattleSystemOptimizer: Preloading completed');
    }
    
    // ✅ NEW: Preload character assets
    async preloadCharacterAssets(characterId) {
        if (this.loadingPromises.has(characterId)) {
            return this.loadingPromises.get(characterId);
        }
        
        const promise = new Promise((resolve, reject) => {
            try {
                // Use AssetPlayerLoadingManager for asset preloading
                if (window.AssetPlayerLoadingManager && window.AssetPlayerLoadingManager.getInstance) {
                    window.AssetPlayerLoadingManager.getInstance().lazyLoadCharacterAssets(characterId, resolve);
                } else {
                    resolve(); // Fallback if AssetPlayerLoadingManager not available
                }
            } catch (error) {
                console.error('BattleSystemOptimizer: Error preloading character assets', characterId, error);
                reject(error);
            }
        });
        
        this.loadingPromises.set(characterId, promise);
        return promise;
    }
    
    // ✅ NEW: Preload character data
    async preloadCharacterData(characterId) {
        try {
            if (centerData && centerData.loadCharacterFullInfo) {
                await centerData.loadCharacterFullInfo(characterId);
            }
        } catch (error) {
            console.error('BattleSystemOptimizer: Error preloading character data', characterId, error);
        }
    }
    
    // ✅ NEW: Get optimized battle data
    getOptimizedBattleData(battleId) {
        if (this.battleDataCache.has(battleId)) {
            return this.battleDataCache.get(battleId);
        }
        
        // Fallback to GetMergedCharacters if not cached
        const battleData = centerData ? centerData.GetMergedCharacters() : {};
        this.battleDataCache.set(battleId, battleData);
        return battleData;
    }
    
    // ✅ NEW: Cache battle data
    cacheBattleData(battleId, characterData) {
        this.battleDataCache.set(battleId, characterData);
    }
    
    // ✅ NEW: Clear cache for specific battle
    clearBattleCache(battleId) {
        this.battleDataCache.delete(battleId);
    }
    
    // ✅ NEW: Get selected characters optimized
    getSelectedCharactersOptimized() {
        if (!centerData || !centerData.selectedPlayerArr) {
            return [];
        }
        
        // Return array copy for compatibility
        return [...centerData.selectedPlayerArr];
    }
    
    // ✅ NEW: Get optimized player lookup using Map for O(1) access
    getOptimizedPlayerLookup(spawnedPlayerArr) {
        const playerMap = new Map();
        for (let i = 0; i < spawnedPlayerArr.length; i++) {
            const player = spawnedPlayerArr[i];
            if (player && player._id) {
                playerMap.set(player._id, player);
            }
        }
        return playerMap;
    }
}

// Global instance
window.battleSystemOptimizer = window.battleSystemOptimizer || new BattleSystemOptimizer();

import { CreateTopBar } from "./Gameplay/GameplayTopBar.js";
import { SetTimeText } from "./Gameplay/GameplayTopBar.js";

import { CreateGameOver } from "./Gameplay/GameplayGameOver.js";

import { CreateCrosshair } from "./Player/Crosshair.js";
import { ActiveCrosshair } from "./Player/Crosshair.js";

import { CreateMap as CreateMapEarth } from "./Map/MapEarth.js";
import { CreateMap as CreateMapSpace } from "./Map/MapSpace.js";
import { CreateMap as CreatemapMars } from "./Map/MapMars.js";

import Enemy, { ENEMY_KEYS } from "./Enemy/Enemy.js";
import EnemyDrones from "./Enemy/EnemyDrones.js";
import Player from "./Player/Player.js";

import PoolDamageNumber from "./Gameplay/PoolDamageNumber.js";

import centerData from "../Data/CenterData.js";

import centerDataBattle from "../Data/DataBattle/CenterDataBattle.js";

import { socketService } from "../socket.js";
import { CreateItemsSelector } from "./Gameplay/GameplayItemSelector.js";
import cdLocalization from "../Data/CenterDataLocalization.js";
import {
    CreateSkillButtons,
    setCurrentPlayerSkill,
} from "./Gameplay/GameplaySkillButtons.js";
import EnemyGhost from "./Enemy/EnemyGhost.js";
import PoolSpriteSheet from "./Gameplay/PoolSpriteSheetVFX.js";
import PoolAudioVFX from "./Gameplay/PoolAudioVFX.js";
import centerDataPlayer from "../Data/CenterDataPlayer.js";

import { on } from "@telegram-apps/sdk";
import { isTelegramMiniApp } from "../utils.js";
import { CreateGuideGameplay } from "./Guide/GuideGameplay.js";

export class Gameplay extends Scene {
    constructor() {
        super("Gameplay");
        this.SOCKET_EVENTS = ["started", "update", "game_complete", "error"];
        this.customEvents = {}; // Lưu trữ các event custom
    }

    init() {
        this.socketInited = false;

        this.currentEnemyIndex = -1;

        this.currentDisplayedEnemy = null; // Kẻ địch đang được hiển thị thanh máu

        this.blurTimestamp = 0;
        this.countdownTime = 0;

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

        this.map = null;

        this.img_warning = null;
        this.warningTween = null;
        this.warningDesstroyDelay = null;

        this.spawnedPlayerArr = [];
        this.player = null;
        this.isPlayerDead = false;

        this.isSkillGunnerShootAll = false;
        this.isSkillSniperHideAll = false;
        this.isSkillRocketShootAll = false;

        this.battle = null;

        this.usingShield = false;

        this.usingEnergy = false;

        this.stageEnemiesCount = 0;

        this.stageEnemies = {};

        this.killedEnemies = [];

        this.hitEnemies = [];

        this.isGamOverCreated = false;

        this.battleData = null;

        this.startGameId = "";

        this.sampleBattleData = {
            drones: [
                {
                    currentHp: 200,
                    currentShield: 50,
                    delayHit: 1,
                    hitCount: 2,
                    id: "DRONE_0",
                    maxHp: 200,
                    maxShield: 50,
                },
                {
                    currentHp: 150,
                    currentShield: 30,
                    delayHit: 3,
                    hitCount: 1,
                    id: "DRONE_1",
                    maxHp: 150,
                    maxShield: 30,
                },
            ],
            endTime: "2025-01-25T02:44:35.142Z",
            gameId: "878cd7be-f0b7-4c21-8842-9b87c292a54c",
            robots: [
                {
                    currentHp: 300,
                    currentShield: 0,
                    delayHit: 2,
                    hitCount: 1,
                    id: "ROBOT_0",
                    maxHp: 300,
                    maxShield: 0,
                },
                {
                    currentHp: 300,
                    currentShield: 0,
                    delayHit: 2,
                    hitCount: 1,
                    id: "ROBOT_1",
                    maxHp: 300,
                    maxShield: 0,
                },
            ],
            startTime: "2025-01-25T02:44:05.142Z",
        };

        this.CurrentStage = centerData.userInfo.CurrentStage;

        if (centerData.replayStage > 0) {
            this.CurrentStage = centerData.replayStage;
        }

        this.cleanupSocketEvents(); // Đảm bảo cleanup trước khi init
        this.InitSocketEvents(this);
        this.SocketStartBattle();

        this.events.once("shutdown", () => {
            this.shutdown();
        });
    }

    preload() {}

    create() {
        // Xử lý âm thanh cho iOS và các thiết bị khác
        this.setupAudio();

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

        // Tạo bản đồ
        this.CreateMap(this);

        //CreateSkillButtons(this);

        //Tạo player
        this.CreatePlayer(this);

        this.createUpdateEvent();

        this.blurTimestamp = 0;

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
            // Lắng nghe sự kiện BLUR
            this.game.events.addListener(
                Phaser.Core.Events.BLUR,
                this.handleBlur
            );

            // Lắng nghe sự kiện FOCUS
            this.game.events.addListener(
                Phaser.Core.Events.FOCUS,
                this.handleFocus
            );
        }

        CreateGuideGameplay(this);
    }

    Blur() {
        this.blurTimestamp = Date.now();
    }

    Focus() {
        const focusTimestamp = Date.now();

        if (this.blurTimestamp > 0) {
            const durationInMs = focusTimestamp - this.blurTimestamp;
            const durationInSeconds = durationInMs / 1000;

            this.countdownTime -= durationInSeconds;

            if (this.countdownTime < 0) {
                this.countdownTime = 0;
            }

            SetTimeText(this.formatTime(this.countdownTime));

            this.blurTimestamp = 0;
        }
    }

    setupAudio() {
        this.sound.pauseOnBlur = false;

        // Thêm multiple event listeners để đảm bảo audio được unlock
        const unlockAudio = () => {
            try {
                this.sound.unlock();
            } catch (error) {
                console.warn("Failed to unlock audio in Gameplay:", error);
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
        console.log("Scene gameplay shutdown triggered");

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
        //console.log("Scene destroy triggered");
        this.cleanupSocketEvents();
    }

    shakeCamera(camera, duration) {
        camera.shake(duration, 0.01); // Thời gian và cường độ rung
    }

    CreateMap(scene) {
        //console.log("CreateMap stage: ", this.CurrentStage);

        if (this.CurrentStage <= 20) {
            this.map = CreateMapEarth(scene, this.CurrentStage);
        } else if (this.CurrentStage <= 40) {
            this.map = CreateMapSpace(scene, this.CurrentStage);
        } else if (this.CurrentStage <= 60) {
            this.map = CreatemapMars(scene, this.CurrentStage);
        } else {
            this.map = CreateMapEarth(scene, this.CurrentStage);
        }

        //console.log("this.map: ", this.map);

        const text_map_name = scene.add
            .text(
                45,
                150,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeCampian.KEY,
                    centerDataBattle.GetBattleName(this.CurrentStage)
                ),
                {
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
                }
            )
            .setOrigin(0, 0);

        const text_map_id = scene.add
            .text(
                45,
                200,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeCampian.KEY,
                    "Stage "
                ) + this.CurrentStage,
                {
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
                }
            )
            .setOrigin(0, 0);
    }

    GetMap() {
        return this.map;
    }

    CreatePlayer(scene) {
        // ✅ NEW: Optimized async player creation with preloading
        this.initializeBattleOptimized(scene);
    }

    // ✅ NEW: Optimized battle initialization with preloading
    async initializeBattleOptimized(scene) {
        console.log('initializeBattleOptimized: Starting optimized battle initialization');
        
        try {
            // Step 1: Get selected characters optimized
            const selectedCharacters = window.battleSystemOptimizer.getSelectedCharactersOptimized();
            console.log('initializeBattleOptimized: Selected characters', selectedCharacters);
            
            // Step 2: Preload selected characters
            if (selectedCharacters.length > 0) {
                await window.battleSystemOptimizer.preloadBattleCharacters(selectedCharacters);
            }
            
            // Step 3: Create player characters with preloaded data
            for (let i = 0; i < selectedCharacters.length; i++) {
                const characterId = selectedCharacters[i];
                const playerData = centerData.getUnlockedPlayerById(characterId);
                
                if (playerData) {
                    this.spawnedPlayerArr.push(
                        new Player(
                            scene,
                            300,
                            1920,
                            characterId,
                            playerData.code,
                            this.explosionPool,
                            this.strikePool
                        )
                    );
                } else {
                    console.error('initializeBattleOptimized: Player data not found for', characterId);
                }
            }
            
            // Step 4: Set player with optimized data
            if (selectedCharacters.length > 0) {
                this.SetPlayer(scene, selectedCharacters[0]);
            }
            
            console.log('initializeBattleOptimized: Battle initialization completed');
        } catch (error) {
            console.error('initializeBattleOptimized: Error during battle initialization', error);
            
            // Fallback to original implementation if optimization fails
            this.CreatePlayerFallback(scene);
        }
    }
    
    // ✅ NEW: Fallback implementation for backward compatibility
    CreatePlayerFallback(scene) {
        console.log('CreatePlayerFallback: Using fallback implementation');
        
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

        this.SetPlayerFallback(scene, centerData.selectedPlayerArr[0]);
    }

    SetPlayer(scene, _id) {
        console.log('SetPlayer: Setting player', _id);
        
        // ✅ NEW: Use optimized player lookup for O(1) access
        const thisRef = this; // Store reference for async context
        
        // Try to use optimized lookup if available, fallback to linear search
        try {
            const playerMap = window.battleSystemOptimizer.getOptimizedPlayerLookup(thisRef.spawnedPlayerArr);
            const player = playerMap.get(_id);
            
            if (player) {
                thisRef.setActivePlayer(player, playerMap);
                setCurrentPlayerSkill(scene);
            } else {
                console.error('SetPlayer: Player not found in optimized lookup, using fallback');
                thisRef.SetPlayerFallback(scene, _id);
            }
        } catch (error) {
            console.error('SetPlayer: Error with optimized lookup, using fallback', error);
            thisRef.SetPlayerFallback(scene, _id);
        }
    }
    
    // ✅ NEW: Optimized player activation with Map
    setActivePlayer(activePlayer, playerMap) {
        // Deactivate all players first
        for (const [id, player] of playerMap) {
            player.setActive(false);
        }
        
        // Activate the target player
        activePlayer.setActive(true);
        this.player = activePlayer;
    }
    
    // ✅ NEW: Fallback SetPlayer implementation
    SetPlayerFallback(scene, _id) {
        console.log('SetPlayerFallback: Using fallback implementation for', _id);

        for (let i = 0; i < this.spawnedPlayerArr.length; i++) {
            let p = this.spawnedPlayerArr[i];

            if (p._id === _id) {
                p.setActive(true);
                this.player = p;
            } else {
                p.setActive(false);
            }
        }

        setCurrentPlayerSkill(scene);
    }

    GetCurrentPlayer() {
        return this.player;
    }

    IsPlayerHiding() {
        return this.player.isHiding;
    }

    SetPlayerHit(scene, enemy) {
        if (
            this.isPlayerDead == true ||
            this.usingShield == true ||
            this.isSkillSniperHideAll == true
        )
            return;

        this.isPlayerDead = true;

        this.SocketEnemyAttack(enemy.id);

        this.CreateGameOverUI(scene, false);
    }

    SetSkillGunnerShootAll(scene, activeTime) {
        if (activeTime > 0) {
            this.isSkillGunnerShootAll = true;

            scene.time.delayedCall(activeTime * 1000, () => {
                this.isSkillGunnerShootAll = false;
            });
        } else {
            this.isSkillGunnerShootAll = false;
        }
    }

    SetSkillRocketShootAll(scene, activeTime) {
        if (activeTime > 0) {
            this.isSkillRocketShootAll = true;

            scene.time.delayedCall(activeTime * 1000, () => {
                this.isSkillRocketShootAll = false;
            });
        } else {
            this.isSkillRocketShootAll = false;
        }
    }

    CheckSkillHitAll(scene, hitEnemy) {
        let player = this.GetCurrentPlayer();

        if (player != null) {
            if (player.unlockedPlayer.role == "sniper") {
                return;
            } else if (
                player.unlockedPlayer.role == "gunner" &&
                this.isSkillGunnerShootAll == false
            ) {
                return;
            } else if (
                player.unlockedPlayer.role == "rocket" &&
                this.isSkillRocketShootAll == false
            ) {
                return;
            }
        }

        let keys = Object.keys(this.stageEnemies);

        for (let i = 0; i < keys.length; i++) {
            let enemy = this.stageEnemies[keys[i]].enemy;

            if (
                enemy != null &&
                enemy.id != hitEnemy.id &&
                this.killedEnemies.includes(enemy.id) == false
            ) {
                if (enemy instanceof Enemy) {
                    this.CheckHitNormalEnemy(
                        scene,
                        {
                            x: enemy.container.x,
                            y: enemy.container.y - enemy.spine.height / 2,
                        },
                        enemy
                    );
                }

                if (enemy instanceof EnemyGhost) {
                    this.CheckHitGhostEnemy(
                        scene,
                        {
                            x: enemy.container.x,
                            y: enemy.container.y - enemy.droneSpine.height / 2,
                        },
                        enemy
                    );
                }

                if (enemy instanceof EnemyDrones) {
                    this.CheckHitDroneEnemy(
                        scene,
                        {
                            x: enemy.container.x,
                            y: enemy.container.y - enemy.droneSpine.height / 2,
                        },
                        enemy
                    );
                }
            }
        }
    }

    SetSkillSniperHideAll(scene, activeTime) {
        if (activeTime > 0) {
            this.isSkillSniperHideAll = true;

            for (let i = 0; i < this.spawnedPlayerArr.length; i++) {
                let p = this.spawnedPlayerArr[i];

                p.player_spine.alpha = 0.5;
            }

            scene.time.delayedCall(activeTime * 1000, () => {
                this.isSkillSniperHideAll = false;

                for (let i = 0; i < this.spawnedPlayerArr.length; i++) {
                    let p = this.spawnedPlayerArr[i];

                    p.player_spine.alpha = 1;
                }
            });
        } else {
            this.isSkillSniperHideAll = false;
        }
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

            let activeDelayTime = Math.floor(Math.random() * 3);

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
        this.damagePool.create(pointer.x, pointer.y, Math.floor(damage));
    }

    CreateTextDamageShield(scene, pointer, damage) {
        this.damagePoolShield.create(pointer.x, pointer.y, Math.floor(damage));
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
            if (this.CurrentStage < 41) {
                return this.CreateNormalEnemy(
                    scene,
                    enemyId,
                    enemyType,
                    enemyHealth,
                    enemyShield,
                    enemyhitCount,
                    enemydelayHit
                );
            } else {
                return this.CreateGhostEnemy(
                    scene,
                    enemyId,
                    enemyType,
                    enemyHealth,
                    enemyShield,
                    enemyhitCount,
                    enemydelayHit
                );
            }
        } else if (enemyType === "tank") {
            if (this.CurrentStage < 41) {
                return this.CreateTankEnemy(
                    scene,
                    enemyId,
                    enemyType,
                    enemyHealth,
                    enemyShield,
                    enemyhitCount,
                    enemydelayHit
                );
            } else {
                return this.CreateGhostEnemy(
                    scene,
                    enemyId,
                    enemyType,
                    enemyHealth,
                    enemyShield,
                    enemyhitCount,
                    enemydelayHit
                );
            }
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
        let newEnemy = new Enemy(
            scene,
            enemyId,
            enemyType,
            enemyHealth,
            enemyShield,
            enemyhitCount,
            enemydelayHit,
            (pointer) => {
                if (this.player.isCanAttack == false) {
                    return;
                }

                this.CheckHitNormalEnemy(scene, pointer, newEnemy);

                this.CheckSkillHitAll(scene, newEnemy);
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
        let newEnemy = new Enemy(
            scene,
            enemyId,
            enemyType,
            enemyHealth,
            enemyShield,
            enemyhitCount,
            enemydelayHit,
            (pointer) => {
                if (this.player.isCanAttack == false) {
                    return;
                }

                this.CheckHitTankEnemy(scene, pointer, newEnemy);

                this.CheckSkillHitAll(scene, newEnemy);
            },
            () => {
                this.OnEnemyDead(scene, newEnemy);
            }
        );

        return newEnemy;
    }

    CreateGhostEnemy(
        scene,
        enemyId,
        enemyType,
        enemyHealth,
        enemyShield,
        enemyhitCount,
        enemydelayHit
    ) {
        let newEnemy = new EnemyGhost(
            scene,
            enemyId,
            enemyType,
            enemyHealth,
            enemyShield,
            enemyhitCount,
            enemydelayHit,
            (pointer) => {
                if (this.player.isCanAttack == false) {
                    return;
                }

                this.CheckHitGhostEnemy(scene, pointer, newEnemy);

                this.CheckSkillHitAll(scene, newEnemy);
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
        let newEnemy = new EnemyDrones(
            scene,
            enemyId,
            enemyType,
            enemyHealth,
            enemyShield,
            enemyhitCount,
            enemydelayHit,
            (pointer) => {
                if (this.player.isCanAttack == false) {
                    return;
                }

                this.CheckHitDroneEnemy(scene, pointer, newEnemy);

                this.CheckSkillHitAll(scene, newEnemy);
            },
            () => {
                this.OnEnemyDead(scene, newEnemy);
            }
        );

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

    CheckHitNormalEnemy(scene, pointer, normalEnemy) {
        //console.log("CheckHitNormalEnemy id:", normalEnemy.id);

        if (normalEnemy instanceof Enemy) {
            if (normalEnemy.currentHp > 0) {
                // Đặt kẻ địch này làm kẻ địch hiện tại đang hiển thị thanh máu
                this.currentDisplayedEnemy = normalEnemy;

                // Gọi phương thức takeDamage hoặc các hành động khác khi click
                normalEnemy.takeDamage();

                this.player.takeShoot(pointer);

                if (normalEnemy.currentShield <= 0) {
                    let atkDamage = this.GetAtkDamage();

                    let caculatedHealth = normalEnemy.currentHp - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedHealth = Phaser.Math.Clamp(
                        caculatedHealth,
                        0,
                        normalEnemy.currentHp
                    );

                    //normalEnemy.setHealth(scene, pointer, caculatedHealth);

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

                    let caculatedShield = normalEnemy.currentShield - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedShield = Phaser.Math.Clamp(
                        caculatedShield,
                        0,
                        normalEnemy.currentShield
                    );

                    //normalEnemy.setShield(scene, pointer, caculatedShield);

                    this.CreateTextDamageShield(scene, pointer, atkDamage);
                }

                if (this.hitEnemies.includes(normalEnemy.id) == false) {
                    this.hitEnemies.push(normalEnemy.id);
                }

                this.SocketAttackEnemy(normalEnemy.id);

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
        //console.log("CheckHitTankEnemy id:", tankEnemy.id);

        if (tankEnemy instanceof Enemy) {
            if (tankEnemy.currentHp > 0) {
                // Đặt kẻ địch này làm kẻ địch hiện tại đang hiển thị thanh máu
                this.currentDisplayedEnemy = tankEnemy;

                // Gọi phương thức takeDamage hoặc các hành động khác khi click
                tankEnemy.takeDamage();

                this.player.takeShoot(pointer);

                if (tankEnemy.currentShield <= 0) {
                    let atkDamage = this.GetAtkDamage();

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

                    //tankEnemy.setHealth(scene, pointer, caculatedHealth);

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

                    let caculatedShield = tankEnemy.currentShield - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedShield = Phaser.Math.Clamp(
                        caculatedShield,
                        0,
                        tankEnemy.currentShield
                    );

                    //tankEnemy.setShield(scene, pointer, caculatedShield);

                    this.CreateTextDamageShield(scene, pointer, atkDamage);
                }

                if (this.hitEnemies.includes(tankEnemy.id) == false) {
                    this.hitEnemies.push(tankEnemy.id);
                }

                this.SocketAttackEnemy(tankEnemy.id);

                ActiveCrosshair(
                    this,
                    pointer.x,
                    pointer.y,
                    this.player.unlockedPlayer.role
                );
            }
        }
    }

    CheckHitGhostEnemy(scene, pointer, ghostEnemy) {
        //console.log("CheckHitGhostEnemy id:", ghostEnemy.id);

        if (ghostEnemy instanceof EnemyGhost) {
            if (ghostEnemy.currentHp > 0) {
                // Đặt kẻ địch này làm kẻ địch hiện tại đang hiển thị thanh máu
                this.currentDisplayedEnemy = ghostEnemy;

                // Gọi phương thức takeDamage hoặc các hành động khác khi click
                ghostEnemy.takeDamage();

                this.player.takeShoot(pointer);

                if (ghostEnemy.currentShield <= 0) {
                    let atkDamage = this.GetAtkDamage();

                    if (this.usingEnergy == true) {
                        atkDamage += atkDamage * 0.1;
                    }

                    let caculatedHealth = ghostEnemy.currentHp - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedHealth = Phaser.Math.Clamp(
                        caculatedHealth,
                        0,
                        ghostEnemy.currentHp
                    );

                    //normalEnemy.setHealth(scene, pointer, caculatedHealth);

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

                    let caculatedShield = ghostEnemy.currentShield - atkDamage;

                    // Clamp giá trị để không thấp hơn 0
                    caculatedShield = Phaser.Math.Clamp(
                        caculatedShield,
                        0,
                        ghostEnemy.currentShield
                    );

                    //normalEnemy.setShield(scene, pointer, caculatedShield);

                    this.CreateTextDamageShield(scene, pointer, atkDamage);
                }

                if (this.hitEnemies.includes(ghostEnemy.id) == false) {
                    this.hitEnemies.push(ghostEnemy.id);
                }

                this.SocketAttackEnemy(ghostEnemy.id);

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
        // console.log(
        //     "CheckHitDroneEnemy player role:",
        //     this.player.unlockedPlayer.role
        // );

        if (droneEnemy instanceof EnemyDrones) {
            if (droneEnemy.currentHp > 0) {
                // Đặt kẻ địch này làm kẻ địch hiện tại đang hiển thị thanh máu
                this.currentDisplayedEnemy = droneEnemy;

                droneEnemy.takeDamage();

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

                if (this.hitEnemies.includes(droneEnemy.id) == false) {
                    this.hitEnemies.push(droneEnemy.id);
                }

                this.SocketAttackEnemy(droneEnemy.id);

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

    OnEnemyDead(scene, enemy) {
        if (this.killedEnemies.includes(enemy.id) == false) {
            this.killedEnemies.push(enemy.id);
        }

        //console.log("this.killedEnemies: ", this.killedEnemies);
    }

    // Cleanup tất cả socket events
    cleanupSocketEvents() {
        if (socketService.socket) {
            //console.log("Cleaning up socket events...");
            // Xóa tất cả các event đã đăng ký
            this.SOCKET_EVENTS.forEach((event) => {
                socketService.socket.removeAllListeners(event);
                //console.log(`Removed all listeners for event: ${event}`);
            });
        }
        this.socketInited = false;
    }

    InitSocketEvents(scene) {
        if (this.socketInited) {
            return;
        }

        if (!socketService.socket) {
            console.warn("Socket not initialized");
            return;
        }

        //console.log("Initializing socket events...");

        socketService.socket.on("started", (data) => {
            //console.log("started: ", data);
            if (this.stageEnemiesCount == 0) {
                this.battleData = data;
                this.SetupStage(scene);
            }
            return data;
        });

        socketService.socket.on("update", (data) => {
            //console.log("update: ", data);
            if (this.startGameId === data.gameId) {
                this.battleData = data;
                this.SocketSetUpdateValues(scene);
            }
            return data;
        });

        socketService.socket.on("game_complete", (data) => {
            //console.log("game_complete: ", data);

            if (this.startGameId === data.gameData.gameId) {
                this.battleData = data.gameData;
                this.SocketSetUpdateValues(scene);
            }

            this.CreateGameOverUI(scene, true, data);
        });

        socketService.socket.on("error", (data) => {
            //console.log("error: ", data);
            if (data.message === "Game time is over") {
                this.CreateGameOverUI(scene, false);
            }
            return data;
        });

        this.socketInited = true;
        //console.log("Socket events initialized");
    }

    SocketSetUpdateValues(scene) {
        if (this.stageEnemiesCount > 0) {
            for (let i = 0; i < this.battleData.drones.length; i++) {
                let socketEnemy = this.battleData.drones[i];

                if (this.stageEnemies[socketEnemy.id] != null) {
                    let enemy = this.stageEnemies[socketEnemy.id].enemy;

                    if (
                        enemy instanceof EnemyDrones &&
                        this.killedEnemies.includes(socketEnemy.id) == false
                        // &&
                        // this.hitEnemies.includes(socketEnemy.id)
                    ) {
                        // Kiểm tra xem có phải là enemy hiện tại không
                        const isCurrentEnemy =
                            this.currentDisplayedEnemy &&
                            this.currentDisplayedEnemy.id === socketEnemy.id;
                        // Chỉ cập nhật thanh máu nếu là kẻ địch đang hiển thị và sử dụng tween
                        // Nếu không phải là enemy hiện tại, cập nhật ngay lập tức không dùng tween
                        enemy.setHealth(
                            scene,
                            null,
                            socketEnemy.currentHp,
                            isCurrentEnemy,
                            isCurrentEnemy
                        );
                        enemy.setShield(
                            scene,
                            null,
                            socketEnemy.currentShield,
                            isCurrentEnemy,
                            isCurrentEnemy
                        );
                    }
                }
            }

            for (let i = 0; i < this.battleData.robots.length; i++) {
                let socketEnemy = this.battleData.robots[i];

                if (this.stageEnemies[socketEnemy.id] != null) {
                    let enemy = this.stageEnemies[socketEnemy.id].enemy;

                    if (
                        enemy instanceof Enemy &&
                        this.killedEnemies.includes(socketEnemy.id) == false
                        // &&
                        // this.hitEnemies.includes(socketEnemy.id)
                    ) {
                        // Kiểm tra xem có phải là enemy hiện tại không
                        const isCurrentEnemy =
                            this.currentDisplayedEnemy &&
                            this.currentDisplayedEnemy.id === socketEnemy.id;
                        // Chỉ cập nhật thanh máu nếu là kẻ địch đang hiển thị và sử dụng tween
                        // Nếu không phải là enemy hiện tại, cập nhật ngay lập tức không dùng tween
                        enemy.setHealth(
                            scene,
                            null,
                            socketEnemy.currentHp,
                            isCurrentEnemy,
                            isCurrentEnemy
                        );
                        enemy.setShield(
                            scene,
                            null,
                            socketEnemy.currentShield,
                            isCurrentEnemy,
                            isCurrentEnemy
                        );
                    }

                    if (
                        enemy instanceof EnemyGhost &&
                        this.killedEnemies.includes(socketEnemy.id) == false
                        // &&
                        // this.hitEnemies.includes(socketEnemy.id)
                    ) {
                        // Kiểm tra xem có phải là enemy hiện tại không
                        const isCurrentEnemy =
                            this.currentDisplayedEnemy &&
                            this.currentDisplayedEnemy.id === socketEnemy.id;
                        // Chỉ cập nhật thanh máu nếu là kẻ địch đang hiển thị và sử dụng tween
                        // Nếu không phải là enemy hiện tại, cập nhật ngay lập tức không dùng tween
                        enemy.setHealth(
                            scene,
                            null,
                            socketEnemy.currentHp,
                            isCurrentEnemy,
                            isCurrentEnemy
                        );
                        enemy.setShield(
                            scene,
                            null,
                            socketEnemy.currentShield,
                            isCurrentEnemy,
                            isCurrentEnemy
                        );
                    }
                }
            }

            this.hitEnemies = [];
        }
    }

    SocketStartBattle() {
        if (centerData.replayStage <= 0) {
            socketService.emit("start", {
                userId: centerData.userInfo._id,
            });
        } else {
            socketService.emit("start", {
                userId: centerData.userInfo._id,
                replayStage: this.CurrentStage,
            });
        }
    }

    SocketEnemyAttack(id) {
        let e = this.stageEnemies[id];

        if (e.currentHp && e.currentHp > 0) {
            socketService.emit("enemy_attack", {
                userId: centerData.userInfo._id,
                enemyId: id,
                characterId: this.player._id,
            });
        }
    }

    SocketAttackEnemy(id) {
        let eData = this.stageEnemies[id];

        // console.log("SocketAttackEnemy e:", eData);
        // console.log("SocketAttackEnemy id:", eData.id);
        // console.log("SocketAttackEnemy currentHp:", eData.enemy.currentHp);

        if (eData.enemy.currentHp && eData.enemy.currentHp > 0) {
            socketService.emit("attack", {
                userId: centerData.userInfo._id,
                enemyId: id,
                characterId: this.player._id,
            });
        }
    }

    SocketDroneExplode(id) {
        let eData = this.stageEnemies[id];

        // console.log("SocketDroneExplode e:", eData);
        // console.log("SocketDroneExplode id:", eData.id);
        // console.log("SocketDroneExplode currentHp:", eData.enemy.currentHp);

        if (eData.enemy.currentHp && eData.enemy.currentHp > 0) {
            socketService.emit("drone_explode", {
                userId: centerData.userInfo._id,
                droneId: id,
            });
        }
    }

    SocketUseItem(itemCode) {
        //console.log("SocketUseItem itemCode:", itemCode);

        socketService.emit("use_item", {
            userId: centerData.userInfo._id,
            itemCode: itemCode,
        });
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

    /**
     * Spawn shield item from Arena drop
     * Called from ArenaUI when backend emits shield drop event
     * @param {Object} data - Shield drop data with position and metadata
     */
    spawnShieldItem(data) {
        console.log('[Gameplay] Spawning shield item:', data);

        // Create shield sprite at specified position
        const shieldItem = this.add.image(data.x, data.y, 'item_doge_shield');
        shieldItem.setOrigin(0.5, 0.5);
        shieldItem.setScale(1.0);
        shieldItem.setInteractive();

        // Store item data
        shieldItem.setData('itemData', data);
        shieldItem.setData('itemId', 'DOGE_SHIELD');

        // Add to map container (follows existing pattern)
        this.map.AddToContainerObstacles(shieldItem);

        // Add glow effect
        shieldItem.setTint(0x88DDFF);

        // Pulsing animation
        this.tweens.add({
            targets: shieldItem,
            scale: 1.2,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Click/tap to collect
        shieldItem.on('pointerdown', () => {
            console.log('[Gameplay] Shield clicked, collecting...');
            this.collectShieldItem(shieldItem);
        });

        // Auto destroy after 30 seconds
        this.time.delayedCall(30000, () => {
            if (shieldItem.active) {
                console.log('[Gameplay] Shield expired, destroying');
                this.tweens.killTweensOf(shieldItem);
                shieldItem.destroy();
            }
        });

        console.log('[Gameplay] Shield item spawned successfully');
    }

    /**
     * Collect shield item and add to inventory
     * Called when player clicks/touches shield sprite
     * @param {Phaser.GameObjects.Image} shieldItem - The shield sprite to collect
     */
    collectShieldItem(shieldItem) {
        if (!shieldItem || !shieldItem.active) {
            console.warn('[Gameplay] Shield item invalid or already collected');
            return;
        }

        console.log('[Gameplay] Collecting shield item');

        // Get or create inventory entry for DOGE_SHIELD
        let inventoryItem = centerData.inventoryDictionary['DOGE_SHIELD'];
        if (!inventoryItem) {
            console.log('[Gameplay] Creating new DOGE_SHIELD inventory entry');
            inventoryItem = {
                itemId: 'DOGE_SHIELD',
                quantity: 0
            };
            centerData.inventoryDictionary['DOGE_SHIELD'] = inventoryItem;
        }

        // Increase quantity
        inventoryItem.quantity += 1;
        console.log('[Gameplay] Shield quantity now:', inventoryItem.quantity);

        // Update UI button quantity (if exists)
        if (this.container_selector) {
            const shieldButton = this.container_selector.getByName('shield_button');
            if (shieldButton && shieldButton.text_quantity) {
                shieldButton.text_quantity.setText(inventoryItem.quantity);
                console.log('[Gameplay] Updated shield button quantity');
            }
        }

        // Play pickup sound (reuse existing audio pool)
        const audioPool = this.GetPoolAudioVFX();
        if (audioPool && typeof audioPool.PlayAudioPickup === 'function') {
            audioPool.PlayAudioPickup();
        }

        // Collection animation
        this.tweens.add({
            targets: shieldItem,
            alpha: 0,
            scale: 0.5,
            y: shieldItem.y - 50,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                shieldItem.destroy();
                console.log('[Gameplay] Shield item collected and destroyed');
            }
        });

        // Show collection feedback (optional)
        const collectText = this.add.text(
            shieldItem.x,
            shieldItem.y - 30,
            '+1 Shield',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#88DDFF',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        collectText.setOrigin(0.5);
        this.map.AddToContainerObstacles(collectText);

        this.tweens.add({
            targets: collectText,
            alpha: 0,
            y: collectText.y - 80,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                collectText.destroy();
            }
        });
    }
}

export default Gameplay;

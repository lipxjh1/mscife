import {
    LoadItem,
    LoadReward,
    LoadCharacterInventory,
    LoadMuskPack,
    LoadEarn,
    LoadNeuralink,
    LoadGacha,
    LoadShopInventory,
    LoadGameplay,
    LoadUserInfo,
    LoadFriends,
    LoadGuild,
    LoadGuildAvatars,
    LoadHomeBattle,
    LoadHomeBattleMultiplayer,
    LoadFirstMissions,
    LoadDaily,
    LoadLanguage,
    LoadNotification,
    LoadAvatars,
    LoadCenterMarket,
    LoadMapById,
    LoadEnemyByRange,
    LoadGameplayUI,
    LoadBossAssets,
} from "./Preloader.js";

export const ASSET_KEYS = {
    Item: {
        KEY: "items",
    },
    Gameplay: {
        KEY: "gameplay",
    },
    Reward: {
        KEY: "reward",
    },
    CharacterInventory: {
        KEY: "character_inventory",
    },
    MuskPack: {
        KEY: "musk_pack",
    },
    Earn: {
        KEY: "earn",
    },
    Neuralink: {
        KEY: "neuralink",
    },
    Gacha: {
        KEY: "gacha",
    },
    ShopInventory: {
        KEY: "shop_inventory",
    },
    UserInfo: {
        KEY: "user_info",
    },
    Friends: {
        KEY: "friends",
    },
    Guild: {
        KEY: "guild",
    },
    GuildAvatars: {
        KEY: "guildAvatars",
    },
    HomeBattle: {
        KEY: "home_battle",
    },
    HomeBattleMultiplayer: {
        KEY: "home_battle_multiplayer",
    },
    FirstMissions: {
        KEY: "first_missions",
    },
    Daily: {
        KEY: "daily",
    },
    Language: {
        KEY: "language",
    },
    Notification: {
        KEY: "notification",
    },
    Avatars: {
        KEY: "avatars",
    },
    CenterMarket: {
        KEY: "center_market",
    },
};

export class AssetLoadingManager {
    constructor() {
        if (AssetLoadingManager.instance) {
            return AssetLoadingManager.instance;
        }
        AssetLoadingManager.instance = this;

        this.loadedAssets = new Set();
        this.currentScene = null;
        this.loadingPromises = new Map(); // Track loading promises for each asset
        this.assetDependencies = new Map(); // Track dependencies between assets

        // Quản lý trạng thái loaded cho từng map
        this.loadedMaps = new Set();
        this.loadingMapPromises = new Map();

        // Initialize loading states and callbacks
        this.loadingStates = {
            gameplay: false,
            reward: false,
            characterInventory: false,
            muskPack: false,
            earn: false,
            neuralink: false,
            gacha: false,
            rank: false,
            shopInventory: false,
            item: false,
            userInfo: false,
            friends: false,
            guild: false,
            guildAvatars: false,
            homeBattle: false,
            homeBattleMultiplayer: false,
            firstMissions: false,
            daily: false,
            language: false,
            notification: false,
            avatars: false,
            centerMarket: false,
        };

        this.callbacks = {
            gameplay: null,
            reward: null,
            characterInventory: null,
            muskPack: null,
            earn: null,
            neuralink: null,
            gacha: null,
            rank: null,
            shopInventory: null,
            item: null,
            userInfo: null,
            friends: null,
            guild: null,
            guildAvatars: null,
            homeBattle: null,
            homeBattleMultiplayer: null,
            firstMissions: null,
            daily: null,
            language: null,
            notification: null,
            avatars: null,
            centerMarket: null,
        };

        // Initialize loadingPromises for all asset types
        Object.values(ASSET_KEYS).forEach(({ KEY }) => {
            this.loadingPromises.set(KEY, null);
        });

        // Define dependencies
        this.initializeDependencies();
    }

    initializeDependencies() {
        // Define which assets depend on other assets
        this.assetDependencies.set(ASSET_KEYS.CharacterInventory.KEY, [
            ASSET_KEYS.Item.KEY,
            ASSET_KEYS.MuskPack.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.Gameplay.KEY, [
            ASSET_KEYS.Item.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.Reward.KEY, [
            ASSET_KEYS.Item.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.MuskPack.KEY, [
            ASSET_KEYS.Item.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.Gacha.KEY, [ASSET_KEYS.Item.KEY]);

        this.assetDependencies.set(ASSET_KEYS.ShopInventory.KEY, [
            ASSET_KEYS.Item.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.HomeBattle.KEY, [
            ASSET_KEYS.Item.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.FirstMissions.KEY, [
            ASSET_KEYS.Item.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.Daily.KEY, [ASSET_KEYS.Item.KEY]);

        this.assetDependencies.set(ASSET_KEYS.Notification.KEY, [
            ASSET_KEYS.Item.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.CenterMarket.KEY, [
            ASSET_KEYS.Item.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.Neuralink.KEY, [
            ASSET_KEYS.Item.KEY,
        ]);

        this.assetDependencies.set(ASSET_KEYS.Guild.KEY, [
            ASSET_KEYS.GuildAvatars.KEY,
        ]);
    }

    static getInstance() {
        if (!AssetLoadingManager.instance) {
            AssetLoadingManager.instance = new AssetLoadingManager();
        }
        return AssetLoadingManager.instance;
    }

    init(scene) {
        this.currentScene = scene;
    }

    async loadAsset(assetKey, loaderFunction) {
        // Check if already loaded
        if (this.loadedAssets.has(assetKey)) {
            return Promise.resolve();
        }

        // Check if already loading
        if (this.loadingPromises.get(assetKey)) {
            return this.loadingPromises.get(assetKey);
        }

        // Create new loading promise
        const loadingPromise = new Promise((resolve) => {
            const scene = this.currentScene;
            loaderFunction(scene);
            scene.load.once("complete", () => {
                this.loadedAssets.add(assetKey);
                resolve();
            });
            scene.load.start();
        });

        this.loadingPromises.set(assetKey, loadingPromise);
        return loadingPromise;
    }

    async loadDependencies(assetKey) {
        const dependencies = this.assetDependencies.get(assetKey) || [];
        const loadingPromises = dependencies.map(async (depKey) => {
            await this.loadAssetWithLoader(depKey);
        });
        await Promise.all(loadingPromises);
    }

    async loadAssetWithLoader(assetKey) {
        switch (assetKey) {
            case ASSET_KEYS.Item.KEY:
                return this.loadAsset(assetKey, LoadItem);
            case ASSET_KEYS.Gameplay.KEY:
                return this.loadAsset(assetKey, LoadGameplay);
            case ASSET_KEYS.Reward.KEY:
                return this.loadAsset(assetKey, LoadReward);
            case ASSET_KEYS.CharacterInventory.KEY:
                return this.loadAsset(assetKey, LoadCharacterInventory);
            case ASSET_KEYS.MuskPack.KEY:
                return this.loadAsset(assetKey, LoadMuskPack);
            case ASSET_KEYS.Earn.KEY:
                return this.loadAsset(assetKey, LoadEarn);
            case ASSET_KEYS.Neuralink.KEY:
                return this.loadAsset(assetKey, LoadNeuralink);
            case ASSET_KEYS.Gacha.KEY:
                return this.loadAsset(assetKey, LoadGacha);
            case ASSET_KEYS.ShopInventory.KEY:
                return this.loadAsset(assetKey, LoadShopInventory);
            case ASSET_KEYS.UserInfo.KEY:
                return this.loadAsset(assetKey, LoadUserInfo);
            case ASSET_KEYS.Friends.KEY:
                return this.loadAsset(assetKey, LoadFriends);
            case ASSET_KEYS.Guild.KEY:
                return this.loadAsset(assetKey, LoadGuild);
            case ASSET_KEYS.GuildAvatars.KEY:
                return this.loadAsset(assetKey, LoadGuildAvatars);
            case ASSET_KEYS.HomeBattle.KEY:
                return this.loadAsset(assetKey, LoadHomeBattle);
            case ASSET_KEYS.HomeBattleMultiplayer.KEY:
                return this.loadAsset(assetKey, LoadHomeBattleMultiplayer);
            case ASSET_KEYS.FirstMissions.KEY:
                return this.loadAsset(assetKey, LoadFirstMissions);
            case ASSET_KEYS.Daily.KEY:
                return this.loadAsset(assetKey, LoadDaily);
            case ASSET_KEYS.Language.KEY:
                return this.loadAsset(assetKey, LoadLanguage);
            case ASSET_KEYS.Notification.KEY:
                return this.loadAsset(assetKey, LoadNotification);
            case ASSET_KEYS.Avatars.KEY:
                return this.loadAsset(assetKey, LoadAvatars);
            case ASSET_KEYS.CenterMarket.KEY:
                return this.loadAsset(assetKey, LoadCenterMarket);
            default:
                //console.warn(`No loader found for asset key: ${assetKey}`);
                return Promise.resolve();
        }
    }

    async lazyLoad(assetKey, callback, type) {
        if (!this.currentScene) {
            //console.error("Scene not initialized. Call init(scene) first.");
            return;
        }

        try {
            this.loadingStates[type] = true;
            this.callbacks[type] = callback;

            // First load dependencies
            await this.loadDependencies(assetKey);

            // Then load the main asset
            await this.loadAssetWithLoader(assetKey);

            // Execute callback if provided
            if (this.callbacks[type]) {
                this.callbacks[type]();
            }
        } catch (error) {
            //console.error(`Error loading asset ${assetKey}:`, error);
        } finally {
            this.loadingStates[type] = false;
            this.loadingPromises.set(assetKey, null);
        }
    }

    lazyGameplay(callback) {
        this.lazyLoad(ASSET_KEYS.Gameplay.KEY, callback, "gameplay");
    }

    lazyLoadReward(callback) {
        this.lazyLoad(ASSET_KEYS.Reward.KEY, callback, "reward");
    }

    lazyCharacterInventory(callback) {
        this.lazyLoad(
            ASSET_KEYS.CharacterInventory.KEY,
            callback,
            "characterInventory"
        );
    }

    lazyMuskPack(callback) {
        this.lazyLoad(ASSET_KEYS.MuskPack.KEY, callback, "muskPack");
    }

    lazyEarn(callback) {
        this.lazyLoad(ASSET_KEYS.Earn.KEY, callback, "earn");
    }

    lazyNeuralink(callback) {
        this.lazyLoad(ASSET_KEYS.Neuralink.KEY, callback, "neuralink");
    }

    lazyLoadGacha(callback) {
        this.lazyLoad(ASSET_KEYS.Gacha.KEY, callback, "gacha");
    }

    lazyLoadShopInventory(callback) {
        this.lazyLoad(ASSET_KEYS.ShopInventory.KEY, callback, "shopInventory");
    }

    lazyLoadUserInfo(callback) {
        this.lazyLoad(ASSET_KEYS.UserInfo.KEY, callback, "userInfo");
    }

    lazyLoadFriends(callback) {
        this.lazyLoad(ASSET_KEYS.Friends.KEY, callback, "friends");
    }

    lazyLoadGuild(callback) {
        this.lazyLoad(ASSET_KEYS.Guild.KEY, callback, "guild");
    }

    lazyLoadGuildAvatars(callback) {
        this.lazyLoad(ASSET_KEYS.GuildAvatars.KEY, callback, "guildAvatars");
    }

    lazyLoadHomeBattle(callback) {
        this.lazyLoad(ASSET_KEYS.HomeBattle.KEY, callback, "homeBattle");
    }

    lazyLoadHomeBattleMultiplayer(callback) {
        this.lazyLoad(
            ASSET_KEYS.HomeBattleMultiplayer.KEY,
            callback,
            "homeBattleMultiplayer"
        );
    }

    lazyLoadFirstMissions(callback) {
        this.lazyLoad(ASSET_KEYS.FirstMissions.KEY, callback, "firstMissions");
    }

    lazyLoadDaily(callback) {
        this.lazyLoad(ASSET_KEYS.Daily.KEY, callback, "daily");
    }

    lazyLoadLanguage(callback) {
        this.lazyLoad(ASSET_KEYS.Language.KEY, callback, "language");
    }

    lazyLoadNotification(callback) {
        this.lazyLoad(ASSET_KEYS.Notification.KEY, callback, "notification");
    }

    lazyLoadItems(callback) {
        this.lazyLoad(ASSET_KEYS.Item.KEY, callback, "item");
    }

    lazyLoadAvatars(callback) {
        this.lazyLoad(ASSET_KEYS.Avatars.KEY, callback, "avatars");
    }

    lazyLoadCenterMarket(callback) {
        this.lazyLoad(ASSET_KEYS.CenterMarket.KEY, callback, "centerMarket");
    }

    getMapIdFromStage(currentStage) {
        if (currentStage >= 1 && currentStage <= 20) return 0;
        if (currentStage >= 21 && currentStage <= 40) return 1;
        if (currentStage >= 41 && currentStage <= 60) return 2;
        return 0; // mặc định
    }

    getMapIdFromMultiplayerBossId(bosId) {
        switch (bosId) {
            case "BOSS_001": {
                return 0;
            }
            case "BOSS_002": {
                return 1;
            }
            case "BOSS_003": {
                return 2;
            }

            default:
                return 0;
        }
    }

    // Hàm load map độc lập, quản lý trạng thái loaded
    loadMap(mapId, callback) {
        const mapKey = `map_${mapId}`;
        if (this.loadedMaps.has(mapKey)) {
            //console.log(`[AssetLoadingManager] Map ${mapKey} đã được load sẵn.`);
            if (callback) callback();
            return;
        }
        // Nếu đang loading map này, thêm callback vào promise
        if (this.loadingMapPromises.has(mapKey)) {
            //console.log(`[AssetLoadingManager] Map ${mapKey} đang được load, chờ callback.`);
            this.loadingMapPromises.get(mapKey).then(callback);
            return;
        }
        // Tạo promise load map
        //console.log(`[AssetLoadingManager] Bắt đầu load map ${mapKey}`);
        const loadingPromise = new Promise((resolve) => {
            LoadMapById(this.currentScene, mapId);
            this.currentScene.load.once("complete", () => {
                this.loadedMaps.add(mapKey);
                //console.log(`[AssetLoadingManager] Map ${mapKey} đã load xong!`);
                resolve();
                if (callback) {
                    //console.log(`[AssetLoadingManager] Gọi callback sau khi load map ${mapKey}`);
                    callback();
                }
            });
            this.currentScene.load.start();
        });
        this.loadingMapPromises.set(mapKey, loadingPromise);
        loadingPromise.finally(() => {
            this.loadingMapPromises.delete(mapKey);
        });
    }

    // Quản lý việc tải enemy theo stage
    loadedEnemies = new Set();
    loadingEnemyPromises = new Map();

    getEnemyRangeFromStage(currentStage) {
        if (currentStage >= 1 && currentStage <= 20) return "earth"; // stage 1-20: enemy 0-1
        if (currentStage >= 21 && currentStage <= 40) return "space"; // stage 21-40: enemy 1-2
        if (currentStage >= 41 && currentStage <= 60) return "mars"; // stage 41-60: enemy ghosts, etc
        return "earth"; // mặc định
    }

    loadEnemyByRange(enemyRange, callback) {
        const enemyKey = `enemy_${enemyRange}`;

        if (this.loadedEnemies.has(enemyKey)) {
            //console.log(`[AssetLoadingManager] Enemy ${enemyKey} đã được load sẵn.`);
            if (callback) callback();
            return;
        }

        if (this.loadingEnemyPromises.has(enemyKey)) {
            //console.log(`[AssetLoadingManager] Enemy ${enemyKey} đang được load, chờ callback.`);
            this.loadingEnemyPromises.get(enemyKey).then(callback);
            return;
        }

        //console.log(`[AssetLoadingManager] Bắt đầu load enemy ${enemyKey}`);
        const loadingPromise = new Promise((resolve) => {
            LoadEnemyByRange(this.currentScene, enemyRange);
            this.currentScene.load.once("complete", () => {
                this.loadedEnemies.add(enemyKey);
                //console.log(`[AssetLoadingManager] Enemy ${enemyKey} đã load xong!`);
                resolve();
                if (callback) {
                    //console.log(`[AssetLoadingManager] Gọi callback sau khi load enemy ${enemyKey}`);
                    callback();
                }
            });
            this.currentScene.load.start();
        });

        this.loadingEnemyPromises.set(enemyKey, loadingPromise);
        loadingPromise.finally(() => {
            this.loadingEnemyPromises.delete(enemyKey);
        });
    }

    // Hàm tải các tài nguyên UI gameplay
    loadedGameplayUI = false;
    loadingGameplayUIPromise = null;

    loadGameplayUI(callback) {
        if (this.loadedGameplayUI) {
            //console.log(`[AssetLoadingManager] Gameplay UI đã được load sẵn.`);
            if (callback) callback();
            return;
        }

        if (this.loadingGameplayUIPromise) {
            //console.log(`[AssetLoadingManager] Gameplay UI đang được load, chờ callback.`);
            this.loadingGameplayUIPromise.then(callback);
            return;
        }

        //console.log(`[AssetLoadingManager] Bắt đầu load Gameplay UI`);
        const loadingPromise = new Promise((resolve) => {
            LoadGameplayUI(this.currentScene);
            this.currentScene.load.once("complete", () => {
                this.loadedGameplayUI = true;
                //console.log(`[AssetLoadingManager] Gameplay UI đã load xong!`);
                resolve();
                if (callback) {
                    //console.log(`[AssetLoadingManager] Gọi callback sau khi load Gameplay UI`);
                    callback();
                }
            });
            this.currentScene.load.start();
        });

        this.loadingGameplayUIPromise = loadingPromise;
        loadingPromise.finally(() => {
            this.loadingGameplayUIPromise = null;
        });
    }

    // Hàm tải các tài nguyên Boss game
    loadedBossAssets = false;
    loadingBossPromise = null;

    loadBossAssets(callback) {
        if (this.loadedBossAssets) {
            //console.log(`[AssetLoadingManager] Boss assets đã được load sẵn.`);
            if (callback) callback();
            return;
        }

        if (this.loadingBossPromise) {
            //console.log(`[AssetLoadingManager] Boss assets đang được load, chờ callback.`);
            this.loadingBossPromise.then(callback);
            return;
        }

        //console.log(`[AssetLoadingManager] Bắt đầu load Boss assets`);
        const loadingPromise = new Promise((resolve) => {
            LoadBossAssets(this.currentScene);
            this.currentScene.load.once("complete", () => {
                this.loadedBossAssets = true;
                //console.log(`[AssetLoadingManager] Boss assets đã load xong!`);
                resolve();
                if (callback) {
                    //console.log(`[AssetLoadingManager] Gọi callback sau khi load Boss assets`);
                    callback();
                }
            });
            this.currentScene.load.start();
        });

        this.loadingBossPromise = loadingPromise;
        loadingPromise.finally(() => {
            this.loadingBossPromise = null;
        });
    }
}

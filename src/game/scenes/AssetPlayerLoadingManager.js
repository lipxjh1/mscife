import {
    LoadPlayerUICardInventory,
    LoadPlayerSpineUI,
    LoadPlayerSpineGameplay,
} from "./Preloader.js";

export class AssetPlayerLoadingManager {
    constructor() {
        if (AssetPlayerLoadingManager.instance) {
            return AssetPlayerLoadingManager.instance;
        }
        AssetPlayerLoadingManager.instance = this;

        this.loadedAssets = new Set();
        this.currentScene = null;

        // Quản lý trạng thái loading riêng cho từng loại
        this.loadingStates = {
            uiCard: false,
            spineUI: false,
            spineGameplay: false,
        };

        // Thêm queues để quản lý các request đang chờ
        this.loadingQueues = {
            uiCard: [],
            spineUI: [],
            spineGameplay: [],
        };
    }

    static getInstance() {
        if (!AssetPlayerLoadingManager.instance) {
            AssetPlayerLoadingManager.instance =
                new AssetPlayerLoadingManager();
        }
        return AssetPlayerLoadingManager.instance;
    }

    init(scene) {
        this.currentScene = scene;
    }

    areAssetsLoaded(assetKeys) {
        return assetKeys.every((key) => this.loadedAssets.has(key));
    }

    lazyLoadCharacterUICard(arrIds, callback) {
        if (!this.currentScene) {
            //console.error("Scene not initialized. Call init(scene) first.");
            return;
        }

        const assetKeys = arrIds.map((charId) => `${charId}_ui_card`);

        // Nếu assets đã được load, gọi callback ngay lập tức
        if (this.areAssetsLoaded(assetKeys)) {
            if (callback) callback();
            return;
        }

        // Nếu đang loading, thêm request vào queue
        if (this.loadingStates.uiCard) {
            this.loadingQueues.uiCard.push({ arrIds, callback });
            return;
        }

        this.loadingStates.uiCard = true;

        const unloadedAssets = assetKeys.filter(
            (key) => !this.loadedAssets.has(key)
        );

        this.loadCharacterUICardAssets(arrIds, () => {
            unloadedAssets.forEach((key) => this.loadedAssets.add(key));
            if (callback) callback();
            this.processNextUICardRequest();
        });
    }

    // Xử lý request tiếp theo trong queue
    processNextUICardRequest() {
        this.loadingStates.uiCard = false;

        if (this.loadingQueues.uiCard.length > 0) {
            const nextRequest = this.loadingQueues.uiCard.shift();
            this.lazyLoadCharacterUICard(
                nextRequest.arrIds,
                nextRequest.callback
            );
        }
    }

    lazyLoadCharacterSpineUI(arrIds, callback) {
        if (!this.currentScene) {
            //console.error("Scene not initialized. Call init(scene) first.");
            return;
        }

        const assetKeys = arrIds.map((charId) => `${charId}_spine_ui`);

        if (this.areAssetsLoaded(assetKeys)) {
            if (callback) callback();
            return;
        }

        if (this.loadingStates.spineUI) {
            this.loadingQueues.spineUI.push({ arrIds, callback });
            return;
        }

        this.loadingStates.spineUI = true;

        const unloadedAssets = assetKeys.filter(
            (key) => !this.loadedAssets.has(key)
        );

        this.loadCharacterSpineUIAssets(arrIds, () => {
            unloadedAssets.forEach((key) => this.loadedAssets.add(key));
            if (callback) callback();
            this.processNextSpineUIRequest();
        });
    }

    processNextSpineUIRequest() {
        this.loadingStates.spineUI = false;

        if (this.loadingQueues.spineUI.length > 0) {
            const nextRequest = this.loadingQueues.spineUI.shift();
            this.lazyLoadCharacterSpineUI(
                nextRequest.arrIds,
                nextRequest.callback
            );
        }
    }

    lazyLoadCharacterSpineGameplay(arrIds, callback) {
        if (!this.currentScene) {
            //console.error("Scene not initialized. Call init(scene) first.");
            return;
        }

        const assetKeys = arrIds.map((charId) => `${charId}_spine_gameplay`);

        if (this.areAssetsLoaded(assetKeys)) {
            if (callback) callback();
            return;
        }

        if (this.loadingStates.spineGameplay) {
            this.loadingQueues.spineGameplay.push({ arrIds, callback });
            return;
        }

        this.loadingStates.spineGameplay = true;

        const unloadedAssets = assetKeys.filter(
            (key) => !this.loadedAssets.has(key)
        );

        this.loadCharacterSpineGameplayAssets(arrIds, () => {
            unloadedAssets.forEach((key) => this.loadedAssets.add(key));
            if (callback) callback();
            this.processNextSpineGameplayRequest();
        });
    }

    processNextSpineGameplayRequest() {
        this.loadingStates.spineGameplay = false;

        if (this.loadingQueues.spineGameplay.length > 0) {
            const nextRequest = this.loadingQueues.spineGameplay.shift();
            this.lazyLoadCharacterSpineGameplay(
                nextRequest.arrIds,
                nextRequest.callback
            );
        }
    }

    loadCharacterUICardAssets(arrIds, callback) {
        const scene = this.currentScene;
        LoadPlayerUICardInventory(scene, arrIds);
        scene.load.once("complete", callback);
        scene.load.start();
    }

    loadCharacterSpineUIAssets(arrIds, callback) {
        const scene = this.currentScene;
        LoadPlayerSpineUI(scene, arrIds);
        scene.load.once("complete", callback);
        scene.load.start();
    }

    loadCharacterSpineGameplayAssets(arrIds, callback) {
        const scene = this.currentScene;
        LoadPlayerSpineGameplay(scene, arrIds);
        scene.load.once("complete", callback);
        scene.load.start();
    }
}

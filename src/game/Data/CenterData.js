import { retrieveLaunchParams } from "@telegram-apps/sdk";

import { GetNftCharacters } from "../wallet/Wallet.js";
import { EMPTY } from "rxjs";
import { API_BASE_URL, setTokens, apiClient } from "./APIBase.js";
import { API_ENDPOINTS } from "./services/ApiEndpoints.js";
import { ModalState, WalletTypes } from "./config/index.js";
import { AuthService } from "./auth/index.js";
import { UserService } from "./user/index.js";
import { InventoryService } from "./inventory/index.js";
import { WalletService } from "./wallet/index.js";

export class CenterData {
    constructor() {
        // Initialize services
        this.authService = new AuthService();
        this.userService = new UserService();
        this.inventoryService = new InventoryService();
        this.walletService = new WalletService();

        this.CurrentScene = null;

        this.SetAccessToken("");

        this.isTouch = false;

        this.isGoogleLogin = false;

        // Delegate userInfo to UserService
        this.userInfo = this.userService.userInfo;

        this.baseCharacterInfo = {};

        this.baseItemInfo = {};

        this.vipStatus = {
            success: true,
            data: {
                isActive: true,
                startDate: "2025-03-08T23:31:10.309Z",
                endDate: "2026-06-08T23:31:10.309Z",
                remainingDays: 456,
                purchaseHistory: [
                    {
                        purchaseDate: "2025-03-08T23:31:10.309Z",
                        duration: 5,
                        cost: 500,
                        isYearlyPackage: false,
                        _id: "67ccd33e3e2207e02ca7b02f",
                    },
                    {
                        purchaseDate: "2025-03-08T23:33:23.285Z",
                        duration: 5,
                        cost: 500,
                        isYearlyPackage: false,
                        _id: "67ccd3c3365c624e076af098",
                    },
                    {
                        purchaseDate: "2025-03-08T23:33:24.734Z",
                        duration: 5,
                        cost: 500,
                        isYearlyPackage: false,
                        _id: "67ccd3c4365c624e076af0aa",
                    },
                ],
                benefits: {
                    doubleChipRewards: true,
                    autoCheckin: true,
                    upgradeBonus: "+5%",
                },
            },
        };

        this.chipDailyReward = {
            success: true,
            data: {
                chipRewards: [
                    {
                        id: "67cec9610a3b85dd36a3c02a",
                        sourceType: "PREMIUM_BOX",
                        dailyAmount: 10000,
                        startDate: "2025-03-10T11:13:37.329Z",
                        endDate: "2025-04-09T11:13:37.329Z",
                        active: true,
                        lastClaimed: "2025-03-11T00:00:00.000Z",
                        claimedDays: 1,
                        totalDays: 30,
                        remainingDays: 29,
                        createdAt: "2025-03-10T11:13:37.330Z",
                        willReceiveToday: false,
                    },
                ],
                todaySummary: {
                    activeRewardsCount: 0,
                    expectedChipReward: 0,
                    nextRewardTime: null,
                },
                totalStats: {
                    totalRewards: 1,
                    activeRewards: 1,
                    completedRewards: 0,
                    totalClaimedChips: 10000,
                    totalRemainingChips: 290000,
                },
            },
        };

        // Delegate wallet data to WalletService
        this.walletAddress = this.walletService.walletAddress;
        this.receiver = this.walletService.receiver;

        // Import constants from config module
        this.ModalState = ModalState;
        this.modalState = this.ModalState.Close.KEY;

        this.WalletType = WalletTypes;
        this.walletType = this.WalletType.EMPTY.KEY;

        this.replayStage = 0;

        this.multiplayerBossId = "";

        this.battle = {
            id: "67d52264f586d744fec4dba6",
            bossType: "Sample boss",
            name: "World Destroyer #664",
            health: 3000000,
            maxHealth: 3000000,
            startTime: "2025-03-15T06:47:00.751Z",
            endTime: "2025-03-15T07:17:00.751Z",
            remainingTime: 594856,
            participantCount: 0,
            abilities: ["area_attack", "stun", "rage"],
            status: "active",
        };

        this.StageInfo = {
            Id: 1,
            RobotQuantity: 2,
            RobotHP: 100,
            RobotShield: 0,
            RobitHitCount: 1,
            RobotDelayHit: 2,
            DroneQuantity: 0,
            DroneHP: 0,
            DroneShield: 0,
            DroneHitCount: 0,
            DroneDelayHit: 1,
            DailyPointReward: 0,
            ChipReward: 0,
            TotalTime: 30,
            CharacterRewards: [
                {
                    RateOfCharacter: "c",
                    Rate: 99,
                    _id: "6780e1180804310eb95c9474",
                },
            ],
        };

        this.selectedBossData = null;

        // Thêm một instance EventTarget vào class Data
        this.eventTarget = new EventTarget();

        this.selectedPlayerArr = [];

        this.unlockedPlayerNFTIds = [];

        this.unlockedPlayerNFT = {
            _id_victoria_nft: {
                _id: "_id_victoria_nft",
                code: "victoria",
                name: "Victoria",
                role: "gunner",
                rank: "c",
                getMethod: [
                    {
                        method: "GACHA",
                        rate: 0,
                        _id: "",
                    },
                    {
                        method: "BOSS_4",
                        rate: 0,
                        _id: "",
                    },
                ],
                description: "",
                level: 1,
                star: 1,
                mintedAddress: "nft_id",
                properties: {
                    attackDelay: 0,
                    attachDamage: 0,
                    chipToUpgrade: 0,
                    level: 0,
                },
                nextLevelProperties: {
                    attackDelay: 0,
                    attachDamage: 0,
                    chipToUpgrade: 0,
                    level: 0,
                },
            },
        };

        this.unlockedPlayer = {
            _id_victoria: {
                _id: "_id_victoria",
                code: "victoria",
                name: "Victoria",
                role: "gunner",
                getMethod: [
                    {
                        method: "GACHA",
                        rate: 0,
                        _id: "",
                    },
                    {
                        method: "BOSS_4",
                        rate: 0,
                        _id: "",
                    },
                ],
                description: "",
                level: 1,
                star: 1,
                mintedAddress: "",
                properties: {
                    attackDelay: 0,
                    attachDamage: 0,
                    chipToUpgrade: 0,
                    level: 0,
                },
                nextLevelProperties: {
                    attackDelay: 0,
                    attachDamage: 0,
                    chipToUpgrade: 0,
                    level: 0,
                },
            },
        };

        // ✅ NEW: Load On Demand data structures
        this.basicCharacters = new Map();             // {characterId: basicInfo}
        this.detailedCharacters = new Map();          // {characterId: fullInfo}
        this.loadingCharacters = new Set();           // Set(characterId) - đang tải
        this.failedCharacters = new Set();            // Set(characterId) - tải lỗi

        // ✅ NEW: Loading state flags
        this.loadingBasicInfo = false;                // Boolean - đang tải basic info
        this.loadingDetailedInfo = false;             // Boolean - đang tải detailed info

        // Delegate inventory and shop data to InventoryService
        this.inventoryDictionary = this.inventoryService.inventoryDictionary;
        this.itemShopDictionary = this.inventoryService.itemShopDictionary;

        this.myRank = {
            rank: 408,
            totalUsers: 13822,
            user: {
                username: "trhiep1297",
                avatar: "avatar_free_5",
                power: 30,
                currentStage: 2,
            },
        };

        this.rankArr = [
            {
                _id: "678117b904fdfafa48bce293",
                TelegramId: 631716057,
                InviteBy: null,
                InviteCount: 13,
                Username: "maianhngtr",
                Chip: 6268600,
                AutoRemainingTime: "1970-01-01T00:00:00.000Z",
                CheckedinDay: [],
                Musk: 26102260,
                hasDeposited: false,
                inviteRewardLevel: 0,
                NumberBoxBought: 75,
                F2BoxBought: 0,
                F3BoxBought: 0,
                F4BoxBought: 0,
                F5BoxBought: 0,
                Parent1: null,
                Parent2: null,
                Parent3: null,
                Parent4: null,
                Parent5: null,
                battleCharacters: [
                    "6781204304fdfafa48bde585",
                    "6781206204fdfafa48bde890",
                    "678648d00b35ec6fe9ba06a4",
                ],
                Quests: [],
                UserId: "A00000012",
                createdAt: "2025-01-10T12:51:05.864Z",
                updatedAt: "2025-01-18T04:25:15.277Z",
                __v: 33,
                WalletId: "",
                CurrentStage: 1,
                F1SpentMusk: 0,
                F2SpentMusk: 0,
                F3SpentMusk: 0,
                F4SpentMusk: 0,
                F5SpentMusk: 0,
                SpentMusk: 55200,
                originalMusk: 26098050,
                ConsecutiveCheckinDays: 0,
            },
        ];

        this.friendArr = [
            {
                Username: "maianhngtr",
                UserId: "A00000012",
            },
        ];

        this.centerMarketItems = {};

        this.centerMarketCharacters = {};

        // API endpoints configuration
        this.endpoints = API_ENDPOINTS;
    }

    SetCurrentScene(scene) {
        this.CurrentScene = scene;
    }

    GetCurrentScene() {
        return this.CurrentScene;
    }

    SetIsGoogleLogin(boolVal) {
        this.isGoogleLogin = boolVal;
    }

    GetIsGoogleLogin() {
        return this.isGoogleLogin;
    }

    GetFirstMissionsDone() {
        const val = localStorage.getItem("firstMissionsDone");
        if (val === null) {
            return false;
        }
        return val === "true";
    }

    SetFirstMissionsDone(boolVal) {
        localStorage.setItem("firstMissionsDone", boolVal);
    }

    GetTelegramShareUrl() {
        // Tạo URL Telegram với startapp parameter
        const baseUrl = import.meta.env.VITE_TELEGRAM_BOT_URL || "https://t.me/MSCIgamebot/game";
        const urlParams = new URLSearchParams();
        urlParams.set("startapp", this.userInfo.UserId);

        const gameUrl = `${baseUrl}?${urlParams.toString()}`;
        return `https://t.me/share/url?url=${encodeURIComponent(gameUrl)}`;
    }

    // Thêm hàm để thêm, xóa, và kích hoạt sự kiện
    onEvent(eventName, callback) {
        this.eventTarget.addEventListener(eventName, callback);
    }

    offEvent(eventName, callback) {
        this.eventTarget.removeEventListener(eventName, callback);
    }

    emitEvent(eventName, detail = null) {
        this.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    AddPlayerInfoChange(callback) {
        this.onEvent("playerinfochange", callback);
    }

    RemovePlayerInfoChange(callback) {
        this.offEvent("playerinfochange", callback);
    }

    EmitPlayerInfoChange() {
        //console.log("EmitPlayerInfoChange");

        // Production config
        const ENABLE_DEBOUNCE = true;
        const DEBOUNCE_DELAY = 500;
        const DEBUG_DEBOUNCE = true;

        if (!ENABLE_DEBOUNCE) {
            this.emitEvent("playerinfochange", this.userInfo);
            return;
        }

        // Track metrics
        if (!this._debounceMetricsPlayerInfo) {
            this._debounceMetricsPlayerInfo = { total: 0, batched: 0 };
        }
        this._debounceMetricsPlayerInfo.total++;

        // Clear existing
        if (this._emitTimeoutPlayerInfo) {
            clearTimeout(this._emitTimeoutPlayerInfo);
            this._debounceMetricsPlayerInfo.batched++;
        }

        // Set new timeout
        this._emitTimeoutPlayerInfo = setTimeout(() => {
            // Log metrics in debug
            if (DEBUG_DEBOUNCE && this._debounceMetricsPlayerInfo.batched > 0) {
                console.log(
                    `EmitPlayerInfoChange [DEBOUNCE] Batched ${
                        this._debounceMetricsPlayerInfo.batched + 1
                    } emits`,
                    `(${Math.round(
                        (this._debounceMetricsPlayerInfo.batched /
                            this._debounceMetricsPlayerInfo.total) *
                            100
                    )}% reduction)`
                );
            }

            // Emit
            this.emitEvent("playerinfochange", this.userInfo);

            // Reset
            this._emitTimeoutPlayerInfo = null;
            this._debounceMetricsPlayerInfo = { total: 0, batched: 0 };
        }, DEBOUNCE_DELAY);
    }

    AddVipStatusChange(callback) {
        this.onEvent("vipstatuschange", callback);
    }

    RemoveVipStatusChange(callback) {
        this.offEvent("vipstatuschange", callback);
    }

    EmitVipStatusChange() {
        this.emitEvent("vipstatuschange", this.vipStatus);
    }

    AddChipDailyRewardChange(callback) {
        this.onEvent("chipdailyreward", callback);
    }

    RemoveChipDailyRewardChange(callback) {
        this.offEvent("chipdailyreward", callback);
    }

    EmitChipDailyRewardChange() {
        this.emitEvent("chipdailyreward", this.chipDailyReward);
    }

    AddUnlockedPlayerChange(callback) {
        this.onEvent("unlockedCharacterChange", callback);
    }

    RemoveUnlockedPlayerChange(callback) {
        this.offEvent("unlockedCharacterChange", callback);
    }

    EmitUnlockedPlayerChange() {
        // Production config
        const ENABLE_DEBOUNCE = true;
        const DEBOUNCE_DELAY = 500;
        const DEBUG_DEBOUNCE = true;

        if (!ENABLE_DEBOUNCE) {
            this.emitEvent("unlockedCharacterChange", this.unlockedPlayer);
            return;
        }

        // Track metrics
        if (!this._debounceMetricsUnlockedPlayers) {
            this._debounceMetricsUnlockedPlayers = { total: 0, batched: 0 };
        }
        this._debounceMetricsUnlockedPlayers.total++;

        // Clear existing
        if (this._emitTimeoutUnlockedPlayers) {
            clearTimeout(this._emitTimeoutUnlockedPlayers);
            this._debounceMetricsUnlockedPlayers.batched++;
        }

        // Set new timeout
        this._emitTimeoutUnlockedPlayers = setTimeout(() => {
            // Log metrics in debug
            if (
                DEBUG_DEBOUNCE &&
                this._debounceMetricsUnlockedPlayers.batched > 0
            ) {
                console.log(
                    `EmitUnlockedPlayerChange [DEBOUNCE] Batched ${
                        this._debounceMetricsUnlockedPlayers.batched + 1
                    } emits`,
                    `(${Math.round(
                        (this._debounceMetricsUnlockedPlayers.batched /
                            this._debounceMetricsUnlockedPlayers.total) *
                            100
                    )}% reduction)`
                );
            }

            // Emit
            this.emitEvent("unlockedCharacterChange", this.unlockedPlayer);

            // Reset
            this._emitTimeoutUnlockedPlayers = null;
            this._debounceMetricsUnlockedPlayers = { total: 0, batched: 0 };
        }, DEBOUNCE_DELAY);
    }

    AddInventoryChange(callback) {
        this.inventoryService.AddInventoryChange(callback);
    }

    RemoveInventoryChange(callback) {
        this.inventoryService.RemoveInventoryChange(callback);
    }

    EmitInventoryChange() {
        this.inventoryService.EmitInventoryChange();
    }

    isSelectedPlayer(_id) {
        // Kiểm tra xem chuỗi có thuộc mảng không
        if (this.selectedPlayerArr.includes(_id)) {
            //console.log(`${stringToCheck} exists in selectedPlayer`);

            return true;
        } else {
            //console.log(`${stringToCheck} does not exist in selectedPlayer`);

            return false;
        }
    }

    addToSelectedPlayer(_id, onSuccess, onError) {
        let newSelected = [];

        let player = this.getUnlockedPlayerById(_id);

        if (player) {
            for (let i = 0; i < this.selectedPlayerArr.length; i++) {
                let checkPlayer = this.getUnlockedPlayerById(
                    this.selectedPlayerArr[i]
                );

                if (player.role !== checkPlayer.role) {
                    newSelected.push(checkPlayer._id);
                }
            }

            newSelected.push(player._id);

            this.selectedPlayerArr = newSelected;
        }

        // console.log("selected player list:", this.selectedPlayer);

        this.RequestUpdateBattleCharacters(
            this.selectedPlayerArr,
            onSuccess,
            onError
        );
    }

    removeFromSelectedPlayer(_id, onSuccess, onError) {
        this.selectedPlayerArr = this.selectedPlayerArr.filter(
            (player) => player !== _id
        );

        this.RequestUpdateBattleCharacters(
            this.selectedPlayerArr,
            onSuccess,
            onError
        );
    }

    checkSelectedPlayerCorrect() {
        let newSelectedPlayer = [];

        for (let i = 0; i < this.selectedPlayerArr.length; i++) {
            let checkPlayer = this.getUnlockedPlayerById(
                this.selectedPlayerArr[i]
            );

            if (checkPlayer) {
                newSelectedPlayer.push(this.selectedPlayerArr[i]);
            }
        }

        this.selectedPlayerArr = newSelectedPlayer;
    }

    getSelectedPlayerLocalIds() {
        let tempArr = [];

        for (let i = 0; i < this.selectedPlayerArr.length; i++) {
            let checkPlayer = this.getUnlockedPlayerById(
                this.selectedPlayerArr[i]
            );

            if (checkPlayer) {
                tempArr.push(checkPlayer.code);
            }
        }

        return tempArr;
    }

    getUnlockedPlayerById(id) {
        return this.GetMergedCharacters()[id] || null;
    }

    getUnlockedPlayerLocalIds() {
        let tempArr = [];

        let playerDict = this.GetMergedCharacters();

        let keys = Object.keys(playerDict);

        for (let i = 0; i < keys.length; i++) {
            let checkPlayer = playerDict[keys[i]];

            if (checkPlayer && !tempArr.includes(checkPlayer.code)) {
                tempArr.push(checkPlayer.code);
            }
        }

        return tempArr;
    }

    RequestGetNFTCharacterIds() {
        GetNftCharacters(
            (result) => {
                this.unlockedPlayerNFTIds = [];

                this.unlockedPlayerNFTIds = result;

                // console.log("result:", result);

                // console.log("unlockedPlayerNFTIds:", this.unlockedPlayerNFTIds);

                this.RequestCharactersNFT();
            },
            (error) => {
                //console.log("RequestGetNFTCharacterIds erro:", error);
            }
        );
    }

    ClearNFTCharacterIds() {
        this.unlockedPlayerNFTIds = [];
    }

    GetMergedCharacters() {
        //console.log("GetMergedCharacters:");
        
        const merged = {};

        // Add all basic characters (lightweight)
        this.basicCharacters.forEach((basic, id) => {
            merged[id] = basic;
        });

        // Merge detailed data cho characters đã được tải
        this.detailedCharacters.forEach((detailed, id) => {
            merged[id] = { ...merged[id], ...detailed };
        });

        // Update legacy structures for backward compatibility
        this.unlockedPlayer = Object.assign({}, 
            ...Object.entries(merged)
                .filter(([id, data]) => !data.mintedAddress) // Regular chars
                .map(([id, data]) => ({[id]: data}))
        );

        this.unlockedPlayerNFT = Object.assign({}, 
            ...Object.entries(merged)
                .filter(([id, data]) => data.mintedAddress) // NFT chars
                .map(([id, data]) => ({[id]: data}))
        );

        return merged;
    }

    filterPlayers(codeToFind = "", starToFind = 1, levelToFind = 10) {
        // Chuyển object thành mảng entries để dễ filter
        const entries = Object.entries(this.unlockedPlayer);

        // Filter theo điều kiện
        const filteredEntries = entries.filter(([key, player]) => {
            return (
                player.code === codeToFind &&
                player.star === starToFind &&
                player.level === levelToFind
            );
        });

        // Chuyển lại thành object
        const result = Object.fromEntries(filteredEntries);

        // console.log("filterPlayers:", result);

        return result;
    }

    getItemOwnById(id) {
        return this.inventoryDictionary[id] || null;
    }

    getItemShopById(id) {
        return this.itemShopDictionary[id] || null;
    }

    getItemBaseById(id) {
        return this.baseItemInfo[id] || null;
    }

    // ===========================
    // AUTH METHODS - Delegated to AuthService
    // ===========================

    GetAccessToken() {
        return this.authService.GetAccessToken();
    }

    SetAccessToken(tokenStr) {
        return this.authService.SetAccessToken(tokenStr);
    }

    GetRefreshToken() {
        return this.authService.GetRefreshToken();
    }

    SetRefreshToken(tokenStr) {
        return this.authService.SetRefreshToken(tokenStr);
    }

    GetReceiverAddress() {
        return this.walletService.GetReceiverAddress();
    }

    SetReceiverAddress(address) {
        this.walletService.SetReceiverAddress(address);
    }

    GetWalletAddress() {
        return this.walletService.GetWalletAddress();
    }

    SetWalletAddress(address) {
        this.walletService.SetWalletAddress(address);
    }

    GetModalState() {
        return this.modalState;
    }

    SetModalState(state) {
        this.modalState = state;
    }

    //Request login
    RequestLoginTelegram(onSuccess, onError) {
        //this.SetFirstMissionsDone(true);

        const url = this.endpoints.AUTH.LOGIN_TELEGRAM;

        const { initDataRaw, initData, startParam } = retrieveLaunchParams();

        console.log("telegram initData: ", initData);

        // const initDataRaw =
        //     "query_id=AAFUTh8vAgAAAFROHy8DjqhN&user=%7B%22id%22%3A5085548116%2C%22first_name%22%3A%22Melo%20Chen%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22MelochenHkb%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FCaq5xBUxeJenRrKMkbBhJ2GmQslKiZmzL7DfRKyNVX9DpVsa5ZKuOo5meHotEnD8.svg%22%7D&auth_date=1734927833&signature=vICpQdN7R-05gpRyie17d_3T7MqTROgqEviBwv-lKxitmiPS4n62e9Nx5fimDEjiiTV68EW8f4NanN0xl7XvCA&hash=ee3b1193294f33530deb3e2209b325e76be920fa45cb1d0b9e1b0d686981632c";

        // const startParam = "A000000000";

        //test

        // const initDataRaw =
        //     "query_id=AAFUTh8vAgAAAFROHy8JeDOi&user=%7B%22id%22%3A5085548116%2C%22first_name%22%3A%22Melo%20Chen%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22MelochenHkb%22%2C%22language_code%22%3A%22vi%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FCaq5xBUxeJenRrKMkbBhJ2GmQslKiZmzL7DfRKyNVX9DpVsa5ZKuOo5meHotEnD8.svg%22%7D&auth_date=1740454302&signature=jsXsH8yYCsQzcH2MafbVwCK-NT2u_BRT09elW2hmY13BPqzT3o51MAeXHUM1dlgVa1-IJtPMV8jA-yojaDvWBg&hash=1e28eecc16c2db76d8499e7756cb8ba40362324af116f54de53cfd4b21f11cc6";

        // const startParam = "A000000000";

        // Lấy startapp từ URL parameters nếu có (cho web)
        const urlParams = new URLSearchParams(window.location.search);
        const startappFromUrl = urlParams.get("startapp") || "";

        // Ưu tiên startapp từ URL (web), nếu không thì dùng startParam (Telegram)
        const finalStartapp = startappFromUrl || startParam || "";

        // console.log("initDataRaw: ", initDataRaw);
        // console.log("startParam (Telegram): ", startParam);
        // console.log("startapp from URL (web): ", startappFromUrl);
        // console.log("finalStartapp: ", finalStartapp);

        const bodyData = {
            query_id: initDataRaw,
            reference_id: finalStartapp,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestLogin Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    // Lưu token vào localStorage
                    this.SetAccessToken(result.data.accessToken);
                    this.SetRefreshToken(result.data.refreshToken);

                    setTokens(
                        result.data.accessToken,
                        result.data.refreshToken
                    );

                    this.RequestCharacterInfo();

                    this.RequestItemInfo();

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestLogin Lỗi khi gửi yêu cầu POST:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message || error.response.data || "Login failed"
                    );
                }
            });
    }

    //Request login
    RequestSigninEmail(email, password, onSuccess, onError) {
        const url = this.endpoints.AUTH.SIGNIN_EMAIL;

        const bodyData = {
            email: email,
            password: password,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestRegister Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    if (result.accessToken) {
                        // Lưu token vào localStorage
                        this.SetAccessToken(result.accessToken);
                        this.SetRefreshToken(result.refreshToken);

                        setTokens(result.accessToken, result.refreshToken);

                        this.RequestCharacterInfo();

                        this.RequestItemInfo();

                        // Gọi hàm callback thành công nếu có
                        if (onSuccess && typeof onSuccess === "function") {
                            onSuccess(result);
                        }
                    } else {
                        // Gọi hàm callback thất bại nếu có
                        if (onError && typeof onError === "function") {
                            onError(result);
                        }
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestLogin Lỗi khi gửi yêu cầu POST:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    const resp =
                        error && error.response ? error.response : null;
                    const data = resp && resp.data ? resp.data : null;
                    onError({
                        status: resp ? resp.status : 0,
                        message:
                            (data && data.message) ||
                            error.message ||
                            error.response.data ||
                            "Signin failed",
                        error: data && data.error ? data.error : undefined,
                        details:
                            data && data.details ? data.details : undefined,
                        data: data || undefined,
                    });
                }
            });
    }

    //Request register
    RequestRegisterEmail(reference_id, email, password, onSuccess, onError) {
        const url = this.endpoints.AUTH.SIGNUP_EMAIL;

        const bodyData = {
            email: email,
            password: password,
            reference_id: reference_id,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestRegister Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    if (result.accessToken) {
                        // Lưu token vào localStorage
                        this.SetAccessToken(result.accessToken);
                        this.SetRefreshToken(result.refreshToken);

                        setTokens(result.accessToken, result.refreshToken);

                        this.RequestCharacterInfo();

                        this.RequestItemInfo();

                        // Gọi hàm callback thành công nếu có
                        if (onSuccess && typeof onSuccess === "function") {
                            onSuccess(result);
                        }
                    } else {
                        // Gọi hàm callback thất bại nếu có
                        if (onError && typeof onError === "function") {
                            onError(result);
                        }
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestLogin Lỗi khi gửi yêu cầu POST:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Registration failed"
                    );
                }
            });
    }

    //Request register
    RequestEmailForgotPassword(email, onSuccess, onError) {
        const url = this.endpoints.AUTH.FORGOT_PASSWORD;

        const bodyData = {
            email: email,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestEmailForgotPassword Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    if (result.success) {
                        // Gọi hàm callback thành công nếu có
                        if (onSuccess && typeof onSuccess === "function") {
                            onSuccess(result);
                        }
                    } else {
                        // Gọi hàm callback thất bại nếu có
                        if (onError && typeof onError === "function") {
                            onError(result);
                        }
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestLogin Lỗi khi gửi yêu cầu POST:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Forgot password request failed"
                    );
                }
            });
    }

    //Request login
    RequestSigninGoogle(credential, onSuccess, onError) {
        const url = this.endpoints.AUTH.SIGNIN_GOOGLE;

        const bodyData = {
            idToken: credential,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestSigninGoogle Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (result.data.accessToken) {
                        // Lưu token vào localStorage
                        this.SetAccessToken(result.data.accessToken);
                        this.SetRefreshToken(result.data.refreshToken);

                        setTokens(
                            result.data.accessToken,
                            result.data.refreshToken
                        );

                        this.RequestCharacterInfo();

                        this.RequestItemInfo();

                        // Gọi hàm callback thành công nếu có
                        if (onSuccess && typeof onSuccess === "function") {
                            onSuccess(result);
                        }
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestLogin Lỗi khi gửi yêu cầu POST:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Signin google failed"
                    );
                }
            });
    }

    async RequestSigninGoogleLinkTelegram(credential, onSuccess, onError) {
        const url = this.endpoints.AUTH.SIGNIN_GOOGLE_LINK_TELEGRAM;

        const bodyData = {
            idToken: credential,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                console.log(
                    "RequestSigninGoogleLinkTelegram Response result:",
                    JSON.stringify(result, null, 2)
                );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestLogin Lỗi khi gửi yêu cầu POST:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Signin google link telegram failed"
                    );
                }
            });
    }

    //Request update wallet
    RequestUpdateBattleCharacters(selectedArr, onSuccess, onError) {
        const url = this.endpoints.USER.UPDATE_BATTLE_CHARACTERS;

        const bodyData = {
            characterIds: selectedArr,
        };

        //console.log("RequestUpdateBattleCharacters body: ", bodyData);

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestUpdateBattleCharacters Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestUpdateBattleCharacters Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Update battle characters failed"
                    );
                }
            });
    }

    //Request update wallet
    RequestUpdateWallet(walletId, onSuccess, onError) {
        this.walletService.RequestUpdateWallet(walletId, onSuccess, onError);
    }

    //Request market sell
    RequestWalletWithdraw(tonWalletAddress, muskAmount, onSuccess, onError) {
        this.walletService.RequestWalletWithdraw(tonWalletAddress, muskAmount, onSuccess, onError);
    }

    //request user info
    RequestUserInfo(onSuccess, onError) {
        const url = this.endpoints.USER.GET_PROFILE;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestUserInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    if (result.data) {
                        this.userInfo = result.data;

                        this.selectedPlayerArr = result.data.battleCharacters;

                        this.EmitPlayerInfoChange();
                    }

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestUserInfo Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message || error.response.data || "Request failed"
                    );
                }
            });
    }

    //request get character info
    RequestCharacterInfo(onSuccess, onError) {
        const url = this.endpoints.CHARACTER.GET_INFO;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharacterInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    this.baseCharacterInfo = {};

                    for (let i = 0; i < result.data.length; i++) {
                        this.baseCharacterInfo[result.data[i].code] =
                            result.data[i];
                    }

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                    throw new Error(result);
                }
            })
            .catch((error) => {
                //console.error("RequestCharacterInfo Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get character info failed"
                    );
                }
            });
    }

    //request get item info
    RequestItemInfo(onSuccess, onError) {
        const url = this.endpoints.GAME.GET_ITEM_INFO;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestItemInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    this.baseItemInfo = {};

                    for (let i = 0; i < result.data.length; i++) {
                        this.baseItemInfo[result.data[i].code] = result.data[i];
                    }

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                    throw new Error(result);
                }
            })
            .catch((error) => {
                //console.error("RequestItemInfo Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get item info failed"
                    );
                }
            });
    }

    //Request update wallet
    RequestUpdateOtherGameInfo(OtherGameCode, OtherGameId, onSuccess, onError) {
        const url = this.endpoints.USER.UPDATE_OTHER_GAME_INFO;

        const bodyData = {
            otherGameCode: OtherGameCode,
            otherGameId: OtherGameId,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestUpdateOtherGameInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestUpdateOtherGameInfo Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Update other game info failed"
                    );
                }
            });
    }

    //RequestComplexCharacters();
    async RequestMergedCharacters(onSuccess, onError) {
        if (this.loadingBasicInfo) {
            console.log('RequestMergedCharacters: Already loading basic info');
            return Promise.resolve();
        }

        try {
            // Load basic info cho tất cả characters
            const basicLoaded = await this.loadBasicInfoForAllCharacters();

            if (!basicLoaded) {
                onError?.('Failed to load basic character info');
                return Promise.resolve();
            }

            // Load detailed data cho selected characters
            if (this.selectedPlayerArr.length > 0) {
                console.log(`Loading detailed data for ${this.selectedPlayerArr.length} selected characters`);

                const selectedPromises = this.selectedPlayerArr.map(characterId =>
                    this.loadFullCharacterData(characterId)
                );

                await Promise.allSettled(selectedPromises);
            }

            // Validate selected players
            this.checkSelectedPlayerCorrect();

            // Emit update
            this.EmitUnlockedPlayerChange();
            
            // Success
            onSuccess?.();

            return Promise.resolve();

        } catch (error) {
            console.error('RequestMergedCharacters failed:', error);
            onError?.(error.message || 'Failed to load characters');

            return Promise.reject(error);
        }
    }

    //request unlocked players
    RequestCharacters(onSuccess, onError) {
        const url = this.endpoints.USER.GET_CHARACTERS;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharacters Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    this.ConvertToUnlockedPlayers(result.data);

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestCharacters Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get characters failed"
                    );
                }
            });
    }

    ConvertToUnlockedPlayers(itemDataArr) {
        this.unlockedPlayer = {};

        for (let i = 0; i < itemDataArr.length; i++) {
            let itemData = itemDataArr[i];

            if (itemData != null) {
                let itemObj = {
                    _id: itemData._id,
                    code: itemData.code,
                    name: itemData.name,
                    role: itemData.role,
                    getMethod: itemData.getMethod,
                    description: itemData.description,
                    rank: itemData.rank,
                    level: itemData.level,
                    star: itemData.star,
                    mintedAddress: itemData.mintedAddress,
                    properties: itemData.properties,
                    nextLevelProperties: itemData.nextLevelProperties,
                    envolvedProperties: itemData.envolvedProperties,
                };

                this.unlockedPlayer[itemObj._id] = itemObj;
            }
        }

        //console.log("unlockedPlayer: ", this.unlockedPlayer);
    }

    //request unlocked players
    async RequestCharactersNFT(onSuccess, onError) {
        // ✅ DEFENSIVE: Check if NFT character IDs array is empty
        if (!this.unlockedPlayerNFTIds || this.unlockedPlayerNFTIds.length === 0) {
            console.log('[RequestCharactersNFT] No NFT character IDs to load');
            if (onSuccess && typeof onSuccess === "function") {
                onSuccess({ success: true, data: [] });
            }
            return;
        }

        const url = `${API_BASE_URL}/api/character/get-info`;

        const accessToken = this.GetAccessToken();

        const bodyData = {
            ids: this.unlockedPlayerNFTIds,
        };

        //console.log("this.unlockedPlayerNFTIds:", this.unlockedPlayerNFTIds);
        //console.log("RequestCharactersNFT body:", bodyData);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken, // Thêm Bearer Token vào tiêu đề
                },
                body: JSON.stringify(bodyData),
            });

            const result = await response.json();
            // console.log(
            //     "RequestCharactersNFT Response result:",
            //     JSON.stringify(result, null, 2)
            // );

            if (result.success) {
                this.ConvertToUnlockedPlayersNFT(result.data);

                // Gọi hàm callback thành công nếu có
                if (onSuccess && typeof onSuccess === "function") {
                    onSuccess(result);
                }
            } else {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(result);
                }
            }
        } catch (error) {
            // console.error(
            //     "RequestCharactersNFT Lỗi khi gửi yêu cầu POST:",
            //     error
            // );

            // Gọi hàm callback thất bại nếu có
            if (onError && typeof onError === "function") {
                onError(error.message);
            }
        }
    }

    ConvertToUnlockedPlayersNFT(itemDataArr) {
        this.unlockedPlayerNFT = {};

        for (let i = 0; i < itemDataArr.length; i++) {
            let itemData = itemDataArr[i];

            if (itemData != null) {
                let itemObj = {
                    _id: itemData._id,
                    code: itemData.code,
                    name: itemData.name,
                    role: itemData.role,
                    getMethod: itemData.getMethod,
                    description: itemData.description,
                    rank: itemData.rank,
                    level: itemData.level,
                    star: itemData.star,
                    mintedAddress: itemData.mintedAddress,
                    properties: itemData.properties,
                    nextLevelProperties: itemData.nextLevelProperties,
                    envolvedProperties: itemData.envolvedProperties,
                };

                this.unlockedPlayerNFT[itemObj._id] = itemObj;
            }
        }

        //console.log("ConvertToUnlockedPlayersNFT: ", this.unlockedPlayerNFT);
    }

    //request unlocked players
    RequestCharactersCraft(characterCode, onSuccess, onError) {
        const url = this.endpoints.CHARACTER.COMBINE_FRAGMENTS;

        const bodyData = {
            characterCode: characterCode,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharactersCraft Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCharactersCraft Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Character craft failed"
                    );
                }
            });
    }

    //request up level
    RequestCharactersUpLevel(characterOfUserId, onSuccess, onError) {
        const url = this.endpoints.CHARACTER.UPGRADE_LEVEL;

        const bodyData = {
            characterOfUserId: characterOfUserId,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharactersUpLevel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCharactersUpLevel Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Character upgrade level failed"
                    );
                }
            });
    }

    //request up star
    RequestCharactersUpStar(
        characterOfUserIds,
        preserveCharacterIds,
        onSuccess,
        onError
    ) {
        const url = `/api/character/upgrade-star`;

        const bodyData = {
            characterOfUserIds: characterOfUserIds,
            preserveCharacterIds: preserveCharacterIds,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharactersUpStar Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCharactersUpStar Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Character upgrade star failed"
                    );
                }
            });
    }

    //request evolve
    RequestCharactersEvolve(
        characterOfUserIds,
        preserveCharacters,
        onSuccess,
        onError
    ) {
        const url = `/api/character/upgrade-to-s-rank`;

        const bodyData = {
            characterOfUserIds: characterOfUserIds,
            preserveCharacters: preserveCharacters,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharactersEvolve Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCharactersEvolve Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Character evolve failed"
                    );
                }
            });
    }

    //request extract
    RequestCharactersExtract(characterOfUserId, onSuccess, onError) {
        const url = `/api/character/decompose`;

        const bodyData = {
            characterOfUserId: characterOfUserId,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharactersExtract Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCharactersExtract Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Character extract failed"
                    );
                }
            });
    }

    //request extract
    RequestCharactersMultiExtract(characterOfUserIds, onSuccess, onError) {
        const url = `/api/character/decompose-multiple`;

        const bodyData = {
            characterOfUserIds: characterOfUserIds,
            quantity: characterOfUserIds.length,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharactersMultiExtract Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCharactersMultiExtract Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Character multi-extract failed"
                    );
                }
            });
    }

    //request sell
    RequestCharactersSellMusk(characterOfUserId, onSuccess, onError) {
        const url = `/api/character/sell-for-musk`;

        const bodyData = {
            characterOfUserId: characterOfUserId,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharactersSellMusk Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCharactersSellMusk Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Character sell for musk failed"
                    );
                }
            });
    }

    //request invited friend
    RequestInviteFriend(onSuccess, onError) {
        const url = this.endpoints.USER.GET_F1_LIST;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestInviteFriend Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    if (result.data) {
                        this.friendArr = result.data;
                    }

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCurrentBattle Lỗi khi gửi yêu cầu Get:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get invite friends failed"
                    );
                }
            });
    }

    //request quest
    RequestQuestInfo(onSuccess, onError) {
        const url = this.endpoints.USER.GET_QUESTS;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestQuestInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestQuestInfo Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get quest info failed"
                    );
                }
            });
    }

    //Request mark quest done
    RequestMarkQuestDone(questCode, onSuccess, onError) {
        const url = this.endpoints.USER.MARK_QUEST_DONE;

        const bodyData = {
            code: questCode,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestQuestInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestMarkQuestDone Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Mark quest done failed"
                    );
                }
            });
    }

    //request quest
    RequestAchievementsInfo(achievementType, onSuccess, onError) {
        const url = `/api/achievement?type=${achievementType}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestAchivevementsInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                onError(error);
                //console.error("RequestAchievementsInfo Lỗi khi gửi yêu cầu Get:", error);
            });
    }

    //request claim achievement
    RequestClaimAchievement(achievementId, onSuccess, onError) {
        const url = `/api/achievement/claim/${achievementId}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestClaimAchievement Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message || "Claim achievement failed");
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestClaimAchievement Lỗi khi gửi yêu cầu POST:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Claim achievement failed"
                    );
                }
            });
    }

    //request rank
    RequestRank(onSuccess, onError) {
        const url = `/api/rankings/users`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestRank Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    if (result.data) {
                        // Hỗ trợ cấu trúc mới: result.data.users là danh sách
                        // Và tương thích ngược khi dữ liệu đã là mảng
                        const usersList =
                            result.data && result.data.users
                                ? result.data.users
                                : result.data;
                        this.rankArr = usersList || [];
                    }

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestRank Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get rank failed"
                    );
                }
            });
    }

    //request rank
    RequestMyRank(onSuccess, onError) {
        const url = `/api/rankings/me`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestMyRank Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (result.data) {
                        this.myRank = result.data;
                    }

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                    throw new Error(result);
                }
            })
            .catch((error) => {
                //console.error("RequestMyRank Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get my rank failed"
                    );
                }
            });
    }

    //Request spin
    RequestSpin(quantity, onSuccess, onError) {
        const url = this.endpoints.GAME.SPIN;

        const bodyData = {
            quantity: quantity,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestSpin Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result && result.data) {
                    this.userInfo.Chip = result.data.user.Chip;

                    this.userInfo.Musk = result.data.user.Musk;

                    this.EmitPlayerInfoChange();

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError("Spin failed");
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestSpin Lỗi khi gửi yêu cầu POST:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message || error.response.data || "Spin failed"
                    );
                }
            });
    }

    //Request premium-spin
    RequestPremiumSpin(quantity, onSuccess, onError) {
        const url = this.endpoints.GAME.PREMIUM_SPIN;

        const bodyData = {
            quantity: quantity,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPremiumSpin Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result && result.data) {
                    this.userInfo.Chip = result.data.user.Chip;

                    this.userInfo.Musk = result.data.user.Musk;

                    this.EmitPlayerInfoChange();

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError("Premium spin failed");
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestPremiumSpin Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Premium spin failed"
                    );
                }
            });
    }

    //request get current battle
    RequestCurrentBattle(onSuccess, onError) {
        const url = this.endpoints.GAME.GET_CURRENT_BATTLE;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestUserInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    this.battle = null;
                    if (result.scene) {
                        this.battle = result.scene;
                    }

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCurrentBattle Lỗi khi gửi yêu cầu Get:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get current battle failed"
                    );
                }
            });
    }

    //request get new battle
    RequestNewBattle(onSuccess, onError) {
        const url = this.endpoints.GAME.START_BATTLE;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestUserInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    if (result.scene) {
                        this.battle = result.scene;
                    }

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCurrentBattle Lỗi khi gửi yêu cầu Post:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Start new battle failed"
                    );
                }
            });
    }

    //request get current battle
    RequestStageInfo(stage, onSuccess, onError) {
        const url = `/api/game-stage/${stage}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestStageInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    this.StageInfo = result.data;

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestStageInfo Lỗi khi gửi yêu cầu Get:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get stage info failed"
                    );
                }
            });
    }

    //request get current battle
    RequestPostBossBattleDefeatedRewardsClaim(battleId, onSuccess, onError) {
        const url = `/api/boss/claim-rewards-simple`;

        const bodyData = {
            battleId: battleId,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostBossBattleDefeatedRewardsClaim Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result ||
                                "Failed to get RequestPostBossBattleDefeatedRewardsClaim"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get RequestPostBossBattleDefeatedRewardsClaim"
                    );
                }
            });
    }

    RequestPostBossBattleDefeatedRewards(battleId, onSuccess, onError) {
        const url = `/api/boss/get-rewards-simple`;

        const bodyData = {
            battleId: battleId,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostBossBattleDefeatedRewards Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result ||
                                "Failed to get RequestPostBossBattleDefeatedRewards"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get RequestPostBossBattleDefeatedRewards"
                    );
                }
            });
    }

    RequestBossBattleJoinTopDamage(battleId, onSuccess, onError) {
        const url = `/api/boss/mvp-board/${battleId}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestBossBattleJoinTopDamage Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result ||
                                "Failed to get RequestBossBattleJoinTopDamage"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get RequestBossBattleJoinTopDamage"
                    );
                }
            });
    }

    RequestBossBattlePoolTopDamage(battleId, onSuccess, onError) {
        const url = `/api/boss/top-damage/${battleId}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestBossBattlePoolTopDamage Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result ||
                                "Failed to get RequestBossBattlePoolTopDamage"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get RequestBossBattlePoolTopDamage"
                    );
                }
            });
    }

    //Request transaction history
    RequestTransactionHistory(page, onSuccess, onError) {
        this.walletService.RequestTransactionHistory(page, onSuccess, onError);
    }

    RequestTransactionHistoryMusk(page, onSuccess, onError) {
        this.walletService.RequestTransactionHistoryMusk(page, onSuccess, onError);
    }

    RequestTransactionHistoryChip(page, onSuccess, onError) {
        this.walletService.RequestTransactionHistoryChip(page, onSuccess, onError);
    }

    RequestTransactionHistoryMSCI(page, onSuccess, onError) {
        this.walletService.RequestTransactionHistoryMSCI(page, onSuccess, onError);
    }

    //Request spin
    RequestMintNFTCharacter(character_id, onSuccess, onError) {
        // console.log("RequestMintNFTCharacter:", character_id);

        const url = `/api/mint/character`;

        let walletId = this.GetWalletAddress();

        // console.log("walletId: ", walletId);

        const bodyData = {
            character_id: character_id,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestMintNFTCharacter Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestMintNFTCharacter Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Mint NFT character failed"
                    );
                }
            });
    }

    //request get inventory
    RequestInventory(onSuccess, onError) {
        this.inventoryService.RequestInventory(onSuccess, onError);
    }

    ConvertToItemInventory(itemDataArr) {
        this.inventoryService.ConvertToItemInventory(itemDataArr);
    }

    //request get shop
    RequestShop(onSuccess, onError) {
        this.inventoryService.RequestShop(onSuccess, onError);
    }

    ConvertToItemShop(itemDataArr) {
        this.inventoryService.ConvertToItemShop(itemDataArr);
    }

    //Request buy item
    RequestBuyItem(itemCode, quantity, onSuccess, onError) {
        this.inventoryService.RequestBuyItem(itemCode, quantity, onSuccess, onError);
    }

    //Request open box
    RequestOpenBox(itemCode, onSuccess, onError) {
        this.inventoryService.RequestOpenBox(itemCode, onSuccess, onError);
    }

    //Request open box
    RequestOpenMultiBox(itemCode, quantity, onSuccess, onError) {
        this.inventoryService.RequestOpenMultiBox(itemCode, quantity, onSuccess, onError);
    }

    //request get musk rate
    RequestMuskRate(onSuccess, onError) {
        this.walletService.RequestMuskRate(onSuccess, onError);
    }

    //request daily
    RequestDaily(onSuccess, onError) {
        const url = this.endpoints.USER.GET_CHECKIN_STATUS;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestDaily Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestDaily Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get daily checkin status failed"
                    );
                }
            });
    }

    //Request update wallet
    RequestDailyCheckin(onSuccess, onError) {
        const url = this.endpoints.USER.DAILY_CHECKIN;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestDailyCheckin Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestDailyCheckin Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Daily checkin failed"
                    );
                }
            });
    }

    //Request update wallet
    RequestLateCheckin(date, onSuccess, onError) {
        const url = this.endpoints.USER.MAKEUP_CHECKIN;

        const bodyData = {
            date: date,
        };

        // console.log("RequestLateCheckin bodyData: ", bodyData);

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestLateCheckin Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestLateCheckin Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data || "Late checkin failed");
                }
            });
    }

    //request Network
    RequestNetwork(page, _id, onSuccess, onError) {
        const url = `/api/f1-users/${_id}?page=${page}&limit=20`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNetwork Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestNetwork Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get network failed"
                    );
                }
            });
    }

    //request mails
    RequestMails(page, onSuccess, onError) {
        const url = `/api/mail/mails?page=${page}&limit=10`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestMails Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestMails Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get mails failed"
                    );
                }
            });
    }

    //request read mail
    RequestReadMail(mail_id, onSuccess, onError) {
        const url = `/api/mail/mails/${mail_id}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestReadMail Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestReadMail Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Read mail failed"
                    );
                }
            });
    }

    //request claim mail
    RequestClaimMail(mail_id, onSuccess, onError) {
        const url = `/api/mail/mails/${mail_id}/receive-attachments`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestClaimMail Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestClaimMail Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Claim mail failed"
                    );
                }
            });
    }

    //Request Update Avatar
    RequestUpdateAvatar(avatarKey, onSuccess, onError) {
        const url = `/api/me/update-avatar`;

        const bodyData = {
            avatar: avatarKey,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestUpdateAvatar Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestUpdateAvatar Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Update avatar failed"
                    );
                }
            });
    }

    //request quest
    RequestCharacterChipRates(onSuccess, onError) {
        const url = `/api/chip-rates`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCharacterChipRates Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestCharacterChipRates Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get character chip rates failed"
                    );
                }
            });
    }

    //request UserObjectID
    RequestGetUserObjectID(UserId, onSuccess, onError) {
        const url = `/api/users/search?userId=${UserId}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetUserObjectID Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestGetUserObjectID Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get user object ID failed"
                    );
                }
            });
    }

    //Request transfer M-coin
    RequestTransferMcoin(receiverId, amount, onSuccess, onError) {
        const url = `/api/p2p/transfer-musk`;

        const bodyData = {
            receiverId: receiverId,
            amount: amount,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestTransferMcoin Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestTransferMcoin Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data || "Transfer Mcoin failed");
                }
            });
    }

    //request UserObjectID
    RequestChipDailyRewards(onSuccess, onError) {
        const url = `/api/me/chip-rewards`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestChipDailyRewards Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    this.chipDailyReward = result;

                    this.EmitChipDailyRewardChange();

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestChipDailyRewards Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get chip daily rewards failed"
                    );
                }
            });
    }

    //request UserObjectID
    RequestVipStatus(onSuccess, onError) {
        const url = `/api/vip/status`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestVipStatus Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    this.vipStatus = result;

                    this.EmitVipStatusChange();

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestVipStatus Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get VIP status failed"
                    );
                }
            });
    }

    //Request Buy Vip
    RequestBuyVip(months, onSuccess, onError) {
        const url = `/api/vip/purchase`;

        const bodyData = {
            duration: months,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestBuyVip Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestBuyVip Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message || error.response.data || "Buy VIP failed"
                    );
                }
            });
    }

    //request CheckPointStatus
    RequestCheckPointStatus(onSuccess, onError) {
        const url = `/api/checkpoint-status`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestStageStatus Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Failed to get checkpoint status"
                        );
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestStageStatus Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get checkpoint status"
                    );
                }
            });
    }

    //request RequestBossStatus
    RequestBossActive(onSuccess, onError) {
        const url = `/api/boss/active`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestBossStatus Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Failed to get boss active status"
                        );
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestBossStatus Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get boss active status"
                    );
                }
            });
    }

    //request RequestBossStatus
    RequestBossSchedule(onSuccess, onError) {
        const url = `/api/boss/schedule`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestBossSchedule Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Failed to get boss schedule"
                        );
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestBossSchedule Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get boss schedule"
                    );
                }
            });
    }

    //request RequestBossStatus
    RequestBossGameplayStatus(bossId, onSuccess, onError) {
        const url = `/api/boss/${bossId}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestBossGameplayStatus Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get boss gameplay status"
                        );
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestBossGameplayStatus Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get boss gameplay status"
                    );
                }
            });
    }

    //Request CenterMarket
    RequestCenterMarket(
        type = "",
        rank = [],
        star = [],
        level = [],
        onSuccess,
        onError
    ) {
        //type = CHARACTER, minStar = 1->4, maxStar = 1 -> 4, minLevel = 1->10,  maxLevel = 1->10

        //type GAME_ITEM

        let url = "";

        if (type == "CHARACTER") {
            let rankStr = "";

            let starStr = "";

            let levelStr = "";

            if (rank && rank.length > 0) {
                rankStr += "&rank=";

                rankStr += rank.join(",");
            }

            if (star && star.length > 0) {
                starStr += "&star=";

                starStr += star.join(",");
            }

            if (level && level.length > 0) {
                levelStr += "&level=";

                levelStr += level.join(",");
            }

            url = `/api/market/marketplace?type=${type}${rankStr}${starStr}${levelStr}`;
        } else if (type == "GAME_ITEM") {
            url = `/api/market/marketplace?type=${type}`;
        }

        //console.log("RequestCenterMarket url: ", url);

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarket Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarket Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get center market failed"
                    );
                }
            });
    }

    RequestCenterMarketCharacterRoles(onSuccess, onError) {
        const url = this.endpoints.MARKET.GET_ROLES;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterRoles Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketCharacterRole Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get character roles failed"
                    );
                }
            });
    }

    RequestCenterMarketCharacterCodes(role, onSuccess, onError) {
        const url = `/api/market/marketplace/character-roles-detail?role=${role}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterRoleCode Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketCharacterRoleCode Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get character codes failed"
                    );
                }
            });
    }

    RequestCenterMarketCharacterStars(code, onSuccess, onError) {
        const url = `/api/market/marketplace/characters-by-star?code=${code}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterCodeStar Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketCharacterCodeStar Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get character stars failed"
                    );
                }
            });
    }

    RequestCenterMarketCharacterLevels(code, star, onSuccess, onError) {
        const url = `/api/market/marketplace/characters-by-code-star-level?code=${code}&star=${star}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterLevels Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketCharacterLevels Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get character levels failed"
                    );
                }
            });
    }

    RequestCenterMarketCharacterSelected(
        code,
        star,
        level,
        onSuccess,
        onError
    ) {
        const url = `/api/market/marketplace/characters-by-code-star-level-price?code=${code}&star=${star}&level=${level}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterSelected Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketCharacterSelected Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get character selected failed"
                    );
                }
            });
    }

    RequestCenterMarketItems(codes = [], onSuccess, onError) {
        let codeStr = codes.join(",");

        const url = `/api/market/marketplace/by-item-codes?itemCodes=${codeStr}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketItems Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketItems Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get items failed"
                    );
                }
            });
    }

    RequestCenterMarketCharacterFragments(code, onSuccess, onError) {
        const url = `/api/market/marketplace/character-fragments?code=${code}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterFragments Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketCharacterFragments Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get character fragments failed"
                    );
                }
            });
    }

    //Request market buy character
    RequestCenterMarketBuyCharacter(
        tradableItemId = "",
        price = 0,
        quantity = 0,
        onSuccess,
        onError
    ) {
        const url = `/api/market/marketplace/orders`;

        let bodyData = {
            tradableItemId: tradableItemId,
            price: price,
            quantity: quantity,
        };

        //console.log("RequestCenterMarketBuyCharacter bodyData: ", bodyData);

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketSellCancel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketSellCancel Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Buy character failed"
                    );
                }
            });
    }

    //Request market buy character
    RequestCenterMarketBuyItem(
        tradableItemId = "",
        price = 0,
        quantity = 0,
        onSuccess,
        onError
    ) {
        const url = `/api/market/marketplace/orders`;

        let bodyData = {
            tradableItemId: tradableItemId,
            price: price,
            quantity: quantity,
        };

        //console.log("RequestCenterMarketBuyItem bodyData: ", bodyData);

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketBuyItem Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketBuyItem Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Buy item failed"
                    );
                }
            });
    }

    //Request order buy
    RequestCenterMarketOrderBuy(onSuccess, onError) {
        let url = `/api/market/marketplace/orders`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketOrderBuy Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketOrderBuy Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get order buy failed"
                    );
                }
            });
    }

    //Request market buy character
    RequestCenterMarketOrderBuyCancel(id, onSuccess, onError) {
        const url = `/api/market/marketplace/orders/${id}/cancel`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketOrderBuyCancel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketOrderBuyCancel Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Cancel order buy failed"
                    );
                }
            });
    }

    //Request Buy Vip
    RequestCenterMarketSelling(type = "", onSuccess, onError) {
        //type = CHARACTER, minStar = 1->4, maxStar = 1 -> 4, minLevel = 1->10,  maxLevel = 1->10

        //type ITEM

        let url = "";

        if (type == "CHARACTER") {
            url = `/api/market/marketplace/my-listings?type=${type}`;
        } else if (type == "GAME_ITEM") {
            url = `/api/market/marketplace/my-listings?type=${type}`;
        }

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketSelling Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketSelling Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get selling failed"
                    );
                }
            });
    }

    //Request center market sell
    RequestCenterMarketSell(
        characterId = "",
        itemCode = "",
        fragmentCode = "",
        price,
        quantity,
        onSuccess,
        onError
    ) {
        const url = `/api/market/marketplace/list`;

        let bodyData = {};

        if (characterId != "") {
            bodyData = {
                characterId: characterId,
                price: price,
                quantity: quantity,
            };
        } else if (itemCode != "") {
            bodyData = {
                itemCode: itemCode,
                price: price,
                quantity: quantity,
            };
        } else if (fragmentCode != "") {
            bodyData = {
                fragmentCode: fragmentCode,
                price: price,
                quantity: quantity,
            };
        }

        //console.log("RequestCenterMarketSell bodyData: ", bodyData);

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketSell Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketSell Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Sell item failed"
                    );
                }
            });
    }

    //Request market sell
    RequestCenterMarketSellCancel(sellingId, onSuccess, onError) {
        const url = `/api/market/marketplace/cancel/${sellingId}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketSellCancel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketSellCancel Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Cancel sell failed"
                    );
                }
            });
    }

    //Request order history
    RequestCenterMarketOrderHistory(page = 1, onSuccess, onError) {
        let url = `/api/market/marketplace/order-history?page=${page}&limit=10`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketOrderHistory Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketOrderHistory Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get order history failed"
                    );
                }
            });
    }

    //Request order history
    RequestCenterMarketListHistory(onSuccess, onError) {
        let url = `/api/market/marketplace/listing-history?page=${1}&limit=10`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketListHistory Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketListHistory Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get list history failed"
                    );
                }
            });
    }

    //Request trade able items
    RequestCenterMarketTradeAbleItems(onSuccess, onError) {
        let url = `/api/market/tradable-items`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketTradeAbleItems Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    for (let i = 0; i < result.data.length; i++) {
                        let indexData = result.data[i];

                        if (indexData.type == "CHARACTER") {
                            let objKey = `${indexData.code}_${indexData.star}_${indexData.level}`;

                            this.centerMarketCharacters[objKey] = indexData;
                        } else if (
                            indexData.type == "GAME_ITEM" ||
                            indexData.type == "CHARACTER_FRAGMENT"
                        ) {
                            let objKey = `${indexData.code}`;

                            this.centerMarketItems[objKey] = indexData;
                        }
                    }

                    // console.log(
                    //     "centerMarketCharacters:",
                    //     this.centerMarketCharacters
                    // );

                    //console.log("centerMarketItems:", this.centerMarketItems);

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketTradeAbleItems Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get tradeable items failed"
                    );
                }
            });
    }

    //Request one trade able item info
    RequestCenterMarketTradeAbleItemInfo(_id, onSuccess, onError) {
        let url = `/api/market/tradable-item/${_id}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketTradeAbleItemInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (result.data.type == "CHARACTER") {
                        let objKey = `${result.data.code}_${result.data.star}_${result.data.level}`;

                        this.centerMarketCharacters[objKey] = result.data;
                    } else if (
                        result.data.type == "GAME_ITEM" ||
                        result.data.type == "CHARACTER_FRAGMENT"
                    ) {
                        let objKey = `${result.data.code}`;

                        this.centerMarketItems[objKey] = result.data;
                    }

                    // console.log(
                    //     "centerMarketCharacters:",
                    //     this.centerMarketCharacters
                    // );

                    //console.log("centerMarketItems:", this.centerMarketItems);

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketTradeAbleItemInfo Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get tradeable item info failed"
                    );
                }
            });
    }

    //Request one trade able item info
    RequestCenterMarketTradeAbleOrdersItemInfo(_id, onSuccess, onError) {
        let url = `/api/market/marketplace/order-counts/${_id}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketTradeAbleOrdersItemInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketTradeAbleOrdersItemInfo Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get tradeable orders item info failed"
                    );
                }
            });
    }

    RequestCenterMarketMSCIOrderBook(onSuccess, onError) {
        const url = `/api/market/orderbook/token`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketMSCIOrderBook Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketMSCIOrderBook Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get MSCI order book failed"
                    );
                }
            });
    }

    RequestCenterMarketMSCIOrder(isBuy, price, quantity, onSuccess, onError) {
        const url = `/api/market/order/token`;

        const bodyData = {
            type: "buy",
            quantity: quantity,
            price: price,
            assetType: "TOKEN",
            assetIdentifier: "MSCI",
            currency: "M-COIN",
        };

        if (isBuy) {
            bodyData.type = "buy";
        } else {
            bodyData.type = "sell";
        }

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketMSCIOrderBuy Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestCenterMarketMSCIOrderBuy Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Create MSCI order failed"
                    );
                }
            });
    }

    RequestMSCIOrders(onSuccess, onError) {
        this.walletService.RequestMSCIOrders(onSuccess, onError);
    }

    RequestCenterMarketMSCIOrderCancel(_id, onSuccess, onError) {
        this.walletService.RequestCenterMarketMSCIOrderCancel(_id, onSuccess, onError);
    }

    //Request msci dashboard
    RequestMSCIDashboard(onSuccess, onError) {
        this.walletService.RequestMSCIDashboard(onSuccess, onError);
    }

    //Request market sell
    RequestMSCIConvert(chipAmount, onSuccess, onError) {
        this.walletService.RequestMSCIConvert(chipAmount, onSuccess, onError);
    }

    //Request transaction history
    RequestMSCIHistory(page, onSuccess, onError) {
        this.walletService.RequestMSCIHistory(page, onSuccess, onError);
    }

    //Request one trade able item info
    RequestTokenomicDetail(onSuccess, onError) {
        this.walletService.RequestTokenomicDetail(onSuccess, onError);
    }

    //Request one trade able item info
    RequestTokenomicSlugDetail(slug, page, onSuccess, onError) {
        this.walletService.RequestTokenomicSlugDetail(slug, page, onSuccess, onError);
    }

    RequestNeuralinkUpgrade(neuralinkQuantity, onSuccess, onError) {
        const url = `/api/degamefi/initiate`;

        const bodyData = {
            quantity: neuralinkQuantity,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkUpgrade Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestNeuralinkUpgrade Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Neuralink upgrade failed"
                    );
                }
            });
    }

    //Request market sell
    RequestNeuralinkUpgradeSecond(_id, onSuccess, onError) {
        const url = `/api/degamefi/process/${_id}/pay`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkUpgradeSecond Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestNeuralinkUpgradeSecond Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Neuralink upgrade second failed"
                    );
                }
            });
    }

    //request neuralink info
    RequestNeuralinkInfo(onSuccess, onError) {
        const url = `/api/degamefi/upgradeable_neuralinks`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkInfo Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestNeuralinkInfo Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get neuralink info failed"
                    );
                }
            });
    }

    //request neuralink info
    RequestNeuralinkProgress(onSuccess, onError) {
        const url = `/api/degamefi/processes?status=AWAITING_SECOND_PAYMENT`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkProgress Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestNeuralinkProgress Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get neuralink progress failed"
                    );
                }
            });
    }

    //request neuralink info
    RequestNeuralinkRefining(onSuccess, onError) {
        const url = `/api/degamefi/processes?status=REFINING`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkRefining Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestNeuralinkRefining Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get neuralink refining failed"
                    );
                }
            });
    }

    //request neuralink complete
    RequestNeuralinkReadyToClaim(onSuccess, onError) {
        const url = `/api/degamefi/processes?status=READY_TO_CLAIM`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkReadyToClaim Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestNeuralinkReadyToClaim Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get neuralink ready to claim failed"
                    );
                }
            });
    }

    //request neuralink complete
    RequestNeuralinkClaim(_id, onSuccess, onError) {
        const url = `/api/degamefi/process/${_id}/claim`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkClaim Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                //console.error("RequestNeuralinkClaim Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Claim neuralink failed"
                    );
                }
            });
    }

    //request neuralink complete
    RequestNeuralinkHistory(page, onSuccess, onError) {
        const url = `/api/degamefi/processes?page=${page}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkHistory Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestNeuralinkHistory Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Get neuralink history failed"
                    );
                }
            });
    }

    RequestNeuralinkLiquidate(_id, quantity, onSuccess, onError) {
        const url = `/api/degamefi/liquidate`;

        const bodyData = {
            inventoryItemId: _id,
            quantity: quantity,
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkLiquidate Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestNeuralinkLiquidate Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Liquidate neuralink failed"
                    );
                }
            });
    }

    RequestNeuralinkEquip(_id, role, onSuccess, onError) {
        const url = `/api/degamefi/equip-item`;

        const bodyData = {
            inventoryItemId: _id,
            teamMember: role,
            itemType: "neuralink",
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkEquip Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestNeuralinkEquip Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error || "Equip neuralink failed");
                }
            });
    }

    RequestNeuralinkUnEquip(role, onSuccess, onError) {
        const url = `/api/degamefi/unequip-item`;

        const bodyData = {
            teamMember: role,
            itemType: "neuralink",
        };

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkUnEquip Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Failed to unequip neuralink"
                        );
                    }
                }
            })
            .catch((error) => {
                // console.error(
                //     "RequestNeuralinkUnEquip Lỗi khi gửi yêu cầu POST:",
                //     error
                // );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to unequip neuralink"
                    );
                }
            });
    }

    RequestNeuralinkCenterMarketItemsType(type, onSuccess, onError) {
        if (type == null) {
            type = "";
        }

        const url = `/api/market/orderbook/neuralink/sell/${type}`;

        // Sử dụng apiclient từ APIBase.js với then() và catch()
        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkCenterMarketItemsType Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    // Gọi hàm callback thất bại nếu có
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get neuralink center market items type"
                        );
                    }
                }
            })
            .catch((error) => {
                //console.error("RequestNeuralinkCenterMarketItemsType Lỗi khi gửi yêu cầu Get:", error);

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get neuralink center market items type"
                    );
                }
            });
    }

    RequestNeuralinkCenterMarketItemOrderBook(code, onSuccess, onError) {
        if (code == null) {
            code = "";
        }

        const url = `/api/market/orderbook/neuralink?assetIdentifier=${code}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkCenterMarketItemOrderBook Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get neuralink order book"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get neuralink order book"
                    );
                }
            });
    }

    // typ = "sell" or "buy"
    async RequestNeuralinkCenterMarketOrder(
        type,
        code,
        price,
        quantity,
        onSuccess,
        onError
    ) {
        const url = `${API_BASE_URL}/api/market/order/token`;

        const accessToken = this.GetAccessToken();

        const bodyData = {
            assetType: "NEURALINK",
            assetIdentifier: code,
            type: type,
            price: price,
            quantity: quantity,
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken, // Thêm Bearer Token vào tiêu đề
                },
                body: JSON.stringify(bodyData),
            });

            const result = await response.json();
            // console.log(
            //     "RequestNeuralinkCenterMarketOrder Response result:",
            //     JSON.stringify(result, null, 2)
            // );

            if (result.success) {
                // Gọi hàm callback thành công nếu có
                if (onSuccess && typeof onSuccess === "function") {
                    onSuccess(result);
                }
            } else {
                if (onError && typeof onError === "function") {
                    onError(result);
                }
            }
        } catch (error) {
            // console.error(
            //     "RequestNeuralinkCenterMarketOrder Lỗi khi gửi yêu cầu POST:",
            //     error
            // );

            // Gọi hàm callback thất bại nếu có
            if (onError && typeof onError === "function") {
                onError(error);
            }
        }
    }

    RequestNeuralinkCenterMarketItemOrderBookBuy(onSuccess, onError) {
        const url = `/api/market/orders/neuralink/current_buy`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkCenterMarketItemOrderBookBuy Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get neuralink current buy"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get neuralink current buy"
                    );
                }
            });
    }

    RequestNeuralinkCenterMarketItemOrderBookSell(onSuccess, onError) {
        const url = `/api/market/orders/neuralink/current_sell`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkCenterMarketItemOrderBookSell Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get neuralink current sell"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get neuralink current sell"
                    );
                }
            });
    }

    RequestNeuralinkCenterMarketOrderCancel(_id, onSuccess, onError) {
        const url = `/api/market/order/token/${_id}`;

        apiClient
            .delete(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkCenterMarketOrderCancel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Cancel neuralink order failed"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Cancel neuralink order failed"
                    );
                }
            });
    }

    async RequestNeuralinkCenterMarketItemHistorySell(
        page,
        onSuccess,
        onError
    ) {
        const url = `${API_BASE_URL}/api/market/orders/neuralink/history?type=sell&page=${page}`;

        const accessToken = this.GetAccessToken();

        try {
            const response = await fetch(url, {
                method: "Get",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken, // Thêm Bearer Token vào tiêu đề
                },
            });

            const result = await response.json();
            // console.log(
            //     "RequestNeuralinkCenterMarketItemHistorySell Response result:",
            //     JSON.stringify(result, null, 2)
            // );

            if (result.success) {
                // Gọi hàm callback thành công nếu có
                if (onSuccess && typeof onSuccess === "function") {
                    onSuccess(result);
                }
            } else {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(result);
                }
            }
        } catch (error) {
            //console.error("RequestNeuralinkCenterMarketItemHistorySell Lỗi khi gửi yêu cầu Get:", error);

            // Gọi hàm callback thất bại nếu có
            if (onError && typeof onError === "function") {
                onError(error);
            }
        }
    }

    RequestNeuralinkCenterMarketItemHistoryBuy(page, onSuccess, onError) {
        const url = `/api/market/orders/neuralink/history?type=buy&page=${page}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestNeuralinkCenterMarketItemHistoryBuy Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get neuralink buy history"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get neuralink buy history"
                    );
                }
            });
    }

    async RequestComposeNeuralink(
        itemCode,
        insuranceAmount,
        onSuccess,
        onError
    ) {
        const url = `${API_BASE_URL}/api/degamefi/compose`;

        const accessToken = this.GetAccessToken();

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                },
                body: JSON.stringify({
                    itemCode: itemCode,
                    insuranceAmount: insuranceAmount,
                }),
            });

            const result = await response.json();
            // console.log(
            //     "RequestComposeNeuralink Response result:",
            //     JSON.stringify(result, null, 2)
            // );

            if (result.success) {
                // Emit inventory change event
                this.EmitInventoryChange();

                // Call success callback if exists
                if (onSuccess && typeof onSuccess === "function") {
                    onSuccess(result);
                }
            } else {
                // Call error callback if exists
                if (onError && typeof onError === "function") {
                    onError(result);
                }
            }
        } catch (error) {
            //console.error("RequestComposeNeuralink Error:", error);

            // Call error callback if exists
            if (onError && typeof onError === "function") {
                onError(error);
            }
        }
    }

    //Center Market v2 Items
    RequestGetCMarketItemTradeAbleItems(onSuccess, onError) {
        const url = `/api/market-item/tradeable`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketItemTradeAbleItems Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market item trade able items"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to get center market item trade able items"
                    );
                }
            });
    }

    RequestGetCMarketItemListingStatistics(itemCodes, onSuccess, onError) {
        const url = `/api/market-item/statistics`;

        const bodyData = {
            itemCodes: itemCodes,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketItemListingStatistics Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market item listing statistics"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to unequip neuralink"
                    );
                }
            });
    }

    RequestGetCMarketItemPriceGuide(onSuccess, onError) {
        const url = `/api/market-item/price-guide`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketItemTradeAbleItems Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market item price guide"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to get center market item price guide"
                    );
                }
            });
    }

    RequestGetCMarketItemListing(itemCode, page, limit, onSuccess, onError) {
        const url = `/api/market-item/listings?itemCode=${itemCode}&page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketItemListing Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market item listing"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to get center market item listing"
                    );
                }
            });
    }

    RequestGetCMarketItemMyListing(status, page, limit, onSuccess, onError) {
        // Nếu status không được truyền vào hoặc là null/undefined, sử dụng giá trị mặc định
        const statusArray = status || ["active", "cancelled", "sold"];

        let statusStr = "";

        for (let i = 0; i < statusArray.length; i++) {
            if (i < statusArray.length - 1) {
                statusStr += statusArray[i] + ",";
            } else {
                statusStr += statusArray[i];
            }
        }

        const url = `/api/market-item/my-listings?status=${statusStr}&page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketItemMyListing Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market item my listing"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to get center market item my listing"
                    );
                }
            });
    }

    RequestDeleteCMarketItemCancel(listingId, onSuccess, onError) {
        const url = `/api/market-item/cancel/${listingId}`;

        const bodyData = {
            reason: "Changed my mind",
        };

        apiClient
            .delete(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketItemCancel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market item cancel"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to cancel center market item"
                    );
                }
            });
    }

    RequestPostCMarketItemBuyByListId(listingId, quantity, onSuccess, onError) {
        const url = `/api/market-item/buy`;

        const bodyData = {
            listingId: listingId,
            quantity: quantity,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketItemBuyByListId Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error.message ||
                                "Failed to get center market item buy by list id"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data.error || error.message);
                }
            });
    }

    RequestPostCMarketItemSell(
        itemCode,
        pricePerUnit,
        quantity,
        onSuccess,
        onError
    ) {
        const url = `/api/market-item/sell`;

        const bodyData = {
            itemCode: itemCode,
            pricePerUnit: pricePerUnit,
            quantity: quantity,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostCMarketItemSell Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error.message ||
                                "Failed to sell center market item"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data.error || error.message);
                }
            });
    }

    RequestGetCMarketItemMyBuy(page, limit, onSuccess, onError) {
        const url = `/api/market-item/buy?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketItemMyBuy Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get center market item my buy"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get center market item my buy"
                    );
                }
            });
    }

    //Center Market v2 Characters
    RequestGetCMarketCharacterTradeAble(onSuccess, onError) {
        const url = `/api/character-marketplace/my-characters`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterTradeAbleItems Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market character trade able items"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to get center market character trade able items"
                    );
                }
            });
    }

    RequestGetCMarketCharacterListingStatistics(
        characterCodes,
        includeDetails,
        onSuccess,
        onError
    ) {
        const url = `/api/character-marketplace/statistics`;

        //includeDetails bool value

        const bodyData = {
            characterCodes: characterCodes,
            includeDetails: includeDetails,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketItemListingStatistics Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market character listing statistics"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to get center market character listing statistics"
                    );
                }
            });
    }

    RequestGetCMarketCharacterListingsByCodeStarLevel(
        characterCode,
        star,
        level,
        page,
        limit,
        onSuccess,
        onError
    ) {
        const url = `/api/character-marketplace/listings?page=${page}&limit=${limit}&characterCode=${characterCode}&star=${star}&level=${level}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterListingsByCodeStarLevel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market character listings by code star level"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to get center market character listings by code star level"
                    );
                }
            });
    }

    RequestGetCMarketCharacterMyListings(
        status,
        page,
        limit,
        onSuccess,
        onError
    ) {
        // Nếu status không được truyền vào hoặc là null/undefined, sử dụng giá trị mặc định
        const statusArray = status || ["active", "cancelled", "sold"];

        let statusStr = "";

        for (let i = 0; i < statusArray.length; i++) {
            if (i < statusArray.length - 1) {
                statusStr += statusArray[i] + ",";
            } else {
                statusStr += statusArray[i];
            }
        }

        //status: active,cancelled,sold
        const url = `/api/character-marketplace/my-listings?status=${statusStr}&page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterMyListings Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market character my listings"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to get center market character my listings"
                    );
                }
            });
    }

    RequestGetCMarketCharacterMyBuy(page, limit, onSuccess, onError) {
        const url = `/api/character-marketplace/my-buy?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestCenterMarketCharacterMyBuy Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market character my buy"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error ||
                            "Failed to get center market character my buy"
                    );
                }
            });
    }

    RequestPostCMarketCharacterBuy(listingId, onSuccess, onError) {
        const url = `/api/character-marketplace/purchase`;

        const bodyData = {
            listingId: listingId,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostCMarketCharacterBuy Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error.message ||
                                "Failed to buy center market character"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data.error || error.message);
                }
            });
    }

    RequestPostCMarketCharacterSell(characterId, price, onSuccess, onError) {
        const url = `/api/character-marketplace/create`;

        const bodyData = {
            characterId: characterId,
            price: price,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostCMarketCharacterBuy Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error.message ||
                                "Failed to buy center market character"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data.error || error.message);
                }
            });
    }

    RequestPostCMarketCharacterSellCancel(listingId, onSuccess, onError) {
        const url = `/api/character-marketplace/cancel`;

        const bodyData = {
            listingId: listingId,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostCMarketCharacterSellCancel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error.message ||
                                "Try Failed to cancel center market character sell"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error.message ||
                            error.message ||
                            "Catch Failed to cancel center market character sell"
                    );
                }
            });
    }

    //Center market v2 MSCI

    RequestGetCMarketMSCIListing(page, limit, onSuccess, onError) {
        const url = `/api/market-msci/listings?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketMSCIListing Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market msci listing"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get center market msci listing"
                    );
                }
            });
    }

    RequestGetCMarketMSCIMyListing(status, page, limit, onSuccess, onError) {
        // Nếu status không được truyền vào hoặc là null/undefined, sử dụng giá trị mặc định
        const statusArray = status || ["active", "cancelled", "sold"];

        let statusStr = "";

        for (let i = 0; i < statusArray.length; i++) {
            if (i < statusArray.length - 1) {
                statusStr += statusArray[i] + ",";
            } else {
                statusStr += statusArray[i];
            }
        }

        const url = `/api/market-msci/my-listings?status=${statusStr}&page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketMSCIMyListing Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market msci my listing"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get center market msci my listing"
                    );
                }
            });
    }

    RequestGetCMarketMSCIPurchased(page, limit, onSuccess, onError) {
        const url = `/api/market-msci/my-transactions?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetCMarketMSCIPurchased Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error ||
                                "Failed to get center market msci my purchased"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get center market msci my purchased"
                    );
                }
            });
    }

    RequestPostCMarketMSCISell(amount, pricePerUnit, onSuccess, onError) {
        const url = `/api/market-msci/create`;

        const bodyData = {
            coinType: "MSCI",
            amount: amount,
            pricePerUnit: pricePerUnit,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostCMarketMSCISell Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error.message ||
                                "Try Failed to sell center market msci"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Catch Failed to sell center market msci"
                    );
                }
            });
    }

    RequestPostCMarketMSCISellCancel(listingId, onSuccess, onError) {
        const url = `/api/market-msci/cancel/${listingId}`;

        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostCMarketMSCISellCancel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error.message ||
                                "Try Failed to cancel center market msci sell"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Catch Failed to cancel center market msci sell"
                    );
                }
            });
    }

    RequestPostCMarketMSCIPurchase(listingId, onSuccess, onError) {
        const url = `/api/market-msci/purchase/${listingId}`;

        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostCMarketMSCISellCancel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error.message ||
                                "Try Failed to purchase center market msci"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error.message ||
                            error.message ||
                            "Catch Failed to purchase center market msci"
                    );
                }
            });
    }

    //Friends
    RequestAddFriend(toUserId, onSuccess, onError) {
        const url = `/api/friends/send`;

        const bodyData = {
            toUserId: toUserId,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestAddFriend Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.error || "Failed to add friend");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data.error || error.message);
                }
            });
    }

    RequestAcceptFriend(fromUserId, onSuccess, onError) {
        const url = `/api/friends/accept`;

        const bodyData = {
            fromUserId: fromUserId,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestAcceptFriend Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.error || "Failed to accept friend");
                    }
                }
            })
            .catch((error) => {
                console.log(
                    "RequestAcceptFriend error.response.data: ",
                    error.response.data
                );

                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data.error.message || error.message);
                }
            });
    }

    RequestRejectFriend(fromUserId, onSuccess, onError) {
        const url = `/api/friends/reject`;

        const bodyData = {
            fromUserId: fromUserId,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestAcceptFriend Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.error || "Failed to accept friend");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data.error || error.message);
                }
            });
    }

    RequestRemoveFriend(friendId, onSuccess, onError) {
        const url = `/api/friends/remove`;

        const bodyData = {
            friendId: friendId,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestRemoveFriend Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.error || "Failed to remove friend");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data.error.message ||
                            error.message ||
                            "Failed to remove friend"
                    );
                }
            });
    }

    RequestGetFriendRequestList(onSuccess, onError) {
        const url = `/api/friends/requests`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetFriendRequestList Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get friend request list"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get friend request list"
                    );
                }
            });
    }

    RequestGetFriendList(page, limit, onSuccess, onError) {
        const url = `/api/friends/list?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetFriendList Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.message || "Failed to get friend list");
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response.data ||
                            "Failed to get friend list"
                    );
                }
            });
    }

    //Friend chat
    RequestGetFriendChatHistory(friendId, page, limit, onSuccess, onError) {
        const url = `api/friendchat/${friendId}/history?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetFriendChatHistory Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Failed to get friend chat history");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get friend chat history"
                    );
                }
            });
    }

    RequestPostFriendChatSend(friendId, content, onSuccess, onError) {
        const url = `api/friendchat/${friendId}/messages`;

        const bodyData = {
            content: content,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostFriendChatSend Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Failed to post friend chat send");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data || "Failed to post friend chat send"
                    );
                }
            });
    }

    RequestGetFriendChatFromTimeStamp(
        friendId,
        fromTimeStamp,
        onSuccess,
        onError
    ) {
        const url = `api/friendchat/${friendId}/messages?since=${fromTimeStamp}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetFriendChatFromTimeStamp Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result || "Failed to get friend chat from time"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get friend chat from time"
                    );
                }
            });
    }

    //Multiplayer
    RequestGetMultiplayerBossRoomList(page, limit, onSuccess, onError) {
        const url = `/api/mpboss/active-rooms?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetMultiplayerBossRoomList Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get multiplayer boss room list"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get multiplayer boss room list"
                    );
                }
            });
    }

    //Guild
    RequestGetMyGuild(onSuccess, onError) {
        const url = `/api/guild/my-guild`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetMyGuild Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.message || "Failed to get my guild");
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(error.response.data || "Failed to get my guild");
                }
            });
    }

    RequestGetGuildList(keyword, page, limit, onSuccess, onError) {
        const url = `/api/guild/search?q=${keyword}&page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetGuildList Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.message || "Failed to get guild list");
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(error.response.data || "Failed to get guild list");
                }
            });
    }

    RequestGetGuildMemberList(
        guildId,
        keyword,
        page,
        limit,
        onSuccess,
        onError
    ) {
        const url = `/api/guild/members/${guildId}?q=${keyword}&page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetGuildMemberList Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Failed to get guild member list"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data || "Failed to get guild member list"
                    );
                }
            });
    }

    RequestPostGuildJoin(guildId, onSuccess, onError) {
        const url = `/api/guild/join/${guildId}`;

        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostGuildJoin Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result || result.message || "Failed to join guild"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    console.log("RequestPostGuildJoin error: ", error.response);

                    onError(
                        error.response.data || "Catch failed to join guild"
                    );
                }
            });
    }

    RequestPostGuildLeave(onSuccess, onError) {
        const url = `/api/guild/leave`;

        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostGuildLeave Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.error || "Failed to leave guild");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data || "Failed to leave guild");
                }
            });
    }

    RequestDeleteGuild(onSuccess, onError) {
        const url = `/api/guild/delete`;

        apiClient
            .delete(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestDeleteGuild Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.error || "Failed to delete guild");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data || "Failed to delete guild");
                }
            });
    }

    RequestGetGuildRequestList(page, limit, onSuccess, onError) {
        const url = `/api/guild/my-guild/requests?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetGuildRequestList Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Failed to get guild request list"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get guild request list"
                    );
                }
            });
    }

    RequestPostAcceptGuildRequest(requestId, onSuccess, onError) {
        const url = `/api/guild/request/${requestId}/approve`;

        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostAcceptGuildRequest Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error || "Failed to accept guild request"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data || "Failed to accept guild request"
                    );
                }
            });
    }

    RequestPostRejectGuildRequest(requestId, onSuccess, onError) {
        const url = `/api/guild/request/${requestId}/reject`;

        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostRejectGuildRequest Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error || "Failed to reject guild request"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data || "Failed to reject guild request"
                    );
                }
            });
    }

    RequestGetGuildMyRequestList(page, limit, onSuccess, onError) {
        const url = `/api/guild/my-request?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetGuildMyRequestList Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get guild my request list"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get guild my request list"
                    );
                }
            });
    }

    RequestPostGuildMyRequestCancel(requestId, onSuccess, onError) {
        const url = `/api/guild/my-request/cancel/${requestId}`;

        apiClient
            .post(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostGuildMyRequestCancel Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get guild my request cancel"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get guild my request cancel"
                    );
                }
            });
    }

    RequestDeleteGuildMember(memberId, onSuccess, onError) {
        const url = `/api/guild/member/${memberId}`;

        apiClient
            .delete(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestDeleteGuildMember Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.error || "Failed to remove guild member"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data || "Failed to remove guild member"
                    );
                }
            });
    }

    RequestPostCreateGuild(
        guildName,
        guildDescription,
        avatarKey,
        onSuccess,
        onError
    ) {
        const url = `/api/guild/create`;

        const bodyData = {
            name: guildName,
            description: guildDescription,
            avatar: avatarKey,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostCreateGuild Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Failed to reject guild request");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data || "Failed to reject guild request"
                    );
                }
            });
    }

    RequestPutUpdateGuildAvatar(guildId, avatarKey, onSuccess, onError) {
        const url = `/api/guild/${guildId}/avatar`;

        const bodyData = {
            avatarCode: avatarKey,
        };

        apiClient
            .put(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPutUpdateGuildAvatar Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result || "Failed to update guild avatar request"
                        );
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to update guild avatar request"
                    );
                }
            });
    }

    RequestGetGuildDonateLeaderboard(page, limit, onSuccess, onError) {
        const url = `/api/guild/donation-leaderboard?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetGuildDonateRanktList Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get guild donate rank list"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get guild donate rank list"
                    );
                }
            });
    }

    RequestPostDonateGuild(amount, onSuccess, onError) {
        const url = `/api/guild/donate`;

        const bodyData = {
            amount: amount,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestPostDonateGuild Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Failed to donate guild");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(error.response.data || "Failed to donate guild");
                }
            });
    }

    //Guild chat
    RequestGetGuildChatHistory(guildId, page, limit, onSuccess, onError) {
        const url = `api/chatv2/guild/${guildId}/history?page=${page}&limit=${limit}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetGuildChatHistory Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Failed to get guild chat history");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get guild chat history"
                    );
                }
            });
    }

    RequestPostGuildChatSend(guildId, content, onSuccess, onError) {
        const url = `api/chatv2/guild/${guildId}/messages`;

        const bodyData = {
            content: content,
        };

        apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetGuildChatHistory Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Failed to post guild chat send");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data || "Failed to post guild chat send"
                    );
                }
            });
    }

    RequestGetGuildChatFromTimeStamp(
        guildId,
        fromTimeStamp,
        onSuccess,
        onError
    ) {
        const url = `api/chatv2/guild/${guildId}/messages?since=${fromTimeStamp}`;

        apiClient
            .get(url)
            .then((response) => {
                const result = response.data;
                // console.log(
                //     "RequestGetGuildChatFromTimeStamp Response result:",
                //     JSON.stringify(result, null, 2)
                // );

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Failed to get guild chat from time");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response.data ||
                            "Failed to get guild chat from time"
                    );
                }
            });
    }

    // ✅ NEW: Load basic info for all characters
    async loadBasicInfoForAllCharacters() {
        if (this.loadingBasicInfo) return;
        this.loadingBasicInfo = true;

        try {
            const response = await apiClient.get(this.endpoints.USER.GET_CHARACTERS);
            
            if (response.data.success) {
                this.basicCharacters.clear();
                
                response.data.data.forEach(character => {
                    const basicInfo = {
                        _id: character._id,
                        code: character.code,
                        name: character.name,
                        role: character.role,
                        rank: character.rank,
                        level: character.level,
                        star: character.star
                    };
                    this.basicCharacters.set(character._id, basicInfo);
                });

                this.updateLegacyBasicData();
                return true;
            }
        } catch (error) {
            console.error('loadBasicInfoForAllCharacters failed:', error);
            return false;
        } finally {
            this.loadingBasicInfo = false;
        }
    }

    // ✅ NEW: Load full data for specific character
    async loadFullCharacterData(characterId) {
        if (this.detailedCharacters.has(characterId)) {
            return this.detailedCharacters.get(characterId);
        }

        if (this.loadingCharacters.has(characterId)) {
            return null;
        }

        this.loadingCharacters.add(characterId);
        this.failedCharacters.delete(characterId);

        try {
            const response = await apiClient.get(this.endpoints.USER.GET_CHARACTERS);
            const fullData = response.data.data.find(c => c._id === characterId);

            if (fullData) {
                this.detailedCharacters.set(characterId, fullData);
                this.updateLegacyDataForCharacter(characterId, fullData);
                this.emitCharacterDataUpdated(characterId, fullData);
                return fullData;
            }
        } catch (error) {
            console.error(`loadFullCharacterData(${characterId}) failed:`, error);
            this.failedCharacters.add(characterId);
            return null;
        } finally {
            this.loadingCharacters.delete(characterId);
        }
    }

    // ✅ NEW: Helper functions
    isCharacterFullyLoaded(characterId) {
        return this.detailedCharacters.has(characterId);
    }

    isCharacterLoading(characterId) {
        return this.loadingCharacters.has(characterId);
    }

    getCharacterBasicInfo(characterId) {
        return this.basicCharacters.get(characterId) || null;
    }

    getCharacterFullInfo(characterId) {
        if (this.detailedCharacters.has(characterId)) {
            return this.detailedCharacters.get(characterId);
        }

        setTimeout(() => this.loadFullCharacterData(characterId), 0);
        return this.basicCharacters.get(characterId) || null;
    }

    // ✅ NEW: Legacy compatibility helpers
    updateLegacyBasicData() {
        this.unlockedPlayer = {};
        this.basicCharacters.forEach((basic, id) => {
            this.unlockedPlayer[id] = basic;
        });
    }

    updateLegacyDataForCharacter(characterId, fullData) {
        this.unlockedPlayer[characterId] = fullData;
    }

    emitCharacterDataUpdated(characterId, fullData) {
        this.EmitUnlockedPlayerChange();
    }

    LogOut() {
        this.SetAccessToken("");
        this.SetRefreshToken("");
        this.SetIsGoogleLogin(false);
        centerData = new CenterData();
        window.location.reload();
    }
}

let centerData = new CenterData();
export default centerData;

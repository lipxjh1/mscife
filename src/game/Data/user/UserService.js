/**
 * UserService - User Management Service
 * Extracted from CenterData.js
 *
 * Handles all user-related operations:
 * - User profile management
 * - Battle characters selection
 * - Avatar updates
 * - User search
 * - Mcoin transfers
 */

import { ServiceBase } from '../core/ServiceBase.js';
import { EventEmitter } from '../core/EventEmitter.js';

export class UserService extends ServiceBase {
    constructor() {
        super();

        // Initialize event emitter
        this.eventEmitter = new EventEmitter();

        // User data
        this.userInfo = {
            _id: "67a1cde795124152b6d4170a",
            UserId: "A00002825",
            Username: "melochenhkb",
            Avatar: "avatar_free_3",
            Email: "eliteforcevn@gmail.com",
            TelegramId: 5085548116,
            linkedAccounts: {
                email: true,
                google: true,
                telegram: true,
                wallet: false,
            },
            Chip: 420746.6280004628,
            Musk: 83,
            MSCI: 10.231090898671535,
            reservedMusk: 0,
            reservedMSCI: 0,
            CurrentStage: 21,
            Power: 270,
            chipPerSecond: 0.05790000000000001,
            AutoRemainingTime: "1970-01-01T00:00:00.000Z",
            CheckedinDay: [],
            LastCheckinDate: "2025-09-12T02:18:14.909Z",
            Quests: [],
            DailyPointReward: 800,
            chipRewardSchedule: {
                active: false,
                dailyAmount: 10000,
            },
            isVip: false,
            teamEquipment: {},
            teamStats: {},
            battleCharacters: [],
            assets: {},
            reservedAssets: {},
            dailyConversionInfo: {},
            hasDeposited: true,
            inviteRewardLevel: 0,
            OldUser: 2,
            InviteCount: 0,
            SpentMusk: 3,
            InviteBy: "",
            Parent1: "",
            Parent2: "",
            F1SpentMusk: 0,
            F2SpentMusk: 0,
            OtherGameCode: "",
            OtherGameId: "",
        };

        this.selectedPlayerArr = [];

        // Debounce settings for player info change events
        this.ENABLE_DEBOUNCE = true;
        this.DEBOUNCE_DELAY = 500;
        this.playerInfoDebounceTimer = null;
    }

    // ===========================
    // EVENT HANDLING
    // ===========================

    AddPlayerInfoChange(callback) {
        this.eventEmitter.on("playerinfochange", callback);
    }

    RemovePlayerInfoChange(callback) {
        this.eventEmitter.off("playerinfochange", callback);
    }

    EmitPlayerInfoChange() {
        if (this.ENABLE_DEBOUNCE) {
            // Clear existing timer
            if (this.playerInfoDebounceTimer) {
                clearTimeout(this.playerInfoDebounceTimer);
            }

            // Set new timer
            this.playerInfoDebounceTimer = setTimeout(() => {
                this.eventEmitter.emit("playerinfochange");
                this.playerInfoDebounceTimer = null;
            }, this.DEBOUNCE_DELAY);
        } else {
            // Emit immediately without debounce
            this.eventEmitter.emit("playerinfochange");
        }
    }

    // ===========================
    // USER METHODS
    // ===========================

    RequestUserInfo(onSuccess, onError) {
        const url = this.endpoints.USER.GET_PROFILE;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result) {
                    if (result.data) {
                        this.userInfo = result.data;
                        this.selectedPlayerArr = result.data.battleCharacters;
                        this.EmitPlayerInfoChange();
                    }

                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                    throw new Error(result.message);
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message || error.response?.data || "Request failed"
                    );
                }
            });
    }

    RequestUpdateBattleCharacters(selectedArr, onSuccess, onError) {
        const url = this.endpoints.USER.UPDATE_BATTLE_CHARACTERS;

        const bodyData = {
            characterIds: selectedArr,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
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
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Update battle characters failed"
                    );
                }
            });
    }

    RequestUpdateAvatar(avatarKey, onSuccess, onError) {
        const url = `/api/me/update-avatar`;

        const bodyData = {
            avatar: avatarKey,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
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
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Update avatar failed"
                    );
                }
            });
    }

    RequestGetUserObjectID(UserId, onSuccess, onError) {
        const url = `/api/users/search?userId=${UserId}`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
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
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Get user object ID failed"
                    );
                }
            });
    }

    RequestTransferMcoin(receiverId, amount, onSuccess, onError) {
        const url = `/api/p2p/transfer-musk`;

        const bodyData = {
            receiverId: receiverId,
            amount: amount,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
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
                if (onError && typeof onError === "function") {
                    onError(error.response?.data || "Transfer Mcoin failed");
                }
            });
    }
}

export default UserService;

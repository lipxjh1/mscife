import centerData from "../../Data/CenterData.js";
import { socketServiceMultiplayerBoss } from "../../socketMultiplayerBoss.js";

export class GameplayMultiplayerBossRoom {
    constructor() {
        this.MaxPlayers = 2;

        this.roomInfo = {
            roomId: "",
            code: "",
            players: {
                host: {
                    id: null,
                    username: null,
                    avatar: null,
                    isReady: false,
                },
                guest: {
                    id: null,
                    username: null,
                    avatar: null,
                    isReady: false,
                },
            },
            status: "none",
            bossData: {
                bossId: "none",
                name: "none",
                bossHP: 0,
                maxHP: 0,
                shield: 0,
                maxShield: 0,
                battleTime: 0, //seconds
            },
            createdAt: "",
            closeAt: "",
        };
    }

    // {
    //     roomId: "",
    //     code: "",
    //     players: {
    //         host: {
    //             id: "Id",
    //             username: "username",
    //             avatar: "avatar",
    //             isReady: false,
    //         },
    //         guest: {
    //             id: "Id",
    //             username: "username",
    //             avatar: "avatar",
    //             isReady: false,
    //         },
    //     },
    //     status: "status",
    //     bossData: {
    //         bossId: "none",
    //         name: "name",
    //         bossHP: 0,
    //         maxHP: 0,
    //         shield: 0,
    //         maxShield: 0,
    //         battleTime: 0, //seconds
    //     },
    //     createdAt: "2025-10-06T07:58:34.049Z",
    //     closeAt: "2025-10-06T07:58:34.049Z",
    // }

    GetMaxPlayers() {
        return this.MaxPlayers;
    }

    GetRoomInfo() {
        return this.roomInfo;
    }

    SetRoomInfo(info) {
        this.roomInfo = info;
    }

    SetRoomPlayerReady(id, isReady) {
        if (id == this.roomInfo.players.host.id) {
            this.roomInfo.players.host.isReady = isReady;
        } else if (id == this.roomInfo.players.guest.id) {
            this.roomInfo.players.guest.isReady = isReady;
        }
    }

    GetPlayerIsReady(id) {
        if (id == this.roomInfo.players.host.id) {
            return this.roomInfo.players.host.isReady;
        } else if (id == this.roomInfo.players.guest.id) {
            return this.roomInfo.players.guest.isReady;
        }
    }

    SetRoomGuest(info) {
        //console.log("SetRoomGuest info: ", info);

        if (info != null) {
            this.roomInfo.players.guest = info;
        } else {
            this.roomInfo.players.guest = {
                id: null,
                isReady: false,
                username: null,
                avatar: null,
            };
        }
    }

    SetRoomHost(info) {
        if (info != null) {
            this.roomInfo.players.host = info;
        } else {
            this.roomInfo.players.host = {
                id: null,
                isReady: false,
                username: null,
                avatar: null,
            };
        }
    }

    IsHost() {
        return (
            this.roomInfo.players.host.username != null &&
            this.roomInfo.players.host.username == centerData.userInfo.Username
        );
    }

    CreateRoom(bossId, onSuccess, onError) {
        //console.log("CreateRoom");

        socketServiceMultiplayerBoss.emit(
            "mpboss:room:create",
            {
                bossId: bossId,
            },
            (response) => {
                //console.log("response: ", response);

                if (
                    response.error == null &&
                    response.data &&
                    response.data.code &&
                    response.data.code != ""
                ) {
                    this.SetRoomInfo(response.data);

                    onSuccess(response);
                } else {
                    onError(response);
                }
            }
        );
    }

    JoinRoom(roomCode, onSuccess, onError) {
        //console.log("JoinRoom");

        socketServiceMultiplayerBoss.emit(
            "mpboss:room:join",
            { code: roomCode },
            (response) => {
                //console.log("response: ", response);

                if (
                    response.error == null &&
                    response.data &&
                    response.data.code &&
                    response.data.code != ""
                ) {
                    this.SetRoomInfo(response.data);

                    onSuccess(response);
                } else {
                    onError(response);
                }
            }
        );
    }

    LeaveRoom(onSuccess, onError) {
        //console.log("LeaveRoom");

        socketServiceMultiplayerBoss.emit(
            "mpboss:room:leave",
            {},
            (response) => {
                //console.log("response: ", response);

                if (response.error == null && response.success) {
                    onSuccess(response);
                } else {
                    onError(response);
                }
            }
        );
    }

    StartRoom(onSuccess, onError) {
        //console.log("StartRoom");

        socketServiceMultiplayerBoss.emit(
            "mpboss:room:start",
            {},
            (response) => {
                //console.log("response: ", response);

                if (
                    response.error == null &&
                    response.data &&
                    response.data.started
                ) {
                    onSuccess(response);
                } else {
                    onError(response);
                }
            }
        );
    }

    KickPlayer(targetUserId, onSuccess, onError) {
        // console.log("KickPlayer");

        socketServiceMultiplayerBoss.emit(
            "mpboss:room:kick",
            { targetUserId: targetUserId, reason: "Host kicked" },
            (response) => {
                //console.log("response: ", response);

                if (response.error == null) {
                    onSuccess(response);
                } else {
                    onError(response);
                }
            }
        );
    }

    PlayerReady(roomId, onSuccess, onError) {
        //console.log("PlayerReady");

        socketServiceMultiplayerBoss.emit(
            "mpboss:room:ready",
            {
                roomId: roomId,
            },
            (response) => {
                //console.log("response: ", response);

                if (response.error == null && response.success) {
                    onSuccess(response);
                } else {
                    onError(response);
                }
            }
        );
    }

    PlayerUnready(roomId, onSuccess, onError) {
        //console.log("PlayerUnready");

        socketServiceMultiplayerBoss.emit(
            "mpboss:room:unready",
            {
                roomId: roomId,
            },
            (response) => {
                //console.log("response: ", response);

                if (response.error == null && response.success) {
                    onSuccess(response);
                } else {
                    onError(response);
                }
            }
        );
    }

    ResetRoom() {
        this.roomInfo = {
            roomId: "",
            code: "",
            players: {
                host: {
                    id: null,
                    username: null,
                    avatar: null,
                    isReady: false,
                },
                guest: {
                    id: null,
                    username: null,
                    avatar: null,
                    isReady: false,
                },
            },
            status: "none",
            bossData: {
                bossId: "none",
                name: "none",
                bossHP: 0,
                maxHP: 0,
                shield: 0,
                maxShield: 0,
                battleTimeMs: 0, //miliseconds
            },
            createdAt: "",
        };
    }

    /**
     * Cleanup socket listeners to prevent memory leaks
     * Fix: Socket listeners không được cleanup khi room destroyed
     */
    cleanup() {
        const events = [
            "mpboss:room:closed",
            "mpboss:room:joined",
            "mpboss:room:ready",
            "mpboss:room:start",
            "mpboss:room:leave",
            "mpboss:room:kick",
            "mpboss:room:error"
        ];

        events.forEach(event => {
            socketServiceMultiplayerBoss.off(event);
        });

        console.log('[GameplayMultiplayerBossRoom] Socket listeners cleaned up');
    }
}

const multiplayerBossRoom = new GameplayMultiplayerBossRoom();
export default multiplayerBossRoom;

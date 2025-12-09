import { BehaviorSubject } from "rxjs";
import { io } from "socket.io-client";
import { API_BASE_URL } from "./Data/APIBase";

export const SOCKET_EVENTS = {
    ERROR: "connect_error",
    CONNECT: "connect",
    DISCONNECT: "disconnect",
};

class SocketServiceMultiplayerBoss {
    constructor() {
        this.socketEvent = new BehaviorSubject(null);
        this.socket = null;
        this.isLoggingEnabled = false;
    }

    setLoggingEnabled(enabled) {
        this.isLoggingEnabled = enabled;
        this.log(
            `Multiplayer boss socket logging ${
                enabled ? "enabled" : "disabled"
            }`
        );
    }

    log(message, data = null) {
        if (this.isLoggingEnabled) {
            const timestamp = new Date().toISOString();
            if (data) {
                console.log(
                    `[Multiplayer Boss Socket ${timestamp}] ${message}`,
                    data
                );
            } else {
                console.log(
                    `[Multiplayer Boss Socket ${timestamp}] ${message}`
                );
            }
        }
    }

    connectSocket() {
        this.log("connectSocket:", `${API_BASE_URL}/mpboss`);

        if (!this.socket || !this.socket.connected) {
            this.log(
                "Attempting to connect to Multiplayer boss socket:",
                `${API_BASE_URL}/mpboss`
            );

            this.socket = io(`${API_BASE_URL}/mpboss`, {
                transports: ["websocket"],
                auth: {
                    token: sessionStorage.getItem("accessToken"),
                },
                reconnection: true,
                reconnectionAttempts: Infinity,
            });

            // Đăng ký heartbeat listener
            this.socket.on("heartbeat", (response) => {
                this.socket.emit("heartbeat", {
                    timestamp: new Date().toISOString(),
                });
            });

            // Đăng ký các core events
            this.registerCoreEvents();

            // Đăng ký onAny listener để log tất cả incoming events
            this.registerOnAnyListener();
        }
    }

    registerOnAnyListener() {
        if (!this.socket) return;

        this.socket.onAny((eventName, data) => {
            if (eventName === "heartbeat") {
                return;
            }

            this.log(`📥 INCOMING MULTIPLAYER Boss EVENT: ${eventName}`, {
                event: eventName,
                data: data,
                timestamp: new Date().toISOString(),
                socketId: this.socket.id,
            });

            this.socketEvent.next({
                type: eventName,
                payload: data,
            });
        });
    }

    registerCoreEvents() {
        if (!this.socket) return;

        this.socket.on("connect", () => {
            this.log("✅ Multiplayer Boss socket connected successfully", {
                socketId: this.socket.id,
                timestamp: new Date().toISOString(),
            });
            this.socketEvent.next({
                type: SOCKET_EVENTS.CONNECT,
            });
        });

        this.socket.on("disconnect", (reason) => {
            this.log("❌ Multiplayer Boss socket disconnected", {
                reason: reason,
                timestamp: new Date().toISOString(),
                socketId: this.socket.id,
            });
            this.socketEvent.next({
                type: SOCKET_EVENTS.DISCONNECT,
                payload: reason,
            });
        });

        this.socket.on("connect_error", (error) => {
            this.log("🚨 Multiplayer Boss connection error", {
                error: error.message || error,
                timestamp: new Date().toISOString(),
            });
        });

        this.socket.on("reconnect", (attemptNumber) => {
            this.log("🔄 Multiplayer Boss socket reconnected", {
                attemptNumber: attemptNumber,
                timestamp: new Date().toISOString(),
                socketId: this.socket.id,
            });
        });

        this.socket.on("reconnect_attempt", (attemptNumber) => {
            this.log("🔄 Multiplayer Boss attempting to reconnect", {
                attemptNumber: attemptNumber,
                timestamp: new Date().toISOString(),
            });
        });

        this.socket.on("reconnect_error", (error) => {
            this.log("🚨 Multiplayer Boss reconnection error", {
                error: error.message || error,
                timestamp: new Date().toISOString(),
            });
        });

        this.socket.on("reconnect_failed", () => {
            this.log(
                "💥 Multiplayer Boss reconnection failed - max attempts reached",
                {
                    timestamp: new Date().toISOString(),
                }
            );
        });
    }

    emit(event, data, responseCallback) {
        if (this.socket && this.socket.connected) {
            this.log(`📤 EMITTING MULTIPLAYER Boss EVENT: ${event}`, {
                event: event,
                data: data,
                timestamp: new Date().toISOString(),
                socketId: this.socket.id,
            });
            this.socket.emit(event, data, responseCallback);
        } else {
            this.log(
                "⚠️ Cannot emit multiplayer boss event: socket is not connected",
                {
                    event: event,
                    data: data,
                    socketConnected: this.socket?.connected,
                    timestamp: new Date().toISOString(),
                }
            );
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.log(
                `👂 Registering multiplayer boss listener for event: ${event}`,
                {
                    event: event,
                    callbackName: callback.name || "anonymous",
                    timestamp: new Date().toISOString(),
                }
            );
            this.socket.on(event, callback);
        } else {
            this.log(
                "⚠️ Cannot register multiplayer boss event listener: socket is not initialized",
                {
                    event: event,
                    timestamp: new Date().toISOString(),
                }
            );
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.log(
                `🔇 Removing multiplayer boss listener for event: ${event}`,
                {
                    event: event,
                    callbackName: callback?.name || "anonymous",
                    timestamp: new Date().toISOString(),
                }
            );
            this.socket.off(event, callback);
        }
    }

    removeAllListeners(event) {
        if (this.socket) {
            this.log(
                `🔇 Removing all multiplayer boss listeners for event: ${event}`,
                {
                    event: event,
                    timestamp: new Date().toISOString(),
                }
            );
            this.socket.removeAllListeners(event);
        }
    }

    getSocketStatus() {
        if (!this.socket) {
            return {
                status: "not_initialized",
                connected: false,
                socketId: null,
                timestamp: new Date().toISOString(),
            };
        }

        return {
            status: this.socket.connected ? "connected" : "disconnected",
            connected: this.socket.connected,
            socketId: this.socket.id,
            timestamp: new Date().toISOString(),
        };
    }

    disconnect() {
        if (this.socket) {
            this.log("🔌 Manually disconnecting multiplayer boss socket", {
                socketId: this.socket.id,
                timestamp: new Date().toISOString(),
            });
            this.socket.disconnect();
        }
    }
}

export const socketServiceMultiplayerBoss = new SocketServiceMultiplayerBoss();

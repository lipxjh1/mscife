import { BehaviorSubject } from "rxjs";
import { io } from "socket.io-client";
import { API_BASE_URL } from "./Data/APIBase";
import { CreateAlertPopup } from "./scenes/Share/AlertPopup";
import centerData from "./Data/CenterData";

export const SOCKET_EVENTS = {
    ERROR: "error",
    CONNECT: "connect",
    DISCONNECT: "disconnect",
};

class SocketService {
    constructor() {
        this.socketEvent = new BehaviorSubject(null);
        this.socket = null;
        this.isLoggingEnabled = false; // Flag để bật/tắt logging

        // ✅ FIX: Flags to prevent notification spam
        this.disconnectNotificationShown = false;
        this.connectNotificationShown = false;
    }

    // Method để bật/tắt logging
    setLoggingEnabled(enabled) {
        this.isLoggingEnabled = enabled;
        this.log(`Socket logging ${enabled ? "enabled" : "disabled"}`);
    }

    // Method để log với format nhất quán
    log(message, data = null) {
        if (this.isLoggingEnabled) {
            const timestamp = new Date().toISOString();
            if (data) {
                console.log(`[Socket ${timestamp}] ${message}`, data);
            } else {
                console.log(`[Socket ${timestamp}] ${message}`);
            }
        }
    }

    connectSocket() {
        this.log("connectSocket:", `${API_BASE_URL}/`);

        if (!this.socket || !this.socket.connected) {
            this.log("Attempting to connect to socket:", `${API_BASE_URL}/`);

            this.socket = io(`${API_BASE_URL}/`, {
                transports: ["websocket"],
                auth: {
                    token: sessionStorage.getItem("accessToken"),
                },
                reconnection: true,
                reconnectionAttempts: Infinity,
            });

            this.socket.on("heartbeat", () => {
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

        // Lắng nghe tất cả các sự kiện từ server
        this.socket.onAny((eventName, data) => {
            if (eventName === "heartbeat") {
                return;
            }

            this.log(`📥 INCOMING EVENT: ${eventName}`, {
                event: eventName,
                data: data,
                timestamp: new Date().toISOString(),
                socketId: this.socket.id,
            });

            // Phát sự kiện ra ngoài nếu cần
            this.socketEvent.next({
                type: eventName,
                payload: data,
            });
        });
    }

    registerCoreEvents() {
        if (!this.socket) return;

        this.socket.on("connect", () => {
            this.log("✅ Socket connected successfully", {
                socketId: this.socket.id,
                timestamp: new Date().toISOString(),
            });

            // ✅ FIX: Reset disconnect flag and show connect notification once
            this.disconnectNotificationShown = false; // Reset disconnect flag

            if (!this.connectNotificationShown) {
                this.connectNotificationShown = true;

                window.dispatchEvent(new CustomEvent('arena:notification', {
                    detail: {
                        type: 'success',
                        title: '✅ Connected',
                        message: 'Successfully connected to game server',
                        data: {
                            socketId: this.socket.id,
                            timestamp: Date.now()
                        }
                    }
                }));

                // Reset connect notification flag after a delay
                setTimeout(() => {
                    this.connectNotificationShown = false;
                }, 3000);
            }

            this.socketEvent.next({
                type: SOCKET_EVENTS.CONNECT,
            });
        });

        this.socket.on("disconnect", (reason) => {
            this.log("❌ Socket disconnected", {
                reason: reason,
                timestamp: new Date().toISOString(),
                socketId: this.socket.id,
            });

            // ✅ FIX: Only show notification ONCE per disconnect
            if (!this.disconnectNotificationShown) {
                this.disconnectNotificationShown = true;

                window.dispatchEvent(new CustomEvent('arena:notification', {
                    detail: {
                        type: 'error',
                        title: '⚠️ Connection Lost',
                        message: this.getDisconnectMessage(reason),
                        data: {
                            reason,
                            timestamp: Date.now(),
                            socketId: this.socket.id
                        }
                    }
                }));
            }

            this.socketEvent.next({
                type: SOCKET_EVENTS.DISCONNECT,
                payload: reason,
            });
        });

        this.socket.on("connect_error", (error) => {
            this.log("🚨 Connection error", {
                error: error.message || error,
                timestamp: new Date().toISOString(),
            });
        });

        this.socket.on("reconnect", (attemptNumber) => {
            this.log("🔄 Socket reconnected", {
                attemptNumber: attemptNumber,
                timestamp: new Date().toISOString(),
                socketId: this.socket.id,
            });
        });

        this.socket.on("reconnect_attempt", (attemptNumber) => {
            this.log("🔄 Attempting to reconnect", {
                attemptNumber: attemptNumber,
                timestamp: new Date().toISOString(),
            });
        });

        this.socket.on("reconnect_error", (error) => {
            this.log("🚨 Reconnection error", {
                error: error.message || error,
                timestamp: new Date().toISOString(),
            });
        });

        this.socket.on("reconnect_failed", () => {
            this.log("💥 Reconnection failed - max attempts reached", {
                timestamp: new Date().toISOString(),
            });
        });

        this.socket.on("session:replaced", (data) => {
            console.log("🔴 [Session] Account was loged in another session");
            console.log("📝 [Session] Message:", data.message);
            console.log("⏰ [Session] Time:", data.timestamp);

            CreateAlertPopup(
                `Account was loged in another session\nMessage: ${data.message}\nTime: ${data.timestamp}`,
                () => {
                    centerData.LogOut();
                }
            );
        });
    }

    emit(event, data, responseCallback) {
        if (this.socket && this.socket.connected) {
            this.log(`📤 EMITTING EVENT: ${event}`, {
                event: event,
                data: data,
                timestamp: new Date().toISOString(),
                socketId: this.socket.id,
            });
            this.socket.emit(event, data, responseCallback);
        } else {
            this.log("⚠️ Cannot emit event: socket is not connected", {
                event: event,
                data: data,
                socketConnected: this.socket?.connected,
                timestamp: new Date().toISOString(),
            });
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.log(`👂 Registering listener for event: ${event}`, {
                event: event,
                callbackName: callback.name || "anonymous",
                timestamp: new Date().toISOString(),
            });
            this.socket.on(event, callback);
        } else {
            this.log(
                "⚠️ Cannot register event listener: socket is not initialized",
                {
                    event: event,
                    timestamp: new Date().toISOString(),
                }
            );
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.log(`🔇 Removing listener for event: ${event}`, {
                event: event,
                callbackName: callback?.name || "anonymous",
                timestamp: new Date().toISOString(),
            });
            this.socket.off(event, callback);
        }
    }

    removeAllListeners(event) {
        if (this.socket) {
            this.log(`🔇 Removing all listeners for event: ${event}`, {
                event: event,
                timestamp: new Date().toISOString(),
            });
            this.socket.removeAllListeners(event);
        }
    }

    /**
     * Get user-friendly disconnect message
     * @param {string} reason - Socket.IO disconnect reason
     * @returns {string} User-friendly message
     */
    getDisconnectMessage(reason) {
        const messages = {
            'ping timeout': 'Connection timeout - Please check your internet connection',
            'transport close': 'Connection lost - Attempting to reconnect...',
            'transport error': 'Network error occurred - Check your connection',
            'io client disconnect': 'Disconnected from server',
            'io server disconnect': 'Server disconnected the connection',
            'forced close': 'Connection closed unexpectedly'
        };

        return messages[reason] || `Connection lost: ${reason}`;
    }

    // Method để lấy thông tin trạng thái socket
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

    // Method để disconnect socket
    disconnect() {
        if (this.socket) {
            this.log("🔌 Manually disconnecting socket", {
                socketId: this.socket.id,
                timestamp: new Date().toISOString(),
            });
            this.socket.disconnect();
        }
    }
}

export const socketService = new SocketService();

/**
 * UIManager - Centralized UI Resource Management
 * Giúp track và cleanup tất cả UI resources để tránh memory leaks
 */

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.elements = [];
        this.timers = [];
        this.tweens = [];
        this.events = [];
        this.callbacks = [];
    }

    /**
     * Register UI element để theo dõi
     * @param {Phaser.GameObjects.GameObject} element - UI element cần track
     * @returns {Phaser.GameObjects.GameObject} - Element đã register
     */
    register(element) {
        this.elements.push(element);
        return element;
    }

    /**
     * Thêm timer vào list theo dõi
     * @param {Object} config - Timer config
     * @returns {Phaser.Time.TimerEvent} - Timer đã tạo
     */
    addTimer(config) {
        const timer = this.scene.time.addEvent(config);
        this.timers.push(timer);
        return timer;
    }

    /**
     * Thêm delayedCall vào list theo dõi
     * @param {number} delay - Delay trong ms
     * @param {Function} callback - Callback function
     * @param {Array} args - Arguments array
     * @param {Object} scope - Scope context
     * @returns {Phaser.Time.TimerEvent} - Timer đã tạo
     */
    addDelayedCall(delay, callback, args = [], scope = this.scene) {
        const timer = this.scene.time.delayedCall(delay, callback, args, scope);
        this.timers.push(timer);
        return timer;
    }

    /**
     * Thêm tween vào list theo dõi
     * @param {Object} config - Tween config
     * @returns {Phaser.Tweens.Tween} - Tween đã tạo
     */
    addTween(config) {
        const tween = this.scene.tweens.add(config);
        if (tween) {
            this.tweens.push(tween);
        }
        return tween;
    }

    /**
     * Thêm event listener vào list theo dõi
     * @param {Phaser.Events.EventEmitter} target - Target object
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} context - Event context
     * @returns {Function} - Bound handler
     */
    addEvent(target, event, handler, context = this.scene) {
        if (!target || !target.on) {
            console.warn(`[UIManager] Invalid target for event: ${event}`);
            return null;
        }

        const boundHandler = handler.bind(context);
        target.on(event, boundHandler);

        this.events.push({
            target: target,
            event: event,
            handler: boundHandler
        });

        return boundHandler;
    }

    /**
     * Thêm pointer event vào list theo dõi
     * @param {Phaser.GameObjects.GameObject} target - Interactive object
     * @param {string} event - Event name (pointerdown, pointerup, etc.)
     * @param {Function} handler - Event handler
     * @param {Object} context - Event context
     * @returns {Function} - Bound handler
     */
    addPointerEvent(target, event, handler, context = this.scene) {
        return this.addEvent(target, event, handler, context);
    }

    /**
     * Thêm socket event vào list theo dõi
     * @param {string} event - Socket event name
     * @param {Function} handler - Event handler
     * @param {Object} context - Event context
     * @param {Object} socketService - Socket service instance
     * @returns {Function} - Bound handler
     */
    addSocketEvent(event, handler, context = this.scene, socketService = null) {
        // Try to get socket service globally if not provided
        if (!socketService && typeof window !== 'undefined') {
            socketService = window.socketService;
        }

        if (!socketService?.socket) {
            console.warn(`[UIManager] Socket service not available for event: ${event}`);
            return null;
        }

        const boundHandler = handler.bind(context);
        socketService.socket.on(event, boundHandler);

        this.events.push({
            target: socketService.socket,
            event: event,
            handler: boundHandler,
            isSocket: true
        });

        return boundHandler;
    }

    /**
     * Thêm EventBus event vào list theo dõi
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} context - Event context
     * @param {Object} EventBus - EventBus instance
     * @returns {Function} - Bound handler
     */
    addEventBusEvent(event, handler, context = this.scene, EventBus = null) {
        // Try to get EventBus globally
        if (!EventBus && typeof window !== 'undefined') {
            EventBus = window.EventBus;
        }

        if (!EventBus || !EventBus.on) {
            console.warn(`[UIManager] EventBus not available for event: ${event}`);
            return null;
        }

        const boundHandler = handler.bind(context);
        EventBus.on(event, boundHandler);

        this.events.push({
            target: EventBus,
            event: event,
            handler: boundHandler,
            isEventBus: true
        });

        return boundHandler;
    }

    /**
     * Lưu callback để cleanup sau này
     * @param {Function} callback - Callback function
     */
    addCallback(callback) {
        this.callbacks.push(callback);
    }

    /**
     * Cleanup tất cả resources
     * Gọi trong scene.shutdown() hoặc destroy()
     */
    destroy() {
        const sceneKey = this.scene?.scene?.key || 'Unknown';
        console.log(`[UIManager] Cleaning up ${sceneKey} UI resources...`);

        // Cleanup event listeners
        this.events.forEach(({ target, event, handler, isSocket, isEventBus }) => {
            try {
                if (isSocket && target.off) {
                    target.off(event, handler);
                } else if (isEventBus && target.off) {
                    target.off(event, handler);
                } else if (target && target.off) {
                    target.off(event, handler);
                }
            } catch (e) {
                console.warn(`[UIManager] Error removing event ${event}:`, e);
            }
        });
        this.events = [];

        // Cleanup tweens
        this.tweens.forEach(tween => {
            try {
                if (tween && tween.isActive && tween.isActive()) {
                    tween.stop();
                }
            } catch (e) {
                console.warn(`[UIManager] Error stopping tween:`, e);
            }
        });
        this.tweens = [];

        // Cleanup timers
        this.timers.forEach(timer => {
            try {
                if (timer && timer.remove) {
                    timer.remove();
                }
            } catch (e) {
                console.warn(`[UIManager] Error removing timer:`, e);
            }
        });
        this.timers = [];

        // Cleanup elements
        this.elements.forEach(element => {
            try {
                if (element) {
                    // If element has custom cleanup
                    if (element.cleanup && typeof element.cleanup === 'function') {
                        element.cleanup();
                    }
                    // Else destroy directly
                    else if (element.destroy && typeof element.destroy === 'function') {
                        element.destroy();
                    }
                }
            } catch (e) {
                console.warn(`[UIManager] Error destroying element:`, e);
            }
        });
        this.elements = [];

        // Cleanup callbacks
        this.callbacks.forEach(callback => {
            try {
                if (typeof callback === 'function') {
                    callback();
                }
            } catch (e) {
                console.warn(`[UIManager] Error in cleanup callback:`, e);
            }
        });
        this.callbacks = [];

        // Clear references
        this.scene = null;

        console.log(`[UIManager] Cleanup complete for ${sceneKey}`);
    }

    /**
     * Lấy số lượng resources đang theo dõi
     * @returns {Object} Resource counts
     */
    getResourceCounts() {
        return {
            elements: this.elements.length,
            events: this.events.length,
            tweens: this.tweens.length,
            timers: this.timers.length,
            callbacks: this.callbacks.length
        };
    }

    /**
     * Debug: Print thông tin resources
     */
    debug() {
        const counts = this.getResourceCounts();
        console.log(`[UIManager Debug] Resources in ${this.scene?.scene?.key || 'Unknown'}:`, counts);
    }
}
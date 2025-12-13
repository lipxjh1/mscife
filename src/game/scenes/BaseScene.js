/**
 * BaseScene - Scene base class với auto-cleanup
 * Tự động cleanup timers, events, tweens, và resources
 */
export default class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);

        // Resource tracking arrays
        this._timers = [];
        this._tweens = [];
        this._socketEvents = [];
        this._inputEvents = [];
        this._eventBusEvents = [];
        this._pointerEvents = [];
    }

    // ========== HELPER METHODS ==========

    /**
     * Tạo timer với auto-cleanup
     * @param {Object} config - Timer config
     * @returns {Phaser.Time.TimerEvent} Timer instance
     */
    addTimer(config) {
        const timer = this.time.addEvent(config);
        this._timers.push(timer);
        return timer;
    }

    /**
     * Tạo delayedCall với auto-cleanup
     * @param {number} delay - Delay in ms
     * @param {Function} callback - Callback function
     * @param {Array} args - Arguments array
     * @param {Object} scope - Callback context
     * @returns {Phaser.Time.TimerEvent} Timer instance
     */
    addDelayedCall(delay, callback, args = [], scope = this) {
        const timer = this.time.delayedCall(delay, callback, args, scope);
        this._timers.push(timer);
        return timer;
    }

    /**
     * Tạo tween với auto-cleanup
     * @param {Object} config - Tween config
     * @returns {Phaser.Tweens.Tween} Tween instance
     */
    addTween(config) {
        const tween = this.tweens.add(config);
        if (tween) {
            this._tweens.push(tween);
        }
        return tween;
    }

    /**
     * Add input event với auto-cleanup
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @param {Object} context - Event context
     * @returns {Function} Bound callback
     */
    addInputEvent(event, callback, context = this) {
        const boundCallback = callback.bind(context);
        if (this.input) {
            this.input.on(event, boundCallback, context);
            this._inputEvents.push({ event, callback: boundCallback, context });
        }
        return boundCallback;
    }

    /**
     * Add socket event với auto-cleanup
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @param {Object} context - Event context
     * @param {Object} socketService - Socket service instance
     * @returns {Function|null} Bound callback
     */
    addSocketEvent(event, callback, context = this, socketService = null) {
        // Try to get socket service globally if not provided
        if (!socketService && typeof window !== 'undefined') {
            socketService = window.socketService;
        }

        if (!socketService?.socket) {
            console.warn(`[BaseScene] Socket service not available for event: ${event}`);
            return null;
        }

        const boundCallback = callback.bind(context);
        socketService.socket.on(event, boundCallback);
        this._socketEvents.push({ event, callback: boundCallback, socketService });
        return boundCallback;
    }

    /**
     * Add EventBus event với auto-cleanup
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @param {Object} context - Event context
     * @returns {Function} Bound callback
     */
    addEventBusEvent(event, callback, context = this) {
        // Try to get EventBus globally
        let EventBus;
        if (typeof window !== 'undefined' && window.EventBus) {
            EventBus = window.EventBus;
        } else {
            try {
                EventBus = require('../../eventBus').default;
            } catch (e) {
                console.warn(`[BaseScene] EventBus not available for event: ${event}`);
                return null;
            }
        }

        const boundCallback = callback.bind(context);
        EventBus.on(event, boundCallback);
        this._eventBusEvents.push({ event, callback: boundCallback, EventBus });
        return boundCallback;
    }

    /**
     * Add pointer event cho game objects với auto-cleanup
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @param {Object} context - Event context
     * @returns {Function} Bound callback
     */
    addPointerEvent(target, event, callback, context = this) {
        if (!target || !target.on) {
            console.warn(`[BaseScene] Invalid target for pointer event: ${event}`);
            return null;
        }

        const boundCallback = callback.bind(context);
        target.on(event, boundCallback);
        this._pointerEvents.push({ target, event, callback: boundCallback });
        return boundCallback;
    }

    // ========== CLEANUP METHODS ==========

    /**
     * Cleanup tất cả timers
     */
    cleanupTimers() {
        this._timers.forEach(timer => {
            if (timer && timer.remove) {
                timer.remove();
            }
        });
        this._timers = [];
    }

    /**
     * Cleanup tất cả tweens
     */
    cleanupTweens() {
        // Cleanup tracked tweens
        this._tweens.forEach(tween => {
            if (tween && tween.isActive && tween.isActive()) {
                tween.stop();
            }
        });
        this._tweens = [];

        // Kill all tweens in scene
        if (this.tweens) {
            this.tweens.killAll();
        }
    }

    /**
     * Cleanup input events
     */
    cleanupInputEvents() {
        this._inputEvents.forEach(({ event, callback, context }) => {
            if (this.input) {
                this.input.off(event, callback, context);
            }
        });
        this._inputEvents = [];
    }

    /**
     * Cleanup socket events
     */
    cleanupSocketEvents() {
        this._socketEvents.forEach(({ event, callback, socketService }) => {
            if (socketService?.socket) {
                socketService.socket.off(event, callback);
            }
        });
        this._socketEvents = [];
    }

    /**
     * Cleanup EventBus events
     */
    cleanupEventBusEvents() {
        this._eventBusEvents.forEach(({ event, callback, EventBus }) => {
            if (EventBus && EventBus.off) {
                EventBus.off(event, callback);
            }
        });
        this._eventBusEvents = [];
    }

    /**
     * Cleanup pointer events
     */
    cleanupPointerEvents() {
        this._pointerEvents.forEach(({ target, event, callback }) => {
            if (target && target.off) {
                target.off(event, callback);
            }
        });
        this._pointerEvents = [];
    }

    /**
     * Cleanup tất cả resources
     * Gọi trong shutdown() hoặc destroy()
     */
    cleanupAll() {
        const sceneKey = this.scene?.key || 'Unknown';
        console.log(`[${sceneKey}] Cleaning up resources...`);

        // Cleanup trong order để avoid conflicts
        this.cleanupTimers();
        this.cleanupTweens();
        this.cleanupSocketEvents();
        this.cleanupInputEvents();
        this.cleanupEventBusEvents();
        this.cleanupPointerEvents();

        // Clear any custom data
        if (this.customData) {
            this.customData = null;
        }

        console.log(`[${sceneKey}] Cleanup complete`);
    }

    // ========== LIFECYCLE METHODS ==========

    /**
     * Override này trong child class
     * Gọi super.shutdown() ở cuối
     */
    shutdown() {
        this.cleanupAll();
    }

    /**
     * Override này trong child class
     * Gọi super.destroy() ở cuối
     */
    destroy() {
        this.cleanupAll();
        super.destroy();
    }

    // ========== SAFE SCENE TRANSITION ==========

    /**
     * Chuyển scene an toàn - stop current trước
     * @param {string} sceneKey - Scene to start
     * @param {Object} data - Data to pass
     */
    safeStartScene(sceneKey, data = {}) {
        console.log(`[${this.scene?.key}] Transitioning to: ${sceneKey}`);
        this.scene.stop();
        this.scene.start(sceneKey, data);
    }

    /**
     * Launch scene (parallel) - không stop current
     * @param {string} sceneKey - Scene to launch
     * @param {Object} data - Data to pass
     */
    safeLaunchScene(sceneKey, data = {}) {
        console.log(`[${this.scene?.key}] Launching: ${sceneKey}`);
        this.scene.launch(sceneKey, data);
    }

    /**
     * Stop current scene và start new
     * @param {string} sceneKey - Scene to switch to
     * @param {Object} data - Data to pass
     */
    safeSwitchScene(sceneKey, data = {}) {
        console.log(`[${this.scene?.key}] Switching to: ${sceneKey}`);
        this.scene.switch(sceneKey, data);
    }
}
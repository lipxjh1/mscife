import { Scene } from "phaser";

export class Login extends Scene {
    constructor() {
        super("Login");
    }

    preload() {}

    create() {
        // ========== ONLY BACKGROUND CHRISTMAS THEME ==========
        this.add.image(0, 0, "login_bg").setOrigin(0);

        // ========== CLEANUP ALL DOM ELEMENTS ==========
        // Remove any existing login form DOM elements from previous renders
        this.cleanupDOMElements();

        // Emit scene ready event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit("current-scene-ready", this);
        }

        // Optional: Auto-transition to Home after showing background
        // Uncomment if you want automatic transition
        // this.time.delayedCall(3000, () => {
        //     this.scene.start("Home");
        // });
    }

    cleanupDOMElements() {
        // Remove HTML login form elements that might be injected
        const elementsToRemove = [
            '#mailInput',          // Email input
            '#passInput',          // Password input
            '#mail-form',          // Email form
            '#password-form',      // Password form
            '.login-form',         // General login forms
            '.login-container',    // Login containers
            'input[type="email"]', // Any email inputs
            'input[type="password"]', // Any password inputs
            '[id*="login"]',       // Elements with 'login' in id
            '[class*="login"]'     // Elements with 'login' in class
        ];

        // Remove all matching elements
        elementsToRemove.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.remove();
            });
        });

        // Also remove any elements created by Google Login
        const googleElements = [
            'button[googlelogin]',
            '.google-login-button',
            '#google-signin-button'
        ];

        googleElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.remove();
            });
        });
    }

    /**
     * Cleanup resources khi scene shutdown
     */
    shutdown() {
        console.log(`[${this.scene?.key || 'Login'}] Scene shutting down...`);

        // 1. Cleanup DOM elements
        this.cleanupDOMElements();

        // 2. Cleanup timers
        if (this.timers) {
            this.timers.forEach(timer => {
                if (timer && timer.remove) {
                    timer.remove();
                }
            });
            this.timers = null;
        }

        // 3. Cleanup tweens
        if (this.tweens) {
            this.tweens.killAll();
        }

        // 4. Cleanup socket events
        if (this.socketEvents && socketService?.socket) {
            this.socketEvents.forEach(({event, handler}) => {
                socketService.socket.off(event, handler);
            });
            this.socketEvents = null;
        }

        // 5. Cleanup input events
        if (this.input) {
            this.input.removeAllListeners();
        }

        console.log(`[${this.scene?.key || 'Login'}] Scene shutdown complete`);
    }
}

export default Login;
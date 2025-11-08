/**
 * EventEmitter Base Class
 *
 * Provides event handling functionality for data services
 * Uses browser's native EventTarget for performance
 */

export class EventEmitter {
    constructor() {
        this.eventTarget = new EventTarget();
    }

    /**
     * Register an event listener
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function to execute
     */
    on(eventName, callback) {
        this.eventTarget.addEventListener(eventName, callback);
    }

    /**
     * Remove an event listener
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function to remove
     */
    off(eventName, callback) {
        this.eventTarget.removeEventListener(eventName, callback);
    }

    /**
     * Emit an event
     * @param {string} eventName - Name of the event
     * @param {*} detail - Data to pass to listeners
     */
    emit(eventName, detail = null) {
        this.eventTarget.dispatchEvent(
            new CustomEvent(eventName, { detail })
        );
    }

    /**
     * Register a one-time event listener
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function to execute once
     */
    once(eventName, callback) {
        const onceCallback = (event) => {
            callback(event);
            this.off(eventName, onceCallback);
        };
        this.on(eventName, onceCallback);
    }
}

export default EventEmitter;

/**
 * Audio Utilities cho iOS và các thiết bị khác
 * Xử lý các vấn đề âm thanh phổ biến trên iOS Safari
 */

export class AudioUtils {
    /**
     * Khởi tạo audio context cho iOS
     * @param {Phaser.Scene} scene - Scene hiện tại
     */
    static initializeAudioContext(scene) {
        if (!scene || !scene.sound) {
            console.warn("AudioUtils: Scene hoặc sound không tồn tại");
            return;
        }

        // Đặt cấu hình audio
        scene.sound.pauseOnBlur = false;

        // Thêm multiple event listeners để đảm bảo audio được unlock
        const unlockAudio = () => {
            try {
                scene.sound.unlock();
                //console.log("Audio context unlocked successfully");
            } catch (error) {
                //console.warn("Failed to unlock audio context:", error);
            }
        };

        // Thêm nhiều event listeners để đảm bảo audio được unlock
        const events = [
            "pointerdown",
            "pointerup",
            "pointermove",
            "touchstart",
            "touchend",
            "touchmove",
            "keydown",
            "keyup",
        ];

        events.forEach((event) => {
            if (event.startsWith("pointer") || event.startsWith("touch")) {
                scene.input.on(event, unlockAudio, scene);
            } else if (event.startsWith("key")) {
                scene.input.keyboard.on(event, unlockAudio, scene);
            }
        });

        // Thêm gamepad events
        if (scene.input.gamepad) {
            scene.input.gamepad.on("down", unlockAudio, scene);
            scene.input.gamepad.on("up", unlockAudio, scene);
        }

        // Thêm window events
        scene.events.on("wake", unlockAudio, scene);
        scene.events.on("resume", unlockAudio, scene);

        // Thử unlock audio ngay lập tức nếu có thể
        scene.time.delayedCall(100, unlockAudio, [], scene);

        // Retry sau 1 giây
        scene.time.delayedCall(1000, unlockAudio, [], scene);

        // Retry sau 3 giây
        scene.time.delayedCall(3000, unlockAudio, [], scene);
    }

    /**
     * Tạo âm thanh với error handling
     * @param {Phaser.Scene} scene - Scene hiện tại
     * @param {string} key - Key của âm thanh
     * @param {object} config - Cấu hình âm thanh
     * @returns {Phaser.Sound.BaseSound|null} - Đối tượng âm thanh hoặc null nếu lỗi
     */
    static createSound(scene, key, config = {}) {
        try {
            const defaultConfig = {
                loop: false,
                volume: 1,
            };

            const finalConfig = { ...defaultConfig, ...config };
            const sound = scene.sound.add(key, finalConfig);

            // Thêm error handling
            sound.on("error", (error) => {
                console.warn(`Audio error for ${key}:`, error);
            });

            return sound;
        } catch (error) {
            console.warn(`Failed to create audio for ${key}:`, error);
            return null;
        }
    }

    /**
     * Phát âm thanh với retry mechanism
     * @param {Phaser.Sound.BaseSound} sound - Đối tượng âm thanh
     * @param {Phaser.Scene} scene - Scene hiện tại
     * @param {number} maxRetries - Số lần thử lại tối đa
     */
    static playSound(sound, scene, maxRetries = 3) {
        if (!sound) {
            console.warn("AudioUtils: Sound object is null");
            return;
        }

        const tryPlay = (retryCount = 0) => {
            try {
                sound.play();
            } catch (error) {
                console.warn(
                    `Failed to play sound (attempt ${retryCount + 1}):`,
                    error
                );

                if (retryCount < maxRetries) {
                    // Retry sau một khoảng thời gian ngắn
                    const delay = Math.pow(2, retryCount) * 100; // Exponential backoff
                    scene.time.delayedCall(delay, () => {
                        tryPlay(retryCount + 1);
                    });
                } else {
                    console.error("Max retries reached for playing sound");
                }
            }
        };

        tryPlay();
    }

    /**
     * Kiểm tra xem audio context đã sẵn sàng chưa
     * @param {Phaser.Scene} scene - Scene hiện tại
     * @returns {boolean} - True nếu audio context đã sẵn sàng
     */
    static isAudioReady(scene) {
        return scene && scene.sound && !scene.sound.locked;
    }

    /**
     * Đợi audio context sẵn sàng
     * @param {Phaser.Scene} scene - Scene hiện tại
     * @param {function} callback - Callback được gọi khi audio sẵn sàng
     * @param {number} timeout - Timeout trong milliseconds
     */
    static waitForAudioReady(scene, callback, timeout = 10000) {
        if (!scene || !scene.sound) {
            console.warn("AudioUtils: Scene hoặc sound không tồn tại");
            return;
        }

        if (this.isAudioReady(scene)) {
            callback();
            return;
        }

        const startTime = Date.now();

        const checkAudio = () => {
            if (this.isAudioReady(scene)) {
                callback();
                return;
            }

            if (Date.now() - startTime > timeout) {
                console.warn("AudioUtils: Timeout waiting for audio context");
                return;
            }

            scene.time.delayedCall(100, checkAudio);
        };

        // Lắng nghe sự kiện unlock
        scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
            callback();
        });

        // Bắt đầu kiểm tra
        checkAudio();
    }

    /**
     * Tạo audio pool với error handling
     * @param {Phaser.Scene} scene - Scene hiện tại
     * @param {string} key - Key của âm thanh
     * @param {number} size - Kích thước pool
     * @returns {Array} - Mảng các âm thanh
     */
    static createAudioPool(scene, key, size) {
        const pool = [];

        for (let i = 0; i < size; i++) {
            const sound = this.createSound(scene, key);
            if (sound) {
                pool.push(sound);
            }
        }

        return pool;
    }

    /**
     * Cleanup audio resources
     * @param {Phaser.Sound.BaseSound} sound - Đối tượng âm thanh
     */
    static cleanupSound(sound) {
        if (sound) {
            try {
                if (sound.isPlaying) {
                    sound.stop();
                }
                sound.destroy();
            } catch (error) {
                console.warn("Error cleaning up sound:", error);
            }
        }
    }
}

export default AudioUtils;

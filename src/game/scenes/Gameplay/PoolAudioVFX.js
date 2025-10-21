import { GetActiveAudio } from "../Manager/ManagerAudio";
import AudioUtils from "../../utils/audioUtils.js";

export default class PoolAudioVFX {
    /**
     * Constructor cho PoolAudioVFX
     * @param {Phaser.Scene} scene - Scene hiện tại
     */
    constructor(scene) {
        this.scene = scene;
        this.pools = {}; // Lưu trữ tất cả các pool âm thanh
        this.poolsConfig = {
            explosion: { key: "audio_enemy_sfx_explosion", size: 5 },
            gunner: { key: "audio_gun_shot", size: 1 },
            sniper: { key: "audio_sniper_shot", size: 1 },
            rocket: { key: "audio_rocket_shot", size: 1 },
        };
        this.isAudioReady = false;
        this.pendingPlays = [];

        // Khởi tạo audio context
        AudioUtils.initializeAudioContext(scene);

        // Khởi tạo các pool dựa trên cấu hình
        this.initializePools();
    }

    /**
     * Khởi tạo các pool âm thanh
     */
    initializePools() {
        // Chỉ khởi tạo pool khi audio context đã sẵn sàng
        if (this.scene.sound.locked) {
            this.scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                this.createAllPools();
                this.isAudioReady = true;
                this.processPendingPlays();
            });
        } else {
            this.createAllPools();
            this.isAudioReady = true;
        }
    }

    /**
     * Tạo tất cả các pool
     */
    createAllPools() {
        for (const [poolName, config] of Object.entries(this.poolsConfig)) {
            this.pools[poolName] = this.createPool(config.key, config.size);
        }
    }

    /**
     * Tạo một pool âm thanh
     * @param {string} key - Key của âm thanh
     * @param {number} size - Kích thước của pool
     * @returns {Array} - Mảng chứa các đối tượng âm thanh
     */
    createPool(key, size) {
        const pool = [];

        for (let i = 0; i < size; i++) {
            const sound = AudioUtils.createSound(this.scene, key, {
                loop: false,
                volume: 1,
            });

            if (sound) {
                sound.on("complete", () => this.release(sound)); // Khi âm thanh kết thúc, trả về pool
                pool.push(sound);
            }
        }

        return pool;
    }

    /**
     * Xử lý các âm thanh đang chờ phát
     */
    processPendingPlays() {
        while (this.pendingPlays.length > 0) {
            const { poolName, config } = this.pendingPlays.shift();
            this.play(poolName, config);
        }
    }

    /**
     * Phát âm thanh từ pool
     * @param {string} poolName - Tên của pool (ví dụ: 'explosion')
     * @param {object} config - Cấu hình tùy chọn (volume, rate, detune, etc.)
     */
    play(poolName, config = {}) {
        // Nếu audio chưa sẵn sàng, lưu vào queue
        if (!this.isAudioReady) {
            this.pendingPlays.push({ poolName, config });
            return;
        }

        const pool = this.pools[poolName];

        if (!pool) {
            console.error(
                `PoolAudioVFX: Không tìm thấy pool với tên '${poolName}'.`
            );
            return;
        }

        // Lấy một âm thanh từ pool
        let sound = pool.find((sound) => !sound.isPlaying);

        // Nếu không có âm thanh nào sẵn sàng, tái sử dụng âm thanh đầu tiên trong pool
        if (!sound) {
            console.warn(
                `PoolAudioVFX: Không còn âm thanh sẵn sàng trong pool '${poolName}'. Tái sử dụng âm thanh đầu tiên.`
            );
            sound = pool[0]; // Chọn âm thanh đầu tiên (âm thanh được tạo ra sớm nhất)
            if (sound.isPlaying) {
                sound.stop(); // Dừng âm thanh nếu nó đang phát
            }
        }

        // Áp dụng cấu hình tùy chọn
        for (const [key, value] of Object.entries(config)) {
            if (sound[key] !== undefined) {
                sound[key] = value; // Gán giá trị cấu hình
            } else {
                console.warn(
                    `PoolAudioVFX: Thuộc tính '${key}' không hợp lệ cho âm thanh.`
                );
            }
        }

        // Đảm bảo âm thanh không bị mute
        sound.setMute(!GetActiveAudio());

        // Sử dụng AudioUtils để phát âm thanh với retry mechanism
        AudioUtils.playSound(sound, this.scene, 3);
    }

    /**
     * Trả âm thanh về pool để tái sử dụng
     * @param {Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound} sound - Đối tượng âm thanh
     */
    release(sound) {
        // Reset âm thanh để tái sử dụng
        if (sound.isPlaying) {
            sound.stop();
        }

        // Đặt lại các thuộc tính mặc định
        sound.volume = 1;
        sound.rate = 1;
        sound.detune = 0;
        sound.loop = false;

        sound.setMute(!GetActiveAudio());
    }

    /**
     * Giải phóng toàn bộ pool khi không còn cần thiết
     */
    destroy() {
        for (const pool of Object.values(this.pools)) {
            pool.forEach((sound) => {
                AudioUtils.cleanupSound(sound);
            });
        }
        this.pools = {};
        this.pendingPlays = [];
    }

    /**
     * @param {object} config - Cấu hình tùy chọn (volume, rate, detune, etc.)
     */
    PlayAudioExplosion(config = {}) {
        this.play("explosion", config);
    }

    /**
     * @param {object} config - Cấu hình tùy chọn (volume, rate, detune, etc.)
     */
    PlayAudioShoot(playerRole = "", config = {}) {
        if (playerRole === "gunner") {
            this.play("gunner", config);
        } else if (playerRole === "sniper") {
            this.play("sniper", config);
        } else if (playerRole === "rocket") {
            this.play("rocket", config);
        }
    }
}


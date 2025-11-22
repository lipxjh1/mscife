export default class PoolSpriteSheet {
    constructor(scene, maxPoolSize = 50) {
        this.scene = scene;
        this.pools = {};
        this.config = {
            maxPoolSize,
            spriteSheets: {
                explosion: {
                    key: "explosion",
                    spriteKey: "enemy_fx_explosion",
                    animationKey: "explosion_fx_anim",
                },
                smokeSecond: {
                    key: "smokeSecond",
                    spriteKey: "explosion_anim",
                    animationKey: "explosion_fx_anim",
                },
            },
        };

        // Khởi tạo pool rỗng cho từng loại spritesheet
        for (const key in this.config.spriteSheets) {
            this.pools[key] = [];
        }
    }

    /**
     * Kiểm tra và tạo animation nếu chưa tồn tại.
     * @param {string} animationKey - Key của animation.
     * @param {string} spriteKey - Key của spritesheet.
     * @param {number} frameRate - Tốc độ phát animation.
     */
    ensureAnimation(animationKey, spriteKey, frameRate = 30) {
        if (!this.scene.anims.exists(animationKey)) {
            this.scene.anims.create({
                key: animationKey,
                frames: this.scene.anims.generateFrameNumbers(spriteKey, {
                    start: 0,
                    end: 9,
                }),
                frameRate,
                repeat: 0,
            });
        }
    }

    /**
     * Tạo hoặc lấy một sprite từ pool dựa trên key.
     * @param {string} key - Key của pool cần lấy sprite.
     * @param {number} x - Vị trí X của sprite.
     * @param {number} y - Vị trí Y của sprite.
     * @param {Object} options - Các tùy chọn bổ sung.
     * @returns {Phaser.GameObjects.Sprite|null} - Sprite được tạo hoặc lấy từ pool, hoặc null nếu không thành công.
     */
    create(
        key,
        x,
        y,
        { container, scale, onComplete, framerate, repeat } = {}
    ) {
        const pool = this.pools[key];
        if (!pool) {
            console.warn(`Key '${key}' không tồn tại trong pool.`);
            return null;
        }

        // Tìm sprite không hoạt động trong pool
        let sprite = pool.find((s) => !s.active);

        // Nếu không tìm thấy sprite không hoạt động và pool đã đạt giới hạn, tái sử dụng sprite đầu tiên
        if (!sprite) {
            if (pool.length >= this.config.maxPoolSize) {
                sprite = pool[0]; // Lấy sprite đầu tiên
                sprite.stop().setVisible(false).setActive(false); // Dừng và ẩn sprite
            } else {
                // Tạo sprite mới nếu pool chưa đầy
                sprite = this.scene.add.sprite(x, y, key);
                pool.push(sprite); // Thêm vào pool
            }
        }

        // Đặt lại vị trí và trạng thái của sprite
        sprite.setPosition(x, y).setVisible(true).setActive(true);

        // Thêm vào container nếu có
        container?.add(sprite);

        // Điều chỉnh tỷ lệ kích thước nếu có
        if (scale) sprite.setScale(scale);

        // Phát animation nếu có cấu hình
        const { animationKey } = this.config.spriteSheets[key];
        if (animationKey) {
            this.ensureAnimation(
                animationKey,
                this.config.spriteSheets[key].spriteKey,
                framerate
            );
            sprite.play(animationKey);
        }

        // Thiết lập callback khi animation kết thúc
        sprite.on("animationcomplete", () => {
            sprite.setActive(false).setVisible(false); // Ẩn và đánh dấu không hoạt động
            container?.remove(sprite); // Loại bỏ khỏi container nếu có
            onComplete?.(); // Gọi callback hoàn thành nếu có
        });

        return sprite;
    }

    /**
     * Xóa tất cả các sprite đang hoạt động.
     */
    clear() {
        for (const pool of Object.values(this.pools)) {
            pool.forEach((sprite) => {
                sprite.setActive(false).setVisible(false).stop();
            });
        }
    }

    /**
     * Hủy toàn bộ pool và giải phóng tài nguyên.
     */
    destroy() {
        this.clear();
        for (const pool of Object.values(this.pools)) {
            pool.forEach((sprite) => sprite.destroy());
        }
        this.pools = {};
    }

    /**
     * Tạo hiệu ứng nổ.
     * @param {number} x - Vị trí X của sprite.
     * @param {number} y - Vị trí Y của sprite.
     * @param {Object} options - Các tùy chọn bổ sung.
     * @returns {Phaser.GameObjects.Sprite|null} - Sprite được tạo hoặc lấy từ pool.
     */
    createExplosion(x, y, options = {}) {
        const { key, spriteKey, animationKey } =
            this.config.spriteSheets.explosion;

        // Đảm bảo animation đã tồn tại
        this.ensureAnimation(animationKey, spriteKey, options.frameRate ?? 30);

        // Tạo và trả về sprite hiệu ứng nổ
        return this.create(key, x, y, options);
    }
}

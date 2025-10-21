export default class PoolDamageNumber {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.pool = [];
        this.activeTexts = new Set();
        this.config = {
            maxPoolSize: config.maxPoolSize || 50,
            textStyle: config.textStyle || {
                fontFamily: "Arial",
                fontSize: "24px",
                color: "#ff0000",
                stroke: "#000",
                strokeThickness: 4,
            },
            animation: {
                distance: config.distance || 100,
                duration: config.duration || 1000,
                fadeOutDuration: config.fadeOutDuration || 500,
            },
        };
    }

    create(x, y, value, options = {}) {
        let textObject = this.pool.find((text) => !text.active);
        if (!textObject) {
            if (this.pool.length >= this.config.maxPoolSize) {
                return null;
            }
            textObject = this.scene.add.text(
                x,
                y,
                value,
                this.config.textStyle
            );
            textObject.setOrigin(0.5);
            this.pool.push(textObject);
        } else {
            textObject.setPosition(x, y);
            textObject.setText(value);
            textObject.setAlpha(1);
            textObject.setVisible(true);
        }

        textObject.active = true;
        this.activeTexts.add(textObject);

        // Khởi tạo animation
        this.animateText(textObject, options);

        return textObject;
    }

    animateText(textObject, options) {
        const animConfig = { ...this.config.animation, ...options };

        // Khởi tạo các biến trạng thái
        textObject.startTime = this.scene.time.now; // Thời điểm bắt đầu animation
        textObject.duration = animConfig.duration; // Thời gian tổng cộng của animation
        textObject.fadeOutDuration = animConfig.fadeOutDuration; // Thời gian fade-out
        textObject.startY = textObject.y; // Vị trí y ban đầu
        textObject.targetY = textObject.y - animConfig.distance; // Vị trí y mục tiêu

        // Đăng ký callback update
        this.scene.AddUpdateEvent((time, delta) => {
            this.updateTextAnimation(textObject, time, delta);
        });
    }

    updateTextAnimation(textObject, time, delta) {
        if (!textObject.active) return;

        const elapsed = time - textObject.startTime; // Thời gian đã trôi qua
        const progress = Phaser.Math.Clamp(elapsed / textObject.duration, 0, 1); // Tiến trình (0 đến 1)
        const fadeProgress = Phaser.Math.Clamp(
            (elapsed - textObject.duration * 0.5) / textObject.fadeOutDuration,
            0,
            1
        ); // Tiến trình fade-out

        // Cập nhật vị trí y
        textObject.y = Phaser.Math.Interpolation.Linear(
            [textObject.startY, textObject.targetY],
            progress
        );

        // Cập nhật alpha
        if (elapsed > textObject.duration * 0.5) {
            textObject.alpha = 1 - fadeProgress;
        }

        // Kết thúc animation khi hoàn thành
        if (elapsed >= textObject.duration + textObject.fadeOutDuration) {
            textObject.active = false;
            textObject.setVisible(false);
            this.activeTexts.delete(textObject);
            this.scene.RemoveUpdateEvent((t, d) =>
                this.updateTextAnimation(textObject, t, d)
            );
        }
    }

    clear() {
        this.activeTexts.forEach((text) => {
            text.active = false;
            text.setVisible(false);
        });
        this.activeTexts.clear();
    }

    destroy() {
        this.clear();
        this.pool.forEach((text) => {
            text.destroy();
        });
        this.pool = [];
    }
}

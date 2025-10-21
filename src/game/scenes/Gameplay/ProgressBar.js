export default class ProgressBar {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.container = scene.add.container(x, y);

        this.bg = scene.add.image(0, 0, config.bgTexture).setOrigin(0, 0.5);
        this.fill = scene.add.image(0, 0, config.fillTexture).setOrigin(0, 0.5);
        this.delayedFill = scene.add
            .image(0, 0, config.delayedFillTexture)
            .setOrigin(0, 0.5);
        this.overlay = scene.add
            .image(0, 0, config.overlayTexture)
            .setOrigin(0, 0.5);

        this.fullWidth = this.bg.width;

        const barX = -this.fullWidth / 2;
        this.bg.setX(barX);
        this.fill.setX(barX);
        this.delayedFill.setX(barX);
        this.overlay.setX(barX);

        this.container.add([this.bg, this.fill, this.delayedFill, this.overlay]);

        this.fill.setCrop(0, 0, this.fullWidth, this.fill.height);
        this.delayedFill.setCrop(0, 0, this.fullWidth, this.delayedFill.height);

        this.fillTween = null;
        this.delayedFillTween = null;

        this.valueHolder = {
            width: this.fullWidth,
        };
        this.delayedValueHolder = {
            width: this.fullWidth,
        };
    }

    update(currentValue, maxValue, useTween = true) {
        const normalizedValue = Phaser.Math.Clamp(currentValue / maxValue, 0, 1);
        const newWidth = this.fullWidth * normalizedValue;

        if (this.fillTween) this.fillTween.stop();
        if (this.delayedFillTween) this.delayedFillTween.stop();

        if (!useTween) {
            this.fill.setCrop(0, 0, newWidth, this.fill.height);
            this.delayedFill.setCrop(0, 0, newWidth, this.delayedFill.height);
            this.valueHolder.width = newWidth;
            this.delayedValueHolder.width = newWidth;
            return;
        }

        this.delayedFillTween = this.scene.tweens.add({
            targets: this.delayedValueHolder,
            width: newWidth,
            duration: 500,
            ease: "Linear",
            onUpdate: () => {
                this.delayedFill.setCrop(
                    0,
                    0,
                    this.delayedValueHolder.width,
                    this.delayedFill.height
                );
            },
        });

        this.fillTween = this.scene.tweens.add({
            targets: this.valueHolder,
            width: newWidth,
            duration: 1000,
            ease: "Linear",
            onUpdate: () => {
                this.fill.setCrop(0, 0, this.valueHolder.width, this.fill.height);
            },
        });
    }

    setVisible(isVisible) {
        this.container.setVisible(isVisible);
    }

    isVisible() {
        return this.container.visible;
    }

    destroy() {
        if (this.fillTween) this.fillTween.stop();
        if (this.delayedFillTween) this.delayedFillTween.stop();
        this.container.destroy();
    }
} 
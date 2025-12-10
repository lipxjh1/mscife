/**
 * CelebrationScreen
 * ================
 * Hiển thị màn hình chúc mừng hoành tráng khi user nạp MUSK thành công
 *
 * Features:
 * - Pháo hoa/confetti particles
 * - Animation số MUSK tăng dần
 * - Hiệu ứng glow và particle
 * - Sound effect (optional)
 *
 * @example
 * // Trong scene:
 * import { CelebrationScreen } from '../Share/CelebrationScreen';
 *
 * create() {
 *     this.celebrationScreen = new CelebrationScreen(this);
 * }
 *
 * // Khi payment thành công:
 * this.celebrationScreen.show(1000, newBalance);
 */

export class CelebrationScreen {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.particles = [];
        this.sparkles = [];
        this.isVisible = false;
        this.originalWidth = 1080;
        this.originalHeight = 1920;
    }

    /**
     * Hiển thị celebration với animation pháo hoa
     * @param {number} muskAmount - Số MUSK vừa nạp
     * @param {number} newBalance - Số dư mới sau khi nạp
     */
    show(muskAmount, newBalance) {
        if (this.isVisible) return;
        this.isVisible = true;

        const { width, height } = this.scene.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // Container chính
        this.container = this.scene.add.container(centerX, centerY);
        this.container.setDepth(1000);

        // Scale theo màn hình
        const scale = Math.min(width / this.originalWidth, height / this.originalHeight);
        this.container.setScale(scale);

        // ========== 1. OVERLAY TỐI ==========
        this.overlay = this.scene.add.rectangle(
            0, 0, width * 2, height * 2,
            0x000000, 0.8
        );
        this.overlay.setInteractive(); // Block clicks behind
        this.container.add(this.overlay);

        // ========== 2. PHÁO HOA / CONFETTI ==========
        this.createFireworks();

        // ========== 3. CARD BACKGROUND ==========
        this.card = this.scene.rexUI.add.roundRectangle(
            0, 0, 700, 500, 30,
            0x1a1a2e, 1
        );
        this.card.setStrokeStyle(4, 0xffd700);
        this.container.add(this.card);

        // Glow effect cho card
        this.card.postFX.addGlow(0xffd700, 4, 0, false, 0.1, 32);

        // ========== 4. ICON CONGRATULATIONS ==========
        this.congratsIcon = this.scene.add.text(0, -180, '🎉', {
            fontSize: '80px',
            fontFamily: 'Arial',
        }).setOrigin(0.5);
        this.container.add(this.congratsIcon);

        // Animation bounce cho icon
        this.scene.tweens.add({
            targets: this.congratsIcon,
            scale: { from: 0, to: 1.2 },
            duration: 600,
            ease: 'Back.easeOut',
            yoyo: true,
            repeat: -1,
            repeatDelay: 2000,
        });

        // ========== 5. TITLE "CONGRATULATIONS!" ==========
        this.title = this.scene.add.text(0, -100, 'CONGRATULATIONS!', {
            fontSize: '42px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);
        this.container.add(this.title);

        // ========== 6. MUSK AMOUNT (SỐ LỚN) ==========
        this.muskText = this.scene.add.text(0, -30, `+${muskAmount.toLocaleString()}`, {
            fontSize: '72px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffd700', // Gold
            stroke: '#b8860b',
            strokeThickness: 6,
        }).setOrigin(0.5);
        this.container.add(this.muskText);

        // Glow effect cho số MUSK
        this.muskText.setShadow(0, 0, '#ffd700', 20, true, true);

        // Animation count up
        this.animateCountUp(muskAmount);

        // ========== 7. "MUSK" LABEL ==========
        this.muskLabel = this.scene.add.text(0, 30, 'MUSK', {
            fontSize: '36px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffd700',
        }).setOrigin(0.5);
        this.container.add(this.muskLabel);

        // ========== 8. COIN ICON XOAY ==========
        // Tạo coin icon đơn giản bằng text nếu không có sprite
        this.coinIcon = this.scene.add.text(0, 30, '🪙', {
            fontSize: '40px',
        }).setOrigin(0.5);
        this.coinIcon.setX(-100); // Đặt bên trái text MUSK
        this.container.add(this.coinIcon);

        // Animation xoay và pulse cho coin
        this.scene.tweens.add({
            targets: this.coinIcon,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear',
        });

        this.scene.tweens.add({
            targets: this.coinIcon,
            scale: { from: 1, to: 1.2 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ========== 9. SUB TEXT ==========
        this.subText = this.scene.add.text(0, 80, 'credited to your account', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#aaaaaa',
        }).setOrigin(0.5);
        this.container.add(this.subText);

        // ========== 10. NEW BALANCE ==========
        this.balanceText = this.scene.add.text(0, 120, `New Balance: ${newBalance.toLocaleString()} MUSK`, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888',
        }).setOrigin(0.5);
        this.container.add(this.balanceText);

        // ========== 11. BUTTON "AWESOME!" ==========
        this.createButton();

        // ========== 12. ANIMATION ENTRANCE ==========
        this.container.setAlpha(0);
        this.container.setScale(0.3);

        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            scale: scale,
            duration: 600,
            ease: 'Back.easeOut',
        });

        // ========== 13. PARTICLES XUNG QUANH ==========
        this.createSurroundingParticles();

        // ========== 14. SOUND EFFECT ==========
        this.playCelebrationSound();
    }

    /**
     * Tạo pháo hoa particles
     */
    createFireworks() {
        const { width, height } = this.scene.cameras.main;
        const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0xa855f7, 0x22c55e, 0xf97316];

        colors.forEach((color, index) => {
            this.scene.time.delayedCall(index * 300, () => {
                this.createConfettiEmitter(color);
            });
        });
    }

    /**
     * Confetti emitter
     */
    createConfettiEmitter(color) {
        const { width, height } = this.scene.cameras.main;
        const x = Phaser.Math.Between(width * 0.2, width * 0.8);

        // Tạo graphics cho particle
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, 15, 15);
        graphics.generateTexture(`confetti_${color}`, 15, 15);
        graphics.destroy();

        // Particle emitter từ dưới lên
        const particles = this.scene.add.particles(x, height + 100, `confetti_${color}`, {
            speed: { min: 300, max: 500 },
            angle: { min: 240, max: 300 },
            scale: { start: 1, end: 0 },
            lifespan: 4000,
            gravityY: 300,
            rotate: { min: 0, max: 360 },
            quantity: 5,
            frequency: 80,
            blendMode: 'ADD',
        });

        particles.setDepth(999);
        this.particles.push(particles);

        // Dừng sau 4 giây
        this.scene.time.delayedCall(4000, () => {
            particles.stop();
            this.scene.time.delayedCall(4000, () => {
                particles.destroy();
            });
        });
    }

    /**
     * Tạo sparkle particles xung quanh card
     */
    createSurroundingParticles() {
        for (let i = 0; i < 20; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const angle = Phaser.Math.Between(0, 360);
                const distance = Phaser.Math.Between(300, 400);
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                const sparkle = this.scene.add.circle(x, y, Phaser.Math.Between(3, 8), 0xffffff);
                sparkle.setAlpha(0);
                sparkle.setDepth(998);
                sparkle.setBlendMode('ADD');

                // Animation sparkle
                this.scene.tweens.add({
                    targets: sparkle,
                    alpha: { from: 0, to: 1 },
                    scale: { from: 0, to: Phaser.Math.FloatBetween(1, 2) },
                    duration: 500,
                    ease: 'Quad.easeOut',
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: sparkle,
                            alpha: 0,
                            scale: 0,
                            duration: 1000,
                            ease: 'Quad.easeIn',
                            onComplete: () => sparkle.destroy(),
                        });
                    },
                });

                this.sparkles.push(sparkle);
            });
        }
    }

    /**
     * Animation đếm số tăng dần
     */
    animateCountUp(targetAmount) {
        let currentAmount = 0;
        const duration = 2000; // 2 giây
        const steps = 40;
        const increment = targetAmount / steps;
        const stepDuration = duration / steps;

        const timer = this.scene.time.addEvent({
            delay: stepDuration,
            repeat: steps - 1,
            callback: () => {
                currentAmount += increment;
                if (currentAmount >= targetAmount) {
                    currentAmount = targetAmount;
                }
                this.muskText.setText(`+${Math.floor(currentAmount).toLocaleString()}`);

                // Scale pulse mỗi step
                this.scene.tweens.add({
                    targets: this.muskText,
                    scale: { from: 1.1, to: 1 },
                    duration: 100,
                    ease: 'Quad.easeOut',
                });

                // Glow effect mỗi khi đạt target
                if (currentAmount >= targetAmount) {
                    this.muskText.setShadow(0, 0, '#ffd700', 30, true, true);
                    this.scene.tweens.add({
                        targets: this.muskText,
                        scale: 1.2,
                        duration: 200,
                        yoyo: true,
                        ease: 'Quad.easeInOut',
                    });
                }
            },
        });
    }

    /**
     * Tạo button Awesome
     */
    createButton() {
        // Button background với gradient effect
        this.buttonBg = this.scene.rexUI.add.roundRectangle(
            0, 200, 250, 70, 35,
            0xffd700, 1
        );
        this.container.add(this.buttonBg);

        // Button text
        this.buttonText = this.scene.add.text(0, 200, '✨ Awesome! ✨', {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#1a1a2e',
        }).setOrigin(0.5);
        this.container.add(this.buttonText);

        // Interactive zone
        this.buttonZone = this.scene.add.zone(0, 200, 250, 70);
        this.buttonZone.setInteractive({ useHandCursor: true });
        this.container.add(this.buttonZone);

        // Hover effects
        this.buttonZone.on('pointerover', () => {
            this.scene.tweens.add({
                targets: [this.buttonBg, this.buttonText],
                scale: 1.1,
                duration: 150,
                ease: 'Quad.easeOut',
            });

            // Stronger glow on hover
            this.buttonBg.postFX.clear();
            this.buttonBg.postFX.addGlow(0xffd700, 8, 0, false, 0.1, 32);
        });

        this.buttonZone.on('pointerout', () => {
            this.scene.tweens.add({
                targets: [this.buttonBg, this.buttonText],
                scale: 1,
                duration: 150,
                ease: 'Quad.easeOut',
            });

            // Normal glow
            this.buttonBg.postFX.clear();
            this.buttonBg.postFX.addGlow(0xffd700, 4, 0, false, 0.1, 32);
        });

        this.buttonZone.on('pointerdown', () => {
            // Click effect
            this.scene.tweens.add({
                targets: [this.buttonBg, this.buttonText],
                scale: 0.95,
                duration: 50,
                yoyo: true,
                ease: 'Quad.easeOut',
                onComplete: () => this.hide(),
            });
        });

        // Pulse animation
        this.scene.tweens.add({
            targets: this.buttonBg,
            alpha: { from: 1, to: 0.7 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    /**
     * Phát sound effect chúc mừng
     */
    playCelebrationSound() {
        // Phát celebration sound chính
        if (this.scene.cache.audio.exists('celebration_sound')) {
            const celebrationSound = this.scene.sound.play('celebration_sound', {
                volume: 0.7,
                loop: false
            });
        } else if (this.scene.cache.audio.exists('success_sound')) {
            // Fallback to success sound
            this.scene.sound.play('success_sound', { volume: 0.7 });
        }

        // Phát coin sound khi hiển thị số MUSK (delay 0.5s)
        this.scene.time.delayedCall(500, () => {
            if (this.scene.cache.audio.exists('coin_sound')) {
                this.scene.sound.play('coin_sound', {
                    volume: 0.6,
                    loop: false
                });
            }
        });
    }

    /**
     * Ẩn celebration screen
     */
    hide() {
        if (!this.isVisible) return;

        // Cleanup particles trước khi đóng
        this.cleanupParticles();

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            scale: 0.3,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.destroy();
                this.isVisible = false;

                // Emit event để scene biết đã đóng
                this.scene.events.emit('CELEBRATION_CLOSED');
            },
        });
    }

    /**
     * Cleanup particles
     */
    cleanupParticles() {
        // Dừng và destroy tất cả particles
        this.particles.forEach(particles => {
            if (particles && particles.active) {
                particles.stop();
                particles.destroy();
            }
        });
        this.particles = [];

        // Destroy sparkles
        this.sparkles.forEach(sparkle => {
            if (sparkle && sparkle.active) {
                sparkle.destroy();
            }
        });
        this.sparkles = [];
    }

    /**
     * Destroy toàn bộ
     */
    destroy() {
        this.cleanupParticles();

        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}

// Export default
export default CelebrationScreen;
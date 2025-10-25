import { Scene } from "phaser";

import { CreateTopBarNotice } from "./Home/HomeTopBarPlayer.js";

import { CreateCurrencyBar } from "./Home/HomeTopBarPlayer.js";

import { CreatePlayerBar } from "./Home/HomeTopBarPlayer.js";

import { CreateLobby } from "./Home/HomeLobby.js";

import centerData from "../Data/CenterData.js";
import { CreateFirstMissions } from "./Home/HomeFirstMissions.js";
import { CreateAudioBackground } from "./Manager/ManagerAudio.js";
import { CreateGuidePlay } from "./Guide/GuidePlay.js";

export class Home extends Scene {
    constructor() {
        super("Home");

        this.socketInited = false;

        this.currentEnemyIndex = -1;
    }

    preload() {}

    create() {
        this.loadGameplayScenes();

        //console.log("Home");

        // // Lắng nghe sự kiện BLUR
        // this.game.events.addListener(Phaser.Core.Events.BLUR, () => {
        //     console.log('Trò chơi mất focus (chuyển sang tab khác hoặc thu nhỏ)!');
        //     // Bạn có thể thêm logic tạm dừng tùy chỉnh ở đây nếu cần,
        //     // nhưng Phaser thường đã xử lý tạm dừng vòng lặp chính.
        //     // Ví dụ: dừng âm thanh, hiển thị thông báo "Paused"
        // });

        // // Lắng nghe sự kiện FOCUS
        // this.game.events.addListener(Phaser.Core.Events.FOCUS, () => {
        //     console.log('Trò chơi lấy lại focus (quay lại tab)!');
        //     // Bạn có thể thêm logic tiếp tục tùy chỉnh ở đây nếu cần.
        //     // Ví dụ: tiếp tục âm thanh, ẩn thông báo "Paused"
        // });

        // Xử lý âm thanh cho iOS và các thiết bị khác
        this.setupAudio();

        CreateTopBarNotice(this);
        CreatePlayerBar(this);
        CreateCurrencyBar(this);
        CreateLobby(this);

        if (centerData.userInfo.CurrentStage === 6) {
            //CreateFirstMissions(this);
        }

        this.UpdateUserInfo();

        centerData.RequestMuskRate(
            (result) => {},
            (error) => {}
        );

        centerData.RequestDailyCheckin(
            (result) => {},
            (error) => {}
        );

        //centerData.RequestGetNFTCharacterIds();

        this.time.addEvent({
            delay: 10000, // 1 giây (1000ms)
            callback: () => {
                this.UpdateUserInfo();
            }, // Hàm được gọi mỗi lần lặp
            callbackScope: this,
            loop: true, // Đặt thành true để vòng lặp liên tục
        });

        //Tạo mask cho ảnh và di chuyển

        // // Bán kính và tâm của vòng tròn
        // this.radius = 150;
        // this.centerX = 400;
        // this.centerY = 300;

        // this.container = this.add.container(this.centerX, this.centerY);

        // // Thêm hình ảnh vào scene
        // this.image = this.add
        //     .image(0, 0, "home_lobby_btn_daily")
        //     .setOrigin(0.5);

        // this.container.add(this.image);

        // // Khởi tạo đối tượng Graphics để làm mask
        // this.maskGraphics = this.make.graphics();
        // this.container.add(this.maskGraphics);
        // this.maskGraphics.setVisible(false);

        // // Góc bắt đầu và kết thúc
        // this.startAngle = 0; // Bắt đầu từ 0 độ
        // this.endAngle = 0; // Kết thúc tại 0 độ (sẽ được tween)

        // // Tạo mask từ đối tượng Graphics
        // const mask = this.maskGraphics.createGeometryMask();
        // this.container.setMask(mask); // Gắn mask vào hình ảnh

        // // Tạo tween để tăng góc kết thúc từ 0 đến 360
        // this.tweens.add({
        //     targets: this, // Đối tượng cần tween
        //     endAngle: 360, // Giá trị mục tiêu
        //     duration: 3000, // Thời gian tween (3 giây)
        //     ease: "Linear", // Hiệu ứng easing (tuyến tính)
        //     onUpdate: () => {
        //         // Mỗi khi tween cập nhật, vẽ lại mask
        //         this.redrawMask();
        //     },
        //     onComplete: () => {
        //         console.log("Fill effect completed!");
        //     },
        // });

        // // Di chuyển container sau 3 giây
        // this.time.delayedCall(1000, () => {
        //     this.tweens.add({
        //         targets: this.container,
        //         x: 600, // Di chuyển container đến vị trí mới
        //         y: 400,
        //         duration: 2000,
        //         ease: "Power2",
        //     });
        // });

        this.game.events.addListener(
            Phaser.Core.Events.FOCUS,
            this._onFocus,
            this
        );
        this.game.events.addListener(
            Phaser.Core.Events.BLUR,
            this._onBlur,
            this
        );

        CreateGuidePlay(this);
    }

    _onFocus() {
        console.log("Home Scene đã được tiếp tục.");
    }

    _onBlur() {
        console.log("Home Scene đã bị tạm dừng.");
    }

    loadGameplayScenes() {
        if (!this.scene.manager.getScene("Gameplay")) {
            import("./Gameplay.js")
                .then((module) => {
                    // Try both default and named export
                    const GameplayScene = module.default || module.Gameplay;

                    if (GameplayScene && typeof GameplayScene === "function") {
                        this.scene.add("Gameplay", GameplayScene);
                    } else {
                        throw new Error(
                            "Invalid Gameplay scene module structure"
                        );
                    }
                })
                .catch((error) => {
                    console.error("Failed to load Gameplay scene:", error);
                });
        }

        if (!this.scene.manager.getScene("GameplayBoss")) {
            import("./GameplayBoss.js")
                .then((module) => {
                    // Try both default and named export
                    const GameplayBossScene =
                        module.default || module.GameplayBoss;

                    if (
                        GameplayBossScene &&
                        typeof GameplayBossScene === "function"
                    ) {
                        this.scene.add("GameplayBoss", GameplayBossScene);
                    } else {
                        throw new Error(
                            "Invalid GameplayBoss scene module structure"
                        );
                    }
                })
                .catch((error) => {
                    console.error("Failed to load GameplayBoss scene:", error);
                });
        }

        if (!this.scene.manager.getScene("GameplayTest")) {
            import("./GameplayTest.js")
                .then((module) => {
                    // Try both default and named export
                    const GameplayTestScene =
                        module.default || module.GameplayTest;

                    if (
                        GameplayTestScene &&
                        typeof GameplayTestScene === "function"
                    ) {
                        this.scene.add("GameplayTest", GameplayTestScene);
                    } else {
                        throw new Error(
                            "Invalid GameplayTest scene module structure"
                        );
                    }
                })
                .catch((error) => {
                    console.error("Failed to load GameplayTest scene:", error);
                });
        }

        if (!this.scene.manager.getScene("GameplayMultiplayerBoss")) {
            import("./GameplayMultiplayerBoss.js")
                .then((module) => {
                    // Try both default and named export
                    const GameplayMultiplayerBossScene =
                        module.default || module.GameplayMultiplayerBoss;

                    if (
                        GameplayMultiplayerBossScene &&
                        typeof GameplayMultiplayerBossScene === "function"
                    ) {
                        this.scene.add(
                            "GameplayMultiplayerBoss",
                            GameplayMultiplayerBossScene
                        );
                    } else {
                        throw new Error(
                            "Invalid GameplayMultiplayerBoss scene module structure"
                        );
                    }
                })
                .catch((error) => {
                    console.error(
                        "Failed to load GameplayMultiplayerBoss scene:",
                        error
                    );
                });
        }
    }

    setupAudio() {
        this.sound.pauseOnBlur = false;

        // Thêm multiple event listeners để đảm bảo audio được unlock
        const unlockAudio = () => {
            try {
                this.sound.unlock();

                if (!this.sound.locked) {
                    CreateAudioBackground(this);
                } else {
                    // IF Not wait on unlock event
                    this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                        CreateAudioBackground(this);
                    });
                }
            } catch (error) {
                console.warn("Failed to unlock audio:", error);
            }
        };

        // Thêm nhiều event listeners để đảm bảo audio được unlock
        this.input.on("pointerdown", unlockAudio, this);
        this.input.on("pointerup", unlockAudio, this);
        this.input.on("pointermove", unlockAudio, this);

        // Thêm touch events cho mobile
        this.input.on("touchstart", unlockAudio, this);
        this.input.on("touchend", unlockAudio, this);
        this.input.on("touchmove", unlockAudio, this);

        // Thêm keyboard events
        this.input.keyboard.on("keydown", unlockAudio, this);
        this.input.keyboard.on("keyup", unlockAudio, this);

        // Thêm gamepad events (kiểm tra trước khi sử dụng)
        if (this.input.gamepad) {
            this.input.gamepad.on("down", unlockAudio, this);
            this.input.gamepad.on("up", unlockAudio, this);
        }

        // Thêm window events
        this.events.on("wake", unlockAudio, this);
        this.events.on("resume", unlockAudio, this);

        // Thử unlock audio ngay lập tức nếu có thể
        this.time.delayedCall(100, unlockAudio, [], this);

        // Retry sau 1 giây
        this.time.delayedCall(1000, unlockAudio, [], this);

        // Retry sau 3 giây
        this.time.delayedCall(3000, unlockAudio, [], this);
    }

    redrawMask() {
        // Xóa nội dung trước đó
        this.maskGraphics.clear();

        // Vẽ cung tròn với góc hiện tại
        this.maskGraphics.fillStyle(0xffffff, 1); // Màu trắng (độ trong suốt không quan trọng)
        this.maskGraphics.slice(
            this.container.x, // Tâm X
            this.container.y, // Tâm Y
            this.radius, // Bán kính
            Phaser.Math.DegToRad(this.startAngle), // Góc bắt đầu (radian)
            Phaser.Math.DegToRad(this.endAngle), // Góc kết thúc (radian)
            false // Vẽ ngược chiều kim đồng hồ
        );
        this.maskGraphics.fillPath(); // Áp dụng fill
    }

    // Gọi khi scene tạm thời bị shutdown (ví dụ khi chuyển scene)
    shutdown() {
        // Dọn dẹp resources, unsubscribe events...
    }

    // Gọi khi scene bị destroy hoàn toàn
    destroy() {
        // Dọn dẹp hoàn toàn, destroy objects...
    }

    UpdateUserInfo() {
        centerData.RequestUserInfo();

        centerData.RequestVipStatus();

        centerData.RequestChipDailyRewards();
    }
}

export default Home;

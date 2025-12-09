import { Scene } from "phaser";
import { CreateAudioBackground } from "./Manager/ManagerAudio.js";
import centerData from "../Data/CenterData.js";
import { socketService } from "../socket.js";
import { socketServiceBoss } from "../socketBoss.js";
import { socketServiceMultiplayerBoss } from "../socketMultiplayerBoss.js";
import { socketServiceChatGuild } from "../socketChatGuild.js";
import cdLocalization from "../Data/CenterDataLocalization.js";
import { isTelegramMiniApp } from "../utils.js";
import { initPhaserImageBridge } from "./Share/PhaserImageBridge.js";

const url_r2 = import.meta.env.VITE_ASSETS_BASE_URL || "https://cdn.m-sci.net/";

//const url_r2 = "";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
        this.container_main = null;
        this.container_bg = null;
        this.container_info = null;
    }

    init() {
        this.setupContainers();
        this.setupLoadingUI();
        console.log("Preloader");
    }

    setupContainers() {
        this.container_main = this.add.container(0, 0);
        this.container_main.setDepth(0);

        this.container_bg = this.add.container(0, 0);
        this.container_main.add(this.container_bg);
        this.container_bg.setDepth(0);

        this.container_info = this.add.container(0, 0);
        this.container_main.add(this.container_info);
        this.container_info.setDepth(1);

        const bg = this.add.image(0, 0, "load_bg").setOrigin(0);
        this.container_bg.add(bg);
    }

    setupLoadingUI() {
        // Đặt thời gian tối thiểu là 0.25 giây
        this.minLoadTime = 250;
        this.startTime = this.time.now;

        const text_loading = (this.loadingText = this.add
            .text(window.originWidth / 2, 1739, "", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "48px",
                color: "#ffffff",
            })
            .setOrigin(0.5));
        this.container_info.add(text_loading);

        let loadStr = cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.Preload.KEY,
            "Loading"
        );

        //loadStr = "Server under maintenance";

        // Mảng các trạng thái của chữ "loading" với dấu chấm tăng dần
        const loadingStates = [`${loadStr}.`, `${loadStr}..`, `${loadStr}...`];
        let currentState = 0;

        // Tạo sự kiện lặp lại mỗi 250ms để thay đổi văn bản
        this.time.addEvent({
            delay: 250,
            loop: true,
            callback: () => {
                this.loadingText.setText(loadingStates[currentState]);
                currentState = (currentState + 1) % loadingStates.length;
            },
        });

        // Setup loading circle animation
        this.setupLoadingCircle(this);
    }

    setupLoadingCircle(scene) {
        const bg = scene.add
            .image(540, 1386, "load_loading_circle_bg")
            .setOrigin(0.5, 0.5);
        this.container_info.add(bg);

        const circle = scene.add
            .image(540, 1386, "load_loading_circle")
            .setOrigin(0.5, 0.5);
        this.container_info.add(circle);

        // Thêm tween xoay tròn liên tục cho vòng tròn loading
        scene.tweens.add({
            targets: circle,
            angle: { from: 0, to: 360 },
            duration: 1000,
            ease: "Linear",
            repeat: -1,
        });

        const text_process = scene.add
            .text(540, 1386, "0%", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "48px",
                color: "#8CFFF9",
            })
            .setOrigin(0.5);
        this.container_info.add(text_process);
        this.loadingPercentText = text_process;
    }

    preload() {
        CreateAudioBackground(this);
        CreatePlayerDictionary();

        // Preload character card images để tránh race condition khi render cards
        // Fix: Cards render trước khi lazy load assets → missing images
        console.log('[Preloader] Loading character card images...');
        let cardCount = 0;
        Object.entries(playerSpineDictionary).forEach(([charName, charData]) => {
            if (charData.UICardInventory && charData.UICardInventory.key) {
                this.load.image(
                    charData.UICardInventory.key,
                    charData.UICardInventory.url
                );
                cardCount++;
            }
        });
        console.log(`[Preloader] Queued ${cardCount} character card images for preload`);

        this.load.on("progress", (value) => {
            const percent = Math.floor(value * 100);
            if (this.loadingPercentText) {
                this.loadingPercentText.setText(percent + "%");
            }
        });

        this.load.once("complete", () => {
            if (this.loadingPercentText) {
                this.loadingPercentText.setText("100%");
            }
        });

        this.loadInitialAssets();
    }

    loadInitialAssets() {
        LoadShare(this);
        LoadShareCharacterCard(this);
        LoadShareItemCard(this);
        LoadShareRewardPopup(this);
        LoadLogin(this);
        LoadHome(this);
    }

    create() {
        this.setupEventListeners();
        this.initializeGame();
    }

    setupEventListeners() {
        window.addEventListener(
            "mousemove",
            () => (centerData.isTouch = false)
        );
        window.addEventListener(
            "touchstart",
            () => (centerData.isTouch = true)
        );
    }

    initializeGame() {
        const startGameWithCheck = async () => {
            //this.LoginTelegram(this);

            // Check World App FIRST
            if (typeof window !== 'undefined' && window.MiniKit && window.MiniKit.isInstalled()) {
                console.log("🚀 World App detected, loading Login for walletAuth...");
                this.loadLoginScene();
                return;
            }

            if (await isTelegramMiniApp()) {
                console.log("Running in Telegram Mini App.");
                this.LoginTelegram(this);
            } else {
                console.log("Not a Telegram Mini App, starting Login scene.");

                this.loadLoginScene();
            }
        };
        // Đảm bảo DOM đã load xong trước khi check
        if (document.readyState === "complete") {
            startGameWithCheck();
        } else {
            window.addEventListener("load", startGameWithCheck);
        }
    }

    loadLoginScene() {
        console.log("Loading Login scene...");

        import("./Login.js")
            .then((module) => {
                // Try both default and named export
                const LoginScene = module.default || module.Login;

                if (LoginScene && typeof LoginScene === "function") {
                    console.log("Login scene loaded successfully");
                    this.scene.add("Login", LoginScene);
                    this.scene.start("Login");
                } else {
                    throw new Error("Invalid Login scene module structure");
                }
            })
            .catch((error) => {
                console.error("Failed to load Login scene:", error);
            });
    }

    LoginTelegram(scene) {
        centerData.RequestLoginTelegram(
            (result) => {
                InitSocket();

                centerData.RequestUpdateWallet(
                    centerData.GetWalletAddress(),
                    () => this.GetPlayerInfo(scene),
                    (error) =>
                        console.log(
                            "LoginTelegram update wallet failed:",
                            error.message
                        )
                );
            },
            (error) => console.log("Login failed:", error)
        );
    }

    GetPlayerInfo(scene) {
        centerData.RequestUserInfo(
            (result) => {
                import("./Home.js")
                    .then((module) => {
                        // Try both default and named export
                        const HomeScene = module.default || module.Home;

                        if (HomeScene && typeof HomeScene === "function") {
                            console.log("Home scene loaded successfully");
                            this.scene.add("Home", HomeScene);
                            this.scene.start("Home");
                        } else {
                            throw new Error(
                                "Invalid Home scene module structure"
                            );
                        }
                    })
                    .catch((error) => {
                        console.error("Failed to load Home scene:", error);
                    });
            },
            (error) => console.log("Get user info failed:", error)
        );
    }

    loadHomeSceneDirectly() {
        console.log("Loading Home scene directly for World App user...");

        // Initialize socket connections first
        InitSocket();

        // Update wallet
        centerData.RequestUpdateWallet(
            centerData.GetWalletAddress(),
            () => {
                // Load Home scene
                import("./Home.js")
                    .then((module) => {
                        const HomeScene = module.default || module.Home;

                        if (HomeScene && typeof HomeScene === "function") {
                            console.log("Home scene loaded successfully");
                            this.scene.add("Home", HomeScene);
                            this.scene.start("Home");
                        } else {
                            throw new Error(
                                "Invalid Home scene module structure"
                            );
                        }
                    })
                    .catch((error) => {
                        console.error("Failed to load Home scene:", error);
                        // Fallback to Login scene if Home fails
                        this.loadLoginScene();
                    });
            },
            (error) => {
                console.error("Failed to update wallet:", error);
                // Still try to load Home scene even if wallet update fails
                this.GetPlayerInfo(this);
            }
        );
    }
}

function InitSocket() {
    socketService.connectSocket();
    socketServiceBoss.connectSocket();
    socketServiceMultiplayerBoss.connectSocket();
    //socketServiceChatGuild.connectSocket();
}

export function LoadPreloader(scene) {
    scene.load.image("load_bg", url_r2 + "assets/load/load_bg.webp");
    scene.load.image(
        "load_slider_bg",
        url_r2 + "assets/load/load_slider_bg.webp"
    );
    scene.load.image(
        "load_slider_fill",
        url_r2 + "assets/load/load_slider_fill.webp"
    );

    scene.load.image(
        "load_loading_circle_bg",
        url_r2 + "assets/load/load_loading_circle_bg.webp"
    );

    scene.load.image(
        "load_loading_circle",
        url_r2 + "assets/load/load_loading_circle.webp"
    );

    //Load audio

    //load background music
    scene.load.audio(
        "audio_background",
        url_r2 + "assets/audio/audio_background/audio_background.mp3"
    );

    //load player sfx
    scene.load.audio(
        "audio_gun_shot",
        url_r2 + "assets/audio/audio_gun/audio_gun_shot.wav"
    );

    //load player sfx
    scene.load.audio(
        "audio_sniper_shot",
        url_r2 + "assets/audio/audio_gun/audio_sniper_shot.wav"
    );

    //load player sfx
    scene.load.audio(
        "audio_rocket_shot",
        url_r2 + "assets/audio/audio_gun/audio_rocket_shot.wav"
    );

    //load enemy sfx
    scene.load.audio(
        "audio_enemy_sfx_explosion",
        url_r2 +
            "assets/audio/audio_enemy/audio_enemy_sfx/audio_enemy_sfx_explosion.mp3"
    );

    //load player voice
    scene.load.audio(
        "player_0_voice",
        url_r2 + "assets/audio/audio_player/audio_player_0/player_0_voice.mp3"
    );
}

export function LoadShare(scene) {
    // v2

    //load buttons

    scene.load.image(
        "share_btn_home_2",
        url_r2 + "assets/share_2/share_btn_home_2.webp"
    );

    scene.load.image(
        "share_btn_back",
        url_r2 + "assets/share_2/share_btn_back.webp"
    );

    //load share alert popup
    scene.load.image(
        "share_popup_alert_bg",
        url_r2 + "assets/share_2/share_popup_alert/share_popup_alert_bg.webp"
    );

    scene.load.image(
        "share_popup_alert_btn",
        url_r2 + "assets/share_2/share_popup_alert/share_popup_alert_btn.webp"
    );

    //load share input popup
    scene.load.image(
        "share_popup_input_bg",
        url_r2 + "assets/share_2/share_popup_input/share_popup_input_bg.webp"
    );

    scene.load.image(
        "share_popup_input_bg_2",
        url_r2 + "assets/share_2/share_popup_input/share_popup_input_bg_2.webp"
    );

    scene.load.image(
        "share_popup_buy_bg",
        url_r2 + "assets/share_2/share_popup_input/share_popup_buy_bg.webp"
    );

    scene.load.image(
        "share_popup_input_btn",
        url_r2 + "assets/share_2/share_popup_input/share_popup_input_btn.webp"
    );

    scene.load.image(
        "share_popup_input_btn_1",
        url_r2 + "assets/share_2/share_popup_input/share_popup_input_btn_1.webp"
    );

    scene.load.image(
        "share_popup_invite_select_popup_bg",
        url_r2 +
            "assets/share_2/share_popup_input/share_popup_invite_select_popup_bg.webp"
    );

    scene.load.image(
        "share_popup_invite_select_popup_btn",
        url_r2 +
            "assets/share_2/share_popup_input/share_popup_invite_select_popup_btn.webp"
    );

    scene.load.image(
        "share_btn_signin_google",
        url_r2 + "assets/share_2/share_btn_signin_google.webp"
    );

    // Khởi tạo bridge để React có thể sử dụng các hình ảnh đã load
    scene.load.once("complete", () => {
        initPhaserImageBridge(scene);
    });
}

export function LoadShareRewardPopup(scene) {
    //load buttons
    scene.load.image(
        "share_popup_reward_btn_claim",
        url_r2 +
            "assets/share_2/share_popup_reward/share_popup_reward_btn_claim.webp"
    );
}

export function LoadLogin(scene) {
    //Load player bar
    scene.load.image("login_bg", url_r2 + "assets/login/login_bg.webp");

    scene.load.image("login_btn_0", url_r2 + "assets/login/login_btn_0.webp");

    scene.load.image("login_btn_1", url_r2 + "assets/login/login_btn_1.webp");

    scene.load.image("login_btn_3", url_r2 + "assets/login/login_btn_3.webp");

    // NEW: Load Vorld logo for login button
    scene.load.image("vorld_logo", url_r2 + "icons/vorld.webp");
}

export function LoadHome(scene) {
    LoadPlayerBar(scene);

    LoadPlayerCurrency(scene);

    LoadLobby(scene);

    LoadVip(scene);
}

export function LoadGameplay(scene) {
    scene.load.image(
        "gameplay_enemy_attack_warning",
        url_r2 + "assets/gameplay/gameplay_enemy_attack_warning.webp"
    );
    //Crosshair
    scene.load.image(
        "player_crosshair_gunner",
        url_r2 + "assets/gameplay/player/player_crosshair_gunner.webp"
    );
    scene.load.image(
        "player_crosshair_rocket",
        url_r2 + "assets/gameplay/player/player_crosshair_rocket.webp"
    );
    scene.load.image(
        "player_crosshair_sniper",
        url_r2 + "assets/gameplay/player/player_crosshair_sniper.webp"
    );
    scene.load.image(
        "player_shield",
        url_r2 + "assets/gameplay/player/player_shield.webp"
    );
    scene.load.image(
        "skill_shoot_all",
        url_r2 + "assets/gameplay/skill_shoot_all.webp"
    );
    scene.load.image(
        "skill_invisible_all",
        url_r2 + "assets/gameplay/skill_invisible_all.webp"
    );
    LoadGameplayTopBar(scene);
    LoadGameplaySelector(scene);
    LoadGameplayBottomBar(scene);
    LoadGameplayGameOver(scene);
    // Đã bỏ LoadMap(scene) khỏi đây
    // Bỏ LoadEnemy(scene) để tối ưu hóa việc tải tài nguyên
}

// Tách riêng việc tải UI của gameplay (top bar, bottom bar, selector, game over)
export function LoadGameplayUI(scene) {
    scene.load.image(
        "gameplay_enemy_attack_warning",
        url_r2 + "assets/gameplay/gameplay_enemy_attack_warning.webp"
    );
    //Crosshair
    scene.load.image(
        "player_crosshair_gunner",
        url_r2 + "assets/gameplay/player/player_crosshair_gunner.webp"
    );
    scene.load.image(
        "player_crosshair_rocket",
        url_r2 + "assets/gameplay/player/player_crosshair_rocket.webp"
    );
    scene.load.image(
        "player_crosshair_sniper",
        url_r2 + "assets/gameplay/player/player_crosshair_sniper.webp"
    );
    scene.load.image(
        "player_shield",
        url_r2 + "assets/gameplay/player/player_shield.webp"
    );
    scene.load.image(
        "skill_shoot_all",
        url_r2 + "assets/gameplay/skill_shoot_all.webp"
    );
    scene.load.image(
        "skill_invisible_all",
        url_r2 + "assets/gameplay/skill_invisible_all.webp"
    );

    LoadGameplayTopBar(scene);
    LoadGameplaySelector(scene);
    LoadGameplayBottomBar(scene);
    LoadGameplayGameOver(scene);

    // Tải sprite sheets dùng chung cho các hiệu ứng
    scene.load.spritesheet(
        "enemy_fx_strike_anim",
        url_r2 + "assets/gameplay/enemy/enemy_fx/enemy_fx_strike_anim.webp",
        {
            frameWidth: 500,
            frameHeight: 500,
        }
    );

    scene.load.spritesheet(
        "enemy_fx_explosion",
        url_r2 + "assets/gameplay/enemy/enemy_fx/enemy_fx_explosion.webp",
        {
            frameWidth: 140,
            frameHeight: 180,
        }
    );

    scene.load.image(
        "enemy_fx_shield",
        url_r2 + "assets/gameplay/enemy/enemy_fx/enemy_fx_shield.webp"
    );

    // Tải reward items
    scene.load.image(
        "home_battle_item_reward_bg",
        url_r2 + "assets/home_2/home_battle/home_battle_item_reward_bg.webp"
    );

    scene.load.image(
        "home_battle_item_bg_campain_evolve",
        url_r2 +
            "assets/home_2/home_battle/home_battle_item_bg_campain_evolve.webp"
    );
}

// Tải assets enemy dựa trên range (earth, space, mars)
export function LoadEnemyByRange(scene, enemyRange) {
    switch (enemyRange) {
        case "earth": // Stage 1-20
            // Tải normal enemy 0-1 và drone 0-2
            scene.load.spine(
                "gameplay_enemy_0",
                url_r2 + "assets/gameplay/enemy/enemy_0/enemy_0.json",
                url_r2 + "assets/gameplay/enemy/enemy_0/enemy_0.atlas",
                true
            );
            scene.load.spine(
                "gameplay_enemy_1",
                url_r2 + "assets/gameplay/enemy/enemy_1/enemy_1.json",
                url_r2 + "assets/gameplay/enemy/enemy_1/enemy_1.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_0",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_1",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_2",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.atlas",
                true
            );
            break;

        case "space": // Stage 21-40
            // Tải normal enemy 1-2 và drone 3-5
            scene.load.spine(
                "gameplay_enemy_1",
                url_r2 + "assets/gameplay/enemy/enemy_1/enemy_1.json",
                url_r2 + "assets/gameplay/enemy/enemy_1/enemy_1.atlas",
                true
            );
            scene.load.spine(
                "gameplay_enemy_2",
                url_r2 + "assets/gameplay/enemy/enemy_2/play_drone_0.json",
                url_r2 + "assets/gameplay/enemy/enemy_2/play_drone_0.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_3",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_3/play_drone_2.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_3/play_drone_2.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_4",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_4/play_drone_3.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_4/play_drone_3.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_5",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_5/play_drone_4.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_5/play_drone_4.atlas",
                true
            );
            break;

        case "mars": // Stage 41-60
            scene.load.spine(
                "enemy_drone_0",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_1",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_2",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.atlas",
                true
            );
            scene.load.spine(
                "enemy_ghost_0",
                url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.json",
                url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.atlas",
                true
            );
            break;

        case "BOSS_001":
            scene.load.spine(
                "enemy_drone_0",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_1",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_2",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.atlas",
                true
            );
            scene.load.spine(
                "enemy_ghost_0",
                url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.json",
                url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.atlas",
                true
            );
            break;

        case "BOSS_002":
            scene.load.spine(
                "enemy_drone_0",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_1",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_2",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.atlas",
                true
            );
            scene.load.spine(
                "enemy_ghost_0",
                url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.json",
                url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.atlas",
                true
            );
            break;

        case "BOSS_003":
            scene.load.spine(
                "enemy_drone_0",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_0/play_drone_2.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_1",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_1/play_drone_3.atlas",
                true
            );
            scene.load.spine(
                "enemy_drone_2",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.json",
                url_r2 +
                    "assets/gameplay/enemy/enemy_drone_2/play_drone_4.atlas",
                true
            );
            scene.load.spine(
                "enemy_ghost_0",
                url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.json",
                url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.atlas",
                true
            );
            break;

        default:
            console.log(
                "[LoadEnemyByRange] Enemy range không hợp lệ:",
                enemyRange
            );
            break;
    }
}

// Tải assets cho Boss Game
export function LoadBossAssets(scene) {
    // Tải boss map
    scene.load.image(
        "map_boss_0_bg",
        url_r2 + "assets/gameplay/map/map_boss_0/map_boss_0_bg.webp"
    );
    scene.load.image(
        "map_boss_0_obstacle_0_wall",
        url_r2 +
            "assets/gameplay/map/map_boss_0/map_boss_0_obstacle_0_wall.webp"
    );

    // Tải boss enemies
    scene.load.spine(
        "gameplay_enemy_boss_0",
        url_r2 + "assets/gameplay/enemy/enemy_boss_0/enemy_elite_1.json",
        url_r2 + "assets/gameplay/enemy/enemy_boss_0/enemy_elite_1.atlas",
        true
    );

    scene.load.spine(
        "gameplay_enemy_boss_1",
        url_r2 + "assets/gameplay/enemy/enemy_boss_1/player_19.json",
        url_r2 + "assets/gameplay/enemy/enemy_boss_1/player_19.atlas",
        true
    );

    scene.load.image(
        "gameplay_enemy_boss_2",
        url_r2 + "assets/gameplay/enemy/enemy_boss_2/gameplay_enemy_boss_2.webp"
    );

    // Tải elite enemies
    scene.load.image(
        "gameplay_enemy_elite_0",
        url_r2 +
            "assets/gameplay/enemy/enemy_elite_0/gameplay_enemy_elite_0.webp"
    );

    scene.load.image(
        "gameplay_enemy_elite_1",
        url_r2 +
            "assets/gameplay/enemy/enemy_elite_1/gameplay_enemy_elite_1.webp"
    );

    scene.load.image(
        "gameplay_enemy_elite_2",
        url_r2 +
            "assets/gameplay/enemy/enemy_elite_2/gameplay_enemy_elite_2.webp"
    );

    // BỔ SUNG: Tải asset spine cho drone boss (fix lỗi skeletonData null)
    scene.load.spine(
        "enemy_drone_0",
        url_r2 + "assets/gameplay/enemy/enemy_drone_0/play_drone_2.json",
        url_r2 + "assets/gameplay/enemy/enemy_drone_0/play_drone_2.atlas",
        true
    );
    scene.load.spine(
        "enemy_drone_1",
        url_r2 + "assets/gameplay/enemy/enemy_drone_1/play_drone_3.json",
        url_r2 + "assets/gameplay/enemy/enemy_drone_1/play_drone_3.atlas",
        true
    );
    scene.load.spine(
        "enemy_drone_2",
        url_r2 + "assets/gameplay/enemy/enemy_drone_2/play_drone_4.json",
        url_r2 + "assets/gameplay/enemy/enemy_drone_2/play_drone_4.atlas",
        true
    );
}

export function LoadPlayerBar(scene) {
    //load player bar

    scene.load.image(
        "home_top_bar_player_bg",
        url_r2 + "assets/home_2/home_top_bar_player/home_top_bar_player_bg.webp"
    );

    scene.load.image(
        "home_top_bar_player_avatar",
        url_r2 +
            "assets/home_2/home_top_bar_player/home_top_bar_player_avatar.webp"
    );
}

export function LoadPlayerCurrency(scene) {
    //Load player currency

    scene.load.image(
        "home_top_currency_bg",
        url_r2 + "assets/home_2/home_top_currency/home_top_currency_bg.webp"
    );
    scene.load.image(
        "home_top_currency_chip_1",
        url_r2 + "assets/home_2/home_top_currency/home_top_currency_chip_1.webp"
    );
    scene.load.image(
        "home_top_currency_chip_2",
        url_r2 + "assets/home_2/home_top_currency/home_top_currency_chip_2.webp"
    );
}

export function LoadReward(scene) {
    //load reward
    scene.load.image(
        "home_reward_btn_mission",
        url_r2 + "assets/home_2/home_reward/home_reward_btn_mission.webp"
    );

    scene.load.image(
        "home_reward_btn_achivement",
        url_r2 + "assets/home_2/home_reward/home_reward_btn_achivement.webp"
    );

    scene.load.image(
        "home_reward_btn_airdrop",
        url_r2 + "assets/home_2/home_reward/home_reward_btn_airdrop.webp"
    );

    scene.load.image(
        "home_reward_cat_button",
        url_r2 + "assets/home_2/home_reward/home_reward_cat_button.webp"
    );

    scene.load.image(
        "home_reward_btn_go",
        url_r2 + "assets/home_2/home_reward/home_reward_btn_go.webp"
    );

    scene.load.image(
        "home_reward_btn_claim",
        url_r2 + "assets/home_2/home_reward/home_reward_btn_claim.webp"
    );

    scene.load.image(
        "home_reward_btn_invite",
        url_r2 + "assets/home_2/home_reward/home_reward_btn_invite.webp"
    );

    scene.load.image(
        "home_reward_btn_invite_link",
        url_r2 + "assets/home_2/home_reward/home_reward_btn_invite_link.webp"
    );

    scene.load.image(
        "home_reward_btn_locked",
        url_r2 + "assets/home_2/home_reward/home_reward_btn_locked.webp"
    );

    scene.load.image(
        "home_reward_btn_unlocked",
        url_r2 + "assets/home_2/home_reward/home_reward_btn_unlocked.webp"
    );

    scene.load.image(
        "home_reward_item_bg",
        url_r2 + "assets/home_2/home_reward/home_reward_item_bg.webp"
    );

    scene.load.image(
        "home_reward_checked",
        url_r2 + "assets/home_2/home_reward/home_reward_checked.webp"
    );

    //load airdrop

    scene.load.image(
        "home_reward_airdrop_thanks_bg",
        url_r2 + "assets/home_2/home_reward/home_reward_airdrop_thanks_bg.webp"
    );

    scene.load.image(
        "home_reward_airdrop_icon_hamster_kombat",
        url_r2 +
            "assets/home_2/home_reward/home_reward_airdrop_icon_hamster_kombat.webp"
    );

    scene.load.image(
        "home_reward_airdrop_icon_dogs",
        url_r2 + "assets/home_2/home_reward/home_reward_airdrop_icon_dogs.webp"
    );

    scene.load.image(
        "home_reward_airdrop_icon_x",
        url_r2 + "assets/home_2/home_reward/home_reward_airdrop_icon_x.webp"
    );

    scene.load.image(
        "home_reward_airdrop_icon_seed",
        url_r2 + "assets/home_2/home_reward/home_reward_airdrop_icon_seed.webp"
    );

    scene.load.image(
        "home_reward_airdrop_icon_pi",
        url_r2 + "assets/home_2/home_reward/home_reward_airdrop_icon_pi.webp"
    );

    // load airdrop buttons
    scene.load.image(
        "home_reward_airdrop_btn_claim_0",
        url_r2 +
            "assets/home_2/home_reward/home_reward_airdrop_btn_claim_0.webp"
    );
    scene.load.image(
        "home_reward_airdrop_btn_claim_1",
        url_r2 +
            "assets/home_2/home_reward/home_reward_airdrop_btn_claim_1.webp"
    );
}

export function LoadGacha(scene) {
    // v2

    scene.load.image(
        "home_gacha_bg",
        url_r2 + "assets/home_2/home_gacha/home_gacha_bg.webp"
    );

    // load title
    scene.load.image(
        "home_gacha_mode_title",
        url_r2 + "assets/home_2/home_gacha/home_gacha_mode_title.webp"
    );

    //load buttons
    scene.load.image(
        "home_gacha_btn_buy_character_box",
        url_r2 +
            "assets/home_2/home_gacha/home_gacha_btn_buy_character_box.webp"
    );

    scene.load.image(
        "home_gacha_btn_buy_character_piece_box",
        url_r2 +
            "assets/home_2/home_gacha/home_gacha_btn_buy_character_piece_box.webp"
    );

    scene.load.image(
        "home_gacha_btn_recuit_1",
        url_r2 + "assets/home_2/home_gacha/home_gacha_btn_recuit_1.webp"
    );

    scene.load.image(
        "home_gacha_btn_spin_1",
        url_r2 + "assets/home_2/home_gacha/home_gacha_btn_spin_1.webp"
    );

    //load character

    scene.load.image(
        "home_gacha_char_david",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_david.webp"
    );

    scene.load.image(
        "home_gacha_char_henry",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_henry.webp"
    );

    scene.load.image(
        "home_gacha_char_marcus",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_marcus.webp"
    );

    scene.load.image(
        "home_gacha_char_anna",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_anna.webp"
    );

    scene.load.image(
        "home_gacha_char_julia",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_julia.webp"
    );

    scene.load.image(
        "home_gacha_char_fiona",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_fiona.webp"
    );

    scene.load.image(
        "home_gacha_char_victoria",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_victoria.webp"
    );

    scene.load.image(
        "home_gacha_char_elizabeth",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_elizabeth.webp"
    );

    scene.load.image(
        "home_gacha_char_alexandra",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_alexandra.webp"
    );

    scene.load.image(
        "home_gacha_char_akane",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_akane.webp"
    );

    scene.load.image(
        "home_gacha_char_alice",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_alice.webp"
    );

    scene.load.image(
        "home_gacha_char_caitlyn",
        url_r2 + "assets/home_2/home_gacha/home_gacha_char_caitlyn.webp"
    );
}

export function LoadShopInventory(scene) {
    //console.log("LoadShopInventory");

    scene.load.image(
        "home_inventory_shop_item_bg",
        url_r2 +
            "assets/home_2/home_inventory_shop/home_inventory_shop_item_bg.webp"
    );

    scene.load.spine(
        "x_force_box",
        url_r2 + "assets/home_2/home_inventory_shop/x_force_box.json",
        url_r2 + "assets/home_2/home_inventory_shop/x_force_box.atlas",
        true
    );
}

export function LoadCenterMarket(scene) {
    //console.log("LoadCenterMarket");

    scene.load.image(
        "home_center_market_bg",
        url_r2 + "assets/home_2/home_center_market/home_center_market_bg.webp"
    );

    scene.load.image(
        "center_market_cat_button",
        url_r2 +
            "assets/home_2/home_center_market/center_market_cat_button.webp"
    );

    scene.load.image(
        "center_market_menu_button",
        url_r2 +
            "assets/home_2/home_center_market/center_market_menu_button.webp"
    );

    scene.load.image(
        "home_center_market_button_0",
        url_r2 +
            "assets/home_2/home_center_market/home_center_market_button_0.webp"
    );

    scene.load.image(
        "home_center_market_button_0_2",
        url_r2 +
            "assets/home_2/home_center_market/home_center_market_button_0_2.webp"
    );

    scene.load.image(
        "home_center_market_button_0_3",
        url_r2 +
            "assets/home_2/home_center_market/home_center_market_button_0_3.webp"
    );

    scene.load.image(
        "center_market_character_fill",
        url_r2 +
            "assets/home_2/home_center_market/center_market_character_fill.webp"
    );

    scene.load.image(
        "home_center_market_main_element_bg",
        url_r2 +
            "assets/home_2/home_center_market/home_center_market_main_element_bg.webp"
    );

    scene.load.image(
        "home_center_market_item_bg",
        url_r2 +
            "assets/home_2/home_center_market/home_center_market_item_bg.webp"
    );

    scene.load.image(
        "home_center_market_price_element_bg",
        url_r2 +
            "assets/home_2/home_center_market/home_center_market_price_element_bg.webp"
    );

    scene.load.image(
        "home_center_market_price_element_bg_2",
        url_r2 +
            "assets/home_2/home_center_market/home_center_market_price_element_bg_2.webp"
    );

    scene.load.image(
        "home_center_market_button_1",
        url_r2 +
            "assets/home_2/home_center_market/home_center_market_button_1.webp"
    );

    scene.load.image(
        "home_center_market_button_2",
        url_r2 +
            "assets/home_2/home_center_market/home_center_market_button_2.webp"
    );

    scene.load.image(
        "center_market_order_cat_button",
        url_r2 +
            "assets/home_2/home_center_market/center_market_order_cat_button.webp"
    );

    scene.load.image(
        "center_market_order_history_button",
        url_r2 +
            "assets/home_2/home_center_market/center_market_order_history_button.webp"
    );
}

export function LoadNotification(scene) {
    //v2
    scene.load.image(
        "home_notification_bg",
        url_r2 + "assets/home_2/home_notification/home_notification_bg.webp"
    );

    scene.load.image(
        "home_notification_title",
        url_r2 + "assets/home_2/home_notification/home_notification_title.webp"
    );

    scene.load.image(
        "home_notification_item_btn_claim",
        url_r2 +
            "assets/home_2/home_notification/home_notification_item_btn_claim.webp"
    );

    scene.load.image(
        "home_notification_item_btn_read",
        url_r2 +
            "assets/home_2/home_notification/home_notification_item_btn_read.webp"
    );

    scene.load.image(
        "home_notification_item_checked",
        url_r2 +
            "assets/home_2/home_notification/home_notification_item_checked.webp"
    );

    scene.load.image(
        "home_notification_item_reward_bg",
        url_r2 +
            "assets/home_2/home_notification/home_notification_item_reward_bg.webp"
    );
}

export function LoadLanguage(scene) {
    //v2
    scene.load.image(
        "home_language_bg",
        url_r2 + "assets/home_2/home_language/home_language_bg.webp"
    );

    scene.load.image(
        "home_language_tick",
        url_r2 + "assets/home_2/home_language/home_language_tick.webp"
    );

    scene.load.image(
        "home_language_en",
        url_r2 + "assets/home_2/home_language/home_language_en.webp"
    );

    scene.load.image(
        "home_language_vi",
        url_r2 + "assets/home_2/home_language/home_language_vi.webp"
    );

    scene.load.image(
        "home_language_ru",
        url_r2 + "assets/home_2/home_language/home_language_ru.webp"
    );

    scene.load.image(
        "home_language_cn",
        url_r2 + "assets/home_2/home_language/home_language_cn.webp"
    );

    scene.load.image(
        "home_language_jp",
        url_r2 + "assets/home_2/home_language/home_language_jp.webp"
    );

    scene.load.image(
        "home_language_kr",
        url_r2 + "assets/home_2/home_language/home_language_kr.webp"
    );

    scene.load.image(
        "home_language_in",
        url_r2 + "assets/home_2/home_language/home_language_in.webp"
    );

    scene.load.image(
        "home_language_de",
        url_r2 + "assets/home_2/home_language/home_language_de.webp"
    );
}

export function LoadDaily(scene) {
    //v2
    scene.load.image(
        "home_daily_bg",
        url_r2 + "assets/home_2/home_daily/home_daily_bg.webp"
    );

    scene.load.image(
        "home_daily_btn_close",
        url_r2 + "assets/home_2/home_daily/home_daily_btn_close.webp"
    );

    scene.load.image(
        "home_daily_item_btn_check",
        url_r2 + "assets/home_2/home_daily/home_daily_item_btn_check.webp"
    );

    scene.load.image(
        "home_daily_item_checked",
        url_r2 + "assets/home_2/home_daily/home_daily_item_checked.webp"
    );

    scene.load.image(
        "home_daily_item_reward_bg",
        url_r2 + "assets/home_2/home_daily/home_daily_item_reward_bg.webp"
    );
}

export function LoadHomeBattle(scene) {
    //v2

    //load buttons
    scene.load.image(
        "home_battle_btn",
        url_r2 + "assets/home_2/home_battle/home_battle_btn.webp"
    );

    scene.load.image(
        "home_battle_btn_replay",
        url_r2 + "assets/home_2/home_battle/home_battle_btn_replay.webp"
    );

    scene.load.image(
        "home_battle_btn_lock",
        url_r2 + "assets/home_2/home_battle/home_battle_btn_lock.webp"
    );

    scene.load.image(
        "home_battle_top_icon",
        url_r2 + "assets/home_2/home_battle/home_battle_top_icon.webp"
    );

    //load battle
    scene.load.image(
        "home_battle_btn_battle",
        url_r2 + "assets/home_2/home_battle/home_battle_btn_battle.webp"
    );

    scene.load.image(
        "home_battle_item_bg_campain",
        url_r2 + "assets/home_2/home_battle/home_battle_item_bg_campain.webp"
    );

    scene.load.image(
        "home_battle_item_bg_boss",
        url_r2 + "assets/home_2/home_battle/home_battle_item_bg_boss.webp"
    );

    //load campain
    scene.load.image(
        "home_battle_campaign_bg",
        url_r2 + "assets/home_2/home_battle/home_battle_campaign_bg.webp"
    );

    scene.load.image(
        "home_battle_item_bg_campain_earth",
        url_r2 +
            "assets/home_2/home_battle/home_battle_item_bg_campain_earth.webp"
    );

    scene.load.image(
        "home_battle_item_bg_campain_space",
        url_r2 +
            "assets/home_2/home_battle/home_battle_item_bg_campain_space.webp"
    );

    scene.load.image(
        "home_battle_item_bg_campain_back_to_earth",
        url_r2 +
            "assets/home_2/home_battle/home_battle_item_bg_campain_back_to_earth.webp"
    );

    scene.load.image(
        "home_battle_item_bg_campain_xcorp",
        url_r2 +
            "assets/home_2/home_battle/home_battle_item_bg_campain_xcorp.webp"
    );

    scene.load.image(
        "home_battle_item_bg_campain_mars",
        url_r2 +
            "assets/home_2/home_battle/home_battle_item_bg_campain_mars.webp"
    );

    //load multiplayer
    scene.load.image(
        "home_battle_multiplayer_bg",
        url_r2 + "assets/home_2/home_battle/home_battle_multiplayer_bg.webp"
    );

    //load boss
    scene.load.image(
        "home_battle_btn_boss",
        url_r2 + "assets/home_2/home_battle/home_battle_btn_boss.webp"
    );

    //load reward item
    scene.load.image(
        "home_battle_item_reward_bg",
        url_r2 + "assets/home_2/home_battle/home_battle_item_reward_bg.webp"
    );

    //play test
    scene.load.image(
        "home_battle_item_bg_campain_evolve",
        url_r2 +
            "assets/home_2/home_battle/home_battle_item_bg_campain_evolve.webp"
    );
}

export function LoadHomeBattleMultiplayer(scene) {
    //load bg
    scene.load.image(
        "home_battle_multiplayer_room_bg",
        url_r2 +
            "assets/home_2/home_battle_multiplayer/home_battle_multiplayer_room_bg.webp"
    );

    //load buttons
    scene.load.image(
        "home_battle_multiplayer_btn_play",
        url_r2 +
            "assets/home_2/home_battle_multiplayer/home_battle_multiplayer_btn_play.webp"
    );

    scene.load.image(
        "home_battle_multiplayer_btn_0",
        url_r2 +
            "assets/home_2/home_battle_multiplayer/home_battle_multiplayer_btn_0.webp"
    );

    scene.load.image(
        "home_battle_multiplayer_btn_1",
        url_r2 +
            "assets/home_2/home_battle_multiplayer/home_battle_multiplayer_btn_1.webp"
    );

    //load list
    scene.load.image(
        "home_battle_multiplayer_list_item_bg",
        url_r2 +
            "assets/home_2/home_battle_multiplayer/home_battle_multiplayer_list_item_bg.webp"
    );
}

export function LoadCharacterInventory(scene) {
    //v2

    scene.load.image(
        "home_character_team_bg",
        url_r2 + "assets/home_2/home_character/home_character_team_bg.webp"
    );

    scene.load.image(
        "home_character_team_filter_bg",
        url_r2 +
            "assets/home_2/home_character/home_character_team_filter_bg.webp"
    );

    scene.load.image(
        "home_character_btn_team",
        url_r2 + "assets/home_2/home_character/home_character_btn_team.webp"
    );

    scene.load.image(
        "home_character_btn_piece",
        url_r2 + "assets/home_2/home_character/home_character_btn_piece.webp"
    );

    scene.load.image(
        "home_character_btn_playtest",
        url_r2 + "assets/home_2/home_character/home_character_btn_playtest.webp"
    );

    scene.load.image(
        "home_character_btn_evolvetest",
        url_r2 +
            "assets/home_2/home_character/home_character_btn_evolvetest.webp"
    );

    scene.load.image(
        "home_character_btn_upstartest",
        url_r2 +
            "assets/home_2/home_character/home_character_btn_upstartest.webp"
    );

    //load filter buttons
    scene.load.image(
        "home_character_filter_btn_c",
        url_r2 + "assets/home_2/home_character/home_character_filter_btn_c.webp"
    );

    scene.load.image(
        "home_character_filter_btn_c_d",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_c_d.webp"
    );

    scene.load.image(
        "home_character_filter_btn_b",
        url_r2 + "assets/home_2/home_character/home_character_filter_btn_b.webp"
    );

    scene.load.image(
        "home_character_filter_btn_b_d",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_b_d.webp"
    );

    scene.load.image(
        "home_character_filter_btn_a",
        url_r2 + "assets/home_2/home_character/home_character_filter_btn_a.webp"
    );

    scene.load.image(
        "home_character_filter_btn_a_d",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_a_d.webp"
    );

    scene.load.image(
        "home_character_filter_btn_s",
        url_r2 + "assets/home_2/home_character/home_character_filter_btn_s.webp"
    );

    scene.load.image(
        "home_character_filter_btn_s_d",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_s_d.webp"
    );

    scene.load.image(
        "home_character_filter_btn_ss",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_ss.webp"
    );

    scene.load.image(
        "home_character_filter_btn_ss_d",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_ss_d.webp"
    );

    scene.load.image(
        "home_character_filter_btn_star_1",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_star_1.webp"
    );

    scene.load.image(
        "home_character_filter_btn_star_1_d",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_star_1_d.webp"
    );

    scene.load.image(
        "home_character_filter_btn_star_2",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_star_2.webp"
    );

    scene.load.image(
        "home_character_filter_btn_star_2_d",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_star_2_d.webp"
    );

    scene.load.image(
        "home_character_filter_btn_star_3",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_star_3.webp"
    );

    scene.load.image(
        "home_character_filter_btn_star_3_d",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_star_3_d.webp"
    );

    scene.load.image(
        "home_character_filter_btn_star_4",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_star_4.webp"
    );

    scene.load.image(
        "home_character_filter_btn_star_4_d",
        url_r2 +
            "assets/home_2/home_character/home_character_filter_btn_star_4_d.webp"
    );

    //load card options

    scene.load.image(
        "home_character_option_up",
        url_r2 + "assets/home_2/home_character/home_character_option_up.webp"
    );

    scene.load.image(
        "home_character_option_btn_0",
        url_r2 + "assets/home_2/home_character/home_character_option_btn_0.webp"
    );

    scene.load.image(
        "home_character_option_btn_0_red",
        url_r2 +
            "assets/home_2/home_character/home_character_option_btn_0_red.webp"
    );

    scene.load.image(
        "home_character_option_btn_1",
        url_r2 + "assets/home_2/home_character/home_character_option_btn_1.webp"
    );

    scene.load.image(
        "home_character_option_btn_1_green",
        url_r2 +
            "assets/home_2/home_character/home_character_option_btn_1_green.webp"
    );

    //load extract
    scene.load.image(
        "home_character_extract_bg",
        url_r2 + "assets/home_2/home_character/home_character_extract_bg.webp"
    );

    scene.load.image(
        "home_character_extract_btn_cancel",
        url_r2 +
            "assets/home_2/home_character/home_character_extract_btn_cancel.webp"
    );

    scene.load.image(
        "home_character_extract_btn_extract",
        url_r2 +
            "assets/home_2/home_character/home_character_extract_btn_extract.webp"
    );

    //load upgrade

    scene.load.image(
        "home_character_upgrade_bg",
        url_r2 + "assets/home_2/home_character/home_character_upgrade_bg.webp"
    );

    scene.load.image(
        "home_character_upgrade_popup_bg",
        url_r2 +
            "assets/home_2/home_character/home_character_upgrade_popup_bg.webp"
    );

    scene.load.image(
        "home_character_upgrade_select_btn",
        url_r2 +
            "assets/home_2/home_character/home_character_upgrade_select_btn.webp"
    );

    scene.load.image(
        "home_character_upgrade_btn_cancel",
        url_r2 +
            "assets/home_2/home_character/home_character_upgrade_btn_cancel.webp"
    );

    scene.load.image(
        "home_character_upgrade_btn_select",
        url_r2 +
            "assets/home_2/home_character/home_character_upgrade_btn_select.webp"
    );

    scene.load.image(
        "home_character_upgrade_btn_upgrade",
        url_r2 +
            "assets/home_2/home_character/home_character_upgrade_btn_upgrade.webp"
    );

    scene.load.image(
        "home_character_upgrade_tick",
        url_r2 + "assets/home_2/home_character/home_character_upgrade_tick.webp"
    );

    //load piece

    scene.load.image(
        "home_character_piece_bg",
        url_r2 + "assets/home_2/home_character/home_character_piece_bg.webp"
    );

    scene.load.image(
        "home_character_piece_item_bg",
        url_r2 +
            "assets/home_2/home_character/home_character_piece_item_bg.webp"
    );

    scene.load.image(
        "home_character_piece_item_btn_craft",
        url_r2 +
            "assets/home_2/home_character/home_character_piece_item_btn_craft.webp"
    );
}

export function LoadShareItemCard(scene) {
    scene.load.image(
        "share_item_card_bg",
        url_r2 + "assets/share_2/share_item_card/share_item_card_bg.webp"
    );

    scene.load.image(
        "share_item_card_bg_2",
        url_r2 + "assets/share_2/share_item_card/share_item_card_bg_2.webp"
    );
}

export function LoadShareCharacterCard(scene) {
    //v2

    scene.load.image(
        "share_character_card_bg",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_bg.webp"
    );

    scene.load.image(
        "share_character_card_name_bg",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_name_bg.webp"
    );

    scene.load.image(
        "share_character_card_star",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_star.webp"
    );

    scene.load.image(
        "share_character_card_tick_selected",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_tick_selected.webp"
    );

    // role

    scene.load.image(
        "share_character_card_role_gunner",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_gunner.webp"
    );

    scene.load.image(
        "share_character_card_role_sniper",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_sniper.webp"
    );

    scene.load.image(
        "share_character_card_role_rocket",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_rocket.webp"
    );

    //load role c
    scene.load.image(
        "share_character_card_role_gunner_c",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_gunner_c.webp"
    );

    scene.load.image(
        "share_character_card_role_sniper_c",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_sniper_c.webp"
    );

    scene.load.image(
        "share_character_card_role_rocket_c",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_rocket_c.webp"
    );

    //load role b
    scene.load.image(
        "share_character_card_role_gunner_b",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_gunner_b.webp"
    );

    scene.load.image(
        "share_character_card_role_sniper_b",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_sniper_b.webp"
    );

    scene.load.image(
        "share_character_card_role_rocket_b",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_rocket_b.webp"
    );

    //load role a
    scene.load.image(
        "share_character_card_role_gunner_a",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_gunner_a.webp"
    );

    scene.load.image(
        "share_character_card_role_sniper_a",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_sniper_a.webp"
    );

    scene.load.image(
        "share_character_card_role_rocket_a",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_rocket_a.webp"
    );

    //load role s
    scene.load.image(
        "share_character_card_role_gunner_s",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_gunner_s.webp"
    );

    scene.load.image(
        "share_character_card_role_sniper_s",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_sniper_s.webp"
    );

    scene.load.image(
        "share_character_card_role_rocket_s",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_rocket_s.webp"
    );

    //load role ss
    scene.load.image(
        "share_character_card_role_gunner_ss",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_gunner_ss.webp"
    );

    scene.load.image(
        "share_character_card_role_sniper_ss",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_sniper_ss.webp"
    );

    scene.load.image(
        "share_character_card_role_rocket_ss",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_role_rocket_ss.webp"
    );

    //frame 0

    scene.load.image(
        "share_character_card_frame_0_c",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_0_c.webp"
    );

    scene.load.image(
        "share_character_card_frame_0_b",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_0_b.webp"
    );

    scene.load.image(
        "share_character_card_frame_0_a",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_0_a.webp"
    );

    scene.load.image(
        "share_character_card_frame_0_s",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_0_s.webp"
    );

    scene.load.image(
        "share_character_card_frame_0_ss",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_0_ss.webp"
    );

    //frame 1

    scene.load.image(
        "share_character_card_frame_1_c",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_1_c.webp"
    );

    scene.load.image(
        "share_character_card_frame_1_b",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_1_b.webp"
    );

    scene.load.image(
        "share_character_card_frame_1_a",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_1_a.webp"
    );

    scene.load.image(
        "share_character_card_frame_1_s",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_1_s.webp"
    );

    scene.load.image(
        "share_character_card_frame_1_ss",
        url_r2 +
            "assets/share_2/share_character_card/share_character_card_frame_1_ss.webp"
    );
}

export function LoadEarn(scene) {
    // v2

    scene.load.image(
        "home_earn_bg",
        url_r2 + "assets/home_2/home_earn/home_earn_bg.webp"
    );

    scene.load.image(
        "home_earn_btn_mint",
        url_r2 + "assets/home_2/home_earn/home_earn_btn_mint.webp"
    );

    scene.load.image(
        "home_earn_cat_button",
        url_r2 + "assets/home_2/home_earn/home_earn_cat_button.webp"
    );

    scene.load.image(
        "home_earn_btn_wallet",
        url_r2 + "assets/home_2/home_earn/home_earn_btn_wallet.webp"
    );

    scene.load.image(
        "home_earn_wallet_icon_0",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_icon_0.webp"
    );

    scene.load.image(
        "home_earn_wallet_icon_1",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_icon_1.webp"
    );

    scene.load.image(
        "home_earn_wallet_icon_2",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_icon_2.webp"
    );

    scene.load.image(
        "home_earn_wallet_icon_3",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_icon_3.webp"
    );

    scene.load.image(
        "home_earn_wallet_icon_4",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_icon_4.webp"
    );

    scene.load.image(
        "home_earn_wallet_icon_5",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_icon_5.webp"
    );

    scene.load.image(
        "home_earn_wallet_label_0",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_label_0.webp"
    );

    scene.load.image(
        "home_earn_wallet_label_1",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_label_1.webp"
    );

    scene.load.image(
        "home_earn_wallet_popup_bg",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_popup_bg.webp"
    );

    //load transaction history

    scene.load.image(
        "home_earn_transaction_history_title",
        url_r2 +
            "assets/home_2/home_earn/home_earn_transaction_history_title.webp"
    );

    //load chip to msci
    scene.load.image(
        "home_earn_chip_to_msci_popup_bg",
        url_r2 + "assets/home_2/home_earn/home_earn_chip_to_msci_popup_bg.webp"
    );

    scene.load.image(
        "home_earn_chip_to_msci_btn",
        url_r2 + "assets/home_2/home_earn/home_earn_chip_to_msci_btn.webp"
    );

    //chip to msci history
    scene.load.image(
        "home_earn_chip_to_msci_history_title",
        url_r2 +
            "assets/home_2/home_earn/home_earn_chip_to_msci_history_title.webp"
    );

    //msci view
    scene.load.image(
        "home_earn_msci_view_popup_bg",
        url_r2 + "assets/home_2/home_earn/home_earn_msci_view_popup_bg.webp"
    );
    scene.load.image(
        "home_earn_msci_view_btn_0",
        url_r2 + "assets/home_2/home_earn/home_earn_msci_view_btn_0.webp"
    );

    scene.load.image(
        "home_earn_msci_view_detail_popup_bg",
        url_r2 +
            "assets/home_2/home_earn/home_earn_msci_view_detail_popup_bg.webp"
    );

    //Select wallet popup
    scene.load.image(
        "home_earn_wallet_select_popup_bg",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_select_popup_bg.webp"
    );

    scene.load.image(
        "home_earn_wallet_select_popup_btn",
        url_r2 +
            "assets/home_2/home_earn/home_earn_wallet_select_popup_btn.webp"
    );

    //load sui guide
    scene.load.image(
        "home_earn_wallet_sui_guide_bg",
        url_r2 + "assets/home_2/home_earn/home_earn_wallet_sui_guide_bg.webp"
    );

    scene.load.image(
        "home_earn_wallet_sui_guide_btn_copy_url",
        url_r2 +
            "assets/home_2/home_earn/home_earn_wallet_sui_guide_btn_copy_url.webp"
    );

    //load daily chip reward

    scene.load.image(
        "home_earn_transaction_daily_chip_reward_title",
        url_r2 +
            "assets/home_2/home_earn/home_earn_transaction_daily_chip_reward_title.webp"
    );
}

export function LoadNeuralink(scene) {
    scene.load.image(
        "home_neuralink_bg",
        url_r2 + "assets/home_2/home_neuralink/home_neuralink_bg.webp"
    );

    //upgrade
    scene.load.image(
        "home_neuralink_upgrade_bg",
        url_r2 + "assets/home_2/home_neuralink/home_neuralink_upgrade_bg.webp"
    );

    scene.load.image(
        "home_neuralink_neuralink_create",
        url_r2 +
            "assets/home_2/home_neuralink/home_neuralink_neuralink_create.webp"
    );

    scene.load.image(
        "home_neuralink_btn_neuralink",
        url_r2 +
            "assets/home_2/home_neuralink/home_neuralink_btn_neuralink.webp"
    );

    scene.load.image(
        "home_neuralink_btn_drone",
        url_r2 + "assets/home_2/home_neuralink/home_neuralink_btn_drone.webp"
    );

    scene.load.image(
        "home_neuralink_btn_suit",
        url_r2 + "assets/home_2/home_neuralink/home_neuralink_btn_suit.webp"
    );

    scene.load.image(
        "home_neuralink_btn_0",
        url_r2 + "assets/home_2/home_neuralink/home_neuralink_btn_0.webp"
    );

    scene.load.image(
        "home_neuralink_btn_1",
        url_r2 + "assets/home_2/home_neuralink/home_neuralink_btn_1.webp"
    );

    //upgrade detail
    scene.load.image(
        "home_neuralink_detail_bg",
        url_r2 + "assets/home_2/home_neuralink/home_neuralink_detail_bg.webp"
    );

    //load neuralink inventory
    scene.load.image(
        "home_neuralink_inventory_btn_progress",
        url_r2 +
            "assets/home_2/home_neuralink/home_neuralink_inventory_btn_progress.webp"
    );

    scene.load.image(
        "home_neuralink_inventory_btn_upgrade",
        url_r2 +
            "assets/home_2/home_neuralink/home_neuralink_inventory_btn_upgrade.webp"
    );

    scene.load.image(
        "home_neuralink_inventory_btn_success",
        url_r2 +
            "assets/home_2/home_neuralink/home_neuralink_inventory_btn_success.webp"
    );

    //progress detail
    scene.load.image(
        "home_neuralink_upgrade_progress_detail_bg",
        url_r2 +
            "assets/home_2/home_neuralink/home_neuralink_upgrade_progress_detail_bg.webp"
    );

    scene.load.image(
        "home_neuralink_upgrade_element_bg",
        url_r2 +
            "assets/home_2/home_neuralink/home_neuralink_upgrade_element_bg.webp"
    );

    scene.load.image(
        "home_neuralink_upgrade_btn",
        url_r2 + "assets/home_2/home_neuralink/home_neuralink_upgrade_btn.webp"
    );
}

export function LoadLobby(scene) {
    //temp

    scene.load.image(
        "home_lobby_btn_close_beta",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_close_beta.webp"
    );

    scene.load.image(
        "home_lobby_close_beta_text",
        url_r2 + "assets/home_2/home_lobby/home_lobby_close_beta_text.webp"
    );

    scene.load.image(
        "home_lobby_close_beta_btn",
        url_r2 + "assets/home_2/home_lobby/home_lobby_close_beta_btn.webp"
    );

    // load buttons

    // Clear cache cũ trước khi load ảnh mới
    if (scene.textures.exists('home_lobby_bg')) {
        scene.textures.remove('home_lobby_bg');
    }
    
    // Load với timestamp để force reload
    scene.load.image(
        "home_lobby_bg",
        url_r2 + "assets/home_2/home_lobby/home_lobby_bg.webp?v=" + Date.now()
    );

    scene.load.image(
        "home_lobby_bg_footer",
        url_r2 + "assets/home_2/home_lobby/home_lobby_bg_footer.webp"
    );

    scene.load.image(
        "home_lobby_daily_chip_reward_bg",
        url_r2 + "assets/home_2/home_lobby/home_lobby_daily_chip_reward_bg.webp"
    );

    scene.load.image(
        "home_lobby_daily_chip_reward_btn",
        url_r2 +
            "assets/home_2/home_lobby/home_lobby_daily_chip_reward_btn.webp"
    );

    scene.load.image(
        "home_lobby_btn_notification",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_notification.webp"
    );

    scene.load.image(
        "home_lobby_btn_notification_new",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_notification_new.webp"
    );

    scene.load.image(
        "home_lobby_btn_audio_off",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_audio_off.webp"
    );

    scene.load.image(
        "home_lobby_btn_audio_on",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_audio_on.webp"
    );

    scene.load.image(
        "home_lobby_btn_battle",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_battle.webp"
    );

    scene.load.image(
        "home_lobby_btn_character",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_character.webp"
    );

    scene.load.image(
        "home_lobby_btn_tutorial",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_tutorial.webp"
    );

    scene.load.image(
        "home_lobby_btn_center_market",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_center_market.webp"
    );

    scene.load.image(
        "home_lobby_btn_reward",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_reward.webp"
    );

    scene.load.image(
        "home_lobby_btn_gacha",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_gacha.webp"
    );

    scene.load.image(
        "home_lobby_btn_wallet",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_wallet.webp"
    );

    scene.load.image(
        "home_lobby_btn_guild",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_guild.webp"
    );

    scene.load.image(
        "home_lobby_btn_neuralink",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_neuralink.webp"
    );

    scene.load.image(
        "home_lobby_btn_inventory",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_inventory.webp"
    );

    scene.load.image(
        "home_lobby_btn_shop",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_shop.webp"
    );

    scene.load.image(
        "home_lobby_btn_daily",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_daily.webp"
    );

    scene.load.image(
        "home_lobby_btn_language",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_language.webp"
    );

    scene.load.image(
        "home_lobby_btn_msci",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_msci.webp"
    );

    scene.load.image(
        "home_lobby_btn_code",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_code.webp"
    );

    scene.load.image(
        "home_lobby_btn_playtest",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_playtest.webp"
    );

    scene.load.image(
        "home_lobby_btn_left",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_left.webp"
    );

    scene.load.image(
        "home_lobby_btn_right",
        url_r2 + "assets/home_2/home_lobby/home_lobby_btn_right.webp"
    );
}

export function LoadFirstMissions(scene) {
    scene.load.image(
        "home_first_missions_bg",
        url_r2 + "assets/home_2/home_first_missions/home_first_missions_bg.webp"
    );

    scene.load.image(
        "home_first_missions_footer_bg",
        url_r2 +
            "assets/home_2/home_first_missions/home_first_missions_footer_bg.webp"
    );

    scene.load.image(
        "home_first_missions_frame_0",
        url_r2 +
            "assets/home_2/home_first_missions/home_first_missions_frame_0.webp"
    );

    scene.load.image(
        "home_first_missions_item_bg",
        url_r2 +
            "assets/home_2/home_first_missions/home_first_missions_item_bg.webp"
    );

    scene.load.image(
        "home_first_missions_btn",
        url_r2 +
            "assets/home_2/home_first_missions/home_first_missions_btn.webp"
    );
}

export function LoadMuskPack(scene) {
    // load musk

    scene.load.image(
        "home_musk_buy_btn",
        url_r2 + "assets/home_2/home_musk/home_musk_buy_btn.webp"
    );

    scene.load.image(
        "home_musk_pack_bg",
        url_r2 + "assets/home_2/home_musk/home_musk_pack_bg.webp"
    );

    scene.load.image(
        "home_musk_title",
        url_r2 + "assets/home_2/home_musk/home_musk_title.webp"
    );
}

export function LoadItem(scene) {
    //Load items

    scene.load.image("item_chip", url_r2 + "assets/item/item_chip.webp");

    scene.load.image("item_musk", url_r2 + "assets/item/item_musk.webp");

    scene.load.image("item_msci", url_r2 + "assets/item/item_msci.webp");

    scene.load.image(
        "item_character_box",
        url_r2 + "assets/item/item_character_box.webp"
    );

    scene.load.image(
        "item_character_c_box",
        url_r2 + "assets/item/item_character_c_box.webp"
    );

    scene.load.image(
        "item_character_c_box_david",
        url_r2 + "assets/item/item_character_c_box_david.webp"
    );

    scene.load.image(
        "item_character_c_box_henry",
        url_r2 + "assets/item/item_character_c_box_henry.webp"
    );

    scene.load.image(
        "item_character_c_box_marcus",
        url_r2 + "assets/item/item_character_c_box_marcus.webp"
    );

    scene.load.image(
        "item_character_premium_box",
        url_r2 + "assets/item/item_character_premium_box.webp"
    );

    scene.load.image(
        "item_character_piece_box",
        url_r2 + "assets/item/item_character_piece_box.webp"
    );

    //c
    scene.load.image(
        "item_fragment_david",
        url_r2 + "assets/item/item_fragment_david.webp"
    );
    scene.load.image(
        "item_fragment_henry",
        url_r2 + "assets/item/item_fragment_henry.webp"
    );
    scene.load.image(
        "item_fragment_marcus",
        url_r2 + "assets/item/item_fragment_marcus.webp"
    );

    //b
    scene.load.image(
        "item_fragment_anna",
        url_r2 + "assets/item/item_fragment_anna.webp"
    );
    scene.load.image(
        "item_fragment_julia",
        url_r2 + "assets/item/item_fragment_julia.webp"
    );
    scene.load.image(
        "item_fragment_fiona",
        url_r2 + "assets/item/item_fragment_fiona.webp"
    );

    //a
    scene.load.image(
        "item_fragment_victoria",
        url_r2 + "assets/item/item_fragment_victoria.webp"
    );
    scene.load.image(
        "item_fragment_elizabeth",
        url_r2 + "assets/item/item_fragment_elizabeth.webp"
    );
    scene.load.image(
        "item_fragment_alexandra",
        url_r2 + "assets/item/item_fragment_alexandra.webp"
    );

    //s
    scene.load.image(
        "item_fragment_akane",
        url_r2 + "assets/item/item_fragment_akane.webp"
    );
    scene.load.image(
        "item_fragment_alice",
        url_r2 + "assets/item/item_fragment_alice.webp"
    );
    scene.load.image(
        "item_fragment_caitlyn",
        url_r2 + "assets/item/item_fragment_caitlyn.webp"
    );

    scene.load.image(
        "item_msci_memory",
        url_r2 + "assets/item/item_msci_memory.webp"
    );

    scene.load.image(
        "item_doge_energy",
        url_r2 + "assets/item/item_doge_energy.webp"
    );

    scene.load.image(
        "item_doge_shield",
        url_r2 + "assets/item/item_doge_shield.webp"
    );

    scene.load.image(
        "item_blind_bag",
        url_r2 + "assets/item/item_blind_bag.webp"
    );

    scene.load.image(
        "item_boss_world_box",
        url_r2 + "assets/item/item_boss_world_box.webp"
    );

    scene.load.image(
        "item_boss_elite_box",
        url_r2 + "assets/item/item_boss_elite_box.webp"
    );

    //load neuralink
    scene.load.image(
        "item_neuralink",
        url_r2 + "assets/item/item_neuralink.webp"
    );

    scene.load.image(
        "item_neuralink_1",
        url_r2 + "assets/item/item_neuralink_1.webp"
    );

    scene.load.image(
        "item_neuralink_2",
        url_r2 + "assets/item/item_neuralink_2.webp"
    );

    scene.load.image(
        "item_neuralink_3",
        url_r2 + "assets/item/item_neuralink_3.webp"
    );

    scene.load.image(
        "item_neuralink_4",
        url_r2 + "assets/item/item_neuralink_4.webp"
    );

    scene.load.image(
        "item_neuralink_5",
        url_r2 + "assets/item/item_neuralink_5.webp"
    );

    scene.load.image(
        "item_neuralink_1_e",
        url_r2 + "assets/item/item_neuralink_1_e.webp"
    );

    scene.load.image(
        "item_neuralink_2_e",
        url_r2 + "assets/item/item_neuralink_2_e.webp"
    );

    scene.load.image(
        "item_neuralink_3_e",
        url_r2 + "assets/item/item_neuralink_3_e.webp"
    );

    scene.load.image(
        "item_neuralink_4_e",
        url_r2 + "assets/item/item_neuralink_4_e.webp"
    );

    scene.load.image(
        "item_neuralink_5_e",
        url_r2 + "assets/item/item_neuralink_5_e.webp"
    );
}

export function LoadAvatars(scene) {
    scene.load.image(
        "home_avatar_bg",
        url_r2 + "assets/home_2/home_avatar/home_avatar_bg.webp"
    );

    scene.load.image(
        "home_avatar_using",
        url_r2 + "assets/home_2/home_avatar/home_avatar_using.webp"
    );

    //Load avatars free

    for (let i = 0; i < 12; i++) {
        scene.load.image(
            `avatar_free_${i}`,
            url_r2 + `assets/avatar/avatar_free_${i}.webp`
        );
    }

    //load guild frame
    scene.load.image(
        "avatar_frame_1",
        url_r2 + "assets/avatar/avatar_frame/avatar_frame_1.webp"
    );

    scene.load.image(
        "avatar_frame_2",
        url_r2 + "assets/avatar/avatar_frame/avatar_frame_2.webp"
    );

    scene.load.image(
        "avatar_frame_3",
        url_r2 + "assets/avatar/avatar_frame/avatar_frame_3.webp"
    );
}

export function LoadGameplayTopBar(scene) {
    scene.load.image(
        "gameplay_top_bar_bg",
        url_r2 + "assets/gameplay/gameplay_top_bar/gameplay_top_bar_bg.webp"
    );

    scene.load.image(
        "gameplay_top_bar_health_bar_0",
        url_r2 +
            "assets/gameplay/gameplay_top_bar/gameplay_top_bar_health_bar_0.webp"
    );

    scene.load.image(
        "gameplay_top_bar_health_bar_1",
        url_r2 +
            "assets/gameplay/gameplay_top_bar/gameplay_top_bar_health_bar_1.webp"
    );

    scene.load.image(
        "gameplay_top_bar_health_bar_2",
        url_r2 +
            "assets/gameplay/gameplay_top_bar/gameplay_top_bar_health_bar_2.webp"
    );

    scene.load.image(
        "gameplay_top_bar_health_bar_3",
        url_r2 +
            "assets/gameplay/gameplay_top_bar/gameplay_top_bar_health_bar_3.webp"
    );

    scene.load.image(
        "gameplay_top_bar_health_bar_4",
        url_r2 +
            "assets/gameplay/gameplay_top_bar/gameplay_top_bar_health_bar_4.webp"
    );
}

export function LoadUserInfo(scene) {
    // load user info

    scene.load.image(
        "home_user_info_bg",
        url_r2 + "assets/home_2/home_user_info/home_user_info_bg.webp"
    );

    scene.load.image(
        "home_user_info_btn_account",
        url_r2 + "assets/home_2/home_user_info/home_user_info_btn_account.webp"
    );

    scene.load.image(
        "home_user_info_btn_network",
        url_r2 + "assets/home_2/home_user_info/home_user_info_btn_network.webp"
    );

    scene.load.image(
        "home_user_info_btn_rank",
        url_r2 + "assets/home_2/home_user_info/home_user_info_btn_rank.webp"
    );

    //load account
    scene.load.image(
        "home_user_info_account_bg",
        url_r2 + "assets/home_2/home_user_info/home_user_info_account_bg.webp"
    );

    scene.load.image(
        "home_user_info_account_btn_invite_friend",
        url_r2 +
            "assets/home_2/home_user_info/home_user_info_account_btn_invite_friend.webp"
    );

    scene.load.image(
        "home_user_info_account_btn_share_link",
        url_r2 +
            "assets/home_2/home_user_info/home_user_info_account_btn_share_link.webp"
    );

    //load network
    scene.load.image(
        "home_user_info_network_bg",
        url_r2 + "assets/home_2/home_user_info/home_user_info_network_bg.webp"
    );

    //load rank
    scene.load.image(
        "home_user_info_rank_bg",
        url_r2 + "assets/home_2/home_user_info/home_user_info_rank_bg.webp"
    );

    //load rank icon
    scene.load.image(
        "home_user_info_rank_icon_top_1",
        url_r2 +
            "assets/home_2/home_user_info/home_user_info_rank_icon_top_1.webp"
    );

    scene.load.image(
        "home_user_info_rank_icon_top_2",
        url_r2 +
            "assets/home_2/home_user_info/home_user_info_rank_icon_top_2.webp"
    );

    scene.load.image(
        "home_user_info_rank_icon_top_3",
        url_r2 +
            "assets/home_2/home_user_info/home_user_info_rank_icon_top_3.webp"
    );

    //load rank label
    scene.load.image(
        "home_user_info_rank_label",
        url_r2 + "assets/home_2/home_user_info/home_user_info_rank_label.webp"
    );

    scene.load.image(
        "home_user_info_rank_label_top_1",
        url_r2 +
            "assets/home_2/home_user_info/home_user_info_rank_label_top_1.webp"
    );

    scene.load.image(
        "home_user_info_rank_label_top_2",
        url_r2 +
            "assets/home_2/home_user_info/home_user_info_rank_label_top_2.webp"
    );

    scene.load.image(
        "home_user_info_rank_label_top_3",
        url_r2 +
            "assets/home_2/home_user_info/home_user_info_rank_label_top_3.webp"
    );

    scene.load.image(
        "home_user_info_rank_label_avatar_frame",
        url_r2 +
            "assets/home_2/home_user_info/home_user_info_rank_label_avatar_frame.webp"
    );

    //load equipment
    scene.load.image(
        "home_user_info_equip_bg",
        url_r2 + "assets/home_2/home_user_info/home_user_info_equip_bg.webp"
    );

    scene.load.image(
        "home_user_info_equip_btn",
        url_r2 + "assets/home_2/home_user_info/home_user_info_equip_btn.webp"
    );
}

export function LoadFriends(scene) {
    scene.load.image(
        "home_friends_bg",
        url_r2 + "assets/home_2/home_friends/home_friends_bg.webp"
    );

    scene.load.image(
        "home_friends_list_item_bg",
        url_r2 + "assets/home_2/home_friends/home_friends_list_item_bg.webp"
    );

    scene.load.image(
        "home_friends_btn_0",
        url_r2 + "assets/home_2/home_friends/home_friends_btn_0.webp"
    );

    scene.load.image(
        "home_friends_btn_add_friend",
        url_r2 + "assets/home_2/home_friends/home_friends_btn_add_friend.webp"
    );

    scene.load.image(
        "home_friends_btn_1",
        url_r2 + "assets/home_2/home_friends/home_friends_btn_1.webp"
    );
}

export function LoadGuild(scene) {
    scene.load.image(
        "home_guild_bg",
        url_r2 + "assets/home_2/home_guild/home_guild_bg.webp"
    );

    scene.load.image(
        "home_guild_chat_bg",
        url_r2 + "assets/home_2/home_guild/home_guild_chat_bg.webp"
    );

    scene.load.image(
        "home_guild_list_item_bg",
        url_r2 + "assets/home_2/home_guild/home_guild_list_item_bg.webp"
    );

    scene.load.image(
        "home_guild_btn_0",
        url_r2 + "assets/home_2/home_guild/home_guild_btn_0.webp"
    );

    scene.load.image(
        "home_guild_btn_play",
        url_r2 + "assets/home_2/home_guild/home_guild_btn_play.webp"
    );

    scene.load.image(
        "home_guild_btn_play_1",
        url_r2 + "assets/home_2/home_guild/home_guild_btn_play_1.webp"
    );

    scene.load.image(
        "home_guild_btn_1",
        url_r2 + "assets/home_2/home_guild/home_guild_btn_1.webp"
    );

    scene.load.image(
        "home_guild_avatar_using",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar_using.webp"
    );
}

export function LoadGuildAvatars(scene) {
    scene.load.image(
        "GA1",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA1.webp"
    );

    scene.load.image(
        "GA2",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA2.webp"
    );

    scene.load.image(
        "GA3",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA3.webp"
    );

    scene.load.image(
        "GA4",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA4.webp"
    );

    scene.load.image(
        "GA5",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA5.webp"
    );

    scene.load.image(
        "GA6",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA6.webp"
    );

    scene.load.image(
        "GA7",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA7.webp"
    );

    scene.load.image(
        "GA8",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA8.webp"
    );

    scene.load.image(
        "GA9",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA9.webp"
    );

    scene.load.image(
        "GA10",
        url_r2 + "assets/home_2/home_guild/home_guild_avatar/GA10.webp"
    );
}

export function LoadVip(scene) {
    scene.load.image(
        "home_vip_bg",
        url_r2 + "assets/home_2/home_vip/home_vip_bg.webp"
    );

    scene.load.image(
        "home_vip_title",
        url_r2 + "assets/home_2/home_vip/home_vip_title.webp"
    );

    scene.load.image(
        "home_vip_btn",
        url_r2 + "assets/home_2/home_vip/home_vip_btn.webp"
    );

    scene.load.image(
        "home_vip_icon",
        url_r2 + "assets/home_2/home_vip/home_vip_icon.webp"
    );

    scene.load.image(
        "home_vip_icon_1",
        url_r2 + "assets/home_2/home_vip/home_vip_icon_1.webp"
    );

    scene.load.image(
        "home_vip_icon_2",
        url_r2 + "assets/home_2/home_vip/home_vip_icon_2.webp"
    );

    scene.load.image(
        "home_vip_icon_3",
        url_r2 + "assets/home_2/home_vip/home_vip_icon_3.webp"
    );
}

export function LoadGameplaySelector(scene) {
    scene.load.image(
        "gameplay_selector_btn_gunner",
        url_r2 +
            "assets/gameplay/gameplay_selector/gameplay_selector_btn_gunner.webp"
    );

    scene.load.image(
        "gameplay_selector_btn_sniper",
        url_r2 +
            "assets/gameplay/gameplay_selector/gameplay_selector_btn_sniper.webp"
    );

    scene.load.image(
        "gameplay_selector_btn_rocket",
        url_r2 +
            "assets/gameplay/gameplay_selector/gameplay_selector_btn_rocket.webp"
    );

    scene.load.image(
        "gameplay_selector_btn_gunner_selected",
        url_r2 +
            "assets/gameplay/gameplay_selector/gameplay_selector_btn_gunner_selected.webp"
    );

    scene.load.image(
        "gameplay_selector_btn_sniper_selected",
        url_r2 +
            "assets/gameplay/gameplay_selector/gameplay_selector_btn_sniper_selected.webp"
    );

    scene.load.image(
        "gameplay_selector_btn_rocket_selected",
        url_r2 +
            "assets/gameplay/gameplay_selector/gameplay_selector_btn_rocket_selected.webp"
    );

    scene.load.image(
        "gameplay_selector_item_btn",
        url_r2 +
            "assets/gameplay/gameplay_selector/gameplay_selector_item_btn.webp"
    );
}

export function LoadGameplayBottomBar(scene) {
    scene.load.image(
        "gameplay_bottom_bar_delay_bar_0",
        url_r2 +
            "assets/gameplay/gameplay_bottom_bar/gameplay_bottom_bar_delay_bar_0.webp"
    );

    scene.load.image(
        "gameplay_bottom_bar_delay_bar_1",
        url_r2 +
            "assets/gameplay/gameplay_bottom_bar/gameplay_bottom_bar_delay_bar_1.webp"
    );

    scene.load.image(
        "gameplay_bottom_bar_delay_bar_2",
        url_r2 +
            "assets/gameplay/gameplay_bottom_bar/gameplay_bottom_bar_delay_bar_2.webp"
    );
}

export function LoadGameplayGameOver(scene) {
    scene.load.image(
        "gameplay_game_over_popup_bg",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_over_popup_bg.webp"
    );

    scene.load.image(
        "gameplay_game_over_text",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_over_text.webp"
    );

    scene.load.image(
        "gameplay_player_dead_text",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_player_dead_text.webp"
    );

    scene.load.image(
        "gameplay_game_complete_text",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_complete_text.webp"
    );

    scene.load.image(
        "gameplay_game_complete_reward_item_bg",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_complete_reward_item_bg.webp"
    );

    scene.load.image(
        "gameplay_game_over_btn_exit",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_over_btn_exit.webp"
    );

    scene.load.image(
        "gameplay_game_over_btn_claim",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_over_btn_claim.webp"
    );

    scene.load.image(
        "gameplay_game_over_btn_next",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_over_btn_next.webp"
    );

    scene.load.image(
        "gameplay_game_over_btn_playagain",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_over_btn_playagain.webp"
    );

    scene.load.image(
        "gameplay_game_revive_item",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_revive_item.webp"
    );

    scene.load.image(
        "gameplay_game_revive_btn",
        url_r2 +
            "assets/gameplay/gameplay_game_over/gameplay_game_revive_btn.webp"
    );
}

export function LoadMapById(scene, mapId) {
    switch (mapId) {
        case 0:
            //Load map 0 earth
            scene.load.image(
                "map_0_bg",
                url_r2 + "assets/gameplay/map/map_0/map_0_bg.webp"
            );
            scene.load.image(
                "map_0_obstacle_0_wall",
                url_r2 + "assets/gameplay/map/map_0/map_0_obstacle_0_wall.webp"
            );
            break;
        case 1:
            //Load map 1 space
            scene.load.image(
                "map_1_bg",
                url_r2 + "assets/gameplay/map/map_1/map_1_bg.webp"
            );
            scene.load.image(
                "map_1_obstacle_0_wall",
                url_r2 + "assets/gameplay/map/map_1/map_1_obstacle_0_wall.webp"
            );
            break;
        case 2:
            //Load map 2 mars
            scene.load.image(
                "map_2_bg",
                url_r2 + "assets/gameplay/map/map_2/map_2_bg.webp"
            );
            scene.load.image(
                "map_2_obstacle_0_wall",
                url_r2 + "assets/gameplay/map/map_2/map_2_obstacle_0_wall.webp"
            );
            break;
        case 3:
            //Load map boss 0
            scene.load.image(
                "map_boss_0_bg",
                url_r2 + "assets/gameplay/map/map_boss_0/map_boss_0_bg.webp"
            );
            scene.load.image(
                "map_boss_0_obstacle_0_wall",
                url_r2 +
                    "assets/gameplay/map/map_boss_0/map_boss_0_obstacle_0_wall.webp"
            );
            break;
        default:
            // Không load gì nếu mapId không hợp lệ
            break;
    }
}

let playerSpineDictionary = {};
export function CreatePlayerDictionary() {
    playerSpineDictionary = {
        //c
        david: {
            UICardInventory: {
                key: "david_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/david/player_2_ui_card_inventory.webp",
            },
            spineUI: {
                key: "david_spine_ui",
                url: url_r2 + "assets/gameplay/player/david/player_2_ui",
            },
            spineGameplay: {
                key: "david_spine_gameplay",
                url: url_r2 + "assets/gameplay/player/david/player_2_gameplay",
            },
        },
        davidsc: {
            UICardInventory: {
                key: "davidsc_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/davidsc/davidsc_ui_card_inventory.webp",
            },
            spineUI: {
                key: "davidsc_spine_ui",
                url: url_r2 + "assets/gameplay/player/davidsc/david_01_ui",
            },
            spineGameplay: {
                key: "davidsc_spine_gameplay",
                url:
                    url_r2 + "assets/gameplay/player/davidsc/david_01_gameplay",
            },
        },
        henry: {
            UICardInventory: {
                key: "henry_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/henry/henry_ui_card_inventory.webp",
            },
            spineUI: {
                key: "henry_spine_ui",
                url: url_r2 + "assets/gameplay/player/henry/player_5_ui",
            },
            spineGameplay: {
                key: "henry_spine_gameplay",
                url: url_r2 + "assets/gameplay/player/henry/player_5_gameplay",
            },
        },
        henrysc: {
            UICardInventory: {
                key: "henrysc_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/henrysc/henrysc_ui_card_inventory.webp",
            },
            spineUI: {
                key: "henrysc_spine_ui",
                url: url_r2 + "assets/gameplay/player/henrysc/player_14_ui",
            },
            spineGameplay: {
                key: "henrysc_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/henrysc/player_14_gameplay",
            },
        },
        marcus: {
            UICardInventory: {
                key: "marcus_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/marcus/player_3_ui_card_inventory.webp",
            },
            spineUI: {
                key: "marcus_spine_ui",
                url: url_r2 + "assets/gameplay/player/marcus/player_28_ui",
            },
            spineGameplay: {
                key: "marcus_spine_gameplay",
                url:
                    url_r2 + "assets/gameplay/player/marcus/player_28_gameplay",
            },
        },
        marcussc: {
            UICardInventory: {
                key: "marcussc_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/marcussc/marcussc_ui_card_inventory.webp",
            },
            spineUI: {
                key: "marcussc_spine_ui",
                url:
                    url_r2 +
                    "assets/gameplay/player/marcussc/player_03_marcus_ui",
            },
            spineGameplay: {
                key: "marcussc_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/marcussc/player_03_marcus_gameplay",
            },
        },
        //b
        anna: {
            UICardInventory: {
                key: "anna_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/anna/player_0_ui_card_inventory.webp",
            },
            spineUI: {
                key: "anna_spine_ui",
                url: url_r2 + "assets/gameplay/player/anna/player_0_ui",
            },
            spineGameplay: {
                key: "anna_spine_gameplay",
                url: url_r2 + "assets/gameplay/player/anna/player_0_gameplay",
            },
        },
        annasb: {
            UICardInventory: {
                key: "annasb_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/annasb/annasb_ui_card_inventory.webp",
            },
            spineUI: {
                key: "annasb_spine_ui",
                url: url_r2 + "assets/gameplay/player/annasb/player_16_ui",
            },
            spineGameplay: {
                key: "annasb_spine_gameplay",
                url:
                    url_r2 + "assets/gameplay/player/annasb/player_16_gameplay",
            },
        },
        julia: {
            UICardInventory: {
                key: "julia_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/julia/julia_ui_card_inventory.webp",
            },
            spineUI: {
                key: "julia_spine_ui",
                url: url_r2 + "assets/gameplay/player/julia/player_4_ui",
            },
            spineGameplay: {
                key: "julia_spine_gameplay",
                url: url_r2 + "assets/gameplay/player/julia/player_4_gameplay",
            },
        },
        juliasb: {
            UICardInventory: {
                key: "juliasb_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/juliasb/juliasb_ui_card_inventory.webp",
            },
            spineUI: {
                key: "juliasb_spine_ui",
                url: url_r2 + "assets/gameplay/player/juliasb/player_20_ui",
            },
            spineGameplay: {
                key: "juliasb_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/juliasb/player_20_gameplay",
            },
        },
        fiona: {
            UICardInventory: {
                key: "fiona_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/fiona/fiona_ui_card_inventory.webp",
            },
            spineUI: {
                key: "fiona_spine_ui",
                url: url_r2 + "assets/gameplay/player/fiona/player_6_ui",
            },
            spineGameplay: {
                key: "fiona_spine_gameplay",
                url: url_r2 + "assets/gameplay/player/fiona/player_6_gameplay",
            },
        },
        fionasb: {
            UICardInventory: {
                key: "fionasb_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/fionasb/fionasb_ui_card_inventory.webp",
            },
            spineUI: {
                key: "fionasb_spine_ui",
                url: url_r2 + "assets/gameplay/player/fionasb/player_21_ui",
            },
            spineGameplay: {
                key: "fionasb_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/fionasb/player_21_gameplay",
            },
        },
        //a
        victoria: {
            UICardInventory: {
                key: "victoria_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/victoria/victoria_ui_card_inventory.webp",
            },
            spineUI: {
                key: "victoria_spine_ui",
                url: url_r2 + "assets/gameplay/player/victoria/player_1_ui",
            },
            spineGameplay: {
                key: "victoria_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/victoria/player_1_gameplay",
            },
        },
        victoriasa: {
            UICardInventory: {
                key: "victoriasa_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/victoriasa/victoriasa_ui_card_inventory.webp",
            },
            spineUI: {
                key: "victoriasa_spine_ui",
                url: url_r2 + "assets/gameplay/player/victoriasa/player_22_ui",
            },
            spineGameplay: {
                key: "victoriasa_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/victoriasa/player_1_gameplay",
            },
        },
        elizabeth: {
            UICardInventory: {
                key: "elizabeth_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/elizabeth/elizabeth_ui_card_inventory.webp",
            },
            spineUI: {
                key: "elizabeth_spine_ui",
                url: url_r2 + "assets/gameplay/player/elizabeth/player_8_ui",
            },
            spineGameplay: {
                key: "elizabeth_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/elizabeth/player_8_gameplay",
            },
        },
        elizabethsa: {
            UICardInventory: {
                key: "elizabethsa_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/elizabethsa/elizabethsa_ui_card_inventory.webp",
            },
            spineUI: {
                key: "elizabethsa_spine_ui",
                url: url_r2 + "assets/gameplay/player/elizabethsa/player_23_ui",
            },
            spineGameplay: {
                key: "elizabethsa_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/elizabethsa/player_23_gameplay",
            },
        },
        alexandra: {
            UICardInventory: {
                key: "alexandra_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/alexandra/alexandra_ui_card_inventory.webp",
            },
            spineUI: {
                key: "alexandra_spine_ui",
                url: url_r2 + "assets/gameplay/player/alexandra/player_7_ui",
            },
            spineGameplay: {
                key: "alexandra_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/alexandra/player_7_gameplay",
            },
        },
        alexandrasa: {
            UICardInventory: {
                key: "alexandrasa_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/alexandrasa/alexandrasa_ui_card_inventory.webp",
            },
            spineUI: {
                key: "alexandrasa_spine_ui",
                url: url_r2 + "assets/gameplay/player/alexandrasa/player_24_ui",
            },
            spineGameplay: {
                key: "alexandrasa_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/alexandrasa/player_24_gameplay",
            },
        },
        //s
        akane: {
            UICardInventory: {
                key: "akane_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/akane/akane_ui_card_inventory.webp",
            },
            spineUI: {
                key: "akane_spine_ui",
                url: url_r2 + "assets/gameplay/player/akane/player_10_ui",
            },
            spineGameplay: {
                key: "akane_spine_gameplay",
                url: url_r2 + "assets/gameplay/player/akane/player_10_gameplay",
            },
        },
        alice: {
            UICardInventory: {
                key: "alice_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/alice/alice_ui_card_inventory.webp",
            },
            spineUI: {
                key: "alice_spine_ui",
                url: url_r2 + "assets/gameplay/player/alice/player_11_ui",
            },
            spineGameplay: {
                key: "alice_spine_gameplay",
                url: url_r2 + "assets/gameplay/player/alice/player_11_gameplay",
            },
        },
        caitlyn: {
            UICardInventory: {
                key: "caitlyn_ui_card_inventory",
                url:
                    url_r2 +
                    "assets/gameplay/player/caitlyn/caitlyn_ui_card_inventory.webp",
            },
            spineUI: {
                key: "caitlyn_spine_ui",
                url: url_r2 + "assets/gameplay/player/caitlyn/player_13_ui",
            },
            spineGameplay: {
                key: "caitlyn_spine_gameplay",
                url:
                    url_r2 +
                    "assets/gameplay/player/caitlyn/player_13_gameplay",
            },
        },
    };
}

export function LoadPlayerUICardInventory(scene, characterIds) {
    for (let i = 0; i < characterIds.length; i++) {
        let charId = characterIds[i];

        let loadData = playerSpineDictionary[charId];

        scene.load.image(
            loadData.UICardInventory.key,
            loadData.UICardInventory.url
        );
    }
}

export function LoadPlayerSpineUI(scene, characterIds) {
    for (let i = 0; i < characterIds.length; i++) {
        let charId = characterIds[i];

        let loadData = playerSpineDictionary[charId];

        scene.load.spine(
            loadData.spineUI.key,
            loadData.spineUI.url + ".json",
            loadData.spineUI.url + ".atlas",
            true
        );
    }
}

export function LoadPlayerSpineGameplay(scene, characterIds) {
    for (let i = 0; i < characterIds.length; i++) {
        let charId = characterIds[i];

        let loadData = playerSpineDictionary[charId];

        scene.load.spine(
            loadData.spineGameplay.key,
            loadData.spineGameplay.url + ".json",
            loadData.spineGameplay.url + ".atlas",
            true
        );

        // scene.load.image(
        //     loadData.spineGameplay.key + "_skill_intro",
        //     loadData.spineGameplay.url + "_skill_intro" + ".webp"
        // );
    }
}

export function LoadEnemy(scene) {
    // load normal enemy

    //load enemy 0
    scene.load.spine(
        "gameplay_enemy_0",
        url_r2 + "assets/gameplay/enemy/enemy_0/enemy_0.json",
        url_r2 + "assets/gameplay/enemy/enemy_0/enemy_0.atlas",
        true
    );

    //load enemy 1
    scene.load.spine(
        "gameplay_enemy_1",
        url_r2 + "assets/gameplay/enemy/enemy_1/enemy_1.json",
        url_r2 + "assets/gameplay/enemy/enemy_1/enemy_1.atlas",
        true
    );

    //load enemy 2
    scene.load.spine(
        "gameplay_enemy_2",
        url_r2 + "assets/gameplay/enemy/enemy_2/play_drone_0.json",
        url_r2 + "assets/gameplay/enemy/enemy_2/play_drone_0.atlas",
        true
    );

    //load enemy 3
    scene.load.spine(
        "gameplay_enemy_3",
        url_r2 + "assets/gameplay/enemy/enemy_3/play_drone_1.json",
        url_r2 + "assets/gameplay/enemy/enemy_3/play_drone_1.atlas",
        true
    );

    //load drone enemy
    scene.load.spine(
        "enemy_drone_0",
        url_r2 + "assets/gameplay/enemy/enemy_drone_0/play_drone_2.json",
        url_r2 + "assets/gameplay/enemy/enemy_drone_0/play_drone_2.atlas",
        true
    );

    scene.load.spine(
        "enemy_drone_1",
        url_r2 + "assets/gameplay/enemy/enemy_drone_1/play_drone_3.json",
        url_r2 + "assets/gameplay/enemy/enemy_drone_1/play_drone_3.atlas",
        true
    );

    scene.load.spine(
        "enemy_drone_2",
        url_r2 + "assets/gameplay/enemy/enemy_drone_2/play_drone_4.json",
        url_r2 + "assets/gameplay/enemy/enemy_drone_2/play_drone_4.atlas",
        true
    );

    //load enemy 3
    scene.load.spine(
        "enemy_drone_3",
        url_r2 + "assets/gameplay/enemy/enemy_drone_3/play_drone_2.json",
        url_r2 + "assets/gameplay/enemy/enemy_drone_3/play_drone_2.atlas",
        true
    );

    //load enemy 4
    scene.load.spine(
        "enemy_drone_4",
        url_r2 + "assets/gameplay/enemy/enemy_drone_4/play_drone_3.json",
        url_r2 + "assets/gameplay/enemy/enemy_drone_4/play_drone_3.atlas",
        true
    );

    //load enemy 5
    scene.load.spine(
        "enemy_drone_5",
        url_r2 + "assets/gameplay/enemy/enemy_drone_5/play_drone_4.json",
        url_r2 + "assets/gameplay/enemy/enemy_drone_5/play_drone_4.atlas",
        true
    );

    //load ghost enemy 0
    scene.load.spine(
        "enemy_ghost_0",
        url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.json",
        url_r2 + "assets/gameplay/enemy/enemy_ghost_0/player_15.atlas",
        true
    );

    // load boss enemy
    scene.load.spine(
        "gameplay_enemy_boss_0",
        url_r2 + "assets/gameplay/enemy/enemy_boss_0/enemy_elite_1.json",
        url_r2 + "assets/gameplay/enemy/enemy_boss_0/enemy_elite_1.atlas",
        true
    );

    scene.load.spine(
        "gameplay_enemy_boss_1",
        url_r2 + "assets/gameplay/enemy/enemy_boss_1/player_19.json",
        url_r2 + "assets/gameplay/enemy/enemy_boss_1/player_19.atlas",
        true
    );

    scene.load.image(
        "gameplay_enemy_boss_2",
        url_r2 + "assets/gameplay/enemy/enemy_boss_2/gameplay_enemy_boss_2.webp"
    );

    //load elite enemy

    scene.load.image(
        "gameplay_enemy_elite_0",
        url_r2 +
            "assets/gameplay/enemy/enemy_elite_0/gameplay_enemy_elite_0.webp"
    );

    scene.load.image(
        "gameplay_enemy_elite_1",
        url_r2 +
            "assets/gameplay/enemy/enemy_elite_1/gameplay_enemy_elite_1.webp"
    );

    scene.load.image(
        "gameplay_enemy_elite_2",
        url_r2 +
            "assets/gameplay/enemy/enemy_elite_2/gameplay_enemy_elite_2.webp"
    );

    //load enemy hit fx
    // Tải sprite sheet
    scene.load.spritesheet(
        "enemy_fx_strike_anim",
        url_r2 + "assets/gameplay/enemy/enemy_fx/enemy_fx_strike_anim.webp",
        {
            frameWidth: 500, // Kích thước từng khung hình (2000 / 4)
            frameHeight: 500, // Kích thước từng khung hình (1500 / 3)
        }
    );

    //load enemy hit fx
    // Tải sprite sheet
    scene.load.spritesheet(
        "enemy_fx_explosion",
        url_r2 + "assets/gameplay/enemy/enemy_fx/enemy_fx_explosion.webp",
        {
            frameWidth: 140, // Kích thước từng khung hình (700 / 5)
            frameHeight: 180, // Kích thước từng khung hình (360 / 2)
        }
    );

    //load enemy shield fx
    scene.load.image(
        "enemy_fx_shield",
        url_r2 + "assets/gameplay/enemy/enemy_fx/enemy_fx_shield.webp"
    );

    //load reward item
    scene.load.image(
        "home_battle_item_reward_bg",
        url_r2 + "assets/home_2/home_battle/home_battle_item_reward_bg.webp"
    );

    //play test
    scene.load.image(
        "home_battle_item_bg_campain_evolve",
        url_r2 +
            "assets/home_2/home_battle/home_battle_item_bg_campain_evolve.webp"
    );
}

export default Preloader;

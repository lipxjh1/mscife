import { Scene } from "phaser";

import { EventBus } from "../EventBus";
import vorldAuth from '../../modules/vorld-auth';

import centerData from "../Data/CenterData.js";
import { socketService } from "../socket.js";
import { socketServiceBoss } from "../socketBoss.js";
import { socketServiceMultiplayerBoss } from "../socketMultiplayerBoss.js";
import { socketServiceChatGuild } from "../socketChatGuild.js";
import { publish } from "rxjs";
import cdLocalization from "../Data/CenterDataLocalization.js";
import { CreateLoadingPopup, HideLoadingPopup } from "./Share/AlertPopup.js";
import {
    HideGoogleButtonLogin,
    HideGoogleButtonLoginTelegramLink,
    ShowGoogleButtonLogin,
} from "../utils.js";

let container_main_login = null;

let input_referer_id = null;

let input_mail = null;

let input_password = null;

let btn_register = null;

let btn_register_confirm = null;

let btn_register_cancel = null;

let btn_login = null;

let btn_forgot_password_confirm = null;

let btn_forgot_password_cancel = null;

let btn_forgot_password = null;

let btn_login_google = null;

let btn_vorld_login = null;  // NEW: Vorld login button

let text_respone = null;

// Hằng số cho localStorage key
const REFERRER_ID_KEY = "musksci_referrer_id";
// Keys cho lock đăng nhập (rate limit)
const LOGIN_LOCK_PREFIX = "login_rl_resetTime:"; // + <email>
const LOGIN_LOCK_RETRY_PREFIX = "login_rl_retryAfter:"; // + <email>
const LOGIN_LAST_EMAIL_KEY = "login_last_email";

export class Login extends Scene {
    constructor() {
        super("Login");

        this.deferredPrompt = null;
        this.requestLogin = false;
        this.btn_pwa_install = null;
        // State cho countdown lock
        this.lockIntervalId = null;
        this.lockUntil = null; // Date ISO string hoặc số ms
        this.currentEmail = "";
    }

    preload() {}

    create() {
        import("./Home.js")
            .then((module) => {
                // Try both default and named export
                const HomeScene = module.default || module.Home;

                if (HomeScene && typeof HomeScene === "function") {
                    console.log("Home scene loaded successfully");
                    this.scene.add("Home", HomeScene);
                } else {
                    throw new Error("Invalid Home scene module structure");
                }
            })
            .catch((error) => {
                console.error("Failed to load Home scene:", error);
            });

        EventBus.emit("current-scene-ready", this);

        container_main_login = this.add.container(0, 0);
        container_main_login.setDepth(10);

        this.add.image(0, 0, "login_bg").setOrigin(0);

        let text_temp = this.add
            .text(
                540,
                40,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeLobby.KEY,
                    "Welcome to the new M-SCI server test"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    stroke: "#000000",
                    strokeThickness: 2,
                    align: "center",
                    wordWrap: { width: 800, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5, 0);
        container_main_login.add(text_temp);

        text_respone = this.add
            .text(540, 510, "", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 2,
                align: "center",
                wordWrap: { width: 800, useAdvancedWrap: true },
            })
            .setOrigin(0.5, 0);
        container_main_login.add(text_respone);

        // Extract startapp from URL if present
        this.startappFromUrl = this.getUrlReferrer();

        this.CreateInput(this);

        this.setupPWA();

        // Skip auto-restore lock; lock is checked on Login press with current email

        // If we have a startapp from URL, automatically open registration form
        if (this.startappFromUrl) {
            // Use a slight delay to ensure all UI elements are ready
            this.time.delayedCall(300, () => {
                // Show the startapp field and switch to registration mode
                input_referer_id.setVisible(true);
                btn_register_confirm.SetActiveButton(true);
                btn_register_cancel.SetActiveButton(true);
                btn_register.SetActiveButton(false);
                btn_login.SetActiveButton(false);
                btn_forgot_password.setVisible(false);
            });
        }

        // Thêm vào file game
        if (window.ethereum !== "undefined") {
            console.log("MetaMask is installed!");
        } else {
            console.log("Please install MetaMask!");
        }

        // Cleanup khi shutdown để tránh rò rỉ timer
        this.events.on("shutdown", () => {
            this.clearLockCountdown();
        });

        this.RegisterGoogleButtonLogin(this);

        ShowGoogleButtonLogin();

        HideGoogleButtonLoginTelegramLink();
    }

    setupPWA() {
        // Check if the app is already installed
        if (
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone
        ) {
            console.log(
                "PWA is already installed and running in standalone mode."
            );
            return;
        }

        // Create the install button, but keep it hidden initially
        this.btn_pwa_install = this.CreateButton(
            this,
            540,
            1650, // Positioned below other elements
            "login_btn_0", // Reusing an existing button style
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Install App"
            )
        );
        this.btn_pwa_install.setVisible(false);

        const showInstallButton = () => {
            if (this.btn_pwa_install) {
                this.btn_pwa_install.setVisible(true);
            }
        };

        // This handler will be called by our custom event from main.js
        const installReadyHandler = () => {
            console.log("PWA install is ready (custom event received).");
            showInstallButton();
        };

        // Listen for the custom event
        window.addEventListener("pwa-install-ready", installReadyHandler);

        // Also check if the prompt is already available
        if (window.deferredPrompt) {
            console.log("PWA prompt was already available.");
            showInstallButton();
        }

        // Configure the button's click handler
        this.btn_pwa_install.button.on("pointerdown", () => {
            const prompt = window.deferredPrompt;
            if (prompt) {
                // Bảo đảm rằng ID người mời vẫn được lưu trữ trong localStorage trước khi cài đặt PWA
                if (this.startappFromUrl) {
                    localStorage.setItem(REFERRER_ID_KEY, this.startappFromUrl);
                    console.log(
                        "Re-saved referrer ID before PWA installation:",
                        this.startappFromUrl
                    );
                }

                // Show the browser's install prompt
                prompt.prompt();
                // Wait for the user to respond
                prompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === "accepted") {
                        console.log("User accepted the PWA installation");
                        this.btn_pwa_install.setVisible(false);
                    } else {
                        console.log("User dismissed the PWA installation");
                    }
                    // We can only use the prompt once, so clear it
                    window.deferredPrompt = null;
                });
            }
        });

        // Add a shutdown event to clean up our custom event listener
        this.events.on("shutdown", () => {
            window.removeEventListener(
                "pwa-install-ready",
                installReadyHandler
            );
            console.log("PWA install ready listener removed.");
        });
    }

    getUrlReferrer() {
        try {
            // Trước tiên kiểm tra URL để lấy tham số startapp
            const urlParams = new URLSearchParams(window.location.search);
            const startapp = urlParams.get("startapp") || "";

            if (startapp) {
                // Nếu tìm thấy startapp trong URL, lưu vào localStorage để sử dụng sau này
                console.log(
                    "URL startapp detected and saving to localStorage:",
                    startapp
                );
                localStorage.setItem(REFERRER_ID_KEY, startapp);
                return startapp;
            } else {
                // Nếu không tìm thấy trong URL, thử đọc từ localStorage
                const savedReferrerId = localStorage.getItem(REFERRER_ID_KEY);
                console.log(
                    "Reading referrer ID from localStorage:",
                    savedReferrerId
                );
                return savedReferrerId || "";
            }
        } catch (error) {
            console.error("Error getting referrer ID:", error);
            // Trong trường hợp lỗi, vẫn thử đọc từ localStorage
            try {
                const savedReferrerId = localStorage.getItem(REFERRER_ID_KEY);
                return savedReferrerId || "";
            } catch {
                return "";
            }
        }
    }

    // BẮT ĐẦU: Helper countdown/lock
    restoreLockIfAny() {
        try {
            const lastEmail = localStorage.getItem(LOGIN_LAST_EMAIL_KEY) || "";
            this.currentEmail = lastEmail || this.currentEmail;
            if (!lastEmail) return;
            const resetTime = localStorage.getItem(
                `${LOGIN_LOCK_PREFIX}${lastEmail}`
            );
            if (!resetTime) return;
            const unlockAt = new Date(resetTime).getTime();
            const now = Date.now();
            if (unlockAt > now) {
                const retryAfter = Math.floor((unlockAt - now) / 1000);
                this.startLockCountdown({
                    email: lastEmail,
                    resetTimeIso: resetTime,
                    retryAfterSeconds: retryAfter,
                    baseMessage:
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.Main.KEY,
                            "You have reached the maximum number of login attempts."
                        ) || "Account temporarily locked",
                });
            } else {
                this.clearLockStorage(lastEmail);
            }
        } catch (e) {
            console.warn("restoreLockIfAny error:", e);
        }
    }

    startLockCountdown({
        email,
        resetTimeIso,
        retryAfterSeconds,
        baseMessage,
    }) {
        // Tính thời điểm mở khóa
        const now = Date.now();
        let unlockAtMs = resetTimeIso
            ? new Date(resetTimeIso).getTime()
            : now + (retryAfterSeconds || 0) * 1000;
        this.lockUntil = unlockAtMs;
        this.currentEmail = email || this.currentEmail || "";

        // Lưu storage để survive refresh
        try {
            const iso = new Date(unlockAtMs).toISOString();
            if (this.currentEmail) {
                localStorage.setItem(
                    `${LOGIN_LOCK_PREFIX}${this.currentEmail}`,
                    iso
                );
                localStorage.setItem(LOGIN_LAST_EMAIL_KEY, this.currentEmail);
                if (retryAfterSeconds != null) {
                    localStorage.setItem(
                        `${LOGIN_LOCK_RETRY_PREFIX}${this.currentEmail}`,
                        String(retryAfterSeconds)
                    );
                }
            }
        } catch {}

        // Clear interval cũ nếu có
        this.clearLockCountdown();

        // Khởi động interval
        this.lockIntervalId = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                const remainingMs = this.lockUntil - Date.now();
                if (remainingMs <= 0) {
                    this.clearLockCountdown();
                    if (this.currentEmail)
                        this.clearLockStorage(this.currentEmail);
                    // Clear message khi hết khoá
                    if (text_respone) {
                        text_respone.setText("");
                    }
                    return;
                }
                const totalSec = Math.ceil(remainingMs / 1000);
                const mm = Math.floor(totalSec / 60)
                    .toString()
                    .padStart(2, "0");
                const ss = (totalSec % 60).toString().padStart(2, "0");
                const countdownText = `${mm}:${ss}`;
                const base = baseMessage || "Account temporarily locked";
                if (text_respone) {
                    text_respone.setText(
                        `${base}\n` +
                            cdLocalization.getLocalization(
                                cdLocalization.GROUP_KEYS.Main.KEY,
                                "Please wait"
                            ) +
                            `: ${countdownText}`
                    );
                }
            },
        });
    }

    clearLockCountdown() {
        try {
            if (this.lockIntervalId && this.lockIntervalId.remove) {
                this.lockIntervalId.remove(false);
            }
        } catch {}
        this.lockIntervalId = null;
    }

    clearLockStorage(email) {
        try {
            localStorage.removeItem(`${LOGIN_LOCK_PREFIX}${email}`);
            localStorage.removeItem(`${LOGIN_LOCK_RETRY_PREFIX}${email}`);
        } catch {}
    }
    // KẾT THÚC: Helper countdown/lock

    CreateInput(scene) {
        let inputRefererValue = scene.startappFromUrl || "";
        let inputEmailValue = "";
        let inputPasswordValue = "";

        //Input referer
        {
            let placeHolderStr = cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Enter referer ID"
            );

            let fontStr = cdLocalization.getCurrentFont();

            // Tạo input HTML
            const inputHTML = `
<form id="referer-form">
    <input 
        type="email" 
        id="refererInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        value="${inputRefererValue}"
        style="
            width:500px; 
            padding: 20px; 
            border-radius:10px; 
            border: 4px solid #ffffff;
            font-size: 40px; 
            font-family: ${fontStr};
            background-color: rgba(255, 255, 255, 0.2); /* Màu nền của input */
            color: #ffffff; /* Màu chữ của text */
            z-index: 1000; /* Đưa lên trên cùng */
        "
    />
    <style>
        #refererInput::placeholder {
            color: #ffffff; /* Màu chữ của placeholder */
            opacity: 0.5; /* Đảm bảo hiển thị rõ ràng placeholder */
        }
        #refererInput:focus {
            outline: none; /* Bỏ viền focus mặc định */
            border: 2px solid #ffffff; /* Thêm viền khi focus */
        }
    </style>
</form>
`;

            // Thêm input field vào game
            input_referer_id = scene.add
                .dom(540, 832 + 100 / 2) // Vị trí trung tâm màn hình
                .createFromHTML(inputHTML);

            container_main_login.add(input_referer_id);

            // Lấy phần tử input
            const inputElement = document.getElementById("refererInput");
            const inputForm = document.getElementById("referer-form"); // Lấy đối tượng FORM

            // Tạo handler cho sự kiện SUBMIT
            const submitHandler = (event) => {
                // NGĂN CHẶN HÀNH VI MẶC ĐỊNH của form (reload trang)
                event.preventDefault();
            };

            // Thêm listener cho sự kiện submit (khi nhấn Enter)
            if (inputForm) {
                inputForm.addEventListener("submit", submitHandler);
            }

            // Set initial value if we have a referrer from URL
            if (scene.startappFromUrl) {
                inputRefererValue = scene.startappFromUrl;
            }

            // Xử lý sự kiện nhập dữ liệu
            inputElement.addEventListener("input", () => {
                inputRefererValue = inputElement.value;

                //console.log("inputValue: ", inputValue);
            });

            // Xử lý sự kiện click ra ngoài
            document.addEventListener("click", (event) => {
                if (!inputElement.contains(event.target)) {
                    inputElement.blur(); // Hủy trạng thái focus
                }
            });
        }
        input_referer_id.setVisible(false);

        //Input mail
        {
            let placeHolderStr = cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Enter email"
            );

            let fontStr = cdLocalization.getCurrentFont();

            // Tạo input HTML
            const inputHTML = `
<form id="mail-form">
    <input 
        type="email" 
        id="mailInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:500px; 
            padding: 20px; 
            border-radius:10px; 
            border: 4px solid #ffffff;
            font-size: 40px; 
            font-family: ${fontStr};
            background-color: rgba(255, 255, 255, 0.2); /* Màu nền của input */
            color: #ffffff; /* Màu chữ của text */
            z-index: 1000; /* Đưa lên trên cùng */
        "
    />
    <style>
        #mailInput::placeholder {
            color: #ffffff; /* Màu chữ của placeholder */
            opacity: 0.5; /* Đảm bảo hiển thị rõ ràng placeholder */
        }
        #mailInput:focus {
            outline: none; /* Bỏ viền focus mặc định */
            border: 2px solid #ffffff; /* Thêm viền khi focus */
        }
    </style>
</form>
`;

            // Thêm input field vào game
            input_mail = scene.add
                .dom(540, 954 + 100 / 2) // Vị trí trung tâm màn hình
                .createFromHTML(inputHTML);

            container_main_login.add(input_mail);

            // Lấy phần tử input
            const inputElement = document.getElementById("mailInput");
            const inputForm = document.getElementById("mail-form"); // Lấy đối tượng FORM

            // Tạo handler cho sự kiện SUBMIT
            const submitHandler = (event) => {
                // NGĂN CHẶN HÀNH VI MẶC ĐỊNH của form (reload trang)
                event.preventDefault();
            };

            // Thêm listener cho sự kiện submit (khi nhấn Enter)
            if (inputForm) {
                inputForm.addEventListener("submit", submitHandler);
            }

            // Xử lý sự kiện nhập dữ liệu
            inputElement.addEventListener("input", () => {
                inputEmailValue = inputElement.value;
                // Lưu email hiện tại để restore countdown
                scene.currentEmail =
                    inputEmailValue || scene.currentEmail || "";
                try {
                    if (scene.currentEmail) {
                        localStorage.setItem(
                            LOGIN_LAST_EMAIL_KEY,
                            scene.currentEmail
                        );
                    }
                } catch {}

                //console.log("inputValue: ", inputValue);
            });

            // Xử lý sự kiện click ra ngoài
            document.addEventListener("click", (event) => {
                if (!inputElement.contains(event.target)) {
                    inputElement.blur(); // Hủy trạng thái focus
                }
            });
        }

        //Input pass
        {
            let placeHolderStr = cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Enter password"
            );

            let fontStr = cdLocalization.getCurrentFont();

            // Tạo input HTML
            const inputHTML = `
<form id="password-form">
    <input 
        type="password" 
        min="0" 
        id="passInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:500px; 
            padding: 20px; 
            border-radius:10px; 
            border: 4px solid #ffffff;
            font-size: 40px; 
            font-family: ${fontStr};
            background-color: rgba(255, 255, 255, 0.2); /* Màu nền của input */
            color: #ffffff; /* Màu chữ của text */
            z-index: 1000; /* Đưa lên trên cùng */
        "
    />
    <style>
        #passInput::placeholder {
            color: #ffffff; /* Màu chữ của placeholder */
            opacity: 0.5; /* Đảm bảo hiển thị rõ ràng placeholder */
        }
        #passInput:focus {
            outline: none; /* Bỏ viền focus mặc định */
            border: 2px solid #ffffff; /* Thêm viền khi focus */
        }
    </style>
</form>
`;

            // Thêm input field vào game
            input_password = scene.add
                .dom(540, 1077 + 100 / 2) // Vị trí trung tâm màn hình
                .createFromHTML(inputHTML);

            container_main_login.add(input_password);

            // Lấy phần tử input
            const inputElement = document.getElementById("passInput");
            const inputForm = document.getElementById("password-form"); // Lấy đối tượng FORM

            // Tạo handler cho sự kiện SUBMIT
            const submitHandler = (event) => {
                // NGĂN CHẶN HÀNH VI MẶC ĐỊNH của form (reload trang)
                event.preventDefault();
            };

            // Thêm listener cho sự kiện submit (khi nhấn Enter)
            if (inputForm) {
                inputForm.addEventListener("submit", submitHandler);
            }

            // Xử lý sự kiện nhập dữ liệu
            inputElement.addEventListener("input", () => {
                inputPasswordValue = inputElement.value;

                //console.log("inputValue: ", inputValue);
            });

            // Xử lý sự kiện click ra ngoài
            document.addEventListener("click", (event) => {
                if (!inputElement.contains(event.target)) {
                    inputElement.blur(); // Hủy trạng thái focus
                }
            });
        }

        btn_register = this.CreateButton1(
            scene,
            540,
            1640,  // NEW: Moved down from 1452.5 (1427 + 51/2) to make space for Vorld button
            "login_btn_1",
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Sign up for an account"
            )
        );
        btn_register.button.on("pointerdown", () => {
            input_referer_id.setVisible(true);

            btn_register_confirm.SetActiveButton(true);
            btn_register_cancel.SetActiveButton(true);

            btn_register.SetActiveButton(false);
            btn_login.SetActiveButton(false);

            btn_forgot_password.setVisible(false);
        });

        btn_register_confirm = this.CreateButton(
            scene,
            178 + 312 / 2,
            1226 + 84 / 2,
            "login_btn_0",
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Confirm"
            )
        );
        btn_register_confirm.button.on("pointerdown", () => {
            this.LoginRegister(
                scene,
                inputRefererValue,
                inputEmailValue,
                inputPasswordValue
            );
        });
        btn_register_confirm.SetActiveButton(false);

        btn_register_cancel = this.CreateButton(
            scene,
            597 + 312 / 2,
            1226 + 84 / 2,
            "login_btn_0",
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Cancel"
            )
        );
        btn_register_cancel.button.on("pointerdown", function () {
            input_referer_id.setVisible(false);

            btn_register_confirm.SetActiveButton(false);
            btn_register_cancel.SetActiveButton(false);

            btn_register.SetActiveButton(true);
            btn_login.SetActiveButton(true);

            btn_forgot_password.setVisible(true);
        });
        btn_register_cancel.SetActiveButton(false);

        btn_login = this.CreateButton(
            scene,
            540,
            1287 + 114 / 2,
            "login_btn_0",
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Login"
            )
        );
        btn_login.button.on("pointerdown", () => {
            this.LoginEmail(scene, inputEmailValue, inputPasswordValue);
        });

        // ========================================
        // NEW: Vorld Login Section
        // ========================================
        
        // Divider text "hoặc"
        const divider_text_vorld = this.add.text(
            540,                                    // Center X (design width 1080)
            1400,                                   // Y position (between Login and Vorld button)
            "─── hoặc ───",                         // Text
            {
                fontSize: '28px',                   // Font size
                color: '#888888',                   // Grey color
                align: 'center',                    // Center alignment
                fontFamily: cdLocalization.getCurrentFont()
            }
        ).setOrigin(0.5, 0.5);                     // Center origin
        
        container_main_login.add(divider_text_vorld);
        
        // Vorld Login Button
        btn_vorld_login = this.CreateButton(
            scene,
            540,                                    // Center X
            1450,                                   // Y position (below divider, above Forgot)
            "login_btn_0",                          // Same texture as Login button
            "Đăng nhập bằng Vorld"                 // Button text
        );
        
        // Add Vorld logo to button (logo on left side of text)
        const vorld_logo = this.add.image(
            420,                                    // X: Left of button text (540 - 120)
            1450,                                   // Y: Same as button
            "vorld_logo"                            // Logo asset key
        ).setDisplaySize(40, 40)                   // Logo size 40x40
         .setOrigin(0.5, 0.5);                     // Center origin
        
        // ========================================
        // NEW: Vorld Login Button Click Handler
        // ========================================
        // Click handler - emit event to show login popup
        btn_vorld_login.button.on("pointerdown", () => {
            console.log("[Vorld Login] Button clicked - showing popup");
            
            // Emit event để hiện Vorld Login Modal
            // Modal sẽ handle việc nhận email/password từ user
            EventBus.emit('show-vorld-login-popup');
            
            // KHÔNG lấy email/password từ form chính nữa
            // User sẽ nhập trong popup riêng
        });
        
        // Add to container
        container_main_login.add(btn_vorld_login);
        container_main_login.add(vorld_logo);      // Add logo to container too
        
        console.log("[Login] Vorld login button created at Y:", 1450);
        
        // ========================================
        // END: Vorld Login Section
        // ========================================

        // btn_login_google = this.CreateButtonGoogle(
        //     scene,
        //     540,
        //     1507 + 68 / 2,
        //     "share_btn_signin_google"
        // );
        // btn_login_google.button.on("pointerdown", () => {
        //     this.LoginGoogle(scene);
        // });

        btn_forgot_password = this.add
            .text(
                540,
                1550,  // NEW: Moved down from 1221 to make space for Vorld button
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Forgot password"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "32px",
                    color: "#ffffff",
                    align: "center",
                }
            )
            .setOrigin(0.5, 0)
            .setInteractive() // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {
                btn_forgot_password_confirm.SetActiveButton(true);
                btn_forgot_password_cancel.SetActiveButton(true);

                btn_register.SetActiveButton(false);
                btn_login.SetActiveButton(false);

                btn_forgot_password.setVisible(false);

                input_password.setVisible(false);
            })
            .on("pointerup", function () {})
            .on("pointerover", function () {
                this.scene.tweens.add({
                    targets: btn_forgot_password,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                this.scene.tweens.add({
                    targets: btn_forgot_password,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });

        container_main_login.add(btn_forgot_password);

        btn_forgot_password_confirm = this.CreateButton(
            scene,
            178 + 312 / 2,
            1226 + 84 / 2,
            "login_btn_0",
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Confirm"
            )
        );
        btn_forgot_password_confirm.button.on("pointerdown", () => {
            this.LoginForgotPassword(scene, inputEmailValue);
        });
        btn_forgot_password_confirm.SetActiveButton(false);

        btn_forgot_password_cancel = this.CreateButton(
            scene,
            597 + 312 / 2,
            1226 + 84 / 2,
            "login_btn_0",
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Cancel"
            )
        );
        btn_forgot_password_cancel.button.on("pointerdown", function () {
            btn_forgot_password_confirm.SetActiveButton(false);
            btn_forgot_password_cancel.SetActiveButton(false);

            btn_register.SetActiveButton(true);
            btn_login.SetActiveButton(true);

            btn_forgot_password.setVisible(true);

            input_password.setVisible(true);
        });
        btn_forgot_password_cancel.SetActiveButton(false);
    }

    LoginEmail(scene, email, password) {
        if (email == null || email === "") {
            text_respone.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Email must not be empty"
                )
            );

            return;
        }

        if (password == null || password === "") {
            text_respone.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Password must not be empty"
                )
            );

            return;
        }

        // Pre-check: nếu email nhập trùng email đang lock và chưa hết thời gian, chỉ hiển thị countdown, không gửi request
        try {
            if (email) {
                const resetTime = localStorage.getItem(
                    `${LOGIN_LOCK_PREFIX}${email}`
                );
                if (resetTime) {
                    const unlockAt = new Date(resetTime).getTime();
                    const now = Date.now();
                    if (unlockAt > now) {
                        const retryAfter = Math.floor((unlockAt - now) / 1000);
                        const baseMessage =
                            cdLocalization.getLocalization(
                                cdLocalization.GROUP_KEYS.Main.KEY,
                                "You have reached the maximum number of login attempts."
                            ) || "Account temporarily locked";
                        // Hiển thị thông điệp ngay lập tức và khởi động countdown
                        if (text_respone) {
                            text_respone.setText(baseMessage);
                        }
                        this.startLockCountdown({
                            email,
                            resetTimeIso: resetTime,
                            retryAfterSeconds: retryAfter,
                            baseMessage,
                        });
                        return;
                    }
                }
            }
        } catch {}

        CreateLoadingPopup();

        centerData.RequestSigninEmail(
            email,
            password,
            (result) => {
                HideLoadingPopup();
                //console.log("Đăng nhập thành công:", result);
                // Thực hiện các hành động khi đăng nhập thành công

                // Xóa lock nếu từng có
                this.clearLockStorage(email);
                this.clearLockCountdown();

                this.InitSocket();

                CreateLoadingPopup();

                centerData.RequestUpdateWallet(
                    centerData.GetWalletAddress(),
                    () => {
                        HideLoadingPopup();
                    },
                    (error) => {
                        HideLoadingPopup();
                        // console.log(
                        //     "LoginEmail update wallet failed: " + error.message
                        // );
                    }
                );

                this.GetPlayerInfo(scene);
            },
            (error) => {
                HideLoadingPopup();

                // console.log("LoginEmail failed:", error);
                // Thực hiện các hành động khi đăng nhập thất bại

                // Chuẩn hóa lỗi 429
                const status = error?.status || error?.code || 0;
                const errorKey = error?.error || "";
                const details = error?.details || {};
                const isRateLimited =
                    Number(status) === 429 ||
                    errorKey === "TOO_MANY_LOGIN_ATTEMPTS" ||
                    typeof details.retryAfter === "number" ||
                    typeof details.resetTime === "string";

                if (isRateLimited) {
                    // Lấy dữ liệu countdown
                    const retryAfterSeconds =
                        typeof details.retryAfter === "number"
                            ? details.retryAfter
                            : null;
                    const resetTimeIso =
                        typeof details.resetTime === "string"
                            ? details.resetTime
                            : null;

                    // Lưu storage và start countdown
                    try {
                        if (email)
                            localStorage.setItem(LOGIN_LAST_EMAIL_KEY, email);
                    } catch {}

                    const baseMessage =
                        error?.message ||
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.Main.KEY,
                            "You have reached the maximum number of login attempts."
                        ) ||
                        "You have attempted to log in too many times.";

                    // Hiển thị thông điệp ngay lập tức
                    if (text_respone && baseMessage) {
                        text_respone.setText(baseMessage);
                    }

                    // Khởi động countdown + khóa UI
                    this.startLockCountdown({
                        email,
                        resetTimeIso,
                        retryAfterSeconds,
                        baseMessage,
                    });

                    return; // Không xử lý tiếp nhánh lỗi chung
                }

                const displayMessage =
                    (typeof error === "string" && error) ||
                    error?.message ||
                    error?.response?.data?.message ||
                    error?.data?.message ||
                    error?.error ||
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.Main.KEY,
                        "Email or password is incorrect"
                    ) ||
                    "Invalid credentials";
                text_respone.setText(displayMessage);
            }
        );
    }

    LoginRegister(scene, reference_id, email, password) {
        if (email == null || email === "") {
            text_respone.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Email must not be empty"
                )
            );

            return;
        }

        if (password == null || password === "") {
            text_respone.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Password must not be empty"
                )
            );

            return;
        }

        CreateLoadingPopup();

        centerData.RequestRegisterEmail(
            reference_id,
            email,
            password,
            (result) => {
                HideLoadingPopup();
                //console.log("Đăng nhập thành công:", result);
                // Thực hiện các hành động khi đăng nhập thành công

                this.InitSocket();

                CreateLoadingPopup();
                centerData.RequestUpdateWallet(
                    centerData.GetWalletAddress(),
                    () => {
                        HideLoadingPopup();
                    },
                    (error) => {
                        HideLoadingPopup();
                        // console.log(
                        //     "LoginRegister update wallet failed: " +
                        //         error.message
                        // );
                    }
                );

                this.GetPlayerInfo(scene);
            },
            (error) => {
                HideLoadingPopup();
                //console.log("RequestRegisterEmail failed:", error);
                // Thực hiện các hành động khi đăng nhập thất bại

                let str = `${error.message}\n`;

                if (error.errors) {
                    // for (let i = 0; i < error.errors.length; i++) {
                    //     str += `${error.errors[i].message}\n`;
                    // }

                    str += `${error.errors[0].message}\n`;
                }

                text_respone.setText(str);
            }
        );
    }

    LoginForgotPassword(scene, email) {
        if (email == null || email === "") {
            text_respone.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Email must not be empty"
                )
            );

            return;
        }

        CreateLoadingPopup();

        centerData.RequestEmailForgotPassword(
            email,
            (result) => {
                HideLoadingPopup();
                //console.log("Đăng nhập thành công:", result);
                // Thực hiện các hành động khi đăng nhập thành công

                let str = `${result.message}\n`;

                text_respone.setText(str);
            },
            (error) => {
                HideLoadingPopup();
                //console.log("RequestRegisterEmail failed:", error);
                // Thực hiện các hành động khi đăng nhập thất bại

                let str = `${error.message}\n`;

                text_respone.setText(str);
            }
        );
    }

    // Vorld Auth: Login with Vorld backend
    async RequestVorldLogin(email, password) {
        if (!email || email === '') {
            text_respone.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    'Email must not be empty'
                )
            );
            return;
        }

        if (!password || password === '') {
            text_respone.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    'Password must not be empty'
                )
            );
            return;
        }

        console.log('🔐 Vorld Login requested:', email);

        CreateLoadingPopup();

        try {
            const result = await vorldAuth.login(email, password);

            HideLoadingPopup();

            if (result.success) {
                if (result.needsOTP) {
                    console.log('✅ Vorld login OK - OTP required');
                    text_respone.setText('Please check your email for OTP code');

                    // Emit event to show OTP in React
                    EventBus.emit('vorld:show-otp', { email });

                    // Listen for OTP success
                    EventBus.once('vorld:otp-success', (data) => {
                        console.log('✅ Vorld OTP success:', data);
                        this.handleVorldLoginSuccess(data);
                    });
                } else {
                    console.log('✅ Vorld login OK - No OTP needed');
                    this.handleVorldLoginSuccess(result.data);
                }
            } else {
                console.error('❌ Vorld login failed:', result.error);
                text_respone.setText(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Vorld login error:', error);
            HideLoadingPopup();
            text_respone.setText('Login failed. Please try again.');
        }
    }

    // Vorld Auth: Handle successful login
    handleVorldLoginSuccess(data) {
        console.log('✅ Vorld login complete, starting Home');

        // Save user data (như login hiện tại)
        if (data.user) {
            centerData.userInfo = data.user;
        }

        // Initialize socket connections (như LoginEmail)
        this.InitSocket();

        CreateLoadingPopup();

        // Update wallet if needed (như LoginEmail)
        centerData.RequestUpdateWallet(
            centerData.GetWalletAddress(),
            () => {
                HideLoadingPopup();
                // Go to Home scene
                this.scene.start('Home');
            },
            (error) => {
                HideLoadingPopup();
                console.error('Update wallet error:', error);
                // Still go to Home even if wallet update fails
                this.scene.start('Home');
            }
        );
    }

    RegisterGoogleButtonLogin(scene, onConnected, onDisconected) {
        EventBus.on("react-google-button-login", (data) => {
            // console.log("EventBus RegisterGoogleButtonLogin: ", data);

            CreateLoadingPopup();

            centerData.RequestSigninGoogle(
                data.credential,
                (result) => {
                    centerData.SetIsGoogleLogin(true);

                    HideLoadingPopup();
                    //console.log("Đăng nhập thành công:", result);
                    // Thực hiện các hành động khi đăng nhập thành công

                    this.InitSocket();

                    centerData.RequestUpdateWallet(
                        centerData.GetWalletAddress(),
                        () => {},
                        (error) => {}
                    );

                    this.GetPlayerInfo(scene);
                },
                (error) => {
                    HideLoadingPopup();
                    // console.log(
                    //     "EventBus RegisterGoogleButtonLogin error: ",
                    //     error
                    // );
                }
            );

            if (onConnected && typeof onConnected === "function") {
                onConnected(data);
            }
        });

        EventBus.on("react-google-button-login-error", (error) => {
            // console.log("EventBus RegisterGoogleButtonLogin error: ", error);

            if (onDisconected && typeof onDisconected === "function") {
                onDisconected(error);
            }
        });
    }

    RemoveGoogleButtonLogin() {
        EventBus.off("react-google-button-login");
        EventBus.off("react-google-button-login-error");
    }

    // Hàm kết nối ví
    LoginGoogle(onConnected, onDisconected) {
        EventBus.emit(
            "react-login-google",
            (data) => {
                // console.log("EventBus LoginGoogle: ", data);

                if (onConnected && typeof onConnected === "function") {
                    onConnected(data);
                }
            },
            (error) => {
                if (onDisconected && typeof onDisconected === "function") {
                    onDisconected(error);
                }

                // console.log("EventBus LoginGoogle error: ", error);
            }
        );
    }

    GetPlayerInfo(scene) {
        HideGoogleButtonLogin();

        centerData.RequestUserInfo(
            (result) => {
                // console.log("lấy thông tin thành công:", result);

                scene.scene.start("Home");
            },
            (error) => {
                //console.log("lấy thông tin thất bại:", error);
            }
        );
    }

    InitSocket() {
        socketService.connectSocket();

        socketServiceBoss.connectSocket();

        socketServiceMultiplayerBoss.connectSocket();

        //socketServiceChatGuild.connectSocket();
    }

    CreateButton(scene, x, y, imageKey, buttonName) {
        let btnWidth = 400;
        let btnHeight = 114;

        const btn_container = scene.add.container(x, y);
        container_main_login.add(btn_container);

        const btn_inner_container = scene.add.container(
            -btnWidth / 2,
            -btnHeight / 2
        );
        btn_container.add(btn_inner_container);

        btn_container.button = scene.add
            .image(0, 0, imageKey)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {})
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        btn_inner_container.add(btn_container.button);

        btn_container.text = scene.add
            .text(
                btnWidth / 2,
                btnHeight / 2,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    buttonName
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(), // Font-family
                    fontSize: "55px", // Font-size
                    color: "#FFF", // Màu chữ (color)
                    align: "center",
                }
            )
            .setOrigin(0.5, 0.5);

        btn_inner_container.add(btn_container.text);

        btn_container.SetActiveButton = function (boolVal) {
            if (boolVal) {
                btn_container.button.setVisible(true);
                btn_container.text.setVisible(true);

                btn_container.button.setInteractive();
            } else {
                btn_container.button.setVisible(false);
                btn_container.text.setVisible(false);

                btn_container.button.disableInteractive();
            }
        };

        return btn_container;
    }

    CreateButton1(scene, x, y, imageKey, buttonName) {
        let btnWidth = 407;
        let btnHeight = 51;

        const btn_container = scene.add.container(x, y);
        container_main_login.add(btn_container);

        const btn_inner_container = scene.add.container(
            -btnWidth / 2,
            -btnHeight / 2
        );
        btn_container.add(btn_inner_container);

        btn_container.button = scene.add
            .image(0, 0, imageKey)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {})
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        btn_inner_container.add(btn_container.button);

        btn_container.text = scene.add
            .text(
                btnWidth / 2,
                btnHeight / 2,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    buttonName
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(), // Font-family
                    fontSize: "31px", // Font-size
                    color: "#FFF", // Màu chữ (color)
                    align: "center",
                }
            )
            .setOrigin(0.5, 0.5);

        btn_inner_container.add(btn_container.text);

        btn_container.SetActiveButton = function (boolVal) {
            if (boolVal) {
                btn_container.button.setVisible(true);
                btn_container.text.setVisible(true);

                btn_container.button.setInteractive();
            } else {
                btn_container.button.setVisible(false);
                btn_container.text.setVisible(false);

                btn_container.button.disableInteractive();
            }
        };

        return btn_container;
    }

    CreateButtonGoogle(scene, x, y, imageKey) {
        let btnWidth = 300;
        let btnHeight = 68;

        const btn_container = scene.add.container(x, y);
        container_main_login.add(btn_container);

        const btn_inner_container = scene.add.container(
            -btnWidth / 2,
            -btnHeight / 2
        );
        btn_container.add(btn_inner_container);

        btn_container.button = scene.add
            .image(0, 0, imageKey)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {})
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        btn_inner_container.add(btn_container.button);

        btn_container.SetActiveButton = function (boolVal) {
            if (boolVal) {
                btn_container.button.setVisible(true);

                btn_container.button.setInteractive();
            } else {
                btn_container.button.setVisible(false);

                btn_container.button.disableInteractive();
            }
        };

        return btn_container;
    }
}

export default Login;

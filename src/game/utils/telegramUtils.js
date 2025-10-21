/**
 * Telegram Utilities
 * Xử lý các vấn đề liên quan đến Telegram Mini App
 */

export class TelegramUtils {
    /**
     * Kiểm tra xem có đang chạy trong Telegram Mini App không
     * @returns {boolean} - True nếu đang chạy trong Telegram
     */
    static isTelegramMiniApp() {
        return (
            typeof window !== "undefined" &&
            window.Telegram &&
            window.Telegram.WebApp &&
            window.Telegram.WebApp.initData
        );
    }

    /**
     * Xử lý lỗi khi chạy ngoài Telegram
     * @param {Error} error - Lỗi từ Telegram SDK
     */
    static handleTelegramError(error) {
        if (
            error.message &&
            error.message.includes("Unable to retrieve launch parameters")
        ) {
            console.warn(
                "App đang chạy ngoài Telegram Mini App. Một số tính năng có thể không hoạt động."
            );
            return true; // Đã xử lý lỗi
        }
        return false; // Chưa xử lý lỗi
    }

    /**
     * Khởi tạo Telegram WebApp an toàn
     * @param {Function} onSuccess - Callback khi thành công
     * @param {Function} onError - Callback khi có lỗi
     */
    static initTelegramWebApp(onSuccess, onError) {
        try {
            if (this.isTelegramMiniApp()) {
                if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.ready();
                    if (onSuccess) onSuccess();
                }
            } else {
                console.log("App đang chạy ngoài Telegram Mini App");
                if (onSuccess) onSuccess(); // Vẫn gọi success để app tiếp tục chạy
            }
        } catch (error) {
            console.warn("Lỗi khởi tạo Telegram WebApp:", error);
            if (onError) onError(error);
        }
    }

    /**
     * Lấy thông tin user từ Telegram
     * @returns {Object|null} - Thông tin user hoặc null
     */
    static getTelegramUser() {
        try {
            if (
                this.isTelegramMiniApp() &&
                window.Telegram.WebApp.initDataUnsafe
            ) {
                return window.Telegram.WebApp.initDataUnsafe.user;
            }
        } catch (error) {
            console.warn("Lỗi lấy thông tin user Telegram:", error);
        }
        return null;
    }

    /**
     * Lấy theme từ Telegram
     * @returns {string} - Theme hiện tại
     */
    static getTelegramTheme() {
        try {
            if (
                this.isTelegramMiniApp() &&
                window.Telegram.WebApp.colorScheme
            ) {
                return window.Telegram.WebApp.colorScheme;
            }
        } catch (error) {
            console.warn("Lỗi lấy theme Telegram:", error);
        }
        return "light"; // Default theme
    }

    /**
     * Áp dụng theme Telegram cho app
     */
    static applyTelegramTheme() {
        try {
            const theme = this.getTelegramTheme();
            document.documentElement.setAttribute("data-theme", theme);

            // Áp dụng CSS variables cho Telegram theme
            if (
                this.isTelegramMiniApp() &&
                window.Telegram.WebApp.themeParams
            ) {
                const themeParams = window.Telegram.WebApp.themeParams;
                const root = document.documentElement;

                if (themeParams.bg_color) {
                    root.style.setProperty(
                        "--tg-bg-color",
                        `#${themeParams.bg_color.toString(16)}`
                    );
                }
                if (themeParams.text_color) {
                    root.style.setProperty(
                        "--tg-text-color",
                        `#${themeParams.text_color.toString(16)}`
                    );
                }
                if (themeParams.hint_color) {
                    root.style.setProperty(
                        "--tg-hint-color",
                        `#${themeParams.hint_color.toString(16)}`
                    );
                }
                if (themeParams.link_color) {
                    root.style.setProperty(
                        "--tg-link-color",
                        `#${themeParams.link_color.toString(16)}`
                    );
                }
                if (themeParams.button_color) {
                    root.style.setProperty(
                        "--tg-button-color",
                        `#${themeParams.button_color.toString(16)}`
                    );
                }
                if (themeParams.button_text_color) {
                    root.style.setProperty(
                        "--tg-button-text-color",
                        `#${themeParams.button_text_color.toString(16)}`
                    );
                }
            }
        } catch (error) {
            console.warn("Lỗi áp dụng theme Telegram:", error);
        }
    }

    /**
     * Hiển thị thông báo trong Telegram
     * @param {string} message - Nội dung thông báo
     * @param {string} type - Loại thông báo ('info', 'success', 'error')
     */
    static showTelegramAlert(message, type = "info") {
        try {
            if (this.isTelegramMiniApp() && window.Telegram.WebApp.showAlert) {
                window.Telegram.WebApp.showAlert(message);
            } else {
                // Fallback cho khi không chạy trong Telegram
                alert(message);
            }
        } catch (error) {
            console.warn("Lỗi hiển thị thông báo Telegram:", error);
            alert(message); // Fallback
        }
    }

    /**
     * Hiển thị confirm dialog trong Telegram
     * @param {string} message - Nội dung thông báo
     * @param {Function} onConfirm - Callback khi user confirm
     * @param {Function} onCancel - Callback khi user cancel
     */
    static showTelegramConfirm(message, onConfirm, onCancel) {
        try {
            if (
                this.isTelegramMiniApp() &&
                window.Telegram.WebApp.showConfirm
            ) {
                window.Telegram.WebApp.showConfirm(message, (confirmed) => {
                    if (confirmed && onConfirm) {
                        onConfirm();
                    } else if (!confirmed && onCancel) {
                        onCancel();
                    }
                });
            } else {
                // Fallback cho khi không chạy trong Telegram
                const confirmed = confirm(message);
                if (confirmed && onConfirm) {
                    onConfirm();
                } else if (!confirmed && onCancel) {
                    onCancel();
                }
            }
        } catch (error) {
            console.warn("Lỗi hiển thị confirm Telegram:", error);
            const confirmed = confirm(message);
            if (confirmed && onConfirm) {
                onConfirm();
            } else if (!confirmed && onCancel) {
                onCancel();
            }
        }
    }

    /**
     * Tạo deep link URL cho Google account linking
     * @param {string} baseUrl - Base URL của app
     * @param {string} token - Telegram token
     * @returns {string} - Deep link URL
     */
    static createDeepLinkUrl(baseUrl, token) {
        const timestamp = Date.now();
        const params = new URLSearchParams({
            token: token,
            timestamp: timestamp.toString(),
        });

        return `${baseUrl}/link-google-account?${params.toString()}`;
    }

    /**
     * Copy text to clipboard với fallback
     * @param {string} text - Text cần copy
     * @returns {Promise<boolean>} - True nếu copy thành công
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback cho browsers cũ
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const success = document.execCommand("copy");
                document.body.removeChild(textarea);
                return success;
            }
        } catch (error) {
            console.error("Copy to clipboard failed:", error);
            return false;
        }
    }
}

export default TelegramUtils;

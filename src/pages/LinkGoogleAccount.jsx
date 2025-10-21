import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import centerData from "../game/Data/CenterData.js";
import { setTokens } from "../game/Data/APIBase.js";

const LinkGoogleAccount = () => {
    const [telegramToken, setTelegramToken] = useState(null);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        centerData.SetAccessToken(token);
        setTokens(token, "");
        const timestamp = urlParams.get("timestamp");

        if (!token || !timestamp) {
            setError("Tham số link không hợp lệ");
            return;
        }

        // Check timestamp (5 minutes expiry)
        const linkAge = Date.now() - parseInt(timestamp);
        if (linkAge > 60000) {
            // 5 minutes
            setError("Link đã hết hạn. Vui lòng thử lại.");
            return;
        }

        setTelegramToken(token);
    }, []);

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError(null);

        try {
            // Call backend to link accounts
            centerData.RequestSigninGoogleLinkTelegram(
                credentialResponse.credential,
                () => {
                    setIsSuccess(true);
                },
                (error) => {
                    setError(error.message || "Liên kết thất bại");
                }
            );
        } catch (error) {
            console.error("Link Google error:", error);
            setError("Lỗi mạng. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Đăng nhập Google thất bại");
    };

    if (error) {
        return (
            <div className="link-google-page error-page">
                <div className="container">
                    <h2>❌ Lỗi</h2>
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="link-google-page success-page">
                <div className="container">
                    <h2>✅ Liên kết thành công!</h2>
                    <p>
                        Tài khoản Google đã được liên kết với tài khoản Telegram
                        game.
                    </p>
                </div>
            </div>
        );
    }

    if (!telegramToken) {
        return (
            <div className="link-google-page loading-page">
                <div className="container">
                    <h2>Đang tải...</h2>
                    <p>Vui lòng chờ trong giây lát.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="link-google-page">
            <div className="container">
                <h2>Liên kết tài khoản Google</h2>
                <p className="description">
                    Bạn đang liên kết tài khoản Google với tài khoản Telegram
                    game.
                </p>

                <div className="google-login-container">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        size="large"
                        theme="outline"
                        text="signin_with"
                        shape="rectangular"
                    />
                </div>

                {isLoading && (
                    <div className="loading-overlay">
                        <p>Đang xử lý...</p>
                    </div>
                )}

                <div className="help-text">
                    <p>Nếu gặp vấn đề, vui lòng:</p>
                    <ul>
                        <li>Kiểm tra kết nối internet</li>
                        <li>Thử lại sau vài phút</li>
                        <li>Liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LinkGoogleAccount;


/**
 * AuthService - Authentication Service
 * Extracted from CenterData.js
 *
 * Handles all authentication-related operations:
 * - Telegram login
 * - Email signin/signup
 * - Google signin
 * - Password recovery
 * - Token management
 * - Logout
 */

import { ServiceBase } from '../core/ServiceBase.js';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { setTokens } from '../APIBase.js';

export class AuthService extends ServiceBase {
    constructor() {
        super();
    }

    // ===========================
    // TOKEN MANAGEMENT
    // ===========================

    GetAccessToken() {
        return sessionStorage.getItem("accessToken");
    }

    SetAccessToken(tokenStr) {
        sessionStorage.setItem("accessToken", tokenStr);
    }

    GetRefreshToken() {
        return sessionStorage.getItem("refreshToken");
    }

    SetRefreshToken(tokenStr) {
        sessionStorage.setItem("refreshToken", tokenStr);
    }

    // ===========================
    // LOGIN METHODS
    // ===========================

    RequestLoginTelegram(onSuccess, onError) {
        const url = this.endpoints.AUTH.LOGIN_TELEGRAM;

        const { initDataRaw, initData, startParam } = retrieveLaunchParams();

        console.log("telegram initData: ", initData);

        // Lấy startapp từ URL parameters nếu có (cho web)
        const urlParams = new URLSearchParams(window.location.search);
        const startappFromUrl = urlParams.get("startapp") || "";

        // Ưu tiên startapp từ URL (web), nếu không thì dùng startParam (Telegram)
        const finalStartapp = startappFromUrl || startParam || "";

        const bodyData = {
            query_id: initDataRaw,
            reference_id: finalStartapp,
        };

        // Sử dụng apiClient với then() và catch()
        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result) {
                    // Lưu token vào localStorage
                    this.SetAccessToken(result.data.accessToken);
                    this.SetRefreshToken(result.data.refreshToken);

                    setTokens(
                        result.data.accessToken,
                        result.data.refreshToken
                    );

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Login failed");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response?.data || error.message || "Network Error"
                    );
                }
            });
    }

    RequestSigninEmail(email, password, onSuccess, onError) {
        const url = this.endpoints.AUTH.SIGNIN_EMAIL;

        const bodyData = {
            email: email,
            password: password,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    // Lưu token vào sessionStorage
                    this.SetAccessToken(result.data.accessToken);
                    this.SetRefreshToken(result.data.refreshToken);

                    setTokens(
                        result.data.accessToken,
                        result.data.refreshToken
                    );

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Signin failed");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response?.data || error.message || "Network Error"
                    );
                }
            });
    }

    RequestRegisterEmail(reference_id, email, password, onSuccess, onError) {
        const url = this.endpoints.AUTH.REGISTER_EMAIL;

        const bodyData = {
            reference_id: reference_id,
            email: email,
            password: password,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    // Lưu token vào sessionStorage
                    this.SetAccessToken(result.data.accessToken);
                    this.SetRefreshToken(result.data.refreshToken);

                    setTokens(
                        result.data.accessToken,
                        result.data.refreshToken
                    );

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Register failed");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response?.data || error.message || "Network Error"
                    );
                }
            });
    }

    RequestEmailForgotPassword(email, onSuccess, onError) {
        const url = this.endpoints.AUTH.FORGOT_PASSWORD;

        const bodyData = {
            email: email,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Failed to send reset email");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response?.data || error.message || "Network Error"
                    );
                }
            });
    }

    RequestSigninGoogle(credential, onSuccess, onError) {
        const url = this.endpoints.AUTH.SIGNIN_GOOGLE;

        // Lấy startapp từ URL parameters nếu có (cho web)
        const urlParams = new URLSearchParams(window.location.search);
        const startappFromUrl = urlParams.get("startapp") || "";

        const bodyData = {
            credential: credential,
            reference_id: startappFromUrl,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    // Lưu token vào sessionStorage
                    this.SetAccessToken(result.data.accessToken);
                    this.SetRefreshToken(result.data.refreshToken);

                    setTokens(
                        result.data.accessToken,
                        result.data.refreshToken
                    );

                    // Gọi hàm callback thành công nếu có
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result || "Google signin failed");
                    }
                }
            })
            .catch((error) => {
                // Gọi hàm callback thất bại nếu có
                if (onError && typeof onError === "function") {
                    onError(
                        error.response?.data || error.message || "Network Error"
                    );
                }
            });
    }

    // ===========================
    // LOGOUT
    // ===========================

    LogOut() {
        this.SetAccessToken("");
        this.SetRefreshToken("");
        // Note: Full logout (including reload) will be handled by CenterData
        // This just clears the tokens
    }
}

export default AuthService;

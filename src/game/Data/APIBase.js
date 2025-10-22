import axios from "axios";
import ENV from "../../config/env.js";

// // Cấu hình base URL cho tất cả các request


export const API_BASE_URL = ENV.API_BASE_URL;

// Biến lưu trữ token
let accessToken = null;
let refreshToken = null;

// Hàng đợi các request đang chờ
let isRefreshing = false;
let failedQueue = [];

// Hàm xử lý các request bị lỗi
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Tạo một instance axios tùy chỉnh
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor cho Request: Thêm token vào header trước khi gửi
apiClient.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho Response: Xử lý lỗi token hết hạn
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Xử lý lỗi hết hạn token (hoặc lỗi 401 Unauthorized)
        if (
            error.response.status === 401 &&
            error.response.data.code === "TOKEN_EXPIRED" &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                // Nếu đang trong quá trình refresh, thêm request vào hàng đợi
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers[
                            "Authorization"
                        ] = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise(async (resolve, reject) => {
                try {
                    console.log("Access token expired. Refreshing...");
                    const refreshResponse = await axios.post(
                        `${API_BASE_URL}/api/auth/refresh`,
                        {
                            refreshToken: refreshToken,
                        }
                    );

                    const newAccessToken =
                        refreshResponse.data.data.accessToken;
                    const newRefreshToken =
                        refreshResponse.data.data.refreshToken;

                    // Cập nhật token mới
                    setTokens(newAccessToken, newRefreshToken);

                    // Cập nhật header cho request ban đầu
                    originalRequest.headers[
                        "Authorization"
                    ] = `Bearer ${newAccessToken}`;

                    // Thực thi lại các request trong hàng đợi
                    processQueue(null, newAccessToken);

                    // Trả về kết quả của request ban đầu
                    resolve(apiClient(originalRequest));
                } catch (refreshError) {
                    console.error("Failed to refresh token:", refreshError);
                    // Xóa token và chuyển hướng đến trang đăng nhập nếu refresh token cũng hết hạn
                    clearTokens();
                    // Thông báo cho các request trong hàng đợi
                    processQueue(refreshError);
                    reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            });
        }

        return Promise.reject(error);
    }
);

// Hàm lưu trữ token
const setTokens = (newAccessToken, newRefreshToken) => {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    // Lưu token vào sessionStorage để duy trì trạng thái đăng nhập
    sessionStorage.setItem("accessToken", newAccessToken);
    sessionStorage.setItem("refreshToken", newRefreshToken);
};

// Hàm xóa token
const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
};

// Load token từ sessionStorage khi khởi động
const loadTokens = () => {
    accessToken = sessionStorage.getItem("accessToken");
    refreshToken = sessionStorage.getItem("refreshToken");
};

loadTokens();

export { apiClient, setTokens, clearTokens };

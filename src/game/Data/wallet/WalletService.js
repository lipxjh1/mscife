/**
 * WalletService - Wallet & Transaction Management Service
 * Extracted from CenterData.js
 *
 * Handles all wallet and transaction-related operations:
 * - Wallet management (update, withdraw)
 * - Transaction history (general, musk, chip, MSCI)
 * - MSCI operations (convert, orders, dashboard, history)
 * - Tokenomics data
 * - Rate and exchange information
 */

import { ServiceBase } from '../core/ServiceBase.js';

export class WalletService extends ServiceBase {
    constructor() {
        super();

        // Wallet data
        this.walletAddress = null;
        this.receiver = null;
    }

    // ===========================
    // WALLET ADDRESS MANAGEMENT
    // ===========================

    GetWalletAddress() {
        return this.walletAddress;
    }

    SetWalletAddress(address) {
        this.walletAddress = address;
        console.log("SetWalletAddress:", address);
    }

    GetReceiverAddress() {
        return this.receiver;
    }

    SetReceiverAddress(address) {
        this.receiver = address;
    }

    // ===========================
    // WALLET OPERATIONS
    // ===========================

    RequestUpdateWallet(walletId, onSuccess, onError) {
        const url = this.endpoints.USER.UPDATE_WALLET;

        const bodyData = {
            walletId: walletId,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Update wallet failed"
                    );
                }
            });
    }

    RequestWalletWithdraw(tonWalletAddress, muskAmount, onSuccess, onError) {
        const url = this.endpoints.WALLET.WITHDRAW_REQUEST;

        const bodyData = {
            tonWalletAddress: tonWalletAddress,
            muskAmount: muskAmount,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Wallet withdraw failed"
                    );
                }
            });
    }

    RequestMuskRate(onSuccess, onError) {
        const url = `/api/config/rate`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.receiver) {
                    this.SetReceiverAddress(result.receiver);

                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.message || "Failed to get musk rate");
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Failed to get musk rate"
                    );
                }
            });
    }

    // ===========================
    // TRANSACTION HISTORY
    // ===========================

    RequestTransactionHistory(page, onSuccess, onError) {
        const url = `/api/me/transactions?page=${page}&limit=10`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Get transaction history failed"
                    );
                }
            });
    }

    RequestTransactionHistoryMusk(page, onSuccess, onError) {
        const url = `/api/transactions/musk?page=${page}&limit=10`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Get transaction history musk failed"
                    );
                }
            });
    }

    RequestTransactionHistoryChip(page, onSuccess, onError) {
        const url = `/api/transactions/chip?page=${page}&limit=10`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Get transaction history chip failed"
                    );
                }
            });
    }

    RequestTransactionHistoryMSCI(page, onSuccess, onError) {
        const url = `/api/transactions/msci?page=${page}&limit=10`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result);
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Get transaction history MSCI failed"
                    );
                }
            });
    }

    // ===========================
    // MSCI OPERATIONS
    // ===========================

    RequestMSCIOrders(onSuccess, onError) {
        const url = `/api/market/orders/token/me`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.message || "Failed to get MSCI orders");
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Failed to get MSCI orders"
                    );
                }
            });
    }

    RequestCenterMarketMSCIOrderCancel(_id, onSuccess, onError) {
        const url = `/api/market/order/token/${_id}`;

        this.apiClient
            .delete(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.message);
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Cancel MSCI order failed"
                    );
                }
            });
    }

    RequestMSCIDashboard(onSuccess, onError) {
        const url = `/api/me/msci/dashboard`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Failed to get MSCI dashboard"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Failed to get MSCI dashboard"
                    );
                }
            });
    }

    RequestMSCIConvert(chipAmount, onSuccess, onError) {
        const url = `/api/me/msci/convert`;

        const bodyData = {
            chipAmount: chipAmount,
        };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(result.message || "Failed to convert MSCI");
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Failed to convert MSCI"
                    );
                }
            });
    }

    RequestMSCIHistory(page, onSuccess, onError) {
        const url = `/api/me/msci/conversion-history?page=${page}`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Failed to get MSCI history"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Failed to get MSCI history"
                    );
                }
            });
    }

    // ===========================
    // TOKENOMICS
    // ===========================

    RequestTokenomicDetail(onSuccess, onError) {
        const url = `/api/stats/tokenomics`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message || "Failed to get tokenomic detail"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Failed to get tokenomic detail"
                    );
                }
            });
    }

    RequestTokenomicSlugDetail(slug, page, onSuccess, onError) {
        const url = `/api/stats/tokenomics/${slug}/history?page=${page}`;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    if (onSuccess && typeof onSuccess === "function") {
                        onSuccess(result);
                    }
                } else {
                    if (onError && typeof onError === "function") {
                        onError(
                            result.message ||
                                "Failed to get tokenomic slug detail"
                        );
                    }
                }
            })
            .catch((error) => {
                if (onError && typeof onError === "function") {
                    onError(
                        error.message ||
                            error.response?.data ||
                            "Failed to get tokenomic slug detail"
                    );
                }
            });
    }
}

export default WalletService;

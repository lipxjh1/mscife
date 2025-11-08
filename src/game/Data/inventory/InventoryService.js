/**
 * InventoryService - Inventory & Shop Management Service
 * Extracted from CenterData.js
 *
 * Handles all inventory and shop-related operations:
 * - Inventory management
 * - Shop browsing
 * - Item purchasing
 * - Box opening (single and multi)
 * - Data transformations
 */

import { ServiceBase } from '../core/ServiceBase.js';
import { EventEmitter } from '../core/EventEmitter.js';

export class InventoryService extends ServiceBase {
    constructor() {
        super();

        // Initialize event emitter
        this.eventEmitter = new EventEmitter();

        // Inventory data
        this.inventoryDictionary = {
            item_id_key: {
                _id: "server_id",
                code: "BOX_NFT_CHARACTER",
                name: "item name",
                receiveMethod: "receive_Method",
                description: "description",
                quantity: 0,
            },
        };

        // Shop data
        this.itemShopDictionary = {
            item_id_key: {
                _id: "server_id",
                code: "BOX_NFT_CHARACTER",
                name: "item name",
                receiveMethod: "receive_Method",
                description: "description",
                price: 0,
                priceScore: 0,
                remaining: 0,
            },
        };
    }

    // ===========================
    // EVENT HANDLING
    // ===========================

    AddInventoryChange(callback) {
        this.eventEmitter.on("inventorychange", callback);
    }

    RemoveInventoryChange(callback) {
        this.eventEmitter.off("inventorychange", callback);
    }

    EmitInventoryChange() {
        this.eventEmitter.emit("inventorychange", this.inventoryDictionary);
    }

    // ===========================
    // INVENTORY METHODS
    // ===========================

    RequestInventory(onSuccess, onError) {
        const url = this.endpoints.USER.GET_INVENTORY;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    this.ConvertToItemInventory(result.data);

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
                            "Get inventory failed"
                    );
                }
            });
    }

    ConvertToItemInventory(itemDataArr) {
        this.inventoryDictionary = {};

        for (let i = 0; i < itemDataArr.length; i++) {
            let itemData = itemDataArr[i];

            if (itemData.item != null) {
                let itemObj = {
                    _id: itemData._id,
                    code: itemData.item.code,
                    name: itemData.item.name,
                    receiveMethod: itemData.item.receiveMethod,
                    description: itemData.item.description,
                    quantity: itemData.quantity,
                    properties: itemData.item.properties,
                };

                this.inventoryDictionary[itemObj.code] = itemObj;
            }
        }

        this.EmitInventoryChange();
    }

    // ===========================
    // SHOP METHODS
    // ===========================

    RequestShop(onSuccess, onError) {
        const url = this.endpoints.SHOP.GET_ITEMS;

        this.apiClient
            .get(url)
            .then((response) => {
                const result = response.data;

                if (result.success) {
                    this.ConvertToItemShop(result.data);

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
                            "Get shop items failed"
                    );
                }
            });
    }

    ConvertToItemShop(itemDataArr) {
        this.itemShopDictionary = {};

        for (let i = 0; i < itemDataArr.length; i++) {
            let itemData = itemDataArr[i];

            if (itemData.detail != null) {
                let itemObj = {
                    _id: itemData._id,
                    code: itemData.detail.code,
                    name: itemData.detail.name,
                    receiveMethod: itemData.detail.receiveMethod,
                    description: itemData.detail.description,
                    price: itemData.price,
                    priceScore: itemData.priceScore,
                    remaining: itemData.remaining,
                };

                this.itemShopDictionary[itemObj.code] = itemObj;
            }
        }
    }

    RequestBuyItem(itemCode, quantity, onSuccess, onError) {
        const url = this.endpoints.SHOP.BUY_ITEM;

        const bodyData = {
            itemCode: itemCode,
            quantity: quantity,
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
                            "Buy item failed"
                    );
                }
            });
    }

    // ===========================
    // BOX OPENING METHODS
    // ===========================

    RequestOpenBox(itemCode, onSuccess, onError) {
        const url = this.endpoints.SHOP.OPEN_BOX;
        const bodyData = { box_code: itemCode };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const data = response.data;

                if (data.success) {
                    onSuccess?.(data);
                } else {
                    onError?.(data.message || "Request failed");
                }
            })
            .catch((error) => {
                if (
                    error.message.includes("Assignment to constant variable") ==
                    false
                ) {
                    onError?.(
                        error.message || error.response?.data || "Network error"
                    );
                }
            });
    }

    RequestOpenMultiBox(itemCode, quantity, onSuccess, onError) {
        const url = `/api/box/open-multiple`;
        const bodyData = { box_code: itemCode, quantity: quantity };

        this.apiClient
            .post(url, bodyData)
            .then((response) => {
                const data = response.data;

                if (data.success) {
                    onSuccess?.(data);
                } else {
                    onError?.(data.message || "Request failed");
                }
            })
            .catch((error) => {
                if (
                    error.message.includes("Assignment to constant variable") ==
                    false
                ) {
                    onError?.(
                        error.message || error.response?.data || "Network error"
                    );
                }
            });
    }
}

export default InventoryService;

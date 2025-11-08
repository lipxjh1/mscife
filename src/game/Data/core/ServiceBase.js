/**
 * ServiceBase Class
 *
 * Base class for all API service classes
 * Provides common functionality for making API requests
 * and handling responses/errors
 */

import { apiClient } from '../APIBase.js';
import { API_ENDPOINTS } from '../services/ApiEndpoints.js';

export class ServiceBase {
    constructor() {
        this.apiClient = apiClient;
        this.endpoints = API_ENDPOINTS;
    }

    /**
     * Handle API errors consistently
     * @param {Error} error - The error object
     * @param {Function} onError - Error callback function
     * @param {string} defaultMessage - Default error message
     */
    handleError(error, onError, defaultMessage) {
        if (onError && typeof onError === 'function') {
            const errorMessage = error.response?.data || error.message || defaultMessage;
            onError(errorMessage);
        }
    }

    /**
     * Handle API success responses consistently
     * @param {Object} result - The response data
     * @param {Function} onSuccess - Success callback function
     * @returns {boolean} True if handled, false otherwise
     */
    handleSuccess(result, onSuccess) {
        if (result.success) {
            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess(result);
            }
            return true;
        }
        return false;
    }

    /**
     * Make a GET request
     * @param {string} url - The URL to request
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     * @param {string} errorMessage - Default error message
     */
    async get(url, onSuccess, onError, errorMessage = 'Request failed') {
        try {
            const response = await this.apiClient.get(url);
            const result = response.data;

            if (!this.handleSuccess(result, onSuccess) && onError) {
                onError(result || errorMessage);
            }
        } catch (error) {
            this.handleError(error, onError, errorMessage);
        }
    }

    /**
     * Make a POST request
     * @param {string} url - The URL to request
     * @param {Object} data - The data to send
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     * @param {string} errorMessage - Default error message
     */
    async post(url, data, onSuccess, onError, errorMessage = 'Request failed') {
        try {
            const response = await this.apiClient.post(url, data);
            const result = response.data;

            if (!this.handleSuccess(result, onSuccess) && onError) {
                onError(result || errorMessage);
            }
        } catch (error) {
            this.handleError(error, onError, errorMessage);
        }
    }

    /**
     * Make a PUT request
     * @param {string} url - The URL to request
     * @param {Object} data - The data to send
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     * @param {string} errorMessage - Default error message
     */
    async put(url, data, onSuccess, onError, errorMessage = 'Request failed') {
        try {
            const response = await this.apiClient.put(url, data);
            const result = response.data;

            if (!this.handleSuccess(result, onSuccess) && onError) {
                onError(result || errorMessage);
            }
        } catch (error) {
            this.handleError(error, onError, errorMessage);
        }
    }

    /**
     * Make a DELETE request
     * @param {string} url - The URL to request
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     * @param {string} errorMessage - Default error message
     */
    async delete(url, onSuccess, onError, errorMessage = 'Request failed') {
        try {
            const response = await this.apiClient.delete(url);
            const result = response.data;

            if (!this.handleSuccess(result, onSuccess) && onError) {
                onError(result || errorMessage);
            }
        } catch (error) {
            this.handleError(error, onError, errorMessage);
        }
    }
}

export default ServiceBase;

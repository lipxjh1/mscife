/**
 * Vorld Auth Module - Service Layer
 * Simple version with all features in one file
 * 
 * @version 1.0.0
 * @date 2025-10-26
 */

import { apiClient, clearTokens, setTokens } from '../../game/Data/APIBase';
import { clearVorldTokens } from '../../utils/vorldAuth';

// ============================================
// API ENDPOINTS
// ============================================
const API = {
  LOGIN: '/api/vorld/login',
  VERIFY_OTP: '/api/vorld/verify-otp',
  PROFILE: '/api/vorld/profile',
  STATUS: '/api/vorld/status'
};

// ============================================
// VORLD AUTH SERVICE
// ============================================
class VorldAuthService {
  /**
   * Login với email/password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} { success, needsOTP, data, error }
   */
  async login(email, password) {
    try {
      console.log('🔐 Vorld Login:', email);
      
      const response = await apiClient.post(API.LOGIN, {
        email,
        password
      });

      console.log('✅ Vorld Login Response:', response.data);
      
      // ✅ FIX: Clear old tokens BEFORE saving new ones
      console.log('🗑️ Clearing old tokens before saving new ones');
      clearTokens(); // This now also clears Vorld tokens
      // Also clear localStorage to be safe
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      clearVorldTokens(); // Explicit clear of Vorld tokens
      
      // ✅ FIX: Use setTokens() to sync memory and storage
      if (response.data.data && response.data.data.accessToken) {
        setTokens(response.data.data.accessToken, response.data.data.refreshToken);
        console.log('✅ Tokens synced to memory and storage');
      } else if (response.data.accessToken) {
        // Fallback for direct structure
        setTokens(response.data.accessToken, response.data.refreshToken);
        console.log('✅ Tokens synced to memory and storage (direct)');
      }
      
      return {
        success: true,
        needsOTP: response.data.requiresOTP || false,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Vorld Login Error:', error);
      return {
        success: false,
        needsOTP: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  /**
   * Verify OTP code
   * @param {string} email - User email
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<Object>} { success, user, tokens, error }
   */
  async verifyOTP(email, otp) {
    try {
      console.log('🔐 Vorld Verify OTP:', email);
      
      const response = await apiClient.post(API.VERIFY_OTP, {
        email,
        otp
      });

      console.log('✅ Vorld OTP Verified:', response.data);
      
      // ✅ FIX: Clear old tokens BEFORE saving new ones
      console.log('🗑️ Clearing old tokens before saving new ones (OTP)');
      clearTokens(); // This now also clears Vorld tokens
      // Also clear localStorage to be safe
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      clearVorldTokens(); // Explicit clear of Vorld tokens
      
      // Use setTokens() to sync memory and storage
      if (response.data.accessToken) {
        setTokens(response.data.accessToken, response.data.refreshToken);
        console.log('✅ Tokens synced to memory and storage (OTP)');
      }

      return {
        success: true,
        user: response.data.user,
        tokens: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken
        }
      };
    } catch (error) {
      console.error('❌ Vorld OTP Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'OTP verification failed'
      };
    }
  }

  /**
   * Get user profile
   * @returns {Promise<Object>} { success, data, error }
   */
  async getProfile() {
    try {
      console.log('🔐 Vorld Get Profile');
      
      const response = await apiClient.get(API.PROFILE);
      
      console.log('✅ Vorld Profile:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Vorld Profile Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile'
      };
    }
  }

  /**
   * Check Vorld service status
   * @returns {Promise<Object>} { success, data, error }
   */
  async checkStatus() {
    try {
      const response = await apiClient.get(API.STATUS);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Vorld Auth service unavailable'
      };
    }
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
const vorldAuth = new VorldAuthService();
export default vorldAuth;

// ============================================
// EXPORT COMPONENT
// ============================================
export { default as OTPInput } from './OTPInput';

// ============================================
// MODULE INFO
// ============================================
export const VORLD_MODULE = {
  name: 'vorld-auth',
  version: '1.0.0',
  backend: 'https://game.m-sci.net/api/vorld',
  endpoints: API
};

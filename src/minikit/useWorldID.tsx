import { useCallback, useState } from 'react';
import { MiniKit, VerificationLevel, VerifyCommandInput, WalletAuthInput, MiniAppWalletAuthSuccessPayload } from '@worldcoin/minikit-js';
import { setTokens, clearTokens } from '../game/Data/APIBase.js';

// ✅ Dùng env variables
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://wld.m-sci.net";
const ACTION = import.meta.env.VITE_WORLD_ID_ACTION || "msci-login";

console.log('useWorldID: Hook loaded');
console.log('BACKEND_URL:', BACKEND_URL);
console.log('ACTION:', ACTION);

interface UserData {
  id: string;
  email?: string;
  username?: string;
  worldcoin_verified: boolean;
  nullifier_hash?: string;
  created_at: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  data?: UserData;
}

export const useWorldID = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Thêm clearError function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const verify = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log('🚀 BẮT ĐẦU XÁC THỰC WORLD ID');

    try {
      // Check if MiniKit is installed
      if (!MiniKit.isInstalled()) {
        throw new Error('Vui lòng mở trong World App');
      }

      console.log('📱 MiniKit detected, starting Wallet Auth...');

      // 1. Get nonce từ backend
      const nonceRes = await fetch(`${BACKEND_URL}/api/nonce`);
      const { nonce } = await nonceRes.json();

      console.log('📝 Nonce:', nonce);

      // ✅ ĐÚNG: Dùng walletAuth thay vì verify()
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
        statement: 'Sign in to M-SCI Game',
      });

      console.log('📦 Wallet Auth response:', finalPayload);

      // DEBUG: Log payload structure
      console.log('=== MINIKIT RESPONSE DEBUG ===');
      console.log('Full finalPayload:', JSON.stringify(finalPayload, null, 2));
      console.log('Has message:', !!finalPayload.message);
      console.log('Has signature:', !!finalPayload.signature);
      console.log('Has address:', !!finalPayload.address);
      console.log('=== END MINIKIT RESPONSE DEBUG ===');

      // ✅ Handle error status
      if (finalPayload.status === "error") {
        const errorMsg = finalPayload.error_code || 'Wallet Auth thất bại';
        console.error('❌ Wallet Auth error:', errorMsg);
        throw new Error(errorMsg);
      }

      // ✅ Handle success
      if (finalPayload.status === "success") {
        console.log('✅ World ID Wallet Auth successful!');
        console.log('📤 Sending proof to backend:', `${BACKEND_URL}/api/world-id/wallet-auth`);

        // ✅ Validate payload trước khi gửi
        if (!finalPayload.message || !finalPayload.signature || !finalPayload.address) {
          console.error('❌ Invalid finalPayload - missing required fields:', {
            hasMessage: !!finalPayload.message,
            hasSignature: !!finalPayload.signature,
            hasAddress: !!finalPayload.address,
            keys: Object.keys(finalPayload)
          });
          throw new Error('Invalid payload from MiniKit - missing required fields');
        }

        console.log('✅ Valid finalPayload, sending to backend:', {
          status: finalPayload.status,
          address: finalPayload.address,
          hasMessage: !!finalPayload.message,
          hasSignature: !!finalPayload.signature
        });

        // ✅ ĐÚNG: Response structure với finalPayload cho walletAuth
        const response = await fetch(`${BACKEND_URL}/api/world-id/wallet-auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: finalPayload,  // ✅ Gửi NGUYÊN finalPayload theo World Docs
            nonce: nonce
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const data: LoginResponse = await response.json();
        console.log('📥 Backend response:', data);

        if (data.success && data.accessToken) {
          // Store tokens
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          if (data.data) {
            localStorage.setItem('userData', JSON.stringify(data.data));
          }

          // ⭐ Sync tokens to APIBase memory
          console.log('🔄 Syncing tokens to APIBase memory...');
          setTokens(data.accessToken, data.refreshToken || '');
          console.log('✅ Tokens synced to memory');

          console.log('✅ Login successful! Tokens stored.');
          return { success: true, data: data.data };
        } else {
          throw new Error(data.message || 'Backend verification failed');
        }
      }

      // Handle cancelled
      if (finalPayload.status === "cancelled") {
        throw new Error('Người dùng đã hủy Wallet Auth');
      }

      throw new Error('Unexpected Wallet Auth status');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error('❌ Wallet Auth failed:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    // ⭐ Clear tokens from APIBase memory
    clearTokens();

    setError(null);
    console.log('👋 Logged out');
  }, []);

  const getAccessToken = useCallback(() => {
    return localStorage.getItem('accessToken');
  }, []);

  const getUserData = useCallback((): UserData | null => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }, []);

  const isVerified = useCallback(() => {
    return !!getAccessToken();
  }, [getAccessToken]);

  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('refreshToken');
    if (!token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: token }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        if (data.data) {
          localStorage.setItem('userData', JSON.stringify(data.data));
        }

        // ⭐ Sync new tokens to APIBase memory
        setTokens(data.accessToken, data.refreshToken || '');
        console.log('✅ Refreshed tokens synced to memory');

        return data;
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (err) {
      logout();
      throw err;
    }
  }, [logout]);

  return {
    verify,
    logout,
    refreshToken,
    isLoading,
    error,
    clearError,  // ✅ Export clearError
    isVerified: isVerified(),
    userData: getUserData(),
    accessToken: getAccessToken()
  };
};
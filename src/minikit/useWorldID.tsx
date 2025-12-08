import { useCallback, useState } from 'react';
import { MiniKit, VerificationLevel, VerifyCommandInput } from '@worldcoin/minikit-js';

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

      console.log('📱 MiniKit detected, starting verification...');
      console.log('📝 Action:', ACTION);

      // ✅ ĐÚNG: Dùng commandsAsync thay vì commands
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: ACTION,  // ✅ Dùng env variable
        verification_level: VerificationLevel.Device,
        signal: "",
      });

      console.log('📦 Verify response:', finalPayload);

      // ✅ Handle error status
      if (finalPayload.status === "error") {
        const errorMsg = finalPayload.error_code || 'Xác thực thất bại';
        console.error('❌ Verification error:', errorMsg);
        throw new Error(errorMsg);
      }

      // ✅ Handle success
      if (finalPayload.status === "success") {
        console.log('✅ World ID verification successful!');
        console.log('📤 Sending proof to backend:', `${BACKEND_URL}/api/world-id/login`);

        // ✅ ĐÚNG: Response structure với finalPayload
        const response = await fetch(`${BACKEND_URL}/api/world-id/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proof: finalPayload.proof,
            nullifier_hash: finalPayload.nullifier_hash,
            merkle_root: finalPayload.merkle_root,
            verification_level: finalPayload.verification_level,
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

          console.log('✅ Login successful! Tokens stored.');
          return { success: true, data: data.data };
        } else {
          throw new Error(data.message || 'Backend verification failed');
        }
      }

      // Handle cancelled
      if (finalPayload.status === "cancelled") {
        throw new Error('Người dùng đã hủy xác thực');
      }

      throw new Error('Unexpected verification status');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error('❌ Verification failed:', errorMessage);
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
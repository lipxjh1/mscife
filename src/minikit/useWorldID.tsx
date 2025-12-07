import { useCallback, useState } from 'react';
import { MiniKit, VerificationLevel, VerifyCommandInput } from '@worldcoin/minikit-js';

console.log('useWorldID: Hook được gọi');
console.log('BACKEND_URL hiện tại:', "https://wld.m-sci.net");

const BACKEND_URL = "https://wld.m-sci.net";

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

  const verify = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log('BẤM NÚT VERIFY – BẮT ĐẦU XÁC THỰC WORLD ID');

    try {
      // Check if MiniKit is installed
      if (!MiniKit.isInstalled()) {
        throw new Error('World App MiniKit is not installed');
      }

      // Verify with World ID
      const verifyResponse = await MiniKit.commands.verify({
        action: "msci-login",
        verification_level: VerificationLevel.Device,
        signal: "", // Optional: add signal if needed
      });

      console.log('NHẬN PROOF THÀNH CÔNG:', verifyResponse);

      if (verifyResponse.status === "success") {
        // Send proof to backend
        console.log('GỬI PROOF LÊN BACKEND:', `${BACKEND_URL}/api/world-id/login`);
        const response = await fetch(`${BACKEND_URL}/api/world-id/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proof: verifyResponse.finalResponse,
            nullifier_hash: verifyResponse.finalResponse.nullifier_hash,
            merkle_root: verifyResponse.finalResponse.merkle_root,
            verification_level: verifyResponse.finalResponse.verification_level,
          }),
        });

        const data: LoginResponse = await response.json();

        if (data.success && data.accessToken) {
          // Store tokens in localStorage
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }

          // Store user data
          if (data.data) {
            localStorage.setItem('userData', JSON.stringify(data.data));
          }

          return { success: true };
        } else {
          throw new Error(data.message || 'Verification failed');
        }
      } else {
        throw new Error('World ID verification failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
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
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
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
      // Clear tokens on refresh failure
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
    isVerified: isVerified(),
    userData: getUserData(),
    accessToken: getAccessToken()
  };
};
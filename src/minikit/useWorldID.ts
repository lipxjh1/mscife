import { useCallback, useState } from 'react';
import { MiniKit, VerificationLevel, VerifyCommandOutput } from '@worldcoin/minikit-js';

const BACKEND_URL = "https://worldapp.m-sci.net";

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

    try {
      // Check if MiniKit is ready
      if (!MiniKit.isInstalled()) {
        throw new Error('World App not detected. Please open in World App.');
      }

      // Start verification
      const verifyResponse: VerifyCommandOutput = await MiniKit.commands.verify({
        action: "msci-login",
        verification_level: VerificationLevel.Device,
        signal: "", // Optional: add signal if needed
      });

      console.log('MiniKit verify response:', verifyResponse);

      if (verifyResponse.status === "success") {
        // Send proof to backend
        const response = await fetch(`${BACKEND_URL}/api/world-id/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: {
              proof: verifyResponse.proof?.proof || "",
              merkle_root: verifyResponse.proof?.merkle_root || "",
              nullifier_hash: verifyResponse.proof?.nullifier_hash || "",
              verification_level: verifyResponse.proof?.verification_level || VerificationLevel.Device,
            }
          })
        });

        const data: LoginResponse = await response.json();
        console.log('Backend response:', data);

        if (data.success && data.accessToken && data.refreshToken && data.data) {
          // Save tokens and user data to localStorage
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('userData', JSON.stringify(data.data));

          // Also save user ID for game usage
          localStorage.setItem('userId', data.data.id);

          return {
            success: true,
            userData: data.data
          };
        } else {
          throw new Error(data.message || 'Verification failed on backend');
        }
      } else {
        throw new Error('Verification cancelled or failed');
      }
    } catch (err: any) {
      console.error('World ID verification error:', err);
      const errorMessage = err.message || "Verification error. Please try again.";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
  }, []);

  const isVerified = useCallback(() => {
    return !!localStorage.getItem('accessToken');
  }, []);

  const getUserData = useCallback((): UserData | null => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        return null;
      }
    }
    return null;
  }, []);

  const getAccessToken = useCallback(() => {
    return localStorage.getItem('accessToken');
  }, []);

  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue
        })
      });

      const data: any = await response.json();

      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
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
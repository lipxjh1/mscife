/**
 * World ID Hook - Fixed Version
 * Handles World ID verification and login
 */
import { useState, useCallback } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { WORLD_ID_CONFIG } from './config';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sta.m-sci.net';

export const useWorldId = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Verify World ID - Gọi MiniKit verify
     */
    const verify = useCallback(async (options = {}) => {
        if (!MiniKit.isInstalled()) {
            setError('MiniKit not installed');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🔐 Starting World ID verification...');

            const result = await MiniKit.commandsAsync.verify({
                action: WORLD_ID_CONFIG.ACTION,
                signal: options.signal || '',
                verification_level: options.verification_level || 'device', // FIX: không hardcode 'orb'
            });

            console.log('✅ Verification result:', result);

            if (result?.finalPayload) {
                return result.finalPayload;
            }

            setError('Verification failed - no payload');
            return null;
        } catch (err) {
            console.error('❌ Verification error:', err);
            setError(err.message || 'Verification failed');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Login với proof - Gọi backend API
     */
    const login = useCallback(async (proof) => {
        if (!proof) {
            setError('No proof provided');
            return { success: false, error: 'No proof provided' };
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🔑 Sending proof to backend...');

            const response = await fetch(`${API_BASE_URL}${WORLD_ID_CONFIG.API_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payload: proof }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            console.log('✅ Backend response:', data);

            // FIX: Parse response đúng format từ backend
            // Backend trả: { success, accessToken, refreshToken, data: { userId, username, ... }, isNewUser }
            const { accessToken, refreshToken, data: userData, isNewUser } = data;

            // FIX: Dùng localStorage consistent với APIBase
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            // Return đúng structure
            return {
                success: true,
                accessToken,
                refreshToken,
                user: userData,
                isNewUser
            };

        } catch (err) {
            console.error('❌ Login error:', err);
            const errorMsg = err.message || 'Login failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Verify + Login trong 1 flow
     */
    const verifyAndLogin = useCallback(async (options = {}) => {
        // Step 1: Verify
        const proof = await verify(options);
        if (!proof) {
            return { success: false, error: error || 'Verification failed' };
        }

        // Step 2: Login
        const result = await login(proof);
        return result;
    }, [verify, login, error]);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        verify,
        login,
        verifyAndLogin,
        isLoading,
        error,
        clearError
    };
};

export default useWorldId;
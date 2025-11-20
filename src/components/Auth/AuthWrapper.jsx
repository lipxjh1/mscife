import React, { useState, useEffect } from 'react';
import LoginPage from '../../pages/Login';
import { EventBus } from '../../game/EventBus';
import centerData from '../../game/Data/CenterData';

const AuthWrapper = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = () => {
            // Check if user is already authenticated
            // This is a simplified check - in real implementation, you'd check tokens, etc.
            const hasValidTokens = localStorage.getItem('accessToken') || centerData.userInfo.UserId;

            if (hasValidTokens) {
                console.log('User is already authenticated');
                setIsAuthenticated(true);
            } else {
                console.log('User needs to authenticate');
                setIsAuthenticated(false);
            }

            setIsLoading(false);
        };

        // Check authentication on mount
        checkAuthentication();

        // Listen for authentication events
        const handleGoogleLoginSuccess = (data) => {
            console.log('Google login successful', data);
            setIsAuthenticated(true);
        };

        const handleVorldLoginSuccess = (data) => {
            console.log('Vorld login successful', data);
            setIsAuthenticated(true);
        };

        // Listen for successful logins
        EventBus.on('react-google-button-login', handleGoogleLoginSuccess);
        EventBus.on('vorld:otp-success', handleVorldLoginSuccess);

        return () => {
            EventBus.off('react-google-button-login', handleGoogleLoginSuccess);
            EventBus.off('vorld:otp-success', handleVorldLoginSuccess);
        };
    }, []);

    const handleLoginSuccess = () => {
        console.log('Login successful - transitioning to game');
        setIsAuthenticated(true);
    };

    if (isLoading) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
                color: 'white',
                fontSize: '18px'
            }}>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return <>{children}</>;
};

export default AuthWrapper;
import React, { useState, useEffect } from 'react';
import { EventBus } from '../../game/EventBus';
import LoginButtons from './components/LoginButtons';
import EmailModal from './components/EmailModal';
import InstallPWAModal from './components/InstallPWAModal';
import VorldLoginModal from '../../game/scenes/Share/share-react/VorldLoginModal';
import styles from './Login.module.css';

const LoginPage = ({ onLoginSuccess }) => {
    // Modal states
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [showVorldModal, setShowVorldModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if PWA install prompt is available
    useEffect(() => {
        const checkPWAInstall = () => {
            // Check if app is already installed
            if (
                window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone
            ) {
                console.log('PWA is already installed');
                return;
            }

            // Check if install prompt is available
            if (window.deferredPrompt || window.pwaInstallReady) {
                // Show install modal after a delay
                const timer = setTimeout(() => {
                    setShowInstallModal(true);
                }, 2000);
                return () => clearTimeout(timer);
            }
        };

        checkPWAInstall();

        // Listen for custom PWA install ready event
        const handleInstallReady = () => {
            setShowInstallModal(true);
        };

        window.addEventListener('pwa-install-ready', handleInstallReady);

        return () => {
            window.removeEventListener('pwa-install-ready', handleInstallReady);
        };
    }, []);

    // Listen for Vorld login popup from existing system
    useEffect(() => {
        const handleShowVorldLogin = () => {
            setShowVorldModal(true);
        };

        EventBus.on('show-vorld-login-popup', handleShowVorldLogin);

        return () => {
            EventBus.off('show-vorld-login-popup', handleShowVorldLogin);
        };
    }, []);

    // Login handlers
    const handleGoogleLogin = () => {
        setIsLoading(true);
        console.log('Initiating Google login...');

        // Trigger existing Google login flow
        EventBus.emit('ui:show-google-login');

        // Reset loading after a timeout
        setTimeout(() => {
            setIsLoading(false);
        }, 5000);
    };

    const handleVorldLogin = () => {
        console.log('Initiating Vorld login...');
        setShowVorldModal(true);
    };

    const handleEmailLogin = () => {
        console.log('Opening email login modal...');
        setShowEmailModal(true);
    };

    const handleEmailSubmit = async (formData) => {
        setIsLoading(true);
        console.log('Submitting email login:', formData.email);

        try {
            // Here you would integrate with your existing email login system
            // For now, just simulate the process
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Email login successful for:', formData.email);
            setShowEmailModal(false);

            // Trigger success callback if provided
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (error) {
            console.error('Email login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePWAInstall = () => {
        console.log('Installing PWA...');

        const prompt = window.deferredPrompt;
        if (prompt) {
            prompt.prompt();
            prompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted PWA installation');
                    setShowInstallModal(false);
                } else {
                    console.log('User dismissed PWA installation');
                }
                window.deferredPrompt = null;
            });
        }
    };

    return (
        <div className={styles.loginPage}>
            {/* Background */}
            <div className={styles.background} />

            {/* Main Content */}
            <div className={styles.content}>
                {/* Logo/Title Section */}
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <div className={styles.gameLogo}>
                            <span className={styles.logoText}>M-SCI</span>
                        </div>
                    </div>
                    <h1 className={styles.title}>
                        Welcome to M-SCI
                    </h1>
                    <p className={styles.subtitle}>
                        Enter the ultimate gaming experience
                    </p>
                </div>

                {/* Login Buttons */}
                <div className={styles.loginSection}>
                    <LoginButtons
                        onGoogleLogin={handleGoogleLogin}
                        onVorldLogin={handleVorldLogin}
                        onEmailLogin={handleEmailLogin}
                        isLoading={isLoading}
                    />
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p className={styles.termsText}>
                        By continuing, you agree to our{' '}
                        <a href="/terms" className={styles.link}>Terms of Service</a> and{' '}
                        <a href="/privacy" className={styles.link}>Privacy Policy</a>
                    </p>
                </div>
            </div>

            {/* Modals */}
            <EmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onSubmit={handleEmailSubmit}
                isLoading={isLoading}
            />

            <InstallPWAModal
                isOpen={showInstallModal}
                onClose={() => setShowInstallModal(false)}
                onInstall={handlePWAInstall}
            />

            {/* Use existing Vorld Login Modal */}
            <VorldLoginModal
                isOpen={showVorldModal}
                onClose={() => setShowVorldModal(false)}
            />
        </div>
    );
};

export default LoginPage;
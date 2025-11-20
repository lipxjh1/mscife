import React from 'react';
import CenterModal from '../../../components/Modal/CenterModal';
import styles from './InstallPWAModal.module.css';

const InstallPWAModal = ({ isOpen, onClose, onInstall }) => {
    const handleInstall = () => {
        if (onInstall) {
            onInstall();
        }
        onClose();
    };

    return (
        <CenterModal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
            <div className={styles.installModal}>
                {/* Icon */}
                <div className={styles.iconContainer}>
                    <svg className={styles.installIcon} width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="4" />
                        <path d="M32 16V42M20 30L32 42L44 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 48H48" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className={styles.title}>Install Our App</h2>

                {/* Description */}
                <p className={styles.description}>
                    Install our app for the best experience with faster loading, offline mode, and a clean interface.
                </p>

                {/* Features */}
                <div className={styles.features}>
                    <div className={styles.feature}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Fast & Reliable</span>
                    </div>
                    <div className={styles.feature}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Offline Mode</span>
                    </div>
                    <div className={styles.feature}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>No Ads</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonGroup}>
                    <button
                        onClick={handleInstall}
                        className={styles.installButton}
                    >
                        Install Now
                    </button>
                    <button
                        onClick={onClose}
                        className={styles.laterButton}
                    >
                        Maybe Later
                    </button>
                </div>

                {/* Trust indicator */}
                <div className={styles.trustIndicator}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure & Free</span>
                </div>
            </div>
        </CenterModal>
    );
};

export default InstallPWAModal;
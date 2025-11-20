import React, { useEffect } from 'react';
import styles from './Modal.module.css';

const BottomSheet = ({ isOpen, onClose, children, title }) => {
    // Prevent body scroll when modal open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.bottomSheet}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle for swipe down (visual indicator) */}
                <div className={styles.bottomSheetHandle} />

                {/* Close button */}
                <button
                    className={styles.modalClose}
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                </button>

                {/* Header */}
                {title && (
                    <>
                        <h2 className={styles.modalTitle}>{title}</h2>
                        <div className={styles.modalDivider} />
                    </>
                )}

                {/* Content */}
                <div className={styles.modalContent}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BottomSheet;
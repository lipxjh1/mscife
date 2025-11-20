import React, { useState } from 'react';
import BottomSheet from '../../../components/Modal/BottomSheet';
import styles from './EmailModal.module.css';

const EmailModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            await onSubmit(formData);
        }
    };

    const handleModalClose = () => {
        // Reset form on close
        setFormData({ email: '', password: '' });
        setErrors({});
        setShowPassword(false);
        onClose();
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={handleModalClose}
            title="Sign in with Email"
        >
            <form onSubmit={handleSubmit} className={styles.emailForm}>
                {/* Email Input */}
                <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.inputLabel}>
                        Email Address
                        <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputContainer}>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className={`${styles.inputField} ${errors.email ? styles.inputError : ''}`}
                            autoComplete="email"
                            disabled={isLoading}
                        />
                        <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                    </div>
                    {errors.email && (
                        <div className={styles.errorMessage}>
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.email}
                        </div>
                    )}
                </div>

                {/* Password Input */}
                <div className={styles.inputGroup}>
                    <label htmlFor="password" className={styles.inputLabel}>
                        Password
                        <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputContainer}>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className={`${styles.inputField} ${styles.inputFieldPassword} ${errors.password ? styles.inputError : ''}`}
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                        <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <div className={styles.errorMessage}>
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errors.password}
                        </div>
                    )}
                </div>

                {/* Forgot Password */}
                <div className={styles.forgotPassword}>
                    <a href="/forgot-password">Forgot password?</a>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                {/* Sign Up Link */}
                <div className={styles.signupSection}>
                    <p className={styles.signupText}>Don't have an account?</p>
                    <a href="/signup" className={styles.signupLink}>Sign up</a>
                </div>
            </form>
        </BottomSheet>
    );
};

export default EmailModal;
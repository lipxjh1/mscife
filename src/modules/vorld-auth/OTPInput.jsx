/**
 * OTP Input Component
 * Standalone component với inline styles
 * Match pattern với LoadingOverlay.jsx
 * 
 * @component OTPInput
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';

// ============================================
// INLINE STYLES (match codebase pattern)
// ============================================
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  box: {
    background: '#1a1a1a',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
  },
  header: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '20px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px'
  },
  title: {
    color: '#fff',
    margin: 0,
    flex: 1,
    fontSize: '20px',
    fontWeight: 'bold'
  },
  email: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: '24px',
    fontSize: '14px'
  },
  emailStrong: {
    color: '#fff',
    fontWeight: 'bold'
  },
  inputsContainer: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  input: {
    width: '50px',
    height: '60px',
    fontSize: '32px',
    textAlign: 'center',
    border: '2px solid #333',
    borderRadius: '8px',
    background: '#222',
    color: '#fff',
    outline: 'none',
    transition: 'all 0.2s'
  },
  inputFocus: {
    borderColor: '#4CAF50',
    background: '#2a2a2a'
  },
  error: {
    color: '#f44336',
    textAlign: 'center',
    fontSize: '14px',
    marginBottom: '16px',
    fontWeight: 'bold'
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    background: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.2s'
  },
  submitButtonDisabled: {
    background: '#333',
    color: '#666',
    cursor: 'not-allowed'
  },
  resend: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
    color: '#888'
  },
  resendButton: {
    background: 'none',
    border: 'none',
    color: '#4CAF50',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

// ============================================
// COMPONENT
// ============================================
export default function OTPInput({ 
  email, 
  onVerify, 
  onBack 
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newOtp.every(d => d !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Auto-submit if 6 digits pasted
    if (digits.length === 6) {
      handleSubmit(newOtp.join(''));
    }
  };

  // Submit OTP
  const handleSubmit = async (otpCode) => {
    setLoading(true);
    setError('');

    try {
      await onVerify(otpCode || otp.join(''));
    } catch (err) {
      setError(err.message || 'Verification failed');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = () => {
    setCountdown(60);
    setError('');
    console.log('🔄 Resend OTP requested for:', email);
    // TODO: Implement resend API call if backend supports
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        {/* Header */}
        <div style={styles.header}>
          <button 
            style={styles.backButton}
            onClick={onBack}
            disabled={loading}
          >
            ← Back
          </button>
          <h2 style={styles.title}>Enter OTP Code</h2>
        </div>

        {/* Email display */}
        <p style={styles.email}>
          Sent to <span style={styles.emailStrong}>{email}</span>
        </p>

        {/* OTP Inputs */}
        <div style={styles.inputsContainer}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(-1)}
              disabled={loading}
              style={{
                ...styles.input,
                ...(focusedIndex === i ? styles.inputFocus : {})
              }}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p style={styles.error}>{error}</p>
        )}

        {/* Submit button */}
        <button
          style={{
            ...styles.submitButton,
            ...(loading || otp.some(d => !d) ? styles.submitButtonDisabled : {})
          }}
          onClick={() => handleSubmit()}
          disabled={loading || otp.some(d => !d)}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        {/* Resend OTP */}
        <div style={styles.resend}>
          {countdown > 0 ? (
            <span>Resend code in {countdown}s</span>
          ) : (
            <button 
              style={styles.resendButton}
              onClick={handleResend}
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

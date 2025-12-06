import React, { useState, useEffect } from 'react';
import { EventBus } from '../../../EventBus';

/**
 * VorldLoginModal Component
 * 
 * Modal popup để user nhập email và password cho Vorld login
 * Xuất hiện khi click nút "Đăng nhập bằng Vorld"
 * 
 * Props:
 * - isOpen: boolean - Show/hide modal
 * - onClose: function - Callback khi đóng modal
 */
const VorldLoginModal = ({ isOpen, onClose }) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // VALIDATION HELPERS
  // ========================================
  
  /**
   * Validate email format
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate password (minimum 6 characters)
   */
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Clear previous errors
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Email không được để trống');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    if (!password) {
      setError('Password không được để trống');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password phải có ít nhất 6 ký tự');
      return;
    }

    console.log('[VorldLoginModal] Submit:', email);

    // Set loading state
    setIsLoading(true);

    // Emit event với email/password
    EventBus.emit('vorld-login-submit', { 
      email: email.trim(), 
      password: password 
    });

    // Clear form
    setTimeout(() => {
      setEmail('');
      setPassword('');
      setError('');
      setIsLoading(false);
      
      // Close modal after emit
      if (onClose) onClose();
    }, 300);
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    console.log('[VorldLoginModal] Close');
    
    // Clear form
    setEmail('');
    setPassword('');
    setError('');
    setIsLoading(false);
    
    // Call onClose callback
    if (onClose) onClose();
  };

  /**
   * Handle backdrop click (click outside modal)
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  // ========================================
  // EFFECTS
  // ========================================

  /**
   * Add keyboard event listener when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      console.log('[VorldLoginModal] Modal opened');
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, email, password, isLoading]); // Dependencies for handleKeyDown

  // ========================================
  // RENDER
  // ========================================

  // Don't render if not open
  if (!isOpen) return null;

  // Hide Vorld login modal entirely
  return null;
};

// ========================================
// STYLES (Inline CSS-in-JS)
// ========================================

const styles = {
  // Backdrop (overlay)
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
    backdropFilter: 'blur(5px)',
  },

  // Modal container
  modal: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '16px',
    border: '2px solid #667eea',
    boxShadow: '0 0 40px rgba(102, 126, 234, 0.5)',
    maxWidth: '450px',
    width: '100%',
    padding: '0',
    animation: 'modalFadeIn 0.3s ease-out',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
  },

  // Title
  title: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // Close button
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },

  // Form
  form: {
    padding: '32px',
  },

  // Error message
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    color: '#ef4444',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // Input group
  inputGroup: {
    marginBottom: '20px',
  },

  // Label
  label: {
    display: 'block',
    color: '#a0aec0',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  },

  // Input
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#0f0f1e',
    border: '2px solid #2d3748',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },

  // Button group
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },

  // Submit button
  submitButton: {
    flex: 1,
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },

  // Cancel button
  cancelButton: {
    flex: 1,
    padding: '14px 24px',
    background: 'transparent',
    border: '2px solid #4a5568',
    borderRadius: '8px',
    color: '#a0aec0',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Button disabled state
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  // Helper text
  helperText: {
    marginTop: '16px',
    fontSize: '12px',
    color: '#718096',
    textAlign: 'center',
  },
};

// ========================================
// ADD CSS ANIMATION (inject into document)
// ========================================

// Inject keyframe animation for modal fade-in
if (typeof document !== 'undefined') {
  const styleId = 'vorld-login-modal-styles';
  
  // Check if styles already added
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.textContent = `
      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* Input focus state */
      input:focus {
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
      }

      /* Button hover states */
      button[style*="linear-gradient"]:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6) !important;
      }

      button[style*="linear-gradient"]:active:not(:disabled) {
        transform: translateY(0);
      }

      /* Close button hover */
      button[aria-label="Close"]:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        color: #ffffff !important;
      }

      /* Cancel button hover */
      button[style*="border: 2px solid"]:hover:not(:disabled) {
        border-color: #667eea !important;
        color: #ffffff !important;
        background-color: rgba(102, 126, 234, 0.1) !important;
      }

      /* Mobile responsive */
      @media (max-width: 480px) {
        div[style*="maxWidth: '450px'"] {
          margin: 10px;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

// ========================================
// EXPORT
// ========================================

export default VorldLoginModal;

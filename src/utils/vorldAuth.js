/**
 * Vorld Authentication Helper
 *
 * Helper functions để làm việc với Vorld tokens
 *
 * @version 1.0.0
 * @date 2025-10-31
 */

/**
 * Lấy Vorld access token từ localStorage
 * @returns {string|null} Vorld token hoặc null
 */
export const getVorldToken = () => {
  try {
    const token = localStorage.getItem('vorldAccessToken');
    console.log('[Vorld Auth] Getting Vorld token:', token ? 'TOKEN_FOUND' : 'NO_TOKEN');
    return token && token !== 'null' && token !== 'undefined' ? token : null;
  } catch (error) {
    console.error('[Vorld Auth] Error getting Vorld token:', error);
    return null;
  }
};

/**
 * Lấy Vorld refresh token từ localStorage
 * @returns {string|null} Vorld refresh token hoặc null
 */
export const getVorldRefreshToken = () => {
  try {
    const token = localStorage.getItem('vorldRefreshToken');
    console.log('[Vorld Auth] Getting Vorld refresh token:', token ? 'TOKEN_FOUND' : 'NO_TOKEN');
    return token && token !== 'null' && token !== 'undefined' ? token : null;
  } catch (error) {
    console.error('[Vorld Auth] Error getting Vorld refresh token:', error);
    return null;
  }
};

/**
 * Lưu Vorld tokens vào localStorage
 * @param {string} accessToken - Vorld access token
 * @param {string} refreshToken - Vorld refresh token
 */
export const saveVorldTokens = (accessToken, refreshToken) => {
  try {
    if (accessToken && accessToken !== 'null' && accessToken !== 'undefined') {
      localStorage.setItem('vorldAccessToken', accessToken);
      console.log('[Vorld Auth] Access token saved');
    }

    if (refreshToken && refreshToken !== 'null' && refreshToken !== 'undefined') {
      localStorage.setItem('vorldRefreshToken', refreshToken);
      console.log('[Vorld Auth] Refresh token saved');
    }
  } catch (error) {
    console.error('[Vorld Auth] Error saving Vorld tokens:', error);
  }
};

/**
 * Xóa Vorld tokens khỏi localStorage
 */
export const clearVorldTokens = () => {
  try {
    localStorage.removeItem('vorldAccessToken');
    localStorage.removeItem('vorldRefreshToken');
    console.log('[Vorld Auth] Tokens cleared');
  } catch (error) {
    console.error('[Vorld Auth] Error clearing Vorld tokens:', error);
  }
};

/**
 * Check xem có Vorld token hợp lệ không
 * @returns {boolean} True nếu có token
 */
export const hasVorldToken = () => {
  const token = getVorldToken();
  return !!token;
};

/**
 * Tạo headers cho Arena API request
 * @param {string} backendToken - Backend JWT token
 * @returns {object} Headers object với cả 2 tokens
 */
export const getArenaHeaders = (backendToken) => {
  const vorldToken = getVorldToken();

  if (!vorldToken) {
    console.warn('[Vorld Auth] No Vorld token available for Arena API');
  }

  return {
    'Authorization': `Bearer ${backendToken}`,
    'X-Vorld-Token': vorldToken || '',
    'Content-Type': 'application/json'
  };
};

/**
 * Validate Vorld token trước khi chơi Arena
 * @returns {boolean} True nếu có token hợp lệ
 */
export const validateVorldTokenForArena = () => {
  const vorldToken = getVorldToken();

  if (!vorldToken) {
    console.warn('[Vorld Auth] No Vorld token found. Please login with Vorld account first.');
    return false;
  }

  console.log('[Vorld Auth] Vorld token validated for Arena play');
  return true;
};

/**
 * Extract Vorld tokens từ API response và lưu
 * @param {object} response - API response từ backend
 * @returns {boolean} True nếu có lưu tokens
 */
export const extractAndSaveVorldTokens = (response) => {
  try {
    let vorldAccessToken = null;
    let vorldRefreshToken = null;

    // Pattern 1: Nested structure response.data.data.tokens
    if (response?.data?.data?.tokens?.vorldAccessToken) {
      vorldAccessToken = response.data.data.tokens.vorldAccessToken;
      vorldRefreshToken = response.data.data.tokens.vorldRefreshToken;
      console.log('[Vorld Auth] Extracted tokens from nested structure');
    }
    // Pattern 2: Direct structure response.data.vorldAccessToken
    else if (response?.data?.vorldAccessToken) {
      vorldAccessToken = response.data.vorldAccessToken;
      vorldRefreshToken = response.data.vorldRefreshToken;
      console.log('[Vorld Auth] Extracted tokens from direct structure');
    }
    // Pattern 3: response.data.data.vorldAccessToken
    else if (response?.data?.data?.vorldAccessToken) {
      vorldAccessToken = response.data.data.vorldAccessToken;
      vorldRefreshToken = response.data.data.vorldRefreshToken;
      console.log('[Vorld Auth] Extracted tokens from data.data structure');
    }

    if (vorldAccessToken) {
      saveVorldTokens(vorldAccessToken, vorldRefreshToken);
      console.log('[Vorld Auth] Vorld tokens extracted and saved successfully');
      return true;
    } else {
      console.log('[Vorld Auth] No Vorld tokens found in response');
      return false;
    }
  } catch (error) {
    console.error('[Vorld Auth] Error extracting Vorld tokens:', error);
    return false;
  }
};

// Export các functions để sử dụng trong codebase
export default {
  getVorldToken,
  getVorldRefreshToken,
  saveVorldTokens,
  clearVorldTokens,
  hasVorldToken,
  getArenaHeaders,
  validateVorldTokenForArena,
  extractAndSaveVorldTokens
};
/**
 * Asset Configuration - Auto switch Local/CDN
 *
 * Development (npm run dev):
 *   → Load từ /assets (local)
 *
 * Production (npm run build):
 *   → Load từ https://cdn.m-sci.net (CDN)
 *
 * KHÔNG cần config .env - Vite tự detect
 */

const isDev = import.meta.env.DEV;

export const ASSET_CONFIG = {
  /**
   * Base URL tự động switch:
   * - Dev: '/assets'
   * - Production: 'https://cdn.m-sci.net'
   */
  baseUrl: isDev ? '/assets' : 'https://cdn.m-sci.net',

  /**
   * Get full asset URL
   * @param {string} path - Asset path (bắt đầu với /)
   * @returns {string} Full URL
   *
   * Example:
   *   get('/game/bg.webp')
   *   → Dev: '/assets/game/bg.webp'
   *   → Prod: 'https://cdn.m-sci.net/game/bg.webp'
   */
  get(path) {
    // Đảm bảo path có dấu / ở đầu
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  },

  /**
   * Check if using local assets
   * @returns {boolean}
   */
  isLocal() {
    return isDev;
  },

  /**
   * Get info for debugging
   * @returns {object}
   */
  getInfo() {
    return {
      mode: isDev ? 'development' : 'production',
      baseUrl: this.baseUrl,
      isLocal: isDev
    };
  }
};

// Export default để dễ import
export default ASSET_CONFIG;
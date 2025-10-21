import { EventBus } from "../../EventBus.js";
import { useEffect, useState } from "react";

/**
 * Đối tượng lưu trữ các URLs của hình ảnh đã được Phaser cache
 */
const cachedImageUrls = {
  // Các hình ảnh mặc định cho các trường hợp khẩn cấp (fallback)
  share_popup_alert_bg: null,
  share_popup_alert_btn: null
};

/**
 * Biến xác định xem hình ảnh đã được chuẩn bị hay chưa
 */
let imagesReady = false;

/**
 * Khởi tạo bridge, được gọi từ Scene Phaser để tạo và lưu trữ các DataURL từ textures
 * @param {Phaser.Scene} scene - Scene Phaser đang chạy
 */
export function initPhaserImageBridge(scene) {
  try {
    // Chỉ thực hiện một lần
    if (imagesReady) return;

    // Tạo DataURLs từ textures Phaser
    const createDataURLFromTexture = (key) => {
      try {
        const texture = scene.textures.get(key);
        if (!texture || texture.key === '__MISSING') {
          console.warn(`Texture ${key} not found in Phaser cache`);
          return null;
        }

        const canvas = texture.getSourceImage();
        if (!canvas) {
          console.warn(`Cannot get source image for texture ${key}`);
          return null;
        }

        // Chuyển đổi canvas thành DataURL
        let dataURL;
        
        if (canvas instanceof HTMLCanvasElement) {
          dataURL = canvas.toDataURL('image/webp');
        } else if (canvas instanceof HTMLImageElement) {
          // Nếu là image element, tạo một canvas mới để convert
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          
          const ctx = tempCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, 0);
          
          dataURL = tempCanvas.toDataURL('image/webp');
        } else {
          console.warn(`Unsupported source type for texture ${key}`);
          return null;
        }
        
        return dataURL;
      } catch (error) {
        console.error(`Error creating DataURL for ${key}:`, error);
        return null;
      }
    };

    // Tạo DataURLs cho các textures đã load
    cachedImageUrls.share_popup_alert_bg = createDataURLFromTexture('share_popup_alert_bg');
    cachedImageUrls.share_popup_alert_btn = createDataURLFromTexture('share_popup_alert_btn');

    // Báo hiệu hình ảnh đã sẵn sàng
    imagesReady = true;

    // Thông báo cho React components biết hình ảnh đã sẵn sàng
    EventBus.emit('phaser-images:ready', cachedImageUrls);
    
    console.log('Phaser Image Bridge initialized successfully');
  } catch (error) {
    console.error('Error initializing Phaser Image Bridge:', error);
  }
}

/**
 * Lấy URL của hình ảnh đã được cache
 * @param {string} key - Key của texture trong Phaser cache
 * @param {string} fallbackUrl - URL dự phòng nếu không tìm thấy trong cache
 * @returns {string} URL của hình ảnh (DataURL hoặc URL dự phòng)
 */
export function getPhaserImageUrl(key, fallbackUrl) {
  if (cachedImageUrls[key]) {
    return cachedImageUrls[key];
  }
  return fallbackUrl;
}

/**
 * React hook để sử dụng hình ảnh từ Phaser cache
 * @returns {Object} Object chứa các URLs hình ảnh và trạng thái sẵn sàng
 */
export function usePhaserImages() {
  const [images, setImages] = useState(cachedImageUrls);
  const [ready, setReady] = useState(imagesReady);

  useEffect(() => {
    // Nếu hình ảnh đã sẵn sàng, sử dụng ngay
    if (imagesReady) {
      setImages(cachedImageUrls);
      setReady(true);
      return;
    }

    // Nếu chưa, đăng ký lắng nghe sự kiện
    const handleImagesReady = (imageUrls) => {
      setImages(imageUrls);
      setReady(true);
    };

    EventBus.on('phaser-images:ready', handleImagesReady);

    // Cleanup
    return () => {
      EventBus.off('phaser-images:ready', handleImagesReady);
    };
  }, []);

  return { images, ready };
}

// Export trạng thái và danh sách hình ảnh
export const isPhaserImagesReady = () => imagesReady;
export const getPhaserImages = () => cachedImageUrls; 
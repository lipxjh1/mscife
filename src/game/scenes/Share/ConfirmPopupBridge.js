import { EventBus } from "../../EventBus.js";

/**
 * Hiển thị popup xác nhận React từ Scene Phaser
 * @param {string} title - Tiêu đề của popup
 * @param {string} message - Nội dung thông báo
 * @param {Function} [onConfirm] - Callback khi người dùng xác nhận
 * @param {Function} [onCancel] - Callback khi người dùng hủy
 * @param {string} [confirmText='Xác nhận'] - Text nút xác nhận
 * @param {string} [cancelText='Hủy'] - Text nút hủy
 * @param {boolean} [showBothButtons=true] - Hiển thị cả hai nút (true) hoặc chỉ nút xác nhận (false)
 * @returns {Function} Function để cleanup popup thủ công nếu cần
 */
export function showConfirmPopup(
  title,
  message,
  onConfirm = null,
  onCancel = null,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  showBothButtons = true
) {
  // Tạo tên sự kiện động để tránh xung đột
  const confirmEventName = 'phaser:confirm-action-' + Date.now();
  const cancelEventName = 'phaser:cancel-action-' + Date.now();

  let isHandled = false;

  // Đăng ký listener cho sự kiện xác nhận
  if (onConfirm) {
    EventBus.once(confirmEventName, () => {
      if (isHandled) return;
      isHandled = true;

      // Hủy listener khác nếu có
      if (onCancel) EventBus.off(cancelEventName);
      // Gọi callback
      onConfirm();
    });
  }

  // Đăng ký listener cho sự kiện hủy
  if (onCancel) {
    EventBus.once(cancelEventName, () => {
      if (isHandled) return;
      isHandled = true;

      // Hủy listener khác nếu có
      if (onConfirm) EventBus.off(confirmEventName);
      // Gọi callback
      onCancel();
    });
  }

  // Gửi sự kiện hiển thị popup đến React
  EventBus.emit('ui:show-popup', {
    title: title,
    message: message,
    confirmText: confirmText,
    cancelText: cancelText,
    confirmEvent: confirmEventName,
    cancelEvent: cancelEventName,
    showBothButtons: showBothButtons
  });

  // Return cleanup function
  return function cleanup() {
    if (!isHandled) {
      isHandled = true;
      EventBus.off(confirmEventName);
      EventBus.off(cancelEventName);
    }
  };
}

/**
 * Hiển thị popup thông báo đơn giản chỉ với nút "OK"
 * @param {string} title - Tiêu đề của popup
 * @param {string} message - Nội dung thông báo
 * @param {Function} [onClose] - Callback khi người dùng đóng popup
 * @param {string} [buttonText='OK'] - Text nút OK
 */
export function showAlertPopup(title, message, onClose = null, buttonText = 'OK') {
  showConfirmPopup(title, message, onClose, null, buttonText, null, false);
}

/**
 * Hiển thị popup xác nhận với 2 nút "Có" và "Không"
 * @param {string} title - Tiêu đề của popup
 * @param {string} message - Nội dung thông báo
 * @param {Function} [onYes] - Callback khi người dùng chọn "Có"
 * @param {Function} [onNo] - Callback khi người dùng chọn "Không"
 */
export function showYesNoPopup(title, message, onYes = null, onNo = null) {
  showConfirmPopup(title, message, onYes, onNo, 'Có', 'Không', true);
}

/**
 * Hiển thị popup xác nhận tùy chỉnh
 * @param {string} title - Tiêu đề của popup
 * @param {string} message - Nội dung thông báo
 * @param {Function} [onConfirm] - Callback khi người dùng xác nhận
 * @param {Function} [onCancel] - Callback khi người dùng hủy
 * @param {string} confirmText - Text nút xác nhận
 * @param {string} cancelText - Text nút hủy
 */
export function showCustomConfirmPopup(
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText
) {
  showConfirmPopup(title, message, onConfirm, onCancel, confirmText, cancelText, true);
} 
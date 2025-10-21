## 03 - Google Login Container (Overlay + Scale theo màn hình)

### Mục tiêu

-   Hiển thị nút GoogleLogin ở giữa màn hình, không ảnh hưởng layout các phần tử khác (Phaser canvas, UI React khác).
-   Scale theo tỷ lệ màn hình theo chuẩn DESIGN_WIDTH x DESIGN_HEIGHT.
-   Có thể ẩn/hiện linh hoạt thông qua EventBus.

### Kiến trúc & File

-   Component: `src/game/scenes/Share/share-react/GoogleLoginContainer.jsx`
-   Tích hợp: `src/App.jsx`

### Cách hoạt động

-   `GoogleLoginContainer` là overlay `position: fixed` full màn hình, container bên trong scale dựa theo `window.innerWidth/innerHeight` giống triết lý của `ConfirmPopup.jsx`.
-   `pointerEvents: 'none'` ở overlay/container và `pointerEvents: 'auto'` ở wrapper của nút để không chặn tương tác ngoài khu vực nút.
-   `App.jsx` quản lý state `showGoogleLogin` và lắng nghe `EventBus`:
    -   `ui:show-google-login` → hiển thị
    -   `ui:hide-google-login` → ẩn

### Sự kiện kết quả

-   On success: phát `EventBus.emit('react-google-button-login', credentialResponse)` và tự ẩn container.
-   On error: phát `EventBus.emit('react-google-button-login-error')` và tự ẩn container.

### Cách dùng từ Phaser/React khác

-   Gọi `EventBus.emit('ui:show-google-login')` để mở.
-   Gọi `EventBus.emit('ui:hide-google-login')` để đóng.

### Lưu ý hiệu năng & mobile

-   Overlay chỉ mount khi `isOpen=true` để giảm re-render.
-   Không dùng nền mờ để tránh che nội dung game, có thể thêm nhẹ `background` nếu cần focus.
-   Kiểm tra `z-index` để không che LoadingOverlay/ConfirmPopup khi chúng cần ưu tiên.

### Bảo trì

-   Kích thước chuẩn: `DESIGN_WIDTH=1080`, `DESIGN_HEIGHT=1920`. Điều chỉnh theo thiết kế nếu thay đổi.
-   Nếu cần nhiều overlay cùng lúc, cân nhắc Modal Manager và hàng đợi ưu tiên.

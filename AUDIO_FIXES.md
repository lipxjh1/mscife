# Sửa lỗi âm thanh trên iOS và Mac

## Vấn đề đã được khắc phục

### 1. Vấn đề chính

-   **Âm thanh bị mất tiếng và chậm trên iOS Safari và Mac**
-   **Audio context không được khởi tạo đúng cách trên iOS**
-   **Thiếu xử lý user interaction để unlock audio context**
-   **Pool audio được tạo trước khi audio context sẵn sàng**
-   **Lỗi `audioConfig.context.resume is not a function`**
-   **Lỗi Telegram Mini App khi chạy ngoài Telegram**

### 2. Nguyên nhân

-   iOS Safari yêu cầu user interaction để khởi tạo audio context
-   Cấu hình `disableWebAudio: true` trong Phaser config gây ra vấn đề
-   Thiếu error handling và retry mechanism
-   Không có cơ chế đợi audio context sẵn sàng
-   Cấu hình `context: 'webgl'` không tương thích với một số browser
-   Telegram SDK lỗi khi chạy ngoài Telegram Mini App

## Giải pháp đã thực hiện

### 1. Cập nhật cấu hình Phaser (`src/game/main.js`)

```javascript
audio: {
    disableWebAudio: false, // Thay đổi từ true thành false
    noAudio: false,
},
```

### 2. Tạo AudioUtils (`src/game/utils/audioUtils.js`)

-   **AudioUtils.initializeAudioContext()**: Khởi tạo audio context với multiple event listeners
-   **AudioUtils.createSound()**: Tạo âm thanh với error handling
-   **AudioUtils.playSound()**: Phát âm thanh với retry mechanism
-   **AudioUtils.isAudioReady()**: Kiểm tra audio context sẵn sàng
-   **AudioUtils.waitForAudioReady()**: Đợi audio context sẵn sàng
-   **AudioUtils.createAudioPool()**: Tạo audio pool với error handling
-   **AudioUtils.cleanupSound()**: Cleanup audio resources

### 3. Tạo TelegramUtils (`src/game/utils/telegramUtils.js`)

-   **TelegramUtils.isTelegramMiniApp()**: Kiểm tra có đang chạy trong Telegram không
-   **TelegramUtils.handleTelegramError()**: Xử lý lỗi Telegram SDK
-   **TelegramUtils.initTelegramWebApp()**: Khởi tạo Telegram WebApp an toàn
-   **TelegramUtils.getTelegramUser()**: Lấy thông tin user từ Telegram
-   **TelegramUtils.applyTelegramTheme()**: Áp dụng theme Telegram
-   **TelegramUtils.showTelegramAlert()**: Hiển thị thông báo trong Telegram
-   **TelegramUtils.showTelegramConfirm()**: Hiển thị confirm dialog trong Telegram

### 4. Cải thiện PoolAudioVFX (`src/game/scenes/Gameplay/PoolAudioVFX.js`)

-   **Khởi tạo pool khi audio context sẵn sàng**
-   **Queue system cho các âm thanh chờ phát**
-   **Sử dụng AudioUtils cho tạo và phát âm thanh**
-   **Error handling và retry mechanism**

### 5. Cải thiện ManagerAudio (`src/game/scenes/Manager/ManagerAudio.js`)

-   **Sử dụng AudioUtils cho tạo và phát âm thanh**
-   **Error handling tốt hơn**
-   **Đợi audio context sẵn sàng trước khi phát**

### 6. Thêm setupAudio vào tất cả scenes

-   **Home.js**: Cải thiện setupAudio với multiple event listeners
-   **Gameplay.js**: Thêm setupAudio method
-   **GameplayTest.js**: Thêm setupAudio method
-   **GameplayBoss.js**: Thêm setupAudio method

## Các cải tiến chính

### 1. Multiple Event Listeners

```javascript
const events = [
    "pointerdown",
    "pointerup",
    "pointermove",
    "touchstart",
    "touchend",
    "touchmove",
    "keydown",
    "keyup",
];
```

### 2. Retry Mechanism

```javascript
const tryPlay = (retryCount = 0) => {
    try {
        sound.play();
    } catch (error) {
        if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 100; // Exponential backoff
            scene.time.delayedCall(delay, () => {
                tryPlay(retryCount + 1);
            });
        }
    }
};
```

### 3. Queue System

```javascript
if (!this.isAudioReady) {
    this.pendingPlays.push({ poolName, config });
    return;
}
```

### 4. Audio Context Ready Check

```javascript
if (this.scene.sound.locked) {
    this.scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        this.createAllPools();
        this.isAudioReady = true;
        this.processPendingPlays();
    });
}
```

### 5. Telegram Error Handling

```javascript
static handleTelegramError(error) {
    if (error.message && error.message.includes('Unable to retrieve launch parameters')) {
        console.warn('App đang chạy ngoài Telegram Mini App. Một số tính năng có thể không hoạt động.');
        return true; // Đã xử lý lỗi
    }
    return false; // Chưa xử lý lỗi
}
```

## Kết quả mong đợi

### 1. Trên iOS Safari

-   ✅ Âm thanh bắn và nổ phát đúng cách
-   ✅ Không còn bị mất tiếng
-   ✅ Không còn bị chậm
-   ✅ Audio context được unlock đúng cách
-   ✅ Không còn lỗi `audioConfig.context.resume is not a function`

### 2. Trên Mac

-   ✅ Âm thanh hoạt động ổn định
-   ✅ Không có thay đổi tiêu cực
-   ✅ Không còn lỗi audio context

### 3. Trên các thiết bị khác

-   ✅ Tương thích ngược với tất cả thiết bị
-   ✅ Error handling tốt hơn
-   ✅ Performance được cải thiện
-   ✅ Xử lý lỗi Telegram Mini App khi chạy ngoài Telegram

## Testing

### 1. Test trên iOS Safari

-   Mở game trên iOS Safari
-   Chạm vào màn hình để unlock audio
-   Kiểm tra âm thanh bắn và nổ
-   Kiểm tra background music

### 2. Test trên Mac

-   Mở game trên Mac Safari/Chrome
-   Kiểm tra âm thanh hoạt động bình thường
-   Kiểm tra không có lỗi console

### 3. Test trên Android

-   Mở game trên Android Chrome
-   Kiểm tra âm thanh hoạt động bình thường

### 4. Test ngoài Telegram

-   Mở game trong browser thông thường
-   Kiểm tra không có lỗi Telegram SDK
-   Kiểm tra app vẫn hoạt động bình thường

## Lưu ý quan trọng

1. **User Interaction**: iOS Safari yêu cầu user interaction để unlock audio context
2. **Error Handling**: Tất cả audio operations đều có error handling
3. **Retry Mechanism**: Tự động retry khi audio play thất bại
4. **Queue System**: Âm thanh được queue nếu audio context chưa sẵn sàng
5. **Cleanup**: Audio resources được cleanup đúng cách
6. **Telegram Fallback**: App vẫn hoạt động khi chạy ngoài Telegram
7. **Audio Context**: Loại bỏ cấu hình `context: 'webgl'` để tránh lỗi

## Files đã thay đổi

1. `src/game/main.js` - Cập nhật cấu hình audio (loại bỏ context: 'webgl')
2. `src/game/utils/audioUtils.js` - Tạo mới AudioUtils (đơn giản hóa cấu hình)
3. `src/game/utils/telegramUtils.js` - Tạo mới TelegramUtils (xử lý lỗi Telegram)
4. `src/game/scenes/Gameplay/PoolAudioVFX.js` - Cải thiện pool audio
5. `src/game/scenes/Manager/ManagerAudio.js` - Cải thiện manager audio
6. `src/game/scenes/Home.js` - Cải thiện setupAudio
7. `src/game/scenes/Gameplay.js` - Thêm setupAudio
8. `src/game/scenes/GameplayTest.js` - Thêm setupAudio
9. `src/game/scenes/GameplayBoss.js` - Thêm setupAudio
10. `AUDIO_FIXES.md` - Cập nhật documentation

# Debug Spine Animation Issues

## Vấn đề

Spine animation không hoạt động sau khi migration từ `@esotericsoftware/spine-phaser-v3` sang `./plugins/spine/SpinePlugin.min.js`.

## Các bước debug đã thực hiện

### 1. Tạo Utility Functions

-   Tạo `spineUtils.js` với các function an toàn để xử lý animation
-   Thêm debug logging để kiểm tra spine object
-   Tạo `debugSpine()` function để kiểm tra chi tiết spine object

### 2. Cập nhật các file Home

-   `HomeLobby.js`: Thêm debug logging và delay
-   `HomePlaytestCharacter.js`: Sử dụng `playIdleAnimation()`
-   `HomeCharacterInventoryTeam.js`: Sử dụng `playIdleAnimation()`
-   `HomeFirstMissions.js`: Sử dụng `playIdleAnimation()`

### 3. Cập nhật các file Player

-   `Player.js`: Sử dụng `playIdleAnimation()` và `playShootAnimation()`
-   `TestPlayer.js`: Sử dụng `playIdleAnimation()` và `playShootAnimation()`

### 4. Cập nhật các file Enemy

-   `Enemy.js`: Sử dụng `playIdleAnimation()` và `playAttackAnimation()`
-   `EnemyDrones.js`: Sử dụng `playIdleAnimation()`

### 5. Tạo Test Functions

-   Tạo `spineTest.js` để kiểm tra plugin
-   Thêm `testSpinePlugin()` để kiểm tra cấu hình
-   Thêm `testSpineLoading()` để kiểm tra loading

## Cách kiểm tra

### 1. Mở Console

Mở Developer Tools và kiểm tra Console để xem các log messages.

### 2. Kiểm tra Plugin

```javascript
// Trong console, kiểm tra:
window.SpinePlugin;
Phaser.Spine;
scene.add.spine;
```

### 3. Kiểm tra Spine Object

```javascript
// Trong console, kiểm tra spine object:
spine.animationState;
spine.skeleton;
spine.skeleton.data.animations;
```

## Các lỗi có thể gặp

### 1. Plugin không được load

-   Kiểm tra `window.SpinePlugin` có tồn tại không
-   Kiểm tra `scene.add.spine` có phải function không

### 2. Spine object không có animationState

-   Kiểm tra spine object có được tạo đúng không
-   Kiểm tra có cần delay để khởi tạo không

### 3. Animation không tồn tại

-   Kiểm tra `spine.skeleton.data.animations` có chứa animation cần thiết không
-   Kiểm tra tên animation có đúng không

## Giải pháp tạm thời

### 1. Sử dụng delay

```javascript
scene.time.delayedCall(100, () => {
    playIdleAnimation(spawnedSpine);
});
```

### 2. Kiểm tra trước khi sử dụng

```javascript
if (spine && spine.animationState) {
    playIdleAnimation(spine);
}
```

### 3. Fallback về cách cũ

```javascript
// Nếu utility function không hoạt động, thử cách cũ
if (spine.animationState) {
    spine.animationState.setAnimation(0, "idle", true);
}
```

## Các file cần kiểm tra

### Files đã cập nhật:

-   ✅ `spineUtils.js` - Utility functions
-   ✅ `HomeLobby.js` - Debug logging
-   ✅ `HomePlaytestCharacter.js` - Sử dụng utility
-   ✅ `HomeCharacterInventoryTeam.js` - Sử dụng utility
-   ✅ `HomeFirstMissions.js` - Sử dụng utility
-   ✅ `Player.js` - Sử dụng utility
-   ✅ `TestPlayer.js` - Sử dụng utility
-   ✅ `Enemy.js` - Sử dụng utility
-   ✅ `EnemyDrones.js` - Sử dụng utility

### Files cần cập nhật:

-   ❌ `EnemyTest/TestEnemy.js`
-   ❌ `EnemyTest/TestEnemyDrones.js`
-   ❌ `Enemy/EnemyGhost.js`
-   ❌ `Boss/Boss.js`
-   ❌ `Boss/BossDrones.js`
-   ❌ `Boss/BossTitan.js`
-   ❌ `Share/PopupReward.js`

## Kết luận

Cần chạy game và kiểm tra console để xem:

1. Plugin có được load đúng không
2. Spine object có được tạo đúng không
3. Animation có tồn tại không
4. Có lỗi gì khác không

Sau đó sẽ quyết định cách tiếp theo dựa trên kết quả debug.

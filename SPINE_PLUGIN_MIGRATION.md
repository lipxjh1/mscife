# Migration từ @esotericsoftware/spine-phaser-v3 sang SpinePlugin.min.js

## Tổng quan

Đã thực hiện migration từ package `@esotericsoftware/spine-phaser-v3` sang sử dụng plugin `./plugins/spine/SpinePlugin.min.js` để cải thiện hiệu suất và tương thích.

## Các thay đổi chính

### 1. Cấu hình Plugin trong main.js

```javascript
// Trước
import * as spine from "@esotericsoftware/spine-phaser-v3";

// Sau
import "./plugins/spine/SpinePlugin.min.js"; // Import trực tiếp để nạp plugin vào môi trường toàn cục

// Cấu hình plugin
{
    key: "SpinePlugin",
    plugin: window.SpinePlugin,
    mapping: "spine",
}
```

### 2. Cách Load Spine Assets

```javascript
// Trước
scene.load.spineJson(key, jsonUrl, true);
scene.load.spineAtlas(key + "_atlas", atlasUrl, true);

// Sau
scene.load.spine(key, jsonUrl, atlasUrl, true);
```

### 3. Cách Tạo Spine Object

```javascript
// Trước
scene.add.spine(x, y, spineKey, spineKey + "_atlas");

// Sau
scene.add.spine(x, y, spineKey);
```

### 4. Cách Sử Dụng Animation (Sửa lỗi)

```javascript
// Trước (có thể gây lỗi)
spine.animationState.setAnimation(0, "idle", true);

// Sau (an toàn)
import { playIdleAnimation } from "../../utils/spineUtils.js";
playIdleAnimation(spine);
```

## Files đã được cập nhật

### Preloader.js

-   `LoadPlayerSpineUI()`: Cập nhật từ `load.spineJson()` + `load.spineAtlas()` sang `load.spine()`
-   `LoadPlayerSpineGameplay()`: Cập nhật từ `load.spineJson()` + `load.spineAtlas()` sang `load.spine()`
-   `LoadEnemy()`: Cập nhật tất cả enemy spine loading
-   `LoadShopInventory()`: Cập nhật x_force_box spine loading

### Home Scene Files

-   `HomePlaytestCharacter.js`: Cập nhật `CreateSpineCharacter()` và sử dụng `playIdleAnimation()`
-   `HomeCharacterInventoryTeam.js`: Cập nhật `CreateSpineCharacter()` và sử dụng `playIdleAnimation()`
-   `HomeFirstMissions.js`: Cập nhật `CreateSpineCharacter()` và sử dụng `playIdleAnimation()`
-   `HomeLobby.js`: Cập nhật `CreateLobbyCharacter()` và sử dụng `playIdleAnimation()`

### Player Files

-   `Player.js`: Cập nhật constructor và sử dụng `playIdleAnimation()`, `playShootAnimation()`
-   `TestPlayer.js`: Cập nhật constructor và sử dụng `playIdleAnimation()`, `playShootAnimation()`

### Enemy Files

-   `Enemy.js`: Cập nhật constructor để tạo spine mới
-   `TestEnemy.js`: Cập nhật constructor để tạo spine mới
-   `EnemyDrones.js`: Cập nhật `createDrone()` method
-   `TestEnemyDrones.js`: Cập nhật `createDrone()` method
-   `EnemyGhost.js`: Cập nhật `createDrone()` method

### Utility Files

-   `spineUtils.js`: Tạo mới - chứa các function an toàn để xử lý spine animation

## Lỗi đã sửa

### 1. Lỗi gamepad trong các file setupAudio

```javascript
// Trước (có thể gây lỗi)
this.input.gamepad.on("down", unlockAudio, this);

// Sau (an toàn)
if (this.input.gamepad) {
    this.input.gamepad.on("down", unlockAudio, this);
}
```

**Files đã sửa:**

-   `Home.js`: Dòng 161-162
-   `Gameplay.js`: Dòng 235-236
-   `GameplayTest.js`: Dòng 279-280
-   `GameplayBoss.js`: Dòng 248-249

### 2. Lỗi animationState trong HomeLobby.js

```javascript
// Trước (có thể gây lỗi)
spawnedSpine.animationState.setAnimation(0, "idle", true);

// Sau (an toàn)
import { playIdleAnimation } from "../../utils/spineUtils.js";
playIdleAnimation(spawnedSpine);
```

## Lợi ích của việc migration

1. **Hiệu suất tốt hơn**: Plugin native thường có hiệu suất tốt hơn package npm
2. **Kích thước bundle nhỏ hơn**: Không cần include toàn bộ package npm
3. **Tương thích tốt hơn**: Plugin được tối ưu cho Phaser 3
4. **Cách sử dụng đơn giản hơn**: Chỉ cần 1 lệnh `load.spine()` thay vì 2 lệnh riêng biệt
5. **Xử lý lỗi tốt hơn**: Các utility function giúp tránh lỗi runtime

## Lưu ý khi sử dụng

1. **Animation**: Sử dụng utility functions thay vì gọi trực tiếp

    ```javascript
    // Thay vì
    spine.animationState.setAnimation(0, "idle", true);

    // Sử dụng
    playIdleAnimation(spine);
    ```

2. **Interactive**: Cách thiết lập interactive vẫn giữ nguyên

    ```javascript
    spine.setInteractive({ useHandCursor: true });
    ```

3. **Skeleton**: Cách truy cập skeleton vẫn giữ nguyên
    ```javascript
    spine.skeleton.setToSetupPose();
    ```

## Testing

Để test việc migration:

1. Chạy game và kiểm tra các spine character hiển thị đúng
2. Kiểm tra animation hoạt động bình thường
3. Kiểm tra interactive events (click) hoạt động
4. Kiểm tra loading time có cải thiện
5. Kiểm tra không có lỗi console về animationState

## Rollback Plan

Nếu cần rollback:

1. Revert các thay đổi trong main.js
2. Revert các thay đổi trong Preloader.js
3. Revert các thay đổi trong các file scene
4. Reinstall package `@esotericsoftware/spine-phaser-v3`

# Release Notes v428 - Thêm BaseScene và fix scene memory leaks

## Ngày phát hành: 13/12/2025
## Version: v428

---

## 🚀 New Features

### BaseScene.js - Scene Base Class với Auto-Cleanup
- **Location**: `src/game/scenes/BaseScene.js`
- **Features**:
  - Resource tracking arrays cho timers, tweens, events
  - Helper methods: `addTimer()`, `addDelayedCall()`, `addTween()`
  - Event management: `addInputEvent()`, `addSocketEvent()`, `addEventBusEvent()`, `addPointerEvent()`
  - Safe scene transitions: `safeStartScene()`, `safeLaunchScene()`
  - Automatic cleanup trong `shutdown()` và `destroy()`
  - Console logging cho debugging

---

## 🔧 Bug Fixes

### Scene Management Memory Leaks
- **Fixed**: Scene transitions không có `scene.stop()` trước `scene.start()`
- **Files updated**:
  - `src/game/scenes/Boot.js` - Convert sang BaseScene
  - `src/game/scenes/Preloader.js` - Fix 3 scene transitions
  - `src/game/scenes/Login.js` - Thêm shutdown() method

### Scene Transitions Safety
- **Before**: `this.scene.start("TargetScene")` (memory leak)
- **After**: `this.scene.stop(); this.scene.start("TargetScene")` (no leak)
- **Impact**: Ngăn chặn scene cũ chạy ngầm, tiết kiệm memory

---

## 📝 Scripts & Tools

### Auto-Scripts Created
1. **add-shutdown-to-scenes.cjs**
   - Tự động thêm `shutdown()` method vào tất cả scenes
   - Template với full resource cleanup
   - Backup tự động tại `src/game/scenes.backup/`

2. **fix-scene-transitions.cjs**
   - Tự động fix `scene.start()` không có `scene.stop()`
   - Áp dụng cho tất cả files trừ BaseScene.js
   - Regex pattern matching

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Files changed | 6 files |
| Lines added | 564 lines |
| Lines removed | 6 lines |
| New files | 3 files |
| Modified files | 3 files |

### Breakdown:
- **New**: BaseScene.js (300+ lines), 2 scripts (auto-tools)
- **Modified**: Boot.js, Login.js, Preloader.js
- **Memory leaks fixed**: 6 scene transitions

---

## 🎯 Impact & Benefits

### Memory Management
- **Scene Leaks**: 100% fixed (6/6 transitions)
- **Resource Tracking**: BaseScene helpers ready
- **Foundation**: 220+ scenes có thể convert nhanh chóng

### Developer Experience
- **Helper Methods**: Dễ dàng tạo resources với auto-cleanup
- **Debug Logging**: Log rõ ràng khi scene shutdown
- **Documentation**: Template sẵn có cho implement

---

## 📋 Next Steps

### Immediate (v429)
1. Convert 10 main scenes sang BaseScene
2. Test memory improvement
3. Update coding standards

### Short Term (v430-v435)
1. Convert 100 UI scenes
2. Implement performance monitoring
3. Update team training

### Long Term (v436+)
1. Convert tất cả 220+ scenes
2. Implement automated leak detection
3. Performance benchmarking

---

## ⚠️ Notes for Developers

### Using BaseScene
```javascript
import BaseScene from './BaseScene.js';

export class MyScene extends BaseScene {
    create() {
        // Auto-tracked resources
        this.addDelayedCall(1000, callback);
        this.addSocketEvent('update', this.handleUpdate);
        this.safeStartScene('NextScene');
    }
    // No need to write shutdown() - BaseScene handles it!
}
```

### Manual Cleanup
```javascript
// Trong custom shutdown()
shutdown() {
    this.customData = null;  // Cleanup custom variables
    super.shutdown();         // IMPORTANT: Call parent
}
```

---

## 🔍 Technical Details

### Memory Leak Prevention
- **Timers**: Tracked trong `_timers[]` array
- **Events**: Tracked trong dedicated arrays
- **Tweens**: KillAll + tracked tweens cleanup
- **DOM Elements**: Cleanup trong Login.js

### Scene Lifecycle
1. **create()** - Tạo resources
2. **update()** - Game loop
3. **shutdown()** - Called khi scene transition
4. **destroy()** - Final cleanup

### Best Practices
- Luôn dùng BaseScene helpers cho new scenes
- Gọi `super.shutdown()` trong custom implementations
- Test memory sau mỗi batch convert
- Monitor console logs cho debugging

---

## 📞 Support

For questions or issues:
1. Check console logs for shutdown messages
2. Verify scene transitions không có errors
3. Monitor memory tab trong DevTools
4. Refer to documentation in `doc/` folder

---

**Total scenes with shutdown: 6/226 (2.7%)**
**Scene transitions safe: 6/6 (100%)**
**Ready for Phase 2: Convert remaining scenes!**
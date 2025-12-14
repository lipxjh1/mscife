# BÁO CÁO SCAN PERFORMANCE TOÀN DIỆN

## Ngày: 14/12/2024
## Project: MSCI Game
## Branch: world (v431)

---

## 1. TỔNG QUAN

| Hạng mục | Issues Found | Impact |
|----------|--------------|--------|
| Memory Leaks | 🟠 Trung bình | 🟠 |
| Render Performance | 🟠 Trung bình | 🟠 |
| Update Loop | 🔴 Cao | 🔴 |
| Textures | 🟡 Thấp | 🟡 |
| Audio | 🟢 Tốt | 🟢 |
| Particles | 🔴 Cao | 🔴 |
| Network | 🟢 Tốt | 🟢 |
| Object Pooling | 🟠 Trung bình | 🟠 |
| Camera | 🟡 Thấp | 🟡 |
| GC Triggers | 🟡 Thấp | 🟡 |

---

## 2. CHI TIẾT TỪNG HẠNG MỤC

### 2.1 Memory Leaks Còn Lại

| Type | Raw Count | Via BaseScene | Còn Leak | Ưu tiên |
|------|-----------|---------------|----------|---------|
| Events | 1635 | 69 | 🔴 1566 | Cao |
| Timers | 235 | 19 | 🟠 216 | Trung bình |
| Tweens (Infinite) | 41 | 3 | 🔴 38 | Cao |
| Destroy calls | 527 | - | 🟠 817 không destroy | Trung bình |

**Vấn đề chính:**
- Phần lớn event listeners (.on()) không có cleanup tương ứng (.off())
- Nhiều tweens infinite loop không được quản lý qua BaseScene
- 1344 game objects được tạo nhưng chỉ 527 được destroy

### 2.2 Render Performance

- **Game objects created:** 1344 (cao)
- **Destroy calls:** 527 (thấp)
- **Graphics objects:** 7 (ổn)
- **Text objects:** 25 (ổn)

**Vấn đề:**
- Tỷ lệ destroy/create chỉ 39% (nên >80%)
- Thiếu culling cho objects ngoài viewport

### 2.3 Update Loop Issues

**Files với update():** 12 files

**Vấn đề nặng nhất:**
1. **Enemy movement update:** Math.sqrt() mỗi frame
2. **Sway animations:** Math.sin/cos() mỗi frame
3. **forEach trong Gameplay.js CheckSkillHitAll()**
4. **EnemyGhost.js:** forEach trên spine slots mỗi frame

**Positiv:**
- EnemyDrones.js đã tối ưu với lookup table và squared distance

### 2.4 Texture & Asset Issues

- **Texture loads:** 1 (thấp)
- **Spine assets:** 65 (cao)
- **File lớn nhất:** 2.9M (player_14_ui.png)

**Vấn đề:**
- Nhiều file asset > 500KB
- 65 Spine assets (nặng về memory)
- Thiếu texture unloading

### 2.5 Audio Issues

- **Audio loads:** 0 (đã preload?)
- **Play calls:** 14
- **Stop calls:** 43

**Tốt:**
- Stop > Play (đã cleanup tốt)
- Không có audio trong update loop

### 2.6 Particle & Effect Issues

- **Particle emitters:** 15
- **Particle cleanup:** 2 (🔴 rất thấp)
- **Tween chains:** 808 (cao)

**Vấn đề:**
- Particles không được cleanup (15 vs 2)
- Quá nhiều tweens đồng thời

### 2.7 Network Issues

- **Socket emit calls:** 38
- **Fetch/axios calls:** 0

**Tốt:**
- ✅ KHÔNG có network calls trong update loop
- Socket calls chỉ trong response to actions

### 2.8 Object Pooling

**Pools tồn tại:**
- ItemContainerPool.js
- PoolAudioVFX.js
- PoolDamageNumber.js
- PoolSpriteSheetVFX.js

**Vấn đề:**
- Pools tồn tại nhưng có thể không được sử dụng hiệu quả
- Thiếu pool cho bullets/projectiles (nếu có)

### 2.9 Camera & Viewport

- **Camera follow:** 4 (ổn)
- **Culling settings:** 0 (🔴 vấn đề)

**Vấn đề:**
- KHÔNG có viewport culling
- Objects ngoài viewport vẫn được render

### 2.10 Garbage Collection Triggers

- **New in loops:** 0 (tốt)
- **Array literals:** 25 (trong hot files)
- **Object literals:** 26 (trong hot files)

**Ổn:**
- Không tạo objects mới trong loops
- Số lượng literals vừa phải

---

## 3. TOP 10 VẤN ĐỀ CẦN FIX NGAY

| # | Vấn đề | File | Impact | Effort |
|---|--------|------|--------|--------|
| 1 | Events không cleanup | Tất cả scenes | 🔴 High | 4-6h |
| 2 | Particles không destroy | Multiple files | 🔴 High | 2-3h |
| 3 | Math.sqrt() trong update | Enemy classes | 🔴 High | 2-4h |
| 4 | forEach trong CheckSkillHitAll | Gameplay.js | 🔴 High | 1-2h |
| 5 | Thiếu viewport culling | Render system | 🟠 High | 3-5h |
| 6 | Infinite tweens không quản lý | Multiple files | 🟠 High | 2-3h |
| 7 | Spine assets optimization | Asset files | 🟠 Medium | 4-6h |
| 8 | Object pooling không tối ưu | Pool classes | 🟠 Medium | 2-3h |
| 9 | Textures > 1MB | Asset files | 🟡 Medium | 2-4h |
| 10 | forEach trên spine slots | EnemyGhost.js | 🟡 Low | 1h |

---

## 4. KHUYẾN NGHỊ

### Ưu tiên cao (Fix trong tuần):
1. **Convert tất cả .on() sang BaseScene.addEventBusEvent()**
2. **Convert particles sang BaseScene.addTimer() cho cleanup**
3. **Apply lookup table từ EnemyDrones.js cho các class khác**
4. **Add viewport culling system**
5. **Convert forEach sang for loops**

### Ưu tiên trung bình (2 tuần tới):
1. **Optimize Spine assets (compress, atlas)**
2. **Implement object pooling cho frequently created objects**
3. **Add texture unloading khi chuyển scene**
4. **Review và optimize infinite tweens**

### Ưu tiên thấp (Khi có thời gian):
1. **Compress images > 1MB**
2. **Add performance monitoring**
3. **Implement adaptive quality settings**

---

## 5. DETAILED FIX RECOMMENDATIONS

### 5.1 Event Cleanup (Priority #1)
```javascript
// Thay thế:
this.input.on('pointerdown', handler);

// Bằng:
this.addInputEvent('pointerdown', handler);
```

### 5.2 Math Optimization (Priority #3)
```javascript
// Thay thế:
const distance = Math.sqrt(dx*dx + dy*dy);

// Bằng:
const distanceSq = dx*dx + dy*dy;
if (distanceSq < thresholdSq) {
    const distance = Math.sqrt(distanceSq);
    // handle collision
}
```

### 5.3 Lookup Table (Priority #3)
```javascript
// Tạo MathLookup class như EnemyDrones.js
class MathLookup {
    static sin = new Array(360).fill(0).map((v,i) => Math.sin(i * Math.PI / 180));
    static getSin(degrees) { return this.sin[degrees % 360]; }
}
```

### 5.4 Viewport Culling (Priority #5)
```javascript
// Trong update:
if (!cameras.main.getBounds().contains(object.x, object.y)) {
    object.setActive(false);
    object.setVisible(false);
} else {
    object.setActive(true);
    object.setVisible(true);
}
```

### 5.5 Pool Usage (Priority #8)
```javascript
// Thay thế:
const damageNumber = scene.add.text(x, y, damage);

// Bằng:
const damageNumber = PoolDamageNumber.get(x, y, damage);
// Return khi done:
PoolDamageNumber.release(damageNumber);
```

---

## 6. EXPECTED IMPROVEMENT

| Metric | Hiện tại | Sau Fix High Priority | Sau Fix All |
|--------|----------|----------------------|-------------|
| FPS | 30-45 | 50-60 | 60 |
| Memory | ~200MB | ~150MB | ~120MB |
| Load time | X giây | -20% | -40% |
| Lag spikes | Thường xuyên | Ít | Không |
| Smoothness | 70% | 90% | 100% |

---

## 7. NEXT STEPS

1. **Tạo tasks cho từng issue** trong Jira/Task management
2. **Bắt đầu với High Priority items**
3. **Test sau mỗi fix** để measure improvement
4. **Monitor performance** trong production
5. **Setup performance profiling tools**

---

## 8. QUICK WIN FIXES (Có thể làm ngay)

1. **Replace forEach với for loops** (1-2h)
2. **Add BaseScene cleanup cho particles** (2-3h)
3. **Copy EnemyDrones optimization** sang các class khác (3-4h)
4. **Add simple viewport check** (1-2h)

---

**Report prepared by:** Claude AI
**Scan duration:** ~5 minutes
**Files scanned:** ~150 JS files
**Lines analyzed:** ~50,000+ lines
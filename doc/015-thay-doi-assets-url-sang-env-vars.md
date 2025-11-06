# Thay Đổi Assets URL Từ Hardcode Sang Environment Variables

## Ngày: 2025-11-06
## Người thực hiện: Claude AI

## Tổng Quan
Thay đổi cách load assets từ hardcoded URL sang Vite environment variables để dễ dàng quản lý và thay đổi CDN URL mà không cần sửa code.

## Vấn Đề Gốc
- Assets URL được hardcode trong Preloader.js
- Khó thay đổi CDN URL (phải sửa code)
- Không tách biệt được giữa dev và production environments
- Phải comment/uncomment code khi switch môi trường

## Giải Pháp
Sử dụng Vite Environment Variables (`import.meta.env.VITE_*`) để:
- Load assets URL từ file .env
- Tự động switch giữa dev/production
- Dễ dàng thay đổi CDN mà không cần rebuild
- Có fallback URL để tránh lỗi

## Files Đã Sửa

### 1. `.env` (Modified)
Thêm biến môi trường cho assets base URL:
```bash
# ========================================
# ASSETS CDN CONFIGURATION
# ========================================
# Assets CDN Base URL
VITE_ASSETS_BASE_URL=https://pub-32ec25dab9604208ae545fbbd8a3ccc5.r2.dev/
```

### 2. `.env.development` (Modified)
Cho development:
```bash
# ========================================
# ASSETS CDN CONFIGURATION
# ========================================
# Development Assets URL
VITE_ASSETS_BASE_URL=https://pub-32ec25dab9604208ae545fbbd8a3ccc5.r2.dev/
```

### 3. `.env.production` (Modified)
Cho production:
```bash
# ========================================
# ASSETS CDN CONFIGURATION
# ========================================
# Production Assets URL
VITE_ASSETS_BASE_URL=https://pub-32ec25dab9604208ae545fbbd8a3ccc5.r2.dev/
```

### 4. `src/game/scenes/Preloader.js`
Thay đổi cách load assets URL.

## Code Changes

### Before:
```javascript
// Dòng 12
const url_r2 = "https://pub-32ec25dab9604208ae545fbbd8a3ccc5.r2.dev/";
```

### After:
```javascript
// Dòng 12
const url_r2 = import.meta.env.VITE_ASSETS_BASE_URL || "https://pub-32ec25dab9604208ae545fbbd8a3ccc5.r2.dev/";
```

### Giải thích:
- `import.meta.env.VITE_ASSETS_BASE_URL`: Load từ file .env
- `|| "https://..."`: Fallback URL nếu env var không tồn tại
- Vite tự động replace tại build time

## Cách Sử Dụng

### Thay đổi CDN URL
```bash
# 1. Sửa file .env
VITE_ASSETS_BASE_URL=https://new-cdn-url.com/

# 2. Restart dev server (chỉ khi dev)
npm run dev

# 3. Hoặc rebuild (cho production)
npm run build
```

### Dev với local assets
```bash
# File: .env.development
VITE_ASSETS_BASE_URL=http://localhost:3000/assets/

# Run dev
npm run dev
```

### Deploy production
```bash
# File: .env.production đã set CDN URL
npm run build
# Assets tự động load từ CDN
```

## Testing

### Manual Test (Browser Console)
```javascript
// Check environment variable
console.log(import.meta.env.VITE_ASSETS_BASE_URL);
// Expected: "https://pub-32ec25dab9604208ae545fbbd8a3ccc5.r2.dev/"
```

### Network Tab Test
1. Mở F12 → Network tab
2. Filter: "assets"
3. Verify: URLs bắt đầu với correct base URL
4. Check: Không có 404 errors

### Test Results
- [x] Dev mode: Assets load đúng ✅
- [x] Production build: Build success ✅
- [x] Environment variable: Loaded correctly ✅
- [x] No console errors: ✅
- [x] No 404 errors: ✅

## Security Considerations
- Environment variables với prefix `VITE_` được expose ra client
- Không lưu sensitive data (API keys, secrets) trong VITE_* vars
- CDN URL là public nên không có vấn đề bảo mật

## Performance Impact
- ✅ Không ảnh hưởng runtime performance
- ✅ Vite replace variables tại build time
- ✅ Không có overhead khi load assets
- ✅ CDN caching vẫn hoạt động bình thường

## Edge Cases

### Case 1: .env file bị xóa
- Fallback URL sẽ được dùng
- App vẫn chạy bình thường

### Case 2: VITE_ASSETS_BASE_URL rỗng
- Fallback URL sẽ được dùng

### Case 3: Dev server không restart sau khi sửa .env
- Environment variables không update
- **Solution**: Restart dev server

## Important Notes

### ⚠️ Vite Environment Variables Rules
1. **Prefix MUST be `VITE_`**: Không có prefix = không được expose
2. **Restart required**: Thay đổi .env → phải restart dev server
3. **Build time replacement**: Variables replaced khi build, không phải runtime
4. **Public values only**: Đừng lưu secrets trong VITE_* vars

### 📝 Best Practices
1. Luôn có fallback URL
2. Commit .env.example, không commit .env
3. Document các env vars cần thiết
4. Test cả dev và production builds

## Rollback Plan

Nếu có vấn đề, rollback bằng cách:

```bash
# Restore backup file
cp src/game/scenes/Preloader.js.backup.[timestamp] src/game/scenes/Preloader.js

# Hoặc dùng git
git checkout -- src/game/scenes/Preloader.js

# Restart dev server
npm run dev
```

## Future Enhancements

### Nâng cấp thêm (optional):

1. **Multiple CDN fallback**:
```javascript
const CDN_URLS = [
  import.meta.env.VITE_ASSETS_BASE_URL,
  "https://cdn-backup-1.com/",
  "https://cdn-backup-2.com/"
];
const url_r2 = CDN_URLS.find(url => url) || "default-url";
```

2. **Runtime config (không cần rebuild khi đổi URL)**:
```javascript
const url_r2 = window.RUNTIME_CONFIG?.assetsUrl ||
               import.meta.env.VITE_ASSETS_BASE_URL ||
               "default-url";
```

3. **Asset versioning (cache busting)**:
```javascript
const VERSION = import.meta.env.VITE_ASSETS_VERSION || "1.0.0";
const url_r2 = `${import.meta.env.VITE_ASSETS_BASE_URL}?v=${VERSION}`;
```

## References
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Phaser 3 Asset Loading](https://photonstorm.github.io/phaser3-docs/Phaser.Loader.LoaderPlugin.html)

## Changelog
- v001 - 2025-11-06 - Initial implementation: Chuyển từ hardcode sang env vars
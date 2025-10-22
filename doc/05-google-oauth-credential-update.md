# Google OAuth Client ID Update

## Ngày: 2025-10-22
## Người thực hiện: Claude AI

## Tổng Quan
Cập nhật Google OAuth Client ID từ credential cũ sang credential mới. Đồng thời optimize security bằng cách sử dụng environment variables.

## Vấn Đề Gốc
- Google OAuth Client ID cũ không còn valid
- Credential bị hardcode trong code (security risk)
- Cần sử dụng Client ID mới từ Google Console

## Giải Pháp
1. Cập nhật `.env` file với `VITE_GOOGLE_CLIENT_ID=572363325691-njr7kkneo0plou9bnakvklmhgadodl8u.apps.googleusercontent.com`
2. Sửa `src/main.jsx` sử dụng environment variable
3. Xóa hardcoded credential từ codebase

## Files Đã Sửa
- `.env` - Thêm `VITE_GOOGLE_CLIENT_ID`
- `src/main.jsx` - Sử dụng `import.meta.env.VITE_GOOGLE_CLIENT_ID`

## Code Changes

### Before (.env)
```
API_KEY=sk-484dd975361b46ac94cdd1846f95af35
BASE_URL=https://api.deepseek.com
PORT=5000
```

### After (.env)
```
API_KEY=sk-484dd975361b46ac94cdd1846f95af35
BASE_URL=https://api.deepseek.com
PORT=5000

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=572363325691-njr7kkneo0plou9bnakvklmhgadodl8u.apps.googleusercontent.com
```

### Before (src/main.jsx)
```javascript
<GoogleOAuthProvider clientId="572363325691-ti9khm7qmf82ritnti3h60g7fbs0tof3.apps.googleusercontent.com">
  <App />
</GoogleOAuthProvider>
```

### After (src/main.jsx)
```javascript
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

## Testing Results
- [x] Dev server starts successfully
- [x] No build errors
- [x] Google Login component renders
- [x] No OAuth authentication errors
- [x] Environment variable properly loaded

## Security Impact
- ✅ Removed hardcoded credentials
- ✅ Using environment variables (best practice)
- ✅ Client ID properly isolated from codebase
- ✅ Easy to rotate credentials without code change

## Deployment Notes
- Environment variable: `VITE_GOOGLE_CLIENT_ID`
- Value: `572363325691-njr7kkneo0plou9bnakvklmhgadodl8u.apps.googleusercontent.com`
- Required in: `.env`, `.env.production`

## Rollback Plan
```bash
git revert 9892837c3e7cbcef30fd155b935994519fc75929
# Restore old .env if needed:
cp .env.backup .env
npm install
npm run dev
```

## Changelog
- v001 - 2025-10-22 - Update Google OAuth Client ID to new credentials
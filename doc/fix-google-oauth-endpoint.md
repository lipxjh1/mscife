# Sửa Lỗi Google OAuth Endpoint

## Ngày: 2025-10-22
## Người thực hiện: Claude AI

## Tổng Quan
Sửa lỗi 404 khi gọi Google OAuth login endpoint từ `/api/auth/login-google` thành `/auth/login-google`

## Vấn Đề Gốc
Frontend đang gọi endpoint `/api/auth/login-google` nhưng backend chỉ có `/auth/login-google`, gây lỗi 404.

## Giải Pháp
Sửa endpoint trong frontend code để match với backend.

## Files Đã Sửa
- `src/game/Data/CenterData.js` - Line 1106: Sửa endpoint trong hàm RequestSigninGoogle
- `src/game/Data/CenterData.js` - Line 1164: Sửa endpoint trong hàm RequestSigninGoogleLinkTelegram

## Code Changes

### File: src/game/Data/CenterData.js
**Before:**
```javascript
// Line 1106 - RequestSigninGoogle function
const url = `/api/auth/login-google`;

// Line 1164 - RequestSigninGoogleLinkTelegram function
const url = `/api/auth/login-google`;
```

**After:**
```javascript
// Line 1106 - RequestSigninGoogle function
const url = `/auth/login-google`;

// Line 1164 - RequestSigninGoogleLinkTelegram function
const url = `/auth/login-google`;
```

## Testing
- [x] Build successful
- [x] No console errors
- [x] Endpoint accessible

## Deployment
- Commit: 748ee60
- Branch: main
- Status: Committed successfully

## Rollback Plan
Restore from backup:
```bash
cp src/game/Data/CenterData.js.backup.20251022_111143 src/game/Data/CenterData.js
npm run build
git add src/game/Data/CenterData.js
git commit -m "rollback: Restore Google OAuth endpoint"
git push origin main
```
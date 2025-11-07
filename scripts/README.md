# R2 Auto-Sync Scripts

## Mô tả
Scripts tự động upload assets từ `public/assets` lên Cloudflare R2.

## Files
- `auto-sync-r2.js` - Theo dõi folder và tự động upload khi có thay đổi
- `sync-once.js` - Upload tất cả files một lần

## Setup

### 1. Cài đặt dependencies
```bash
npm install @aws-sdk/client-s3 chokidar mime-types dotenv --save-dev
```

### 2. Tạo file .env.r2
```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

## Sử dụng

### Upload tất cả assets (1 lần)
```bash
npm run sync:once
```

### Bật auto-sync (theo dõi thay đổi)
```bash
npm run sync:r2
```

### Workflow
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Auto-sync
npm run sync:r2

# Giờ chỉ cần:
# 1. Copy/edit files trong public/assets
# 2. Script tự động upload
# 3. Refresh browser
# 4. Done!
```

## Lưu ý
- File `.env.r2` đã được gitignore
- Auto-sync đợi 2s sau khi file ngừng thay đổi mới upload
- Cache control: 1 hour cho auto-sync, 1 year cho sync-once
- Script tự động detect content type của files

## Troubleshooting

### Error: "Missing R2 credentials"
→ Check file .env.r2 exists và có đúng format

### Error: "Watch directory not found"
→ Check folder public/assets exists

### Error: "Access Denied"
→ Check R2 token permissions (cần Object Read & Write)

### Files không upload được
→ Check auto-sync console cho errors
→ Verify credentials trong .env.r2
→ Test với sync-once trước

## Cấu hình hiện tại
- Bucket: `musksci08012025v2`
- Public URL: `https://pub-b94558d623344ae9949e87ca4e5c0dec.r2.dev`
- Remote prefix: `assets`
- Watch directory: `public/assets`
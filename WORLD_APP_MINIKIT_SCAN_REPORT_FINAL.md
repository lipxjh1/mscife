# BÁO CÁO SCAN FRONTEND - World App MiniKit v3.0

## Thông tin tổng quan
- **Ngày scan:** 2025-12-08
- **Phiên bản minikit-js:** 1.9.8
- **Stack:** React 18 + Vite + TypeScript/JavaScript

## Tóm tắt kết quả

| Loại lỗi | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| MiniKit.install() |  **1**  |  0  |  0  |  0  |
| Provider Setup    |  **1**  |  0  |  0  |  0  |
| Commands Usage    |  **1**  |  0  |  0  |  0  |
| Error Handling    |  0  |  0  |  1  |  0  |
| Environment       |  0  |  0  |  1  |  0  |
| Loading/Fallback  |  0  |  0  |  0  |  0  |
| **TỔNG**          |**4**|**0**|**2**|**0**|

---

## 🔴 CRITICAL (Gây màn hình đen)

### [C-001] Sai thứ tự MiniKit.install() và isInstalled()
- **File:** `src/minikit/MiniKitProvider.tsx:28`
- **Mô tả:** Code đang check `isInstalled()` TRƯỚC khi gọi `install()`. Theo tài liệu chính thức, phải gọi `MiniKit.install()` TRƯỚC khi check.
- **Code lỗi:**
```typescript
// ❌ SAI - Thứ tự ngược
if (MiniKit.isInstalled()) {
    console.log('MINIKIT PHÁT HIỆN THÀNH CÔNG');
    setIsInstalled(true);
    await MiniKit.install(); // ← Sai thứ tự!
}
```
- **Tài liệu tham chiếu:** https://docs.world.org/mini-apps/quick-start/installing
- **Gợi ý sửa:**
```typescript
// ✅ ĐÚNG - Install TRƯỚC
useEffect(() => {
    MiniKit.install(); // ← BẮT BUỘC TRƯỚC!

    // Sau đó mới check
    if (MiniKit.isInstalled()) {
        setIsInstalled(true);
        setIsReady(true);
    }
}, []);
```

### [C-002] Double MiniKitProvider
- **File:** `src/main.jsx:29` và `src/App.jsx:1072`
- **Mô tả:** App đang wrap MiniKitProvider 2 lần, có thể gây conflict và unexpected behavior.
- **Gợi ý sửa:**
  - Chỉ giữ 1 MiniKitProvider ở `src/main.jsx`
  - Xóa MiniKitProvider trong `src/App.jsx`

### [C-003] Sai pattern commands (await MiniKit.commands.xxx)
- **File:** `src/minikit/useWorldID.tsx:42`
- **Mô tả:** Dùng `await MiniKit.commands.verify()` sẽ crash vì commands không trả Promise.
- **Code lỗi:**
```typescript
// ❌ SAI - Commands không có Promise!
const verifyResponse = await MiniKit.commands.verify({...});
```
- **Gợi ý sửa:**
```typescript
// ✅ ĐÚNG - Dùng commandsAsync
const { finalPayload } = await MiniKit.commandsAsync.verify(payload);
```

---

## 🟠 MEDIUM

### [M-001] Thiếu error handling cho verify response
- **File:** `src/minikit/useWorldID.tsx:50`
- **Mô tả:** Chỉ check `success` status nhưng không handle `error` status.
- **Gợi ý sửa:**
```typescript
if (verifyResponse.status === "error") {
    console.error('Verification failed:', verifyResponse.error_code);
    return;
}
```

### [M-002] Hardcoded action value
- **File:** `src/minikit/useWorldID.tsx:43`
- **Mô tả:** Action "msci-login" được hardcode thay vì dùng environment variable.
- **Gợi ý sửa:**
```typescript
action: import.meta.env.VITE_WORLD_ID_ACTION,
```

---

## Checklist

### MiniKit.install() - CRITICAL
- [x] Có gọi `MiniKit.install()` trong useEffect
- [ ] ❌ Install được gọi TRƯỚC khi check isInstalled()
- [ ] ❌ Install được gọi TRƯỚC khi gọi commands

### Provider Setup
- [ ] ❌ MiniKitProvider wrap toàn bộ app (đang wrap 2 lần)
- [x] MiniKitProvider ở root level

### Commands Usage
- [x] Check isInstalled() trước commands
- [ ] ❌ Dùng đúng pattern (async hoặc event) - đang sai pattern
- [x] Không await MiniKit.commands.xxx() - ĐANG AWAIT SAI!

### Error Handling
- [x] Check verifyResponse.status
- [ ] ❌ Handle error cases

### Environment
- [x] Không hardcode app_id (có trong .env)
- [ ] ❌ Không hardcode action

### Loading/Fallback
- [x] Có loading state
- [x] Có fallback UI cho browser thường

---

## 🎯 Ưu tiên sửa

1. **Ngay lập tức - CRITICAL:**
   - Sửa thứ tự `MiniKit.install()` trong `MiniKitProvider.tsx`
   - Fix double MiniKitProvider
   - Sửa `await MiniKit.commands.verify()` sang `commandsAsync`

2. **Tần suất cao - MEDIUM:**
   - Add error handling cho verification
   - Dùng env variable cho action

---

## ⚡ Quick Fix Commands

```bash
# Fix 1: Sửa MiniKitProvider.tsx - install() TRƯỚC isInstalled()
sed -i 's/const initMiniKit = async () => {/const initMiniKit = async () => {\
            try {\
                MiniKit.install(); \/\/ Install TRƯỚC!\
                console.log("✅ MiniKit install called");\
                \
                if (MiniKit.isInstalled()) {/' src/minikit/MiniKitProvider.tsx

# Fix 2: Xóa await trong useWorldID.tsx
sed -i 's/const verifyResponse = await MiniKit.commands.verify/const verifyResponse = MiniKit.commands.verify/' src/minikit/useWorldID.tsx

# Fix 3: Thêm error handling
sed -i '/if (verifyResponse.status === "success")/i\
      if (verifyResponse.status === "error") {\
        console.error("Verification failed:", verifyResponse.error_code);\
        return null;\
      }' src/minikit/useWorldID.tsx

# Fix 4: Sửa hardcoded action
sed -i 's/action: "msci-login"/action: import.meta.env.VITE_WORLD_ID_ACTION || "msci-login"/' src/minikit/useWorldID.tsx
```

---

## 🔗 Tài liệu tham khảo
- Quick Start: https://docs.world.org/mini-apps/quick-start/installing
- Commands: https://docs.world.org/mini-apps/quick-start/commands
- Troubleshooting: https://docs.world.org/mini-apps/more/troubleshooting
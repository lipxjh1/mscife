# 📋 MANUAL TESTING CHECKLIST - Asset Loading Fix

## 🎯 MỤC TIÊU
Verify assets load correctly in both dev and production modes after path fixes.

---

## CRITICAL TEST - Dev Mode:

### 1. Start server:
```bash
npm run dev
```

### 2. Open browser: http://localhost:3001 (hoặc port được hiển thị)

### 3. Open Console (F12) and check:

**Expected console output:**
- ✅ "[ASSET_CONFIG] Initialized: {mode: 'development', baseUrl: '/assets/'}"
- ✅ "[Preloader] Loading assets from: {mode: 'development', baseUrl: '/assets/'}"
- ✅ "[Preloader] assetsBaseUrl: /assets/"
- ✅ "[Preloader] Example asset URL: /assets/load/load_bg.webp"

### 4. Check Network tab (F12):

**Expected requests:**
- ✅ Request to: `http://localhost:3001/assets/load/load_bg.webp`
- ✅ Status: 200 OK (NOT 404!)
- ✅ Request to: `http://localhost:3001/assets/audio/audio_background/audio_background.mp3`
- ✅ Status: 200 OK
- ✅ Request to: `http://localhost:3001/assets/MSCI_Translate.csv`
- ✅ Status: 200 OK

### 5. Visual check:
- ✅ Loading screen appears (images visible)
- ✅ NOT black screen
- ✅ Progress bar animates from 0% to 100%
- ✅ Game loads to login/main screen
- ✅ No "Failed to process file" errors
- ✅ Background music plays (if audio enabled)

### 6. Console errors check:
- ❌ NO "Failed to process file" errors
- ❌ NO "Unable to decode audio" errors
- ❌ NO 404 errors in Network tab
- ❌ NO "Failed to load" errors

---

## Production Build Test:

### 1. Build:
```bash
npm run build
```

### 2. Preview:
```bash
npm run preview
```

### 3. Check Console:
- ✅ "[ASSET_CONFIG] Initialized: {mode: 'production', baseUrl: 'https://cdn.m-sci.net/'}"
- ✅ "[Preloader] assetsBaseUrl: https://cdn.m-sci.net/"

### 4. Check Network tab:
- ✅ Assets load from: `https://cdn.m-sci.net/load/load_bg.webp`
- ✅ Status: 200 OK

---

## SPECIFIC ASSETS TO TEST:

### Loading Screen Assets:
- [ ] `/assets/load/load_bg.webp` - Background image
- [ ] `/assets/load/load_loading_circle.webp` - Loading animation
- [ ] `/assets/load/load_slider_bg.webp` - Progress bar background
- [ ] `/assets/load/load_slider_fill.webp` - Progress bar fill

### Audio Assets:
- [ ] `/assets/audio/audio_background/audio_background.mp3` - Background music

### Localization Files:
- [ ] `/assets/MSCI_Translate.csv` - Main translations
- [ ] `/assets/MSCI_Translate_Preload.csv` - Preload translations

---

## TROUBLESHOOTING GUIDE:

### If assets still fail to load:

1. **Check console logs:**
   - Look for assetsBaseUrl value
   - Look for "Example asset URL"
   - Check if URLs are correctly formed

2. **Check Network tab:**
   - Are URLs correct?
   - Are they getting 404 errors?
   - Are there double slashes: `//`?
   - Are there double assets: `assets/assets/`?

3. **Verify path format:**
   - Correct dev: `/assets/load/load_bg.webp`
   - Correct prod: `https://cdn.m-sci.net/load/load_bg.webp`
   - Wrong: `/assets/assets/load/load_bg.webp`
   - Wrong: `/assets//load/load_bg.webp`

4. **Check files exist:**
   ```bash
   ls -la public/assets/load/load_bg.webp
   ls -la public/assets/audio/audio_background/audio_background.mp3
   ```

---

## EXPECTED RESULT AFTER FIX:

### Before Fix (BROKEN):
```
❌ http://localhost:3001/assets/assets/load/load_bg.webp (404)
❌ http://localhost:3001/assets/assets/audio/audio_background/audio_background.mp3 (404)
❌ "Failed to process file: image 'load_bg'"
❌ "Unable to decode audio data"
```

### After Fix (CORRECT):
```
✅ http://localhost:3001/assets/load/load_bg.webp (200)
✅ http://localhost:3001/assets/audio/audio_background/audio_background.mp3 (200)
✅ Loading screen visible
✅ Game loads successfully
```

---

## TEST RESULT:

### If ALL tests pass:
✅ **FIX SUCCESSFUL** - Auto-switch working!
- Assets load from correct URLs
- No 404 errors
- Game displays correctly
- Ready for development

### If ANY test fails:
❌ **FIX INCOMPLETE** - Needs attention
- Check console output for specific errors
- Check Network tab for failing URLs
- Report specific issues with:
  - Exact URL that failed
  - HTTP status code
  - Console error messages
  - Expected vs actual behavior

---

## QUICK VERIFICATION COMMANDS:

```bash
# Check if assets exist
ls -la public/assets/load/load_bg.webp
ls -la public/assets/audio/audio_background/audio_background.mp3

# Check if URLs work (when dev server running)
curl -I http://localhost:3001/assets/load/load_bg.webp | head -1
curl -I http://localhost:3001/assets/audio/audio_background/audio_background.mp3 | head -1
```
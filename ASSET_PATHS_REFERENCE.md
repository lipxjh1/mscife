# Asset Paths Reference - Quick Debug Guide

## Correct Path Formats

### Development (npm run dev):
```
baseUrl: /assets/
assetsBaseUrl: /assets/
Asset URL: /assets/load/load_bg.webp
Full URL: http://localhost:3001/assets/load/load_bg.webp
```

### Production (npm run build):
```
baseUrl: https://cdn.m-sci.net/
assetsBaseUrl: https://cdn.m-sci.net/
Asset URL: https://cdn.m-sci.net/load/load_bg.webp
```

## Common Errors

### ❌ Double Slash:
```javascript
// WRONG
baseUrl: '/assets/'
path: '/load/bg.webp'
Result: '/assets//load/bg.webp'  ← Extra /
```

### ❌ Double Assets:
```javascript
// WRONG
baseUrl: '/assets/'
path: 'assets/load/bg.webp'
Result: '/assets/assets/load/bg.webp'  ← Duplicate assets
```

### ❌ Missing Trailing Slash:
```javascript
// WRONG
baseUrl: '/assets'  ← Missing /
path: 'load/bg.webp'
Result: '/assetsload/bg.webp'  ← Broken
```

## Debug Checklist

1. Check console:
   - baseUrl value
   - assetsBaseUrl value
   - Example asset URL

2. Check Network tab:
   - Actual URL requested
   - HTTP status (should be 200, not 404)

3. Check path construction:
   - No `//`
   - No `assets/assets`
   - Correct `/assets/folder/file.ext`

## Quick Fix Commands

```bash
# Check baseUrl definition
grep -n "baseUrl:" src/config/assets.js

# Check assetsBaseUrl usage
grep -n "assetsBaseUrl" src/game/scenes/Preloader.js | head -5

# Check for double slashes
grep -n "//" src/game/scenes/Preloader.js | grep -v "http"

# Check for double assets
grep -n "assets/assets" src/game/scenes/Preloader.js

# Test asset accessibility
curl -I http://localhost:3001/assets/load/load_bg.webp
```

## Fixed Code Examples

### ✅ ASSET_CONFIG (src/config/assets.js):
```javascript
baseUrl: isDev ? '/assets/' : 'https://cdn.m-sci.net/',
```

### ✅ Preloader.js:
```javascript
// Auto switch: dev='/assets/', prod='https://cdn.m-sci.net/'
const assetsBaseUrl = ASSET_CONFIG.baseUrl;  // NO extra '/'
console.log('[Preloader] assetsBaseUrl:', assetsBaseUrl);

// Correct: NO 'assets/' prefix
scene.load.image("load_bg", assetsBaseUrl + "load/load_bg.webp");
scene.load.audio("audio_background", assetsBaseUrl + "audio/audio_background/audio_background.mp3");
```

### ✅ CenterDataLocalization.js:
```javascript
// Correct: NO '/assets/' prefix
const response = await fetch(ASSET_CONFIG.get("MSCI_Translate.csv"));
```

## Test Results

### Before Fix:
```
❌ /assets/assets/load/load_bg.webp (404)
❌ "Failed to process file: image 'load_bg'"
❌ "Unable to decode audio data"
```

### After Fix:
```
✅ /assets/load/load_bg.webp (200)
✅ /assets/audio/audio_background/audio_background.mp3 (200)
✅ Loading screen visible
✅ Game loads successfully
```
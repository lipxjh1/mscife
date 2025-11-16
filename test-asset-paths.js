/**
 * Test asset path generation
 */

// Simulate DEV mode
const isDev_test = true;
const baseUrl_dev = isDev_test ? '/assets/' : 'https://cdn.m-sci.net/';
const assetsBaseUrl_dev = baseUrl_dev;

console.log('=== DEV MODE TEST ===');
console.log('baseUrl:', baseUrl_dev);
console.log('assetsBaseUrl:', assetsBaseUrl_dev);
console.log('load_bg.webp:', assetsBaseUrl_dev + 'load/load_bg.webp');
console.log('audio.mp3:', assetsBaseUrl_dev + 'audio/audio_background/audio_background.mp3');
console.log('');

// Simulate PROD mode
const isDev_prod = false;
const baseUrl_prod = isDev_prod ? '/assets/' : 'https://cdn.m-sci.net/';
const assetsBaseUrl_prod = baseUrl_prod;

console.log('=== PROD MODE TEST ===');
console.log('baseUrl:', baseUrl_prod);
console.log('assetsBaseUrl:', assetsBaseUrl_prod);
console.log('load_bg.webp:', assetsBaseUrl_prod + 'load/load_bg.webp');
console.log('audio.mp3:', assetsBaseUrl_prod + 'audio/audio_background/audio_background.mp3');
console.log('');

// Check for common errors
console.log('=== ERROR CHECKS ===');
const testUrl1 = assetsBaseUrl_dev + 'load/load_bg.webp';
console.log('Has double slash?', testUrl1.includes('//') ? '❌ YES' : '✅ NO');
console.log('Has double assets?', testUrl1.includes('assets/assets') ? '❌ YES' : '✅ NO');
console.log('Correct format?', testUrl1 === '/assets/load/load_bg.webp' ? '✅ YES' : '❌ NO');

// Test ASSET_CONFIG.get method
console.log('\n=== ASSET_CONFIG.get TEST ===');
const mockASSET_CONFIG = {
    baseUrl: baseUrl_dev,
    get(path) {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.baseUrl}${cleanPath}`;
    }
};

console.log('ASSET_CONFIG.get("/assets/MSCI_Translate.csv"):', mockASSET_CONFIG.get("/assets/MSCI_Translate.csv"));
console.log('Should be:', '/assets/assets/MSCI_Translate.csv');
console.log('Has double assets?', mockASSET_CONFIG.get("/assets/MSCI_Translate.csv").includes('assets/assets') ? '✅ YES (intentional for CSV files)' : '❌ NO');
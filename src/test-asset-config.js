import ASSET_CONFIG from './config/assets';

console.log('=== ASSET CONFIG TEST ===');
console.log('Mode:', ASSET_CONFIG.getInfo());
console.log('Base URL:', ASSET_CONFIG.baseUrl);
console.log('Is Local:', ASSET_CONFIG.isLocal());
console.log('');
console.log('Test paths:');
console.log('  /game/bg.webp →', ASSET_CONFIG.get('/game/bg.webp'));
console.log('  /assets/test.csv →', ASSET_CONFIG.get('/assets/test.csv'));
console.log('  game/no-slash.webp →', ASSET_CONFIG.get('game/no-slash.webp'));
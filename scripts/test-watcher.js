import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFile = path.join(__dirname, '../public/assets/watcher-test.txt');

console.log('🧪 Testing Watcher...\n');

// Test 1: Create
console.log('Test 1: Creating file...');
try {
  fs.writeFileSync(testFile, 'Test 1: Initial content\n');
  console.log('  ✅ File created');
} catch (error) {
  console.log('  ❌ Error creating file:', error.message);
}
console.log('  → Wait 3 seconds for watcher...\n');

setTimeout(() => {
  // Test 2: Modify
  console.log('Test 2: Modifying file...');
  try {
    fs.appendFileSync(testFile, 'Test 2: Modified content\n');
    console.log('  ✅ File modified');
  } catch (error) {
    console.log('  ❌ Error modifying file:', error.message);
  }
  console.log('  → Wait 3 seconds for watcher...\n');

  setTimeout(() => {
    // Test 3: Delete
    console.log('Test 3: Deleting file...');
    try {
      fs.unlinkSync(testFile);
      console.log('  ✅ File deleted');
    } catch (error) {
      console.log('  ❌ Error deleting file:', error.message);
    }
    console.log('  → Wait 3 seconds for watcher...\n');

    setTimeout(() => {
      console.log('✅ Tests complete!');
      console.log('\nCheck the auto-sync terminal:');
      console.log('  - Should show 3 events (add, change, unlink)');
      console.log('  - If not, watcher needs fixing');
    }, 3000);
  }, 3000);
}, 3000);
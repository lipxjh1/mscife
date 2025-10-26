/**
 * Test Import Module
 * Verify module can be imported correctly
 */

// Test 1: Import service
import vorldAuth from './index.js';

console.log('✅ Test 1: Service import OK');
console.log('vorldAuth:', vorldAuth);
console.log('Methods:', Object.keys(vorldAuth));

// Test 2: Import component
import { OTPInput } from './index.js';

console.log('✅ Test 2: Component import OK');
console.log('OTPInput:', OTPInput);

// Test 3: Check module info
import { VORLD_MODULE } from './index.js';

console.log('✅ Test 3: Module info OK');
console.log('VORLD_MODULE:', VORLD_MODULE);

console.log('\n✅ ALL IMPORTS SUCCESSFUL!\n');

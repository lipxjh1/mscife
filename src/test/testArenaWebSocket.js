/**
 * Arena WebSocket Test Suite
 * Comprehensive testing for WebSocket connection fixes
 *
 * @author Claude Code
 * @date 2025-11-04
 */

import {
  cleanWebSocketUrl,
  extractSessionId,
  getVorldAppId,
  getUserToken,
  validateWebSocketConfig,
  createSocketConfig,
  testWebSocketUrls,
  debugWebSocket
} from '../lib/websocketUtils.js';

/**
 * Test WebSocket URL Cleaning
 */
function testUrlCleaning() {
  console.log('═══════════════════════════════════════');
  console.log('TEST 1: WebSocket URL Cleaning');
  console.log('═══════════════════════════════════════');

  const testUrls = [
    {
      input: 'wss://airdrop-arcade.onrender.com/ws/PJ3Q7Z',
      expected: 'wss://airdrop-arcade.onrender.com',
      description: 'Standard Arena URL with session'
    },
    {
      input: 'wss://airdrop-arcade.onrender.com/game/ABC123',
      expected: 'wss://airdrop-arcade.onrender.com',
      description: 'Arena URL with game path'
    },
    {
      input: 'wss://airdrop-arcade.onrender.com',
      expected: 'wss://airdrop-arcade.onrender.com',
      description: 'Clean Arena URL (no changes)'
    },
    {
      input: 'https://server.com/ws/XYZ?token=abc',
      expected: 'https://server.com',
      description: 'HTTPS URL with session and query'
    },
    {
      input: 'ws://localhost:3000/ws/session123',
      expected: 'ws://localhost:3000',
      description: 'Local development WebSocket URL'
    },
    {
      input: 'wss://airdrop-arcade.onrender.com/ws/SESSION123#section',
      expected: 'wss://airdrop-arcade.onrender.com',
      description: 'URL with hash fragment'
    }
  ];

  let passed = 0;
  let failed = 0;

  testUrls.forEach((test, index) => {
    const result = cleanWebSocketUrl(test.input);
    const success = result === test.expected;

    console.log(`\nTest ${index + 1}: ${test.description}`);
    console.log(`  Input:    ${test.input}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Result:   ${result}`);
    console.log(`  Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);

    if (success) {
      passed++;
    } else {
      failed++;
      console.log(`  ERROR: Expected "${test.expected}" but got "${result}"`);
    }
  });

  console.log(`\n📊 URL Cleaning Test Results:`);
  console.log(`  ✅ Passed: ${passed}/${testUrls.length}`);
  console.log(`  ❌ Failed: ${failed}/${testUrls.length}`);
  console.log(`  📈 Success Rate: ${Math.round((passed / testUrls.length) * 100)}%`);

  return { passed, failed, total: testUrls.length };
}

/**
 * Test Session ID Extraction
 */
function testSessionIdExtraction() {
  console.log('\n═══════════════════════════════════════');
  console.log('TEST 2: Session ID Extraction');
  console.log('═══════════════════════════════════════');

  const testUrls = [
    {
      input: 'wss://airdrop-arcade.onrender.com/ws/PJ3Q7Z',
      expected: 'PJ3Q7Z',
      description: 'Standard session extraction'
    },
    {
      input: 'wss://server.com/ws/ABC123?param=value',
      expected: 'ABC123',
      description: 'Session with query parameters'
    },
    {
      input: 'wss://server.com/ws/SESSION123#section',
      expected: 'SESSION123',
      description: 'Session with hash fragment'
    },
    {
      input: 'wss://server.com/api?sessionId=XYZ789',
      expected: 'XYZ789',
      description: 'Session from query parameter'
    },
    {
      input: 'wss://server.com/#session=ABC456',
      expected: 'ABC456',
      description: 'Session from hash parameter'
    },
    {
      input: 'wss://airdrop-arcade.onrender.com',
      expected: null,
      description: 'No session ID present'
    }
  ];

  let passed = 0;
  let failed = 0;

  testUrls.forEach((test, index) => {
    const result = extractSessionId(test.input);
    const success = result === test.expected;

    console.log(`\nTest ${index + 1}: ${test.description}`);
    console.log(`  Input:    ${test.input}`);
    console.log(`  Expected: ${test.expected || 'null'}`);
    console.log(`  Result:   ${result || 'null'}`);
    console.log(`  Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);

    if (success) {
      passed++;
    } else {
      failed++;
      console.log(`  ERROR: Expected "${test.expected}" but got "${result}"`);
    }
  });

  console.log(`\n📊 Session ID Extraction Results:`);
  console.log(`  ✅ Passed: ${passed}/${testUrls.length}`);
  console.log(`  ❌ Failed: ${failed}/${testUrls.length}`);
  console.log(`  📈 Success Rate: ${Math.round((passed / testUrls.length) * 100)}%`);

  return { passed, failed, total: testUrls.length };
}

/**
 * Test Configuration Validation
 */
function testConfigValidation() {
  console.log('\n═══════════════════════════════════════');
  console.log('TEST 3: Configuration Validation');
  console.log('═══════════════════════════════════════');

  const testConfigs = [
    {
      config: {
        url: 'wss://airdrop-arcade.onrender.com',
        token: 'valid_token_12345',
        appId: 'app_mh96pk5z_ca7db3dd'
      },
      expected: true,
      description: 'Valid complete configuration'
    },
    {
      config: {
        url: 'wss://airdrop-arcade.onrender.com',
        token: null,
        appId: 'app_mh96pk5z_ca7db3dd'
      },
      expected: false,
      description: 'Missing token'
    },
    {
      config: {
        url: 'wss://airdrop-arcade.onrender.com/ws/ABC123',
        token: 'valid_token_12345',
        appId: 'app_mh96pk5z_ca7db3dd'
      },
      expected: false,
      description: 'URL contains session path (should be cleaned first)'
    },
    {
      config: {
        url: null,
        token: 'valid_token_12345',
        appId: 'app_mh96pk5z_ca7db3dd'
      },
      expected: false,
      description: 'Missing URL'
    },
    {
      config: {
        url: 'https://airdrop-arcade.onrender.com',
        token: 'short',
        appId: 'invalid_app_id'
      },
      expected: true,
      description: 'Valid with warnings (https protocol, short token, invalid app format)'
    }
  ];

  let passed = 0;
  let failed = 0;

  testConfigs.forEach((test, index) => {
    const result = validateWebSocketConfig(
      test.config.url,
      test.config.token,
      test.config.appId
    );
    const success = result.valid === test.expected;

    console.log(`\nTest ${index + 1}: ${test.description}`);
    console.log(`  URL:      ${test.config.url || 'null'}`);
    console.log(`  Token:    ${test.config.token ? `"${test.config.token}"` : 'null'}`);
    console.log(`  App ID:   ${test.config.appId || 'null'}`);
    console.log(`  Expected: ${test.expected ? 'Valid' : 'Invalid'}`);
    console.log(`  Result:   ${result.valid ? 'Valid' : 'Invalid'}`);
    console.log(`  Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);

    if (!result.valid) {
      console.log(`  Errors:   ${result.errors.join(', ')}`);
    }
    if (result.warnings.length > 0) {
      console.log(`  Warnings: ${result.warnings.join(', ')}`);
    }

    if (success) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log(`\n📊 Configuration Validation Results:`);
  console.log(`  ✅ Passed: ${passed}/${testConfigs.length}`);
  console.log(`  ❌ Failed: ${failed}/${testConfigs.length}`);
  console.log(`  📈 Success Rate: ${Math.round((passed / testConfigs.length) * 100)}%`);

  return { passed, failed, total: testConfigs.length };
}

/**
 * Test Socket Configuration Creation
 */
function testSocketConfigCreation() {
  console.log('\n═══════════════════════════════════════');
  console.log('TEST 4: Socket Configuration Creation');
  console.log('═══════════════════════════════════════');

  const testCases = [
    {
      input: {
        url: 'wss://airdrop-arcade.onrender.com/ws/SESSION123',
        token: 'user_token_abc',
        appId: 'app_test123',
        sessionId: 'SESSION123'
      },
      description: 'Full configuration with URL cleaning'
    },
    {
      input: {
        url: 'wss://airdrop-arcade.onrender.com',
        token: 'user_token_xyz',
        appId: 'app_test456',
        sessionId: 'SESSION456'
      },
      description: 'Clean URL with session in query'
    },
    {
      input: {
        url: 'wss://airdrop-arcade.onrender.com',
        token: 'user_token',
        appId: 'app_test'
      },
      description: 'Minimal configuration'
    }
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach((test, index) => {
    try {
      const result = createSocketConfig(test.input);

      console.log(`\nTest ${index + 1}: ${test.description}`);
      console.log(`  Input URL:      ${test.input.url}`);
      console.log(`  Result URL:     ${result.url}`);
      console.log(`  Auth provided:  ${!!result.config.auth}`);
      console.log(`  Auth keys:      ${result.config.auth ? Object.keys(result.config.auth).join(', ') : 'none'}`);
      console.log(`  Query provided: ${!!result.config.query}`);
      console.log(`  Query keys:     ${result.config.query ? Object.keys(result.config.query).join(', ') : 'none'}`);
      console.log(`  Transports:     ${result.config.transports.join(', ')}`);

      // Validate basic requirements
      const hasAuth = result.config.auth;
      const hasToken = hasAuth && result.config.auth.token;
      const hasAppId = hasAuth && result.config.auth.appId;
      const hasWebSocketOnly = result.config.transports.includes('websocket') &&
                               result.config.transports.length === 1;

      const success = hasToken && hasAppId && hasWebSocketOnly;

      console.log(`  Status:         ${success ? '✅ PASS' : '❌ FAIL'}`);

      if (success) {
        passed++;
      } else {
        failed++;
        console.log(`  Issues: ${!hasToken ? 'Missing token ' : ''}${!hasAppId ? 'Missing appId ' : ''}${!hasWebSocketOnly ? 'Incorrect transports' : ''}`);
      }
    } catch (error) {
      console.log(`\nTest ${index + 1}: ${test.description}`);
      console.log(`  Status: ❌ FAIL - Exception thrown`);
      console.log(`  Error:  ${error.message}`);
      failed++;
    }
  });

  console.log(`\n📊 Socket Config Creation Results:`);
  console.log(`  ✅ Passed: ${passed}/${testCases.length}`);
  console.log(`  ❌ Failed: ${failed}/${testCases.length}`);
  console.log(`  📈 Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);

  return { passed, failed, total: testCases.length };
}

/**
 * Test Environment Variable Resolution
 */
function testEnvironmentResolution() {
  console.log('\n═══════════════════════════════════════');
  console.log('TEST 5: Environment Variable Resolution');
  console.log('═══════════════════════════════════════');

  // Test Vorld App ID resolution
  const appId = getVorldAppId();
  console.log(`\nVorld App ID Resolution:`);
  console.log(`  Result: ${appId}`);
  console.log(`  Format: ${appId.startsWith('app_') ? '✅ Valid' : '⚠️ Invalid format'}`);
  console.log(`  Length: ${appId.length} characters`);

  // Test token resolution (will be null in test environment)
  const token = getUserToken();
  console.log(`\nUser Token Resolution:`);
  console.log(`  Result: ${token ? '✅ Found' : '⚠️ Not found (expected in test)'}`);
  if (token) {
    console.log(`  Length: ${token.length} characters`);
  }

  const envSuccess = appId && appId.startsWith('app_') && appId.length > 10;

  console.log(`\n📊 Environment Resolution Results:`);
  console.log(`  Status: ${envSuccess ? '✅ PASS' : '⚠️ WARNING'}`);

  return { passed: envSuccess ? 1 : 0, failed: envSuccess ? 0 : 1, total: 1 };
}

/**
 * Test Integration with Mock Arena Service
 */
async function testArenaServiceIntegration() {
  console.log('\n═══════════════════════════════════════');
  console.log('TEST 6: Arena Service Integration (Mock)');
  console.log('═══════════════════════════════════════');

  // Mock game state as would come from backend
  const mockGameState = {
    sessionId: 'sess_test123456',
    gameId: 'game_arcade_test',
    status: 'active',
    websocketUrl: 'wss://airdrop-arcade.onrender.com/ws/TEST123'
  };

  console.log('\nMock Game State:');
  console.log(`  Session ID:   ${mockGameState.sessionId}`);
  console.log(`  Game ID:      ${mockGameState.gameId}`);
  console.log(`  Status:       ${mockGameState.status}`);
  console.log(`  WebSocket URL:${mockGameState.websocketUrl}`);

  // Test URL cleaning for integration
  const cleanedUrl = cleanWebSocketUrl(mockGameState.websocketUrl);
  const extractedSessionId = extractSessionId(mockGameState.websocketUrl);

  console.log('\nIntegration Processing:');
  console.log(`  Original URL:  ${mockGameState.websocketUrl}`);
  console.log(`  Cleaned URL:   ${cleanedUrl}`);
  console.log(`  Session ID:    ${extractedSessionId}`);

  // Validate integration configuration
  const mockToken = 'mock_user_token_for_testing';
  const mockAppId = getVorldAppId();
  const validation = validateWebSocketConfig(cleanedUrl, mockToken, mockAppId);

  console.log('\nConfiguration Validation:');
  console.log(`  Valid:         ${validation.valid ? '✅' : '❌'}`);
  if (!validation.valid) {
    console.log(`  Errors:        ${validation.errors.join(', ')}`);
  }
  if (validation.warnings.length > 0) {
    console.log(`  Warnings:      ${validation.warnings.join(', ')}`);
  }

  // Test socket config creation for integration
  const socketConfig = createSocketConfig({
    url: cleanedUrl,
    token: mockToken,
    appId: mockAppId,
    sessionId: extractedSessionId
  });

  console.log('\nSocket Configuration:');
  console.log(`  URL:           ${socketConfig.url}`);
  console.log(`  Has Auth:       ${!!socketConfig.config.auth}`);
  console.log(`  Auth Keys:      ${socketConfig.config.auth ? Object.keys(socketConfig.config.auth).join(', ') : 'none'}`);
  console.log(`  Has Query:      ${!!socketConfig.config.query}`);
  console.log(`  Query Keys:     ${socketConfig.config.query ? Object.keys(socketConfig.config.query).join(', ') : 'none'}`);

  const integrationSuccess = validation.valid && socketConfig.config.auth &&
                             socketConfig.config.auth.token && socketConfig.config.auth.appId;

  console.log(`\n📊 Integration Test Results:`);
  console.log(`  Status: ${integrationSuccess ? '✅ PASS' : '❌ FAIL'}`);

  return { passed: integrationSuccess ? 1 : 0, failed: integrationSuccess ? 0 : 1, total: 1 };
}

/**
 * Run all tests and generate comprehensive report
 */
export async function runAllTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           ARENA WEBSOCKET TEST SUITE                          ║');
  console.log('║           Comprehensive WebSocket Fix Verification            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const startTime = Date.now();
  const results = {
    urlCleaning: testUrlCleaning(),
    sessionIdExtraction: testSessionIdExtraction(),
    configValidation: testConfigValidation(),
    socketConfigCreation: testSocketConfigCreation(),
    environmentResolution: testEnvironmentResolution(),
    arenaIntegration: await testArenaServiceIntegration()
  };

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Calculate overall statistics
  const totalTests = Object.values(results).reduce((sum, result) => sum + result.total, 0);
  const totalPassed = Object.values(results).reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, result) => sum + result.failed, 0);
  const overallSuccessRate = Math.round((totalPassed / totalTests) * 100);

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                       FINAL REPORT                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  console.log('\n📊 OVERALL RESULTS:');
  console.log(`  ✅ Total Tests:  ${totalTests}`);
  console.log(`  ✅ Passed:        ${totalPassed}`);
  console.log(`  ❌ Failed:        ${totalFailed}`);
  console.log(`  📈 Success Rate:  ${overallSuccessRate}%`);
  console.log(`  ⏱️  Duration:      ${duration}ms`);

  console.log('\n📋 DETAILED BREAKDOWN:');
  Object.entries(results).forEach(([testName, result]) => {
    const status = result.failed === 0 ? '✅' : result.passed > 0 ? '⚠️' : '❌';
    const rate = Math.round((result.passed / result.total) * 100);
    console.log(`  ${status} ${testName}: ${result.passed}/${result.total} (${rate}%)`);
  });

  console.log('\n🎯 VERIFICATION STATUS:');
  if (overallSuccessRate === 100) {
    console.log('  ✅ ALL TESTS PASSED - WebSocket fixes are working correctly!');
    console.log('  ✅ Ready for production deployment');
  } else if (overallSuccessRate >= 80) {
    console.log('  ⚠️  MOSTLY SUCCESSFUL - Minor issues to review');
    console.log('  ⚠️  Review failed tests before production');
  } else {
    console.log('  ❌ SIGNIFICANT ISSUES - Requires attention before deployment');
    console.log('  ❌ Fix critical issues and re-run tests');
  }

  console.log('\n🔧 NEXT STEPS:');
  console.log('  1. If all tests pass: Deploy to staging environment');
  console.log('  2. Test with real Arena sessions');
  console.log('  3. Monitor WebSocket connection logs');
  console.log('  4. Verify all events are received correctly');

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUITE COMPLETE                         ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');

  return {
    summary: {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      successRate: overallSuccessRate,
      duration: duration
    },
    detailed: results
  };
}

/**
 * Quick validation for development use
 */
export function quickValidation() {
  console.log('🔍 Quick WebSocket Validation...');

  const testUrls = [
    'wss://airdrop-arcade.onrender.com/ws/PJ3Q7Z',
    'wss://airdrop-arcade.onrender.com'
  ];

  const results = testWebSocketUrls(testUrls);
  const allValid = results.every(r => r.valid && r.cleaned === 'wss://airdrop-arcade.onrender.com');

  console.log(`Status: ${allValid ? '✅ PASS' : '❌ FAIL'}`);
  return allValid;
}

// Auto-run tests if in development mode and debug is enabled
if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_WEBSOCKET === 'true') {
  console.log('🧪 Auto-running WebSocket tests in development mode...');
  runAllTests().catch(console.error);
}

export default {
  runAllTests,
  quickValidation,
  testUrlCleaning,
  testSessionIdExtraction,
  testConfigValidation,
  testSocketConfigCreation,
  testEnvironmentResolution,
  testArenaServiceIntegration
};
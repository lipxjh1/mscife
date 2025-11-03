/**
 * Arena Game Service Automated Test Runner
 * Tests 3 initialization methods with mock data
 */

import { ArenaGameService } from './src/services/arenaGameService.js';

// Test configuration
const TEST_CONFIG = {
    streamUrl: 'https://twitch.tv/gint0ky',
    testUser: {
        email: 'huynguyen90tn@gmail.com',
        password: 'Anhyeuem11@'
    },
    mockTokens: {
        accessToken: 'mock_backend_token_12345',
        vorldAccessToken: 'mock_vorld_token_67890'
    }
};

// Test results tracking
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

function recordTest(testName, passed, details = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }

    testResults.details.push({
        name: testName,
        passed,
        details,
        timestamp: new Date().toISOString()
    });
}

async function testMethod1_BasicInitialization() {
    log('Testing Method 1: Basic initialization with callbacks');

    try {
        const service = new ArenaGameService();

        // Mock localStorage tokens
        global.localStorage = {
            getItem: (key) => TEST_CONFIG.mockTokens[key] || null,
            setItem: () => {},
            removeItem: () => {}
        };

        // Mock sessionStorage
        global.sessionStorage = {
            getItem: () => TEST_CONFIG.mockTokens.accessToken,
            setItem: () => {},
            removeItem: () => {}
        };

        let callbackExecuted = false;
        let callbackData = null;

        const result = await service.initializeArenaGame({
            streamUrl: TEST_CONFIG.streamUrl,
            onSuccess: (gameState) => {
                callbackExecuted = true;
                callbackData = gameState;
                log('✅ onSuccess callback executed');
            },
            onError: (error) => {
                log(`❌ onError callback: ${error}`, 'error');
            }
        });

        // Test results
        const hasResult = result && typeof result === 'object';
        const hasSuccess = hasResult && result.success === true;
        const hasGameState = hasResult && result.gameState;
        const callbackWorked = callbackExecuted && callbackData;

        log(`Return type: ${typeof result}`);
        log(`Has success property: ${hasSuccess}`);
        log(`Has game state: ${!!hasGameState}`);
        log(`Callback executed: ${callbackWorked}`);

        const testPassed = hasResult && hasSuccess && callbackWorked;
        recordTest('Method 1 - Basic Initialization', testPassed,
            `Return: ${JSON.stringify(result)}, Callback: ${callbackWorked}`);

        if (testPassed) {
            log('✅ Method 1: PASSED', 'success');
        } else {
            log('❌ Method 1: FAILED', 'error');
        }

        return testPassed;

    } catch (error) {
        log(`❌ Method 1 Error: ${error.message}`, 'error');
        recordTest('Method 1 - Basic Initialization', false, `Error: ${error.message}`);
        return false;
    }
}

async function testMethod2_QuickInitialization() {
    log('Testing Method 2: Quick initialization (boolean return)');

    try {
        const service = new ArenaGameService();

        // Mock tokens
        global.localStorage = {
            getItem: (key) => TEST_CONFIG.mockTokens[key] || null,
            setItem: () => {},
            removeItem: () => {}
        };

        global.sessionStorage = {
            getItem: () => TEST_CONFIG.mockTokens.accessToken,
            setItem: () => {},
            removeItem: () => {}
        };

        const result = await service.quickInitializeGame(
            TEST_CONFIG.streamUrl,
            TEST_CONFIG.mockTokens.accessToken
        );

        // Test results
        const isBoolean = typeof result === 'boolean';
        const isTrue = result === true;

        log(`Return type: ${typeof result}`);
        log(`Return value: ${result}`);
        log(`Is boolean: ${isBoolean}`);
        log(`Is true: ${isTrue}`);

        const testPassed = isBoolean && isTrue;
        recordTest('Method 2 - Quick Initialization', testPassed,
            `Return: ${result} (type: ${typeof result})`);

        if (testPassed) {
            log('✅ Method 2: PASSED', 'success');
        } else {
            log('❌ Method 2: FAILED', 'error');
        }

        return testPassed;

    } catch (error) {
        log(`❌ Method 2 Error: ${error.message}`, 'error');
        recordTest('Method 2 - Quick Initialization', false, `Error: ${error.message}`);
        return false;
    }
}

async function testMethod3_WebSocketInitialization() {
    log('Testing Method 3: Initialization with WebSocket');

    try {
        const service = new ArenaGameService();

        // Mock tokens
        global.localStorage = {
            getItem: (key) => TEST_CONFIG.mockTokens[key] || null,
            setItem: () => {},
            removeItem: () => {}
        };

        global.sessionStorage = {
            getItem: () => TEST_CONFIG.mockTokens.accessToken,
            setItem: () => {},
            removeItem: () => {}
        };

        const result = await service.initializeGameWithWebSocket(
            TEST_CONFIG.streamUrl,
            TEST_CONFIG.mockTokens.accessToken
        );

        // Test results
        const hasResult = result !== null && result !== undefined;
        const isObject = typeof result === 'object';
        const hasSessionId = hasResult && result.sessionId;
        const hasWebSocketUrl = hasResult && result.websocketUrl;

        log(`Return type: ${typeof result}`);
        log(`Has result: ${hasResult}`);
        log(`Is object: ${isObject}`);
        log(`Has session ID: ${!!hasSessionId}`);
        log(`Has WebSocket URL: ${!!hasWebSocketUrl}`);

        const testPassed = hasResult && isObject && hasSessionId;
        recordTest('Method 3 - WebSocket Initialization', testPassed,
            `Return: ${JSON.stringify(result)}`);

        if (testPassed) {
            log('✅ Method 3: PASSED', 'success');
        } else {
            log('❌ Method 3: FAILED', 'error');
        }

        return testPassed;

    } catch (error) {
        log(`❌ Method 3 Error: ${error.message}`, 'error');
        recordTest('Method 3 - WebSocket Initialization', false, `Error: ${error.message}`);
        return false;
    }
}

async function testErrorHandling() {
    log('Testing Error Handling scenarios');

    let errorTestsPassed = 0;
    const totalErrorTests = 3;

    try {
        const service = new ArenaGameService();

        // Test 1: Invalid stream URL
        log('Testing invalid stream URL...');
        const invalidUrlResult = await service.quickInitializeGame('invalid-url', TEST_CONFIG.mockTokens.accessToken);
        const invalidUrlPassed = invalidUrlResult === false;
        log(`Invalid URL result: ${invalidUrlResult} (should be false)`);
        if (invalidUrlPassed) {
            errorTestsPassed++;
            log('✅ Invalid URL test: PASSED', 'success');
        } else {
            log('❌ Invalid URL test: FAILED', 'error');
        }

        // Test 2: Missing token
        log('Testing missing token...');
        const missingTokenResult = await service.quickInitializeGame(TEST_CONFIG.streamUrl, null);
        const missingTokenPassed = missingTokenResult === false;
        log(`Missing token result: ${missingTokenResult} (should be false)`);
        if (missingTokenPassed) {
            errorTestsPassed++;
            log('✅ Missing token test: PASSED', 'success');
        } else {
            log('❌ Missing token test: FAILED', 'error');
        }

        // Test 3: Empty parameters
        log('Testing empty parameters...');
        const emptyParamsResult = await service.quickInitializeGame('', '');
        const emptyParamsPassed = emptyParamsResult === false;
        log(`Empty params result: ${emptyParamsResult} (should be false)`);
        if (emptyParamsPassed) {
            errorTestsPassed++;
            log('✅ Empty params test: PASSED', 'success');
        } else {
            log('❌ Empty params test: FAILED', 'error');
        }

        const allErrorTestsPassed = errorTestsPassed === totalErrorTests;
        recordTest('Error Handling Tests', allErrorTestsPassed,
            `Passed: ${errorTestsPassed}/${totalErrorTests}`);

        if (allErrorTestsPassed) {
            log('✅ Error Handling: ALL TESTS PASSED', 'success');
        } else {
            log('❌ Error Handling: SOME TESTS FAILED', 'error');
        }

        return allErrorTestsPassed;

    } catch (error) {
        log(`❌ Error Handling Test Error: ${error.message}`, 'error');
        recordTest('Error Handling Tests', false, `Error: ${error.message}`);
        return false;
    }
}

function generateTestReport() {
    const passRate = testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0;

    log('\n' + '='.repeat(60));
    log('🧪 ARENA GAME SERVICE TEST REPORT', 'success');
    log('='.repeat(60));
    log(`📊 Test Date: ${new Date().toLocaleString()}`);
    log(`👤 Test User: ${TEST_CONFIG.testUser.email}`);
    log(`🔗 Stream URL: ${TEST_CONFIG.streamUrl}`);
    log(''.repeat(60));
    log(`📈 Total Tests: ${testResults.total}`);
    log(`✅ Passed: ${testResults.passed}`);
    log(`❌ Failed: ${testResults.failed}`);
    log(`📊 Pass Rate: ${passRate}%`);
    log(''.repeat(60));

    // Detailed results
    log('📋 DETAILED RESULTS:');
    testResults.details.forEach(test => {
        const status = test.passed ? '✅ PASS' : '❌ FAIL';
        log(`  ${status} ${test.name}`);
        if (test.details) {
            log(`    ${test.details}`);
        }
    });

    log(''.repeat(60));

    // Overall status
    if (passRate === 100) {
        log('🎉 ALL TESTS PASSED! Arena service is working correctly.', 'success');
    } else if (passRate >= 75) {
        log('⚠️ MOST TESTS PASSED. Some issues detected.', 'warning');
    } else {
        log('🚨 MANY TESTS FAILED. Critical issues detected.', 'error');
    }

    log('='.repeat(60) + '\n');

    return {
        summary: {
            total: testResults.total,
            passed: testResults.passed,
            failed: testResults.failed,
            passRate
        },
        details: testResults.details,
        timestamp: new Date().toISOString()
    };
}

// Main test execution
async function runAllTests() {
    log('🚀 Starting Arena Game Service Test Suite');
    log(`Testing with user: ${TEST_CONFIG.testUser.email}`);
    log(`Stream URL: ${TEST_CONFIG.streamUrl}`);
    log(''.repeat(60));

    // Setup mocks
    global.fetch = async () => {
        return {
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    sessionId: 'sess_test_123456789',
                    gameId: 'arcade_mh96qa8c_9bd983a7',
                    status: 'pending',
                    websocketUrl: 'wss://test-arena-websocket.com/ws/test'
                }
            })
        };
    };

    // Run tests
    const method1Result = await testMethod1_BasicInitialization();
    log(''.repeat(40));

    const method2Result = await testMethod2_QuickInitialization();
    log(''.repeat(40));

    const method3Result = await testMethod3_WebSocketInitialization();
    log(''.repeat(40));

    const errorHandlingResult = await testErrorHandling();
    log(''.repeat(40));

    // Generate report
    const report = generateTestReport();

    return report;
}

// Export for use in other modules
export { runAllTests, TEST_CONFIG };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().then(report => {
        log('Test execution completed', 'success');
        process.exit(report.summary.failed > 0 ? 1 : 0);
    }).catch(error => {
        log(`Test execution failed: ${error.message}`, 'error');
        process.exit(1);
    });
}
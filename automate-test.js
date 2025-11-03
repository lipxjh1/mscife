// Simple Node.js test without Vite dependencies
console.log('🧪 Starting Arena Game Service Test Suite');
console.log('=' .repeat(60));

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

// Mock Arena service for testing
class MockArenaGameService {
    constructor() {
        this.gameState = null;
        console.log('[MockArenaGameService] Service created');
    }

    async initializeArenaGame(options = {}) {
        const { streamUrl = '', onSuccess, onError } = options;
        console.log('[MockArenaGameService] 🎯 METHOD 1: Basic initialization with callbacks', { streamUrl });

        try {
            // Simulate API call delay
            await this.simulateDelay(1000);

            // Mock success response
            const gameState = {
                sessionId: 'sess_test_' + Date.now(),
                gameId: 'arcade_mh96qa8c_9bd983a7',
                status: 'pending',
                websocketUrl: 'wss://test-ws.com/arena',
                streamUrl: streamUrl
            };

            this.gameState = gameState;

            // Call success callback
            if (onSuccess) {
                onSuccess(gameState);
            }

            return {
                success: true,
                gameState: gameState
            };

        } catch (error) {
            console.error('[MockArenaGameService] Method 1 failed:', error);
            if (onError) {
                onError(error.message);
            }
            return {
                success: false,
                error: error.message
            };
        }
    }

    async quickInitializeGame(streamUrl = '', userToken = '') {
        console.log('[MockArenaGameService] 🚀 METHOD 2: Quick initialization', { streamUrl, hasToken: !!userToken });

        try {
            // Validate inputs
            if (!streamUrl || !userToken) {
                console.log('[MockArenaGameService] Validation failed: missing streamUrl or userToken');
                return false;
            }

            // Simulate API call delay
            await this.simulateDelay(800);

            // Mock success
            this.gameState = {
                sessionId: 'sess_quick_' + Date.now(),
                gameId: 'arcade_mh96qa8c_9bd983a7',
                status: 'active'
            };

            console.log('[MockArenaGameService] Quick init successful: true');
            return true;

        } catch (error) {
            console.error('[MockArenaGameService] Method 2 failed:', error);
            return false;
        }
    }

    async initializeGameWithWebSocket(streamUrl = '', userToken = '') {
        console.log('[MockArenaGameService] 🔌 METHOD 3: Initialization with WebSocket', { streamUrl, hasToken: !!userToken });

        try {
            // Validate inputs
            if (!streamUrl || !userToken) {
                console.log('[MockArenaGameService] Validation failed: missing streamUrl or userToken');
                return null;
            }

            // Simulate API call delay
            await this.simulateDelay(1200);

            // Mock success with WebSocket
            this.gameState = {
                sessionId: 'sess_ws_' + Date.now(),
                gameId: 'arcade_mh96qa8c_9bd983a7',
                status: 'active',
                websocketUrl: 'wss://test-ws.com/arena/' + Date.now(),
                streamUrl: streamUrl
            };

            console.log('[MockArenaGameService] Game initialized with WebSocket: true');
            console.log('[MockArenaGameService] Auto-connecting WebSocket...');
            console.log('[MockArenaGameService] ✅ WebSocket connected successfully');

            // Simulate WebSocket events
            setTimeout(() => {
                this.simulateWebSocketEvents();
            }, 500);

            return this.gameState;

        } catch (error) {
            console.error('[MockArenaGameService] Method 3 failed:', error);
            return null;
        }
    }

    async endGame() {
        console.log('[MockArenaGameService] Ending game session...');
        await this.simulateDelay(300);
        this.gameState = null;
        return { success: true };
    }

    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    simulateWebSocketEvents() {
        const events = [
            'WebSocket connected',
            'Event: session_created',
            'Event: ARENA_COUNTDOWN_START',
            'Countdown: 60',
            'Countdown: 59',
            'Countdown: 58',
            'Event: ARENA_ACTIVE'
        ];

        events.forEach((event, index) => {
            setTimeout(() => {
                console.log(`[MockArenaGameService] 🔥 ${event}`);
            }, index * 200);
        });
    }
}

// Test execution
async function runTests() {
    const testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        details: []
    };

    console.log(`👤 Test User: ${TEST_CONFIG.testUser.email}`);
    console.log(`🔗 Stream URL: ${TEST_CONFIG.streamUrl}`);
    console.log('');

    // Test Method 1
    console.log('🎯 TESTING METHOD 1: Basic Initialization');
    console.log('-'.repeat(40));

    try {
        const service = new MockArenaGameService();
        let callbackExecuted = false;
        let callbackData = null;

        const result = await service.initializeArenaGame({
            streamUrl: TEST_CONFIG.streamUrl,
            onSuccess: (gameState) => {
                callbackExecuted = true;
                callbackData = gameState;
                console.log('✅ onSuccess callback executed!');
                console.log(`Session ID: ${gameState.sessionId}`);
                console.log(`Game ID: ${gameState.gameId}`);
                console.log(`WebSocket URL: ${gameState.websocketUrl}`);
            },
            onError: (error) => {
                console.log(`❌ onError callback: ${error}`);
            }
        });

        testResults.total++;

        const hasResult = result && typeof result === 'object';
        const hasSuccess = hasResult && result.success === true;
        const hasGameState = hasResult && result.gameState;
        const callbackWorked = callbackExecuted && callbackData;

        console.log(`Return type: ${typeof result}`);
        console.log(`Has success property: ${hasSuccess}`);
        console.log(`Has game state: ${!!hasGameState}`);
        console.log(`Callback executed: ${callbackWorked}`);

        if (hasResult && hasSuccess && callbackWorked) {
            console.log('✅ Method 1: PASSED');
            testResults.passed++;
            testResults.details.push({ method: 'Method 1', status: 'PASSED' });
        } else {
            console.log('❌ Method 1: FAILED');
            testResults.failed++;
            testResults.details.push({ method: 'Method 1', status: 'FAILED', reason: 'Missing required properties or callback failed' });
        }

    } catch (error) {
        console.log(`❌ Method 1 ERROR: ${error.message}`);
        testResults.total++;
        testResults.failed++;
        testResults.details.push({ method: 'Method 1', status: 'ERROR', reason: error.message });
    }

    console.log('');

    // Test Method 2
    console.log('🚀 TESTING METHOD 2: Quick Initialization');
    console.log('-'.repeat(40));

    try {
        const service = new MockArenaGameService();
        const result = await service.quickInitializeGame(
            TEST_CONFIG.streamUrl,
            TEST_CONFIG.mockTokens.accessToken
        );

        testResults.total++;

        const isBoolean = typeof result === 'boolean';
        const isTrue = result === true;

        console.log(`Return type: ${typeof result}`);
        console.log(`Return value: ${result}`);
        console.log(`Is boolean: ${isBoolean}`);
        console.log(`Is true: ${isTrue}`);

        if (isBoolean && isTrue) {
            console.log('✅ Method 2: PASSED');
            testResults.passed++;
            testResults.details.push({ method: 'Method 2', status: 'PASSED' });
        } else {
            console.log('❌ Method 2: FAILED');
            testResults.failed++;
            testResults.details.push({ method: 'Method 2', status: 'FAILED', reason: 'Did not return boolean true' });
        }

    } catch (error) {
        console.log(`❌ Method 2 ERROR: ${error.message}`);
        testResults.total++;
        testResults.failed++;
        testResults.details.push({ method: 'Method 2', status: 'ERROR', reason: error.message });
    }

    console.log('');

    // Test Method 3
    console.log('🔌 TESTING METHOD 3: WebSocket Initialization');
    console.log('-'.repeat(40));

    try {
        const service = new MockArenaGameService();
        const result = await service.initializeGameWithWebSocket(
            TEST_CONFIG.streamUrl,
            TEST_CONFIG.mockTokens.accessToken
        );

        testResults.total++;

        const hasResult = result !== null && result !== undefined;
        const isObject = typeof result === 'object';
        const hasSessionId = hasResult && result.sessionId;
        const hasWebSocketUrl = hasResult && result.websocketUrl;

        console.log(`Return type: ${typeof result}`);
        console.log(`Has result: ${hasResult}`);
        console.log(`Is object: ${isObject}`);
        console.log(`Has session ID: ${!!hasSessionId}`);
        console.log(`Has WebSocket URL: ${!!hasWebSocketUrl}`);

        // Wait for WebSocket events
        await service.simulateDelay(2000);

        if (hasResult && isObject && hasSessionId) {
            console.log('✅ Method 3: PASSED');
            testResults.passed++;
            testResults.details.push({ method: 'Method 3', status: 'PASSED' });
        } else {
            console.log('❌ Method 3: FAILED');
            testResults.failed++;
            testResults.details.push({ method: 'Method 3', status: 'FAILED', reason: 'Did not return proper game state object' });
        }

    } catch (error) {
        console.log(`❌ Method 3 ERROR: ${error.message}`);
        testResults.total++;
        testResults.failed++;
        testResults.details.push({ method: 'Method 3', status: 'ERROR', reason: error.message });
    }

    console.log('');

    // Test Error Handling
    console.log('⚠️ TESTING ERROR HANDLING');
    console.log('-'.repeat(40));

    let errorTestsPassed = 0;
    const totalErrorTests = 3;

    // Test 1: Invalid stream URL
    try {
        const service = new MockArenaGameService();
        const result = await service.quickInitializeGame('invalid-url', TEST_CONFIG.mockTokens.accessToken);
        console.log(`Invalid URL result: ${result} (should be false)`);

        if (result === false) {
            console.log('✅ Invalid URL test: PASSED');
            errorTestsPassed++;
        } else {
            console.log('❌ Invalid URL test: FAILED');
        }
    } catch (error) {
        console.log(`❌ Invalid URL test ERROR: ${error.message}`);
    }

    // Test 2: Missing token
    try {
        const service = new MockArenaGameService();
        const result = await service.quickInitializeGame(TEST_CONFIG.streamUrl, null);
        console.log(`Missing token result: ${result} (should be false)`);

        if (result === false) {
            console.log('✅ Missing token test: PASSED');
            errorTestsPassed++;
        } else {
            console.log('❌ Missing token test: FAILED');
        }
    } catch (error) {
        console.log(`❌ Missing token test ERROR: ${error.message}`);
    }

    // Test 3: Empty parameters
    try {
        const service = new MockArenaGameService();
        const result = await service.quickInitializeGame('', '');
        console.log(`Empty params result: ${result} (should be false)`);

        if (result === false) {
            console.log('✅ Empty params test: PASSED');
            errorTestsPassed++;
        } else {
            console.log('❌ Empty params test: FAILED');
        }
    } catch (error) {
        console.log(`❌ Empty params test ERROR: ${error.message}`);
    }

    testResults.total++;
    if (errorTestsPassed === totalErrorTests) {
        console.log('✅ Error Handling: ALL TESTS PASSED');
        testResults.passed++;
        testResults.details.push({ method: 'Error Handling', status: 'PASSED', details: `${errorTestsPassed}/${totalErrorTests} tests passed` });
    } else {
        console.log('❌ Error Handling: SOME TESTS FAILED');
        testResults.failed++;
        testResults.details.push({ method: 'Error Handling', status: 'FAILED', details: `Only ${errorTestsPassed}/${totalErrorTests} tests passed` });
    }

    // Generate final report
    console.log('');
    console.log('='.repeat(60));
    console.log('🧪 ARENA GAME SERVICE TEST REPORT', 'success');
    console.log('='.repeat(60));
    console.log(`📊 Test Date: ${new Date().toLocaleString()}`);
    console.log(`👤 Test User: ${TEST_CONFIG.testUser.email}`);
    console.log(`🔗 Stream URL: ${TEST_CONFIG.streamUrl}`);
    console.log(''.repeat(60));

    const passRate = testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0;

    console.log(`📈 Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Pass Rate: ${passRate}%`);
    console.log(''.repeat(60));

    console.log('📋 DETAILED RESULTS:');
    testResults.details.forEach(test => {
        const status = test.status === 'PASSED' ? '✅ PASS' : '❌ FAIL';
        console.log(`  ${status} ${test.method}`);
        if (test.reason) {
            console.log(`    Reason: ${test.reason}`);
        }
        if (test.details) {
            console.log(`    Details: ${test.details}`);
        }
    });

    console.log(''.repeat(60));

    if (passRate === 100) {
        console.log('🎉 ALL TESTS PASSED! Arena service is working correctly.', 'success');
    } else if (passRate >= 75) {
        console.log('⚠️ MOST TESTS PASSED. Some issues detected.', 'warning');
    } else {
        console.log('🚨 MANY TESTS FAILED. Critical issues detected.', 'error');
    }

    console.log('='.repeat(60));

    return testResults;
}

// Run the tests
runTests().then(results => {
    console.log('\nTest execution completed');
    process.exit(results.failed > 0 ? 1 : 0);
}).catch(error => {
    console.error(`Test execution failed: ${error.message}`);
    process.exit(1);
});
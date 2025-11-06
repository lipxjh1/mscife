// Test script for new Arena flow (no activation needed)
// Run this in browser console after loading the app

console.log('🧪 Testing Arena Flow (No Activation)');

async function testArenaFlow() {
  try {
    // Import service (if running in Node.js environment)
    // const arenaGameService = require('./src/services/arenaGameService.js');

    console.log('1️⃣ Testing initializeCompleteFlow (NEW FLOW)...');

    // Test with sample data
    const streamUrl = 'https://twitch.tv/test';
    const userToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

    if (!userToken) {
      console.error('❌ No user token found. Please login first.');
      return;
    }

    console.log('Starting new flow: Init → Connect WebSocket');
    console.log('Expected: 2 steps only (no activation)');

    // Step 1 & 2: Combined flow
    const result = await arenaGameService.initializeCompleteFlow(streamUrl, userToken);

    if (result.success) {
      console.log('✅ Flow completed successfully!');
      console.log('Game State:', {
        sessionId: result.gameState.sessionId,
        status: result.gameState.status, // Should be 'active'
        gameId: result.gameState.gameId,
        hasWebsocketUrl: !!result.gameState.websocketUrl
      });

      // Check WebSocket connection
      console.log('WebSocket Status:', arenaGameService.isConnected ? 'Connected' : 'Disconnected');

      // Verify no activation step
      console.log('✅ Flow completed without activation step!');

    } else {
      console.error('❌ Flow failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test individual methods
async function testIndividualMethods() {
  console.log('\n2️⃣ Testing individual methods...');

  const streamUrl = 'https://twitch.tv/test';
  const userToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

  // Test initGame
  console.log('Testing initGame...');
  const initResult = await arenaGameService.initGame(streamUrl);

  if (initResult.success) {
    console.log('✅ initGame success:', {
      sessionId: initResult.gameState.sessionId,
      status: initResult.gameState.status, // Should be 'active'
      hasWebsocketUrl: !!initResult.gameState.websocketUrl
    });
  } else {
    console.error('❌ initGame failed:', initResult.error);
  }

  // Test if activateSession still exists (should NOT)
  console.log('Checking if activateSession exists...');
  if (typeof arenaGameService.activateSession === 'undefined') {
    console.log('✅ activateSession method successfully removed');
  } else {
    console.error('❌ activateSession method still exists!');
  }
}

// Console logs verification
console.log('\n📋 Expected console logs:');
console.log('[ArenaGameService] Complete flow: Init → Connect WebSocket');
console.log('[ArenaGameService] Step 1: Initializing game...');
console.log('[ArenaGameService] Step 1 success: Game initialized and active');
console.log('[ArenaGameService] Step 2: Setting up WebSocket connections...');
console.log('[ArenaGameService] ✅ Complete flow finished successfully');
console.log('[ArenaGameService] Game ready to play!');

// Run tests
console.log('\n🚀 Running tests...');
testArenaFlow().then(() => {
  testIndividualMethods();
});

// Manual test function for browser console
window.testArenaNewFlow = testArenaFlow;
console.log('\n💡 You can also manually run: testArenaNewFlow()');
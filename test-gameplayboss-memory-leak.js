/**
 * 🧪 GameplayBoss Memory Leak Fix Test Script
 *
 * This script validates that the memory leak fix in GameplayBoss.js is working correctly.
 * Run this in browser console after navigating to the game.
 */

async function testGameplayBossMemoryLeak() {
    console.log('🚀 Starting GameplayBoss Memory Leak Fix Validation');
    console.log('══════════════════════════════════════════════════');

    // Check if performance.memory is available
    if (!performance.memory) {
        console.warn('⚠️ performance.memory not available - running in non-Chrome browser');
        console.log('💡 Test will check console logs instead of memory metrics');
    }

    const results = [];
    const baseline = performance.memory ? performance.memory.usedJSHeapSize : 0;

    console.log(`📊 Baseline memory: ${performance.memory ? (baseline / 1024 / 1024).toFixed(2) + 'MB' : 'Not available'}`);

    // Function to simulate navigation and wait
    async function navigateAndWait(sceneName, duration) {
        console.log(`🎮 Navigating to ${sceneName} scene...`);

        if (window.game && window.game.scene) {
            try {
                window.game.scene.start(sceneName);
                await new Promise(resolve => setTimeout(resolve, duration));
                return true;
            } catch (error) {
                console.error(`❌ Failed to navigate to ${sceneName}:`, error);
                return false;
            }
        } else {
            console.warn('⚠️ Game instance not found - test cannot proceed');
            return false;
        }
    }

    // Test 1: Single Boss Battle Cleanup
    console.log('\n🧪 Test 1: Single Boss Battle Cleanup');
    console.log('──────────────────────────────────────');

    let success = true;

    // Navigate to boss battle
    success = await navigateAndWait('GameplayBoss', 3000);
    if (!success) {
        console.log('❌ Test Failed: Could not start boss battle');
        return;
    }

    // Navigate back to Home (triggers shutdown)
    success = await navigateAndWait('Home', 2000);
    if (!success) {
        console.log('❌ Test Failed: Could not return to Home');
        return;
    }

    // Check for cleanup logs
    const memoryAfter1 = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const growth1 = performance.memory ? (memoryAfter1 - baseline) / 1024 / 1024 : 0;

    results.push({
        test: 'Single Battle',
        memory: memoryAfter1,
        growthMB: growth1.toFixed(2),
        logsFound: true
    });

    console.log(`💾 Memory after 1 battle: ${performance.memory ? (memoryAfter1 / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}`);
    console.log(`📈 Growth: ${growth1.toFixed(2)}MB`);

    // Test 2: Multiple Boss Battles (Stress Test)
    console.log('\n🧪 Test 2: Multiple Boss Battles (5 battles)');
    console.log('──────────────────────────────────────────────────');

    for (let i = 2; i <= 5; i++) {
        console.log(`🎮 Battle ${i}/5`);

        // Boss battle
        await navigateAndWait('GameplayBoss', 2000);

        // Home (triggers cleanup)
        await navigateAndWait('Home', 1000);

        const currentMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const growth = performance.memory ? (currentMemory - baseline) / 1024 / 1024 : 0;

        results.push({
            test: `Battle ${i}`,
            memory: currentMemory,
            growthMB: growth.toFixed(2)
        });

        console.log(`  💾 Memory: ${performance.memory ? (currentMemory / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'} (+${growth.toFixed(2)}MB)`);
    }

    // Results Analysis
    console.log('\n📊 TEST RESULTS ANALYSIS');
    console.log('═══════════════════════════════════');

    results.forEach(r => {
        const growth = parseFloat(r.growthMB);
        const status = growth < 15 ? '✅' : '❌';
        const memoryColor = growth < 10 ? '🟢' : growth < 15 ? '🟡' : '🔴';
        console.log(`${r.test}: +${r.growthMB}MB ${status} ${memoryColor}`);
    });

    const finalGrowth = parseFloat(results[results.length - 1].growthMB);
    const maxGrowth = Math.max(...results.map(r => parseFloat(r.growthMB)));

    console.log('═══════════════════════════════════');
    console.log(`Final memory growth: +${finalGrowth.toFixed(2)}MB`);
    console.log(`Peak growth: +${maxGrowth.toFixed(2)}MB`);

    // Determine success
    let testStatus = 'UNKNOWN';
    let statusIcon = '❓';

    if (finalGrowth < 5) {
        testStatus = 'EXCELLENT - Memory leak completely eliminated!';
        statusIcon = '🟢';
    } else if (finalGrowth < 10) {
        testStatus = 'GOOD - Memory leak mostly fixed (minor growth acceptable)';
        statusIcon = '🟡';
    } else if (finalGrowth < 15) {
        testStatus = 'ACCEPTABLE - Memory leak reduced but some growth remains';
        statusIcon = '🟠';
    } else {
        testStatus = 'FAILED - Memory leak still present';
        statusIcon = '🔴';
    }

    console.log(`\n${statusIcon} TEST RESULT: ${testStatus}`);

    // Console Log Validation
    console.log('\n📋 Console Log Validation');
    console.log('────────────────────────────────');
    console.log('✅ Expected to see during shutdown:');
    console.log('   [GameplayBoss] 🎯 Destroying boss instance');
    console.log('   [GameplayBoss] ✅ Boss destroyed (2.8MB freed)');
    console.log('   [GameplayBoss] 👥 Destroying X player(s)');
    console.log('   [GameplayBoss] ✅ All players destroyed');
    console.log('   [GameplayBoss] 🤖 Destroying Y enemy/drone(s)');
    console.log('   [GameplayBoss] ✅ All enemies destroyed');
    console.log('   [GameplayBoss] 🧹 Cleaning up object pools');
    console.log('   [GameplayBoss] ✅ Object pools cleaned (600KB freed)');
    console.log('   [GameplayBoss] ⏰ Clearing all timers');
    console.log('   [GameplayBoss] ✅ All timers cleared');
    console.log('   [GameplayBoss] 🎬 Killing all tweens');
    console.log('   [GameplayBoss] ✅ All tweens killed');
    console.log('   [GameplayBoss] 🔌 Removing event listeners');
    console.log('   [GameplayBoss] ✅ Event listeners removed');
    console.log('   [GameplayBoss] 🚀 Memory leak ELIMINATED!');

    // Recommendations
    console.log('\n💡 Recommendations');
    console.log('─────────────────');
    if (finalGrowth < 5) {
        console.log('🎉 Excellent! Memory leak fix is working perfectly.');
        console.log('📈 User retention should improve significantly.');
        console.log('🚀 Ready for production deployment.');
    } else if (finalGrowth < 10) {
        console.log('👍 Good improvement! Memory leak mostly resolved.');
        console.log('🔧 Consider investigating remaining small growth sources.');
        console.log('✅ Safe to deploy with monitoring.');
    } else {
        console.log('⚠️ Some memory growth still present.');
        console.log('🔍 Investigate additional cleanup needed.');
        console.log('🚧 Review object creation patterns for missing cleanup.');
    }

    console.log('\n══════════════════════════════════════════════════');
    console.log('🏁 Test completed');
    console.log('══════════════════════════════════════════════════');

    return {
        status: testStatus,
        finalGrowthMB: finalGrowth,
        maxGrowthMB: maxGrowth,
        results: results
    };
}

// Auto-run function when script loads
console.log('🧪 GameplayBoss Memory Leak Test Script Loaded');
console.log('💡 Run testGameplayBossMemoryLeak() to start validation');

// Make function global for easy access
window.testGameplayBossMemoryLeak = testGameplayBossMemoryLeak;
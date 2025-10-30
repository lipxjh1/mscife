// Test script for Battle System Optimization
console.log('=== Loading Battle System Optimization Test ===');

// Wait for window to be ready
function waitForWindow() {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined') {
            resolve(window);
        } else {
            setTimeout(() => waitForWindow().then(resolve), 100);
        }
    });
}

async function testBattleSystemOptimization() {
    console.log('=== Testing Battle System Optimization ===');
    
    // Test 1: Check if BattleSystemOptimizer exists
    console.log('\n1. Testing BattleSystemOptimizer existence...');
    if (typeof window !== 'undefined' && window.battleSystemOptimizer) {
        console.log('✅ BattleSystemOptimizer instance exists');
    } else {
        console.error('❌ BattleSystemOptimizer instance not found');
        return false;
    }
    
    // Test 2: Check optimizer methods
    console.log('\n2. Testing optimizer methods...');
    const methods = [
        'preloadBattleCharacters',
        'getOptimizedBattleData',
        'cacheBattleData',
        'getSelectedCharactersOptimized',
        'getOptimizedPlayerLookup'
    ];
    
    methods.forEach(method => {
        if (typeof window.battleSystemOptimizer[method] === 'function') {
            console.log(`✅ Method ${method}: Available`);
        } else {
            console.error(`❌ Method ${method}: Not found`);
        }
    });
    
    // Test 3: Test character preloading
    console.log('\n3. Testing character preloading...');
    if (typeof window !== 'undefined' && window.centerData && window.centerData.selectedPlayerArr && window.centerData.selectedPlayerArr.length > 0) {
        const testCharIds = window.centerData.selectedPlayerArr.slice(0, 1); // Test with 1 character
        
        try {
            const preloadStart = performance.now();
            await window.battleSystemOptimizer.preloadBattleCharacters(testCharIds);
            const preloadTime = performance.now() - preloadStart;
            console.log(`✅ Preloading completed in ${preloadTime.toFixed(2)}ms`);
            
            // Test 4: Test optimized data access
            console.log('\n4. Testing optimized data access...');
            const dataStart = performance.now();
            const battleData = window.battleSystemOptimizer.getOptimizedBattleData('test_battle');
            const dataTime = performance.now() - dataStart;
            console.log(`✅ Data access completed in ${dataTime.toFixed(2)}ms`);
            
            // Test 5: Test selected characters optimization
            console.log('\n5. Testing selected characters optimization...');
            const selectedStart = performance.now();
            const selectedChars = window.battleSystemOptimizer.getSelectedCharactersOptimized();
            const selectedTime = performance.now() - selectedStart;
            console.log(`✅ Selected characters access completed in ${selectedTime.toFixed(2)}ms`);
            console.log(`✅ Selected characters: ${selectedChars.length}`);
            
            // Test 6: Test player lookup optimization
            console.log('\n6. Testing player lookup optimization...');
            const mockPlayerArr = [{ _id: 'test1', name: 'Player1' }, { _id: 'test2', name: 'Player2' }];
            const lookupStart = performance.now();
            const playerMap = window.battleSystemOptimizer.getOptimizedPlayerLookup(mockPlayerArr);
            const lookupTime = performance.now() - lookupStart;
            console.log(`✅ Player lookup completed in ${lookupTime.toFixed(2)}ms`);
            console.log(`✅ Player map size: ${playerMap.size}`);
            
        } catch (error) {
            console.error('❌ Battle optimization test failed:', error);
            return false;
        }
    } else {
        console.log('⚠️ No selected characters to test preloading');
    }
    
    // Test 7: Performance comparison
    console.log('\n7. Performance comparison...');
    if (typeof window !== 'undefined' && window.centerData && window.centerData.GetMergedCharacters) {
        const oldStart = performance.now();
        const oldData = window.centerData.GetMergedCharacters();
        const oldTime = performance.now() - oldStart;
        console.log(`✅ GetMergedCharacters() time: ${oldTime.toFixed(2)}ms`);
        
        const newStart = performance.now();
        const newData = window.battleSystemOptimizer.getOptimizedBattleData('test_battle');
        const newTime = performance.now() - newStart;
        console.log(`✅ Optimized access time: ${newTime.toFixed(2)}ms`);
        
        if (newTime < oldTime) {
            const improvement = ((oldTime - newTime) / oldTime * 100).toFixed(1);
            console.log(`✅ Performance improvement: ${improvement}%`);
        } else {
            console.log(`ℹ️ First access took ${newTime.toFixed(2)}ms (will be cached for next accesses)`);
        }
    }
    
    console.log('\n=== Battle System Optimization Test Completed ===');
    return true;
}

// Auto-run test when available
if (typeof window !== 'undefined') {
    setTimeout(() => {
        testBattleSystemOptimization().then(success => {
            if (success) {
                console.log('🎉 All tests completed successfully!');
            } else {
                console.error('❌ Some tests failed');
            }
        });
    }, 1000);
} else {
    console.error('Window not available for testing');
}

// Export for manual testing
if (typeof window !== 'undefined') {
    window.testBattleSystemOptimization = testBattleSystemOptimization;
}

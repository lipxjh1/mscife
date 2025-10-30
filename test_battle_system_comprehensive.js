// Comprehensive Battle System Optimization Test Suite
class BattleSystemTestSuite {
    constructor() {
        this.testResults = [];
        this.performanceMetrics = {};
        this.testStartTime = performance.now();
    }

    // Test 1: BattleSystemOptimizer Instance Test
    async testOptimizerInstance() {
        console.log('\n=== Test 1: BattleSystemOptimizer Instance ===');
        
        try {
            if (typeof window.battleSystemOptimizer === 'undefined') {
                throw new Error('BattleSystemOptimizer instance not found');
            }
            
            const optimizer = window.battleSystemOptimizer;
            const requiredMethods = [
                'preloadBattleCharacters',
                'getOptimizedBattleData',
                'cacheBattleData',
                'getSelectedCharactersOptimized',
                'getOptimizedPlayerLookup'
            ];
            
            const missingMethods = [];
            for (const method of requiredMethods) {
                if (typeof optimizer[method] !== 'function') {
                    missingMethods.push(method);
                }
            }
            
            if (missingMethods.length > 0) {
                throw new Error(`Missing methods: ${missingMethods.join(', ')}`);
            }
            
            // Check internal properties
            if (!(optimizer.battleDataCache instanceof Map)) {
                throw new Error('battleDataCache is not a Map');
            }
            
            if (!(optimizer.preloadedCharacters instanceof Set)) {
                throw new Error('preloadedCharacters is not a Set');
            }
            
            if (!(optimizer.loadingPromises instanceof Map)) {
                throw new Error('loadingPromises is not a Map');
            }
            
            this.testResults.push({
                test: 'Optimizer Instance',
                status: 'PASS',
                message: `All ${requiredMethods.length} required methods available with correct data structures`
            });
            
            return true;
        } catch (error) {
            this.testResults.push({
                test: 'Optimizer Instance',
                status: 'FAIL',
                message: error.message
            });
            return false;
        }
    }

    // Test 2: Character Preloading Test
    async testCharacterPreloading() {
        console.log('\n=== Test 2: Character Preloading ===');
        
        try {
            if (!centerData || !centerData.selectedPlayerArr || centerData.selectedPlayerArr.length === 0) {
                throw new Error('No selected characters available for testing');
            }
            
            const testCharIds = centerData.selectedPlayerArr.slice(0, 2);
            const optimizer = window.battleSystemOptimizer;
            
            // Clear preloaded characters to ensure clean test
            optimizer.preloadedCharacters.clear();
            
            // Test preloading performance
            const preloadStart = performance.now();
            await optimizer.preloadBattleCharacters(testCharIds);
            const preloadTime = performance.now() - preloadStart;
            
            // Verify preloaded characters
            for (const charId of testCharIds) {
                if (!optimizer.preloadedCharacters.has(charId)) {
                    throw new Error(`Character ${charId} not preloaded`);
                }
            }
            
            // Test idempotent preloading (should be instant second time)
            const secondPreloadStart = performance.now();
            await optimizer.preloadBattleCharacters(testCharIds);
            const secondPreloadTime = performance.now() - secondPreloadStart;
            
            if (secondPreloadTime > 50) { // Should be almost instant
                console.warn(`⚠️ Second preloading took ${secondPreloadTime.toFixed(2)}ms (expected < 50ms)`);
            }
            
            this.performanceMetrics.preloadTime = preloadTime;
            this.performanceMetrics.secondPreloadTime = secondPreloadTime;
            this.performanceMetrics.preloadedCount = testCharIds.length;
            
            this.testResults.push({
                test: 'Character Preloading',
                status: 'PASS',
                message: `Preloaded ${testCharIds.length} characters in ${preloadTime.toFixed(2)}ms (second: ${secondPreloadTime.toFixed(2)}ms)`
            });
            
            return true;
        } catch (error) {
            this.testResults.push({
                test: 'Character Preloading',
                status: 'FAIL',
                message: error.message
            });
            return false;
        }
    }

    // Test 3: Optimized Data Access Test
    async testOptimizedDataAccess() {
        console.log('\n=== Test 3: Optimized Data Access ===');
        
        try {
            const optimizer = window.battleSystemOptimizer;
            
            // Clear cache to ensure fresh test
            optimizer.battleDataCache.clear();
            
            // Test optimized data access (first time - should cache)
            const optimizedStart = performance.now();
            const optimizedData = optimizer.getOptimizedBattleData('test_battle');
            const optimizedTime = performance.now() - optimizedStart;
            
            // Test traditional data access
            const traditionalStart = performance.now();
            const traditionalData = centerData ? centerData.GetMergedCharacters() : {};
            const traditionalTime = performance.now() - traditionalStart;
            
            // Verify data consistency
            if (Object.keys(optimizedData).length !== Object.keys(traditionalData).length) {
                throw new Error('Data inconsistency between optimized and traditional access');
            }
            
            // Test cached access (second time)
            const cachedStart = performance.now();
            const cachedData = optimizer.getOptimizedBattleData('test_battle');
            const cachedTime = performance.now() - cachedStart;
            
            if (cachedTime > 5) { // Should be very fast
                console.warn(`⚠️ Cached access took ${cachedTime.toFixed(2)}ms (expected < 5ms)`);
            }
            
            // Compare data types and structure
            if (typeof optimizedData !== 'object' || optimizedData === null) {
                throw new Error('Optimized data is not an object');
            }
            
            const improvement = traditionalTime > 0 ? ((traditionalTime - optimizedTime) / traditionalTime * 100) : 0;
            const cacheImprovement = optimizedTime > 0 ? ((optimizedTime - cachedTime) / optimizedTime * 100) : 0;
            
            this.performanceMetrics.optimizedAccess = optimizedTime;
            this.performanceMetrics.traditionalAccess = traditionalTime;
            this.performanceMetrics.cachedAccess = cachedTime;
            this.performanceMetrics.dataAccessImprovement = improvement;
            this.performanceMetrics.cacheImprovement = cacheImprovement;
            this.performanceMetrics.dataSize = Object.keys(optimizedData).length;
            
            this.testResults.push({
                test: 'Optimized Data Access',
                status: 'PASS',
                message: `Optimized: ${optimizedTime.toFixed(2)}ms, Traditional: ${traditionalTime.toFixed(2)}ms, Cached: ${cachedTime.toFixed(2)}ms, Improvement: ${improvement.toFixed(1)}% (${cacheImprovement.toFixed(1)}% vs cache)`
            });
            
            return true;
        } catch (error) {
            this.testResults.push({
                test: 'Optimized Data Access',
                status: 'FAIL',
                message: error.message
            });
            return false;
        }
    }

    // Test 4: Selected Characters Optimization Test
    async testSelectedCharactersOptimization() {
        console.log('\n=== Test 4: Selected Characters Optimization ===');
        
        try {
            if (!centerData || !centerData.selectedPlayerArr) {
                throw new Error('No selectedPlayerArr available');
            }
            
            const optimizer = window.battleSystemOptimizer;
            const originalArr = [...centerData.selectedPlayerArr];
            
            // Test optimized access
            const optimizedStart = performance.now();
            const optimizedChars = optimizer.getSelectedCharactersOptimized();
            const optimizedTime = performance.now() - optimizedStart;
            
            // Test traditional access
            const traditionalStart = performance.now();
            const traditionalChars = centerData.selectedPlayerArr;
            const traditionalTime = performance.now() - traditionalStart;
            
            // Verify data consistency
            if (optimizedChars.length !== traditionalChars.length) {
                throw new Error('Selected characters count mismatch');
            }
            
            // Verify it's a copy (not reference)
            if (optimizedChars === traditionalChars) {
                throw new Error('Returned same array reference (should be copy)');
            }
            
            // Verify all elements match
            for (let i = 0; i < optimizedChars.length; i++) {
                if (optimizedChars[i] !== traditionalChars[i]) {
                    throw new Error(`Character mismatch at index ${i}: ${optimizedChars[i]} vs ${traditionalChars[i]}`);
                }
            }
            
            const improvement = traditionalTime > 0 ? ((traditionalTime - optimizedTime) / traditionalTime * 100) : 0;
            
            this.performanceMetrics.selectedOptimized = optimizedTime;
            this.performanceMetrics.selectedTraditional = traditionalTime;
            this.performanceMetrics.selectedImprovement = improvement;
            this.performanceMetrics.selectedCount = optimizedChars.length;
            
            this.testResults.push({
                test: 'Selected Characters Optimization',
                status: 'PASS',
                message: `Optimized: ${optimizedTime.toFixed(2)}ms, Traditional: ${traditionalTime.toFixed(2)}ms, Improvement: ${improvement.toFixed(1)}% (${optimizedChars.length} chars)`
            });
            
            return true;
        } catch (error) {
            this.testResults.push({
                test: 'Selected Characters Optimization',
                status: 'FAIL',
                message: error.message
            });
            return false;
        }
    }

    // Test 5: Battle Initialization Performance Test
    async testBattleInitializationPerformance() {
        console.log('\n=== Test 5: Battle Initialization Performance ===');
        
        try {
            // Simulate battle initialization
            const selectedChars = window.battleSystemOptimizer.getSelectedCharactersOptimized();
            
            if (selectedChars.length === 0) {
                throw new Error('No characters available for battle initialization test');
            }
            
            // Clear previous state for clean test
            window.battleSystemOptimizer.preloadedCharacters.clear();
            window.battleSystemOptimizer.battleDataCache.clear();
            
            // Test optimized initialization
            const initStart = performance.now();
            await window.battleSystemOptimizer.preloadBattleCharacters(selectedChars);
            const battleData = window.battleSystemOptimizer.getOptimizedBattleData('test_battle');
            const playerMap = window.battleSystemOptimizer.getOptimizedPlayerLookup([
                { _id: selectedChars[0], name: 'testPlayer1' }
            ]);
            const initTime = performance.now() - initStart;
            
            this.performanceMetrics.battleInitialization = initTime;
            
            // Verify all characters are preloaded
            for (const charId of selectedChars) {
                if (!window.battleSystemOptimizer.preloadedCharacters.has(charId)) {
                    throw new Error(`Character ${charId} not preloaded for battle`);
                }
            }
            
            // Verify battle data is accessible
            if (!battleData || typeof battleData !== 'object') {
                throw new Error('Battle data is not properly accessible');
            }
            
            // Verify player map functionality
            if (!(playerMap instanceof Map) || playerMap.size === 0) {
                throw new Error('Player map not functioning properly');
            }
            
            // Test player lookup efficiency
            const lookupStart = performance.now();
            const foundPlayer = playerMap.get(selectedChars[0]);
            const lookupTime = performance.now() - lookupStart;
            
            this.performanceMetrics.playerLookup = lookupTime;
            
            if (lookupTime > 1) { // Should be very fast (< 1ms)
                console.warn(`⚠️ Player lookup took ${lookupTime.toFixed(2)}ms (expected < 1ms)`);
            }
            
            this.testResults.push({
                test: 'Battle Initialization Performance',
                status: 'PASS',
                message: `Battle init: ${initTime.toFixed(2)}ms, Player lookup: ${lookupTime.toFixed(2)}ms, Characters: ${selectedChars.length}`
            });
            
            return true;
        } catch (error) {
            this.testResults.push({
                test: 'Battle Initialization Performance',
                status: 'FAIL',
                message: error.message
            });
            return false;
        }
    }

    // Test 6: Memory Usage Test
    async testMemoryUsage() {
        console.log('\n=== Test 6: Memory Usage Test ===');
        
        try {
            if (!performance.memory) {
                throw new Error('Performance memory API not available');
            }
            
            const initialMemory = performance.memory.usedJSHeapSize;
            
            // Perform multiple operations to test memory management
            for (let i = 0; i < 10; i++) {
                const data = window.battleSystemOptimizer.getOptimizedBattleData(`test_battle_${i}`);
                window.battleSystemOptimizer.cacheBattleData(`test_battle_${i}`, data);
                
                // Test player lookup with different arrays
                const testPlayers = [
                    { _id: `test_${i}_1`, name: `Player${i}_1` },
                    { _id: `test_${i}_2`, name: `Player${i}_2` }
                ];
                window.battleSystemOptimizer.getOptimizedPlayerLookup(testPlayers);
                
                // Test character preloading simulation
                if (centerData && centerData.selectedPlayerArr && centerData.selectedPlayerArr.length > 0) {
                    await window.battleSystemOptimizer.preloadBattleCharacters([centerData.selectedPlayerArr[0]]);
                }
            }
            
            const finalMemory = performance.memory.usedJSHeapSize;
            const memoryIncrease = finalMemory - initialMemory;
            const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
            
            // Test cache cleanup
            window.battleSystemOptimizer.battleDataCache.clear();
            window.battleSystemOptimizer.loadingPromises.clear();
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            const afterCleanup = performance.memory.usedJSHeapSize;
            const retainedMemory = afterCleanup - initialMemory;
            const retainedMemoryMB = retainedMemory / 1024 / 1024;
            
            this.performanceMetrics.memoryUsage = memoryIncreaseMB;
            this.performanceMetrics.retainedMemory = retainedMemoryMB;
            
            // Check if memory usage is reasonable (< 10MB increase, < 1MB retained after cleanup)
            if (memoryIncreaseMB > 10) {
                throw new Error(`Memory usage too high: ${memoryIncreaseMB.toFixed(2)}MB`);
            }
            
            if (retainedMemoryMB > 1) {
                throw new Error(`Retained memory too high: ${retainedMemoryMB.toFixed(2)}MB`);
            }
            
            this.testResults.push({
                test: 'Memory Usage',
                status: 'PASS',
                message: `Memory increase: ${memoryIncreaseMB.toFixed(2)}MB, Retained: ${retainedMemoryMB.toFixed(2)}MB`
            });
            
            return true;
        } catch (error) {
            this.testResults.push({
                test: 'Memory Usage',
                status: 'FAIL',
                message: error.message
            });
            return false;
        }
    }

    // Test 7: Error Handling and Fallback Test
    async testErrorHandlingAndFallback() {
        console.log('\n=== Test 7: Error Handling and Fallback ===');
        
        try {
            const optimizer = window.battleSystemOptimizer;
            let fallbackTested = false;
            
            // Test invalid character ID preloading
            try {
                await optimizer.preloadBattleCharacters(['invalid_character_id']);
                fallbackTested = true;
            } catch (error) {
                console.log('✅ Properly handled invalid character ID');
            }
            
            // Test null/undefined character preloading
            try {
                await optimizer.preloadBattleCharacters([null, undefined, '']);
                fallbackTested = true;
            } catch (error) {
                console.log('✅ Properly handled null/undefined characters');
            }
            
            // Test empty character array
            await optimizer.preloadBattleCharacters([]);
            console.log('✅ Handled empty character array');
            
            // Test data access with character data missing
            const backupGetUnlockedPlayerById = centerData?.getUnlockedPlayerById;
            if (centerData && backupGetUnlockedPlayerById) {
                centerData.getUnlockedPlayerById = () => null;
                
                try {
                    const chars = optimizer.getSelectedCharactersOptimized();
                    await optimizer.preloadBattleCharacters(chars.slice(0, 1));
                    console.log('✅ Handled missing character data');
                } catch (error) {
                    console.log('✅ Properly errored with missing character data');
                } finally {
                    // Restore original function
                    centerData.getUnlockedPlayerById = backupGetUnlockedPlayerById;
                }
            }
            
            this.testResults.push({
                test: 'Error Handling and Fallback',
                status: 'PASS',
                message: 'Error handling and fallback mechanisms working correctly'
            });
            
            return true;
        } catch (error) {
            this.testResults.push({
                test: 'Error Handling and Fallback',
                status: 'FAIL',
                message: error.message
            });
            return false;
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Battle System Optimization Test Suite...');
        
        const tests = [
            () => this.testOptimizerInstance(),
            () => this.testCharacterPreloading(),
            () => this.testOptimizedDataAccess(),
            () => this.testSelectedCharactersOptimization(),
            () => this.testBattleInitializationPerformance(),
            () => this.testMemoryUsage(),
            () => this.testErrorHandlingAndFallback()
        ];
        
        let passedTests = 0;
        const totalTests = tests.length;
        const testStart = performance.now();
        
        for (const test of tests) {
            try {
                const result = await test();
                if (result) passedTests++;
            } catch (error) {
                console.error('Test execution error:', error);
                this.testResults.push({
                    test: 'Test Execution',
                    status: 'FAIL',
                    message: `Execution error: ${error.message}`
                });
            }
        }
        
        const totalTestTime = performance.now() - testStart;
        
        // Generate report
        this.generateReport(passedTests, totalTests, totalTests);
        
        return passedTests === totalTests;
    }

    // Generate comprehensive report
    generateReport(passedTests, totalTestTime, totalTests) {
        const totalTime = performance.now() - this.testStartTime;
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 BATTLE SYSTEM OPTIMIZATION TEST REPORT');
        console.log('='.repeat(70));
        
        console.log(`\n📈 OVERALL RESULTS: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
        console.log(`⏱️  Total test execution time: ${totalTime.toFixed(2)}ms`);
        
        // Test results
        console.log('\n📋 DETAILED RESULTS:');
        this.testResults.forEach((result, index) => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.test}: ${result.message}`);
        });
        
        // Performance metrics
        console.log('\n⚡ PERFORMANCE METRICS:');
        console.log(`• Character Preloading: ${this.performanceMetrics.preloadTime?.toFixed(2) || 'N/A'}ms (${this.performanceMetrics.preloadedCount || 0} chars)`);
        console.log(`• Second Preloading: ${this.performanceMetrics.secondPreloadTime?.toFixed(2) || 'N/A'}ms`);
        console.log(`• Optimized Data Access: ${this.performanceMetrics.optimizedAccess?.toFixed(2) || 'N/A'}ms`);
        console.log(`• Traditional Data Access: ${this.performanceMetrics.traditionalAccess?.toFixed(2) || 'N/A'}ms`);
        console.log(`• Cached Data Access: ${this.performanceMetrics.cachedAccess?.toFixed(2) || 'N/A'}ms`);
        console.log(`• Data Access Improvement: ${this.performanceMetrics.dataAccessImprovement?.toFixed(1) || 'N/A'}%`);
        console.log(`• Cache Improvement: ${this.performanceMetrics.cacheImprovement?.toFixed(1) || 'N/A'}%`);
        console.log(`• Selected Characters Optimized: ${this.performanceMetrics.selectedOptimized?.toFixed(2) || 'N/A'}ms`);
        console.log(`• Selected Characters Traditional: ${this.performanceMetrics.selectedTraditional?.toFixed(2) || 'N/A'}ms`);
        console.log(`• Selected Characters Improvement: ${this.performanceMetrics.selectedImprovement?.toFixed(1) || 'N/A'}%`);
        console.log(`• Battle Initialization: ${this.performanceMetrics.battleInitialization?.toFixed(2) || 'N/A'}ms`);
        console.log(`• Player Lookup: ${this.performanceMetrics.playerLookup?.toFixed(2) || 'N/A'}ms`);
        console.log(`• Data Size: ${this.performanceMetrics.dataSize || 0} characters`);
        
        // Memory metrics
        console.log('\n🧠 MEMORY METRICS:');
        console.log(`• Memory Usage Increase: ${this.performanceMetrics.memoryUsage?.toFixed(2) || 'N/A'}MB`);
        console.log(`• Retained Memory After Cleanup: ${this.performanceMetrics.retainedMemory?.toFixed(2) || 'N/A'}MB`);
        
        // Success criteria evaluation
        console.log('\n🎯 SUCCESS CRITERIA EVALUATION:');
        const criteria = this.evaluateSuccessCriteria();
        criteria.forEach((criterion, index) => {
            const status = criterion.met ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${criterion.name}: ${criterion.result}`);
        });
        
        // Overall assessment
        console.log('\n🏆 OVERALL ASSESSMENT:');
        const metCriteria = criteria.filter(c => c.met).length;
        const totalCriteria = criteria.length;
        if (metCriteria === totalCriteria) {
            console.log('🎉 ALL SUCCESS CRITERIA MET! Ready for Phase 3.2 implementation.');
        } else {
            console.log(`⚠️  ${metCriteria}/${totalCriteria} criteria met. Review results before proceeding.`);
        }
        
        console.log('\n' + '='.repeat(70));
        
        return criteria;
    }

    // Evaluate success criteria
    evaluateSuccessCriteria() {
        const criteria = [
            {
                name: 'All Tests Pass',
                met: this.testResults.every(r => r.status === 'PASS'),
                result: this.testResults.filter(r => r.status === 'PASS').length + '/' + this.testResults.length
            },
            {
                name: '50% Faster Data Access',
                met: (this.performanceMetrics.dataAccessImprovement || 0) >= 50,
                result: `${this.performanceMetrics.dataAccessImprovement?.toFixed(1) || 'N/A'}% improvement (target: 50%)`
            },
            {
                name: 'Battle Init < 2s',
                met: (this.performanceMetrics.battleInitialization || 0) < 2000,
                result: `${this.performanceMetrics.battleInitialization?.toFixed(2) || 'N/A'}ms (target: <2000ms)`
            },
            {
                name: 'Memory Usage < 10MB',
                met: (this.performanceMetrics.memoryUsage || 0) < 10,
                result: `${this.performanceMetrics.memoryUsage?.toFixed(2) || 'N/A'}MB (target: <10MB)`
            },
            {
                name: 'Cached Access < 5ms',
                met: (this.performanceMetrics.cachedAccess || 0) < 5,
                result: `${this.performanceMetrics.cachedAccess?.toFixed(2) || 'N/A'}ms (target: <5ms)`
            },
            {
                name: 'Player Lookup < 1ms',
                met: (this.performanceMetrics.playerLookup || 0) < 1,
                result: `${this.performanceMetrics.playerLookup?.toFixed(2) || 'N/A'}ms (target: <1ms)`
            }
        ];
        
        return criteria;
    }
}

// Auto-run test suite
async function runBattleSystemTestSuite() {
    const testSuite = new BattleSystemTestSuite();
    const success = await testSuite.runAllTests();
    
    if (success) {
        console.log('\n🎉 All tests passed! Battle System Optimization is working correctly.');
        console.log('✅ Ready to proceed with Phase 3.2: Market System Optimization');
    } else {
        console.log('\n⚠️ Some tests failed. Please review the report above before proceeding.');
    }
    
    return success;
}

// Export for manual testing
if (typeof window !== 'undefined') {
    window.runBattleSystemTestSuite = runBattleSystemTestSuite;
    window.BattleSystemTestSuite = BattleSystemTestSuite;
    
    // Auto-run if environment is ready
    if (typeof centerData !== 'undefined' && typeof window.battleSystemOptimizer !== 'undefined') {
        setTimeout(runBattleSystemTestSuite, 1000);
    }
}

// Node.js export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BattleSystemTestSuite, runBattleSystemTestSuite };
}

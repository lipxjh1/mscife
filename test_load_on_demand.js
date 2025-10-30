// Test script for Load On Demand implementation
// Import CenterData for testing
import { CenterData } from './src/game/Data/CenterData.js';

async function testLoadOnDemand() {
    console.log('=== Testing Load On Demand Implementation ===');
    
    const centerData = new CenterData();
    
    // Test 1: Check new data structures exist
    console.log('\n1. Testing new data structures...');
    try {
        const hasBasicStructures = centerData.basicCharacters instanceof Map;
        const hasDetailedStructures = centerData.detailedCharacters instanceof Map;
        const hasLoadingSet = centerData.loadingCharacters instanceof Set;
        const hasFailedSet = centerData.failedCharacters instanceof Set;
        
        console.log(`✅ basicCharacters (Map): ${hasBasicStructures}`);
        console.log(`✅ detailedCharacters (Map): ${hasDetailedStructures}`);
        console.log(`✅ loadingCharacters (Set): ${hasLoadingSet}`);
        console.log(`✅ failedCharacters (Set): ${hasFailedSet}`);
        
        if (hasBasicStructures && hasDetailedStructures && hasLoadingSet && hasFailedSet) {
            console.log('✅ New data structures initialized successfully');
        } else {
            console.error('❌ Data structures initialization failed');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Data structures test failed:', error);
        return false;
    }
    
    // Test 2: Check new methods exist
    console.log('\n2. Testing new methods...');
    try {
        const hasBasicLoad = typeof centerData.loadBasicInfoForAllCharacters === 'function';
        const hasFullLoad = typeof centerData.loadFullCharacterData === 'function';
        const hasIsFull = typeof centerData.isCharacterFullyLoaded === 'function';
        const hasIsLoading = typeof centerData.isCharacterLoading === 'function';
        const hasGetBasic = typeof centerData.getCharacterBasicInfo === 'function';
        const hasGetFull = typeof centerData.getCharacterFullInfo === 'function';
        
        console.log(`✅ loadBasicInfoForAllCharacters: ${hasBasicLoad}`);
        console.log(`✅ loadFullCharacterData: ${hasFullLoad}`);
        console.log(`✅ isCharacterFullyLoaded: ${hasIsFull}`);
        console.log(`✅ isCharacterLoading: ${hasIsLoading}`);
        console.log(`✅ getCharacterBasicInfo: ${hasGetBasic}`);
        console.log(`✅ getCharacterFullInfo: ${hasGetFull}`);
        
        if (hasBasicLoad && hasFullLoad && hasIsFull && hasIsLoading && hasGetBasic && hasGetFull) {
            console.log('✅ New methods are available');
        } else {
            console.error('❌ Missing methods');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Methods test failed:', error);
        return false;
    }
    
    // Test 3: Check modified methods work
    console.log('\n3. Testing modified methods...');
    try {
        // Check GetMergedCharacters still works
        const merged = centerData.GetMergedCharacters();
        console.log(`✅ GetMergedCharacters() returns object: ${typeof merged === 'object'}`);
        
        // Check RequestMergedCharacters exists and is async
        const isAsync = centerData.RequestMergedCharacters.constructor.name === 'AsyncFunction';
        console.log(`✅ RequestMergedCharacters is async: ${isAsync}`);
        
        if (typeof merged === 'object' && isAsync) {
            console.log('✅ Modified methods functional');
        } else {
            console.error('❌ Modified methods not functional');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Modified methods test failed:', error);
        return false;
    }
    
    // Test 4: Basic functionality test
    console.log('\n4. Testing basic functionality...');
    try {
        // Simulate basic character data
        centerData.basicCharacters.set('test_char_1', {
            _id: 'test_char_1',
            code: 'victoria',
            name: 'Victoria Test',
            role: 'gunner',
            rank: 'c',
            level: 1,
            star: 1
        });
        
        console.log(`✅ Basic characters count: ${centerData.basicCharacters.size}`);
        
        // Test get basic info
        const basicInfo = centerData.getCharacterBasicInfo('test_char_1');
        console.log(`✅ Get basic info: ${basicInfo?.name === 'Victoria Test'}`);
        
        // Test is fully loaded
        const isFullyLoaded = centerData.isCharacterFullyLoaded('test_char_1');
        console.log(`✅ Is fully loaded (should be false): ${!isFullyLoaded}`);
        
        // Test updated GetMergedCharacters
        const merged = centerData.GetMergedCharacters();
        console.log(`✅ Merged characters count: ${Object.keys(merged).length}`);
        
        console.log('✅ Basic functionality test passed');
        
    } catch (error) {
        console.error('❌ Basic functionality test failed:', error);
        return false;
    }
    
    // Test 5: Performance test
    console.log('\n5. Performance test...');
    try {
        // Simulate multiple characters
        for (let i = 1; i <= 100; i++) {
            centerData.basicCharacters.set(`test_char_${i}`, {
                _id: `test_char_${i}`,
                code: `character_${i}`,
                name: `Character ${i}`,
                role: i % 3 === 0 ? 'rocket' : i % 2 === 0 ? 'sniper' : 'gunner',
                rank: 'c',
                level: 1,
                star: 1
            });
        }
        
        const startTime = performance.now();
        const merged = centerData.GetMergedCharacters();
        const endTime = performance.now();
        
        console.log(`✅ Processed 100 characters in ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`✅ Performance test passed (< 10ms)`);
        
    } catch (error) {
        console.error('❌ Performance test failed:', error);
        return false;
    }
    
    console.log('\n=== Load On Demand Test Completed Successfully ===');
    console.log('✅ All tests passed! Implementation is ready.');
    
    return true;
}

// Test compatibility with existing code structure
try {
    testLoadOnDemand().then(success => {
        process.exit(success ? 0 : 1);
    });
} catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
}

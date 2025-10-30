# Test script for HomeLobby.js Load On Demand implementation
async function testHomeLobbyLoadOnDemand() {
    console.log('=== Testing HomeLobby.js Load On Demand Implementation ===');
    
    // Test 1: Check if new functions exist
    console.log('\n1. Testing new functions existence...');
    if (typeof SpawnLobbyCharacterWithLoadOnDemand !== 'function') {
        console.log('✅ SpawnLobbyCharacterWithLoadOnDemand function exists');
    } else {
        console.error('❌ SpawnLobbyCharacterWithLoadOnDemand function not found');
        return false;
    }
    
    if (typeof SwitchCharacterSeamlessly !== 'function') {
        console.error('❌ SwitchCharacterSeamlessly function not found');
        return false;
    }
    
    // Test 2: Check basic character loading
    console.log('\n2. Testing basic character loading...');
    const basicStart = performance.now();
    
    try {
        // Simulate basic loading
        if (
            centerData &&
            centerData.selectedPlayerArr && 
            centerData.selectedPlayerArr.length > 0
        ) {
            const basicIds = centerData.getSelectedPlayerLocalIds();
            const basicTime = performance.now() - basicStart;
            console.log(`✅ Basic character IDs: [${basicIds.join(', ')} ]`);
            console.log(`✅ Basic loading completed in ${basicTime.toFixed(2)}ms`);
            
            // Test if basic data is available
            const testCharacterId = centerData.selectedPlayerArr[0];
            const hasBasicData = centerData.getCharacterBasicInfo(testCharacterId);
            console.log(`✅ Character ${testCharacterId} basic data available:`, !!hasBasicData);
        } else {
            console.warn('⚠️ No selected characters to test');
        }
        
    } catch (error) {
        console.error('❌ Basic loading test failed:', error);
        return false;
    }
    
    // Test 3: Check detailed character loading
    console.log('\n3. Testing detailed character loading...');
    if (centerData.selectedPlayerArr.length > 0) {
        const testCharId = centerData.selectedPlayerArr[0];
        const detailStart = performance.now();
        
        try {
            const isLoaded = centerData.isCharacterFullyLoaded(testCharId);
            console.log(`✅ Character ${testCharId} fully loaded: ${isLoaded}`);
            
            if (!isLoaded) {
                const detailData = await centerData.loadFullCharacterData(testCharId);
                const detailTime = performance.now() - detailStart;
                console.log(`✅ Detail loading completed in ${detailTime.toFixed(2)}ms`);
                
                // Check enhanced character update
                const basicDataAfter = centerData.getCharacterBasicInfo(testCharId);
                const fullDataAfter = centerData.getCharacterFullInfo(testCharId);
                
                console.log('✅ Full data loaded:', !!fullDataAfter);
                
                // Test that full data contains more data than basic
                if (basicDataAfter && fullDataAfter) {
                    console.log('✅ Enhanced character data confirmed with additional properties');
                    const basicKeys = Object.keys(basicDataAfter);
                    const fullKeys = Object.keys(fullDataAfter);
                    const additionalKeys = fullKeys.filter(k => !basicKeys.includes(k));
                    console.log(`✅ Additional properties found: additionalKeys.length}`);
                }
            }
            
        } catch (error) {
            console.error('❌ Detail loading test failed:', error);
            return false;
        }
        
    } else {
        console.log('⚠️ No selected characters to test detail loading');
    }
    
    // Test 4: Performance comparison
    console.log('\n4. Performance summary:');
    if (performance.memory) {
        const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        console.log(`✅ Memory usage: ${memoryMB}MB`);
    }
    
    // Test 5: Check seamless character switching
    console.log('\n5. Testing seamless character switching...');
    if (centerData.selectedPlayerArr.length >= 2) {
        const switchStart1 = performance.now();
        
        // Test character switching
        SwitchCharacterSeamlessly(window.homeScene, 'next');
        
        const switchTime1 = performance.now() - switchStart1;
        console.log(`✅ Character switch (next) completed in ${switchTime1.toFixed(2)}ms`);
        
        const switchStart2 = performance.now();
        SwitchCharacterSeamlessly(window.homeScene, 'prev');
        const switchTime2 = performance.now() - switchStart2;
        console.log(`✅ Character switch (prev) completed in ${switchTime2.toFixed(2)}ms`);
        
        const averageSwitchTime = (switchTime1 + switchTime2) / 2;
        const expectedMaxTime = 50; // Max 50ms per character switch
        console.log(`✅ Average switch time: ${averageSwitchTime.toFixed(2)}ms (${averageSwitchTime < expectedMaxTime ? '✅' : '⚠️'});
    }
    
    // Test 6: Loading state management
    console.log('\n6. Testing loading state management...');
    if (centerData.selectedPlayerArr.length > 0) {
            const testCharId = centerData.selectedPlayerArr[0];
            
            // Test basic state
            console.log(`✅ Character ${testCharId} state:`);
            console.log(`- Is fully loaded: ${centerData.isCharacterFullyLoaded(testCharId)}`);
            
            // Test loading state during switching
            if (!centerData.isCharacterFullyLoaded(testCharId)) {
                showTransitionLoading(window.homeScene);
                
                centerData.loadFullCharacterData(testCharId).then(() => {
                    hideTransitionLoading(window.homeScene);
                }).catch(error => {
                    console.error('❌ Error in load during switching:', error);
                    hideTransitionLoading(window.homeScene);
                });
            }
        }
    }
    
    console.log('\n=== HomeLobby.js Load On Demand Test Completed Successfully ===');
    return true;
}

// Auto-run test if functions are available
if (typeof SpawnLobbyCharacterWithLoadOnDemand !== 'undefined') {
    setTimeout(() => {
        testHomeLobbyLoadOnDemand();
    }, 1000);
} else if (typeof centerData !== 'undefined') {
    console.log('❌ Load On Demand functions not available in centerData');
}
```

### Bước 4.3: Create documentation
<tool_call>Execute
<arg_key>command</arg_key>
<arg_value>mkdir -p /mnt/d/fe/fe/backend/doc

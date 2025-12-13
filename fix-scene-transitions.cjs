#!/usr/bin/env node

/**
 * Script để fix scene.start() thành scene.stop() + scene.start()
 */

const fs = require('fs');
const path = require('path');

function fixSceneTransitions() {
    const filesToFix = [
        'src/game/scenes/Preloader.js',
        'src/game/worldpay/TestExample.js'
    ];

    filesToFix.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Fix pattern: this.scene.start("SceneName") → this.scene.stop(); this.scene.start("SceneName")
            // But don't fix the BaseScene.js template
            if (!filePath.includes('BaseScene.js')) {
                content = content.replace(
                    /this\.scene\.start\("([^"]+)"\)/g,
                    'this.scene.stop(); this.scene.start("$1")'
                );
            }

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed scene transitions in: ${filePath}`);
        } else {
            console.log(`❌ File not found: ${filePath}`);
        }
    });
}

console.log('🚀 Fixing scene transitions...\n');
fixSceneTransitions();
console.log('\n✨ Done!');
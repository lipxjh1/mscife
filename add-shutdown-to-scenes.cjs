#!/usr/bin/env node

/**
 * Script để thêm shutdown() method vào tất cả scenes thiếu
 * Cách chạy: node add-shutdown-to-scenes.js
 */

const fs = require('fs');
const path = require('path');

// Template cho shutdown() method
const SHUTDOWN_TEMPLATE = `
    /**
     * Cleanup resources khi scene shutdown
     */
    shutdown() {
        console.log(\`[\${this.scene?.key || 'Unknown'}] Scene shutting down...\`);

        // 1. Cleanup timers
        if (this.timers) {
            this.timers.forEach(timer => {
                if (timer && timer.remove) {
                    timer.remove();
                }
            });
            this.timers = null;
        }

        // 2. Cleanup tweens
        if (this.tweens) {
            this.tweens.killAll();
        }

        // 3. Cleanup socket events
        if (this.socketEvents && socketService?.socket) {
            this.socketEvents.forEach(({event, handler}) => {
                socketService.socket.off(event, handler);
            });
            this.socketEvents = null;
        }

        // 4. Cleanup input events
        if (this.input) {
            this.input.removeAllListeners();
        }

        // 5. Cleanup custom data
        if (this.customData) {
            this.customData = null;
        }

        // 6. Cleanup animations
        if (this.anims) {
            this.anims.stopAll();
        }

        console.log(\`[\${this.scene?.key || 'Unknown'}] Scene shutdown complete\`);
    }`;

// Danh sách files cần skip (đã có shutdown hoặc đặc biệt)
const SKIP_FILES = [
    'BaseScene.js',
    'Gameplay.js',
    'GameplayBoss.js',
    'GameplayMultiplayerBoss.js',
    'GameplayTest.js',
    'Home.js'
];

// Function để kiểm tra file đã có shutdown chưa
function hasShutdown(content) {
    return /shutdown\s*\(\)\s*{/.test(content);
}

// Function để thêm shutdown vào class
function addShutdownToClass(content) {
    // Tìm vị trí cuối cùng của class (trước export default)
    const classEndRegex = /}\s*$/;
    const match = content.match(classEndRegex);

    if (!match) {
        console.warn('Could not find class end');
        return content;
    }

    // Nếu có methods khác, tìm vị trí trước dấu } cuối cùng
    const lastBraceIndex = content.lastIndexOf('}');
    const beforeLastBrace = content.substring(0, lastBraceIndex);

    // Nếu đã có methods khác, thêm newline trước shutdown
    const hasMethods = /{\s*$/.test(beforeLastBrace.trim().slice(-50));

    // Thêm shutdown method
    const shutdownCode = hasMethods ? '\n' + SHUTDOWN_TEMPLATE : SHUTDOWN_TEMPLATE;

    return content.substring(0, lastBraceIndex) +
           shutdownCode +
           '\n' +
           content.substring(lastBraceIndex);
}

// Main function
function main() {
    const scenesDir = path.join(__dirname, 'src/game/scenes');
    let processedCount = 0;
    let skippedCount = 0;

    // Đệ quy qua tất cả files
    function processDirectory(dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                processDirectory(filePath);
            } else if (file.endsWith('.js')) {
                // Skip files trong danh sách
                if (SKIP_FILES.includes(file)) {
                    console.log(`⏭️  Skipping: ${file} (already has shutdown)`);
                    skippedCount++;
                    continue;
                }

                // Read file
                const content = fs.readFileSync(filePath, 'utf8');

                // Skip nếu đã có shutdown
                if (hasShutdown(content)) {
                    console.log(`⏭️  Skipping: ${file} (already has shutdown)`);
                    skippedCount++;
                    continue;
                }

                // Check if file exports a Scene class
                if (!content.includes('extends') || !content.includes('Scene')) {
                    console.log(`⏭️  Skipping: ${file} (not a scene)`);
                    skippedCount++;
                    continue;
                }

                // Thêm shutdown method
                const updatedContent = addShutdownToClass(content);

                // Write back to file
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`✅ Added shutdown to: ${file}`);
                processedCount++;
            }
        }
    }

    console.log('🚀 Adding shutdown() to all scenes...\n');

    // Backup
    const backupDir = path.join(__dirname, 'src/game/scenes.backup');
    if (!fs.existsSync(backupDir)) {
        console.log('📦 Creating backup...');
        fs.cpSync(scenesDir, backupDir, { recursive: true });
    }

    // Process files
    processDirectory(scenesDir);

    console.log('\n✨ Done!');
    console.log(`📊 Processed: ${processedCount} files`);
    console.log(`📊 Skipped: ${skippedCount} files`);
}

// Run nếu script được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = { main, addShutdownToClass, hasShutdown };
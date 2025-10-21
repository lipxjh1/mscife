/**
 * Script để tự động sửa tất cả các file có lỗi animationState.setAnimation
 * Chạy script này để cập nhật tất cả các file còn lại
 */

import fs from "fs";
import path from "path";

// Danh sách các file cần sửa
const filesToFix = [
    "src/game/scenes/EnemyTest/TestEnemyDrones.js",
    "src/game/scenes/Enemy/EnemyGhost.js",
    "src/game/scenes/Boss/Boss.js",
    "src/game/scenes/Boss/BossDrones.js",
    "src/game/scenes/Boss/BossTitan.js",
    "src/game/scenes/Share/PopupReward.js",
];

// Import statement cần thêm
const importStatement = `import { playIdleAnimation, playAttackAnimation, playCustomAnimation } from "../../utils/spineUtils.js";`;

// Các pattern cần thay thế
const replacements = [
    {
        pattern:
            /this\.spine\.animationState\.setAnimation\(0, "idle", true\)/g,
        replacement: "playIdleAnimation(this.spine)",
    },
    {
        pattern:
            /this\.droneSpine\.animationState\.setAnimation\(0, "idle", true\)/g,
        replacement: "playIdleAnimation(this.droneSpine)",
    },
    {
        pattern:
            /this\.spine\.animationState\.setAnimation\(0, "attack", false\)/g,
        replacement: "playAttackAnimation(this.spine)",
    },
    {
        pattern:
            /this\.droneSpine\.animationState\.setAnimation\(0, "attack", false\)/g,
        replacement: "playAttackAnimation(this.droneSpine)",
    },
    {
        pattern:
            /this\.spine\.animationState\.setAnimation\(0, animName, false\)/g,
        replacement: "playCustomAnimation(this.spine, animName, false)",
    },
    {
        pattern:
            /this\.droneSpine\.animationState\.setAnimation\(0, animName, false\)/g,
        replacement: "playCustomAnimation(this.droneSpine, animName, false)",
    },
    {
        pattern: /spine\.animationState\.setAnimation\(0, animName, false\)/g,
        replacement: "playCustomAnimation(spine, animName, false)",
    },
];

function fixFile(filePath) {
    try {
        //console.log(`Fixing file: ${filePath}`);

        // Đọc file
        let content = fs.readFileSync(filePath, "utf8");

        // Kiểm tra xem đã có import chưa
        if (!content.includes("playIdleAnimation")) {
            // Thêm import statement sau dòng import đầu tiên
            const lines = content.split("\n");
            let importIndex = -1;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith("import ")) {
                    importIndex = i;
                } else if (
                    importIndex !== -1 &&
                    !lines[i].trim().startsWith("import ")
                ) {
                    break;
                }
            }

            if (importIndex !== -1) {
                lines.splice(importIndex + 1, 0, importStatement);
                content = lines.join("\n");
            }
        }

        // Thực hiện các thay thế
        let modified = false;
        for (const replacement of replacements) {
            if (replacement.pattern.test(content)) {
                content = content.replace(
                    replacement.pattern,
                    replacement.replacement
                );
                modified = true;
            }
        }

        if (modified) {
            // Ghi lại file
            fs.writeFileSync(filePath, content, "utf8");
            //console.log(`✅ Fixed: ${filePath}`);
        } else {
            //console.log(`⏭️  No changes needed: ${filePath}`);
        }
    } catch (error) {
        //console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
}

// Chạy script
//console.log("🔧 Starting spine animation fixes...\n");

for (const file of filesToFix) {
    fixFile(file);
}

// console.log("\n✅ All files processed!");
// console.log("\n📝 Manual fixes needed:");
// console.log("1. Check if all imports are correct");
// console.log("2. Verify that all animation calls use utility functions");
// console.log("3. Test the game to ensure animations work");

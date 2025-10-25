#!/usr/bin/env node

/**
 * Comprehensive WebP Update Script
 * Updates all files to use WebP format where available
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all WebP files in public/assets
function findWebPFiles() {
  const webpFiles = new Set();

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith('.webp')) {
        // Store relative path from public/assets
        const relativePath = fullPath.replace(/^public\//, '');
        webpFiles.add(relativePath);
      }
    }
  }

  walk('public/assets');
  return webpFiles;
}

// Update files that might have PNG references
function updateFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${description} not found, skipping...`);
    return { found: 0, replaced: 0 };
  }

  const originalContent = fs.readFileSync(filePath, 'utf8');
  const webpFiles = findWebPFiles();

  // Pattern 1: Direct .png references
  const pngRegex = /(['"])([^'"]+\.png)(['"])/g;

  // Pattern 2: URL patterns that might need webp extension
  const urlPattern = /url:\s*(['"])([^'"]+player_\w+_(?:ui|gameplay))(['"])/g;

  let updatedContent = originalContent;
  let pngReplacements = 0;
  let urlReplacements = 0;

  // Replace direct .png references
  updatedContent = updatedContent.replace(pngRegex, (match, quote, pngPath) => {
    const webpPath = pngPath.replace(/\.png$/, '.webp');
    if (webpFiles.has(webpPath)) {
      console.log(`✓ ${description}: ${pngPath} → ${webpPath}`);
      pngReplacements++;
      return `${quote}${webpPath}${quote}`;
    }
    return match;
  });

  // Replace URL patterns without extensions
  updatedContent = updatedContent.replace(urlPattern, (match, quote, urlPath) => {
    if (!urlPath.includes('.')) { // No extension specified
      const webpPath = urlPath + '.webp';
      if (webpFiles.has(webpPath)) {
        console.log(`✓ ${description}: ${urlPath} → ${webpPath}`);
        urlReplacements++;
        return `url: ${quote}${webpPath}${quote}`;
      }
    }
    return match;
  });

  // Write back if changes were made
  if (pngReplacements > 0 || urlReplacements > 0) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ ${description} updated (${pngReplacements + urlReplacements} changes)!`);
  }

  return { found: pngReplacements + urlReplacements, replaced: pngReplacements + urlReplacements };
}

// Files to check and update
const filesToUpdate = [
  { path: 'src/game/scenes/Preloader.js', desc: 'Preloader.js' },
  { path: 'src/game/Data/CenterData.js', desc: 'CenterData.js' },
  { path: 'src/game/scenes/HomeBattleMultiplayerBossRoom.js', desc: 'HomeBattleMultiplayerBossRoom.js' },
];

console.log('🔄 Comprehensive WebP Update Script\n');
console.log('==================================\n');

const webpFiles = findWebPFiles();
console.log(`Found ${webpFiles.size} WebP files available\n`);

let totalFound = 0;
let totalReplaced = 0;

for (const file of filesToUpdate) {
  const result = updateFile(file.path, file.desc);
  totalFound += result.found;
  totalReplaced += result.replaced;
}

console.log('\n=== Summary ===');
console.log(`Total files checked: ${filesToUpdate.length}`);
console.log(`Total references found: ${totalFound}`);
console.log(`Total replacements made: ${totalReplaced}`);
console.log(`WebP files available: ${webpFiles.size}`);

if (totalReplaced > 0) {
  console.log('\n🎉 WebP update completed successfully!');
} else {
  console.log('\n⚠️  No updates needed - assets already using WebP or WebP not available');
}
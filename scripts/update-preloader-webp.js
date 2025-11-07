#!/usr/bin/env node

/**
 * Update Preloader.js to use WebP files instead of PNG
 * Automatically finds .webp references and replaces with .webp if WebP file exists
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        // Convert to assets path format for comparison
        const relativePath = fullPath.replace(/^public\//, '');
        webpFiles.add(relativePath);
      }
    }
  }

  walk('public/assets');
  return webpFiles;
}

function updatePreloader() {
  const preloaderPath = 'src/game/scenes/Preloader.js';

  if (!fs.existsSync(preloaderPath)) {
    console.error('Preloader.js not found at:', preloaderPath);
    return;
  }

  // Read original file
  const originalContent = fs.readFileSync(preloaderPath, 'utf8');

  // Find all WebP files
  const webpFiles = findWebPFiles();
  console.log(`Found ${webpFiles.size} WebP files`);

  let updatedContent = originalContent;
  let replacements = 0;

  // Find all .webp references and replace with .webp if WebP exists
  const pngRegex = /(['"])([^'"]+\.webp)(['"])/g;

  updatedContent = originalContent.replace(pngRegex, (match, quote, pngPath) => {
    // Convert to assets path
    const webpPath = pngPath.replace(/\.png$/, '.webp');

    // Check if WebP file exists
    if (webpFiles.has(webpPath)) {
      console.log(`✓ Replacing: ${pngPath} → ${webpPath}`);
      replacements++;
      return `${quote}${webpPath}${quote}`;
    }

    return match;
  });

  // Write updated content
  fs.writeFileSync(preloaderPath, updatedContent, 'utf8');

  console.log(`\n=== Preloader Update Summary ===`);
  console.log(`Total PNG references found: ${originalContent.match(pngRegex)?.length || 0}`);
  console.log(`Replacements made: ${replacements}`);
  console.log(`WebP files available: ${webpFiles.size}`);

  if (replacements > 0) {
    console.log('\n✅ Preloader.js updated successfully!');
  } else {
    console.log('\n⚠️  No PNG references were replaced (WebP files not found or already updated)');
  }
}

// Also check CenterData for PNG references
function updateCenterData() {
  const centerDataPath = 'src/game/Data/CenterData.js';

  if (!fs.existsSync(centerDataPath)) {
    console.log('CenterData.js not found, skipping...');
    return;
  }

  const originalContent = fs.readFileSync(centerDataPath, 'utf8');
  const webpFiles = findWebPFiles();

  let updatedContent = originalContent;
  let replacements = 0;

  const pngRegex = /(['"])([^'"]+\.webp)(['"])/g;

  updatedContent = originalContent.replace(pngRegex, (match, quote, pngPath) => {
    const webpPath = pngPath.replace(/\.png$/, '.webp');

    if (webpFiles.has(webpPath)) {
      console.log(`✓ CenterData: ${pngPath} → ${webpPath}`);
      replacements++;
      return `${quote}${webpPath}${quote}`;
    }

    return match;
  });

  if (replacements > 0) {
    fs.writeFileSync(centerDataPath, updatedContent, 'utf8');
    console.log(`\n✅ CenterData.js updated (${replacements} replacements)!`);
  }
}

// Main execution
console.log('🔄 Updating Phaser load code to use WebP files...\n');

updatePreloader();
updateCenterData();

console.log('\n🎉 Update completed!');
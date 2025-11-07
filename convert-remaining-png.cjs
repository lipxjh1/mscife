const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION FOR PHASE 2
// ============================================
const CONFIG = {
  // Quality by size range
  qualityBySize: [
    { min: 512000, max: Infinity, quality: 75, label: 'Large (>500KB)' },  // Higher compression for large files
    { min: 204800, max: 512000, quality: 80, label: 'Medium (200-500KB)' },
    { min: 51200, max: 204800, quality: 85, label: 'Small (50-200KB)' },
    { min: 0, max: 51200, quality: 90, label: 'Tiny (<50KB)' }  // Higher quality for tiny UI elements
  ],

  // Folders to exclude
  excludeFolders: ['node_modules', 'backup', 'backups', 'dist', 'build', '.git'],

  // Minimum file size to convert (convert all for completeness)
  minSizeToConvert: 1000, // 1KB - convert almost everything

  // Skip files that already have .webp version
  skipIfWebpExists: true,

  // Process test folder with lower priority
  skipTestFolder: false
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getQualityForSize(fileSize) {
  for (const range of CONFIG.qualityBySize) {
    if (fileSize >= range.min && fileSize <= range.max) {
      return range;
    }
  }
  return { quality: 80, label: 'Default' };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function convertFile(inputPath, outputPath, fileSize) {
  try {
    const qualitySettings = getQualityForSize(fileSize);

    // Skip if too small
    if (fileSize < CONFIG.minSizeToConvert) {
      return {
        success: false,
        skipped: true,
        reason: 'File too small (< 1KB)',
        input: inputPath
      };
    }

    // Skip if in test folder and config says skip
    if (CONFIG.skipTestFolder && inputPath.includes('/test/')) {
      return {
        success: false,
        skipped: true,
        reason: 'Test file (skipped by config)',
        input: inputPath
      };
    }

    // Skip if WebP already exists
    if (CONFIG.skipIfWebpExists && fs.existsSync(outputPath)) {
      return {
        success: false,
        skipped: true,
        reason: 'WebP already exists',
        input: inputPath
      };
    }

    // Get image info to handle alpha
    const metadata = await sharp(inputPath).metadata();

    // Convert with appropriate settings
    const sharpInstance = sharp(inputPath);

    // Handle alpha channel preservation
    if (metadata.hasAlpha) {
      sharpInstance.webp({
        quality: qualitySettings.quality,
        alphaQuality: 100, // Preserve alpha perfectly
        lossless: false // Still allow compression
      });
    } else {
      sharpInstance.webp({
        quality: qualitySettings.quality
      });
    }

    await sharpInstance.toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const savedBytes = fileSize - newSize;
    const savedPercent = ((savedBytes / fileSize) * 100).toFixed(1);

    return {
      success: true,
      input: inputPath,
      output: outputPath,
      originalSize: fileSize,
      newSize: newSize,
      savedBytes: savedBytes,
      savedPercent: savedPercent,
      quality: qualitySettings.quality,
      category: qualitySettings.label,
      hasAlpha: metadata.hasAlpha
    };

  } catch (error) {
    return {
      success: false,
      input: inputPath,
      error: error.message
    };
  }
}

function findPngFiles(dir, excludeFolders = []) {
  let results = [];

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);

      try {
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          if (!excludeFolders.includes(file)) {
            results = results.concat(findPngFiles(filePath, excludeFolders));
          }
        } else if (file.toLowerCase().endsWith('.png')) {
          results.push({ path: filePath, size: stat.size });
        }
      } catch (err) {
        continue;
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }

  return results;
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('='.repeat(70));
  console.log('🔄 PNG TO WEBP CONVERTER - PHASE 2');
  console.log('='.repeat(70));
  console.log('');

  console.log('📋 Configuration:');
  CONFIG.qualityBySize.forEach(range => {
    console.log(`   ${range.label}: ${range.quality}% quality`);
  });
  console.log(`   Min size to convert: ${formatBytes(CONFIG.minSizeToConvert)}`);
  console.log(`   Skip if WebP exists: ${CONFIG.skipIfWebpExists}`);
  console.log(`   Skip test folder: ${CONFIG.skipTestFolder}`);
  console.log('');

  console.log('🔍 Scanning for PNG files...');
  const allPngs = findPngFiles('.', CONFIG.excludeFolders);
  console.log(`   Found ${allPngs.length} PNG files`);
  console.log('');

  if (allPngs.length === 0) {
    console.log('✅ No PNG files to convert!');
    return;
  }

  // Sort by size (largest first for better progress visibility)
  allPngs.sort((a, b) => b.size - a.size);

  // Show preview of categories
  console.log('📊 Files by category:');
  const categoryCount = {};
  allPngs.forEach(png => {
    const category = getQualityForSize(png.size);
    categoryCount[category.label] = (categoryCount[category.label] || 0) + 1;
  });
  CONFIG.qualityBySize.forEach(range => {
    const count = categoryCount[range.label] || 0;
    if (count > 0) {
      console.log(`   ${range.label}: ${count} files`);
    }
  });
  console.log('');

  console.log('🔄 Converting files...');
  console.log('');

  const results = {
    converted: [],
    skipped: [],
    failed: []
  };

  let totalOriginal = 0;
  let totalNew = 0;

  for (let i = 0; i < allPngs.length; i++) {
    const pngFile = allPngs[i];
    const webpFile = pngFile.path.replace(/\.png$/i, '.webp');

    // Truncate long paths for display
    const displayPath = pngFile.path.length > 60
      ? '...' + pngFile.path.substring(pngFile.path.length - 57)
      : pngFile.path;

    process.stdout.write(
      `[${i + 1}/${allPngs.length}] ${displayPath} (${formatBytes(pngFile.size)})...`
    );

    const result = await convertFile(pngFile.path, webpFile, pngFile.size);

    if (result.success) {
      results.converted.push(result);
      totalOriginal += result.originalSize;
      totalNew += result.newSize;
      console.log(` ✅ ${result.savedPercent}% saved (${result.quality}%)${result.hasAlpha ? ' [α]' : ''}`);
    } else if (result.skipped) {
      results.skipped.push(result);
      console.log(` ⏭️  ${result.reason}`);
    } else {
      results.failed.push(result);
      console.log(` ❌ ${result.error}`);
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('');
  console.log('='.repeat(70));
  console.log('📊 CONVERSION SUMMARY - PHASE 2');
  console.log('='.repeat(70));
  console.log('');

  console.log(`Total files processed: ${allPngs.length}`);
  console.log(`✅ Converted: ${results.converted.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('');

  if (results.converted.length > 0) {
    const totalSavedBytes = totalOriginal - totalNew;
    const totalSavedPercent = ((totalSavedBytes / totalOriginal) * 100).toFixed(1);

    console.log(`Original size: ${formatBytes(totalOriginal)}`);
    console.log(`New size: ${formatBytes(totalNew)}`);
    console.log(`💾 Saved: ${formatBytes(totalSavedBytes)} (${totalSavedPercent}%)`);
    console.log('');

    // By category
    const byCategory = {};
    results.converted.forEach(r => {
      if (!byCategory[r.category]) {
        byCategory[r.category] = { count: 0, saved: 0, original: 0 };
      }
      byCategory[r.category].count++;
      byCategory[r.category].saved += r.savedBytes;
      byCategory[r.category].original += r.originalSize;
    });

    console.log('📊 By Category:');
    Object.entries(byCategory).forEach(([cat, data]) => {
      const percent = ((data.saved / data.original) * 100).toFixed(1);
      console.log(`   ${cat}: ${data.count} files, saved ${formatBytes(data.saved)} (${percent}%)`);
    });
    console.log('');

    // Top savings
    results.converted.sort((a, b) => b.savedBytes - a.savedBytes);
    console.log('🏆 Top 20 Space Savings:');
    results.converted.slice(0, 20).forEach((r, i) => {
      const filename = path.basename(r.input);
      console.log(`   ${i + 1}. ${filename}: ${formatBytes(r.savedBytes)} (${r.savedPercent}%)`);
    });
    console.log('');
  }

  // Skipped summary
  if (results.skipped.length > 0) {
    const skipReasons = {};
    results.skipped.forEach(r => {
      skipReasons[r.reason] = (skipReasons[r.reason] || 0) + 1;
    });

    console.log('⏭️  Skipped Files:');
    Object.entries(skipReasons).forEach(([reason, count]) => {
      console.log(`   ${reason}: ${count} files`);
    });
    console.log('');
  }

  // Failed
  if (results.failed.length > 0) {
    console.log('❌ Failed Conversions:');
    results.failed.forEach(r => {
      console.log(`   - ${path.basename(r.input)}: ${r.error}`);
    });
    console.log('');
  }

  // Phase 1 + Phase 2 summary
  const phase1Saved = 8.33; // From Phase 1 report
  const phase2Saved = totalOriginal > 0 ? ((totalOriginal - totalNew) / 1024 / 1024).toFixed(2) : 0;
  const totalSaved = (phase1Saved + parseFloat(phase2Saved)).toFixed(2);
  const totalOriginalSize = 12.41 + (totalOriginal / 1024 / 1024);
  const totalPercent = ((totalSaved / totalOriginalSize) * 100).toFixed(1);

  console.log('🎯 PHASE 1 + 2 COMBINED:');
  console.log(`   Phase 1 saved: 8.33 MB`);
  console.log(`   Phase 2 saved: ${phase2Saved} MB`);
  console.log(`   💾 Total saved: ${totalSaved} MB (${totalPercent}%)`);
  console.log('');

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    phase: 2,
    config: CONFIG,
    summary: {
      totalFiles: allPngs.length,
      converted: results.converted.length,
      skipped: results.skipped.length,
      failed: results.failed.length,
      originalSizeBytes: totalOriginal,
      newSizeBytes: totalNew,
      savedBytes: totalOriginal - totalNew,
      savedPercent: totalOriginal > 0 ? ((totalOriginal - totalNew) / totalOriginal * 100).toFixed(1) : 0
    },
    phase1Plus2: {
      phase1Saved: 8.33,
      phase2Saved: parseFloat(phase2Saved),
      totalSaved: parseFloat(totalSaved),
      totalPercent: parseFloat(totalPercent)
    },
    details: {
      converted: results.converted,
      skipped: results.skipped,
      failed: results.failed
    }
  };

  const reportPath = './webp-conversion-phase2-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved: ${reportPath}`);

  console.log('');
  console.log('='.repeat(70));
  console.log('✅ PHASE 2 CONVERSION COMPLETED');
  console.log('='.repeat(70));
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
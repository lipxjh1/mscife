const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Quality settings
  defaultQuality: 85,

  // Lossless cho UI elements (quality 90-100, near lossless)
  losslessPatterns: [
    /button/i,
    /icon/i,
    /ui/i,
    /logo/i,
    /menu/i,
    /tab/i,
    /card/i,
    /intro/i
  ],
  losslessQuality: 90,

  // Low quality cho backgrounds (quality 75-80)
  lowQualityPatterns: [
    /background/i,
    /bg[_-]/i,
    /backdrop/i,
    /decoration/i,
    /particle/i,
    /vfx/i
  ],
  lowQuality: 75,

  // Folders to process
  includeFolders: ['.'],

  // Folders to skip
  excludeFolders: [
    'node_modules',
    'backup',
    'dist',
    'build',
    '.git',
    'backups'
  ]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Determine quality based on filename
function getQualitySettings(filename) {
  const basename = path.basename(filename).toLowerCase();

  // Check for lossless patterns (UI elements)
  if (CONFIG.losslessPatterns.some(pattern => pattern.test(basename))) {
    return {
      quality: CONFIG.losslessQuality,
      lossless: false, // Use lossy but high quality for smaller size
      nearLossless: true
    };
  }

  // Check for low quality patterns (backgrounds)
  if (CONFIG.lowQualityPatterns.some(pattern => pattern.test(basename))) {
    return {
      quality: CONFIG.lowQuality,
      lossless: false,
      nearLossless: false
    };
  }

  // Default quality
  return {
    quality: CONFIG.defaultQuality,
    lossless: false,
    nearLossless: false
  };
}

// Convert single file
async function convertFile(inputPath, outputPath) {
  try {
    const quality = getQualitySettings(inputPath);

    // Get original file size
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;

    // Convert
    const webpOptions = {
      quality: quality.quality,
      lossless: quality.lossless,
      nearLossless: quality.nearLossless
    };

    await sharp(inputPath)
      .webp(webpOptions)
      .toFile(outputPath);

    // Get new file size
    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const savedBytes = originalSize - newSize;
    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

    return {
      success: true,
      input: inputPath,
      output: outputPath,
      originalSize: originalSize,
      newSize: newSize,
      savedBytes: savedBytes,
      savedPercent: savedPercent,
      quality: quality.quality
    };

  } catch (error) {
    return {
      success: false,
      input: inputPath,
      error: error.message
    };
  }
}

// Find all PNG files recursively
function findPngFiles(dir, excludeFolders = []) {
  let results = [];

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);

      try {
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Skip excluded folders
          if (!excludeFolders.includes(file)) {
            results = results.concat(findPngFiles(filePath, excludeFolders));
          }
        } else if (file.toLowerCase().endsWith('.webp')) {
          // Skip if WebP already exists and is newer
          const webpPath = filePath.replace(/\.png$/i, '.webp');
          if (fs.existsSync(webpPath)) {
            const pngStats = fs.statSync(filePath);
            const webpStats = fs.statSync(webpPath);
            if (webpStats.mtime > pngStats.mtime) {
              console.log(`   Skipping ${path.basename(filePath)} (WebP already newer)`);
              continue;
            }
          }
          results.push(filePath);
        }
      } catch (err) {
        // Skip files we can't access
        continue;
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }

  return results;
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// MAIN CONVERSION FUNCTION
// ============================================
async function main() {
  console.log('='.repeat(70));
  console.log('🔄 PNG TO WEBP CONVERTER');
  console.log('='.repeat(70));
  console.log('');

  console.log('📋 Configuration:');
  console.log(`   Default quality: ${CONFIG.defaultQuality}%`);
  console.log(`   UI elements quality: ${CONFIG.losslessQuality}%`);
  console.log(`   Background quality: ${CONFIG.lowQuality}%`);
  console.log('');

  console.log('🔍 Scanning for PNG files...');
  const allPngs = findPngFiles('.', CONFIG.excludeFolders);
  console.log(`   Found ${allPngs.length} PNG files to convert`);
  console.log('');

  if (allPngs.length === 0) {
    console.log('❌ No PNG files found to convert!');
    console.log('   (Skipping files that already have newer WebP versions)');
    return;
  }

  console.log('🔄 Converting files...');
  console.log('');

  const results = [];
  let successCount = 0;
  let failCount = 0;
  let totalOriginal = 0;
  let totalNew = 0;

  for (let i = 0; i < allPngs.length; i++) {
    const pngFile = allPngs[i];
    const webpFile = pngFile.replace(/\.png$/i, '.webp');

    process.stdout.write(`[${i + 1}/${allPngs.length}] Converting ${path.basename(pngFile)}...`);

    const result = await convertFile(pngFile, webpFile);
    results.push(result);

    if (result.success) {
      successCount++;
      totalOriginal += result.originalSize;
      totalNew += result.newSize;

      const saved = formatBytes(result.savedBytes);
      console.log(` ✅ (${result.savedPercent}% saved, ${saved}, Q:${result.quality}%)`);
    } else {
      failCount++;
      console.log(` ❌ Error: ${result.error}`);
    }
  }

  // ============================================
  // SUMMARY REPORT
  // ============================================
  console.log('');
  console.log('='.repeat(70));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(70));
  console.log('');

  const totalSavedBytes = totalOriginal - totalNew;
  const totalSavedPercent = totalOriginal > 0
    ? ((totalSavedBytes / totalOriginal) * 100).toFixed(1)
    : 0;

  console.log(`Total files processed: ${allPngs.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('');
  console.log(`Original total size: ${formatBytes(totalOriginal)}`);
  console.log(`New total size: ${formatBytes(totalNew)}`);
  console.log(`💾 Total saved: ${formatBytes(totalSavedBytes)} (${totalSavedPercent}%)`);
  console.log('');

  // Top savings
  const successResults = results.filter(r => r.success);
  if (successResults.length > 0) {
    successResults.sort((a, b) => b.savedBytes - a.savedBytes);
    console.log('🏆 Top 10 Space Savings:');
    successResults.slice(0, 10).forEach((r, i) => {
      const filename = path.basename(r.input);
      const saved = formatBytes(r.savedBytes);
      console.log(`   ${i + 1}. ${filename}: ${saved} (${r.savedPercent}%)`);
    });
    console.log('');
  }

  // Failed conversions
  if (failCount > 0) {
    console.log('❌ Failed Conversions:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${path.basename(r.input)}: ${r.error}`);
    });
    console.log('');
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    summary: {
      totalFiles: allPngs.length,
      successful: successCount,
      failed: failCount,
      originalSizeBytes: totalOriginal,
      newSizeBytes: totalNew,
      savedBytes: totalSavedBytes,
      savedPercent: totalSavedPercent
    },
    details: results
  };

  const reportPath = './webp-conversion-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved: ${reportPath}`);

  console.log('');
  console.log('='.repeat(70));
  console.log('✅ CONVERSION COMPLETED');
  console.log('='.repeat(70));
}

// ============================================
// RUN
// ============================================
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
import fs from 'fs';
import path from 'path';

function analyzeBundle() {
  console.log('=== Bundle Size Analysis ===');

  if (!fs.existsSync('./dist')) {
    console.log('❌ dist folder not found. Run "npm run build" first.');
    return;
  }

  const stats = {
    js: { count: 0, size: 0, files: [] },
    css: { count: 0, size: 0, files: [] },
    images: { count: 0, size: 0, files: [], },
    webp: { count: 0, size: 0, files: [] },
    png: { count: 0, size: 0, files: [] },
    other: { count: 0, size: 0, files: [] }
  };

  function scanDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        scanDir(fullPath);
      } else {
        const fileStats = fs.statSync(fullPath);
        const sizeKB = fileStats.size / 1024;
        const sizeMB = sizeKB / 1024;

        const fileInfo = {
          path: fullPath.replace('./dist/', ''),
          size: fileStats.size,
          sizeKB: sizeKB.toFixed(2),
          sizeMB: sizeMB.toFixed(2)
        };

        if (file.name.endsWith('.js')) {
          stats.js.count++;
          stats.js.size += fileStats.size;
          stats.js.files.push(fileInfo);
        } else if (file.name.endsWith('.css')) {
          stats.css.count++;
          stats.css.size += fileStats.size;
          stats.css.files.push(fileInfo);
        } else if (file.name.endsWith('.webp')) {
          stats.webp.count++;
          stats.webp.size += fileStats.size;
          stats.images.count++;
          stats.images.size += fileStats.size;
          stats.images.files.push(fileInfo);
        } else if (file.name.endsWith('.png')) {
          stats.png.count++;
          stats.png.size += fileStats.size;
          stats.images.count++;
          stats.images.size += fileStats.size;
          stats.images.files.push(fileInfo);
        } else if (file.name.match(/\.(jpg|jpeg|gif|svg)$/i)) {
          stats.images.count++;
          stats.images.size += fileStats.size;
          stats.images.files.push(fileInfo);
        } else {
          stats.other.count++;
          stats.other.size += fileStats.size;
        }
      }
    }
  }

  scanDir('./dist');

  // Calculate totals
  const totalSize = Object.values(stats).reduce((sum, cat) => sum + cat.size, 0);

  // Print results
  console.log('📦 BUNDLE SIZE BREAKDOWN:\n');
  console.log(`JavaScript:`);
  console.log(`  Files: ${stats.js.count}`);
  console.log(`  Size: ${(stats.js.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Percentage: ${((stats.js.size / totalSize) * 100).toFixed(1)}%`);

  console.log(`\nCSS:`);
  console.log(`  Files: ${stats.css.count}`);
  console.log(`  Size: ${(stats.css.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Percentage: ${((stats.css.size / totalSize) * 100).toFixed(1)}%`);

  console.log(`\nImages (Total):`);
  console.log(`  Files: ${stats.images.count}`);
  console.log(`  Size: ${(stats.images.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Percentage: ${((stats.images.size / totalSize) * 100).toFixed(1)}%`);

  console.log(`\n  → WebP:`);
  console.log(`    Files: ${stats.webp.count}`);
  console.log(`    Size: ${(stats.webp.size / 1024 / 1024).toFixed(2)} MB`);

  console.log(`\n  → PNG:`);
  console.log(`    Files: ${stats.png.count}`);
  console.log(`    Size: ${(stats.png.size / 1024 / 1024).toFixed(2)} MB`);

  console.log(`\n📊 TOTAL: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  // Top 10 largest files
  console.log('\n\n🔝 TOP 10 LARGEST FILES:\n');
  const allFiles = [
    ...stats.js.files,
    ...stats.css.files,
    ...stats.images.files
  ].sort((a, b) => b.size - a.size).slice(0, 10);

  allFiles.forEach((file, i) => {
    console.log(`${i + 1}. ${file.path}`);
    console.log(`   ${file.sizeMB} MB (${file.sizeKB} KB)\n`);
  });

  // Issues
  console.log('\n⚠️  POTENTIAL ISSUES:\n');

  if (stats.png.count > 0) {
    console.log(`❌ Found ${stats.png.count} PNG files in build (${(stats.png.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log('   → Should convert to WebP\n');
  }

  if (stats.js.size > 3 * 1024 * 1024) {
    console.log(`⚠️  Large JS bundle: ${(stats.js.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('   → Consider code splitting\n');
  }

  const largeImages = stats.images.files.filter(f => f.size > 500 * 1024);
  if (largeImages.length > 0) {
    console.log(`⚠️  ${largeImages.length} images > 500KB:`);
    largeImages.forEach(img => {
      console.log(`   - ${img.path} (${img.sizeMB} MB)`);
    });
    console.log('');
  }

  // Save report
  fs.writeFileSync('bundle-analysis-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    totalSize: (totalSize / 1024 / 1024).toFixed(2) + ' MB',
    breakdown: {
      js: {
        count: stats.js.count,
        size: (stats.js.size / 1024 / 1024).toFixed(2) + ' MB',
        percentage: ((stats.js.size / totalSize) * 100).toFixed(1) + '%'
      },
      css: {
        count: stats.css.count,
        size: (stats.css.size / 1024 / 1024).toFixed(2) + ' MB',
        percentage: ((stats.css.size / totalSize) * 100).toFixed(1) + '%'
      },
      images: {
        total: {
          count: stats.images.count,
          size: (stats.images.size / 1024 / 1024).toFixed(2) + ' MB',
          percentage: ((stats.images.size / totalSize) * 100).toFixed(1) + '%'
        },
        webp: {
          count: stats.webp.count,
          size: (stats.webp.size / 1024 / 1024).toFixed(2) + ' MB'
        },
        png: {
          count: stats.png.count,
          size: (stats.png.size / 1024 / 1024).toFixed(2) + ' MB'
        }
      }
    },
    topFiles: allFiles,
    issues: {
      pngInBuild: stats.png.count > 0,
      largeJsBundle: stats.js.size > 3 * 1024 * 1024,
      largeImages: largeImages.length
    }
  }, null, 2));

  console.log('Detailed report saved to: bundle-analysis-report.json\n');
}

analyzeBundle().catch(console.error);
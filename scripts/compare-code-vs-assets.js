import fs from 'fs';
import path from 'path';

function compareCodeVsAssets() {
  console.log('=== Code vs Assets Comparison ===\n');

  // Get all PNG/WebP files in assets
  const assetFiles = {
    png: new Set(),
    webp: new Set()
  };

  function scanAssets(dir) {
    if (!fs.existsSync(dir)) {
      console.log(`❌ Directory not found: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        scanAssets(fullPath);
      } else if (file.name.endsWith('.png')) {
        assetFiles.png.add(fullPath);
      } else if (file.name.endsWith('.webp')) {
        assetFiles.webp.add(fullPath);
      }
    }
  }

  scanAssets('./public/assets');

  console.log(`Assets found:`);
  console.log(`  PNG files: ${assetFiles.png.size}`);
  console.log(`  WebP files: ${assetFiles.webp.size}\n`);

  // Get code references
  let codeReferences = { png: [], webp: [] };

  try {
    const report = JSON.parse(fs.readFileSync('image-usage-report.json', 'utf8'));
    codeReferences.png = report.pngReferences.map(r => r.path);
    codeReferences.webp = report.webpReferences.map(r => r.path);
  } catch (err) {
    console.log('⚠️  Run analyze-image-usage.js first!');
    return;
  }

  console.log(`Code references:`);
  console.log(`  PNG refs: ${codeReferences.png.length}`);
  console.log(`  WebP refs: ${codeReferences.webp.length}\n`);

  // Find PNG files that have WebP version but still referenced as PNG in code
  const needUpdate = [];

  assetFiles.png.forEach(pngPath => {
    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    const relativePng = pngPath.replace('./public/', '');

    if (assetFiles.webp.has(webpPath)) {
      // Has WebP version
      // Check if code still uses PNG
      const usedInCode = codeReferences.png.some(ref =>
        ref.includes(path.basename(pngPath, '.png'))
      );

      if (usedInCode) {
        needUpdate.push({
          png: pngPath,
          webp: webpPath,
          basename: path.basename(pngPath)
        });
      }
    }
  });

  console.log('=== FILES NEEDING CODE UPDATE ===\n');
  console.log(`Found ${needUpdate.length} PNG files with WebP version but still used in code:\n`);

  if (needUpdate.length > 0) {
    needUpdate.forEach((item, i) => {
      console.log(`${i + 1}. ${item.basename}`);
      console.log(`   PNG: ${item.png}`);
      console.log(`   WebP: ${item.webp}`);
      console.log(`   → Need to update code to use .webp\n`);
    });
  } else {
    console.log('✅ All code references are optimized!');
  }

  // Find unused PNG files (have WebP, not in code)
  const unusedPng = [];

  assetFiles.png.forEach(pngPath => {
    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    const basename = path.basename(pngPath, '.png');

    if (assetFiles.webp.has(webpPath)) {
      const usedInCode = codeReferences.png.some(ref => ref.includes(basename)) ||
                        codeReferences.webp.some(ref => ref.includes(basename));

      if (!usedInCode) {
        unusedPng.push(pngPath);
      }
    }
  });

  console.log('\n=== UNUSED PNG FILES (Can Delete) ===\n');
  console.log(`Found ${unusedPng.length} PNG files that can be safely deleted:\n`);

  if (unusedPng.length > 0) {
    let totalSize = 0;
    unusedPng.slice(0, 20).forEach(file => {
      const stats = fs.statSync(file);
      totalSize += stats.size;
      console.log(`  ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });

    if (unusedPng.length > 20) {
      console.log(`  ... and ${unusedPng.length - 20} more files`);
    }

    console.log(`\n  Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log('✅ No unused PNG files found!');
  }

  // Additional analysis: check for files without WebP versions
  const missingWebp = [];

  assetFiles.png.forEach(pngPath => {
    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    if (!assetFiles.webp.has(webpPath)) {
      const basename = path.basename(pngPath);
      const usedInCode = codeReferences.png.some(ref => ref.includes(basename)) ||
                        codeReferences.webp.some(ref => ref.includes(basename));

      if (usedInCode) {
        missingWebp.push({
          png: pngPath,
          needed: webpPath,
          basename: basename
        });
      }
    }
  });

  if (missingWebp.length > 0) {
    console.log('\n=== PNG FILES MISSING WEBP VERSION ===\n');
    console.log(`Found ${missingWebp.length} PNG files that need WebP version:\n`);
    missingWebp.forEach((item, i) => {
      const stats = fs.statSync(item.png);
      console.log(`${i + 1}. ${item.basename} (${(stats.size / 1024).toFixed(2)} KB)`);
      console.log(`   → Need to convert to WebP`);
    });
  }

  // Save report
  const reportData = {
    timestamp: new Date().toISOString(),
    assets: {
      png: assetFiles.png.size,
      webp: assetFiles.webp.size
    },
    codeReferences: {
      png: codeReferences.png.length,
      webp: codeReferences.webp.length
    },
    needUpdate: needUpdate,
    unusedPng: unusedPng,
    missingWebp: missingWebp,
    potentialSavings: unusedPng.reduce((sum, file) => {
      return sum + fs.statSync(file).size;
    }, 0) / 1024 / 1024
  };

  try {
    fs.writeFileSync('code-vs-assets-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n✅ Detailed report saved to: code-vs-assets-report.json');
  } catch (error) {
    console.log(`\n❌ Error saving report: ${error.message}`);
  }

  return reportData;
}

compareCodeVsAssets();
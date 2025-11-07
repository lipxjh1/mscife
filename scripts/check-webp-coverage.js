import fs from 'fs';
import path from 'path';

async function checkWebPCoverage() {
  console.log('=== WebP Coverage Check ===');

  const pngFiles = [];
  const missingWebP = [];
  const hasWebP = [];

  function findPngFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        findPngFiles(fullPath);
      } else if (file.name.toLowerCase().endsWith('.webp')) {
        pngFiles.push(fullPath);

        // Check if corresponding WebP exists
        const webpPath = fullPath.replace(/\.png$/i, '.webp');
        if (fs.existsSync(webpPath)) {
          hasWebP.push({ png: fullPath, webp: webpPath });
        } else {
          missingWebP.push(fullPath);
        }
      }
    }
  }

  // Scan public folder
  if (fs.existsSync('./public')) {
    findPngFiles('./public');
  }

  console.log(`Total PNG files: ${pngFiles.length}`);
  console.log(`Has WebP: ${hasWebP.length}`);
  console.log(`Missing WebP: ${missingWebP.length}\n`);

  if (missingWebP.length > 0) {
    console.log('⚠️  PNG FILES WITHOUT WebP:\n');
    missingWebP.forEach(file => {
      const stats = fs.statSync(file);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ${file} (${sizeKB} KB)`);
    });
  } else {
    console.log('✅ All PNG files have corresponding WebP files!');
  }

  // Calculate coverage
  const coverage = ((hasWebP.length / pngFiles.length) * 100).toFixed(1);
  console.log(`\nWebP Coverage: ${coverage}%`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    totalPng: pngFiles.length,
    hasWebP: hasWebP.length,
    missingWebP: missingWebP.length,
    coverage: coverage + '%',
    missingFiles: missingWebP,
    convertedFiles: hasWebP
  };

  fs.writeFileSync('webp-coverage-report.json', JSON.stringify(report, null, 2));
  console.log('\nDetailed report saved to: webp-coverage-report.json');
}

checkWebPCoverage().catch(console.error);
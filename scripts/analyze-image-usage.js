import fs from 'fs';
import path from 'path';

function analyzeImageUsage() {
  console.log('=== Image Usage Analysis ===\n');

  const results = {
    pngReferences: [],
    webpReferences: [],
    files: {}
  };

  // Scan source code
  function scanCode(dir) {
    if (!fs.existsSync(dir)) {
      console.log(`❌ Directory not found: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory() && !file.name.includes('node_modules') && !file.name.includes('dist')) {
        scanCode(fullPath);
      } else if (file.name.match(/\.(js|jsx|ts|tsx)$/)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmedLine = line.trim();

            // Skip comments
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
              return;
            }

            // Find .webp references
            if (line.includes('.webp')) {
              const matches = line.match(/['"`]([^'"`]*\.webp)["`']/g);
              if (matches) {
                matches.forEach(match => {
                  const cleanMatch = match.replace(/['"`]/g, '');
                  results.pngReferences.push({
                    file: fullPath,
                    line: lineNum,
                    path: cleanMatch,
                    code: trimmedLine.substring(0, 100)
                  });
                });
              }
            }

            // Find .webp references
            if (line.includes('.webp')) {
              const matches = line.match(/['"`]([^'"`]*\.webp)["`']/g);
              if (matches) {
                matches.forEach(match => {
                  const cleanMatch = match.replace(/['"`]/g, '');
                  results.webpReferences.push({
                    file: fullPath,
                    line: lineNum,
                    path: cleanMatch,
                    code: trimmedLine.substring(0, 100)
                  });
                });
              }
            }
          });
        } catch (error) {
          console.log(`Warning: Could not read ${fullPath}: ${error.message}`);
        }
      }
    }
  }

  scanCode('./src');

  console.log(`PNG references: ${results.pngReferences.length}`);
  console.log(`WebP references: ${results.webpReferences.length}\n`);

  // Group by file
  results.pngReferences.forEach(ref => {
    if (!results.files[ref.file]) {
      results.files[ref.file] = { png: [], webp: [] };
    }
    results.files[ref.file].png.push(ref);
  });

  results.webpReferences.forEach(ref => {
    if (!results.files[ref.file]) {
      results.files[ref.file] = { png: [], webp: [] };
    }
    results.files[ref.file].webp.push(ref);
  });

  // Print results by file
  console.log('=== RESULTS BY FILE ===\n');

  Object.entries(results.files).forEach(([file, refs]) => {
    const shortPath = file.replace('./src/', 'src/');
    console.log(`📁 ${shortPath}`);

    if (refs.png.length > 0) {
      console.log(`  ❌ PNG references: ${refs.png.length}`);
      refs.png.slice(0, 5).forEach(ref => {
        console.log(`     Line ${ref.line}: ${ref.path}`);
      });
      if (refs.png.length > 5) {
        console.log(`     ... and ${refs.png.length - 5} more`);
      }
    }

    if (refs.webp.length > 0) {
      console.log(`  ✅ WebP references: ${refs.webp.length}`);
      refs.webp.slice(0, 5).forEach(ref => {
        console.log(`     Line ${ref.line}: ${ref.path}`);
      });
      if (refs.webp.length > 5) {
        console.log(`     ... and ${refs.webp.length - 5} more`);
      }
    }

    console.log('');
  });

  // Summary
  console.log('=== SUMMARY ===\n');

  const filesWithPng = Object.values(results.files).filter(f => f.png.length > 0).length;
  const filesWithWebp = Object.values(results.files).filter(f => f.webp.length > 0).length;

  console.log(`Files using PNG: ${filesWithPng}`);
  console.log(`Files using WebP: ${filesWithWebp}`);
  console.log(`Total PNG refs: ${results.pngReferences.length}`);
  console.log(`Total WebP refs: ${results.webpReferences.length}`);

  // Optimization status
  const totalRefs = results.pngReferences.length + results.webpReferences.length;
  const optimizationRate = totalRefs > 0 ? (results.webpReferences.length / totalRefs) * 100 : 100;

  console.log(`\nOptimization rate: ${optimizationRate.toFixed(1)}%`);

  if (optimizationRate >= 95) {
    console.log('✅ EXCELLENT: Code is highly optimized!');
  } else if (optimizationRate >= 80) {
    console.log('✅ GOOD: Most code uses WebP');
  } else if (optimizationRate >= 50) {
    console.log('⚠️  PARTIAL: About half optimized');
  } else {
    console.log('❌ POOR: Most code still uses PNG');
  }

  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      pngReferences: results.pngReferences.length,
      webpReferences: results.webpReferences.length,
      filesWithPng: filesWithPng,
      filesWithWebp: filesWithWebp,
      optimizationRate: optimizationRate.toFixed(1) + '%'
    },
    pngReferences: results.pngReferences,
    webpReferences: results.webpReferences,
    byFile: results.files
  };

  try {
    fs.writeFileSync('image-usage-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n✅ Detailed report saved to: image-usage-report.json');
  } catch (error) {
    console.log(`\n❌ Error saving report: ${error.message}`);
  }

  return reportData;
}

analyzeImageUsage();
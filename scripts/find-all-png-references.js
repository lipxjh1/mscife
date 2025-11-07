import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findPngReferences(dir, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      findPngReferences(fullPath, results);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (line.includes('.webp') && !line.trim().startsWith('//')) {
            results.push({
              file: fullPath,
              line: index + 1,
              content: line.trim()
            });
          }
        });
      } catch (error) {
        console.log(`Warning: Could not read ${fullPath}: ${error.message}`);
      }
    }
  }

  return results;
}

function searchAllFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const results = {
    scanned: 0,
    found: 0,
    files: [],
    filesFound: []
  };

  function scan(currentDir) {
    const files = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(currentDir, file.name);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.name.includes('node_modules')) {
        scan(fullPath);
      } else if (extensions.some(ext => file.name.endsWith(ext))) {
        results.scanned++;
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          let foundInFile = false;

          lines.forEach((line, index) => {
            if (line.includes('.webp') && !line.trim().startsWith('//')) {
              results.found++;
              foundInFile = true;
              results.files.push({
                file: fullPath,
                line: index + 1,
                content: line.trim().substring(0, 100)
              });
            }
          });

          if (foundInFile) {
            if (!results.filesFound) results.filesFound = [];
            results.filesFound.push(fullPath);
          }

        } catch (error) {
          console.log(`Warning: Could not read ${fullPath}: ${error.message}`);
        }
      }
    }
  }

  return results;
}

console.log('=== Comprehensive PNG References Scan ===\n');
console.log('🔍 Scanning all source files for .webp references...\n');

const srcDir = './src';
const allResults = searchAllFiles(srcDir);

console.log(`\n=== SCAN RESULTS ===`);
console.log(`Files scanned: ${allResults.scanned}`);
console.log(`Files with .webp references: ${allResults.found}`);
console.log(`Source files containing .png: ${allResults.filesFound.length}`);

if (allResults.found > 0) {
  console.log('\n📝 PNG REFERENCES FOUND IN SOURCE CODE:\n');

  // Group by file
  const byFile = {};
  allResults.files.forEach(ref => {
    if (!byFile[ref.file]) byFile[ref.file] = [];
    byFile[ref.file].push(ref);
  });

  Object.entries(byFile).forEach(([file, refs]) => {
    console.log(`📁 ${file} (${refs.length} references):`);
    refs.forEach((ref, i) => {
      console.log(`  Line ${ref.line}: ${ref.content.substring(0, 80)}...`);
      if (i < 2) { // Only show first 2 references per file
        console.log('');
      }
    });
    console.log('');
  });

  // List all files with PNG references
  console.log('\n📋 FILES CONTAINING PNG REFERENCES:\n');
  allResults.filesFound.forEach(file => {
    console.log(`  ${file}`);
  });

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    scanResults: allResults,
    summary: {
      totalScanned: allResults.scanned,
      totalFound: allResults.found,
      filesWithReferences: allResults.filesFound.length
    }
  };

  fs.writeFileSync('all-png-references-report.json', JSON.stringify(report, null, 2));

  console.log('\n✅ Detailed report saved to: all-png-references-report.json');
} else {
  console.log('✅ NO PNG REFERENCES FOUND IN SOURCE CODE!');
}

console.log('\n📊 FINAL ASSESSMENT:');
console.log(`🎯 Recommendation: Convert remaining ${75 - allResults.found} PNG files to WebP`);
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findPngReferences(dir, results = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      findPngReferences(fullPath, results);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
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
    }
  }

  return results;
}

console.log('=== Scanning for .webp references in code ===');

const srcResults = findPngReferences('./src');

console.log(`Found ${srcResults.length} .webp references in src/\n`);

if (srcResults.length > 0) {
  console.log('PNG REFERENCES FOUND:\n');

  // Group by file
  const byFile = {};
  srcResults.forEach(ref => {
    if (!byFile[ref.file]) byFile[ref.file] = [];
    byFile[ref.file].push(ref);
  });

  Object.entries(byFile).forEach(([file, refs]) => {
    console.log(`📁 ${file} (${refs.length} references):`);
    refs.forEach(ref => {
      console.log(`   Line ${ref.line}: ${ref.content.substring(0, 80)}...`);
    });
    console.log('');
  });

  // Save report
  fs.writeFileSync('png-references-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    total: srcResults.length,
    byFile: byFile
  }, null, 2));

  console.log('Detailed report saved to: png-references-report.json');
} else {
  console.log('✅ No .webp references found in code!');
}
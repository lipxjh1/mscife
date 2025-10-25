import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertPngToWebp(inputPath, quality = 80) {
  const outputPath = inputPath.replace(/\.png$/i, '.webp');

  console.log(`Converting: ${inputPath}`);

  try {
    await sharp(inputPath)
      .webp({ quality, effort: 6 })
      .toFile(outputPath);

    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`✓ Saved ${reduction}% (${(inputStats.size / 1024 / 1024).toFixed(2)}MB → ${(outputStats.size / 1024 / 1024).toFixed(2)}MB)`);

    return { inputPath, outputPath, reduction, inputSize: inputStats.size, outputSize: outputStats.size };
  } catch (error) {
    console.error(`✗ Error converting ${inputPath}:`, error.message);
    return null;
  }
}

async function findPngFiles(dir, minSize = 100 * 1024) { // 100KB minimum
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
        const stats = await fs.stat(fullPath);
        if (stats.size >= minSize) {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(dir);
  return files;
}

async function main() {
  const assetsDir = process.argv[2] || './public/assets';
  const quality = parseInt(process.argv[3]) || 80;
  const minSize = parseInt(process.argv[4]) || 500; // KB

  console.log('=== PNG to WebP Converter ===');
  console.log(`Directory: ${assetsDir}`);
  console.log(`Quality: ${quality}%`);
  console.log(`Min size: ${minSize}KB`);
  console.log('');

  const pngFiles = await findPngFiles(assetsDir, minSize * 1024);
  console.log(`Found ${pngFiles.length} PNG files > ${minSize}KB\n`);

  const results = [];
  for (const file of pngFiles) {
    const result = await convertPngToWebp(file, quality);
    if (result) results.push(result);
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total files converted: ${results.length}`);
  const totalInput = results.reduce((sum, r) => sum + r.inputSize, 0);
  const totalOutput = results.reduce((sum, r) => sum + r.outputSize, 0);
  const totalReduction = ((1 - totalOutput / totalInput) * 100).toFixed(1);
  console.log(`Total size: ${(totalInput / 1024 / 1024).toFixed(2)}MB → ${(totalOutput / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Total saved: ${totalReduction}% (${((totalInput - totalOutput) / 1024 / 1024).toFixed(2)}MB)`);

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    quality,
    minSize,
    totalFiles: results.length,
    totalSavings: totalReduction + '%',
    files: results
  };

  await fs.writeFile('webp-conversion-report.json', JSON.stringify(report, null, 2));
  console.log('\nReport saved to: webp-conversion-report.json');
}

main().catch(console.error);
import { promises as fs } from 'fs';
import path from 'path';

// Script to update .atlas files to reference .webp instead of .webp
// Only updates files where a corresponding .webp file exists

async function findAtlasFiles(dir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.atlas')) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

async function updateAtlasFile(atlasPath) {
  try {
    // Read atlas file
    const content = await fs.readFile(atlasPath, 'utf8');
    const lines = content.split('\n');
    
    // First line usually contains the texture filename
    const firstLine = lines[0].trim();
    
    if (!firstLine.toLowerCase().endsWith('.webp')) {
      console.log(`⏭️  Skipped (not PNG): ${atlasPath} - first line: "${firstLine}"`);
      return null;
    }
    
    // Check if corresponding .webp file exists
    const atlasDir = path.dirname(atlasPath);
    const pngName = firstLine.trim();
    const webpName = pngName.replace(/\.png$/i, '.webp');
    const webpPath = path.join(atlasDir, webpName);
    
    try {
      await fs.access(webpPath);
    } catch (error) {
      console.log(`⏭️  Skipped (no WebP): ${atlasPath} -> ${webpName}`);
      return null;
    }
    
    // Update first line to reference .webp
    lines[0] = webpName;
    const newContent = lines.join('\n');
    
    // Write updated content
    await fs.writeFile(atlasPath, newContent, 'utf8');
    
    console.log(`✅ Updated: ${path.basename(atlasPath)}`);
    console.log(`   ${pngName} → ${webpName}`);
    
    return { atlasPath, oldTexture: pngName, newTexture: webpName };
    
  } catch (error) {
    console.error(`❌ Error updating ${atlasPath}:`, error.message);
    return null;
  }
}

async function main() {
  const assetsDir = process.argv[2] || './public/assets';
  
  console.log('=== Atlas to WebP Updater ===');
  console.log(`Directory: ${assetsDir}`);
  console.log('');
  
  console.log('🔍 Scanning for .atlas files...\n');
  const atlasFiles = await findAtlasFiles(assetsDir);
  console.log(`📁 Found ${atlasFiles.length} .atlas files\n`);
  
  if (atlasFiles.length === 0) {
    console.log('No .atlas files found.');
    return;
  }
  
  console.log('🔄 Updating atlas files...\n');
  
  const results = [];
  for (const file of atlasFiles) {
    const result = await updateAtlasFile(file);
    if (result) results.push(result);
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Total atlas files: ${atlasFiles.length}`);
  console.log(`   Updated: ${results.length}`);
  console.log(`   Skipped: ${atlasFiles.length - results.length}`);
  
  // Save report
  if (results.length > 0) {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: atlasFiles.length,
      updatedFiles: results.length,
      files: results
    };
    
    await fs.writeFile('atlas-webp-update-report.json', JSON.stringify(report, null, 2));
    console.log('\nReport saved to: atlas-webp-update-report.json');
  }
  
  console.log('\n✅ Done!');
}

main().catch(console.error);

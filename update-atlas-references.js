import { promises as fs } from 'fs';
import path from 'path';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // File extensions to process
  extensions: ['.atlas'],

  // Folders to exclude
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
// FUNCTIONS
// ============================================

// Find files to update
async function findFiles(dir, extensions, excludeFolders = []) {
  let results = [];

  try {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);

      try {
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          if (!excludeFolders.includes(file)) {
            results = results.concat(await findFiles(filePath, extensions, excludeFolders));
          }
        } else {
          const ext = path.extname(file);
          if (extensions.includes(ext)) {
            results.push(filePath);
          }
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

// Update file content
async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;

    // Count occurrences before
    const beforeCount = (content.match(/\.png(\s|$)/g) || []).length;

    if (beforeCount === 0) {
      return { updated: false, changes: 0 };
    }

    // Replace .webp with .webp only at the end of the line or before whitespace
    content = content.replace(/\.png(\s|$)/g, '.webp$1');

    // Count changes
    const afterCount = (content.match(/\.png(\s|$)/g) || []).length;
    const changes = beforeCount - afterCount;

    if (content !== original && changes > 0) {
      await fs.writeFile(filePath, content, 'utf8');
      return { updated: true, changes: changes };
    }

    return { updated: false, changes: 0 };

  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return { updated: false, changes: 0, error: error.message };
  }
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('='.repeat(70));
  console.log('🔄 UPDATE PNG REFERENCES TO WEBP IN ATLAS FILES');
  console.log('='.repeat(70));
  console.log('');

  console.log('🔍 Finding atlas files to update...');
  const files = await findFiles('.', CONFIG.extensions, CONFIG.excludeFolders);
  console.log(`   Found ${files.length} atlas files to check`);
  console.log('');

  if (files.length === 0) {
    console.log('❌ No atlas files found!');
    return;
  }

  console.log('🔄 Updating references...');
  console.log('');

  let updatedCount = 0;
  let totalChanges = 0;
  const updatedFiles = [];

  for (const file of files) {
    const result = await updateFile(file);

    if (result.updated) {
      updatedCount++;
      totalChanges += result.changes;
      updatedFiles.push({
        file: file,
        changes: result.changes
      });
      console.log(`✅ ${file}: ${result.changes} references updated`);
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('');
  console.log('='.repeat(70));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Total files checked: ${files.length}`);
  console.log(`✅ Files updated: ${updatedCount}`);
  console.log(`📝 Total references changed: ${totalChanges}`);
  console.log('');

  if (updatedFiles.length > 0) {
    console.log('📄 Updated files:');
    updatedFiles.forEach(f => {
      console.log(`   - ${f.file} (${f.changes} changes)`);
    });
    console.log('');
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      filesChecked: files.length,
      filesUpdated: updatedCount,
      totalChanges: totalChanges
    },
    updatedFiles: updatedFiles
  };

  const reportPath = './atlas-update-report.json';
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved: ${reportPath}`);

  console.log('');
  console.log('='.repeat(70));
  console.log('✅ ATLAS REFERENCES UPDATE COMPLETED');
  console.log('='.repeat(70));
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
const fs = require('fs');
const path = require('path');

const CONFIG = {
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.atlas', '.json', '.csv'],
  excludeFolders: ['node_modules', 'backup', 'backups', 'dist', 'build', '.git'],
  dryRun: false // Set to true to preview changes without writing
};

function findFiles(dir, extensions, excludeFolders = []) {
  let results = [];

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);

      try {
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          if (!excludeFolders.includes(file)) {
            results = results.concat(findFiles(filePath, extensions, excludeFolders));
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

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Count before
    const pngMatches = content.match(/\.png(['"`)\s,])/g) || [];
    const beforeCount = pngMatches.length;

    if (beforeCount === 0) {
      return { updated: false, changes: 0 };
    }

    // Skip certain files
    if (filePath.includes('report.json') ||
        filePath.includes('bundle-analysis') ||
        filePath.includes('code-vs-assets') ||
        filePath.includes('webp-conversion') ||
        filePath.includes('png_refs') ||
        filePath.includes('atlas-update')) {
      return { updated: false, changes: 0, skipped: 'Report file' };
    }

    // Replace patterns
    content = content.replace(/\.png(['"`])/g, '.webp$1');
    content = content.replace(/\.png\)/g, '.webp)');
    content = content.replace(/\.png(\s)/g, '.webp$1');
    content = content.replace(/\.png,/g, '.webp,');

    // Count after
    const afterMatches = content.match(/\.png(['"`)\s,])/g) || [];
    const afterCount = afterMatches.length;
    const changes = beforeCount - afterCount;

    if (content !== original && changes > 0) {
      if (!CONFIG.dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      return {
        updated: true,
        changes: changes,
        remaining: afterCount
      };
    }

    return { updated: false, changes: 0, remaining: afterCount };

  } catch (error) {
    return {
      updated: false,
      changes: 0,
      error: error.message
    };
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔄 UPDATE ALL PNG REFERENCES - PHASE 2');
  console.log('='.repeat(70));
  console.log('');

  if (CONFIG.dryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be modified');
    console.log('');
  }

  console.log('🔍 Finding files...');
  const files = findFiles('.', CONFIG.extensions, CONFIG.excludeFolders);
  console.log(`   Found ${files.length} files to check`);
  console.log('');

  console.log('🔄 Updating references...');
  console.log('');

  const results = {
    updated: [],
    unchanged: [],
    skipped: [],
    withRemaining: [],
    errors: []
  };

  let totalChanges = 0;
  let totalRemaining = 0;

  for (const file of files) {
    const result = updateFile(file);

    if (result.error) {
      results.errors.push({ file, error: result.error });
      console.log(`❌ ${file}: Error`);
    } else if (result.skipped) {
      results.skipped.push({ file, reason: result.skipped });
    } else if (result.updated) {
      results.updated.push({ file, changes: result.changes, remaining: result.remaining });
      totalChanges += result.changes;
      totalRemaining += result.remaining;
      console.log(`✅ ${file}: ${result.changes} updated${result.remaining > 0 ? `, ${result.remaining} remaining` : ''}`);

      if (result.remaining > 0) {
        results.withRemaining.push({ file, remaining: result.remaining });
      }
    } else if (result.remaining > 0) {
      results.withRemaining.push({ file, remaining: result.remaining });
      totalRemaining += result.remaining;
    } else {
      results.unchanged.push(file);
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

  console.log(`Files checked: ${files.length}`);
  console.log(`✅ Files updated: ${results.updated.length}`);
  console.log(`📝 Total changes: ${totalChanges}`);
  console.log(`⚠️  Files with remaining .png: ${results.withRemaining.length}`);
  console.log(`📄 Unchanged files: ${results.unchanged.length}`);
  console.log(`📋 Skipped files: ${results.skipped.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  console.log('');

  if (results.updated.length > 0) {
    console.log('📄 Updated Files:');
    results.updated.forEach(r => {
      console.log(`   - ${r.file} (${r.changes} changes)`);
    });
    console.log('');
  }

  if (results.skipped.length > 0) {
    console.log('📋 Skipped Files:');
    results.skipped.forEach(r => {
      console.log(`   - ${r.file} (${r.reason})`);
    });
    console.log('');
  }

  if (results.withRemaining.length > 0) {
    console.log('⚠️  Files Still Containing .png References:');
    results.withRemaining.forEach(r => {
      console.log(`   - ${r.file} (${r.remaining} remaining)`);
    });
    console.log('');
    console.log('💡 These may be:');
    console.log('   - Comments or documentation');
    console.log('   - Dynamic paths that need manual review');
    console.log('   - Conditional logic');
    console.log('');
  }

  if (results.errors.length > 0) {
    console.log('❌ Errors:');
    results.errors.forEach(r => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
    console.log('');
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    phase: 2,
    dryRun: CONFIG.dryRun,
    summary: {
      filesChecked: files.length,
      filesUpdated: results.updated.length,
      filesSkipped: results.skipped.length,
      totalChanges: totalChanges,
      filesWithRemaining: results.withRemaining.length,
      totalRemaining: totalRemaining,
      errors: results.errors.length
    },
    details: results
  };

  const reportPath = './png-refs-update-phase2-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved: ${reportPath}`);

  console.log('');
  console.log('='.repeat(70));
  if (CONFIG.dryRun) {
    console.log('✅ DRY RUN COMPLETED');
  } else {
    console.log('✅ REFERENCES UPDATE COMPLETED');
  }
  console.log('='.repeat(70));
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
import fs from 'fs';

function printSummary() {
  console.log('\n');
  console.log('═════════════════════════════════════════════════════');
  console.log('           PNG vs WebP USAGE ANALYSIS');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  try {
    const usageReport = JSON.parse(fs.readFileSync('image-usage-report.json', 'utf8'));
    const compareReport = JSON.parse(fs.readFileSync('code-vs-assets-report.json', 'utf8'));

    const pngRefs = usageReport.summary.pngReferences;
    const webpRefs = usageReport.summary.webpReferences;
    const optimizationRate = parseFloat(usageReport.summary.optimizationRate);

    console.log('📊 CODE ANALYSIS:');
    console.log(`   PNG references:  ${pngRefs}`);
    console.log(`   WebP references: ${webpRefs}`);
    console.log(`   Optimization:    ${optimizationRate.toFixed(1)}%`);
    console.log('');

    console.log('📁 ASSETS:');
    console.log(`   PNG files:  ${compareReport.assets.png}`);
    console.log(`   WebP files: ${compareReport.assets.webp}`);
    console.log('');

    console.log('🎯 STATUS:');

    if (optimizationRate >= 95) {
      console.log('   ✅ EXCELLENT - Code fully optimized!');
      console.log('   ✅ Game is using WebP');
      console.log(`   ✅ Can delete ${compareReport.unusedPng.length} unused PNG files`);
      console.log(`   ✅ Save ${(compareReport.potentialSavings).toFixed(2)} MB`);
    } else if (optimizationRate >= 80) {
      console.log('   ✅ GOOD - Most code uses WebP');
      console.log(`   ⚠️  Still ${pngRefs} PNG references to update`);
    } else if (optimizationRate >= 50) {
      console.log('   ⚠️  PARTIAL - About half optimized');
      console.log(`   ❌ Need to update ${pngRefs} PNG references`);
    } else {
      console.log('   ❌ POOR - Code mostly uses PNG');
      console.log(`   ❌ URGENT: Update ${pngRefs} PNG references to WebP`);
    }

    console.log('');
    console.log('📋 NEXT STEPS:');

    if (optimizationRate >= 95) {
      console.log('   1. ✅ Code is optimized - nothing to do!');
      console.log('   2. 🗑️  Optional: Delete unused PNG files');
      console.log('   3. ✅ Deploy to production');
    } else {
      console.log('   1. ❌ Update code to use .webp instead of .webp');
      console.log('   2. 🧪 Test game thoroughly');
      console.log('   3. 💾 Commit changes');
      console.log('   4. 🗑️  Delete unused PNG files');
    }

    console.log('');
    console.log('📁 REPORTS:');
    console.log('   - image-usage-report.json');
    console.log('   - code-vs-assets-report.json');
    console.log('   - docs/png-webp-usage-analysis.md');
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

  } catch (err) {
    console.log('❌ Error reading reports:', err.message);
  }
}

printSummary();
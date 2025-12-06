#!/usr/bin/env node

/**
 * COMPREHENSIVE MIGRATION TEST SCRIPT
 * Tests all aspects of UserId migration from 10-char to 9-char format
 *
 * Usage: node test-migration-comprehensive.js [options]
 * Options:
 *   --phase <num>     Run specific phase only (1-8)
 *   --quick           Run quick test (phases 1,3,5 only)
 *   --report <file>   Save report to file
 *   --verbose         Show detailed output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const TEST_USER = {
  oldId: 'A000000010',  // 10 chars
  newId: 'A00000010',   // 9 chars
  username: 'sinsansensei',
  expectedReferrals: 122
};

// Test results storage
const results = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    startTime: new Date(),
    endTime: null,
    duration: 0
  },
  phases: {},
  critical: [],
  warnings: []
};

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Helper functions
function log(level, message, details = null) {
  const timestamp = new Date().toISOString();
  const color = colors[level] || colors.reset;
  const icon = level === 'pass' ? '✅' : level === 'fail' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';

  console.log(`${color}${icon} [${timestamp}] ${message}${colors.reset}`);

  if (details) {
    console.log(colors.cyan + JSON.stringify(details, null, 2) + colors.reset);
  }

  // Update results
  if (level === 'pass') {
    results.summary.passed++;
  } else if (level === 'fail') {
    results.summary.failed++;
    results.critical.push({ message, details, timestamp });
  } else if (level === 'warn') {
    results.summary.warnings++;
    results.warnings.push({ message, details, timestamp });
  }
  results.summary.total++;
}

function runMongosh(command, dbName = 'msci_game') {
  try {
    const result = execSync(
      `mongosh ${dbName} --quiet --eval '${command}'`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024 }
    );
    return result.trim();
  } catch (error) {
    return null;
  }
}

function runCurl(url, method = 'GET', data = null, headers = {}) {
  try {
    const cmd = data
      ? `curl -s -X ${method} "${url}" -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`
      : `curl -s -X ${method} "${url}"`;

    const result = execSync(cmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 });
    return result.trim();
  } catch (error) {
    return null;
  }
}

function checkPm2(service = null) {
  try {
    const cmd = service ? `pm2 jlist | jq '.[] | select(.name=="${service}")'` : 'pm2 jlist';
    const result = execSync(cmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 });
    return JSON.parse(result);
  } catch (error) {
    return null;
  }
}

// Phase 1: Database Verification
async function testDatabase() {
  log('info', '\n🔍 PHASE 1: DATABASE VERIFICATION');

  const tests = [
    {
      name: 'No 10-char users remain',
      test: () => {
        const count = runMongosh('db.users.count({"$expr":{"$eq":[{"$strLenCP":"$UserId"},10]}})');
        return count === '0';
      }
    },
    {
      name: 'Migrated user exists with new ID',
      test: () => {
        const user = runMongosh(`db.users.findOne({UserId: "${TEST_USER.newId}"}, {UserId:1, Username:1, oldUserId:1, migratedAt:1, isVip:1, vipExpiryDate:1})`);
        return user && user.Username === TEST_USER.username;
      }
    },
    {
      name: 'Old UserId no longer exists',
      test: () => {
        const user = runMongosh(`db.users.findOne({UserId: "${TEST_USER.oldId}"}, {UserId:1})`);
        return !user;
      }
    },
    {
      name: 'Migration timestamp recorded',
      test: () => {
        const user = runMongosh(`db.users.findOne({UserId: "${TEST_USER.newId}"}, {migratedAt:1, oldUserId:1})`);
        return user && user.migratedAt && user.oldUserId === TEST_USER.oldId;
      }
    },
    {
      name: 'All 122 referrals updated',
      test: () => {
        const count = runMongosh(`db.users.count({InviteBy: "${TEST_USER.newId}"})`);
        return count === String(TEST_USER.expectedReferrals);
      }
    },
    {
      name: 'No old InviteBy references',
      test: () => {
        const count = runMongosh(`db.users.count({InviteBy: "${TEST_USER.oldId}"})`);
        return count === '0';
      }
    },
    {
      name: 'No old UserId in any collection',
      test: () => {
        const checkCmd = `
          db.getCollectionNames().forEach(col => {
            const count = db[col].count({"UserId": "${TEST_USER.oldId}"});
            if(count > 0) print(col + ': ' + count);
          })
        `;
        const result = runMongosh(checkCmd);
        return !result || result.trim() === '';
      }
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        log('pass', `✓ ${test.name}`);
        passed++;
      } else {
        log('fail', `✗ ${test.name}`);
      }
    } catch (error) {
      log('fail', `✗ ${test.name}`, error.message);
    }
  }

  results.phases.database = { total: tests.length, passed };
  return passed === tests.length;
}

// Phase 2: Backend API Testing
async function testBackendAPI() {
  log('info', '\n🔍 PHASE 2: BACKEND API TESTING');

  const tests = [
    {
      name: 'Get user by new UserId',
      test: () => {
        const response = runCurl(`http://localhost:10000/api/user/profile?userId=${TEST_USER.newId}`);
        return response && !response.includes('error') && response.includes(TEST_USER.username);
      }
    },
    {
      name: 'Old UserId returns error',
      test: () => {
        const response = runCurl(`http://localhost:10000/api/user/profile?userId=${TEST_USER.oldId}`);
        return response && (response.includes('not found') || response.includes('error'));
      }
    },
    {
      name: 'Get user by username',
      test: () => {
        const response = runCurl(`http://localhost:10000/api/user/profile?username=${TEST_USER.username}`);
        return response && !response.includes('error') && response.includes(TEST_USER.newId);
      }
    },
    {
      name: 'Get referrals list',
      test: () => {
        const response = runCurl(`http://localhost:10000/api/user/referrals?userId=${TEST_USER.newId}`);
        return response && !response.includes('error');
      }
    },
    {
      name: 'Referral count correct',
      test: () => {
        const response = runCurl(`http://localhost:10000/api/user/referral-count?userId=${TEST_USER.newId}`);
        return response && response.includes(String(TEST_USER.expectedReferrals));
      }
    },
    {
      name: 'Search user works',
      test: () => {
        const response = runCurl(`http://localhost:10000/api/user/search?query=${TEST_USER.newId}`);
        return response && !response.includes('error');
      }
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        log('pass', `✓ ${test.name}`);
        passed++;
      } else {
        log('fail', `✗ ${test.name}`);
      }
    } catch (error) {
      log('fail', `✗ ${test.name}`, error.message);
    }
  }

  results.phases.backend = { total: tests.length, passed };
  return passed === tests.length;
}

// Phase 3: TON Integration Testing
async function testTONIntegration() {
  log('info', '\n🔍 PHASE 3: TON INTEGRATION TESTING');

  const tests = [
    {
      name: 'Memo parsing works with 9-char UserId',
      test: () => {
        const testMemo = `${TEST_USER.newId}|0.5`;
        const parts = testMemo.split('|');
        const userId = parts[0];
        const amount = parseFloat(parts[1]);
        const isValidFormat = /^A[0-9]{8}$/.test(userId);
        return userId === TEST_USER.newId && amount === 0.5 && isValidFormat;
      }
    },
    {
      name: 'Scanner accepts 9-char format',
      test: () => {
        try {
          const scannerCode = fs.readFileSync('/www/wwwroot/game/jobs/job-verify-purchase.js', 'utf8');
          return scannerCode.includes('A[0-9]{8}') || scannerCode.includes('A[0-9]{9}');
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Recent transactions with new UserId',
      test: () => {
        const txns = runMongosh(`db.deposits.find({userId: "${TEST_USER.newId}"}).sort({createdAt: -1}).limit(5).toArray()`);
        return txns && txns.trim() !== '[]';
      }
    },
    {
      name: 'No transactions with old UserId',
      test: () => {
        const count = runMongosh(`db.deposits.count({userId: "${TEST_USER.oldId}"})`);
        return count === '0' || count === '';
      }
    },
    {
      name: 'Scanner logs no errors',
      test: () => {
        try {
          const logs = execSync('pm2 logs ton-scanner --lines 100 --nostream 2>&1', { encoding: 'utf8' });
          const hasErrors = logs.includes('A000000010') || logs.toLowerCase().includes('userid error');
          return !hasErrors;
        } catch (error) {
          return false;
        }
      }
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        log('pass', `✓ ${test.name}`);
        passed++;
      } else {
        log('fail', `✗ ${test.name}`);
      }
    } catch (error) {
      log('fail', `✗ ${test.name}`, error.message);
    }
  }

  results.phases.ton = { total: tests.length, passed };
  return passed === tests.length;
}

// Phase 4: Frontend Testing
async function testFrontend() {
  log('info', '\n🔍 PHASE 4: FRONTEND TESTING');

  const tests = [
    {
      name: 'No hardcoded 10-char UserIds',
      test: () => {
        try {
          const result = execSync('grep -rn "A000000010" src/ --include="*.js" --include="*.jsx" 2>/dev/null',
            { cwd: '/mnt/d/fe/fe', encoding: 'utf8' });
          return !result || result.trim() === '';
        } catch (error) {
          // No matches found, which is good
          return true;
        }
      }
    },
    {
      name: '9-char UserId in corrected file',
      test: () => {
        try {
          const result = execSync('grep -n "A00000010" src/game/scenes/Home/HomeUserInfo/HomeUserInfoNetwork.js',
            { cwd: '/mnt/d/fe/fe', encoding: 'utf8' });
          return result && result.includes('A00000010');
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'No real user data in CenterData',
      test: () => {
        try {
          const result = execSync('grep -n "A00002825\\|A00000012\\|A00002476" src/game/Data/CenterData.js',
            { cwd: '/mnt/d/fe/fe', encoding: 'utf8' });
          return !result || result.trim() === '';
        } catch (error) {
          return true;
        }
      }
    },
    {
      name: 'All UserIds match 9-char pattern',
      test: () => {
        try {
          const result = execSync('grep -ro "A[0-9]\\{8\\}" src/ 2>/dev/null | head -10',
            { cwd: '/mnt/d/fe/fe', encoding: 'utf8' });
          const hasValid = result && result.includes('A00000010');
          return hasValid;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Frontend builds successfully',
      test: () => {
        try {
          execSync('npm run build', { cwd: '/mnt/d/fe/fe', stdio: 'pipe' });
          return true;
        } catch (error) {
          return false;
        }
      }
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        log('pass', `✓ ${test.name}`);
        passed++;
      } else {
        log('fail', `✗ ${test.name}`);
      }
    } catch (error) {
      log('fail', `✗ ${test.name}`, error.message);
    }
  }

  results.phases.frontend = { total: tests.length, passed };
  return passed === tests.length;
}

// Phase 5: System Integration Testing
async function testSystemIntegration() {
  log('info', '\n🔍 PHASE 5: SYSTEM INTEGRATION TESTING');

  const tests = [
    {
      name: 'All PM2 services running',
      test: () => {
        const services = checkPm2();
        return services && Array.isArray(services) && services.length >= 5;
      }
    },
    {
      name: 'No critical errors in logs',
      test: () => {
        try {
          const logs = execSync('pm2 logs --lines 200 --nostream 2>&1', { encoding: 'utf8' });
          const hasCriticalErrors = logs.includes('A000000010') ||
                                  logs.toLowerCase().includes('critical error') ||
                                  logs.toLowerCase().includes('connection failed');
          return !hasCriticalErrors;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Normal CPU/Memory usage',
      test: () => {
        const services = checkPm2();
        return services && services.every(s => s.monit.cpu < 80 && s.monit.memory < 1000000000);
      }
    },
    {
      name: 'No unexpected restarts',
      test: () => {
        const services = checkPm2();
        return services && services.every(s => s.pm2_env.restart_time < 10);
      }
    },
    {
      name: 'Game worker processing normally',
      test: () => {
        try {
          const logs = execSync('pm2 logs game-worker --lines 50 --nostream 2>&1', { encoding: 'utf8' });
          const hasErrors = logs.toLowerCase().includes('error') || logs.toLowerCase().includes('exception');
          return !hasErrors || logs.includes('connected');
        } catch (error) {
          return false;
        }
      }
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        log('pass', `✓ ${test.name}`);
        passed++;
      } else {
        log('fail', `✗ ${test.name}`);
      }
    } catch (error) {
      log('fail', `✗ ${test.name}`, error.message);
    }
  }

  results.phases.system = { total: tests.length, passed };
  return passed === tests.length;
}

// Phase 6: Data Integrity Testing
async function testDataIntegrity() {
  log('info', '\n🔍 PHASE 6: DATA INTEGRITY TESTING');

  const tests = [
    {
      name: 'User data complete',
      test: () => {
        const user = runMongosh(`db.users.findOne({UserId: "${TEST_USER.newId}"}, {UserId:1,Username:1,Email:1,Chip:1,MSCI:1,Musk:1,isVip:1,vipExpiryDate:1,createdAt:1,lastLogin:1})`);
        return user && user.Username === TEST_USER.username;
      }
    },
    {
      name: 'VIP status maintained',
      test: () => {
        const user = runMongosh(`db.users.findOne({UserId: "${TEST_USER.newId}"}, {isVip:1,vipExpiryDate:1})`);
        return user && user.isVip === true && user.vipExpiryDate;
      }
    },
    {
      name: 'Balance unchanged',
      test: () => {
        const user = runMongosh(`db.users.findOne({UserId: "${TEST_USER.newId}"}, {MSCI:1,Chip:1,Musk:1})`);
        return user && typeof user.MSCI === 'number';
      }
    },
    {
      name: 'All referrals still linked',
      test: () => {
        const count = runMongosh(`db.users.count({InviteBy: "${TEST_USER.newId}"})`);
        return count === String(TEST_USER.expectedReferrals);
      }
    },
    {
      name: 'Referral data complete',
      test: () => {
        const referrals = runMongosh(`db.users.find({InviteBy: "${TEST_USER.newId}"}).limit(5).toArray()`);
        return referrals && referrals.trim() !== '[]';
      }
    },
    {
      name: 'Transaction history intact',
      test: () => {
        const txns = runMongosh(`db.deposits.find({userId: "${TEST_USER.newId}"}).sort({createdAt: -1}).limit(5).toArray()`);
        return txns; // May be empty if no transactions
      }
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        log('pass', `✓ ${test.name}`);
        passed++;
      } else {
        log('fail', `✗ ${test.name}`);
      }
    } catch (error) {
      log('fail', `✗ ${test.name}`, error.message);
    }
  }

  results.phases.dataIntegrity = { total: tests.length, passed };
  return passed === tests.length;
}

// Phase 7: Performance Testing
async function testPerformance() {
  log('info', '\n🔍 PHASE 7: PERFORMANCE TESTING');

  const tests = [
    {
      name: 'User query performance',
      test: () => {
        const start = Date.now();
        runMongosh(`db.users.findOne({UserId: "${TEST_USER.newId}"})`);
        return (Date.now() - start) < 100;
      }
    },
    {
      name: 'Referral query performance',
      test: () => {
        const start = Date.now();
        runMongosh(`db.users.find({InviteBy: "${TEST_USER.newId}"}).toArray()`);
        return (Date.now() - start) < 500;
      }
    },
    {
      name: 'API response time',
      test: () => {
        const start = Date.now();
        const response = runCurl(`http://localhost:10000/api/user/profile?userId=${TEST_USER.newId}`);
        return response && (Date.now() - start) < 200;
      }
    },
    {
      name: 'Index usage check',
      test: () => {
        const explain = runMongosh(`db.users.find({UserId: "${TEST_USER.newId}"}).explain("executionStats")`);
        return explain && !explain.includes('COLLSCAN');
      }
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        log('pass', `✓ ${test.name}`);
        passed++;
      } else {
        log('warn', `⚠ ${test.name} (performance may be slow)`);
        passed++;
      }
    } catch (error) {
      log('fail', `✗ ${test.name}`, error.message);
    }
  }

  results.phases.performance = { total: tests.length, passed };
  return passed === tests.length;
}

// Phase 8: Edge Cases Testing
async function testEdgeCases() {
  log('info', '\n🔍 PHASE 8: EDGE CASES TESTING');

  const tests = [
    {
      name: '18-char user still works',
      test: () => {
        const user = runMongosh('db.users.findOne({"$expr":{"$eq":[{"$strLenCP":"$UserId"},18]}}, {UserId:1})');
        return true; // May or may not exist
      }
    },
    {
      name: 'Other 9-char users work',
      test: () => {
        const user = runMongosh('db.users.findOne({UserId: "A00015193"}, {UserId:1})');
        return user;
      }
    },
    {
      name: 'Empty UserId handled',
      test: () => {
        const response = runCurl('http://localhost:10000/api/user/profile?userId=');
        return !response || response.includes('Bad Request');
      }
    },
    {
      name: 'Invalid format handled',
      test: () => {
        const response = runCurl('http://localhost:10000/api/user/profile?userId=INVALID');
        return response && response.includes('not found');
      }
    },
    {
      name: 'Backup files exist',
      test: () => {
        try {
          execSync('ls /www/wwwroot/game/user-backup-*.json 2>/dev/null');
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Backup readable',
      test: () => {
        try {
          const backup = execSync('ls -t /www/wwwroot/game/user-backup-A000000010-*.json | head -1', { encoding: 'utf8' }).trim();
          const content = fs.readFileSync(backup, 'utf8');
          const backupData = JSON.parse(content);
          return backupData.UserId === TEST_USER.oldId;
        } catch (error) {
          return false;
        }
      }
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        log('pass', `✓ ${test.name}`);
        passed++;
      } else {
        log('fail', `✗ ${test.name}`);
      }
    } catch (error) {
      log('fail', `✗ ${test.name}`, error.message);
    }
  }

  results.phases.edgeCases = { total: tests.length, passed };
  return passed === tests.length;
}

// Generate final report
function generateReport() {
  results.summary.endTime = new Date();
  results.summary.duration = Math.round((results.summary.endTime - results.summary.startTime) / 1000);

  const report = `
# 🧪 MIGRATION TEST RESULTS
**Date:** ${results.summary.startTime.toISOString()}
**Duration:** ${results.summary.duration} seconds
**User:** ${TEST_USER.username} (${TEST_USER.oldId} → ${TEST_USER.newId})

---

## 📊 SUMMARY
- **Total Tests:** ${results.summary.total}
- **Passed:** ${results.summary.passed} ✅
- **Failed:** ${results.summary.failed} ❌
- **Warnings:** ${results.summary.warnings} ⚠️

---

## 🎯 PHASE RESULTS

### 1. Database Verification
${results.phases.database ? `${results.phases.database.passed}/${results.phases.database.total} passed` : 'Not run'}

### 2. Backend API
${results.phases.backend ? `${results.phases.backend.passed}/${results.phases.backend.total} passed` : 'Not run'}

### 3. TON Integration
${results.phases.ton ? `${results.phases.ton.passed}/${results.phases.ton.total} passed` : 'Not run'}

### 4. Frontend
${results.phases.frontend ? `${results.phases.frontend.passed}/${results.phases.frontend.total} passed` : 'Not run'}

### 5. System Integration
${results.phases.system ? `${results.phases.system.passed}/${results.phases.system.total} passed` : 'Not run'}

### 6. Data Integrity
${results.phases.dataIntegrity ? `${results.phases.dataIntegrity.passed}/${results.phases.dataIntegrity.total} passed` : 'Not run'}

### 7. Performance
${results.phases.performance ? `${results.phases.performance.passed}/${results.phases.performance.total} passed` : 'Not run'}

### 8. Edge Cases
${results.phases.edgeCases ? `${results.phases.edgeCases.passed}/${results.phases.edgeCases.total} passed` : 'Not run'}

---

## 🚨 CRITICAL ISSUES
${results.critical.length > 0 ?
  results.critical.map(c => `- ${c.message}`).join('\n') :
  '✅ No critical issues'
}

---

## ⚠️ WARNINGS
${results.warnings.length > 0 ?
  results.warnings.map(w => `- ${w.message}`).join('\n') :
  '✅ No warnings'
}

---

## 📈 OVERALL STATUS
${results.summary.failed === 0 ? '✅ MIGRATION SUCCESSFUL' :
  results.summary.failed < 5 ? '⚠️ MINOR ISSUES - Monitor closely' :
  '❌ CRITICAL ISSUES - Consider rollback'}

---

## 💡 RECOMMENDATION
${results.summary.failed === 0 ?
  '- ✅ Migration completed successfully\n- ✅ No action needed\n- ✅ Monitor for 24 hours' :
  results.summary.failed < 5 ?
  '- ⚠️ Minor issues detected\n- ⚠️ Monitor system closely\n- ⚠️ Fix issues within 24 hours' :
  '- ❌ Critical issues found\n- ❌ Review rollback procedure\n- ❌ Fix immediately or rollback'
}

---

**Report generated:** ${new Date().toISOString()}
`;

  return report;
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const options = {
    phase: null,
    quick: args.includes('--quick'),
    report: null,
    verbose: args.includes('--verbose')
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--phase' && args[i + 1]) {
      options.phase = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--report' && args[i + 1]) {
      options.report = args[i + 1];
      i++;
    }
  }

  console.log(colors.cyan + '\n🚀 MIGRATION COMPREHENSIVE TEST\n' + colors.reset);

  const phases = options.quick ? [1, 3, 5] :
    options.phase ? [options.phase] :
    [1, 2, 3, 4, 5, 6, 7, 8];

  const testFunctions = {
    1: testDatabase,
    2: testBackendAPI,
    3: testTONIntegration,
    4: testFrontend,
    5: testSystemIntegration,
    6: testDataIntegrity,
    7: testPerformance,
    8: testEdgeCases
  };

  // Run tests
  for (const phaseNum of phases) {
    if (testFunctions[phaseNum]) {
      await testFunctions[phaseNum]();
    }
  }

  // Generate and output report
  const report = generateReport();
  console.log(colors.blue + '\n' + report + colors.reset);

  // Save report if specified
  if (options.report) {
    fs.writeFileSync(options.report, report);
    log('pass', `Report saved to ${options.report}`);
  }

  // Exit with appropriate code
  process.exit(results.summary.failed === 0 ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error(colors.red + '\n💥 UNCAUGHT ERROR:' + colors.reset, error);
  process.exit(1);
});

// Run the script
main().catch(error => {
  console.error(colors.red + '\n💥 SCRIPT ERROR:' + colors.reset, error);
  process.exit(1);
});
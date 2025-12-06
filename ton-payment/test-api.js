/**
 * API Endpoint Test Script
 * Tests all TON Payment API endpoints
 */

const request = require('supertest');
const app = require('./index');

console.log('🧪 Testing TON Payment API Endpoints\n');

// Test helper
const testEndpoint = async (method, path, data = null, headers = {}) => {
  try {
    let response;

    switch (method.toLowerCase()) {
      case 'get':
        response = await request(app).get(path).set(headers);
        break;
      case 'post':
        response = await request(app).post(path).send(data).set(headers);
        break;
      case 'put':
        response = await request(app).put(path).send(data).set(headers);
        break;
      case 'delete':
        response = await request(app).delete(path).set(headers);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return {
      status: response.status,
      body: response.body,
      success: response.status < 400
    };
  } catch (error) {
    return {
      status: 500,
      body: { error: error.message },
      success: false
    };
  }
};

// Main test runner
const runTests = async () => {
  const tests = [
    // Health and info endpoints
    { method: 'GET', path: '/', description: 'Root endpoint' },
    { method: 'GET', path: '/api', description: 'API info endpoint' },
    { method: 'GET', path: '/api/health', description: 'Health check endpoint' },

    // Transaction endpoints
    {
      method: 'POST',
      path: '/api/transactions',
      data: {
        userId: 'testuser123',
        fromAddress: '0:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        toAddress: '0:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        amount: 1.5,
        comment: 'Test transaction'
      },
      description: 'Create transaction'
    },
    {
      method: 'GET',
      path: '/api/transactions',
      headers: { Authorization: 'Bearer test-token' },
      description: 'Get user transactions (requires auth)'
    },
    { method: 'GET', path: '/api/transactions/stats', headers: { Authorization: 'Bearer admin-token' }, description: 'Get transaction stats (admin)' },
    { method: 'GET', path: '/api/transactions/txn_123', headers: { Authorization: 'Bearer test-token' }, description: 'Get single transaction' },
    { method: 'POST', path: '/api/transactions/txn_123/cancel', headers: { Authorization: 'Bearer test-token' }, description: 'Cancel transaction' },

    // Notification endpoints
    { method: 'GET', path: '/api/notifications', headers: { Authorization: 'Bearer test-token' }, description: 'Get user notifications' },
    { method: 'GET', path: '/api/notifications/unread/count', headers: { Authorization: 'Bearer test-token' }, description: 'Get unread count' },
    {
      method: 'POST',
      path: '/api/notifications/mark-read',
      headers: { Authorization: 'Bearer test-token' },
      data: { notificationIds: ['notif_1', 'notif_2'] },
      description: 'Mark notifications as read'
    },
    { method: 'POST', path: '/api/notifications/mark-all-read', headers: { Authorization: 'Bearer test-token' }, description: 'Mark all as read' },
    { method: 'GET', path: '/api/notifications/stats', headers: { Authorization: 'Bearer admin-token' }, description: 'Get notification stats (admin)' },
    { method: 'DELETE', path: '/api/notifications/notif_123', headers: { Authorization: 'Bearer test-token' }, description: 'Delete notification' },

    // Admin endpoints
    { method: 'GET', path: '/api/admin/overview', headers: { Authorization: 'Bearer admin-token' }, description: 'Get system overview (admin)' },
    { method: 'GET', path: '/api/admin/transactions', headers: { Authorization: 'Bearer admin-token' }, description: 'Get all transactions (admin)' },
    { method: 'GET', path: '/api/admin/users', headers: { Authorization: 'Bearer admin-token' }, description: 'Get all users (admin)' },
    { method: 'GET', path: '/api/admin/users/testuser123', headers: { Authorization: 'Bearer admin-token' }, description: 'Get user details (admin)' },
    { method: 'GET', path: '/api/admin/analytics', headers: { Authorization: 'Bearer admin-token' }, description: 'Get analytics (admin)' },
    { method: 'GET', path: '/api/admin/export?type=transactions', headers: { Authorization: 'Bearer admin-token' }, description: 'Export data (admin)' },
    { method: 'GET', path: '/api/admin/logs', headers: { Authorization: 'Bearer admin-token' }, description: 'Get system logs (admin)' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.method, test.path, test.data, test.headers);
    const status = result.success ? '✅' : '❌';

    console.log(`${status} ${test.method} ${test.path}`);
    console.log(`   ${test.description}`);

    if (!result.success) {
      console.log(`   Status: ${result.status}`);
      if (result.body.error) {
        console.log(`   Error: ${result.body.error.message || result.body.error}`);
      }
      failed++;
    } else {
      passed++;
    }
    console.log('');
  }

  // Test 404
  const notFoundResult = await testEndpoint('GET', '/api/nonexistent');
  if (notFoundResult.status === 404) {
    console.log('✅ GET /api/nonexistent');
    console.log('   404 handler working correctly\n');
    passed++;
  } else {
    failed++;
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   Total: ${tests.length + 1}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / (tests.length + 1)) * 100).toFixed(1)}%`);
};

// Run tests
runTests().catch(console.error);
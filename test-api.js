#!/usr/bin/env node

/**
 * API Testing Script for Retail Management System
 * Tests all major endpoints
 * Usage: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api';

let authToken = null;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'Health Check',
    test: async () => {
      const res = await makeRequest('GET', '/health/db');
      if (res.status === 200 && res.data.ok && res.data.db) {
        return { pass: true, message: '✓ Database connected' };
      }
      return { pass: false, message: `✗ Database check failed: ${JSON.stringify(res.data)}` };
    }
  },

  {
    name: 'User Login (Valid Credentials)',
    test: async () => {
      try {
        const res = await makeRequest('POST', '/auth/login', {
          email: 'owner@example.com',
          password: 'password123'
        });
        
        if (res.status === 200 && res.data.token) {
          authToken = res.data.token;
          return { pass: true, message: '✓ Login successful, token received' };
        }
        return { pass: false, message: `✗ Login failed: ${res.data.error}` };
      } catch (error) {
        return { pass: false, message: `✗ Login error: ${error.message}` };
      }
    }
  },

  {
    name: 'Get Current User',
    test: async () => {
      if (!authToken) return { pass: false, message: '✗ No auth token' };
      
      try {
        const res = await makeRequest('GET', '/auth/me');
        if (res.status === 200 && res.data.user) {
          return { pass: true, message: `✓ Got user: ${res.data.user.email}` };
        }
        return { pass: false, message: `✗ Failed to get user: ${res.data.error}` };
      } catch (error) {
        return { pass: false, message: `✗ Error: ${error.message}` };
      }
    }
  },

  {
    name: 'List Products',
    test: async () => {
      if (!authToken) return { pass: false, message: '✗ No auth token' };
      
      try {
        const res = await makeRequest('GET', '/products');
        if (res.status === 200 && Array.isArray(res.data.products)) {
          return { pass: true, message: `✓ Got ${res.data.products.length} products` };
        }
        return { pass: false, message: `✗ Failed to get products: ${JSON.stringify(res.data)}` };
      } catch (error) {
        return { pass: false, message: `✗ Error: ${error.message}` };
      }
    }
  },

  {
    name: 'List Categories',
    test: async () => {
      if (!authToken) return { pass: false, message: '✗ No auth token' };
      
      try {
        const res = await makeRequest('GET', '/categories');
        if (res.status === 200) {
          return { pass: true, message: `✓ Got categories` };
        }
        return { pass: false, message: `✗ Failed: ${JSON.stringify(res.data)}` };
      } catch (error) {
        return { pass: false, message: `✗ Error: ${error.message}` };
      }
    }
  },

  {
    name: 'List Customers',
    test: async () => {
      if (!authToken) return { pass: false, message: '✗ No auth token' };
      
      try {
        const res = await makeRequest('GET', '/customers');
        if (res.status === 200) {
          return { pass: true, message: `✓ Got customers` };
        }
        return { pass: false, message: `✗ Failed: ${JSON.stringify(res.data)}` };
      } catch (error) {
        return { pass: false, message: `✗ Error: ${error.message}` };
      }
    }
  },

  {
    name: 'Missing Authorization Header',
    test: async () => {
      try {
        // Manually make request without token
        const url = new URL('/products', API_URL);
        const options = {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };

        const res = await new Promise((resolve) => {
          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
          });
          req.end();
        });

        if (res.status === 401 && res.data.error === 'Access token required') {
          return { pass: true, message: '✓ Correctly rejected missing token' };
        }
        return { pass: false, message: `✗ Expected 401, got: ${res.status}` };
      } catch (error) {
        return { pass: false, message: `✗ Error: ${error.message}` };
      }
    }
  },

  {
    name: 'Invalid Login Credentials',
    test: async () => {
      try {
        const res = await makeRequest('POST', '/auth/login', {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
        
        if (res.status === 401) {
          return { pass: true, message: '✓ Correctly rejected invalid credentials' };
        }
        return { pass: false, message: `✗ Expected 401, got ${res.status}` };
      } catch (error) {
        return { pass: false, message: `✗ Error: ${error.message}` };
      }
    }
  },

  {
    name: '404 Endpoint',
    test: async () => {
      try {
        const res = await makeRequest('GET', '/nonexistent');
        if (res.status === 404) {
          return { pass: true, message: '✓ Correctly returned 404' };
        }
        return { pass: false, message: `✗ Expected 404, got ${res.status}` };
      } catch (error) {
        return { pass: false, message: `✗ Error: ${error.message}` };
      }
    }
  }
];

// Run all tests
async function runTests() {
  console.log('\n🧪 Running API Tests\n');
  console.log(`Server: ${API_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.test();
      const symbol = result.pass ? '✅' : '❌';
      console.log(`${symbol} ${test.name}`);
      console.log(`   ${result.message}\n`);
      
      if (result.pass) passed++;
      else failed++;
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   ✗ Exception: ${error.message}\n`);
      failed++;
    }
  }

  console.log('─'.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed!\n');
  } else {
    console.log(`⚠️  ${failed} test(s) failed\n`);
  }
}

// Check if server is running
function checkServer() {
  return new Promise((resolve) => {
    const req = http.request(BASE_URL, { method: 'GET' }, () => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

// Main
(async () => {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Backend server is not running!');
    console.error(`Please start it with: cd Backend && npm run dev\n`);
    process.exit(1);
  }

  await runTests();
})();

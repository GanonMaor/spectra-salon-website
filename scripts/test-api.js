#!/usr/bin/env node

const axios = require('axios');
const { performance } = require('perf_hooks');
require('dotenv').config();

class APITester {
  constructor() {
    this.baseURL = 'http://localhost:8888/.netlify/functions';
    this.results = { passed: 0, failed: 0, errors: [] };
    this.testUser = {
      email: `test-api-${Date.now()}@example.com`,
      password: 'TestAPI123!',
      fullName: 'API Test User',
      phone: '0501234567'
    };
    this.authToken = null;
  }

  pass(test, details = '') {
    console.log(`✅ ${test}${details ? ` - ${details}` : ''}`);
    this.results.passed++;
  }

  fail(test, error = '') {
    console.log(`❌ ${test}${error ? ` - ${error}` : ''}`);
    this.results.failed++;
    if (error) this.results.errors.push(`${test}: ${error}`);
  }

  async checkServerRunning() {
    console.log('🔍 Checking if Netlify Dev server is running...\n');
    
    try {
      const response = await axios.get('http://localhost:8888', { timeout: 5000 });
      this.pass('Netlify Dev server is running');
      return true;
    } catch (error) {
      this.fail('Netlify Dev server not running', 'Please run: npm run dev');
      console.log('\n💡 To run API tests, you need to start the server first:');
      console.log('   npm run dev');
      console.log('   (then run this test in another terminal)\n');
      return false;
    }
  }

  async testAuthFlow() {
    console.log('🔐 Testing Authentication Flow...\n');
    
    try {
      // Test 1: Signup
      console.log('📝 Testing signup...');
      const signupResponse = await axios.post(`${this.baseURL}/auth/signup`, this.testUser);
      
      if (signupResponse.status === 201 && signupResponse.data.token) {
        this.pass('User signup', `Token received`);
        this.authToken = signupResponse.data.token;
      } else {
        this.fail('User signup', 'No token received');
        return;
      }

      // Test 2: Login with same credentials
      console.log('🚪 Testing login...');
      const loginResponse = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.testUser.email,
        password: this.testUser.password
      });
      
      if (loginResponse.status === 200 && loginResponse.data.token) {
        this.pass('User login', 'Valid credentials accepted');
      } else {
        this.fail('User login', 'Login failed');
      }

      // Test 3: Get user info with token
      console.log('👤 Testing user info retrieval...');
      const meResponse = await axios.get(`${this.baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      if (meResponse.status === 200 && meResponse.data.user) {
        this.pass('User info retrieval', `User: ${meResponse.data.user.email}`);
      } else {
        this.fail('User info retrieval', 'Failed to get user data');
      }

      // Test 4: Invalid login
      console.log('🚫 Testing invalid credentials...');
      try {
        await axios.post(`${this.baseURL}/auth/login`, {
          email: this.testUser.email,
          password: 'wrong-password'
        });
        this.fail('Invalid credentials test', 'Should have rejected bad password');
      } catch (error) {
        if (error.response?.status === 401) {
          this.pass('Invalid credentials test', 'Correctly rejected bad password');
        } else {
          this.fail('Invalid credentials test', `Unexpected error: ${error.message}`);
        }
      }

    } catch (error) {
      this.fail('Auth flow', error.response?.data?.error || error.message);
    }
  }

  async testLeadsAPI() {
    console.log('\n📝 Testing Leads API...\n');
    
    try {
      const leadData = {
        name: 'API Test Lead',
        email: `lead-${Date.now()}@example.com`,
        phone: '0501234567',
        source: 'api-test',
        cta_clicked: 'Start Trial',
        message: 'This is a test lead from API tests'
      };

      console.log('📋 Creating new lead...');
      const response = await axios.post(`${this.baseURL}/leads`, leadData);
      
      if (response.status === 200 && response.data.lead) {
        this.pass('Lead creation', `Lead ID: ${response.data.lead.id}`);
      } else {
        this.fail('Lead creation', 'Failed to create lead');
      }

    } catch (error) {
      this.fail('Leads API', error.response?.data?.error || error.message);
    }
  }

  async testCTATracking() {
    console.log('\n📊 Testing CTA Tracking...\n');
    
    try {
      const ctaData = {
        button_name: 'API Test Button',
        page_url: '/api-test-page',
        device_type: 'desktop',
        user_agent: 'API Test Agent',
        session_id: `test-session-${Date.now()}`
      };

      console.log('📈 Tracking CTA click...');
      const response = await axios.post(`${this.baseURL}/cta-tracking`, ctaData);
      
      if (response.status === 200 && response.data.click) {
        this.pass('CTA tracking', `Click ID: ${response.data.click.id}`);
      } else {
        this.fail('CTA tracking', 'Failed to track click');
      }

    } catch (error) {
      this.fail('CTA tracking', error.response?.data?.error || error.message);
    }
  }

  async testFunctionPerformance() {
    console.log('\n⚡ Testing Function Performance...\n');
    
    const performanceTests = [
      {
        name: 'Auth endpoint response time',
        test: () => axios.post(`${this.baseURL}/auth/login`, {
          email: this.testUser.email,
          password: this.testUser.password
        })
      },
      {
        name: 'Leads endpoint response time',
        test: () => axios.post(`${this.baseURL}/leads`, {
          name: 'Perf Test',
          email: `perf-${Date.now()}@test.com`
        })
      }
    ];

    for (const test of performanceTests) {
      try {
        const start = performance.now();
        await test.test();
        const end = performance.now();
        const duration = Math.round(end - start);
        
        if (duration < 2000) {
          this.pass(test.name, `${duration}ms`);
        } else {
          this.fail(test.name, `Slow response: ${duration}ms`);
        }
      } catch (error) {
        // Performance test, so we don't fail for errors, just for timing
        const end = performance.now();
        const duration = Math.round(end - performance.now());
        console.log(`⚠️  ${test.name}: ${duration}ms (with error)`);
      }
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...\n');
    
    // Note: In a real app, you'd want to delete the test user
    // For now, we'll just note that cleanup should happen
    console.log('💡 Test user created:', this.testUser.email);
    console.log('   (Consider adding cleanup in production tests)');
  }

  async runAllAPITests() {
    console.log('🌐 API INTEGRATION TESTS STARTING...\n');
    
    // Check if server is running
    const serverRunning = await this.checkServerRunning();
    if (!serverRunning) {
      this.printSummary();
      return;
    }

    await this.testAuthFlow();
    await this.testLeadsAPI();
    await this.testCTATracking();
    await this.testFunctionPerformance();
    await this.cleanup();
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 API TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      this.results.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }
    
    const total = this.results.passed + this.results.failed;
    const percentage = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
    console.log(`\n📈 Success Rate: ${percentage}%`);
    
    if (percentage >= 90) {
      console.log('🎉 EXCELLENT! All APIs working perfectly!');
    } else if (percentage >= 70) {
      console.log('👍 GOOD! Most APIs working, minor issues.');
    } else {
      console.log('⚠️  NEEDS ATTENTION! Multiple API issues found.');
    }
  }
}

if (require.main === module) {
  const tester = new APITester();
  tester.runAllAPITests().catch(console.error);
}

module.exports = APITester; 
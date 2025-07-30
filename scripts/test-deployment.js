/**
 * Deployment Testing Script
 * 
 * This script tests the deployed Product Inventory API to ensure
 * all endpoints are working correctly in the production environment.
 * 
 * Usage: node scripts/test-deployment.js <base-url>
 * Example: node scripts/test-deployment.js https://your-app.railway.app
 * 
 * @author Product Inventory API Team
 * @created 2024-01-XX
 */

const https = require('https');
const http = require('http');

class DeploymentTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.testResults = [];
    this.authToken = null;
    this.userId = null;
    this.productId = null;
  }

  /**
   * Make HTTP request
   */
  async makeRequest(method, endpoint, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = {
              status: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : null
            };
            resolve(response);
          } catch (error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body,
              parseError: error.message
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Log test result
   */
  logResult(testName, success, details = '') {
    const status = success ? '✅ PASS' : '❌ FAIL';
    const result = { testName, success, details, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    console.log(`${status} ${testName}${details ? ` - ${details}` : ''}`);
  }

  /**
   * Test health endpoint
   */
  async testHealthCheck() {
    try {
      const response = await this.makeRequest('GET', '/api/health');
      
      if (response.status === 200 && response.body?.status === 'healthy') {
        this.logResult('Health Check', true, `Status: ${response.body.status}`);
        return true;
      } else {
        this.logResult('Health Check', false, `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`);
        return false;
      }
    } catch (error) {
      this.logResult('Health Check', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test detailed health endpoint
   */
  async testDetailedHealthCheck() {
    try {
      const response = await this.makeRequest('GET', '/api/health/detailed');
      
      if (response.status === 200 && response.body?.database?.status === 'connected') {
        this.logResult('Detailed Health Check', true, `Database: ${response.body.database.status}`);
        return true;
      } else {
        this.logResult('Detailed Health Check', false, `Status: ${response.status}, Database: ${response.body?.database?.status || 'unknown'}`);
        return false;
      }
    } catch (error) {
      this.logResult('Detailed Health Check', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test user registration
   */
  async testUserRegistration() {
    try {
      const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123'
      };

      const response = await this.makeRequest('POST', '/api/auth/register', testUser);
      
      if (response.status === 201 && response.body?.token) {
        this.authToken = response.body.token;
        this.userId = response.body.user._id;
        this.logResult('User Registration', true, `User ID: ${this.userId}`);
        return true;
      } else {
        this.logResult('User Registration', false, `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`);
        return false;
      }
    } catch (error) {
      this.logResult('User Registration', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test user login
   */
  async testUserLogin() {
    try {
      const loginData = {
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123'
      };

      const response = await this.makeRequest('POST', '/api/auth/login', loginData);
      
      if (response.status === 200 && response.body?.token) {
        this.authToken = response.body.token;
        this.logResult('User Login', true, 'Login successful');
        return true;
      } else {
        this.logResult('User Login', false, `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`);
        return false;
      }
    } catch (error) {
      this.logResult('User Login', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test get user profile
   */
  async testGetProfile() {
    if (!this.authToken) {
      this.logResult('Get Profile', false, 'No auth token available');
      return false;
    }

    try {
      const response = await this.makeRequest('GET', '/api/auth/profile', null, {
        'Authorization': `Bearer ${this.authToken}`
      });
      
      if (response.status === 200 && response.body?.user) {
        this.logResult('Get Profile', true, `Username: ${response.body.user.username}`);
        return true;
      } else {
        this.logResult('Get Profile', false, `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`);
        return false;
      }
    } catch (error) {
      this.logResult('Get Profile', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test create product
   */
  async testCreateProduct() {
    if (!this.authToken) {
      this.logResult('Create Product', false, 'No auth token available');
      return false;
    }

    try {
      const productData = {
        name: `Test Product ${Date.now()}`,
        price: 99.99,
        quantity: 10
      };

      const response = await this.makeRequest('POST', '/api/products', productData, {
        'Authorization': `Bearer ${this.authToken}`
      });
      
      if (response.status === 201 && response.body?.product?._id) {
        this.productId = response.body.product._id;
        this.logResult('Create Product', true, `Product ID: ${this.productId}`);
        return true;
      } else {
        this.logResult('Create Product', false, `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`);
        return false;
      }
    } catch (error) {
      this.logResult('Create Product', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test get products
   */
  async testGetProducts() {
    if (!this.authToken) {
      this.logResult('Get Products', false, 'No auth token available');
      return false;
    }

    try {
      const response = await this.makeRequest('GET', '/api/products', null, {
        'Authorization': `Bearer ${this.authToken}`
      });
      
      if (response.status === 200 && Array.isArray(response.body?.products)) {
        this.logResult('Get Products', true, `Found ${response.body.products.length} products`);
        return true;
      } else {
        this.logResult('Get Products', false, `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`);
        return false;
      }
    } catch (error) {
      this.logResult('Get Products', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test get product by ID
   */
  async testGetProductById() {
    if (!this.authToken || !this.productId) {
      this.logResult('Get Product by ID', false, 'No auth token or product ID available');
      return false;
    }

    try {
      const response = await this.makeRequest('GET', `/api/products/${this.productId}`, null, {
        'Authorization': `Bearer ${this.authToken}`
      });
      
      if (response.status === 200 && response.body?.product?._id === this.productId) {
        this.logResult('Get Product by ID', true, `Product: ${response.body.product.name}`);
        return true;
      } else {
        this.logResult('Get Product by ID', false, `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`);
        return false;
      }
    } catch (error) {
      this.logResult('Get Product by ID', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test get inventory statistics
   */
  async testGetInventoryStats() {
    if (!this.authToken) {
      this.logResult('Get Inventory Stats', false, 'No auth token available');
      return false;
    }

    try {
      const response = await this.makeRequest('GET', '/api/products/stats', null, {
        'Authorization': `Bearer ${this.authToken}`
      });
      
      if (response.status === 200 && response.body?.stats) {
        this.logResult('Get Inventory Stats', true, `Total Products: ${response.body.stats.totalProducts}`);
        return true;
      } else {
        this.logResult('Get Inventory Stats', false, `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`);
        return false;
      }
    } catch (error) {
      this.logResult('Get Inventory Stats', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test unauthorized access
   */
  async testUnauthorizedAccess() {
    try {
      const response = await this.makeRequest('GET', '/api/products');
      
      if (response.status === 401) {
        this.logResult('Unauthorized Access', true, 'Correctly rejected unauthorized request');
        return true;
      } else {
        this.logResult('Unauthorized Access', false, `Expected 401, got ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logResult('Unauthorized Access', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log(`🚀 Starting deployment tests for: ${this.baseUrl}`);
    console.log('=' .repeat(60));

    // Health checks
    await this.testHealthCheck();
    await this.testDetailedHealthCheck();

    // Authentication tests
    await this.testUserRegistration();
    await this.testUserLogin();
    await this.testGetProfile();

    // Product management tests
    await this.testCreateProduct();
    await this.testGetProducts();
    await this.testGetProductById();
    await this.testGetInventoryStats();

    // Security tests
    await this.testUnauthorizedAccess();

    // Summary
    console.log('=' .repeat(60));
    const passedTests = this.testResults.filter(r => r.success).length;
    const totalTests = this.testResults.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`📊 Test Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${totalTests - passedTests}`);
    console.log(`   Success Rate: ${successRate}%`);

    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Your deployment is working correctly.');
      return true;
    } else {
      console.log('⚠️  Some tests failed. Please check the deployment configuration.');
      return false;
    }
  }

  /**
   * Generate test report
   */
  generateReport() {
    return {
      baseUrl: this.baseUrl,
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.success).length,
        failed: this.testResults.filter(r => !r.success).length
      },
      results: this.testResults
    };
  }
}

// Main execution
async function main() {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.error('❌ Please provide the base URL for testing');
    console.error('Usage: node scripts/test-deployment.js <base-url>');
    console.error('Example: node scripts/test-deployment.js https://your-app.railway.app');
    process.exit(1);
  }

  const tester = new DeploymentTester(baseUrl);
  const success = await tester.runAllTests();
  
  // Save report to file
  const fs = require('fs');
  const report = tester.generateReport();
  fs.writeFileSync('deployment-test-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Test report saved to: deployment-test-report.json');
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DeploymentTester; 
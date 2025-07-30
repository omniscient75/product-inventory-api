// Test setup file for Jest
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/product-inventory-test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
} 
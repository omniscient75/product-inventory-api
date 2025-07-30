/**
 * Product Inventory API - Main Server File
 * 
 * This is the main entry point for the Product Inventory API application.
 * It sets up the Express server, connects to MongoDB, applies middleware,
 * mounts routes, and handles global error processing.
 * 
 * Key Features:
 * - Express server configuration with security middleware
 * - MongoDB database connection
 * - JWT-based authentication system
 * - Rate limiting and CORS protection
 * - Global error handling
 * - Health monitoring endpoints
 * 
 * Dependencies:
 * - express: Web framework for Node.js
 * - cors: Cross-Origin Resource Sharing middleware
 * - dotenv: Environment variable management
 * - mongoose: MongoDB ODM for database operations
 * 
 * @author Product Inventory API Team
 * @created 2024-01-XX
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection function
const connectDB = require('./config/database');

// Import error handling middleware for global error processing
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');

// Import security middleware and configurations
const { 
  securityMiddleware, 
  generalLimiter, 
  authLimiter,
  corsOptions 
} = require('./middleware/security');

// Import route modules for different API endpoints
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const healthRoutes = require('./routes/health');

// Initialize Express application instance
const app = express();

// Set server port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Environment Variable Validation
 * 
 * Ensures that critical environment variables are set before starting the server.
 * This prevents runtime errors and provides helpful setup instructions.
 */
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  console.log('📝 Please create a .env file with the following content:');
  console.log(`
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/product-inventory

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# Security Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
  `);
  process.exit(1);
}

/**
 * Database Connection
 * 
 * Establishes connection to MongoDB using the connection string from environment variables.
 * The connection is handled by the connectDB function in config/database.js
 */
connectDB();

/**
 * Middleware Configuration
 * 
 * Applies various middleware functions to enhance security, handle requests,
 * and provide additional functionality to the application.
 */

// Apply security middleware stack (Helmet, sanitization, logging)
app.use(securityMiddleware);

// Configure Cross-Origin Resource Sharing (CORS)
// Allows or restricts cross-origin requests based on configuration
app.use(cors(corsOptions));

// Body parsing middleware for handling JSON and URL-encoded data
// Limit set to 10MB to prevent large payload attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Rate Limiting Configuration
 * 
 * Implements rate limiting to prevent abuse and brute force attacks:
 * - General API endpoints: 100 requests per 15 minutes
 * - Authentication endpoints: 5 requests per 15 minutes (stricter)
 */
app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

/**
 * Route Configuration
 * 
 * Mounts different route modules to handle specific API endpoints.
 * Each route module contains related endpoints for a specific feature.
 */
app.use('/api/auth', authRoutes);      // Authentication endpoints
app.use('/api/products', productRoutes); // Product management endpoints
app.use('/api/health', healthRoutes);    // Health monitoring endpoints

/**
 * Legacy Health Check Route
 * 
 * Provides a simple health check endpoint for backward compatibility.
 * Returns basic server status information.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with server status
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Product Inventory API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Error Handling Configuration
 * 
 * These middleware functions must be placed after all routes:
 * - notFound: Handles 404 errors for undefined routes
 * - globalErrorHandler: Processes all other errors globally
 */
app.use(notFound);
app.use(globalErrorHandler);

/**
 * Server Startup
 * 
 * Starts the Express server on the specified port and logs startup information.
 * The server will handle incoming HTTP requests and route them to appropriate handlers.
 */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

/**
 * Module Export
 * 
 * Exports the Express app instance for testing purposes.
 * This allows the app to be imported in test files without starting the server.
 */
module.exports = app; 
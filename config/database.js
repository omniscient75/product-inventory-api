/**
 * Database Configuration Module
 * 
 * Handles the connection to MongoDB database using Mongoose ODM.
 * This module provides a centralized way to manage database connections
 * and handle connection errors gracefully.
 * 
 * Dependencies:
 * - mongoose: MongoDB Object Document Mapper (ODM)
 * - dotenv: Environment variable management (loaded in server.js)
 * 
 * @author Product Inventory API Team
 * @created 2024-01-XX
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database
 * 
 * Establishes a connection to MongoDB using the connection string from environment variables.
 * Uses Mongoose's modern connection options for better performance and compatibility.
 * 
 * @description Attempts to connect to MongoDB and logs the connection status
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} If connection fails, logs error and exits process
 * 
 * @example
 * // In server.js
 * const connectDB = require('./config/database');
 * connectDB(); // Connect to database on server startup
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using connection string from environment
    // useNewUrlParser: true - Use new URL parser for better compatibility
    // useUnifiedTopology: true - Use new server discovery and monitoring engine
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log successful connection with host information
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log connection error and exit process to prevent server startup with invalid database
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Module Export
 * 
 * Exports the connectDB function for use in the main server file.
 */
module.exports = connectDB; 
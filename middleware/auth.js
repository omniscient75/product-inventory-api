/**
 * Authentication Middleware
 * 
 * Provides JWT-based authentication and authorization middleware for the API.
 * This module handles token verification, user lookup, and role-based access control.
 * 
 * Key Features:
 * - JWT token extraction and verification
 * - User authentication and status validation
 * - Role-based authorization (admin access)
 * - Comprehensive error handling for different token scenarios
 * 
 * Dependencies:
 * - jsonwebtoken: JWT token verification
 * - mongoose: Database user lookup
 * 
 * @author Product Inventory API Team
 * @created 2024-01-XX
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and authenticates users for protected routes.
 * This middleware extracts the token from the Authorization header,
 * verifies its validity, and attaches the user object to the request.
 * 
 * @description Authenticates users using JWT tokens
 * @param {Object} req - Express request object
 * @param {string} req.header.Authorization - Bearer token in format "Bearer <token>"
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void} Calls next() on success or sends error response
 * @throws {401} If no token provided, invalid token, or user not found
 * @throws {500} If token verification fails
 * 
 * @example
 * // In route definition
 * router.get('/protected', auth, (req, res) => {
 *   // req.user is now available with authenticated user data
 *   res.json({ user: req.user });
 * });
 */
const auth = async (req, res, next) => {
  try {
    /**
     * Token Extraction
     * 
     * Extracts the JWT token from the Authorization header.
     * Expected format: "Bearer <token>"
     * Uses optional chaining (?.) to safely handle missing headers.
     */
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token is provided
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    /**
     * Token Verification
     * 
     * Verifies the JWT token using the secret key from environment variables.
     * This ensures the token was issued by our application and hasn't been tampered with.
     */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    /**
     * User Lookup
     * 
     * Finds the user in the database using the decoded user ID.
     * Excludes the password field for security reasons.
     */
    const user = await User.findById(decoded.userId).select('-password');
    
    // Check if user exists and is active
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found or inactive.' 
      });
    }

    // Attach user object to request for use in subsequent middleware/routes
    req.user = user;
    next();
  } catch (error) {
    /**
     * Error Handling
     * 
     * Handles different types of JWT verification errors with appropriate responses.
     * This provides clear feedback to clients about authentication issues.
     */
    
    // Invalid token format or signature
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    
    // Token has expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.' 
      });
    }
    
    // Other unexpected errors
    res.status(500).json({ 
      error: 'Token verification failed.' 
    });
  }
};

/**
 * Admin Authorization Middleware
 * 
 * Extends the basic authentication middleware to check for admin privileges.
 * This middleware first authenticates the user, then verifies they have admin role.
 * 
 * @description Verifies user authentication and admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void} Calls next() on success or sends error response
 * @throws {401} If authentication fails (handled by auth middleware)
 * @throws {403} If user is not an admin
 * @throws {500} If admin verification fails
 * 
 * @example
 * // In route definition
 * router.get('/admin-only', adminAuth, (req, res) => {
 *   // Only admin users can access this route
 *   res.json({ message: 'Admin access granted' });
 * });
 */
const adminAuth = async (req, res, next) => {
  try {
    // First, authenticate the user using the auth middleware
    await auth(req, res, () => {
      // Check if the authenticated user has admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Access denied. Admin privileges required.' 
        });
      }
      // User is authenticated and has admin role, proceed
      next();
    });
  } catch (error) {
    // Handle any unexpected errors during admin verification
    res.status(500).json({ 
      error: 'Admin verification failed.' 
    });
  }
};

/**
 * Module Exports
 * 
 * Exports both authentication middleware functions for use in routes.
 * - auth: Basic user authentication
 * - adminAuth: Authentication + admin role verification
 */
module.exports = { auth, adminAuth }; 
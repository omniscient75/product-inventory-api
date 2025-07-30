/**
 * Authentication Controller
 * 
 * Handles user authentication, registration, and profile management operations.
 * This controller provides secure user account management with JWT-based authentication.
 * 
 * Key Features:
 * - User registration with duplicate checking
 * - Secure login with password verification
 * - JWT token generation and management
 * - Profile retrieval and updates
 * - Account status validation
 * 
 * Dependencies:
 * - jsonwebtoken: JWT token generation and verification
 * - bcryptjs: Password hashing (via User model)
 * - mongoose: Database operations
 * 
 * @author Product Inventory API Team
 * @created 2024-01-XX
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { 
  ValidationError, 
  AuthenticationError, 
  ConflictError, 
  NotFoundError 
} = require('../utils/errors');
const { catchAsync } = require('../middleware/errorHandler');

/**
 * Generate JWT Token
 * 
 * Creates a JSON Web Token for user authentication.
 * The token contains the user ID and expires after a configurable period.
 * 
 * @description Generates JWT token for user authentication
 * @param {string} userId - User's unique identifier
 * @returns {string} JWT token string
 * 
 * @example
 * const token = generateToken(user._id);
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register New User
 * 
 * Creates a new user account with secure password hashing and duplicate checking.
 * This endpoint handles user registration with comprehensive validation.
 * 
 * @description Registers a new user with hashed password and returns JWT token
 * @param {Object} req - Express request object
 * @param {string} req.body.username - User's chosen username (3-30 characters)
 * @param {string} req.body.email - User's email address (must be unique)
 * @param {string} req.body.password - User's plain text password (min 6 characters)
 * @param {string} [req.body.role] - User role ('user' or 'admin', defaults to 'user')
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data and JWT token
 * @throws {ConflictError} If email or username already exists
 * @throws {ValidationError} If input validation fails
 * 
 * @example
 * POST /api/auth/register
 * {
 *   "username": "john_doe",
 *   "email": "john@example.com",
 *   "password": "Password123",
 *   "role": "user"
 * }
 */
const register = catchAsync(async (req, res) => {
  // Extract user data from request body
  const { username, email, password, role } = req.body;

  /**
   * Duplicate User Check
   * 
   * Checks if a user with the same email or username already exists.
   * This prevents duplicate accounts and ensures data integrity.
   */
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    // Determine which field caused the conflict for better error messaging
    throw new ConflictError(
      existingUser.email === email 
        ? 'Email is already registered' 
        : 'Username is already taken'
    );
  }

  /**
   * User Creation
   * 
   * Creates a new user instance with the provided data.
   * The password will be automatically hashed by the User model's pre-save middleware.
   */
  const user = new User({
    username,
    email,
    password,
    role: role || 'user' // Default to 'user' role if not specified
  });

  // Save user to database (password will be hashed automatically)
  await user.save();

  // Generate JWT token for immediate authentication
  const token = generateToken(user._id);

  // Return success response with user data (password excluded) and token
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    user: user.toJSON(), // Excludes password field
    token
  });
});

/**
 * User Login
 * 
 * Authenticates a user with email and password, returning a JWT token for subsequent requests.
 * This endpoint handles secure login with comprehensive validation and security checks.
 * 
 * @description Authenticates user credentials and returns JWT token
 * @param {Object} req - Express request object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain text password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data and JWT token
 * @throws {AuthenticationError} If credentials are invalid or account is disabled
 * @throws {ValidationError} If input validation fails
 * 
 * @example
 * POST /api/auth/login
 * {
 *   "email": "john@example.com",
 *   "password": "Password123"
 * }
 */
const login = catchAsync(async (req, res) => {
  // Extract login credentials from request body
  const { email, password } = req.body;

  /**
   * User Lookup
   * 
   * Finds the user by email address. If no user is found, we don't reveal
   * whether the email exists or not for security reasons.
   */
  const user = await User.findOne({ email });
  if (!user) {
    throw new AuthenticationError('Email or password is incorrect');
  }

  /**
   * Account Status Check
   * 
   * Verifies that the user account is active and not disabled.
   * This prevents login attempts on deactivated accounts.
   */
  if (!user.isActive) {
    throw new AuthenticationError('Your account has been disabled. Please contact administrator.');
  }

  /**
   * Password Verification
   * 
   * Compares the provided password with the stored hashed password.
   * Uses bcrypt comparison for secure password checking.
   */
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Email or password is incorrect');
  }

  // Generate JWT token for authenticated session
  const token = generateToken(user._id);

  // Return success response with user data and authentication token
  res.json({
    status: 'success',
    message: 'Login successful',
    user: user.toJSON(), // Excludes password field
    token
  });
});

/**
 * Get Current User Profile
 * 
 * Retrieves the profile information of the currently authenticated user.
 * This endpoint requires a valid JWT token in the Authorization header.
 * 
 * @description Returns current user's profile information
 * @param {Object} req - Express request object (includes req.user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user profile data
 * @throws {AuthenticationError} If no valid JWT token is provided
 * 
 * @example
 * GET /api/auth/profile
 * Authorization: Bearer <jwt_token>
 */
const getProfile = catchAsync(async (req, res) => {
  // Return user profile data (req.user is set by auth middleware)
  res.json({
    status: 'success',
    message: 'Profile retrieved successfully',
    user: req.user // User data from JWT token (password excluded)
  });
});

/**
 * Update User Profile
 * 
 * Updates the profile information of the currently authenticated user.
 * This endpoint allows users to modify their username and email with duplicate checking.
 * 
 * @description Updates user profile information with validation
 * @param {Object} req - Express request object
 * @param {string} [req.body.username] - New username (optional)
 * @param {string} [req.body.email] - New email address (optional)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user data
 * @throws {ConflictError} If new email or username is already taken
 * @throws {ValidationError} If input validation fails
 * @throws {AuthenticationError} If no valid JWT token is provided
 * 
 * @example
 * PUT /api/auth/profile
 * Authorization: Bearer <jwt_token>
 * {
 *   "username": "new_username",
 *   "email": "newemail@example.com"
 * }
 */
const updateProfile = catchAsync(async (req, res) => {
  // Extract update data from request body
  const { username, email } = req.body;
  const userId = req.user._id;

  /**
   * Email Duplicate Check
   * 
   * Checks if the new email is already taken by another user.
   * Excludes the current user from the check using $ne (not equal) operator.
   */
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new ConflictError('This email is already registered by another user');
    }
  }

  /**
   * Username Duplicate Check
   * 
   * Checks if the new username is already taken by another user.
   * Excludes the current user from the check using $ne (not equal) operator.
   */
  if (username && username !== req.user.username) {
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      throw new ConflictError('This username is already taken by another user');
    }
  }

  /**
   * User Update
   * 
   * Updates the user document with new information.
   * Uses findByIdAndUpdate with options for validation and returning updated document.
   */
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { username, email },
    { 
      new: true,        // Return the updated document
      runValidators: true // Run schema validators on update
    }
  ).select('-password'); // Exclude password field from response

  // Return success response with updated user data
  res.json({
    status: 'success',
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

/**
 * Module Exports
 * 
 * Exports all authentication controller functions for use in routes.
 * Each function is wrapped with catchAsync for consistent error handling.
 */
module.exports = {
  register,
  login,
  getProfile,
  updateProfile
}; 
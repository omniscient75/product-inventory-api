/**
 * User Model
 * 
 * Defines the Mongoose schema for user accounts in the Product Inventory API.
 * This model handles user authentication, authorization, and profile management.
 * 
 * Key Features:
 * - Secure password hashing using bcrypt
 * - Email and username uniqueness validation
 * - Role-based access control (user/admin)
 * - Account activation status
 * - Automatic timestamps for audit trail
 * 
 * Dependencies:
 * - mongoose: MongoDB ODM for schema definition
 * - bcryptjs: Password hashing library for security
 * 
 * @author Product Inventory API Team
 * @created 2024-01-XX
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * 
 * Defines the structure and validation rules for user documents in MongoDB.
 * Each field includes validation rules, default values, and security measures.
 */
const userSchema = new mongoose.Schema({
  /**
   * Username field - Unique identifier for user accounts
   * - Required field with custom error message
   * - Unique constraint prevents duplicate usernames
   * - Trimmed to remove leading/trailing whitespace
   * - Length validation: 3-30 characters
   */
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  
  /**
   * Email field - Primary contact and login identifier
   * - Required field with custom error message
   * - Unique constraint prevents duplicate emails
   * - Automatically converted to lowercase for consistency
   * - Trimmed to remove leading/trailing whitespace
   * - Regex validation ensures valid email format
   */
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  /**
   * Password field - Secure authentication credential
   * - Required field with custom error message
   * - Minimum length validation for security
   * - Will be hashed by pre-save middleware
   * - Never stored in plain text
   */
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  /**
   * Role field - Role-based access control
   * - Enum restricts values to 'user' or 'admin'
   * - Default value is 'user' for new accounts
   * - Used for authorization in protected routes
   */
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  /**
   * Account status - Soft delete functionality
   * - Boolean field with default value of true
   * - Allows deactivating accounts without deletion
   * - Used for account management and security
   */
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  // Enable automatic timestamp fields (createdAt, updatedAt)
  timestamps: true
});

/**
 * Pre-save Middleware - Password Hashing
 * 
 * Automatically hashes the password before saving to the database.
 * This ensures passwords are never stored in plain text and provides
 * security against data breaches.
 * 
 * @description Hashes password using bcrypt with configurable salt rounds
 * @param {Function} next - Mongoose middleware next function
 * @throws {Error} If password hashing fails
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (prevents re-hashing on every save)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt with configurable rounds (default: 12)
    // Higher rounds = more secure but slower
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    
    // Hash the password with the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare Password Method
 * 
 * Compares a candidate password with the stored hashed password.
 * Used during login to verify user credentials.
 * 
 * @description Compares plain text password with stored hash
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * 
 * @example
 * const user = await User.findOne({ email: 'user@example.com' });
 * const isValid = await user.comparePassword('plainTextPassword');
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * To JSON Method - Security Enhancement
 * 
 * Overrides the default toJSON method to exclude sensitive data
 * when converting user documents to JSON. This prevents password
 * exposure in API responses.
 * 
 * @description Removes password field from JSON output
 * @returns {Object} User object without password field
 * 
 * @example
 * const user = await User.findById(id);
 * const userJson = user.toJSON(); // Password field is excluded
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password; // Remove password for security
  return user;
};

/**
 * Module Export
 * 
 * Exports the User model for use throughout the application.
 * The model includes all schema definitions, middleware, and instance methods.
 */
module.exports = mongoose.model('User', userSchema); 
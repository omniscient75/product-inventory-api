/**
 * Product Model
 * 
 * Defines the Mongoose schema for products in the Product Inventory API.
 * This model handles product information, inventory tracking, and business logic.
 * 
 * Key Features:
 * - Comprehensive product information management
 * - Inventory tracking with stock levels
 * - SKU-based product identification
 * - Profit margin calculations
 * - Stock status monitoring
 * - Supplier information tracking
 * - User ownership and audit trail
 * 
 * Dependencies:
 * - mongoose: MongoDB ODM for schema definition
 * 
 * @author Product Inventory API Team
 * @created 2024-01-XX
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Product Schema Definition
 * 
 * Defines the structure and validation rules for product documents in MongoDB.
 * Includes comprehensive fields for product management, inventory tracking,
 * and business analytics.
 */
const productSchema = new mongoose.Schema({
  /**
   * Product name - Primary identifier for the product
   * - Required field with custom error message
   * - Trimmed to remove leading/trailing whitespace
   * - Maximum length of 100 characters for database efficiency
   */
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  
  /**
   * Product description - Detailed information about the product
   * - Required field with custom error message
   * - Trimmed to remove leading/trailing whitespace
   * - Maximum length of 500 characters for detailed descriptions
   */
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  /**
   * SKU (Stock Keeping Unit) - Unique product identifier
   * - Required field with custom error message
   * - Unique constraint prevents duplicate SKUs across all products
   * - Trimmed to remove leading/trailing whitespace
   * - Automatically converted to uppercase for consistency
   * - Indexed for fast lookups and queries
   */
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  
  /**
   * Product category - Classification for organization and filtering
   * - Required field with custom error message
   * - Trimmed to remove leading/trailing whitespace
   * - Used for product organization and search functionality
   */
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  
  /**
   * Selling price - Price at which the product is sold to customers
   * - Required field with custom error message
   * - Minimum value of 0 (no negative prices)
   * - Used for revenue calculations and profit margin computation
   */
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  /**
   * Product cost - Cost to acquire or manufacture the product
   * - Required field with custom error message
   * - Minimum value of 0 (no negative costs)
   * - Used for profit margin calculations and cost analysis
   */
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  
  /**
   * Current quantity - Number of units currently in stock
   * - Required field with custom error message
   * - Minimum value of 0 (no negative quantities)
   * - Default value of 0 for new products
   * - Used for stock level monitoring and reorder decisions
   */
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  
  /**
   * Minimum quantity - Threshold for low stock alerts
   * - Minimum value of 0 (no negative thresholds)
   * - Default value of 0 (no alerts by default)
   * - Used to trigger low stock notifications
   */
  minQuantity: {
    type: Number,
    min: [0, 'Minimum quantity cannot be negative'],
    default: 0
  },
  
  /**
   * Maximum quantity - Upper limit for inventory management
   * - Minimum value of 0 (no negative limits)
   * - Used for inventory planning and storage capacity
   */
  maxQuantity: {
    type: Number,
    min: [0, 'Maximum quantity cannot be negative']
  },
  
  /**
   * Unit of measurement - How the product is measured/sold
   * - Required field with custom error message
   * - Trimmed to remove leading/trailing whitespace
   * - Examples: pieces, kg, liters, boxes, etc.
   */
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  
  /**
   * Supplier information - Details about product supplier
   * - Optional nested object for supplier details
   * - name: Supplier company or individual name
   * - contact: Contact information (phone, email, etc.)
   */
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    }
  },
  
  /**
   * Storage location - Physical location where product is stored
   * - Optional field for warehouse management
   * - Trimmed to remove leading/trailing whitespace
   * - Examples: Warehouse A, Shelf B3, Room 101, etc.
   */
  location: {
    type: String,
    trim: true
  },
  
  /**
   * Product status - Soft delete functionality
   * - Boolean field with default value of true
   * - Allows deactivating products without deletion
   * - Used for product lifecycle management
   */
  isActive: {
    type: Boolean,
    default: true
  },
  
  /**
   * Created by - User who created the product
   * - Required field linking to User model
   * - ObjectId reference for user ownership
   * - Used for authorization and audit trail
   */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  // Enable automatic timestamp fields (createdAt, updatedAt)
  timestamps: true
});

/**
 * Database Indexes
 * 
 * Creates indexes on frequently queried fields to improve query performance.
 * These indexes speed up database operations for category filtering and active product queries.
 */
productSchema.index({ category: 1 });  // Index for category-based queries
productSchema.index({ isActive: 1 });  // Index for active/inactive product filtering

/**
 * Virtual Fields
 * 
 * Computed fields that are calculated on-the-fly and not stored in the database.
 * These provide additional business logic and analytics without requiring additional storage.
 */

/**
 * Profit Margin Virtual Field
 * 
 * Calculates the profit margin percentage based on price and cost.
 * Formula: ((price - cost) / cost) * 100
 * 
 * @description Calculates profit margin as a percentage
 * @returns {string} Profit margin percentage with 2 decimal places
 * 
 * @example
 * const product = await Product.findById(id);
 * console.log(product.profitMargin); // "25.50" (25.50%)
 */
productSchema.virtual('profitMargin').get(function() {
  // Prevent division by zero
  if (this.cost === 0) return 0;
  
  // Calculate profit margin: ((price - cost) / cost) * 100
  return ((this.price - this.cost) / this.cost * 100).toFixed(2);
});

/**
 * Stock Status Virtual Field
 * 
 * Determines the current stock status based on quantity and minimum quantity threshold.
 * Provides quick insight into inventory levels for business decisions.
 * 
 * @description Determines stock status based on current quantity
 * @returns {string} Stock status: 'out-of-stock', 'low-stock', or 'in-stock'
 * 
 * @example
 * const product = await Product.findById(id);
 * console.log(product.stockStatus); // "low-stock"
 */
productSchema.virtual('stockStatus').get(function() {
  // Check if product is completely out of stock
  if (this.quantity <= 0) return 'out-of-stock';
  
  // Check if product is below minimum quantity threshold
  if (this.quantity <= this.minQuantity) return 'low-stock';
  
  // Product has sufficient stock
  return 'in-stock';
});

/**
 * Virtual Field Serialization
 * 
 * Ensures that virtual fields are included when converting documents to JSON or plain objects.
 * This makes computed fields available in API responses.
 */
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

/**
 * Module Export
 * 
 * Exports the Product model for use throughout the application.
 * The model includes all schema definitions, indexes, virtual fields, and serialization settings.
 */
module.exports = mongoose.model('Product', productSchema); 
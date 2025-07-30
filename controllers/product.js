const Product = require('../models/Product');
const { 
  ValidationError, 
  NotFoundError, 
  AuthorizationError, 
  ConflictError 
} = require('../utils/errors');
const { catchAsync } = require('../middleware/errorHandler');

// Create new product
const createProduct = catchAsync(async (req, res) => {
  const productData = {
    ...req.body,
    createdBy: req.user._id
  };

  const product = new Product(productData);
  await product.save();

  res.status(201).json({
    status: 'success',
    message: 'Product created successfully',
    product
  });
});

// Get all products with pagination and filtering (only user's own products)
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      stockStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - only user's own products
    const filter = { 
      isActive: true,
      createdBy: req.user._id  // Only show user's own products
    };
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (stockStatus) {
      switch (stockStatus) {
        case 'in-stock':
          filter.quantity = { $gt: 0 };
          break;
        case 'out-of-stock':
          filter.quantity = 0;
          break;
        case 'low-stock':
          filter.$expr = { $lte: ['$quantity', '$minQuantity'] };
          break;
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .populate('createdBy', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      message: 'Products retrieved successfully',
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNextPage: skip + products.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to get products',
      message: error.message
    });
  }
};

// Get single product by ID (only if user owns it)
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the provided ID'
      });
    }

    // Check if user owns this product
    if (product.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own products'
      });
    }

    res.json({
      message: 'Product retrieved successfully',
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Please provide a valid product ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to get product',
      message: error.message
    });
  }
};

// Update product (only if user owns it)
const updateProduct = async (req, res) => {
  try {
    // First check if product exists and user owns it
    const existingProduct = await Product.findById(req.params.id);
    
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the provided ID'
      });
    }

    // Check if user owns this product
    if (existingProduct.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own products'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email');

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Please provide a valid product ID'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate SKU',
        message: 'A product with this SKU already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update product',
      message: error.message
    });
  }
};

// Delete product (soft delete, only if user owns it)
const deleteProduct = async (req, res) => {
  try {
    // First check if product exists and user owns it
    const existingProduct = await Product.findById(req.params.id);
    
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the provided ID'
      });
    }

    // Check if user owns this product
    if (existingProduct.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own products'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.json({
      message: 'Product deleted successfully',
      product
    });
  } catch (error) {
    console.error('Delete product error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Please provide a valid product ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to delete product',
      message: error.message
    });
  }
};

// Update product quantity (for inventory management, only if user owns it)
const updateQuantity = async (req, res) => {
  try {
    const { quantity, operation = 'set' } = req.body;
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        error: 'Invalid quantity',
        message: 'Quantity must be a non-negative number'
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the provided ID'
      });
    }

    // Check if user owns this product
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update quantity for your own products'
      });
    }

    let newQuantity;
    switch (operation) {
      case 'add':
        newQuantity = product.quantity + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, product.quantity - quantity);
        break;
      case 'set':
      default:
        newQuantity = quantity;
        break;
    }

    product.quantity = newQuantity;
    await product.save();

    res.json({
      message: 'Product quantity updated successfully',
      product
    });
  } catch (error) {
    console.error('Update quantity error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Please provide a valid product ID'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update product quantity',
      message: error.message
    });
  }
};

// Get inventory statistics (only user's own products)
const getInventoryStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true, createdBy: req.user._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          totalCost: { $sum: { $multiply: ['$cost', '$quantity'] } },
          lowStockProducts: {
            $sum: {
              $cond: [
                { $lte: ['$quantity', '$minQuantity'] },
                1,
                0
              ]
            }
          },
          outOfStockProducts: {
            $sum: {
              $cond: [
                { $eq: ['$quantity', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { isActive: true, createdBy: req.user._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      message: 'Inventory statistics retrieved successfully',
      stats: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        totalCost: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0
      },
      categoryStats
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      error: 'Failed to get inventory statistics',
      message: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateQuantity,
  getInventoryStats
}; 
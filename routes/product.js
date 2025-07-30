const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateQuantity,
  getInventoryStats
} = require('../controllers/product');

const { validate, productValidation } = require('../middleware/validation');
const { auth, adminAuth } = require('../middleware/auth');
const { commonValidations } = require('../middleware/security');

// All product routes require authentication
router.use(auth);

// Product CRUD operations
router.post('/', commonValidations.productCreate, createProduct);
router.get('/', getProducts);
router.get('/stats', getInventoryStats);
router.get('/:id', getProduct);
router.put('/:id', commonValidations.productUpdate, updateProduct);
router.delete('/:id', deleteProduct);

// Inventory management
router.patch('/:id/quantity', commonValidations.quantityUpdate, updateQuantity);

module.exports = router; 
const express = require('express');
const router = express.Router();

const { healthCheck, detailedHealthCheck } = require('../controllers/health');
const { generalLimiter } = require('../middleware/security');

// Health check routes
router.get('/', generalLimiter, healthCheck);
router.get('/detailed', generalLimiter, detailedHealthCheck);

module.exports = router; 
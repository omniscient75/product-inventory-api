const express = require('express');
const router = express.Router();

const { register, login, getProfile, updateProfile } = require('../controllers/auth');
const { validate, userValidation } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { commonValidations } = require('../middleware/security');

// Public routes
router.post('/register', commonValidations.userRegister, register);
router.post('/login', commonValidations.userLogin, login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, commonValidations.userRegister.slice(0, -1), updateProfile);

module.exports = router; 
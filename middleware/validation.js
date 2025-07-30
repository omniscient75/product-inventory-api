const Joi = require('joi');

// Validation schemas
const userValidation = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    role: Joi.string()
      .valid('user', 'admin')
      .default('user')
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  updateProfile: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
      }),
    email: Joi.string()
      .email()
      .messages({
        'string.email': 'Please enter a valid email address'
      })
  })
};

const productValidation = {
  // Basic product validation (as per requirements)
  basic: Joi.object({
    name: Joi.string()
      .min(2)
      .required()
      .messages({
        'string.min': 'Product name must be at least 2 characters long',
        'any.required': 'Product name is required'
      }),
    price: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required'
      }),
    quantity: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'Quantity cannot be negative',
        'any.required': 'Quantity is required'
      })
  }),

  // Full product validation (enhanced features)
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Product name must be at least 2 characters long',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
      }),
    description: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'Description cannot exceed 500 characters',
        'any.required': 'Product description is required'
      }),
    sku: Joi.string()
      .required()
      .messages({
        'any.required': 'SKU is required'
      }),
    category: Joi.string()
      .required()
      .messages({
        'any.required': 'Category is required'
      }),
    price: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required'
      }),
    cost: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'Cost cannot be negative',
        'any.required': 'Cost is required'
      }),
    quantity: Joi.number()
      .min(0)
      .default(0)
      .messages({
        'number.min': 'Quantity cannot be negative'
      }),
    minQuantity: Joi.number()
      .min(0)
      .default(0)
      .messages({
        'number.min': 'Minimum quantity cannot be negative'
      }),
    maxQuantity: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Maximum quantity cannot be negative'
      }),
    unit: Joi.string()
      .required()
      .messages({
        'any.required': 'Unit is required'
      }),
    supplier: Joi.object({
      name: Joi.string(),
      contact: Joi.string()
    }),
    location: Joi.string()
  }),

  update: Joi.object({
    name: Joi.string()
      .max(100)
      .messages({
        'string.max': 'Product name cannot exceed 100 characters'
      }),
    description: Joi.string()
      .max(500)
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    category: Joi.string(),
    price: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Price cannot be negative'
      }),
    cost: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Cost cannot be negative'
      }),
    quantity: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Quantity cannot be negative'
      }),
    minQuantity: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Minimum quantity cannot be negative'
      }),
    maxQuantity: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Maximum quantity cannot be negative'
      }),
    unit: Joi.string(),
    supplier: Joi.object({
      name: Joi.string(),
      contact: Joi.string()
    }),
    location: Joi.string(),
    isActive: Joi.boolean()
  })
};

// Validation middleware function
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: 'Validation error',
        message: errorMessage
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  userValidation,
  productValidation
}; 
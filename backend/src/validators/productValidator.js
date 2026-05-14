const { body, query } = require('express-validator');

// Create product validation
const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('supplier')
    .notEmpty()
    .withMessage('Supplier is required')
    .isMongoId()
    .withMessage('Invalid supplier ID'),
  
  body('pricing.basePrice')
    .isNumeric()
    .withMessage('Base price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Base price must be greater than or equal to 0'),
  
  body('pricing.comparePrice')
    .optional()
    .isNumeric()
    .withMessage('Compare price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Compare price must be greater than or equal to 0'),
  
  body('pricing.cost')
    .isNumeric()
    .withMessage('Cost must be a number')
    .isFloat({ min: 0 })
    .withMessage('Cost must be greater than or equal to 0'),
  
  body('inventory.quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
  
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one product image is required'),
  
  body('images.*.url')
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('images.*.alt')
  .notEmpty()
  .withMessage('Image alt text is required'),
  
 body('variants.*.name')
  .notEmpty()
  .withMessage('Variant name is required'),

body('variants.*.sku')
  .notEmpty()
  .withMessage('Variant SKU is required'),

body('variants.*.price')
  .isFloat({ min: 0 })
  .withMessage('Variant price must be >= 0'),

body('variants.*.cost')
  .isFloat({ min: 0 })
  .withMessage('Variant cost must be >= 0'),

body('variants.*.inventory.quantity')
  .isInt({ min: 0 })
  .withMessage('Variant quantity must be >= 0'),
  
  body('shipping.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),
  
  body('shipping.dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a non-negative number'),
  
  body('shipping.dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a non-negative number'),
  
  body('shipping.dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a non-negative number'),
  
  body('seo.title')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('SEO title cannot exceed 60 characters'),
  
  body('seo.description')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description cannot exceed 160 characters')
];

// Update product validation
const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product description cannot be empty')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Invalid supplier ID'),
  
  body('pricing.basePrice')
    .optional()
    .isNumeric()
    .withMessage('Base price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Base price must be greater than or equal to 0'),
  
  body('pricing.comparePrice')
    .optional()
    .isNumeric()
    .withMessage('Compare price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Compare price must be greater than or equal to 0'),
  
  body('pricing.cost')
    .optional()
    .isNumeric()
    .withMessage('Cost must be a number')
    .isFloat({ min: 0 })
    .withMessage('Cost must be greater than or equal to 0'),
  
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('SKU cannot be empty')
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
  
  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one product image is required'),
  
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
  
  body('shipping.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),
  
  body('shipping.dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a non-negative number'),
  
  body('shipping.dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a non-negative number'),
  
  body('shipping.dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a non-negative number'),
  
  body('seo.title')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('SEO title cannot exceed 60 characters'),
  
  body('seo.description')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('SEO description cannot exceed 160 characters')
];

// Review validation
const reviewValidator = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Review title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Review content is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Content must be between 10 and 1000 characters'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL')
];

// Product query validation
const productQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', 'name', 'price', 'rating', 'sales', 'featured'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number'),
  
  query('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'price', 'rating', 'sales', 'featured'])
    .withMessage('Invalid sort field')
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  reviewValidator,
  productQueryValidator
};

const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');

// Import controllers
const productController = require('../controllers/productController');
const productDetailsController = require('../controllers/productDetailsController');

// Import validation
const {
  createProductValidator,
  updateProductValidator,
  reviewValidator,
  productQueryValidator
} = require('../validators/productValidator');

// Import middleware
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', productQueryValidator, validate, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/sale', productController.getSaleProducts);
router.get('/search', productController.searchProducts);
router.get('/suggestions', productController.getProductSuggestions);
router.get('/categories', productDetailsController.getProductCategories);
router.get('/suppliers', productDetailsController.getSuppliersList);
router.get('/on-sale', productDetailsController.getOnSaleProducts);
router.get('/slug/:slug', productDetailsController.getProductBySlug);

router.get('/:slug/reviews', productController.getProductReviews);
router.get('/:productId/availability', productDetailsController.checkAvailability);

// Protected routes
router.use(protect); // All routes below this require authentication

// Add review (requires authentication)
router.post('/:slug/reviews', reviewValidator, productController.addProductReview);

// Admin routes
router.use(restrictTo('admin')); // All routes below this require admin role

router.post('/', createProductValidator, productController.createProduct);
router.get('/admin/:id', productController.getProductById);
router.patch('/admin/:id', updateProductValidator, productController.updateProduct);
router.delete('/admin/:id', productController.deleteProduct);
router.get('/:slug', productController.getProduct);

module.exports = router;

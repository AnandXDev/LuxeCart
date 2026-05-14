const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const orderController = require('../controllers/orderController');
const invoiceController = require('../controllers/invoiceController');
// const invoiceController = require('../controllers/invoiceController');

// Apply auth middleware to all order routes
router.use(protect);

// GET /api/orders/stats - Get order statistics (for authenticated user)
router.get('/stats', orderController.getOrderStats);

// GET /api/orders - Get user's orders
router.get('/', orderController.getOrders);

// GET /api/orders/:id - Get specific order
router.get('/:id', orderController.getOrder);

// POST /api/orders - Create new order
router.post('/', orderController.createOrder);

// PUT /api/orders/:id/status - Update order status (admin/delivery boy only)
router.put('/:id/status', restrictTo('admin', 'delivery_boy'), orderController.updateOrderStatus);

// PUT /api/orders/:id/assign-delivery - Assign delivery boy (admin only)
router.put('/:id/assign-delivery', restrictTo('admin'), orderController.assignDelivery);

// POST /api/orders/:id/verify-delivery - Verify delivery with QR code (delivery boy only)
router.post('/:id/verify-delivery', restrictTo('delivery_boy'), orderController.verifyDelivery);

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', orderController.cancelOrder);

// GET /api/orders/:id/track - Track order
router.get('/:id/track', orderController.trackOrder);

// POST /api/orders/:id/review - Add review to order
router.post('/:id/review', orderController.addOrderReview);



// GET /api/orders/:id/invoice - Generate invoice PDF
router.get('/:id/invoice', invoiceController.generateInvoice);

module.exports = router;

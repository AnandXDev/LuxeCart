const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const analyticsController = require('../controllers/analyticsController');
const supplierController = require('../controllers/supplierController');

// Apply auth and admin middleware to all admin routes
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Analytics routes (temporarily commented)
router.get('/analytics/overview', analyticsController.getDashboardOverview);
// router.get('/analytics/realtime', analyticsController.getRealTimeMetrics);
// router.get('/analytics/sales', analyticsController.getSalesAnalytics);
// router.get('/analytics/customers', analyticsController.getCustomerAnalytics);
// router.get('/analytics/products', analyticsController.getProductAnalytics);
// router.get('/analytics/orders', analyticsController.getOrderAnalytics);
// router.get('/analytics/financial', analyticsController.getFinancialAnalytics);
// router.get('/analytics/system-health', analyticsController.getSystemHealth);
// router.get('/analytics/export', analyticsController.exportData);
// router.post('/analytics/custom-reports', analyticsController.generateCustomReport);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/unban', adminController.unbanUser);

// Product management
router.get('/products', adminController.getProducts);
router.get('/products/:id', adminController.getProduct);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.put('/products/:id/approve', adminController.approveProduct);
router.put('/products/:id/reject', adminController.rejectProduct);

// Order management
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrder);
router.put('/orders/:id', adminController.updateOrder);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/ship', adminController.shipOrder);
router.put('/orders/:id/refund', adminController.refundOrder);

// Category management
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Coupon management
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Supplier management
router.get('/suppliers', supplierController.getSuppliers);
router.post('/suppliers', supplierController.createSupplier);
router.get('/suppliers/:id', supplierController.getSupplier);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.delete('/suppliers/:id', supplierController.deleteSupplier);
router.post('/suppliers/:id/sync-products', supplierController.syncSupplierProducts);
router.get('/suppliers/:id/analytics', supplierController.getSupplierAnalytics);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Logs
router.get('/logs', adminController.getLogs);
router.get('/logs/:type', adminController.getLogsByType);

module.exports = router;

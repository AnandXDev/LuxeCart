const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const analyticsService = require('../services/mockAnalyticsService');
const { validationResult } = require('express-validator');

// Get dashboard overview
exports.getDashboardOverview = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    const overview = await analyticsService.getDashboardOverview(period);

    res.status(200).json({
      status: 'success',
      data: overview
    });
  } catch (error) {
       console.log("🔥 ERROR:", err); // IMPORTANT
    res.status(500).json({ error: err.message });
  }
};

// Get sales analytics
exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;

    const analytics = await analyticsService.getSalesAnalytics(period, groupBy);

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// Get customer analytics
exports.getCustomerAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    const analytics = await analyticsService.getCustomerAnalytics(period);

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// Get product analytics
exports.getProductAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    const analytics = await analyticsService.getProductAnalytics(period);

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// Get order analytics
exports.getOrderAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    const analytics = await analyticsService.getOrderAnalytics(period);

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// Get financial analytics
exports.getFinancialAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    const analytics = await analyticsService.getFinancialAnalytics(period);

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// Get real-time metrics
exports.getRealTimeMetrics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    const [
      todayOrders,
      todayRevenue,
      todayUsers,
      activeUsers,
      onlineUsers,
      cartAbandonmentRate,
      conversionRate,
      topProductsToday,
      recentOrders,
      systemHealth
    ] = await Promise.all([
      // Today's orders
      
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      
      
      // Today's revenue
      // analyticsService.getTotalRevenue(startOfToday),
      
      // Today's new users
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      
      // Active users in last hour
      User.countDocuments({ 
        lastLoginAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) },
        isActive: true 
      }),
      
      // Online users (last 5 minutes)
      User.countDocuments({ 
        lastLoginAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000) },
        isActive: true 
      }),
      
      // Cart abandonment rate (mock)
      25.5,
      
      // Conversion rate (mock)
      3.2,
      
      // Top products today
      analyticsService.getTopProducts(startOfToday, 5),
      
      // Recent orders
      Order.find({ createdAt: { $gte: startOfToday } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'firstName lastName email')
        .select('orderId pricing.total status createdAt user'),
      
      // System health metrics
      getSystemHealth()
    ]);

    // Compare with yesterday
    const [
      yesterdayOrders,
      yesterdayRevenue
    ] = await Promise.all([
      Order.countDocuments({ 
        createdAt: { $gte: startOfYesterday, $lt: startOfToday } 
      }),
      analyticsService.getTotalRevenue(startOfYesterday).then(() => 
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]).then(result => result[0]?.total || 0)
      )
    ]);

    const orderChange = yesterdayOrders > 0 ? 
      ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;
    const revenueChange = yesterdayRevenue > 0 ? 
      ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

    res.status(200).json({
      status: 'success',
      data: {
        today: {
          orders: todayOrders,
          revenue: todayRevenue,
          newUsers: todayUsers,
          activeUsers,
          onlineUsers,
          cartAbandonmentRate,
          conversionRate
        },
        comparison: {
          orderChange,
          revenueChange
        },
        topProducts: topProductsToday,
        recentOrders,
        systemHealth,
        timestamp: now.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get system health metrics
exports.getSystemHealth = async (req, res, next) => {
  try {
    const health = await getSystemHealth();

    res.status(200).json({
      status: 'success',
      data: health
    });
  } catch (error) {
    next(error);
  }
};

// Export analytics data
exports.exportAnalytics = async (req, res, next) => {
  try {
    const { type, period = '30d', format = 'json' } = req.query;

    let data;
    
    switch (type) {
      case 'sales':
        data = await analyticsService.getSalesAnalytics(period);
        break;
      case 'customers':
        data = await analyticsService.getCustomerAnalytics(period);
        break;
      case 'products':
        data = await analyticsService.getProductAnalytics(period);
        break;
      case 'orders':
        data = await analyticsService.getOrderAnalytics(period);
        break;
      case 'financial':
        data = await analyticsService.getFinancialAnalytics(period);
        break;
      default:
        data = await analyticsService.getDashboardOverview(period);
    }

    // Set appropriate headers based on format
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-analytics-${period}.csv`);
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-analytics-${period}.json`);
      res.json({
        status: 'success',
        data,
        exportedAt: new Date().toISOString(),
        type,
        period,
        format
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get custom report
exports.getCustomReport = async (req, res, next) => {
  try {
    const { 
      metrics, 
      startDate, 
      endDate, 
      groupBy = 'day',
      filters = {} 
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid date range'
      });
    }

    // Build custom report based on requested metrics
    const report = await buildCustomReport(metrics, start, end, groupBy, filters);

    res.status(200).json({
      status: 'success',
      data: {
        report,
        metadata: {
          startDate,
          endDate,
          metrics,
          groupBy,
          filters,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper methods
async function getSystemHealth() {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      errorRate,
      responseTime,
      uptime
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ 
        lastLoginAt: { $gte: fiveMinutesAgo },
        isActive: true 
      }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ 
        isActive: true,
        'inventory.quantity': { $lte: 10 }
      }),
      // Mock metrics - in real implementation, collect from monitoring
      0.1, // 0.1% error rate
      245, // 245ms average response time
      99.9 // 99.9% uptime
    ]);

    return {
      status: 'healthy',
      metrics: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts
        },
        performance: {
          errorRate,
          responseTime,
          uptime
        }
      },
      alerts: lowStockProducts > 0 ? [
        {
          type: 'warning',
          message: `${lowStockProducts} products are low in stock`,
          severity: 'medium'
        }
      ] : [],
      timestamp: now.toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to collect system health metrics',
      timestamp: new Date().toISOString()
    };
  }
}

function convertToCSV(data) {
  // Simple CSV conversion - implement proper CSV generation for production
  return 'id,name,value\n1,Sample,100';
}

async function buildCustomReport(metrics, startDate, endDate, groupBy, filters) {
  // Build custom report based on requested metrics
  // This is a simplified implementation
  const report = {
    summary: {},
    details: [],
    trends: []
  };

  for (const metric of metrics) {
    switch (metric) {
      case 'revenue':
        report.summary.revenue = await analyticsService.getTotalRevenue(startDate);
        break;
      case 'orders':
        report.summary.orders = await Order.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        });
        break;
      case 'users':
        report.summary.users = await User.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        });
        break;
      // Add more metrics as needed
    }
  }

  return report;
}

// Export data
exports.exportData = async (req, res, next) => {
  try {
    const { type, format = 'json', period = '30d' } = req.query;

    // Mock export data
    const exportData = {
      type,
      format,
      period,
      exportedAt: new Date(),
      data: {
        message: 'Export functionality not implemented yet'
      }
    };

    res.status(200).json({
      status: 'success',
      data: exportData
    });
  } catch (error) {
    next(error);
  }
};

// Export: helper functions are already exported with exports syntax

const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get product details by slug
// @route   GET /api/products/slug/:slug
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const product = await Product.findOne({ 
    slug, 
    status: 'active' 
  })
    .populate('category', 'name slug')
    .populate('supplier', 'name');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Get related products (same category, excluding current product)
  const relatedProducts = await Product.find({
    category: product.category ? product.category._id : null,
    status: 'active',
    _id: { $ne: product._id }
  })
    .populate('category', 'name slug')
    .limit(8)
    .select('name slug images pricing featured reviews');

  res.status(200).json({
    success: true,
    data: {
      product,
      relatedProducts
    }
  });
});

// @desc    Get product reviews
// @route   GET /api/products/:productId/reviews
exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const product = await Product.findById(productId);
  
 if (!product) {
  throw new Error("Product not found");
} else {
  throw new Error(product.message || "Product not found");
}

  // In a real implementation, you would have a separate Review model
  // For now, we'll return mock data
  const reviews = {
    reviews: [],
    pagination: {
      page,
      limit,
      total: 0,
      pages: 0
    }
  };

  res.status(200).json({
    success: true,
    data: reviews
  });
});

// @desc    Search products
// @route   GET /api/products/search
exports.searchProducts = asyncHandler(async (req, res, next) => {
  const {
    q: query,
    category,
    minPrice,
    maxPrice,
    sortBy = 'relevance',
    page = 1,
    limit = 20
  } = req.query;

  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = {
    status: 'active'
  };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Category filter
  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) {
      searchQuery.category = categoryDoc._id;
    }
  }

  // Price range filter
  if (minPrice || maxPrice) {
    searchQuery['pricing.price'] = {};
    if (minPrice) searchQuery['pricing.price'].$gte = parseFloat(minPrice);
    if (maxPrice) searchQuery['pricing.price'].$lte = parseFloat(maxPrice);
  }

  // Sort options
  let sortOptions = {};
  switch (sortBy) {
    case 'price-low':
      sortOptions = { 'pricing.price': 1 };
      break;
    case 'price-high':
      sortOptions = { 'pricing.price': -1 };
      break;
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'rating':
      sortOptions = { 'reviews.averageRating': -1 };
      break;
    case 'relevance':
    default:
      sortOptions = query ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
      break;
  }

  const products = await Product.find(searchQuery)
    .populate('category', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-inventory.reserved -metadata');

  const total = await Product.countDocuments(searchQuery);

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        query,
        category,
        minPrice,
        maxPrice,
        sortBy
      }
    }
  });
});

// @desc    Get product categories with counts
// @route   GET /api/products/categories
exports.getProductCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        image: 1,
        icon: 1,
        productCount: {
          $size: {
            $filter: {
              input: '$products',
              cond: { $eq: ['$$this.status', 'active'] }
            }
          }
        }
      }
    },
    { $sort: { productCount: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({ 
    featured: true, 
    status: 'active' 
  })
    .populate('category', 'name slug')
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
exports.getNewArrivals = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({ 
    status: 'active' 
  })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Get products on sale
// @route   GET /api/products/on-sale
exports.getOnSaleProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({ 
    status: 'active',
    'pricing.comparePrice': { $gt: 0 }
  })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Check product availability
// @route   GET /api/products/:productId/availability
exports.checkAvailability = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId, 'inventory pricing');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const isInStock = product.inventory.quantity > 0;
  const isLowStock = product.inventory.quantity <= product.inventory.lowStockThreshold;

  res.status(200).json({
    success: true,
    data: {
      isInStock,
      quantity: product.inventory.quantity,
      lowStockThreshold: product.inventory.lowStockThreshold,
      isLowStock,
      allowBackorder: product.inventory.allowBackorder,
      price: product.pricing.price,
      comparePrice: product.pricing.comparePrice
    }
  });
});

// Dropdown ke liye simple list mangwayein
exports.getSuppliersList = asyncHandler(async (req, res, next) => {
  const suppliers = await Supplier.find({ status: 'active' })
    .select('name slug image icon');

  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});
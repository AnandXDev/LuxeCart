const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// Get all products with filtering, sorting, and pagination
exports.getProducts = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      category,
      minPrice,
      maxPrice,
      rating,
      inStock,
      search,
      featured,
      newArrivals,
      onSale
    } = req.query;

    // Build query
    const query = { status: 'active' };

    // Category filter
    if (category) {
      // Handle both category slug and ObjectId
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        // Find category by slug
        const Category = require('../models/Category');
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      query['reviews.averageRating'] = { $gte: parseFloat(rating) };
    }

    // Stock filter
    if (inStock === 'true') {
      query['inventory.quantity'] = { $gt: 0 };
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // New arrivals filter (products created in last 30 days)
    if (newArrivals === 'true') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    // Sale filter
    if (onSale === 'true') {
      query['pricing.comparePrice'] = { $exists: true, $ne: null };
    }

    // Sort options
    const sortOptions = {};
    let sortField = sort;
    
    // Handle special sort field mappings
    if (sort === 'price') {
      sortField = 'pricing.basePrice';
    } else if (sort === 'featured') {
      sortField = 'featured';
    }
    
    sortOptions[sortField] = order === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('supplier', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-inventory.reserved -metadata'),
      Product.countDocuments(query)
    ]);

    // Log products to console
    console.log('=== PRODUCTS FETCHED ===');
    console.log(`Total products found: ${total}`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.pricing?.basePrice || product.pricing?.price} (${product.category?.name})`);
    });
    console.log('========================');

    // Transform products to match frontend interface
    const transformedProducts = products.map(product => ({
      ...product.toObject(),
      pricing: {
        ...product.pricing,
        price: product.pricing.basePrice, // Add price field for frontend compatibility
        discountPercentage: product.pricing.comparePrice 
          ? Math.round(((product.pricing.comparePrice - product.pricing.basePrice) / product.pricing.comparePrice) * 100)
          : null
      },
      isFeatured: product.featured || false, // Add isFeatured field
      reviews: product.reviews || {
        averageRating: product.rating?.average || 0,
        count: product.rating?.count || 0
      }
    }));

    // Get category counts for filtering
    const categoryCounts = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', slug: '$category.slug', count: 1 } },
      { $sort: { count: -1 } }
    ]);

    // Get price range
    const priceRange = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, min: { $min: '$pricing.price' }, max: { $max: '$pricing.price' } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        products: transformedProducts, // Use transformed products
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          categories: categoryCounts,
          priceRange: priceRange[0] || { min: 0, max: 1000 }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by slug
exports.getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, status: 'active' })
      .populate('category', 'name slug')
      .populate('supplier', 'name')
      .populate('reviews.user', 'firstName lastName avatar');

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      status: 'active'
    })
      .populate('category', 'name slug')
      .limit(8)
      .select('name slug images pricing category');

    res.status(200).json({
      status: 'success',
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ featured: true, status: 'active' })
      .populate('category', 'name slug')
      .populate('supplier', 'name')
      .limit(parseInt(limit))
      .sort({ 'reviews.averageRating': -1, createdAt: -1 })
      .select('name slug images pricing category reviews supplier');

    res.status(200).json({
      status: 'success',
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get new arrivals
exports.getNewArrivals = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const products = await Product.find({
      createdAt: { $gte: thirtyDaysAgo },
      status: 'active'
    })
      .populate('category', 'name slug')
      .populate('supplier', 'name')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .select('name slug images pricing category supplier createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get products on sale
exports.getSaleProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      'pricing.comparePrice': { $exists: true, $ne: null },
      status: 'active'
    })
      .populate('category', 'name slug')
      .populate('supplier', 'name')
      .limit(parseInt(limit))
      .sort({ 'pricing.discountPercentage': -1 })
      .select('name slug images pricing category supplier');

    res.status(200).json({
      status: 'success',
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Search products
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        status: 'fail',
        message: 'Search query is required'
      });
    }

    const query = {
      $text: { $search: q },
      status: 'active'
    };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('supplier', 'name')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .select('name slug images pricing category supplier'),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        searchQuery: q
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product suggestions (autocomplete)
exports.getProductSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        status: 'success',
        data: {
          suggestions: []
        }
      });
    }

    const products = await Product.find({
      name: { $regex: q, $options: 'i' },
      status: 'active'
    })
      .select('name slug images pricing')
      .limit(10);

    const suggestions = products.map(product => ({
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.pricing.price
    }));

    res.status(200).json({
      status: 'success',
      data: {
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create product (admin only)
exports.createProduct = async (req, res, next) => {
  try {
    // Check for validation errors
      if (!errors.isEmpty()) {
      console.log("❌ VALIDATION ERRORS:");
      errors.array().forEach((err, i) => {
        console.log(`${i + 1}. Field: ${err.path}`);
        console.log(`   Message: ${err.msg}`);
        console.log(`   Value:`, err.value);
      });

      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    console.log("✅ DATA RECEIVED:", req.body);

    const product = await Product.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
        console.log("🔥 SERVER ERROR:", error.message);
    next(error);
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Get product reviews
exports.getProductReviews = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

    const product = await Product.findOne({ slug, status: 'active' });
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    const skip = (page - 1) * limit;

    const reviews = await Product.aggregate([
      { $match: { slug, status: 'active' } },
      { $unwind: '$reviews' },
      { $sort: { [`reviews.${sort}`]: order === 'desc' ? -1 : 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $lookup: { from: 'users', localField: 'reviews.user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          _id: '$reviews._id',
          rating: '$reviews.rating',
          title: '$reviews.title',
          content: '$reviews.content',
          images: '$reviews.images',
          helpful: '$reviews.helpful',
          createdAt: '$reviews.createdAt',
          user: {
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            avatar: '$user.avatar'
          }
        }
      }
    ]);

    const totalReviews = product.reviews.length;

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReviews,
          pages: Math.ceil(totalReviews / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("supplier");

    res.json(product);
  } catch (err) {
    res.status(404).json({ error: "Product not found" });
  }
};

// Add product review
exports.addProductReview = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { rating, title, content, images } = req.body;
    const userId = req.user.id;

    const product = await Product.findOne({ slug, status: 'active' });
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(review => 
      review.user.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    product.reviews.push({
      user: userId,
      rating,
      title,
      content,
      images: images || []
    });

    await product.save();

    res.status(201).json({
      status: 'success',
      message: 'Review added successfully'
    });
  } catch (error) {
    next(error);
  }
};

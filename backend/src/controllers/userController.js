const User = require('../models/User');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Register user
// @route   POST /api/users/register
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  const user = new User({
    firstName,
    lastName,
    email,
    password
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  });
});

// @desc    Login user
// @route   POST /api/users/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    }
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// exports.updateProfile = asyncHandler(async (req, res, next) => {
//   const {
//     firstName,
//     lastName,
//     phone,
//     bio
//   } = req.body;

//   const updateFields = {};
//   if (firstName) updateFields.firstName = firstName;
//   if (lastName) updateFields.lastName = lastName;
//   if (phone) updateFields.phone = phone;
//   if (bio) updateFields.bio = bio;

//   const user = await User.findByIdAndUpdate(
//     req.user.id,
//     updateFields,
//     { new: true, runValidators: true }
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Profile updated successfully',
//     data: user
//   });
// });

// @desc    Change password
// @route   PUT /api/users/password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Get user addresses
// @route   GET /api/users/addresses
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user.addresses || []
  });
});

// @desc    Add address
// @route   POST /api/users/addresses
exports.addAddress = asyncHandler(async (req, res, next) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Address is required'
    });
  }

  const user = await User.findById(req.user.id);
  user.addresses.push(address);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address added successfully',
    data: address
  });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:id
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const { address } = req.body;

  const user = await User.findById(req.user.id);
  const addressIndex = user.addresses.findIndex(
    addr => addr._id.toString() === req.params.id
  );

  if (addressIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...address };
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: user.addresses[addressIndex]
  });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.addresses = user.addresses.filter(
    addr => addr._id.toString() !== req.params.id
  );
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully'
  });
});

// @desc    Get wishlist
// @route   GET /api/users/wishlist
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: user.wishlist || []
  });
});

// @desc    Add to wishlist
// @route   POST /api/users/wishlist
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  const user = await User.findById(req.user.id);
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist'
  });
});

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:productId
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.wishlist = user.wishlist.filter(
    id => id.toString() !== req.params.productId
  );
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist'
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select('-password')
    .populate('addresses');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    phone,
    image,
    preferences
  } = req.body;

  const user = await User.findById(req.user.id);

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;

  if (image) user.image = image;   // 🔥 MAIN FIX

  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Get user orders
// @route   GET /api/users/orders
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  let query = { user: req.user.id };
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.product', 'name images');

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Track order
// @route   GET /api/users/orders/:orderId/track
exports.trackOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user.id
  })
    .populate('delivery.assignedTo', 'firstName lastName phone');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      status: order.status,
      timeline: order.timeline,
      estimatedDelivery: order.shipping.estimatedDelivery,
      tracking: order.shipping.tracking,
      delivery: order.delivery
    }
  });
});

// @desc    Cancel order
// @route   PUT /api/users/orders/:orderId/cancel
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user.id
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Can only cancel pending or confirmed orders
  if (!['pending', 'confirmed'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be cancelled at this stage'
    });
  }

  order.status = 'cancelled';
  order.timeline.push({
    status: 'cancelled',
    title: 'Order Cancelled',
    description: reason || 'Order cancelled by customer',
    timestamp: new Date()
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// @desc    Get user invoices
// @route   GET /api/users/invoices
exports.getUserInvoices = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const invoices = await Invoice.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('order', 'orderNumber');

  const total = await Invoice.countDocuments({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: {
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const stats = await Promise.all([
    Order.countDocuments({ user: userId }),
    Order.countDocuments({ user: userId, status: 'delivered' }),
    Order.aggregate([
      { $match: { user: userId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalOrders: stats[0],
      deliveredOrders: stats[1],
      totalSpent: stats[2][0]?.total || 0
    }
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/account
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    image:{
      type: String,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password not required for Google OAuth users
      },
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]{10,}$/, "Please provide a valid phone number"],
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "delivery_boy"],
      default: "user",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // 🔽 ADD THESE LINES inside schema
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
    },
    addresses: [
      {
        type: {
          type: String,
          enum: ["home", "work", "other"],
          default: "home",
        },
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        zipCode: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
          default: "United States",
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Delivery Boy specific fields
    deliveryBoyProfile: {
      employeeId: {
        type: String,
        unique: true,
        sparse: true,
      },
      vehicleType: {
        type: String,
        enum: ["bike", "scooter", "car", "van"],
        default: "bike",
      },
      vehicleNumber: String,
      licenseNumber: String,
      isAvailable: {
        type: Boolean,
        default: true,
      },
      currentLocation: {
        latitude: Number,
        longitude: Number,
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
      deliveryStats: {
        totalDeliveries: {
          type: Number,
          default: 0,
        },
        successfulDeliveries: {
          type: Number,
          default: 0,
        },
        failedDeliveries: {
          type: Number,
          default: 0,
        },
        averageDeliveryTime: {
          type: Number,
          default: 0,
        },
        rating: {
          type: Number,
          default: 5.0,
          min: 0,
          max: 5,
        },
      },
      earnings: {
        today: {
          type: Number,
          default: 0,
        },
        week: {
          type: Number,
          default: 0,
        },
        month: {
          type: Number,
          default: 0,
        },
        year: {
          type: Number,
          default: 0,
        },
        total: {
          type: Number,
          default: 0,
        },
      },
      salary: {
        baseSalary: Number,
        perDelivery: {
          type: Number,
          default: 0,
        },
        bonusThreshold: Number,
        bonusAmount: Number,
      },
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for order history
userSchema.virtual("orderHistory", {
  ref: "Order",
  localField: "_id",
  foreignField: "user",
});

// Indexes
// userSchema.index({ email: 1 });
// userSchema.index({ googleId: 1 });
// userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new) and is not undefined
  if (!this.isModified("password") || !this.password) return next();

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// Pre-save middleware to handle default address
userSchema.pre("save", function (next) {
  // Ensure only one address is marked as default
  const defaultAddresses = this.addresses.filter((addr) => addr.isDefault);
  if (defaultAddresses.length > 1) {
    // Keep the first one as default, set others to false
    this.addresses.forEach((addr, index) => {
      addr.isDefault = index === 0;
    });
  }

  // If no default address and we have addresses, set first one as default
  if (defaultAddresses.length === 0 && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }

  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if email is verified
// userSchema.methods.isVerified = function () {
//   return this.isEmailVerified;
// };

// Instance method to add item to wishlist
userSchema.methods.addToWishlist = function (productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
  }
  return this.save();
};

// Instance method to remove item from wishlist
userSchema.methods.removeFromWishlist = function (productId) {
  this.wishlist = this.wishlist.filter((id) => !id.equals(productId));
  return this.save();
};

// Instance method to add item to cart
userSchema.methods.addToCart = function (product, variant, quantity = 1) {
  // Check if item already exists in cart
  const existingItemIndex = this.cart.findIndex(
    (item) =>
      item.product.equals(product._id) &&
      JSON.stringify(item.variant) === JSON.stringify(variant),
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    this.cart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item if it doesn't exist
    this.cart.push({
      product: product._id,
      variant,
      quantity,
    });
  }

  return this.save();
};

// Instance method to remove item from cart
userSchema.methods.removeFromCart = function (productId, variant) {
  this.cart = this.cart.filter(
    (item) =>
      !item.product.equals(productId) ||
      JSON.stringify(item.variant) !== JSON.stringify(variant),
  );
  return this.save();
};

// Instance method to update cart item quantity
userSchema.methods.updateCartItemQuantity = function (
  productId,
  variant,
  quantity,
) {
  const itemIndex = this.cart.findIndex(
    (item) =>
      item.product.equals(productId) &&
      JSON.stringify(item.variant) === JSON.stringify(variant),
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      this.cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      this.cart[itemIndex].quantity = quantity;
    }
  }

  return this.save();
};

// Static method to find users by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find users by Google ID
userSchema.statics.findByGoogleId = function (googleId) {
  return this.findOne({ googleId });
};

const User = mongoose.model("User", userSchema);

module.exports = User;

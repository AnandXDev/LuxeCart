const mongoose = require("mongoose");
const Product = require("../src/models/Product");
const Category = require("../src/models/Category");
const Supplier = require("../src/models/Supplier");
const User = require("../src/models/User");
require("dotenv").config();

// Sample products data
const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description:
      "Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.",
    shortDescription: "Premium wireless headphones with noise cancellation",
    sku: "WBH-001",
    brand: "AudioTech",
    images: [
      {
        url: "https://i5.walmartimages.com/seo/Bose-QuietComfort-Headphones-Noise-Cancelling-Over-Ear-Wireless-Bluetooth-Earphones-White-Smoke_9a8cadaf-82f7-474e-bb14-0816a1a6fc0b.4729d2dde3f761c6688d17aed1a0f9d6.jpeg",
        alt: "Wireless Bluetooth Headphones",
        isMain: true,
      },
      {
        url: "https://picsum.photos/800/600?random=2",
        alt: "Headphones Side View",
        isMain: false,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "WBH-001-DEFAULT",
        price: 89.99,
        comparePrice: 129.99,
        cost: 45.0,
        weight: 0.5,
        dimensions: { length: 20, width: 15, height: 10 },
        inventory: {
          quantity: 150,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 20,
        },
        attributes: [{ name: "Color", value: "Black" }],
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        ],
        isActive: true,
      },
    ],
    pricing: {
      basePrice: 89.99,
      price: 89.99,
      comparePrice: 129.99,
      cost: 45.0,
    },
    inventory: {
      quantity: 150,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 20,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 0.5,
      dimensions: { length: 20, width: 15, height: 10 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["wireless", "bluetooth", "headphones", "audio"],
    status: "active",
    featured: true,
    rating: 4.5,
    numReviews: 127,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },
  {
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description:
      "Advanced fitness tracking watch with heart rate monitor, GPS, and 7-day battery life.",
    shortDescription: "Smart fitness watch with health tracking",
    sku: "SFW-002",
    brand: "FitTech",
    images: [
      {
        url: "https://picsum.photos/800/600?random=3",
        alt: "Smart Fitness Watch",
        isMain: true,
      },
      {
        url: "https://picsum.photos/800/600?random=4",
        alt: "Fitness Watch Side View",
        isMain: false,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "SFW-002-DEFAULT",
        price: 199.99,
        comparePrice: 249.99,
        cost: 95.0,
        weight: 0.1,
        dimensions: { length: 4, width: 4, height: 1 },
        inventory: {
          quantity: 85,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 15,
        },
        attributes: [
          { name: "Size", value: "44mm" },
          { name: "Color", value: "Black" },
        ],
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        ],
        isActive: true,
      },
    ],
    pricing: {
      basePrice: 199.99,
      price: 199.99,
      comparePrice: 249.99,
      cost: 95.0,
    },
    inventory: {
      quantity: 85,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 15,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 0.1,
      dimensions: { length: 4, width: 4, height: 1 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["smartwatch", "fitness", "health", "tracker"],
    status: "active",
    featured: true,
    rating: 4.7,
    numReviews: 89,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },
  {
    name: "Wireless Charging Pad",
    slug: "wireless-charging-pad",
    description:
      "Fast wireless charging pad compatible with all Qi-enabled devices.",
    shortDescription: "Fast wireless charger",
    sku: "WCP-030",
    brand: "ChargePro",
    images: [
      {
        url: "https://picsum.photos/800/600?random=101",
        alt: "Charging Pad",
        isMain: true,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "WCP-030-DEFAULT",
        price: 19.99,
        comparePrice: 29.99,
        cost: 8,
        weight: 0.2,
        dimensions: { length: 10, width: 10, height: 2 },
        inventory: {
          quantity: 250,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 30,
        },
        attributes: [{ name: "Color", value: "White" }],
        images: ["https://picsum.photos/800/600?random=102"],
        isActive: true,
      },
    ],
    pricing: { basePrice: 19.99, price: 19.99, comparePrice: 29.99, cost: 8 },
    inventory: {
      quantity: 250,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 30,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 0.2,
      dimensions: { length: 10, width: 10, height: 2 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["charger", "wireless"],
    status: "active",
    featured: true,
    rating: 4.4,
    numReviews: 150,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },

  {
    name: "4K Ultra HD Smart TV 43 inch",
    slug: "4k-smart-tv-43",
    description:
      "43-inch 4K Ultra HD Smart TV with HDR and built-in streaming apps.",
    shortDescription: "43 inch 4K Smart TV",
    sku: "TV-031",
    brand: "VisionX",
    images: [
      {
        url: "https://picsum.photos/800/600?random=103",
        alt: "Smart TV",
        isMain: true,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "TV-031-DEFAULT",
        price: 399.99,
        comparePrice: 499.99,
        cost: 300,
        weight: 7,
        dimensions: { length: 100, width: 60, height: 10 },
        inventory: {
          quantity: 80,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 10,
        },
        attributes: [{ name: "Size", value: "43 inch" }],
        images: ["https://picsum.photos/800/600?random=104"],
        isActive: true,
      },
    ],
    pricing: {
      basePrice: 399.99,
      price: 399.99,
      comparePrice: 499.99,
      cost: 300,
    },
    inventory: {
      quantity: 80,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 10,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 7,
      dimensions: { length: 100, width: 60, height: 10 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["tv", "electronics"],
    status: "active",
    featured: true,
    rating: 4.7,
    numReviews: 320,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },

  {
    name: "Mechanical Keyboard RGB",
    slug: "mechanical-keyboard-rgb",
    description:
      "Mechanical keyboard with blue switches and customizable RGB lighting.",
    shortDescription: "RGB mechanical keyboard",
    sku: "KB-032",
    brand: "KeyMaster",
    images: [
      {
        url: "https://picsum.photos/800/600?random=105",
        alt: "Keyboard",
        isMain: true,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "KB-032-DEFAULT",
        price: 69.99,
        comparePrice: 99.99,
        cost: 35,
        weight: 1,
        dimensions: { length: 45, width: 15, height: 4 },
        inventory: {
          quantity: 120,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 20,
        },
        attributes: [{ name: "Switch Type", value: "Blue" }],
        images: ["https://picsum.photos/800/600?random=106"],
        isActive: true,
      },
    ],
    pricing: { basePrice: 69.99, price: 69.99, comparePrice: 99.99, cost: 35 },
    inventory: {
      quantity: 120,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 20,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 1,
      dimensions: { length: 45, width: 15, height: 4 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["keyboard", "gaming"],
    status: "active",
    featured: false,
    rating: 4.6,
    numReviews: 210,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },

  {
    name: "Men Casual Sneakers",
    slug: "men-casual-sneakers",
    description: "Comfortable and stylish sneakers for everyday wear.",
    shortDescription: "Casual sneakers",
    sku: "SN-033",
    brand: "StreetWear",
    images: [
      {
        url: "https://picsum.photos/800/600?random=107",
        alt: "Sneakers",
        isMain: true,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "SN-033-DEFAULT",
        price: 59.99,
        comparePrice: 89.99,
        cost: 25,
        weight: 0.9,
        dimensions: { length: 30, width: 15, height: 10 },
        inventory: {
          quantity: 200,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 30,
        },
        attributes: [{ name: "Size", value: "9" }],
        images: ["https://picsum.photos/800/600?random=108"],
        isActive: true,
      },
    ],
    pricing: { basePrice: 59.99, price: 59.99, comparePrice: 89.99, cost: 25 },
    inventory: {
      quantity: 200,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 30,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 0.9,
      dimensions: { length: 30, width: 15, height: 10 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["shoes", "men"],
    status: "active",
    featured: true,
    rating: 4.3,
    numReviews: 140,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },

  {
    name: "Portable Bluetooth Speaker",
    slug: "portable-bluetooth-speaker",
    description: "Compact speaker with powerful bass and 12-hour playtime.",
    shortDescription: "Portable speaker",
    sku: "SP-034",
    brand: "SoundMax",
    images: [
      {
        url: "https://picsum.photos/800/600?random=109",
        alt: "Speaker",
        isMain: true,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "SP-034-DEFAULT",
        price: 34.99,
        comparePrice: 54.99,
        cost: 15,
        weight: 0.6,
        dimensions: { length: 20, width: 8, height: 8 },
        inventory: {
          quantity: 220,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 25,
        },
        attributes: [{ name: "Color", value: "Blue" }],
        images: ["https://picsum.photos/800/600?random=110"],
        isActive: true,
      },
    ],
    pricing: { basePrice: 34.99, price: 34.99, comparePrice: 54.99, cost: 15 },
    inventory: {
      quantity: 220,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 25,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 0.6,
      dimensions: { length: 20, width: 8, height: 8 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["speaker", "audio"],
    status: "active",
    featured: false,
    rating: 4.5,
    numReviews: 198,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },

  // 👉 I continue pattern for realism

  {
    name: "LED Desk Lamp",
    slug: "led-desk-lamp",
    description: "Energy-efficient LED desk lamp with adjustable brightness.",
    shortDescription: "LED study lamp",
    sku: "LAMP-035",
    brand: "BrightLite",
    images: [
      {
        url: "https://picsum.photos/800/600?random=111",
        alt: "Lamp",
        isMain: true,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "LAMP-035-DEFAULT",
        price: 24.99,
        comparePrice: 39.99,
        cost: 10,
        weight: 0.7,
        dimensions: { length: 25, width: 10, height: 10 },
        inventory: {
          quantity: 150,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 20,
        },
        attributes: [{ name: "Color", value: "White" }],
        images: ["https://picsum.photos/800/600?random=112"],
        isActive: true,
      },
    ],
    pricing: { basePrice: 24.99, price: 24.99, comparePrice: 39.99, cost: 10 },
    inventory: {
      quantity: 150,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 20,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 0.7,
      dimensions: { length: 25, width: 10, height: 10 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["lamp", "study"],
    status: "active",
    featured: true,
    rating: 4.2,
    numReviews: 90,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },
  {
    name: "Laptop Backpack",
    slug: "laptop-backpack",
    description:
      "Durable waterproof laptop backpack with multiple compartments.",
    shortDescription: "Waterproof backpack",
    sku: "LB-004",
    brand: "UrbanCarry",
    images: [
      {
        url: "https://picsum.photos/800/600?random=7",
        alt: "Backpack",
        isMain: true,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "LB-004-DEFAULT",
        price: 39.99,
        comparePrice: 59.99,
        cost: 18,
        weight: 0.8,
        dimensions: { length: 40, width: 30, height: 10 },
        inventory: {
          quantity: 180,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 25,
        },
        attributes: [{ name: "Color", value: "Grey" }],
        images: ["https://picsum.photos/800/600?random=8"],
        isActive: true,
      },
    ],
    pricing: { basePrice: 39.99, price: 39.99, comparePrice: 59.99, cost: 18 },
    inventory: {
      quantity: 180,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 25,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 0.8,
      dimensions: { length: 40, width: 30, height: 10 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["bag", "laptop"],
    status: "active",
    featured: false,
    rating: 4.3,
    numReviews: 76,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },
  {
    name: "Women Handbag Leather",
    slug: "women-handbag-leather",
    description: "Elegant leather handbag for women",
    sku: "FASH-005",
    price: 1999,
    comparePrice: 2599,
    cost: 900,
    weight: 0.5,
    dimensions: { length: 25, width: 20, height: 8 },
    inventory: {
      quantity: 80,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 15,
    },
    attributes: [
      { name: "Material", value: "Leather" },
      { name: "Color", value: "Brown" },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
        alt: "Handbag",
        isMain: true,
      },
    ],
    isActive: true,
    pricing: { basePrice: 1999, price: 1999, comparePrice: 2599, cost: 900 },
    shipping: {
      weight: 0.5,
      dimensions: { length: 25, width: 20, height: 8 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["bag", "women", "fashion"],
    status: "active",
    featured: true,
    rating: 4.2,
    numReviews: 70,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },
  {
    name: "Gaming Mouse RGB",
    slug: "gaming-mouse-rgb",
    sku: "GAM-004",
    price: 899,
    description:
      "Gaming Mouse RGB with high precision and customizable lighting",
    comparePrice: 1299,
    cost: 400,
    weight: 0.2,
    dimensions: { length: 12, width: 6, height: 4 },
    inventory: {
      quantity: 200,
      trackQuantity: true,
      allowBackorder: true,
      lowStockThreshold: 25,
    },
    attributes: [
      { name: "DPI", value: "16000" },
      { name: "Color", value: "Black" },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1587202372775-989e9b3c19c9?w=800",
        alt: "Gaming Mouse",
        isMain: true,
      },
    ],
    isActive: true,
    pricing: { basePrice: 899, price: 899, comparePrice: 1299, cost: 400 },
    shipping: {
      weight: 0.2,
      dimensions: { length: 12, width: 6, height: 4 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["gaming", "mouse", "pc"],
    status: "active",
    featured: false,
    rating: 4.4,
    numReviews: 150,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },
  {
    name: "Organic Yoga Mat",
    slug: "organic-yoga-mat",
    description:
      "Eco-friendly non-slip yoga mat made from natural rubber with alignment markers.",
    shortDescription: "Eco-friendly non-slip yoga mat",
    sku: "OYM-003",
    brand: "EcoFit",
    images: [
      {
        url: "https://picsum.photos/800/600?random=5",
        alt: "Organic Yoga Mat",
        isMain: true,
      },
      {
        url: "https://picsum.photos/800/600?random=6",
        alt: "Yoga Mat Rolled Up",
        isMain: false,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "OYM-003-DEFAULT",
        price: 34.99,
        comparePrice: 49.99,
        cost: 18.0,
        weight: 1.2,
        dimensions: { length: 183, width: 61, height: 0.6 },
        inventory: {
          quantity: 200,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 30,
        },
        attributes: [
          { name: "Color", value: "Purple" },
          { name: "Thickness", value: "6mm" },
        ],
        images: ["https://picsum.photos/800/600?random=5"],
        isActive: true,
      },
    ],
    pricing: {
      basePrice: 34.99,
      price: 34.99,
      comparePrice: 49.99,
      cost: 18.0,
    },
    inventory: {
      quantity: 200,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 30,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 1.2,
      dimensions: { length: 183, width: 61, height: 0.6 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["yoga", "fitness", "eco-friendly", "exercise"],
    status: "active",

    rating: 4.6,
    numReviews: 156,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },
  {
    name: "Ceramic Coffee Maker Set",
    slug: "ceramic-coffee-maker-set",
    description:
      "Handcrafted ceramic coffee maker with 4 cups and matching saucers. Perfect for coffee lovers.",
    shortDescription: "Handcrafted ceramic coffee maker set",
    sku: "CCM-004",
    brand: "ArtisanHome",
    images: [
      {
        url: "https://picsum.photos/800/600?random=7",
        alt: "Ceramic Coffee Maker Set",
        isMain: true,
      },
      {
        url: "https://picsum.photos/800/600?random=8",
        alt: "Coffee Maker with Cups",
        isMain: false,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "CCM-004-DEFAULT",
        price: 79.99,
        comparePrice: 99.99,
        cost: 42.0,
        weight: 2.5,
        dimensions: { length: 30, width: 20, height: 25 },
        inventory: {
          quantity: 60,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 10,
        },
        attributes: [{ name: "Color", value: "White" }],
        images: ["https://picsum.photos/800/600?random=7"],
        isActive: true,
      },
    ],
    pricing: {
      basePrice: 79.99,
      price: 79.99,
      comparePrice: 99.99,
      cost: 42.0,
    },
    inventory: {
      quantity: 60,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 10,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 2.5,
      dimensions: { length: 30, width: 20, height: 25 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["coffee", "ceramic", "kitchen", "home"],
    status: "active",

    rating: 4.8,
    numReviews: 94,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },
  {
    name: "Professional Makeup Brush Set",
    slug: "professional-makeup-brush-set",
    description:
      "Complete 15-piece professional makeup brush set with premium synthetic bristles.",
    shortDescription: "Professional 15-piece makeup brush set",
    sku: "PMB-005",
    brand: "BeautyPro",
    images: [
      {
        url: "https://m.media-amazon.com/images/I/718JL8aTRwL._AC_.jpg",
        alt: "Professional Makeup Brush Set",
        isMain: true,
      },
      {
        url: "https://picsum.photos/800/600?random=10",
        alt: "Makeup Brushes Collection",
        isMain: false,
      },
    ],
    variants: [
      {
        name: "Default",
        sku: "PMB-005-DEFAULT",
        price: 45.99,
        comparePrice: 69.99,
        cost: 22.0,
        weight: 0.8,
        dimensions: { length: 25, width: 15, height: 8 },
        inventory: {
          quantity: 120,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 20,
        },
        attributes: [{ name: "Set Type", value: "15 Piece" }],
        images: [
          "https://images.unsplash.com/photo-1596462502278-274cbbb4063e?w=800",
        ],
        isActive: true,
      },
    ],
    pricing: {
      basePrice: 45.99,
      price: 45.99,
      comparePrice: 69.99,
      cost: 22.0,
    },
    inventory: {
      quantity: 120,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 20,
      reserved: 0,
    },
    isActive: true,
    shipping: {
      weight: 0.8,
      dimensions: { length: 25, width: 15, height: 8 },
      requiresShipping: true,
      shippingClass: "standard",
    },
    tags: ["makeup", "brushes", "beauty", "cosmetics"],
    status: "active",
    featured: true,
    rating: 4.4,
    numReviews: 203,
    reviews: [
      {
        rating: 4.5,
        comment: "Great product!",
        user: null,
      },
    ],
  },
  {
  name: "Portable Power Bank 20000mAh",
  slug: "portable-power-bank-20000mah",
  description: "High capacity power bank with fast charging support.",
  shortDescription: "20000mAh power bank",
  sku: "PB-201",
  brand: "PowerCore",
  images: [{ url: "https://m.media-amazon.com/images/I/71NHdNB748L._AC_.jpg", alt: "Power Bank", isMain: true }],
  variants: [{
    name: "Default",
    sku: "PB-201-DEFAULT",
    price: 39.99,
    comparePrice: 59.99,
    cost: 18,
    weight: 0.6,
    dimensions: { length: 15, width: 7, height: 3 },
    inventory: { quantity: 180, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20 },
    attributes: [{ name: "Capacity", value: "20000mAh" }],
    images: ["https://picsum.photos/800/600?random=302"],
    isActive: true,
  }],
  pricing: { basePrice: 39.99, price: 39.99, comparePrice: 59.99, cost: 18 },
  inventory: { quantity: 180, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20, reserved: 0 },
  isActive: true,
  shipping: { weight: 0.6, dimensions: { length: 15, width: 7, height: 3 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["powerbank"],
  status: "active",
  featured: true,
  rating: 4.6,
  numReviews: 210,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
},

{
  name: "Smart LED Bulb WiFi",
  slug: "smart-led-bulb-wifi",
  description: "WiFi enabled smart LED bulb with app control.",
  shortDescription: "Smart LED bulb",
  sku: "LED-202",
  brand: "BrightTech",
  images: [{ url: "https://picsum.photos/800/600?random=303", alt: "Bulb", isMain: true }],
  variants: [{
    name: "Default",
    sku: "LED-202-DEFAULT",
    price: 14.99,
    comparePrice: 24.99,
    cost: 6,
    weight: 0.2,
    dimensions: { length: 6, width: 6, height: 10 },
    inventory: { quantity: 300, trackQuantity: true, allowBackorder: false, lowStockThreshold: 30 },
    attributes: [{ name: "Watt", value: "9W" }],
    images: ["https://picsum.photos/800/600?random=304"],
    isActive: true,
  }],
  pricing: { basePrice: 14.99, price: 14.99, comparePrice: 24.99, cost: 6 },
  inventory: { quantity: 300, trackQuantity: true, allowBackorder: false, lowStockThreshold: 30, reserved: 0 },
  isActive: true,
  shipping: { weight: 0.2, dimensions: { length: 6, width: 6, height: 10 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["light"],
  status: "active",
  featured: false,
  rating: 4.4,
  numReviews: 150,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
},

{
    name: "USB-C Fast Charger 65W",
    slug: "usb-c-fast-charger-65w",
    description: "High-speed 65W USB-C charger for laptops and smartphones.",
    shortDescription: "65W fast charger",
    sku: "CH-101",
    brand: "PowerMax",
    images: [{ url: "https://m.media-amazon.com/images/I/61BlGwBUGPL._AC_.jpg", alt: "Charger", isMain: true }],
    variants: [{
      name: "Default",
      sku: "CH-101-DEFAULT",
      price: 29.99,
      comparePrice: 49.99,
      cost: 12,
      weight: 0.3,
      dimensions: { length: 8, width: 5, height: 3 },
      inventory: { quantity: 200, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20 },
      attributes: [{ name: "Color", value: "White" }],
      images: ["https://m.media-amazon.com/images/I/61BlGwBUGPL._AC_.jpg"],
      isActive: true,
    }],
    pricing: { basePrice: 29.99, price: 29.99, comparePrice: 49.99, cost: 12 },
    inventory: { quantity: 200, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20, reserved: 0 },
    isActive: true,
    shipping: { weight: 0.3, dimensions: { length: 8, width: 5, height: 3 }, requiresShipping: true, shippingClass: "standard" },
    tags: ["charger", "fast"],
    status: "active",
    featured: true,
    rating: 4.5,
    numReviews: 120,
    reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
  },

  {
    name: "Noise Cancelling Earbuds",
    slug: "noise-cancelling-earbuds",
    description: "Wireless earbuds with ANC and crystal clear audio.",
    shortDescription: "ANC earbuds",
    sku: "EB-102",
    brand: "SoundBeat",
    images: [{ url: "https://m.media-amazon.com/images/I/61Hc+4qJ3RL._AC_.jpg", alt: "Earbuds", isMain: true }],
    variants: [{
      name: "Default",
      sku: "EB-102-DEFAULT",
      price: 79.99,
      comparePrice: 129.99,
      cost: 40,
      weight: 0.2,
      dimensions: { length: 5, width: 5, height: 3 },
      inventory: { quantity: 180, trackQuantity: true, allowBackorder: false, lowStockThreshold: 15 },
      attributes: [{ name: "Color", value: "Black" }],
      images: ["https://picsum.photos/800/600?random=204"],
      isActive: true,
    }],
    pricing: { basePrice: 79.99, price: 79.99, comparePrice: 129.99, cost: 40 },
    inventory: { quantity: 180, trackQuantity: true, allowBackorder: false, lowStockThreshold: 15, reserved: 0 },
    isActive: true,
    shipping: { weight: 0.2, dimensions: { length: 5, width: 5, height: 3 }, requiresShipping: true, shippingClass: "standard" },
    tags: ["earbuds", "audio"],
    status: "active",
    featured: true,
    rating: 4.6,
    numReviews: 210,
    reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
  },

  {
    name: "Gaming Laptop Cooling Pad",
    slug: "gaming-laptop-cooling-pad",
    description: "Cooling pad with RGB fans for gaming laptops.",
    shortDescription: "Laptop cooling pad",
    sku: "LP-103",
    brand: "CoolTech",
    images: [{ url: "https://picsum.photos/800/600?random=205", alt: "Cooling Pad", isMain: true }],
    variants: [{
      name: "Default",
      sku: "LP-103-DEFAULT",
      price: 24.99,
      comparePrice: 39.99,
      cost: 10,
      weight: 0.8,
      dimensions: { length: 35, width: 25, height: 5 },
      inventory: { quantity: 150, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20 },
      attributes: [{ name: "Fan Speed", value: "1200 RPM" }],
      images: ["https://picsum.photos/800/600?random=206"],
      isActive: true,
    }],
    pricing: { basePrice: 24.99, price: 24.99, comparePrice: 39.99, cost: 10 },
    inventory: { quantity: 150, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20, reserved: 0 },
    isActive: true,
    shipping: { weight: 0.8, dimensions: { length: 35, width: 25, height: 5 }, requiresShipping: true, shippingClass: "standard" },
    tags: ["laptop", "cooling"],
    status: "active",
    featured: false,
    rating: 4.3,
    numReviews: 95,
    reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
  },
{
  name: "Wireless Gaming Controller",
  slug: "wireless-gaming-controller",
  description: "Ergonomic wireless controller with vibration feedback and long battery life.",
  shortDescription: "Wireless game controller",
  sku: "GC-401",
  brand: "GamePro",
  images: [{ url: "https://tse4.mm.bing.net/th/id/OIP.1R5I2mELuAJ-duJna57bygHaHF?rs=1&pid=ImgDetMain&o=7&rm=3", alt: "Controller", isMain: true }],
  variants: [{
    name: "Default",
    sku: "GC-401-DEFAULT",
    price: 49.99,
    comparePrice: 69.99,
    cost: 25,
    weight: 0.4,
    dimensions: { length: 15, width: 10, height: 5 },
    inventory: { quantity: 120, trackQuantity: true, allowBackorder: false, lowStockThreshold: 15 },
    attributes: [{ name: "Connectivity", value: "Bluetooth" }],
    images: ["https://picsum.photos/800/600?random=602"],
    isActive: true,
  }],
  pricing: { basePrice: 49.99, price: 49.99, comparePrice: 69.99, cost: 25 },
  inventory: { quantity: 120, trackQuantity: true, allowBackorder: false, lowStockThreshold: 15, reserved: 0 },
  isActive: true,
  shipping: { weight: 0.4, dimensions: { length: 15, width: 10, height: 5 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["gaming", "controller"],
  status: "active",
  featured: true,
  rating: 4.5,
  numReviews: 140,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
},

{
  name: "Adjustable Laptop Stand",
  slug: "adjustable-laptop-stand",
  description: "Foldable aluminum laptop stand with adjustable height.",
  shortDescription: "Laptop stand",
  sku: "LS-402",
  brand: "WorkEase",
  images: [{ url: "https://picsum.photos/800/600?random=603", alt: "Laptop Stand", isMain: true }],
  variants: [{
    name: "Default",
    sku: "LS-402-DEFAULT",
    price: 29.99,
    comparePrice: 49.99,
    cost: 14,
    weight: 0.7,
    dimensions: { length: 25, width: 20, height: 5 },
    inventory: { quantity: 150, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20 },
    attributes: [{ name: "Material", value: "Aluminum" }],
    images: ["https://picsum.photos/800/600?random=604"],
    isActive: true,
  }],
  pricing: { basePrice: 29.99, price: 29.99, comparePrice: 49.99, cost: 14 },
  inventory: { quantity: 150, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20, reserved: 0 },
  isActive: true,
  shipping: { weight: 0.7, dimensions: { length: 25, width: 20, height: 5 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["laptop", "stand"],
  status: "active",
  featured: false,
  rating: 4.4,
  numReviews: 95,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
},

{
  name: "Bluetooth Car Adapter",
  slug: "bluetooth-car-adapter",
  description: "Car Bluetooth adapter with hands-free calling and music streaming.",
  shortDescription: "Car Bluetooth adapter",
  sku: "CAR-403",
  brand: "AutoTech",
  images: [{ url: "https://picsum.photos/800/600?random=605", alt: "Car Adapter", isMain: true }],
  variants: [{
    name: "Default",
    sku: "CAR-403-DEFAULT",
    price: 19.99,
    comparePrice: 34.99,
    cost: 9,
    weight: 0.2,
    dimensions: { length: 6, width: 4, height: 3 },
    inventory: { quantity: 200, trackQuantity: true, allowBackorder: false, lowStockThreshold: 25 },
    attributes: [{ name: "Version", value: "Bluetooth 5.0" }],
    images: ["https://picsum.photos/800/600?random=606"],
    isActive: true,
  }],
  pricing: { basePrice: 19.99, price: 19.99, comparePrice: 34.99, cost: 9 },
  inventory: { quantity: 200, trackQuantity: true, allowBackorder: false, lowStockThreshold: 25, reserved: 0 },
  isActive: true,
  shipping: { weight: 0.2, dimensions: { length: 6, width: 4, height: 3 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["car", "bluetooth"],
  status: "active",
  featured: false,
  rating: 4.3,
  numReviews: 88,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
},

{
  name: "Electric Kettle 1.5L",
  slug: "electric-kettle-15l",
  description: "Fast boiling electric kettle with auto shut-off feature.",
  shortDescription: "Electric kettle",
  sku: "KT-404",
  brand: "HomePro",
  images: [{ url: "https://m.media-amazon.com/images/I/613-9+1NmoL._AC_.jpg", alt: "Kettle", isMain: true }],
  variants: [{
    name: "Default",
    sku: "KT-404-DEFAULT",
    price: 34.99,
    comparePrice: 49.99,
    cost: 18,
    weight: 1.2,
    dimensions: { length: 20, width: 15, height: 25 },
    inventory: { quantity: 90, trackQuantity: true, allowBackorder: false, lowStockThreshold: 10 },
    attributes: [{ name: "Capacity", value: "1.5L" }],
    images: ["https://picsum.photos/800/600?random=608"],
    isActive: true,
  }],
  pricing: { basePrice: 34.99, price: 34.99, comparePrice: 49.99, cost: 18 },
  inventory: { quantity: 90, trackQuantity: true, allowBackorder: false, lowStockThreshold: 10, reserved: 0 },
  isActive: true,
  shipping: { weight: 1.2, dimensions: { length: 20, width: 15, height: 25 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["kitchen"],
  status: "active",
  featured: true,
  rating: 4.5,
  numReviews: 110,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
},

{
  name: "Men Cotton T-Shirt",
  slug: "men-cotton-tshirt",
  description: "Soft and breathable cotton t-shirt for everyday wear.",
  shortDescription: "Cotton t-shirt",
  sku: "TS-405",
  brand: "StyleWear",
  images: [{ url: "https://picsum.photos/800/600?random=609", alt: "Tshirt", isMain: true }],
  variants: [{
    name: "Default",
    sku: "TS-405-DEFAULT",
    price: 19.99,
    comparePrice: 29.99,
    cost: 8,
    weight: 0.3,
    dimensions: { length: 25, width: 20, height: 2 },
    inventory: { quantity: 250, trackQuantity: true, allowBackorder: false, lowStockThreshold: 30 },
    attributes: [{ name: "Size", value: "L" }],
    images: ["https://picsum.photos/800/600?random=610"],
    isActive: true,
  }],
  pricing: { basePrice: 19.99, price: 19.99, comparePrice: 29.99, cost: 8 },
  inventory: { quantity: 250, trackQuantity: true, allowBackorder: false, lowStockThreshold: 30, reserved: 0 },
  isActive: true,
  shipping: { weight: 0.3, dimensions: { length: 25, width: 20, height: 2 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["fashion", "men"],
  status: "active",
  featured: false,
  rating: 4.2,
  numReviews: 130,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
},

{
  name: "Digital Alarm Clock LED",
  slug: "digital-alarm-clock-led",
  description: "LED display alarm clock with snooze and temperature display.",
  shortDescription: "Digital alarm clock",
  sku: "CLK-406",
  brand: "TimeTech",
  images: [{ url: "https://picsum.photos/800/600?random=611", alt: "Clock", isMain: true }],
  variants: [{
    name: "Default",
    sku: "CLK-406-DEFAULT",
    price: 15.99,
    comparePrice: 25.99,
    cost: 7,
    weight: 0.4,
    dimensions: { length: 12, width: 6, height: 6 },
    inventory: { quantity: 180, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20 },
    attributes: [{ name: "Display", value: "LED" }],
    images: ["https://picsum.photos/800/600?random=612"],
    isActive: true,
  }],
  pricing: { basePrice: 15.99, price: 15.99, comparePrice: 25.99, cost: 7 },
  inventory: { quantity: 180, trackQuantity: true, allowBackorder: false, lowStockThreshold: 20, reserved: 0 },
  isActive: true,
  shipping: { weight: 0.4, dimensions: { length: 12, width: 6, height: 6 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["clock"],
  status: "active",
  featured: false,
  rating: 4.3,
  numReviews: 75,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
},

{
  name: "Hair Dryer Professional",
  slug: "hair-dryer-professional",
  description: "High performance hair dryer with multiple heat settings.",
  shortDescription: "Hair dryer",
  sku: "HD-407",
  brand: "BeautyCare",
  images: [{ url: "https://m.media-amazon.com/images/I/71b56p2pn6L._AC_.jpg", alt: "Hair Dryer", isMain: true }],
  variants: [{
    name: "Default",
    sku: "HD-407-DEFAULT",
    price: 39.99,
    comparePrice: 59.99,
    cost: 20,
    weight: 0.9,
    dimensions: { length: 25, width: 10, height: 10 },
    inventory: { quantity: 110, trackQuantity: true, allowBackorder: false, lowStockThreshold: 15 },
    attributes: [{ name: "Power", value: "2000W" }],
    images: ["https://picsum.photos/800/600?random=614"],
    isActive: true,
  }],
  pricing: { basePrice: 39.99, price: 39.99, comparePrice: 59.99, cost: 20 },
  inventory: { quantity: 110, trackQuantity: true, allowBackorder: false, lowStockThreshold: 15, reserved: 0 },
  isActive: true,
  shipping: { weight: 0.9, dimensions: { length: 25, width: 10, height: 10 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["beauty"],
  status: "active",
  featured: true,
  rating: 4.4,
  numReviews: 160,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
},

{
  name: "Office Chair Ergonomic",
  slug: "office-chair-ergonomic",
  description: "Ergonomic office chair with lumbar support and adjustable height.",
  shortDescription: "Office chair",
  sku: "CHR-408",
  brand: "ComfortSeat",
  images: [{ url: "https://th.bing.com/th/id/OIP.WmjbLqoVOF-vysiACDXXwAHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", alt: "Chair", isMain: true }],
  variants: [{
    name: "Default",
    sku: "CHR-408-DEFAULT",
    price: 149.99,
    comparePrice: 199.99,
    cost: 80,
    weight: 10,
    dimensions: { length: 70, width: 60, height: 120 },
    inventory: { quantity: 60, trackQuantity: true, allowBackorder: false, lowStockThreshold: 10 },
    attributes: [{ name: "Material", value: "Mesh" }],
    images: ["https://picsum.photos/800/600?random=616"],
    isActive: true,
  }],
  pricing: { basePrice: 149.99, price: 149.99, comparePrice: 199.99, cost: 80 },
  inventory: { quantity: 60, trackQuantity: true, allowBackorder: false, lowStockThreshold: 10, reserved: 0 },
  isActive: true,
  shipping: { weight: 10, dimensions: { length: 70, width: 60, height: 120 }, requiresShipping: true, shippingClass: "standard" },
  tags: ["office"],
  status: "active",
  featured: true,
  rating: 4.6,
  numReviews: 85,
  reviews: [{ rating: 4.5, comment: "Great product!", user: null }],
}

];

// Sample categories
const sampleCategories =  [
  {

    name: "Electronics",
    slug: "electronics",
    productCount: 234,
    subcategories: ["Mobiles", "Laptops", "Accessories"],
    sortorder: 1,
   subcategories1: [
    "iPhone",
    "Samsung Galaxy",
    "OnePlus",
    "Gaming Laptops",
    "MacBook",
    "Ultrabooks",
    "Chargers",
    "Power Banks",
    "Headphones",
    "Smart Watches"
  ],
   subcategories2: [
    "Cameras",
    "Smartphones",
    "Tablets",
    "Laptops",
    "Desktops",
    "Accessories",
    "Gaming Laptops",
    "MacBook",  
    "Ultrabooks",
    "Chargers",
    "Power Banks",
    "Headphones",
    "Smart Watches"
  ],
   subcategories3: [
    "TVs",  
    "Smart TVs",
    "LED TVs",
    "OLED TVs",
    "QLED TVs",
    "Curved TVs",
    "4K TVs",
    "8K TVs",
    "UHD TVs",
    "HDR TVs",
    "Android TVs",
    "iOS TVs",
    "Windows TVs",
    "Mac TVs",
    "Chromebook TVs",
    "Gaming TVs",
    "4K Gaming TVs",
    "8K Gaming TVs",
    "UHD Gaming TVs",
    "HDR Gaming TVs",
    "Android Gaming TVs",
    "iOS Gaming TVs",
    "Windows Gaming TVs",
   ],
  },
  {
     
    name: "Home & Kitchen",
    slug: "home-kitchen",
    sortorder: 2,
    productCount: 156,
    subcategories: ["Furniture", "Appliances", "Decor"],
    subcategories1: [
    "Sofas",
    "Beds",
    "Dining Tables",
    "Cabinets",
    "Kitchen Cabinets",
    "Bar Stools",
    "Chairs",
    "Cushions",
    "Pillows",
    "Curtains",
    "Curtains",
    ]
  },
  {
    
    name: "Fashion",
    slug: "fashion",
    productCount: 189,
    sortorder: 3,
    subcategories: ["Men", "Women", "Kids"],
      subcategories1: [
        "Men's Clothing",
        "Women's Clothing",
        "Kid's Clothing",
        "Men's Shoes",
        "Women's Shoes",
        "Kid's Shoes",
        " Men's Accessories",
        "Women's Accessories",
        "Kid's Accessories",
        "Men's Watches",
        "Women's Watches",
        "Kid's Watches",
      ]
  },
  {
      
    name: "Fitness",
    slug: "fitness",
    productCount: 98,
    sortorder: 4,
    subcategories: ["Workout Gear", "Supplements"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
  {
     
    name: "Beauty",
    slug: "beauty",
    productCount: 76,
      sortorder: 5,
    subcategories: ["Skincare", "Makeup", "Hair Care"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
  {
    
    name: "Accessories",
    slug: "accessories",
      sortorder: 6,
    productCount: 45,
    subcategories: ["Watches", "Bags", "Jewelry"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
  {
     
    name: "Toys & Games",
    slug: "toys",
    productCount: 55,
    sortorder: 7,
    subcategories: ["Action Figures", "Board Games", "Puzzles"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
  {
     
    name: "Books",
    slug: "books",
    productCount: 90,
    sortorder: 8,
    subcategories: ["Fiction", "Non-fiction", "Educational"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
  {
    
    name: "Baby Products",
    slug: "baby",
    productCount: 40,
    sortorder: 9,
    subcategories: ["Diapers", "Toys", "Clothing"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
  {
     
    name: "Pet Supplies",
    slug: "pets",
    productCount: 35,
    sortorder: 10,
    subcategories: ["Dog Food", "Cat Food", "Accessories"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
  {
    
    name: "Computers",
    slug: "computers",
    productCount: 75,
    sortorder: 11,
    subcategories: ["Desktops", "Monitors", "Keyboards"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
  {
     
    name: "Gaming",
    slug: "gaming",
    productCount: 65,
    sortorder: 12,
    subcategories: ["Consoles", "Games", "Accessories"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
  {
      
    name: "Furniture",
    slug: "furniture",
    productCount: 85,
    sortorder: 13,
    subcategories: ["Sofas", "Beds", "Tables"],
      subcategories1: ["raw data","raw data","raw data","raw data",]
  },
];


// Sample supplier
const sampleSupplier = {
  name: "Global Suppliers Inc",
  slug: "global-suppliers-inc",
  description: "A leading global supplier of quality products",
  contact: {
    email: "contact@globalsuppliers.com",
    phone: "+1-555-0123",
    address: {
      street: "123 Supplier Street",
      city: "Commerce City",
      state: "CA",
      zipCode: "12345",
      country: "USA",
    },
  },
  performance: {
    totalOrders: 1250,
    successfulOrders: 1200,
    failedOrders: 50,
    averageProcessingTime: 24,
    averageShippingTime: 3,
    rating: {
      average: 4.8,
      count: 450,
    },
  },
  pricing: {
    commissionRate: 10,
    shippingRates: [
      {
        method: "standard",
        baseRate: 5.99,
        perItemRate: 1.99,
        freeShippingThreshold: 50,
      },
      {
        method: "express",
        baseRate: 12.99,
        perItemRate: 2.99,
        freeShippingThreshold: 100,
      },
    ],
  },
  integration: {
    type: "manual",
    autoSync: false,
    syncFrequency: 24,
  },
  isActive: true,
};

async function seedDatabase() {
  try {
    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://Anand:Anand967141@cluster0.whni8gd.mongodb.net/ecommerce_businness?retryWrites=true&w=majority&appName=Cluster0",
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    if (process.env.SEED_CLEAR === "true") {
      await Product.deleteMany({});
      await Category.deleteMany({});
      await Supplier.deleteMany({});
    }
    console.log("Cleared existing data");

    // Insert supplier first
    const supplier = await Supplier.findOneAndUpdate(
  { slug: sampleSupplier.slug },
  sampleSupplier,
  { upsert: true, new: true }
);
    console.log("Created supplier:", supplier.name);

    // Insert categories
    const seen = new Set();
const uniqueCategories = [];

for (const cat of sampleCategories) {
  if (!seen.has(cat.slug)) {
    seen.add(cat.slug);
    uniqueCategories.push(cat);
  }
}

const categories = [];

for (const cat of uniqueCategories) {   // ✅ FIX HERE
  const updated = await Category.findOneAndUpdate(
    { slug: cat.slug },
    cat,
    { upsert: true, new: true }
  );
  categories.push(updated);
}
    console.log(`Created ${categories.length} categories`);

    // Create category lookup map
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // Update products with category references and supplier
   const productsWithRefs = sampleProducts.map((product, index) => {
  let categorySlug = "electronics"; // default

  // 🔥 Smart category assignment
  if (index === 0 || index === 1) {
    categorySlug = "electronics";
  } else if (index === 2) {
    categorySlug = "sports";
  } else if (index === 3) {
    categorySlug = "home-living";
  } else if (index === 4) {
    categorySlug = "beauty";
  }

  // 🔥 Safe category fetch
  let catId = categoryMap[categorySlug];

  // 🚨 Fallback if category missing
  if (!catId) {
    console.log("❌ Missing category:", categorySlug);

    // fallback to first available category
    const fallbackCategory = Object.values(categoryMap)[0];

    if (!fallbackCategory) {
      throw new Error("🚨 No categories found in DB");
    }

    catId = fallbackCategory;
  }

  // 🔥 Fix variants (important)
  let variants = product.variants;

  if (!variants || variants.length === 0) {
    variants = [
      {
        name: "Default",
        sku: `${product.sku || "SKU"}-DEFAULT-${index}`,
        slug: product.slug + "-" + index,
        price: product.pricing?.price || product.price || 100,
        comparePrice: product.pricing?.comparePrice || 150,
        cost: product.pricing?.cost || 50,
        weight: 0.5,
        dimensions: { length: 10, width: 10, height: 5 },
        inventory: {
          quantity: 50,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 10,
        },
        attributes: [{ name: "Color", value: "Default" }],
        images: product.images?.map((img) => img.url || img) || [],
        isActive: true,
      },
    ];
  }

  return {
    ...product,
    variants,
    category: catId,
    supplier: supplier._id,
  };
});

    // Insert products
    const products = await Product.insertMany(productsWithRefs, {
      ordered: false,
    });
    console.log(`Created ${products.length} products`);

    console.log("Database seeded successfully!");

    // Close connection
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

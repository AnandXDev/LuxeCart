"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import axios from "axios";
import { ProductCard } from "../components/product/ProductCard";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

// Types
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: Array<{ url: string; alt: string }>;
  brand: {
    name: string;
    toLowerCase: () => string;
  };
  pricing: {
    basePrice: number;
    comparePrice?: number | null;
    cost?: number;
    taxClass?: string;
    total?: number;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  categorySlug: string;
  rating: {
    average: number;
    count: number;
  };
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    trackQuantity: boolean;
  };
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    requiresShipping: boolean;
  };
  featured: boolean;
  status: "active" | "inactive" | "draft";
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: Array<{
    productId: string;
    name: string;
    images: Array<{ url: string; alt: string }>;
    productSnapshot: {
      name: string;
      images: string[];
    };
    pricing: {
      total: number;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

interface DataContextType {
  // Products
  products: Product[];
  featuredProducts: Product[];
  loadingProducts: boolean;
  productsError: string | null;
  refreshProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;

  // Categories
  categories: Category[];
  loadingCategories: boolean;
  categoriesError: string | null;
  refreshCategories: () => Promise<void>;
  getCategoryBySlug: (slug: string) => Category | undefined;

  // Orders
  orders: Order[];
  loadingOrders: boolean;
  ordersError: string | null;
  refreshOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;

  // User specific data
  userData: {
    orders: Order[];
    wishlist: Product[];
    recentlyViewed: Product[];
  };
  loadingUserData: boolean;
  userDataError: string | null;
  refreshUserData: () => Promise<void>;

  // Global loading state
  isInitialLoading: boolean;
  refreshAllData: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // User specific data
  const [userData, setUserData] = useState({
    orders: [] as Order[],
    wishlist: [] as Product[],
    recentlyViewed: [] as Product[],
  });
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [userDataError, setUserDataError] = useState<string | null>(null);

  // Global loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token") || Cookies.get("jwt");
  };

  // Generic API caller with better error handling
  const apiCall = async (url: string, options: RequestInit = {}) => {
    try {
      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      console.log(`🌐 API Call: ${API_URL}${url}`);

      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${url}`, data);
      return data;
    } catch (error: any) {
      console.error(`❌ API call failed for ${url}:`, error);

      // Handle connection errors gracefully
      if (error.message.includes("Failed to fetch")) {
        console.log("🔌 Backend server appears to be down");
        throw new Error(
          "Backend server is not responding. Please try again later.",
        );
      }

      throw error;
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setProductsError(null);

      const data = await apiCall("/api/products?status=active&limit=100");

      if (data.success || data.status === "success") {
        const allProducts =
          data?.data?.products || data?.products || data?.data || [];
        console.log("🔥 FULL PRODUCTS API:", data);
        console.log("🔥 Extracted Products:", allProducts);
        setProducts(allProducts);
        setFeaturedProducts(
          allProducts.filter((product: Product) => product.featured),
        );
      } else {
        throw new Error(data.message || "Failed to fetch products");
      }
    } catch (error: any) {
      setProductsError(error.message || "Failed to fetch products");
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setCategoriesError(null);

      const data = await apiCall("/api/categories");

      if (data.success) {
        const allCategories = data.data.categories || [];
        setCategories(allCategories);
      } else {
        throw new Error(data.message || "Failed to fetch categories");
      }
    } catch (error: any) {
      setCategoriesError(error.message || "Failed to fetch categories");
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    if (!isAuthenticated) {
      console.log("fetchOrders: User not authenticated, skipping");
      return;
    }

    try {
      console.log("fetchOrders: Starting to fetch orders...");
      setLoadingOrders(true);
      setOrdersError(null);

      const data = await apiCall("/api/orders");
      console.log("fetchOrders: Raw API response:", data);

      if (data.success) {
        // Changed from data.status === 'success'
        console.log(
          "fetchOrders: Orders fetched successfully:",
          data.data.orders,
        );

        // Transform backend orders to frontend format
        const transformedOrders = (data.data.orders || []).map(
          (order: any) => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            items: order.items.map((item: any) => ({
              productId: item.product,
              name: item.productSnapshot?.name || "Product",
              images:
                item.productSnapshot?.images?.map((img: string) => ({
                  url: img,
                  alt: item.productSnapshot?.name || "Product",
                })) || [],
              quantity: item.quantity,
              price: item.price,
              subtotal: item.total,
            })),
            subtotal: order.pricing?.subtotal || 0,
            shipping: order.pricing?.shipping || 0,
            tax: order.pricing?.tax || 0,
            total: order.pricing?.total || 0,
            shippingAddress: {
              fullName:
                `${order.shipping?.address?.firstName || ""} ${order.shipping?.address?.lastName || ""}`.trim(),
              address: order.shipping?.address?.street || "",
              city: order.shipping?.address?.city || "",
              state: order.shipping?.address?.state || "",
              zipCode: order.shipping?.address?.zipCode || "",
              country: order.shipping?.address?.country || "",
            },
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus || "paid",
            paymentDetails: order.paymentDetails,
            orderDate: order.createdAt,
            estimatedDelivery: order.estimatedDelivery,
            trackingNumber: order.trackingNumber,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          }),
        );

        console.log("fetchOrders: Transformed orders:", transformedOrders);
        setOrders(transformedOrders);
        setUserData((prev) => ({ ...prev, orders: transformedOrders }));
      } else {
        console.error("fetchOrders: API returned error:", data.message);
        throw new Error(data.message || "Failed to fetch orders");
      }
    } catch (error: any) {
      console.error("fetchOrders: Error fetching orders:", error);
      setOrdersError(error.message || "Failed to fetch orders");
      toast.error("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

 
  // Fetch user specific data
  const fetchUserData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingUserData(true);
      setUserDataError(null);

      // This would be expanded to fetch wishlist, recently viewed, etc.
      // For now, we'll just fetch orders
      await fetchOrders();
    } catch (error: any) {
      setUserDataError(error.message || "Failed to fetch user data");
      toast.error("Failed to load user data");
    } finally {
      setLoadingUserData(false);
    }
  };

  // Helper functions
  const getProductBySlug = (slug: string) => {
    return products.find((product) => product.slug === slug);
  };

  const getProductById = (id: string) => {
    return products.find((product) => product._id === id);
  };

  const getCategoryBySlug = (slug: string) => {
    return categories.find((category) => category.slug === slug);
  };

  const getOrderById = (id: string) => {
    return orders.find((order) => order._id === id);
  };

  // Refresh functions
  const refreshProducts = async () => {
    await fetchProducts();
  };

  const refreshCategories = async () => {
    await fetchCategories();
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  const refreshAllData = async () => {
    setIsInitialLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchCategories(), fetchUserData()]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Initialize data on mount and when auth changes
  useEffect(() => {
    if (!authLoading) {
      const initializeData = async () => {
        setIsInitialLoading(true);
        try {
          // Always fetch products and categories (public data)
          await Promise.all([fetchProducts(), fetchCategories()]);

          // Fetch user-specific data only if authenticated
          if (isAuthenticated) {
            await fetchUserData();
          }
        } finally {
          setIsInitialLoading(false);
        }
      };

      initializeData();
    }
  }, [authLoading, isAuthenticated]);

  const value: DataContextType = {
    // Products
    products,
    featuredProducts,
    loadingProducts,
    productsError,
    refreshProducts,
    getProductBySlug,
    getProductById,

    // Categories
    categories,
    loadingCategories,
    categoriesError,
    refreshCategories,
    getCategoryBySlug,

    // Orders
    orders,
    loadingOrders,
    ordersError,
    refreshOrders,
    getOrderById,

    // User data
    userData,
    loadingUserData,
    userDataError,
    refreshUserData,

    // Global
    isInitialLoading,
    refreshAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Hook to use data context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

// Utility hooks for specific data
export function useProducts() {
  const {
    products,
    featuredProducts,
    loadingProducts,
    productsError,
    refreshProducts,
    getProductBySlug,
    getProductById,
  } = useData();
  return {
    products,
    featuredProducts,
    loadingProducts,
    productsError,
    refreshProducts,
    getProductBySlug,
    getProductById,
  };
}

export function useCategories() {
  const {
    categories,
    loadingCategories,
    categoriesError,
    refreshCategories,
    getCategoryBySlug,
  } = useData();
  return {
    categories,
    loadingCategories,
    categoriesError,
    refreshCategories,
    getCategoryBySlug,
  };
}

export function useOrders() {
  const { orders, loadingOrders, ordersError, refreshOrders, getOrderById } =
    useData();
  return { orders, loadingOrders, ordersError, refreshOrders, getOrderById };
}

export function useUserData() {
  const { userData, loadingUserData, userDataError, refreshUserData } =
    useData();
  return { userData, loadingUserData, userDataError, refreshUserData };
}

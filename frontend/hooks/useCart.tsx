"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";
import Cookies from "js-cookie";

// Types
export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  images: Array<{ url: string; alt: string }>;
  price: number;
  comparePrice?: number;
  variant?: {
    id: string;
    name: string;
    options: Record<string, string>;
  };
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  lastUpdated: string;
  discount: number;
}

interface CartContextType {
  cart: Cart;
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<CartItem, "id" | "addedAt">) => Promise<void>;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithServer: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage key
const CART_STORAGE_KEY = "dropship_cart";

// Cart Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    total: 0,
    itemCount: 0,
    lastUpdated: new Date().toISOString(),
    discount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  // Fetch cart from server
  // Fetch cart from server
  const fetchCartFromServer = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/cart", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // 🔍 LOG THIS TO YOUR CONSOLE
      console.log("DEBUG: Raw Server Response:", data);

      // Flexible check: handle both { status: 'success', data: [...] }
      // and raw arrays [{}, {}]
      const cartData = data.data || data;
      const items = Array.isArray(cartData) ? cartData : cartData.items || [];

      if (items) {
        const totals = calculateTotals(items);
        setCart({
          items: items,
          subtotal: totals.subtotal,
          total: totals.total,
          itemCount: totals.itemCount,
          lastUpdated: new Date().toISOString(),
          discount: 0,
        });
      } else {
        console.error("❌ Could not find items in response", data);
        throw new Error("Invalid cart response structure");
      }

      return data;
    } catch (err: any) {
      console.error("🔥 Fetch error:", err.message);
    }
  };

  // Sync with server when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCartFromServer();
    }
  }, [isAuthenticated, user]);

  // Calculate totals
  const calculateTotals = (items: CartItem[]) => {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    // Add shipping, tax, etc. here if needed
    const shipping = subtotal > 500 ? 0 : 40; // Free shipping over ₹500
    const tax = subtotal * 0.18; // 18% GST for India
    const total = subtotal + shipping + tax;

    return {
      subtotal,
      total,
      itemCount,
      shipping,
      tax,
    };
  };

  // Add item to cart
  const addItem = async (item: CartItem) => {
  try {
    setLoading(true);
    setError(null);

    if (!isAuthenticated) {
      throw new Error("Please login to add items to cart");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: item.productId,
        quantity: item.quantity,
      }),
    });

    const data = await res.json();

    // 🔥 FIXED CONDITION
    if (!data.success && data.status !== "success") {
      throw new Error(data.message || "Failed to add item");
    }

    // ✅ refresh cart
    await fetchCartFromServer();

    return true; // 🔥 IMPORTANT
  } catch (error) {
    console.error("Error adding item to cart:", error);
    setError(error.message);

    throw error; // ye rehne do (correct hai)
  } finally {
    setLoading(false);
  }
};

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        throw new Error("Please login to remove items from cart");
      }

      // Find the item to get productId
      const itemToRemove = cart.items.find((item) => item.id === itemId);
      if (!itemToRemove) {
        throw new Error("Item not found in cart");
      }

      // Remove from server cart
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const serverResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cart/${itemToRemove.productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!serverResponse.ok) {
        throw new Error("Failed to remove item from server cart");
      }

      // Refresh cart from server to get updated state
      await fetchCartFromServer();
    } catch (error: any) {
      console.error("Error removing item from cart:", error);
      setError(error.message || "Failed to remove item from cart");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
 const updateQuantity = async (itemId: string, quantity: number) => {
  try {
    setLoading(true);
    
    // 1. Find the item
    console.log("🔍 UPDATE QUANTITY DEBUG ===");
    console.log("🔍 Cart items:", cart.items);
    console.log("🔍 Looking for item with ID:", itemId);
    
    const itemToUpdate = cart.items.find((item) => item.id === itemId || item.productId === itemId);
    
    console.log("🔍 Found item:", itemToUpdate);
    
    if (!itemToUpdate) {
      console.error("❌ Item not found in cart for ID:", itemId);
      console.error("❌ Available item IDs:", cart.items.map(cartItem => ({ id: cartItem.id, productId: cartItem.productId })));
      throw new Error("Item not found in cart");
    }

    // 2. Identify the correct ID for URL
    // Use productId consistently (that's what backend expects)
    const idForUrl = itemToUpdate.productId || itemId;
    
    console.log("🔍 ID for URL:", idForUrl);
    console.log("🔍 Item structure:", JSON.stringify(itemToUpdate, null, 2));

    if (!idForUrl || idForUrl === 'undefined') {
      console.error("Missing ID for item:", itemToUpdate);
      throw new Error("Invalid Item ID");
    }

    const token = localStorage.getItem("token");

    // 3. Make the call
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cart/${idForUrl}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Server error");

    // 4. Refresh to sync state
    await fetchCartFromServer();

  } catch (error: any) {
    console.error("Error updating item quantity:", error);
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};

  // Clear cart
  const clearCart = () => {
    try {
      setCart({
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
        lastUpdated: new Date().toISOString(),
        discount: 0,
      });

      // Sync with server if authenticated
      if (isAuthenticated) {
        syncCartWithServer([]);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      setError("Failed to clear cart");
    }
  };

  // Sync cart with server
  const syncWithServer = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      await syncCartWithServer(cart.items);
    } catch (error) {
      console.error("Error syncing cart with server:", error);
      setError("Failed to sync cart with server");
    } finally {
      setLoading(false);
    }
  };

  // Sync cart items with server
  const syncCartWithServer = async (items: CartItem[]) => {
    if (!isAuthenticated || !user) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/cart/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to sync cart");
      }

      const data = await response.json();
      console.log("Cart synced with server:", data);
    } catch (error) {
      console.error("Server sync error:", error);
      // Don't throw error to avoid breaking local cart functionality
    }
  };

  const value: CartContextType = {
    cart,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    syncWithServer,
    isCartOpen,
    setIsCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Utility functions
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export const calculateItemTotal = (item: CartItem) => {
  return item.price * item.quantity;
};

export const calculateSavings = (item: CartItem) => {
  if (!item.comparePrice || item.comparePrice <= item.price) {
    return 0;
  }
  return (item.comparePrice - item.price) * item.quantity;
};

export const isItemOutOfStock = (item: CartItem, stockQuantity: number) => {
  return item.quantity > stockQuantity;
};

export const getMaximumQuantity = (
  item: CartItem,
  stockQuantity: number,
  maxQuantity: number = 10,
) => {
  return Math.min(stockQuantity, maxQuantity);
};

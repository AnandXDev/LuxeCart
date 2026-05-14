"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Input } from "@/components/ui/Input";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { useProducts } from "@/hooks/useData"; // Ensure this is imported if needed for product details
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Ticket,
  Truck,
  Shield,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeItem,
    updateQuantity,
    clearCart,
    loading: cartLoading,
    error: cartError,
  } = useCart();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const { products } = useProducts();

  useEffect(() => {
    // Only check authentication after loading is complete
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      }
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Show error if any
    if (cartError) {
      toast.error(cartError);
    }
  }, [cartError]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setIsUpdating(true);
      try {
        await removeItem(itemId);
        toast.success("Item removed from cart");
      } catch (error: any) {
        toast.error(error.message || "Failed to remove item");
      } finally {
        setIsUpdating(false);
      }
    } else {
      setIsUpdating(true);
      try {
        await updateQuantity(itemId, newQuantity);
        toast.success("Quantity updated");
      } catch (error: any) {
        toast.error(error.message || "Failed to update quantity");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleRemoveItem = async (itemId: string, itemName: string) => {
    setIsUpdating(true);
    try {
      await removeItem(itemId);
      toast.success(`${itemName} removed from cart`);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);
    try {
      // Simulate promo code validation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (promoCode.toUpperCase() === "SAVE10") {
        setPromoDiscount(cart.subtotal * 0.1);
        toast.success("Promo code applied! 10% discount");
      } else if (promoCode.toUpperCase() === "SAVE20") {
        setPromoDiscount(cart.subtotal * 0.2);
        toast.success("Promo code applied! 20% discount");
      } else {
        toast.error("Invalid promo code");
        setPromoDiscount(0);
      }
    } catch (error) {
      toast.error("Failed to apply promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const calculateShipping = () => {
    return cart.subtotal > 50 ? 0 : 9.99;
  };

  const calculateTax = () => {
    return (cart.subtotal - promoDiscount) * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return cart.subtotal - promoDiscount + calculateShipping() + calculateTax();
  };

  const handleCheckout = () => {
    if (isUpdating) return;
    router.push("/checkout");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Authentication guard
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your cart
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-gray-50"
      >
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Empty Cart Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <ShoppingBag className="h-16 w-16 text-gray-400" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Start
              shopping to fill it up!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/products")} size="lg">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Start Shopping
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/categories")}
                size="lg"
              >
                Browse Categories
              </Button>
            </div>

            {/* Recommendations */}
            <div className="mt-16">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                You might also like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {products.slice(1, 4).map((product: any, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm p-4 text-center"
                  >
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Featured Product {i}
                    </h3>
                    <p className="text-gray-600 mb-4">${product.pricing?.basePrice?.toFixed(2) || "0.00"}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/products")}
                    >
                      View Product
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50"
    >
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shopping Cart ({cart.itemCount} items)
          </h1>
          <p className="text-gray-600">
            Review your items and proceed to checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items List */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Cart Items</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearCart();
                      toast.success("Cart cleared");
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear Cart
                  </Button>
                </div>

                <div className="space-y-6">
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item.id} 
                      custom={item}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Product Image */}
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.images?.[0] && (
                          <Image
                            src={item.images[0].url}
                            alt={item.images[0].alt}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">
                              <Link
                                href={`/product/${item.productId}`}
                                className="hover:text-primary transition-colors"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-500">
                              SKU: {item.productId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            disabled={isUpdating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold text-gray-900">
                              {formatPrice(item.price)}
                            </span>
                            {item.comparePrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(item.comparePrice)}
                              </span>
                            )}
                            {item.comparePrice && (
                              <span className="text-sm text-green-600">
                                Save{" "}
                                {formatPrice(item.comparePrice - item.price)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">Qty:</span>
                            <QuantitySelector
                              value={item.quantity}
                              onChange={(newVal) =>
                                updateQuantity(item.id, newVal)
                              } // Make sure this is item.id
                            />
                          </div>
                        </div>

                        {/* Item Subtotal */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Subtotal
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Promo Code */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Promo Code</h3>
              <div className="flex space-x-4">
                <Input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo}
                  variant="outline"
                >
                  {isApplyingPromo ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Ticket className="h-4 w-4 mr-2" />
                      Apply
                    </>
                  )}
                </Button>
              </div>
              {promoDiscount > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    Promo code applied! You saved {formatPrice(promoDiscount)}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div variants={itemVariants} className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.itemCount} items)</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>

                  {/* Promo Discount */}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between text-gray-600">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Shipping
                    </div>
                    <span>
                      {calculateShipping() === 0
                        ? "FREE"
                        : formatPrice(calculateShipping())}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(calculateTax())}</span>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>

                  {/* Free Shipping Notice */}
                  {cart.subtotal - promoDiscount < 50 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      <p className="text-green-800">
                        Add {formatPrice(50 - (cart.subtotal - promoDiscount))}{" "}
                        more for free shipping!
                      </p>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    size="lg"
                    disabled={isUpdating || cart.items.length === 0}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>

                  {/* Continue Shopping */}
                  <Button
                    variant="outline"
                    onClick={() => router.push("/products")}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>

                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <p className="text-blue-800">
                        Secure checkout with SSL encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

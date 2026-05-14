"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { useOrders } from "@/hooks/useData";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Input } from "@/components/ui/Input";
import {
  Trash2,
  Plus,
  Minus,
  Truck,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";
import axios from "axios";
// import Cookies from "js-cookie";

interface ShippingInfo {
  fullName: string;
  email: string; // ✅ ADD THIS
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated} = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const { refreshOrders } = useOrders();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBuyNowCheckout, setIsBuyNowCheckout] = useState(false);
  const [tempCartItems, setTempCartItems] = useState<any[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    // 🔥 ADD THIS HERE
  const saved = sessionStorage.getItem("shippingInfo");
  if (saved) {
    setShippingInfo(JSON.parse(saved));
  }
    // Check for Buy Now temporary data
    const tempCheckoutData = sessionStorage.getItem("tempCheckout");

    if (tempCheckoutData) {
      try {
        const tempData = JSON.parse(tempCheckoutData);
        setIsBuyNowCheckout(true);
        setTempCartItems(tempData.items || []);

        // Clear the temporary data after using it
        sessionStorage.removeItem("tempCheckout");
      } catch (error) {
        console.error("Error parsing temp checkout data:", error);
        sessionStorage.removeItem("tempCheckout");
      }
    }

    // Check if cart is empty (for normal checkout)
   if (!tempCheckoutData && cart.items.length === 0 && isAuthenticated) {
  router.push("/products");
}

    // Pre-fill user info if authenticated
    if (isAuthenticated && user) {
      setShippingInfo((prev) => ({
        ...prev,
        fullName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  }, [cart.items.length, isAuthenticated, user, router]);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Get current items (either normal cart or Buy Now items)
  const getCurrentItems = () => {
    return isBuyNowCheckout ? tempCartItems : cart.items;
  };

  // Calculate subtotal for current items
  const calculateSubtotal = () => {
    const items = getCurrentItems();
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 500 ? 0 : 40; // Updated for INR
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST for India
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const validateForm = () => {
    const required = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
    ];
    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingInfo]) {
        toast.error(`Please fill in all required fields`);
        return false;
      }
    }
    return true;
  };

  // Inside CheckoutPage.tsx

  // Helper functions for Razorpay integration
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || "User",
      lastName: parts.slice(1).join(" ") || "Customer",
    };
  };

  const buildOrderPayload = () => {
    const { firstName, lastName } = splitName(shippingInfo.fullName);

    return {
      items: getCurrentItems().map((item) => ({
        productId: item.productId || item._id || item.id || "",
        quantity: item.quantity,
        price: item.price,
        variant: item.variant || {},
      })),
      shippingInfo: {
        firstName,
        lastName,
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: "India",
        email: shippingInfo.email || user?.email || "",
        phone: shippingInfo.phone,
      },
      billingInfo: {
        firstName,
        lastName,
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: "India",
        email: shippingInfo.email || user?.email || "",
        phone: shippingInfo.phone,
      },
      totalAmount: calculateTotal(), // Keep in rupees for order creation
      paymentMethod: "razorpay",
    };
  };

  const handleRazorpayPayment = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }
      const orderPayload = buildOrderPayload();

      const razorpayRes = await axios.post(
        "http://localhost:5000/api/payments/create-order",
        {
          amount: calculateTotal(), // Send in rupees, backend will convert to paise
          currency: "INR",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const rzpOrder = razorpayRes.data.data;

      const options = {
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SUdiyiqCREmU8k",
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "LuxeCart",
        description: "Purchase Payment",
        order_id: rzpOrder.id,
        prefill: {
          name: shippingInfo.fullName,
          email: shippingInfo.email || user?.email || "",
          contact: shippingInfo.phone,
        },
        theme: { color: "#3399cc" },
        handler: async (response: any) => {
          try {
            console.log("🔹 Razorpay response:", response);

            const verifyRes = await axios.post(
              "http://localhost:5000/api/payments/verify",
              {
                ...orderPayload,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );

            console.log("🔹 Verification response:", verifyRes.data);

            if (verifyRes.data.success) {
              toast.success("Order placed successfully!");
              if (!isBuyNowCheckout) clearCart();
              await refreshOrders();
              router.push("/order-success");
            } else {
              throw new Error(
                verifyRes.data.message || "Payment verification failed",
              );
            }
          } catch (err: any) {
            console.error("🔥 Verification failed:", err);
            console.error("🔥 Error response:", err.response?.data);
            toast.error(
              err.response?.data?.message ||
                "Payment verification failed. Please contact support.",
            );
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("FULL ERROR:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Failed to initiate checkout",
      );
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "cod") {
      await handleCOD();
    } else if (paymentMethod === "razorpay") {
      await handleRazorpayPayment();
    } else if (paymentMethod === "qr") {
      await handleQRPayment();
    }
  };
  const handleCOD = async () => {
    if (!validateForm()) return;

    try {
      setIsProcessing(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }
      useEffect(() => {
        if (!isAuthenticated) {
          router.replace("/login");
          return;
        }
      }, [isAuthenticated]);
      if (!isBuyNowCheckout) {
        clearCart();
      }

      await axios.post(
        "http://localhost:5000/api/orders/cod",
        {
          items: getCurrentItems().map((item) => ({
            product: item.productId || item.id || item._id,
            name: item.name,
            image: item.images?.[0]?.url,
            variant: item.variant || {},
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: {
            fullName: shippingInfo.fullName,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            pincode: shippingInfo.zipCode,
          },
          paymentMethod: "COD",
          paymentStatus: "pending",
          totalAmount: calculateTotal(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Order placed with COD!");
      clearCart();
      router.push("/order-success");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "COD failed");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleQRPayment = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/payment/qr",
        {
          amount: calculateTotal(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      window.open(res.data.short_url, "_blank");
    } catch {
      toast.error("QR Payment failed");
    }
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  if (!isBuyNowCheckout && cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-6">
            Add some products to your cart to checkout
          </p>
          <Button onClick={() => router.push("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="container-custom py-8">
        <div className="mb-8">
          <Link
            href="/products"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold mb-6">
                Order Items (
                {isBuyNowCheckout ? tempCartItems.length : cart.items.length})
                {isBuyNowCheckout && (
                  <Badge variant="secondary" className="ml-2">
                    Buy Now
                  </Badge>
                )}
              </h2>

              <div className="space-y-4">
                {getCurrentItems().map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.images?.[0] && (
                        <Image
                          src={item.images[0].url}
                          alt={item.images[0].alt}
                          loading="lazy"
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                      {item.comparePrice && (
                        <p className="text-sm text-green-600">
                          Save:{" "}
                          {formatPrice(
                            (item.comparePrice - item.price) * item.quantity,
                          )}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        disabled={item.quantity >= 10}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold mb-6">
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={shippingInfo.fullName}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="example@gmail.com"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <Input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="New York"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <Input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    placeholder="NY"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <Input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                    placeholder="10001"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

              <div className="space-y-4">
                <div
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === "razorpay"
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <p className="font-medium">💳 Online Payment</p>
                  <p className="text-sm text-gray-500">
                    UPI, PhonePe, Paytm, Cards, Net Banking
                  </p>
                </div>

                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === "cod" ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <p className="font-medium">📦 Cash on Delivery</p>
                </div>

                <div
                  onClick={() => setPaymentMethod("qr")}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === "qr" ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <p className="font-medium">📱 UPI QR</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal (
                    {getCurrentItems().reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    )}{" "}
                    items)
                  </span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>

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
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                {calculateSubtotal() < 50 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                    <p className="text-green-800">
                      Add {formatPrice(50 - calculateSubtotal())} more for free
                      shipping!
                    </p>
                  </div>
                )}

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || getCurrentItems().length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Place Order
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </span>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="text-center text-sm text-gray-500">
                  <p>🔒 Secure checkout powered by Razorpay</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Load Razorpay Script */}
      {/* <script src="https://checkout.razorpay.com/v1/checkout.js" async /> */}
    </motion.div>
  );
}

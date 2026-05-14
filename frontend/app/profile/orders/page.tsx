"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Search,
  FileText,
} from "lucide-react";

interface Order {
  _id: string;
  orderNumber: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  items: Array<{
    _id: string;
    product: string;
    productSnapshot: {
      name: string;
      images: string[];
    };
    pricing: {
      total: number;
    };
    quantity: number;
    price: number;
    total: number;
  }>;
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
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
  paymentDetails?: {
    transactionId: string;
    paymentIntentId: string;
    gateway: string;
    amount: number;
    currency: string;
    paidAt: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { orders, loadingOrders, ordersError, refreshOrders } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // No need for useEffect to fetch orders - DataContext handles it automatically

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-indigo-100 text-indigo-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const generateInvoice = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await axios.get(
        `http://localhost:5000/api/orders/${orderId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.items.some((item) =>
  item.productSnapshot?.name
    ?.toLowerCase()
    .includes(searchTerm.toLowerCase())
)
    return matchesStatus && matchesSearch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  // Authentication guard
  if (authLoading || loadingOrders) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your orders
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

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
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your orders</p>
            </div>
            <Button
              variant="outline"
              onClick={refreshOrders}
              disabled={loadingOrders}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingOrders ? "animate-spin" : ""}`}
              />
              Refresh Orders
            </Button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-sm p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[
                "all",
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {loadingOrders ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ordersError ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{ordersError}</p>
            <Button onClick={refreshOrders}>Try Again</Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedStatus !== "all"
                ? "No matching orders found"
                : "No orders yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your filters or search terms"
                : "Start shopping to see your orders here"}
            </p>
            <div className="flex gap-4 justify-center">
              {(searchTerm || selectedStatus !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">
                            {order.status}
                          </span>
                        </span>
                      </Badge>
                      <Badge
                        variant={
                          order.paymentStatus === "paid"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>


                  
                  {/* Order Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      
                      <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center space-x-3"
                          >
                            
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={
                                  Array.isArray(
                                    item?.productSnapshot?.images,
                                  ) && item.productSnapshot.images.length > 0
                                    ? item.productSnapshot.images[0]
                                    : "/placeholder-image.jpg"
                                }
                                alt={item?.productSnapshot?.name || "Product"}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {item?.productSnapshot?.name || "Product"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                 Total: {formatPrice(order.pricing?.total || 0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Shipping Address
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-900">
                       {order.shipping?.address?.firstName} {order.shipping?.address?.lastName}
                        </p>
                        <p>{order.shipping?.address?.address   || "N/A"}</p>
                        <p>
                          {order.shipping?.address?.city || "N/A"},{" "}
                          {order.shipping?.address?.state || "N/A"}{" "}
                          {order.shipping?.address?.zipCode || "N/A"}
                        </p>
                      </div>

                      {order.trackingNumber && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Tracking
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {order.trackingNumber}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`,
                                  "_blank",
                                )
                              }
                            >
                              Track
                            </Button>
                          </div>
                        </div>
                      )}

                      {order.estimatedDelivery && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Estimated Delivery
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              order.estimatedDelivery,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="mb-4" />

                  {/* Order Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <p className="text-sm text-gray-600">
                        Payment Method:{" "}
                        <span className="font-medium text-gray-900">
                          {order.paymentMethod}
                        </span>
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        Total: {formatPrice(order.pricing?.total || 0)}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/order-success/${order._id}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateInvoice(order._id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                      {order.status === "delivered" && (
                        <Button size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Buy Again
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

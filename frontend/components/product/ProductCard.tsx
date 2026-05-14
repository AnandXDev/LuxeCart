"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useData";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-hot-toast";
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  Eye,
  Package,
} from "lucide-react";
import type { Product } from "@/hooks/useData";

interface ProductCardProps {
  product: Product;
  showWishlist?: boolean;
  showQuickView?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  showWishlist = true,
  showQuickView = true,
  className = "",
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const router = useRouter();

  const {
    _id,
    name,
    slug,
    images,
    pricing,
    category,
    rating,
    inventory,
    shipping,
  } = product;

  const isInStock = (inventory?.quantity || 0) > 0;
  const isLowStock =
    inventory &&
    (inventory.quantity || 0) <= (inventory.lowStockThreshold || 0);
  const hasDiscount =
    pricing?.comparePrice && pricing.comparePrice > (pricing?.basePrice || 0);
  const discountPercentage =
    hasDiscount && pricing?.comparePrice
      ? Math.round(
          ((pricing.comparePrice - (pricing?.basePrice || 0)) /
            pricing.comparePrice) *
            100,
        )
      : 0;
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isInStock) return;

    setIsAddingToCart(true);
    try {
      await addItem({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        images: product.images,
        price: pricing?.basePrice || 0,
        comparePrice: pricing?.comparePrice ? pricing.comparePrice : undefined,
        quantity: 1,
      });
      // Success message is handled by the cart hook or component
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Failed to add to cart:", err);

      if (
        err.message?.includes("login") ||
        err.message?.includes("authenticated")
      ) {
        router.push("/login");
        return;
      }

      toast.error(err.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isInStock) return;

    setIsAddingToCart(true);
    try {
      // Add to cart first
      await addItem({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        images: product.images,
        price: pricing?.basePrice || 0,
        comparePrice: pricing?.comparePrice ? pricing.comparePrice : undefined,
        quantity: 1,
      });

      // Redirect to checkout
      router.push("/checkout");
    } catch (error) {
      console.error("Failed to process buy now:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWishlisted(!isWishlisted);
    // Wishlist logic here
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick view logic here
  };

  const handleCardClick = () => {
    router.push(`/products/${slug}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  return (
    <div
      className={`group relative flex flex-col 
  h-[250px] sm:h-[360px] lg:h-[420px] w-full  max-width: 1600px
  sm:py-0 sm:px-0 py-2 px-2
  overflow-hidden rounded-lg bg-white 
  shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative h-32 sm:h-48 lg:h-64 max-h-72 w-full  overflow-hidden bg-gray-50">
        {(images?.length || 0) > 0 && (
          <div className="relative h-32 sm:h-48 lg:h-64 w-full overflow-hidden ">
            {/* Main Image */}
            <Image
              src={images[currentImageIndex]?.url || "/placeholder-image.jpg"}
              alt={images[currentImageIndex]?.alt || name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Hover Image */}
            {(images?.length || 0) > 1 && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {images?.slice(1, 2).map((image: any, index: number) => (
                  <Image
                    key={index}
                    src={image.url}
                    alt={image.alt || name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.featured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs bg-red-700">
              -{discountPercentage}%
            </Badge>
          )}
          {!isInStock && (
            <Badge variant="outline" className="text-xs bg-white">
              Out of Stock
            </Badge>
          )}
          {isLowStock && isInStock && (
            <Badge variant="warning" className="text-xs">
              Low Stock
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {showQuickView && (
            <button
              onClick={handleQuickView}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {showWishlist && (
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-full shadow-md transition-colors ${
                isWishlisted
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white hover:bg-gray-100"
              }`}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
              />
            </button>
          )}
        </div>

        {/* Image Indicators */}
        {(images?.length || 0) > 1 && (
          <div className="absolute bottom-2 left-2 flex space-x-1">
            {images?.map((_: any, index: number) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="pt-1 px-4 flex flex-col flex-grow">
        {/* Category */}
        {/* <div className="mb-2">
          {category ? (
            <Link 
              href={`/categories/${category.slug || ''}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {category.name}
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">
              Uncategorized
            </span>
          )}
        </div> */}

        {/* Product Name */}
        <div className="flex flex-col flex-1 p-4">
          {/* NAME (FIXED HEIGHT) */}
          <Link href={`/products/${slug}`}>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 min-h-[44px] hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>

          {/* RATING (FIXED HEIGHT) */}
          <div className="flex items-center space-x-1 h-[20px] mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating?.average || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({rating?.count || 0})
            </span>
          </div>

          {/* PRICE (FIXED HEIGHT) */}
          <div className="flex items-center space-x-2 h-[28px] mt-2">
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(pricing?.basePrice || 0)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(pricing?.comparePrice || 0)}
              </span>
            )}
          </div>

          {/* PUSH SHIPPING TO BOTTOM */}
          <div className="mt-auto">
            <div className="flex items-center space-x-2 text-xs mt-2">
              {shipping?.freeShipping && (
                <div className="flex items-center text-green-600">
                  <Truck className="h-3 w-3 mr-1" />
                  Free
                </div>
              )}

              <div className="flex items-center text-gray-500">
                <Package className="h-3 w-3 mr-1" />
                {shipping?.estimatedDelivery || "Standard"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {/* <div className="flex space-x-2">
          <Button
            onClick={handleAddToCart}
            disabled={!isInStock || isAddingToCart}
            className="flex-1"
            size="sm"
            variant="outline"
          >
            {isAddingToCart ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                Adding...
              </span>
            ) : !isInStock ? (
              'Out of Stock'
            ) : (
              <span className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </span>
            )}
          </Button>
          
          <Button
            onClick={handleBuyNow}
            disabled={!isInStock || isAddingToCart}
            className="flex-1"
            size="sm"
          >
            Buy Now
          </Button>
        </div> */}
      </div>
    </div>
  );
}

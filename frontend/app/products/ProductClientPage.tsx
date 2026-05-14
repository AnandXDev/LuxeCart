"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useMemo } from "react";
import { Loading } from "@/components/ui/Loading";
import { useProducts, useCategories } from "@/hooks/useData";
import { Filter, X, Grid, List } from "lucide-react";
import { motion } from "framer-motion";
type CategoryType = {
  _id?: string;
  name?: string;
  slug?: string;
};

type Product = {
  _id: string;
  name: string;
  category?: CategoryType | string;
  categorySlug?: string; // ✅ ADD THIS
  pricing?: {
    basePrice: number;
  };
  rating?: {
    average: number;
  };
  brand?: {
    name: string;
  };
  images?: {
    url: string;
    alt: string;
  }[];
};

type FilterType = {
  category: string;
  priceRange: [number, number]; // 👈 FIX HERE
  rating: number;
  sortBy: string;
  brand: string;
};

type Category = {
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
};


export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";
  const initialCategory = searchParams.get("category");
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([
    0, 1000,
  ]);

  const [filters, setFilters] = useState<FilterType>({
    category: initialCategory || "",
    priceRange: [0, 1000],
    rating: 0,
    sortBy: "featured",
    brand: "",
  });

  const categoryParam = searchParams.get("category");

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: categoryParam || "",
    }));
  }, [categoryParam]);

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { products, loadingProducts, productsError, refreshProducts } =
    useProducts();
  const { categories } = useCategories();

  const loading = loadingProducts;
  const error = productsError;

  // Mock brands for filters (since we don't have brands in our data context yet)
  const brands = [
    { name: "Nike", count: 15 },
    { name: "Apple", count: 12 },
    { name: "Samsung", count: 10 },
    { name: "Sony", count: 8 },
  ];

  const clearFilters = () => {
    setFilters({
      category: "",
      priceRange: [0, 1000],
      rating: 0,
      sortBy: "featured",
      brand: "",
    });
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters =
    filters.category ||
    filters.rating > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000 ||
    filters.brand;

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
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Price: Low to High", value: "price-low-high" },
    { label: "Price: High to Low", value: "price-high-low" },
    { label: "Highest Rated", value: "rating" },
    { label: "Newest First", value: "newest" },
    { label: "Name: A-Z", value: "name" },
  ];

  const applyPrice = () => {
    setFilters((prev) => ({
      ...prev,
      priceRange: tempPriceRange,
    }));
  };

  const searchWords = useMemo(() => searchQuery.split(" "), [searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productCategory = product.categorySlug?.toLowerCase().trim() || "";

      const selectedCategory = filters.category?.toLowerCase().trim() || "";

      if (selectedCategory && productCategory !== selectedCategory) {
        return false;
      }

      const price = product.pricing?.basePrice || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [products, filters, searchQuery, searchWords]);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
            <p className="text-gray-600">Discover our amazing products</p>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50"
    >
      <div className="px-9 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          <p className="text-gray-600 mb-6">
            Discover our curated collection of premium products
          </p>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Active
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters{" "}
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Active
                    </Badge>
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">
                {filteredProducts.length} products found
              </span>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0 sticky top-20 h-fit">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              categories={categories}
              brands={brands}
            />
          </div>

          {/* Mobile Filter Modal */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setShowFilters(false)}
              />
              <div className="fixed left-0 top-0 h-full w-80 bg-white z-10">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  categories={categories}
                  brands={brands}
                  isOpen={showFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Filter className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <motion.div
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-4"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    variants={itemVariants}
                    className={
                      viewMode === "list"
                        ? "bg-white rounded-lg shadow-sm p-4"
                        : ""
                    }
                  >
                    <ProductCard
                      product={product}
                      className={viewMode === "list" ? "flex-row" : ""}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

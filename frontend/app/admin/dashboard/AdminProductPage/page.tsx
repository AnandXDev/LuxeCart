"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Save,
  Trash2,
  Plus,
  Package,
  DollarSign,
  Image as ImageIcon,
  Box,
  Tag,
  Truck,
  RefreshCw,
  FolderTree,
  Factory,
  Loader2,
} from "lucide-react";

// 👇 FILE ke top pe (component ke bahar)


export default function AdminProductsPage() {
  const [searchId, setSearchId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // ⏳ Loading States
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
const toNumber = (val) => val === "" ? undefined : Number(val);
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, supRes] = await Promise.all([
          fetch("http://localhost:5000/api/products/categories"),
          fetch("http://localhost:5000/api/products/suppliers"),
        ]);

        const catData = await catRes.json();
        const supData = await supRes.json();

        // 🚨 DEBUG: Browser console mein check karein yeh kya print kar raha hai
        console.log("CATEGORY API RESPONSE:", catData);
        console.log("SUPPLIER API RESPONSE:", supData);

        // ✅ Robust Fallback: Jo bhi format aaye, usko handle kar lega
        const finalCategories =
          catData?.data?.categories ||
          catData?.data ||
          catData?.categories ||
          catData ||
          [];
        const finalSuppliers =
          supData?.data?.suppliers ||
          supData?.data ||
          supData?.suppliers ||
          supData ||
          [];

        setCategories(Array.isArray(finalCategories) ? finalCategories : []);
        setSuppliers(Array.isArray(finalSuppliers) ? finalSuppliers : []);
      } catch (err) {
        console.error("Failed to load dropdowns API:", err);
      }
    };
    fetchDropdownData();
  }, []);

  const defaultForm = {
    name: "",
    slug: "",
    description: "",
    sku: "",
    brand: "",
    category: "",
    supplier: "",
    pricing: { basePrice: "", comparePrice: "", cost: "" },
    inventory: { quantity: "" },
    shipping: { weight: "" },
    images: [{ url: "", alt: "", isMain: true }],
    variants: [{ name: "", sku: "", price: "", inventory: { quantity: "" } }],
    featured: false,
    status: "draft",
  };

  const [formData, setFormData] = useState(defaultForm);

  // 🔄 HANDLE INPUT
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value,
          },
        };
      }

      return { ...prev, [name]: value };
    });
  };

  // 🔍 SEARCH
 const searchProduct = async () => {
  if (!searchId) return alert("Enter Product ID");

  const token = localStorage.getItem("token"); // ✅ ADD THIS

  if (!token) {
    alert("Please login first");
    return;
  }

  setIsSearching(true);

  try {
    const res = await fetch(
      `http://localhost:5000/api/products/admin/${searchId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ ADD THIS
        },
      }
    );

    const data = await res.json();

    if (!res.ok)
      throw new Error(data.message || data.error || "Product not found");

    const fetchedProduct = data?.data?.product || data?.data || data;

    setFormData({
  ...defaultForm,

  name: fetchedProduct.name || "",
  slug: fetchedProduct.slug || "",
  description: fetchedProduct.description || "",
  sku: fetchedProduct.sku || "",
  brand: fetchedProduct.brand || "",

  category: fetchedProduct.category?._id || "",
  supplier: fetchedProduct.supplier?._id || "",

  pricing: {
    basePrice: fetchedProduct.pricing?.basePrice || "",
    comparePrice: fetchedProduct.pricing?.comparePrice || "",
    cost: fetchedProduct.pricing?.cost || "",
  },

  inventory: {
    quantity: fetchedProduct.inventory?.quantity || "",
  },

  shipping: {
    weight: fetchedProduct.shipping?.weight || "",
  },

  images:
    fetchedProduct.images?.length > 0
      ? fetchedProduct.images
      : defaultForm.images,

  variants:
    fetchedProduct.variants?.length > 0
      ? fetchedProduct.variants
      : defaultForm.variants,

  featured: fetchedProduct.featured || false,
  status: fetchedProduct.status || "draft",
});
  } catch (error: any) {
    alert(error.message);
    setFormData({ ...defaultForm });
  } finally {
    setIsSearching(false);
  }
};
  // 🛠️ Helper to format data before sending
  const formatDataForBackend = () => ({
    ...formData,
    description: formData.description || "Default description", // FIX

    pricing: {
      basePrice: toNumber(formData.pricing.basePrice),
      comparePrice: toNumber(formData.pricing.comparePrice) || 0,
      cost: toNumber(formData.pricing.cost) || 1, // FIX (must exist)
    },

    inventory: {
      quantity: toNumber(formData.inventory.quantity) || 0,
    },

    images: [
      {
        url: formData.images[0].url,
        alt: formData.name || "product image",
        isMain: true,
      },
    ],

    variants: formData.variants.map((v) => ({
      name: v.name || "Default Variant",
      sku: v.sku || `SKU-${Date.now()}`,
      price: toNumber(v.price) || toNumber(formData.pricing.basePrice),

      cost: toNumber(formData.pricing.cost) || 1, // ✅ ADD THIS

      inventory: {
        quantity: toNumber(v.inventory?.quantity || 10),
      },

      attributes: [
        // ✅ ADD THIS
        {
          name: "default",
          value: "default",
        },
      ],
    })),
  });

  // ➕ ADD
  const addProduct = async () => {
    setIsSaving(true);
    const payload = formatDataForBackend();
    console.log("🚀 SENDING DATA:", payload);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("❌ BACKEND RESPONSE:", data);
        throw new Error(data.message || "Failed to add product");
      }

      alert("Product Added Successfully ✅");
     setFormData({ ...defaultForm }); // Clear form after success
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ✏️ UPDATE
  const updateProduct = async () => {
    if (!searchId)
      return alert("Please search for a product first before updating!");
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
        const payload = formatDataForBackend();
      const res = await fetch(
        `http://localhost:5000/api/products/admin/${searchId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update product");

      alert("Product Updated Successfully ✅");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // ❌ DELETE
  const deleteProduct = async () => {
    if (!searchId) return alert("Please search for a product first!");
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/products/admin/${searchId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }

      alert("Product Deleted (Soft Delete) ❌");
      setFormData(defaultForm);
      setSearchId("");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ➕ ADD VARIANT
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: "", sku: "", price: "", inventory: { quantity: "" } },
      ],
    }));
  };

  // Reusable Input
  const InputField = ({ label, ...props }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
        {...props}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* 🌟 HEADER & ACTIONS */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-8 w-8 text-cyan-600" />
              Product Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Add, update, or delete your store products.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={deleteProduct}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}{" "}
              Delete
            </button>
            <button
              onClick={updateProduct}
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-xl bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}{" "}
              Update
            </button>
            <button
              onClick={addProduct}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-cyan-500/20 hover:bg-cyan-700 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}{" "}
              Save New
            </button>
          </div>
        </div>

        {/* 🔍 SEARCH BAR */}
        <div className="mb-8 flex items-center gap-3 rounded-2xl bg-white p-2 pl-4 shadow-sm border border-gray-100">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            placeholder="Enter Product ID to Edit or Delete..."
            className="flex-1 bg-transparent py-2 text-sm outline-none"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button
            onClick={searchProduct}
            disabled={isSearching}
            className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Search
          </button>
        </div>

        {/* --- FORM FIELDS --- (No changes needed in UI structure, just connecting state) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ⚡ LEFT COLUMN */}
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800 border-b pb-3">
                <Tag className="h-5 w-5 text-gray-400" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <InputField
                    label="Product Name"
                    name="name"
                    placeholder="e.g. iPhone 15 Pro Max"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <InputField
                  label="URL Slug"
                  name="slug"
                  placeholder="iphone-15-pro"
                  value={formData.slug}
                  onChange={handleChange}
                />
                <InputField
                  label="SKU"
                  name="sku"
                  placeholder="IPH-15-PRO"
                  value={formData.sku}
                  onChange={handleChange}
                />
                <InputField
                  label="Brand"
                  name="brand"
                  placeholder="Apple"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800 border-b pb-3">
                <ImageIcon className="h-5 w-5 text-gray-400" /> Media
              </h2>
              <InputField
                label="Main Image URL"
                placeholder="https://example.com/image.jpg"
                value={formData.images[0]?.url || ""}
                onChange={(e: any) => {
                  const updated = [...formData.images];
                  if (!updated[0])
                    updated[0] = { url: "", alt: "", isMain: true };
                  updated[0].url = e.target.value;
                  setFormData({ ...formData, images: updated });
                }}
              />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b pb-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <Box className="h-5 w-5 text-gray-400" /> Variants
                </h2>
                <button
                  onClick={addVariant}
                  className="flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  <Plus className="h-4 w-4" /> Add Variant
                </button>
              </div>
              <div className="space-y-4">
                {formData.variants.map((v, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                  >
                    <InputField
                      label={`Variant ${i + 1} Name`}
                      placeholder="e.g. Red / 128GB"
                      value={v.name}
                      onChange={(e: any) => {
                        const updated = [...formData.variants];
                        updated[i].name = e.target.value;
                        setFormData({ ...formData, variants: updated });
                      }}
                    />
                    <InputField
                      label="Additional Price"
                      placeholder="0.00"
                      value={v.price}
                      onChange={(e: any) => {
                        const updated = [...formData.variants];
                        updated[i].price = e.target.value;
                        setFormData({ ...formData, variants: updated });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ⚡ RIGHT COLUMN */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800 border-b pb-3">
                <FolderTree className="h-5 w-5 text-gray-400" /> Organization
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none"
                    onChange={handleChange}
                    value={formData.category}
                  >
                    <option value="">Select Category</option>
                    {Array.isArray(categories) &&
                      categories.map((cat: any) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Factory className="w-4 h-4 text-gray-400" /> Supplier
                  </label>
                  <select
                    name="supplier"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-cyan-500 focus:outline-none"
                    onChange={handleChange}
                    value={formData.supplier}
                  >
                    <option value="">Select Supplier</option>
                    {Array.isArray(suppliers) &&
                      suppliers.map((sup: any) => (
                        <option key={sup._id} value={sup._id}>
                          {sup.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800 border-b pb-3">
                <DollarSign className="h-5 w-5 text-gray-400" /> Pricing
              </h2>
              <div className="space-y-5">
                <InputField
                  label="Cost Price ($)"
                  name="pricing.cost"
                  placeholder="0.00"
                  value={formData.pricing.cost}
                  onChange={handleChange}
                />
                <InputField
                  label="Base Price ($)"
                  name="pricing.basePrice"
                  placeholder="0.00"
                  value={formData.pricing.basePrice}
                  onChange={handleChange}
                />
                <InputField
                  label="Compare at Price ($)"
                  name="pricing.comparePrice"
                  placeholder="0.00"
                  value={formData.pricing.comparePrice}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800 border-b pb-3">
                <Truck className="h-5 w-5 text-gray-400" /> Inventory & Shipping
              </h2>
              <div className="space-y-5">
                <InputField
                  label="Stock Quantity"
                  name="inventory.quantity"
                  placeholder="100"
                  value={formData.inventory.quantity}
                  onChange={handleChange}
                />
                <InputField
                  label="Weight (kg)"
                  name="shipping.weight"
                  placeholder="0.5"
                  value={formData.shipping.weight}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

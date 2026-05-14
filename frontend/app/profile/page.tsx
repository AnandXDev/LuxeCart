"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import Plasma from "@/components/Plasma";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Package,
  Heart,
  ShoppingCart,
  Settings,
  Camera,
  Shield,
  CreditCard,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    image: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        image: user.image || "",
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        email: user.email || "",
        phone: user.phone || "",
        address: user.addresses[0]?.street || "",
        city: user.addresses[0]?.city || "",
        state: user.addresses[0]?.state || "",
        zipCode: user.addresses[0]?.zipCode || "",
        country: user.addresses[0]?.country || "",
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your profile
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const [firstName, ...rest] = formData.name.split(" ");
      const lastName = rest.join(" ");

      const formattedData = {
        image: formData.image,
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        phone: formData.phone,
        addresses: [
          {
            type: "home",
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
            isDefault: true,
          },
        ],
      };

      await updateProfile(formattedData);

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        image: user.image || "",
        name: user.firstName + " " + user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.addresses[0]?.street || "",
        city: user.addresses[0]?.city || "",
        state: user.addresses[0]?.state || "",
        zipCode: user.addresses[0]?.zipCode || "",
        country: user.addresses[0]?.country || "",
      });
    }
    setIsEditing(false);
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

  const quickLinks = [
    {
      title: "My Orders",
      description: "View your order history and track packages",
      icon: Package,
      href: "/profile/orders",
      color: "text-blue-600",
    },
    {
      title: "Wishlist",
      description: "Manage your saved products",
      icon: Heart,
      href: "/profile/wishlist",
      color: "text-red-600",
    },
    {
      title: "Saved Carts",
      description: "View and restore your saved carts",
      icon: ShoppingCart,
      href: "/profile/saved-carts",
      color: "text-green-600",
    },
    {
      title: "Settings",
      description: "Manage your account settings",
      icon: Settings,
      href: "/profile/settings",
      color: "text-gray-600",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-max relative overflow-hidden bg-black"
      style={{ width: "100%", height: "600px", position: "relative" }}
    >
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <Plasma
          color="#ff6b35"
          speed={0.4}
          direction="forward"
          scale={1.2}
          opacity={0.6}
          mouseInteractive={true}
        />
      </div>

      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Avatar Section */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user?.image ? (
                          <Image
                           src={formData.image || user.image} 
                            alt="Avatar"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {user?.firstName?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </span>
                    </div>

                    <input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataData = new FormData();
    formDataData.append("image", file);

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formDataData,
    });

    const data = await res.json();

    console.log("Uploaded URL:", data.imageUrl); // debug

    setFormData((prev) => ({
      ...prev,
      image: data.imageUrl,
    }));

    toast.success("Image uploaded");
  }}
/>

                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user?.firstName || "User"}
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="flex items-center mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Member since{" "}
                        {new Date(user?.createdAt || "").toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <Input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="United States"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <Input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <Input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="flex items-center p-4 border rounded-lg hover:shadow-md transition-all hover:scale-[1.02]"
                  >
                    <div className={`p-3 rounded-lg bg-gray-50 ${link.color}`}>
                      <link.icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Account Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Total Orders</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-600 mr-3" />
                    <span className="text-gray-700">Wishlist Items</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Saved Carts</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Security</h2>
              <div className="space-y-4">
                <Link
                  href="/profile/settings"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Shield className="h-5 w-5 text-gray-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Password & Security
                    </p>
                    <p className="text-sm text-gray-600">
                      Update your password
                    </p>
                  </div>
                </Link>
                <Link
                  href="/profile/payment-methods"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Payment Methods</p>
                    <p className="text-sm text-gray-600">Manage saved cards</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

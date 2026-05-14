"use client";
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";


// Types
interface User {
  _id: string;
  image: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
  preferences: {
    newsletter: boolean;
    marketing: boolean;
    theme: "light" | "dark" | "system";
  };
  addresses: Array<{
    type: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  createdAt: string;
  lastLogin: string;
}
type RegisterResponse = {
  status: string;
  message: string;
};
type UpdatePasswordType = {
  currentPassword: string;
  newPassword: string;
};
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  registrationSuccess: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  googleLogin: (data: GoogleLoginPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updatePassword: (passwordData: UpdatePasswordType) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
  clearRegistrationSuccess: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  preferences?: {
    newsletter: boolean;
    marketing: boolean;
    theme: "light" | "dark" | "system";
  };
  status?: string;
  message?: string;
}

interface GoogleUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  token: string;
}
interface GoogleLoginPayload {
  token: string;
}


// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token"); // Changed from Cookies.get('jwt')
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Validate token with server
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000, // 5 second timeout
      });

      console.log("=== AUTH DEBUG ===");
      console.log("Token found:", !!token);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("User data:", response.data.data?.user);
      console.log("User role:", response.data.data?.user?.role);
      console.log("================");

      if (response.data.status === "success" && response.data.data.user) {
        setUser(response.data.data.user);
        console.log("User set successfully");
      } else {
        // Invalid response format
        localStorage.removeItem("token"); // Changed from Cookies.remove('jwt')
        setUser(null);
        console.log("Invalid response format");
      }
    } catch (error: any) {
      console.error(
        "Auth check failed:",
        error.response?.status,
        error.message,
      );

      // Token is invalid or expired
      localStorage.removeItem("token"); // Changed from Cookies.remove('jwt')
      setUser(null);

      // Don't show error to user for 401 (unauthorized) as it's expected
      if (error.response?.status !== 401) {
        setError("Failed to verify authentication");
      }
    } finally {
      setLoading(false);
    }
  };

  const setAuthData = (userData: User, token: string) => {
    setUser(userData);
    Cookies.set("jwt", token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
        bahvior: "cookie", // ✅ This is not a real axios option, just for clarity
        
      },
    {
        withCredentials: true, // ✅ IMPORTANT
      });

      if (response.data.status === "success") {
        setAuthData(response.data.data.user, response.data.token);
        // after login success
        localStorage.setItem("token", response.data.token);
        router.push("/");
      }
} catch (error: any) {
  console.error("LOGIN ERROR:", error);
  const errorMessage =
    error?.response?.data?.message || error?.message || "Login failed";
  setError(errorMessage);
  throw new Error(errorMessage);
}
    
    finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        userData,
      );

      if (response.data.status === "success") {
        console.log("REGISTER SUCCESS:", response.data);

        // Set registration success state
        setRegistrationSuccess(true);

        
       router.push(`/verify-email?email=${userData.email}`);
      }
       return response.data; // ✅ THIS LINE IS MISSING
    } catch (error: any) {
      
      console.log("FULL ERROR:", error);
console.log("ERROR DATA:", error?.response?.data);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.msg ||
        "Registration failed";

      setError(errorMessage);
       throw new Error(errorMessage); // ✅ NEVER return null
    } finally {
      setLoading(false);
    }
  };
  const googleLogin = async (data: GoogleLoginPayload) => {
  try {
    setLoading(true);
    setError(null);

    // ✅ Send token directly (clean contract)
    const response = await axios.post(
      `${API_URL}/api/auth/google`,
      data,
      {
        withCredentials: true, // 🔥 important for cookies
      }
    );

    // ✅ Safe response handling
    if (response.data?.status === "success") {
      const user = response.data.data.user;
      const token = response.data.data.token;

      setAuthData(user, token);

      router.push("/");
    } else {
      throw new Error(response.data?.message || "Google login failed");
    }
  } catch (error: any) {
    console.error("🔥 Google Login Error:", error);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Google login failed";

    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

 const logout = async () => {
  await axios.post('/api/auth/logout', {
    withCredentials: true  , // 👈 important
  
  });

  localStorage.removeItem('token');
  setUser(null);
  router.push('/login');
};

  const updateProfile = async (userData: Partial<User>) => {
    try {
      
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const response = await axios.patch(
        `${API_URL}/api/auth/update-me`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.status === "success") {
        setUser(response.data.data.user);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Profile update failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async ({ currentPassword, newPassword }: UpdatePasswordType) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const response = await axios.patch(
        `${API_URL}/api/auth/update-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.status === "success") {
        // Update token with new one
        setAuthData(response.data.data.user, response.data.token);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Password update failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });

      if (response.data.status === "success") {
        // Show success message
        return response.data.message;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Password reset request failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          password,
        },
      );

      if (response.data.status === "success") {
        setAuthData(response.data.data.user, response.data.token);
        router.push("/");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Password reset failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_URL}/api/auth/verify-email/${token}`,
      );

      if (response.data.status === "success") {
        setAuthData(response.data.data.user, response.data.token);
        router.push("/");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Email verification failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearRegistrationSuccess = () => {
    setRegistrationSuccess(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    registrationSuccess,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    clearError,
    clearRegistrationSuccess,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook to protect routes
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  return { isAuthenticated, loading };
}

// Hook to require admin role
export function useRequireAdmin() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  return { isAuthenticated, isAdmin, loading };
}

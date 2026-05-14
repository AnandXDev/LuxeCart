import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "@/hooks/useCart";
import { DataProvider } from "@/hooks/useData";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster, ToasterProvider } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";
import { CountryProvider } from "./context/countryContext";
import TargetCursor from "@/components/TargetCursor";
import SplashCursor from "@/components/SplashCursor";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LuxeCart - Premium Shopping Experience",
    template: "%s | LuxeCart",
  },
  description:
    "Discover premium products with fast shipping and secure checkout. Shop the latest trends in fashion, electronics, home goods, and more.",
  keywords:
    "ecommerce, online shopping, premium products, fashion, electronics, home goods, secure checkout",
  authors: [{ name: "LuxeCart Team" }],
  creator: "LuxeCart",
  publisher: "LuxeCart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    title: "LuxeCart - Premium Shopping Experience",
    description:
      "Discover premium products with fast shipping and secure checkout.",
    siteName: "LuxeCart",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuxeCart - Premium Shopping Experience",
    description:
      "Discover premium products with fast shipping and secure checkout.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", GeistSans.variable)}
    >
      <body className={inter.className}>
        {/* <TargetCursor hideDefaultCursor={false}  /> */}

        <SplashCursor
          DENSITY_DISSIPATION={3.5}
          VELOCITY_DISSIPATION={2}
          PRESSURE={0.1}
          CURL={3}
          SPLAT_RADIUS={0.2}
          SPLAT_FORCE={6000}
          COLOR_UPDATE_SPEED={10}
          SHADING
          RAINBOW_MODE={false}
          COLOR="#A855F7"
        />
        <ThemeProvider>
          <AuthProvider>
            <GoogleOAuthProvider
              clientId={
                process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
                "639143056121-0t0dm3ncekhr21k74s1oes9h48cnq5ge.apps.googleusercontent.com"
              }
            >
              <DataProvider>
                <CartProvider>
                  <CountryProvider>
                    <ToasterProvider>
                      <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                      </div>
                      <Toaster />
                      <HotToaster
                        position="top-right"
                        toastOptions={{
                          success: {
                            duration: 3000,
                            style: {
                              background: "#22c55e", // green
                              color: "#fff",
                            },
                            iconTheme: {
                              primary: "#fff",
                              secondary: "#22c55e",
                            },
                          },
                          error: {
                            duration: 5000,
                            style: {
                              background: "#ef4444", // red
                              color: "#fff",
                            },
                            iconTheme: {
                              primary: "#fff",
                              secondary: "#ef4444",
                            },
                          },
                        }}
                      />
                    </ToasterProvider>
                  </CountryProvider>
                </CartProvider>
              </DataProvider>
            </GoogleOAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

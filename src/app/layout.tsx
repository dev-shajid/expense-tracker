import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import InstallPrompt from "@/components/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Daily Expense Tracker Software",
  description: "This project is a simple expense tracker application built with Next.js, TypeScript, and Firebase. It allows users to track their daily expenses, manage budgets.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Expense Tracker",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressContentEditableWarning
      suppressHydrationWarning
      lang="en"
    >
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body
        suppressContentEditableWarning
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <ThemeProvider>
          <Toaster />
          <QueryProvider>
            <AuthProvider>
              <OrganizationProvider>
                {children}
              </OrganizationProvider>
            </AuthProvider>
          </QueryProvider>
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}

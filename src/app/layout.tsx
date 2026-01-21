import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Daily Expense Tracker Software",
  description: "This project is a simple expense tracker application built with Next.js, TypeScript, and Firebase. It allows users to track their daily expenses, manage budgets.",
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
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

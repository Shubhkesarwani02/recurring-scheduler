import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { ErrorBoundary, GlobalErrorHandler } from "@/components/error-handler";

// Error boundary component for Analytics
function SafeAnalytics() {
  try {
    return <Analytics />;
  } catch (error) {
    console.warn('Analytics failed to load:', error);
    return null;
  }
}

export const metadata: Metadata = {
  title: "Recurring Scheduler",
  description: "Manage your weekly recurring schedules with smart exception handling",
  generator: "Next.js",
  keywords: ["scheduler", "recurring", "calendar", "time management", "productivity"],
  authors: [{ name: "Recurring Scheduler Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
        >
          <ErrorBoundary>
            <GlobalErrorHandler>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Header />
                
                <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                  {children}
                </main>
                
                <SafeAnalytics />
              </ThemeProvider>
            </GlobalErrorHandler>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}

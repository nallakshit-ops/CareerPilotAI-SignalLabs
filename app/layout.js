import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";
import { SmoothScrollProvider } from "@/components/smooth-scroll";

import { Logo } from "@/components/logo";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "CareerPilot | Career Intelligence Platform",
  description: "An AI-powered career mentor designed to accelerate your growth.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.svg" type="image/svg+xml" sizes="any" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased selection:bg-primary/30 selection:text-primary-foreground`} suppressHydrationWarning>
          <SmoothScrollProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Header />

              <main className="min-h-screen">
                {children}
              </main>

              <Toaster richColors />

              <footer className="mt-auto border-t border-border bg-card py-6">
                <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
                  <Logo size="sm" />
                  <p>&copy; {new Date().getFullYear()} CareerPilot. All rights reserved.</p>
                  <p>Enterprise Career Intelligence & Placement System</p>
                </div>
              </footer>
            </ThemeProvider>
          </SmoothScrollProvider>
        </body>

      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NavLink } from "@/components/nav-link";
import "./globals.css";
import Link from "next/link";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <nav className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-1">
              <Link
                href="/"
                className="font-bold text-lg flex items-center gap-2 mr-4"
              >
                <span>🐍</span> PyTutor
              </Link>
              <NavLink href="/lessons" label="Lessons" />
              <NavLink href="/games" label="Games" />
              <NavLink href="/leaderboard" label="Leaderboard" />
              <NavLink href="/dashboard" label="Dashboard" className="ml-auto" />
            </div>
          </nav>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
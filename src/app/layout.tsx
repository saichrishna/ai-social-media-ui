import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SetupError } from "@/components/setup-error";
import { getCurrentUser } from "@/lib/auth/get-current-user";

import "./globals.css";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Social Media",
  description: "Create and manage AI-generated social content",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AppProviders user={user}>
          {user ? children : <SetupError />}
        </AppProviders>
      </body>
    </html>
  );
}

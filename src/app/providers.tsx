"use client";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { UserProvider, type CurrentUser } from "@/lib/auth";
import { BrandSelectionProvider } from "@/lib/brands/brand-selection-provider";
import { AppQueryClientProvider } from "@/lib/query/query-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";

export function AppProviders({
  user,
  children,
}: {
  user: CurrentUser | null;
  children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <UserProvider user={user}>
        <AppQueryClientProvider>
          <BrandSelectionProvider>
            <Toaster />
            {children}
          </BrandSelectionProvider>
        </AppQueryClientProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

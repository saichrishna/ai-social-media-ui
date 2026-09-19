"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { CurrentUser } from "@/lib/auth/types";

const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: CurrentUser | null;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): CurrentUser | null {
  return useContext(UserContext);
}

export function useUserId(): string | null {
  return useUser()?.id ?? null;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

import { getUserBrandProfiles } from "@/lib/api/brands";
import { useUserId } from "@/lib/auth";
import {
  readBrowserStorage,
  subscribeBrowserStorage,
  writeBrowserStorage,
} from "@/lib/storage/browser-storage";
import type { BrandProfile } from "@/types/brand";

const STORAGE_KEY = "selected_brand_profile_id";

type BrandSelectionContextValue = {
  brands: BrandProfile[];
  selectedBrandProfileId: string | null;
  selectedBrand: BrandProfile | null;
  setSelectedBrandProfileId: (id: string | null) => void;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

const BrandSelectionContext =
  createContext<BrandSelectionContextValue | null>(null);

function reconcileStoredBrandId(brands: BrandProfile[]) {
  const current = readBrowserStorage(STORAGE_KEY);
  const isValid = current !== null && brands.some((brand) => brand.id === current);
  if (isValid) {
    return;
  }
  writeBrowserStorage(STORAGE_KEY, brands[0]?.id ?? null);
}

export function BrandSelectionProvider({ children }: { children: ReactNode }) {
  const userId = useUserId();
  const storedId = useSyncExternalStore(
    (onStoreChange) => subscribeBrowserStorage(STORAGE_KEY, onStoreChange),
    () => readBrowserStorage(STORAGE_KEY),
    () => null,
  );

  const query = useQuery({
    queryKey: ["brand-profiles", userId],
    queryFn: async () => {
      const response = await getUserBrandProfiles(userId!);
      reconcileStoredBrandId(response.brand_profiles ?? []);
      return response;
    },
    enabled: Boolean(userId),
  });

  const brands = useMemo(
    () => query.data?.brand_profiles ?? [],
    [query.data?.brand_profiles],
  );

  const selectedBrandProfileId = useMemo(() => {
    if (storedId && brands.some((brand) => brand.id === storedId)) {
      return storedId;
    }
    return brands[0]?.id ?? null;
  }, [brands, storedId]);

  const setSelectedBrandProfileId = useCallback((id: string | null) => {
    writeBrowserStorage(STORAGE_KEY, id);
  }, []);

  const value = useMemo<BrandSelectionContextValue>(() => {
    const selectedBrand =
      brands.find((brand) => brand.id === selectedBrandProfileId) ?? null;

    return {
      brands,
      selectedBrandProfileId,
      selectedBrand,
      setSelectedBrandProfileId,
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: () => {
        void query.refetch();
      },
    };
  }, [brands, query, selectedBrandProfileId, setSelectedBrandProfileId]);

  return (
    <BrandSelectionContext.Provider value={value}>
      {children}
    </BrandSelectionContext.Provider>
  );
}

export function useBrandSelection(): BrandSelectionContextValue {
  const context = useContext(BrandSelectionContext);
  if (!context) {
    throw new Error("useBrandSelection must be used within BrandSelectionProvider");
  }
  return context;
}

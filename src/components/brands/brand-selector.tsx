"use client";

import { useRouter } from "next/navigation";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrandSelection } from "@/lib/brands/brand-selection-provider";

export function BrandSelector() {
  const router = useRouter();
  const {
    brands,
    selectedBrand,
    selectedBrandProfileId,
    setSelectedBrandProfileId,
    isLoading,
  } = useBrandSelection();

  const label = selectedBrand?.business_name ?? "Select a brand";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="max-w-64 justify-between"
          aria-label="Select brand"
          disabled={isLoading}
        >
          <span className="truncate">{isLoading ? "Loading brands" : label}</span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" align="start">
        <DropdownMenuLabel>Your Brands</DropdownMenuLabel>
        <DropdownMenuGroup>
          {brands.length === 0 ? (
            <DropdownMenuItem disabled>No brands yet</DropdownMenuItem>
          ) : (
            brands.map((brand) => (
              <DropdownMenuItem
                key={brand.id}
                onSelect={() => setSelectedBrandProfileId(brand.id)}
              >
                {selectedBrandProfileId === brand.id ? (
                  <CheckIcon aria-hidden />
                ) : (
                  <span className="size-4" aria-hidden />
                )}
                <span className="truncate">{brand.business_name}</span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/brands/new")}>
          <PlusIcon aria-hidden />
          Add Brand
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/brands")}>
          Manage Brands
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

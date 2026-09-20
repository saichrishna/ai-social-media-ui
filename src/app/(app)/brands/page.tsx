"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { BrandStatusPill } from "@/components/ux/brand-status-pill";
import {
  deriveListBrandSetupStatus,
  type BrandSetupStatus,
} from "@/lib/brands/brand-readiness";
import { PageHeader } from "@/components/ux/page-header";
import { PageLayout } from "@/components/ux/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SURFACE_PANEL_CARD_INTERACTIVE,
} from "@/lib/ux/surface-panel-card";
import { cn } from "@/lib/utils";
import { getUserBrandProfiles } from "@/lib/api/brands";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { useUserId } from "@/lib/auth";

export default function BrandsPage() {
  const userId = useUserId();
  const query = useQuery({
    queryKey: ["brand-profiles", userId],
    queryFn: () => getUserBrandProfiles(userId!),
    enabled: Boolean(userId),
  });

  if (!userId) {
    return null;
  }

  const brands = query.data?.brand_profiles ?? [];

  return (
    <PageLayout width="studio">
      <PageHeader
        title="Brands"
        description="Promise, your words, then draft — one voice per brand."
        actions={
          <Button asChild variant="studio">
            <Link href="/brands/new">New brand</Link>
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState label="Loading brands" variant="cards" />
      ) : query.isError ? (
        <ErrorState
          message={USER_SAFE_ERROR_MESSAGE}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : brands.length === 0 ? (
        <EmptyState
          title="No brands yet"
          description="Name a brand, tell us who it is for, then add words only you would say."
          action={{ href: "/brands/new", label: "New brand" }}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {brands.map((brand) => {
            const helperLine =
              brand.target_audience?.trim().split("\n")[0] ||
              brand.industry ||
              "";
            const status: BrandSetupStatus = deriveListBrandSetupStatus(brand);
            return (
              <li key={brand.id}>
                <Link href={`/brands/${brand.id}`}>
                  <Card
                    className={cn(SURFACE_PANEL_CARD_INTERACTIVE, "h-full")}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                      <CardTitle className="font-display text-lg font-medium">
                        {brand.business_name}
                      </CardTitle>
                      <BrandStatusPill status={status} />
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {helperLine ? <p className="line-clamp-2">{helperLine}</p> : null}
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageLayout>
  );
}

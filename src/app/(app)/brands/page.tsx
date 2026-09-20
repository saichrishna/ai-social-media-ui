"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserBrandProfiles } from "@/lib/api/brands";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { listBrandSetupHint } from "@/lib/brands/brand-readiness";
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

  if (query.isLoading) {
    return <LoadingState label="Loading brands" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={USER_SAFE_ERROR_MESSAGE}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  const brands = query.data?.brand_profiles ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Brands</h1>
        <Button asChild>
          <Link href="/brands/new">New brand</Link>
        </Button>
      </div>

      {brands.length === 0 ? (
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
            const statusLabel = listBrandSetupHint(brand);
            return (
              <li key={brand.id}>
                <Link href={`/brands/${brand.id}`}>
                  <Card className="h-full hover:bg-muted/40">
                    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                      <CardTitle className="text-base">
                        {brand.business_name}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {statusLabel}
                      </Badge>
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
    </div>
  );
}

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <Link href="/brands/new">Add Brand</Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <EmptyState
          title="No brands yet"
          description="Add a brand so content uses the right voice, audience, and guidelines."
          action={{ href: "/brands/new", label: "Add Brand" }}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link href={`/brands/${brand.id}`}>
                <Card className="h-full hover:bg-muted/40">
                  <CardHeader>
                    <CardTitle>{brand.business_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>{brand.industry}</p>
                    {brand.location ? <p>{brand.location}</p> : null}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

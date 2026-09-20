"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBrandProfile } from "@/lib/api/brands";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { buildBrandProfileRequest } from "@/lib/brands/build-brand-request";
import { useUserId } from "@/lib/auth";
import { writeBrowserStorage } from "@/lib/storage/browser-storage";

export function BrandCreateForm() {
  const userId = useUserId();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("missing user");
      }
      const body = buildBrandProfileRequest(userId, undefined, {
        business_name: businessName.trim(),
        industry: industry.trim(),
      });
      return createBrandProfile(body);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["brand-profiles"] });
      writeBrowserStorage(
        "selected_brand_profile_id",
        response.brand_profile.id,
      );
      toast.success("Brand created");
      router.push(`/brands/${response.brand_profile.id}`);
    },
    onError: () => {
      toast.error(USER_SAFE_ERROR_MESSAGE);
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-lg flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Name this brand</CardTitle>
          <CardDescription>
            Then fill in your promise and your words. No long form upfront.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Business name
            <Input
              required
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Industry
            <span className="text-xs font-normal text-muted-foreground">
              Helps us place you — you can refine this later
            </span>
            <Input
              required
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
            />
          </label>
        </CardContent>
      </Card>
      <Button type="submit" disabled={createMutation.isPending || !userId}>
        {createMutation.isPending ? "Creating…" : "Create brand"}
      </Button>
    </form>
  );
}

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
import { StudioSectionIntro } from "@/components/ux/studio-section-intro";
import { SURFACE_PANEL_CARD } from "@/lib/ux/surface-panel-card";
import { cn } from "@/lib/utils";

export function BrandCreateForm() {
  const userId = useUserId();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [startMode, setStartMode] = useState<"talk" | "type">("talk");

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
      const suffix =
        startMode === "talk"
          ? "tab=words&talk=1"
          : "tab=promise";
      router.push(`/brands/${response.brand_profile.id}?${suffix}`);
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
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <StudioSectionIntro
        title="Name your brand"
        description="Then promise and your words — no long form upfront. Start with talk when you can."
      />
      <Card className={cn(SURFACE_PANEL_CARD)}>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>We refine the rest on the brand journey.</CardDescription>
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
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          variant="studio"
          disabled={createMutation.isPending || !userId}
          onClick={() => setStartMode("talk")}
        >
          {createMutation.isPending ? "Creating…" : "Start with talk"}
        </Button>
        <Button
          type="submit"
          variant="outline"
          disabled={createMutation.isPending || !userId}
          onClick={() => setStartMode("type")}
        >
          Type instead
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Both options create the brand and open your promise and words tabs.
      </p>
    </form>
  );
}

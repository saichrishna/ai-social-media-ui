"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createBrandProfile,
  deleteBrandProfile,
  updateBrandProfile,
} from "@/lib/api/brands";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { useUserId } from "@/lib/auth";
import { writeBrowserStorage } from "@/lib/storage/browser-storage";
import type { BrandProfile, BrandProfileRequest } from "@/types/brand";

function linesToList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToLines(value: string[] | undefined): string {
  return (value ?? []).join("\n");
}

export function BrandForm({
  profile,
}: {
  profile?: BrandProfile;
}) {
  const userId = useUserId();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(profile);

  const [businessName, setBusinessName] = useState(profile?.business_name ?? "");
  const [industry, setIndustry] = useState(profile?.industry ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [brandVoice, setBrandVoice] = useState(profile?.brand_voice ?? "");
  const [targetAudience, setTargetAudience] = useState(
    profile?.target_audience ?? "",
  );
  const [services, setServices] = useState(listToLines(profile?.services));
  const [hashtags, setHashtags] = useState(
    listToLines(profile?.preferred_hashtags),
  );
  const [forbidden, setForbidden] = useState(
    listToLines(profile?.forbidden_topics),
  );
  const [instructions, setInstructions] = useState(
    profile?.additional_instructions ?? "",
  );
  const [notFor, setNotFor] = useState(profile?.not_for ?? "");
  const [desiredOutcome, setDesiredOutcome] = useState(
    profile?.desired_outcome ?? "",
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("missing user");
      }
      const body: BrandProfileRequest = {
        user_id: userId,
        business_name: businessName.trim(),
        industry: industry.trim(),
        location: location.trim(),
        brand_voice: brandVoice.trim(),
        target_audience: targetAudience.trim(),
        services: linesToList(services),
        preferred_hashtags: linesToList(hashtags),
        forbidden_topics: linesToList(forbidden),
        additional_instructions: instructions.trim(),
        not_for: notFor.trim(),
        desired_outcome: desiredOutcome.trim(),
      };
      if (profile) {
        return updateBrandProfile(profile.id, body);
      }
      return createBrandProfile(body);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["brand-profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["brand-profile"] });
      writeBrowserStorage("selected_brand_profile_id", response.brand_profile.id);
      toast.success(isEdit ? "Brand saved" : "Brand created");
      router.push(`/brands/${response.brand_profile.id}`);
    },
    onError: () => {
      toast.error(USER_SAFE_ERROR_MESSAGE);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!profile) {
        throw new Error("missing profile");
      }
      return deleteBrandProfile(profile.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brand-profiles"] });
      toast.success("Brand deleted");
      router.push("/brands");
    },
    onError: () => {
      toast.error("We couldn't save your changes.");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  function onDelete() {
    if (!profile) return;
    const confirmed = window.confirm(
      `Delete ${profile.business_name}? This cannot be undone.`,
    );
    if (confirmed) {
      deleteMutation.mutate();
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Basics</CardTitle>
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
            <Input
              required
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Location
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Voice</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Brand voice
            <Textarea
              value={brandVoice}
              onChange={(event) => setBrandVoice(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Target audience
            <Textarea
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value)}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What You Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col gap-1 text-sm">
            Services
            <Textarea
              value={services}
              onChange={(event) => setServices(event.target.value)}
              placeholder="One service per line"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Preferred hashtags
            <Textarea
              value={hashtags}
              onChange={(event) => setHashtags(event.target.value)}
              placeholder="One hashtag per line"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Forbidden topics
            <Textarea
              value={forbidden}
              onChange={(event) => setForbidden(event.target.value)}
              placeholder="One topic per line"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Additional instructions
            <Textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />
          </label>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saveMutation.isPending || !userId}>
          {saveMutation.isPending ? "Saving…" : isEdit ? "Save brand" : "Create brand"}
        </Button>
        {isEdit ? (
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={onDelete}
          >
            Delete brand
          </Button>
        ) : null}
      </div>
    </form>
  );
}

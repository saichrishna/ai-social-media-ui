"use client";

import { useState, type FormEvent } from "react";
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
import { updateBrandProfile } from "@/lib/api/brands";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { buildBrandProfileRequest } from "@/lib/brands/build-brand-request";
import { useUserId } from "@/lib/auth";
import type { BrandProfile } from "@/types/brand";

function linesToList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToLines(value: string[] | undefined): string {
  return (value ?? []).join("\n");
}

export function BrandPromisePanel({
  profile,
  promiseWarnings,
}: {
  profile: BrandProfile;
  promiseWarnings: string[];
}) {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const [businessName, setBusinessName] = useState(profile.business_name);
  const [targetAudience, setTargetAudience] = useState(profile.target_audience);
  const [services, setServices] = useState(listToLines(profile.services));
  const [notFor, setNotFor] = useState(profile.not_for ?? "");
  const [forbidden, setForbidden] = useState(
    listToLines(profile.forbidden_topics),
  );
  const [desiredOutcome, setDesiredOutcome] = useState(
    profile.desired_outcome ?? "",
  );
  const [showMore, setShowMore] = useState(false);
  const [industry, setIndustry] = useState(profile.industry);
  const [location, setLocation] = useState(profile.location);
  const [brandVoice, setBrandVoice] = useState(profile.brand_voice);
  const [hashtags, setHashtags] = useState(
    listToLines(profile.preferred_hashtags),
  );
  const [instructions, setInstructions] = useState(
    profile.additional_instructions,
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("missing user");
      }
      const body = buildBrandProfileRequest(userId, profile, {
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
      });
      return updateBrandProfile(profile.id, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brand-profiles"] });
      await queryClient.invalidateQueries({
        queryKey: ["brand-profile", profile.id],
      });
      toast.success("Promise saved");
    },
    onError: () => {
      toast.error(USER_SAFE_ERROR_MESSAGE);
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  const showNotForNote =
    !notFor.trim() &&
    (promiseWarnings.includes("not_for is empty") ||
      promiseWarnings.length === 0);

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium">Who is this for?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us who you help. We use this before we write anything as you.
        </p>
      </div>

      {promiseWarnings.length > 0 ? (
        <p className="text-sm text-muted-foreground" role="status">
          A few promise fields are still empty. You can save and come back.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Promise</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Business name
            <Input
              required
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Who you help
            <span className="text-xs font-normal text-muted-foreground">
              The person who would nod if they read the post
            </span>
            <Textarea
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            What you actually do
            <span className="text-xs font-normal text-muted-foreground">
              One line per service or offer
            </span>
            <Textarea
              value={services}
              onChange={(event) => setServices(event.target.value)}
              placeholder="One per line"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Who you are not for
            <span className="text-xs font-normal text-muted-foreground">
              Saying no is part of the brand
            </span>
            <Textarea
              value={notFor}
              onChange={(event) => setNotFor(event.target.value)}
            />
          </label>
          {showNotForNote ? (
            <p className="text-xs text-muted-foreground">
              Without this, we will sound like everyone in your industry.
            </p>
          ) : null}
          <label className="flex flex-col gap-1 text-sm">
            Topics you will not touch
            <Textarea
              value={forbidden}
              onChange={(event) => setForbidden(event.target.value)}
              placeholder="One topic per line"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            What a good week of content would change
            <span className="text-xs font-normal text-muted-foreground">
              Leads, trust, bookings — in your words, one sentence
            </span>
            <Textarea
              value={desiredOutcome}
              onChange={(event) => setDesiredOutcome(event.target.value)}
              rows={2}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <button
            type="button"
            className="text-left text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setShowMore((value) => !value)}
            aria-expanded={showMore}
          >
            {showMore ? "Hide" : "Show"} optional details (industry, location…)
          </button>
        </CardHeader>
        {showMore ? (
          <CardContent className="flex flex-col gap-3 border-t pt-4">
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
            <label className="flex flex-col gap-1 text-sm">
              Notes on how you sound (optional)
              <Textarea
                value={brandVoice}
                onChange={(event) => setBrandVoice(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Preferred hashtags
              <Textarea
                value={hashtags}
                onChange={(event) => setHashtags(event.target.value)}
                placeholder="One per line"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Other instructions
              <Textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </label>
          </CardContent>
        ) : null}
      </Card>

      <Button type="submit" disabled={saveMutation.isPending || !userId}>
        {saveMutation.isPending ? "Saving…" : "Save promise"}
      </Button>
    </form>
  );
}

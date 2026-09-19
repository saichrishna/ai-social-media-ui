"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { BrandSelector } from "@/components/brands/brand-selector";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateSocialContent } from "@/lib/api/posts";
import { useUserId } from "@/lib/auth";
import { useBrandSelection } from "@/lib/brands/brand-selection-provider";
import { mapGenerateSocialContentResult } from "@/lib/content/map-generate-result";

const CREATE_FAILURE_TITLE = "We couldn't create your post.";
const CREATE_FAILURE_DESCRIPTION =
  "Your request is safe. Please try again.";

export default function CreatePage() {
  const userId = useUserId();
  const router = useRouter();
  const {
    selectedBrandProfileId,
    brands,
    isLoading: brandsLoading,
    isError: brandsError,
    refetch: refetchBrands,
  } = useBrandSelection();

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("instagram");

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !selectedBrandProfileId) {
        throw new Error("missing brand or user");
      }
      return generateSocialContent({
        user_id: userId,
        brand_profile_id: selectedBrandProfileId,
        topic: topic.trim(),
        description: description.trim(),
        platform,
      });
    },
    onSuccess: (payload) => {
      const mapped = mapGenerateSocialContentResult(payload);
      if (mapped.ok) {
        router.push(`/content/${mapped.postId}`);
        return;
      }
      if (mapped.status) {
        console.error("Generate failed with status:", mapped.status);
      }
    },
  });

  if (!userId) {
    return null;
  }

  if (brandsLoading) {
    return <LoadingState label="Loading brands" />;
  }

  if (brandsError) {
    return (
      <ErrorState
        onRetry={() => {
          refetchBrands();
        }}
      />
    );
  }

  if (brands.length === 0 || !selectedBrandProfileId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Create Content</h1>
        <EmptyState
          title="No brands yet"
          description="Add a brand so generated posts use the right voice and guidelines."
          action={{ href: "/brands/new", label: "Add Brand" }}
        />
      </div>
    );
  }

  const mapped = generateMutation.data
    ? mapGenerateSocialContentResult(generateMutation.data)
    : null;
  const generateFailed =
    generateMutation.isError || (mapped !== null && !mapped.ok);

  if (generateMutation.isPending) {
    return (
      <div
        className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-6"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-medium">Creating your post...</p>
        <p className="text-sm text-muted-foreground">This may take a moment.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Create Content</h1>

      {generateFailed ? (
        <ErrorState
          message={CREATE_FAILURE_TITLE}
          description={CREATE_FAILURE_DESCRIPTION}
          onRetry={() => {
            generateMutation.mutate();
          }}
        />
      ) : null}

      <form
        className="flex flex-col gap-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          if (!topic.trim()) {
            return;
          }
          generateMutation.reset();
          generateMutation.mutate();
        }}
      >
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Brand</span>
          <BrandSelector />
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">What do you want to post about?</span>
          <Input
            required
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Summer biryani promotion"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Additional instructions (optional)
          </span>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Make it authentic and suitable for families..."
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Platform</span>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full" aria-label="Platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={!topic.trim()}>
          Generate
        </Button>
      </form>
    </div>
  );
}

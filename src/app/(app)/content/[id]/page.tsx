"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { StatusBadge } from "@/components/content/status-badge";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SchedulePostDialog } from "@/components/content/schedule-post-dialog";
import {
  approveSocialPost,
  getSocialPost,
  regenerateSocialPost,
  updateSocialPost,
} from "@/lib/api/posts";
import { ApiError, USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { track } from "@/lib/analytics";
import { mapGenerateSocialContentResult } from "@/lib/content/map-generate-result";
import { reviewDisplay } from "@/lib/content/review-display";
import {
  isApproveBlockedStatus,
  studioStatusActions,
} from "@/lib/content/studio-status-actions";
import type { SocialPost } from "@/types/post";

const SAVE_FAILURE_TITLE = "We couldn't save your changes.";
const APPROVE_FAILURE_TITLE = "We couldn't approve this post.";
const REGENERATE_FAILURE_TITLE = "We couldn't create your post.";
const ACTION_FAILURE_DESCRIPTION =
  "Your request is safe. Please try again.";

function parseHashtags(value: string): string[] {
  return value
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formFromPost(post: SocialPost) {
  return {
    headline: post.headline ?? "",
    caption: post.caption ?? "",
    hashtags: Array.isArray(post.hashtags) ? post.hashtags.join(" ") : "",
    callToAction: post.call_to_action ?? "",
    imagePrompt: post.image_prompt ?? "",
  };
}

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    headline: "",
    caption: "",
    hashtags: "",
    callToAction: "",
    imagePrompt: "",
  });
  const [approveOpen, setApproveOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const query = useQuery({
    queryKey: ["social-post", id],
    queryFn: () => getSocialPost(id),
    enabled: Boolean(id),
  });

  async function refetchStudio() {
    await queryClient.invalidateQueries({ queryKey: ["social-post", id] });
    await query.refetch();
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      updateSocialPost(id, {
        headline: form.headline,
        caption: form.caption,
        hashtags: parseHashtags(form.hashtags),
        call_to_action: form.callToAction,
        image_prompt: form.imagePrompt,
      }),
    onSuccess: async (payload) => {
      if (!payload.success) {
        return;
      }
      setEditing(false);
      await refetchStudio();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (status: string | null | undefined) => {
      if (isApproveBlockedStatus(status)) {
        throw new ApiError(400, USER_SAFE_ERROR_MESSAGE);
      }
      return approveSocialPost(id, status);
    },
    onSuccess: async (payload) => {
      if (!payload.success) {
        return;
      }
      setApproveOpen(false);
      await refetchStudio();
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateSocialPost(id),
    onSuccess: async (payload) => {
      const mapped = mapGenerateSocialContentResult(payload);
      if (!mapped.ok) {
        if (mapped.status) {
          console.error("Regenerate failed with status:", mapped.status);
        }
        return;
      }
      setRegenerateOpen(false);
      await refetchStudio();
    },
  });

  if (query.isLoading) {
    return <LoadingState label="Loading content" />;
  }

  if (query.isError) {
    const status =
      query.error instanceof ApiError ? query.error.status : undefined;
    if (status === 404) {
      return (
        <ErrorState message="We couldn't find this post." />
      );
    }
    return (
      <ErrorState
        message={USER_SAFE_ERROR_MESSAGE}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  const envelope = query.data;
  const post = envelope?.post;
  if (!envelope?.success || !post) {
    return (
      <ErrorState message="We couldn't find this post." />
    );
  }
  const loadedPost = post;

  const signedUrl = envelope.image_signed_url ?? null;
  const review = reviewDisplay(envelope.review ?? post.review);
  const actions = studioStatusActions(post.status);
  const hashtags = Array.isArray(post.hashtags) ? post.hashtags : [];
  const regenerateMapped = regenerateMutation.data
    ? mapGenerateSocialContentResult(regenerateMutation.data)
    : null;
  const regenerateFailed =
    regenerateMutation.isError ||
    (regenerateMapped !== null && !regenerateMapped.ok);
  const saveFailed =
    saveMutation.isError ||
    (saveMutation.data !== undefined && !saveMutation.data.success);
  const approveFailed =
    approveMutation.isError ||
    (approveMutation.data !== undefined && !approveMutation.data.success);

  function startEdit() {
    setForm(formFromPost(loadedPost));
    saveMutation.reset();
    setEditing(true);
  }

  function cancelEdit() {
    setForm(formFromPost(loadedPost));
    saveMutation.reset();
    setEditing(false);
  }

  if (regenerateMutation.isPending) {
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">← Content Studio</Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {post.status ? <StatusBadge status={post.status} /> : null}
          {post.platform ? <span>{post.platform}</span> : null}
        </div>
      </div>

      {saveFailed ? (
        <ErrorState
          message={SAVE_FAILURE_TITLE}
          description={ACTION_FAILURE_DESCRIPTION}
          onRetry={() => {
            saveMutation.mutate();
          }}
        />
      ) : null}

      {approveFailed ? (
        <ErrorState
          message={APPROVE_FAILURE_TITLE}
          description={ACTION_FAILURE_DESCRIPTION}
          onRetry={() => {
            approveMutation.mutate(post.status);
          }}
        />
      ) : null}

      {regenerateFailed ? (
        <ErrorState
          message={REGENERATE_FAILURE_TITLE}
          description={ACTION_FAILURE_DESCRIPTION}
          onRetry={() => {
            regenerateMutation.reset();
            regenerateMutation.mutate();
          }}
        />
      ) : null}

      {post.status === "approved" ? (
        <p className="text-sm">Post approved</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          {signedUrl ? (
            // Signed URL from GET detail only — never use image_url as src.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signedUrl}
              alt={post.headline || "Generated post image"}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-muted-foreground">
              No image yet
            </div>
          )}
        </div>

        {editing ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveMutation.mutate();
            }}
          >
            <label className="flex flex-col gap-1 text-sm">
              Headline
              <Input
                value={form.headline}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    headline: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Caption
              <Textarea
                value={form.caption}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    caption: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Hashtags
              <Textarea
                value={form.hashtags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hashtags: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Call to Action
              <Textarea
                value={form.callToAction}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    callToAction: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Image Prompt
              <Textarea
                value={form.imagePrompt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    imagePrompt: event.target.value,
                  }))
                }
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Headline" value={post.headline} />
            <Field label="Caption" value={post.caption} />
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Hashtags</h2>
              <p className="mt-1 whitespace-pre-wrap">
                {hashtags.length > 0 ? hashtags.join(" ") : "—"}
              </p>
            </div>
            <Field label="Call to action" value={post.call_to_action} />
            <Field label="Image prompt" value={post.image_prompt} />
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Platform</h2>
              <p className="mt-1">{post.platform || "—"}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
              <p className="mt-1">{post.status || "—"}</p>
            </div>
          </div>
        )}
      </div>

      {review ? (
        <section className="rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
          <h2 className="font-medium text-foreground">AI review</h2>
          {review.approved !== undefined ? (
            <p className="mt-2">
              {review.approved ? "Approved by review" : "Not approved by review"}
            </p>
          ) : null}
          {review.reason ? <p className="mt-2">{review.reason}</p> : null}
          {review.issues.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {review.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}
          {review.suggestions.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {review.suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {!editing ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              regenerateMutation.reset();
              setRegenerateOpen(true);
            }}
          >
            Regenerate
          </Button>
          <Button type="button" variant="outline" onClick={startEdit}>
            Edit
          </Button>
          {actions.approveVisible ? (
            <Button
              type="button"
              disabled={
                !actions.approveAvailable || isApproveBlockedStatus(post.status)
              }
              onClick={() => {
                approveMutation.reset();
                setApproveOpen(true);
              }}
            >
              Approve
            </Button>
          ) : null}
          {actions.scheduleVisible ? (
            <Button
              type="button"
              onClick={() => {
                track("schedule_opened", { post_id: id });
                setScheduleOpen(true);
              }}
            >
              Schedule
            </Button>
          ) : null}
        </div>
      ) : null}

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ready to publish?</DialogTitle>
            <DialogDescription>
              Once approved, you can schedule this post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApproveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                approveMutation.isPending ||
                isApproveBlockedStatus(post.status)
              }
              onClick={() => {
                approveMutation.mutate(post.status);
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {scheduleOpen ? (
        <SchedulePostDialog
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          postId={id}
          post={post}
        />
      ) : null}

      <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate a new version?</DialogTitle>
            <DialogDescription>
              This will replace the current generated content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRegenerateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={regenerateMutation.isPending}
              onClick={() => {
                setRegenerateOpen(false);
                regenerateMutation.mutate();
              }}
            >
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
      <p className="mt-1 whitespace-pre-wrap">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

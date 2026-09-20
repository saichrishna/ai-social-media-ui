"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { DevicePreview } from "@/components/ux/device-preview";
import { PageHeader } from "@/components/ux/page-header";
import { PageLayout } from "@/components/ux/page-layout";
import { ReviewCopilot } from "@/components/ux/review-copilot";
import {
  isApproveBlockedStatus,
  studioStatusActions,
  studioStatusGuidance,
} from "@/lib/content/studio-status-actions";
import { ExpandableText } from "@/components/ux/expandable-text";
import { useUnsavedChangesGuard } from "@/lib/ux/use-unsaved-changes-guard";
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

function formsEqual(
  a: ReturnType<typeof formFromPost>,
  b: ReturnType<typeof formFromPost>,
): boolean {
  return (
    a.headline === b.headline &&
    a.caption === b.caption &&
    a.hashtags === b.hashtags &&
    a.callToAction === b.callToAction &&
    a.imagePrompt === b.imagePrompt
  );
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
  const [discardOpen, setDiscardOpen] = useState(false);

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
      toast.success("Changes saved");
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
      toast.success("Post approved");
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

  const envelope = query.data;
  const post = envelope?.post;

  const baselineForm = useMemo(
    () => (post ? formFromPost(post) : null),
    [post],
  );
  const isDirty =
    editing &&
    baselineForm !== null &&
    !formsEqual(form, baselineForm);
  useUnsavedChangesGuard(isDirty);

  if (query.isLoading) {
    return (
      <PageLayout width="studio">
        <LoadingState label="Loading content" variant="studio" />
      </PageLayout>
    );
  }

  if (query.isError) {
    const status =
      query.error instanceof ApiError ? query.error.status : undefined;
    if (status === 404) {
      return (
        <PageLayout width="studio">
          <ErrorState message="We couldn't find this post." />
        </PageLayout>
      );
    }
    return (
      <PageLayout width="studio">
        <ErrorState
          message={USER_SAFE_ERROR_MESSAGE}
          onRetry={() => {
            void query.refetch();
          }}
        />
      </PageLayout>
    );
  }

  if (!envelope?.success || !post) {
    return (
      <PageLayout width="studio">
        <ErrorState message="We couldn't find this post." />
      </PageLayout>
    );
  }

  const studioPost = post;

  const signedUrl = envelope.image_signed_url ?? null;
  const review = reviewDisplay(envelope.review ?? studioPost.review);
  const actions = studioStatusActions(studioPost.status);
  const statusGuidance = studioStatusGuidance(studioPost.status);
  const hashtags = Array.isArray(studioPost.hashtags) ? studioPost.hashtags : [];
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
    setForm(formFromPost(studioPost));
    saveMutation.reset();
    setEditing(true);
  }

  function cancelEdit() {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    setForm(formFromPost(studioPost));
    saveMutation.reset();
    setEditing(false);
  }

  function confirmDiscardEdit() {
    setForm(formFromPost(studioPost));
    saveMutation.reset();
    setEditing(false);
    setDiscardOpen(false);
  }

  if (regenerateMutation.isPending) {
    return (
      <div
        className="surface-panel flex flex-col gap-2 p-6"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-medium">Creating your post...</p>
        <p className="text-sm text-muted-foreground">This may take a moment.</p>
      </div>
    );
  }

  return (
    <PageLayout width="studio">
      <PageHeader
        title={post.headline?.trim() || "Content studio"}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {post.platform ? <span>{post.platform}</span> : null}
            {post.status ? <StatusBadge status={post.status} /> : null}
          </span>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/content">← Library</Link>
          </Button>
        }
      />

      {statusGuidance && !editing ? (
        <p
          className="surface-panel px-4 py-3 text-sm text-muted-foreground"
          role="status"
        >
          {statusGuidance}
        </p>
      ) : null}

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

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr_minmax(260px,320px)] xl:items-start">
        <div className="surface-panel p-4 xl:sticky xl:top-6">
          <DevicePreview
            platform={post.platform}
            imageUrl={signedUrl}
            headline={post.headline}
          />
        </div>

        {editing ? (
          <form
            className="surface-panel flex flex-col gap-4 p-5"
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
              Direction for the image
              <span className="text-xs font-normal text-muted-foreground">
                Plain language — what should the picture show?
              </span>
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
              <Button type="submit" loading={saveMutation.isPending}>
                Save changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="surface-panel flex flex-col gap-4 p-5">
            <h2 className="text-lg font-semibold tracking-tight">Caption</h2>
            <Field label="Headline" value={post.headline} />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Caption
              </h3>
              <ExpandableText
                text={post.caption ?? ""}
                className="mt-1 text-foreground"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Hashtags
              </h3>
              <p className="mt-1 whitespace-pre-wrap">
                {hashtags.length > 0 ? hashtags.join(" ") : "—"}
              </p>
            </div>
            <Field label="Call to action" value={post.call_to_action} />
          </div>
        )}

        {review && !editing ? (
          <ReviewCopilot review={review} className="xl:row-span-2" />
        ) : null}
      </div>

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
              variant="studio"
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
              variant="studio"
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
              variant="studio"
              loading={approveMutation.isPending}
              disabled={isApproveBlockedStatus(post.status)}
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

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              Your edits to this post will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDiscardOpen(false)}
            >
              Keep editing
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDiscardEdit}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </PageLayout>
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

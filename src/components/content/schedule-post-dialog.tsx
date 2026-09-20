"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  buildScheduleDateTimeIso,
  DEFAULT_POST_TIMEZONE,
  scheduleSocialPost,
} from "@/lib/api/posts";
import {
  brandAccountLabelForPlatform,
  getBrandSocialAccounts,
} from "@/lib/api/social-accounts";
import { useUserId } from "@/lib/auth";
import { track } from "@/lib/analytics";
import type { SocialPost } from "@/types/post";

const SCHEDULE_FAILURE_TITLE = "We couldn't schedule this post.";
const ACTION_FAILURE_DESCRIPTION = "Your request is safe. Please try again.";

function todayDateInputValue(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatScheduleSuccess(date: string, time: string): {
  dateLine: string;
  timeLine: string;
} {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(year, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0);
  return {
    dateLine: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(value),
    timeLine: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(value),
  };
}

export function SchedulePostDialog({
  open,
  onOpenChange,
  postId,
  post,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  post: SocialPost;
}) {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const [date, setDate] = useState(() =>
    todayDateInputValue(DEFAULT_POST_TIMEZONE),
  );
  const [time, setTime] = useState("19:00");
  const [timezone, setTimezone] = useState(DEFAULT_POST_TIMEZONE);
  const [scheduled, setScheduled] = useState(false);

  const brandProfileId = post.brand_profile_id ?? null;

  const accountsQuery = useQuery({
    queryKey: ["brand-social-accounts", brandProfileId, userId],
    queryFn: () => getBrandSocialAccounts(brandProfileId!, userId!),
    enabled: open && Boolean(brandProfileId) && Boolean(userId),
  });

  const accountLabel = useMemo(() => {
    const accounts = accountsQuery.data?.accounts ?? [];
    if (!brandProfileId || accountsQuery.isError) {
      return "none connected";
    }
    if (accountsQuery.isLoading) {
      return "Loading...";
    }
    return brandAccountLabelForPlatform(accounts, post.platform);
  }, [
    accountsQuery.data?.accounts,
    accountsQuery.isError,
    accountsQuery.isLoading,
    brandProfileId,
    post.platform,
  ]);

  const mutation = useMutation({
    mutationFn: () =>
      scheduleSocialPost(postId, {
        scheduled_at: buildScheduleDateTimeIso(date, time),
        timezone,
      }),
    onSuccess: async (payload) => {
      if (!payload.success) {
        return;
      }
      track("post_scheduled", { post_id: postId });
      setScheduled(true);
      await queryClient.invalidateQueries({ queryKey: ["social-post", postId] });
      await queryClient.invalidateQueries({ queryKey: ["social-posts"] });
    },
  });

  const scheduleFailed =
    mutation.isError || (mutation.data !== undefined && !mutation.data.success);
  const successCopy = formatScheduleSuccess(date, time);
  const [pastError, setPastError] = useState(false);

  function scheduleIsInPast(): boolean {
    if (!date || !time) {
      return false;
    }
    try {
      const scheduledAtMs = Date.parse(buildScheduleDateTimeIso(date, time));
      return !Number.isNaN(scheduledAtMs) && scheduledAtMs < Date.now();
    } catch {
      return false;
    }
  }

  const canSubmit = Boolean(date && time && timezone && !mutation.isPending);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setScheduled(false);
      setPastError(false);
      mutation.reset();
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {scheduled ? (
          <>
            <DialogHeader>
              <DialogTitle>Scheduled</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-1 text-sm">
              <p>{successCopy.dateLine}</p>
              <p>{successCopy.timeLine}</p>
            </div>
            <DialogFooter>
              <Button asChild>
                <Link href="/calendar">View Calendar</Link>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Schedule Post</DialogTitle>
            </DialogHeader>
            {scheduleFailed ? (
              <ErrorState
                message={SCHEDULE_FAILURE_TITLE}
                description={ACTION_FAILURE_DESCRIPTION}
                onRetry={() => {
                  mutation.reset();
                  mutation.mutate();
                }}
              />
            ) : null}
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform</p>
                <p className="mt-1 text-sm">{post.platform || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account</p>
                <p className="mt-1 text-sm">{accountLabel}</p>
              </div>
              <label className="flex flex-col gap-1 text-sm">
                Date
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setPastError(false);
                  }}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Time
                <Input
                  type="time"
                  value={time}
                  onChange={(event) => {
                    setTime(event.target.value);
                    setPastError(false);
                  }}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Timezone
                <span className="text-xs font-normal text-muted-foreground">
                  Used with date and time above (IANA name, e.g. America/New_York)
                </span>
                <Input
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                />
              </label>
              {pastError ? (
                <p className="text-sm text-destructive" role="alert">
                  Pick a date and time in the future.
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canSubmit}
                onClick={() => {
                  if (scheduleIsInPast()) {
                    setPastError(true);
                    return;
                  }
                  setPastError(false);
                  mutation.mutate();
                }}
              >
                {mutation.isPending ? "Scheduling..." : "Schedule Post"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

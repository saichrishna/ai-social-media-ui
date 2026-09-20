export type StudioStatusActions = {
  approveVisible: boolean;
  approveAvailable: boolean;
  scheduleVisible: boolean;
};

const APPROVE_BLOCKED_STATUSES = new Set([
  "scheduled",
  "publishing",
  "published",
]);

/** Backend POST /approve returns 400 for these statuses. */
export function isApproveBlockedStatus(
  status: string | null | undefined,
): boolean {
  return status != null && APPROVE_BLOCKED_STATUSES.has(status);
}

export function studioStatusActions(
  status: string | null | undefined,
): StudioStatusActions {
  if (status === "approved") {
    return {
      approveVisible: false,
      approveAvailable: false,
      scheduleVisible: true,
    };
  }

  if (status === "draft") {
    return {
      approveVisible: true,
      approveAvailable: true,
      scheduleVisible: false,
    };
  }

  return {
    approveVisible: false,
    approveAvailable: false,
    scheduleVisible: false,
  };
}

/** Plain-language guidance when primary studio actions are hidden. */
export function studioStatusGuidance(
  status: string | null | undefined,
): string | null {
  switch (status) {
    case "scheduled":
      return "This post is scheduled. Open Calendar to see when it goes out.";
    case "publishing":
      return "Publishing is in progress. Check back in a moment.";
    case "published":
      return "This post is published. Edit or regenerate if you need a new version.";
    case "failed":
      return "Publishing failed. Edit the post, approve again, or regenerate.";
    default:
      return null;
  }
}

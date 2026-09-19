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

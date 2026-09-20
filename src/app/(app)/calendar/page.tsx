"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { PageLayout } from "@/components/ux/page-layout";
import { StatusBadge } from "@/components/content/status-badge";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { PageHeader } from "@/components/ux/page-header";
import { Button } from "@/components/ui/button";
import { getUserSocialPosts } from "@/lib/api/posts";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { useUserId } from "@/lib/auth";
import { useBrandSelection } from "@/lib/brands/brand-selection-provider";
import {
  calendarItemsForDay,
  groupCalendarPostsByDate,
} from "@/lib/calendar/calendar-posts";
import { buildMonthGrid, monthLabel } from "@/lib/calendar/month-grid";
import { filterPostsByBrandProfileId } from "@/lib/posts/filter-by-brand";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const userId = useUserId();
  const { selectedBrandProfileId } = useBrandSelection();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());

  const postsQuery = useQuery({
    queryKey: ["social-posts", userId],
    queryFn: () => getUserSocialPosts(userId!),
    enabled: Boolean(userId),
  });

  const posts = useMemo(() => {
    const allPosts = postsQuery.data?.data ?? [];
    return filterPostsByBrandProfileId(allPosts, selectedBrandProfileId);
  }, [postsQuery.data?.data, selectedBrandProfileId]);

  const groups = useMemo(
    () => groupCalendarPostsByDate(posts, year, monthIndex),
    [posts, year, monthIndex],
  );

  const cells = useMemo(
    () => buildMonthGrid(year, monthIndex),
    [year, monthIndex],
  );

  const hasItemsThisMonth = useMemo(() => {
    return cells.some(
      (cell) =>
        cell.inCurrentMonth && calendarItemsForDay(groups, cell.dateKey).length > 0,
    );
  }, [cells, groups]);

  function shiftMonth(delta: number) {
    const next = new Date(year, monthIndex + delta, 1);
    setYear(next.getFullYear());
    setMonthIndex(next.getMonth());
  }

  if (!userId) {
    return null;
  }

  return (
    <PageLayout width="full">
      <PageHeader
        title="Calendar"
        description="Scheduled posts for the selected brand."
        actions={
          <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeftIcon />
          </Button>
          <p className="min-w-40 text-center text-sm font-medium">
            {monthLabel(year, monthIndex)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRightIcon />
          </Button>
          </div>
        }
      />

      {postsQuery.isLoading ? (
        <LoadingState label="Loading calendar" />
      ) : postsQuery.isError ? (
        <ErrorState
          message={USER_SAFE_ERROR_MESSAGE}
          onRetry={() => {
            void postsQuery.refetch();
          }}
        />
      ) : (
        <>
          {!hasItemsThisMonth ? (
            <EmptyState
              title="No scheduled posts this month"
              description="Approved posts can be scheduled from Content Studio."
              action={{ href: "/content", label: "Open content library" }}
            />
          ) : null}
          <div className="overflow-x-auto">
            <div
              role="grid"
              aria-label={`Month calendar ${monthLabel(year, monthIndex)}`}
              className="surface-panel grid min-w-[40rem] grid-cols-7 gap-px overflow-hidden bg-[color:var(--zone-studio-border)] p-0 ring-0"
            >
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  role="columnheader"
                  className="bg-muted px-2 py-2 text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              {cells.map((cell) => {
                const items = calendarItemsForDay(groups, cell.dateKey);
                const dayNumber = Number(cell.dateKey.slice(-2));
                return (
                  <div
                    key={cell.dateKey}
                    role="gridcell"
                    className={`min-h-28 bg-surface p-2 ${
                      cell.inCurrentMonth ? "" : "opacity-40"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">{dayNumber}</p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {items.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={`/content/${item.id}`}
                            className="block rounded-md border border-border bg-muted/60 px-1.5 py-1 text-xs hover:bg-muted"
                          >
                            <span className="flex items-center justify-between gap-1">
                              <span>{item.platform || "Post"}</span>
                              <span>{item.time}</span>
                            </span>
                            <span className="mt-0.5 line-clamp-2 block">
                              {item.preview}
                            </span>
                            {item.status ? (
                              <span className="mt-1 block">
                                <StatusBadge status={item.status} />
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}

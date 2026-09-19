import { formatCalendarTime, isoDateKey } from "@/lib/calendar/month-grid";

export type CalendarItem = {
  id: string;
  platform: string | null;
  time: string;
  preview: string;
  status: string | null;
};

export type CalendarDayGroup = {
  dateKey: string;
  items: CalendarItem[];
};

type CalendarPost = {
  id: string;
  headline?: string | null;
  platform?: string | null;
  status?: string | null;
  scheduled_at?: string | null;
  published_at?: string | null;
  image_url?: string | null;
};

function itemFromPost(
  post: CalendarPost,
  iso: string,
): CalendarItem {
  return {
    id: post.id,
    platform: post.platform ?? null,
    time: formatCalendarTime(iso),
    preview: post.headline?.trim() ? post.headline : "Untitled",
    status: post.status ?? null,
  };
}

function addItem(
  groups: Map<string, CalendarItem[]>,
  dateKey: string,
  item: CalendarItem,
) {
  const existing = groups.get(dateKey) ?? [];
  if (existing.some((current) => current.id === item.id)) {
    return;
  }
  existing.push(item);
  groups.set(dateKey, existing);
}

export function groupCalendarPostsByDate(
  posts: CalendarPost[],
  year: number,
  monthIndex: number,
): Map<string, CalendarItem[]> {
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const groups = new Map<string, CalendarItem[]>();

  for (const post of posts) {
    const scheduledKey = isoDateKey(post.scheduled_at);
    if (scheduledKey?.startsWith(monthPrefix) && post.scheduled_at) {
      addItem(groups, scheduledKey, itemFromPost(post, post.scheduled_at));
    }

    if (!Object.prototype.hasOwnProperty.call(post, "published_at")) {
      continue;
    }
    const publishedKey = isoDateKey(post.published_at);
    if (publishedKey?.startsWith(monthPrefix) && post.published_at) {
      addItem(groups, publishedKey, itemFromPost(post, post.published_at));
    }
  }

  return groups;
}

export function calendarItemsForDay(
  groups: Map<string, CalendarItem[]>,
  dateKey: string,
): CalendarItem[] {
  return groups.get(dateKey) ?? [];
}

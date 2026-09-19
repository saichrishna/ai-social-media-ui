export type CalendarMonthCell = {
  dateKey: string;
  inCurrentMonth: boolean;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

export function isoDateKey(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  if (match) {
    return match[1];
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  const date = new Date(parsed);
  return toDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

export function buildMonthGrid(
  year: number,
  monthIndex: number,
): CalendarMonthCell[] {
  const first = new Date(year, monthIndex, 1);
  const startDay = first.getDay();
  const start = new Date(year, monthIndex, 1 - startDay);
  const cells: CalendarMonthCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    cells.push({
      dateKey: toDateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      inCurrentMonth: date.getMonth() === monthIndex,
    });
  }

  return cells;
}

export function monthLabel(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

export function formatCalendarTime(iso: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(iso);
  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const date = new Date(2000, 0, 1, hours, minutes);
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) {
    return iso;
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(parsed));
}

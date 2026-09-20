import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type LoadingStateVariant =
  | "default"
  | "page-header"
  | "dashboard"
  | "library"
  | "studio"
  | "calendar"
  | "cards"
  | "form";

export function LoadingState({
  label = "Loading",
  className,
  variant = "default",
}: {
  label?: string;
  className?: string;
  variant?: LoadingStateVariant;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("flex flex-col gap-6", className)}
    >
      {variant === "default" ? (
        <>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </>
      ) : null}

      {variant === "page-header" || variant === "form" ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-56 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
          {variant === "page-header" ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : null}
        </>
      ) : null}

      {variant === "dashboard" ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-64 max-w-full" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </>
      ) : null}

      {variant === "library" ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        </>
      ) : null}

      {variant === "studio" ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr_minmax(260px,320px)]">
            <Skeleton className="aspect-[9/16] w-full max-w-sm rounded-xl" />
            <Skeleton className="min-h-64 w-full rounded-xl" />
            <Skeleton className="min-h-48 w-full rounded-xl xl:row-span-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </>
      ) : null}

      {variant === "calendar" ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Skeleton className="h-9 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <Skeleton className="h-[22rem] w-full min-w-[40rem] rounded-xl" />
        </>
      ) : null}

      {variant === "cards" ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </>
      ) : null}

      {variant === "form" ? (
        <Skeleton className="h-72 w-full max-w-2xl rounded-xl" />
      ) : null}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

const BAR_COUNT = 24;

export function VoiceWaveform({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-16 items-end justify-center gap-1",
        className,
      )}
      aria-hidden={!active}
      role={active ? "img" : undefined}
      aria-label={active ? "Listening" : undefined}
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span
          key={index}
          className={cn(
            "w-1 rounded-full bg-[linear-gradient(180deg,var(--studio-accent-start),var(--studio-accent-end))] transition-opacity",
            active ? "animate-voice-bar opacity-90" : "h-2 opacity-25",
          )}
          style={
            active
              ? {
                  animationDelay: `${(index % 8) * 75}ms`,
                  height: `${30 + (index % 5) * 12}%`,
                }
              : { height: "8px" }
          }
        />
      ))}
    </div>
  );
}

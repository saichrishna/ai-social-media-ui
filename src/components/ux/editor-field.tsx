import type { ReactNode } from "react";

export function EditorField({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {helper ? (
        <span className="text-[13px] leading-5 text-muted-foreground">
          {helper}
        </span>
      ) : null}
      <div className="mt-1">{children}</div>
    </label>
  );
}

"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { PageHeader } from "@/components/ux/page-header";
import { PageLayout } from "@/components/ux/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SURFACE_PANEL_CARD } from "@/lib/ux/surface-panel-card";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/auth";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function SettingsPage() {
  const user = useUser();
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();
  const isDark = isClient && theme === "dark";

  return (
    <PageLayout width="narrow">
      <PageHeader title="Settings" />
      <Card className={cn(SURFACE_PANEL_CARD)}>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name</span>
            <br />
            {user?.name ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Email</span>
            <br />
            {user?.email ?? "—"}
          </p>
        </CardContent>
      </Card>
      <Card className={cn(SURFACE_PANEL_CARD)}>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-pressed={isDark}
          >
            {isDark ? "Switch to light" : "Switch to dark"}
          </Button>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

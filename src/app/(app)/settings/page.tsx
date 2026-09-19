"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
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
      <Card>
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
    </div>
  );
}

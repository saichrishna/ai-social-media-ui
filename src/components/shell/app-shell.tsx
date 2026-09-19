"use client";

import { useState, type ReactNode } from "react";
import { MenuIcon, PanelLeftIcon } from "lucide-react";

import { BrandSelector } from "@/components/brands/brand-selector";
import { AppNav } from "@/components/shell/nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavCollapsed } from "@/lib/shell/use-nav-collapsed";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useNavCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1">
      <aside
        className={cn(
          "hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col",
          collapsed ? "w-16" : "w-56",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 px-3">
          {!collapsed ? (
            <span className="truncate text-sm font-semibold">AI Social</span>
          ) : (
            <span className="sr-only">AI Social</span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            <PanelLeftIcon />
          </Button>
        </div>
        <div className="px-2 pb-4">
          <AppNav collapsed={collapsed} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-border px-3 md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </Button>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="px-2 pb-4">
                <AppNav onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <BrandSelector />
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

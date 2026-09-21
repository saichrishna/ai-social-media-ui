"use client";

import { useState, type ReactNode } from "react";
import { MenuIcon, PanelLeftIcon } from "lucide-react";

import { BrandSelector } from "@/components/brands/brand-selector";
import { TellUsSomethingLink } from "@/components/shell/tell-us-something-link";
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-panel focus:outline-none focus:ring-3 focus:ring-ring/50"
      >
        Skip to main content
      </a>
      <aside
        className={cn(
          "hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[var(--shadow-sidebar)] md:flex md:flex-col",
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

      <div className="app-canvas flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-border/60 bg-[color-mix(in_oklch,var(--app-canvas-base),white_12%)] px-3 backdrop-blur-sm md:px-6">
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
          <TellUsSomethingLink />
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

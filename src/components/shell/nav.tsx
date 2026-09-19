"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Calendar,
  FileText,
  LayoutDashboard,
  PenSquare,
  Settings,
  Share2,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create Content", icon: PenSquare },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/brands", label: "Brands", icon: Building2 },
  { href: "/accounts", label: "Social Accounts", icon: Share2 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              collapsed && "justify-center px-2",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/70",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {collapsed ? (
              <span className="sr-only">{item.label}</span>
            ) : (
              <span>{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

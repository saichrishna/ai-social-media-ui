"use client";

import { useSyncExternalStore } from "react";

import {
  readBrowserStorage,
  subscribeBrowserStorage,
  writeBrowserStorage,
} from "@/lib/storage/browser-storage";

const NAV_COLLAPSED_KEY = "nav_collapsed";

export function useNavCollapsed() {
  const raw = useSyncExternalStore(
    (onStoreChange) => subscribeBrowserStorage(NAV_COLLAPSED_KEY, onStoreChange),
    () => readBrowserStorage(NAV_COLLAPSED_KEY),
    () => null,
  );
  const collapsed = raw === "true";

  function setCollapsed(next: boolean) {
    writeBrowserStorage(NAV_COLLAPSED_KEY, String(next));
  }

  return [collapsed, setCollapsed] as const;
}

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function BrandDangerZone({
  brandName,
  onConfirmDelete,
  isDeleting,
}: {
  brandName: string;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <details className="surface-panel group border-destructive/20 p-0 ring-0">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="text-xs transition-transform group-open:rotate-90"
            >
              ▸
            </span>
            Danger zone
          </span>
        </summary>
        <div className="flex flex-col gap-3 border-t border-destructive/15 px-4 pb-4 pt-3">
          <p className="text-sm text-muted-foreground">
            Permanently remove this brand and its saved material.
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-fit"
            disabled={isDeleting}
            onClick={() => setDeleteOpen(true)}
          >
            Delete brand
          </Button>
        </div>
      </details>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {brandName}?</DialogTitle>
            <DialogDescription>
              This removes the brand and all saved promise and word material. It
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => onConfirmDelete()}
            >
              {isDeleting ? "Deleting…" : "Delete brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

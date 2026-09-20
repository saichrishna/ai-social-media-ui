"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { PageHeader } from "@/components/ux/page-header";
import { PageLayout } from "@/components/ux/page-layout";
import { Button } from "@/components/ui/button";
import { SURFACE_PANEL_CARD } from "@/lib/ux/surface-panel-card";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import {
  canInvokeSocialConnect,
  disconnectSocialAccount,
  getUserSocialAccounts,
  isListedSocialAccount,
  socialAccountDisplayLabel,
} from "@/lib/api/social-accounts";
import { useUserId } from "@/lib/auth";
import { flags } from "@/lib/flags";
import type { SocialAccount } from "@/types/social-account";

const CONNECT_UNAVAILABLE_MESSAGE =
  "Publishing and account OAuth are not available yet. You can still generate content without connecting accounts.";

function platformLabel(platform?: string | null): string {
  const value = platform?.trim();
  return value ? value : "Account";
}

export default function AccountsPage() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const connectEnabled = canInvokeSocialConnect(flags.social_publishing);
  const [accountToDisconnect, setAccountToDisconnect] =
    useState<SocialAccount | null>(null);

  const query = useQuery({
    queryKey: ["user-social-accounts", userId],
    queryFn: () => getUserSocialAccounts(userId!),
    enabled: Boolean(userId),
  });

  const disconnectMutation = useMutation({
    mutationFn: (account: SocialAccount) =>
      disconnectSocialAccount(account.id, userId!),
    onSuccess: async (payload) => {
      if (payload.success === false) {
        return;
      }
      setAccountToDisconnect(null);
      await queryClient.invalidateQueries({ queryKey: ["user-social-accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["brand-social-accounts"] });
    },
  });

  if (!userId) {
    return null;
  }

  if (query.isLoading) {
    return <LoadingState label="Loading social accounts" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={USER_SAFE_ERROR_MESSAGE}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  const accounts = (query.data?.accounts ?? []).filter(isListedSocialAccount);

  return (
    <PageLayout width="studio">
      <PageHeader
        title="Social Accounts"
        description="Optional for now — generate content without connecting."
        actions={
          <div className="flex flex-col items-end gap-1">
            <Button type="button" disabled={!connectEnabled}>
              + Connect Account
            </Button>
            {!connectEnabled ? (
              <p className="max-w-xs text-right text-xs text-muted-foreground">
                {CONNECT_UNAVAILABLE_MESSAGE}
              </p>
            ) : null}
          </div>
        }
      />

      {accounts.length === 0 ? (
        <EmptyState
          title="No accounts connected"
          description="Content generation does not require connected accounts. Connect is unavailable until publishing and OAuth are supported."
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {accounts.map((account) => {
            const label = socialAccountDisplayLabel(account);
            return (
              <li key={account.id}>
                <Card className={cn(SURFACE_PANEL_CARD)}>
                  <CardHeader>
                    <CardTitle>{platformLabel(account.platform)}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {label && label !== "Connected" ? <p>{label}</p> : null}
                    <p>● Connected</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        disconnectMutation.reset();
                        setAccountToDisconnect(account);
                      }}
                    >
                      Disconnect
                    </Button>
                  </CardFooter>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={accountToDisconnect !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAccountToDisconnect(null);
            disconnectMutation.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect account</DialogTitle>
            <DialogDescription>
              Disconnect{" "}
              {accountToDisconnect
                ? platformLabel(accountToDisconnect.platform)
                : "this account"}
              ? You can still generate content without connected accounts.
            </DialogDescription>
          </DialogHeader>
          {disconnectMutation.isError ||
          disconnectMutation.data?.success === false ? (
            <ErrorState
              message={USER_SAFE_ERROR_MESSAGE}
              onRetry={() => {
                if (accountToDisconnect) {
                  disconnectMutation.mutate(accountToDisconnect);
                }
              }}
            />
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAccountToDisconnect(null);
                disconnectMutation.reset();
              }}
              disabled={disconnectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={disconnectMutation.isPending || !accountToDisconnect}
              onClick={() => {
                if (accountToDisconnect) {
                  disconnectMutation.mutate(accountToDisconnect);
                }
              }}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

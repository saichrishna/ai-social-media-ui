"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getLatestVoiceStudy,
  runVoiceStudy,
} from "@/lib/api/brand-dna";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { useUserId } from "@/lib/auth";
import type { BrandProfile } from "@/types/brand";

export function BrandVoiceStudyPanel({
  profile,
}: {
  profile: BrandProfile;
}) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const profileId = profile.id;

  const studyQuery = useQuery({
    queryKey: ["brand-voice-study", profileId, userId],
    queryFn: () => getLatestVoiceStudy(profileId, userId!),
    enabled: Boolean(userId),
  });

  const studyMutation = useMutation({
    mutationFn: () => runVoiceStudy(profileId, userId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brand-voice-study", profileId],
      });
      toast.success("Voice study saved");
    },
    onError: () => toast.error(USER_SAFE_ERROR_MESSAGE),
  });

  const study = studyQuery.data?.voice_study;
  const corpusCount = studyQuery.data?.corpus_count ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">How you sound</CardTitle>
        <CardDescription>
          Study runs on your pastes and answers only — not the open internet.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Source pieces: {corpusCount}. Need at least three before study.
        </p>
        <Button
          type="button"
          variant="secondary"
          disabled={
            studyMutation.isPending || corpusCount < 3 || !userId
          }
          onClick={() => studyMutation.mutate()}
        >
          {studyMutation.isPending ? "Studying…" : "Study my voice"}
        </Button>

        {study ? (
          <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium">Keep</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {(study.keep_items ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium">Raise</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {(study.raise_items ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

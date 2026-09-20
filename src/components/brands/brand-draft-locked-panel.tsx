import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BrandDraftLockedPanel() {
  return (
    <Card className="mx-auto max-w-2xl opacity-90">
      <CardHeader>
        <CardTitle className="text-base">Draft</CardTitle>
        <CardDescription>We write after we know you.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>
          When Promise is complete and you have at least three pastes or
          answers under Your words, the Draft tab unlocks here.
        </p>
        <p className="mt-3">
          Finish your promise and add something only you would know.
        </p>
      </CardContent>
    </Card>
  );
}

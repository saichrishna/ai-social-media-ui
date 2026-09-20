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
          When Promise and your words are in place, one idea and one channel at
          a time will live here. That step is a later phase — not part of this
          slice.
        </p>
        <p className="mt-3">
          For now, finish your promise and add something only you would know.
        </p>
      </CardContent>
    </Card>
  );
}

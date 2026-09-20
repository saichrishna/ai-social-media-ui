import type { ReactNode } from "react";

import { PageHeader } from "@/components/ux/page-header";
import { PageLayout } from "@/components/ux/page-layout";

export function CreatePageShell({
  title = "Create Content",
  description,
  children,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PageLayout width="studio">
      <PageHeader title={title} description={description} />
      {children}
    </PageLayout>
  );
}

import { BrandCreateForm } from "@/components/brands/brand-create-form";
import { PageHeader } from "@/components/ux/page-header";
import { PageLayout } from "@/components/ux/page-layout";

export default function NewBrandPage() {
  return (
    <PageLayout width="studio">
      <PageHeader
        title="New brand"
        description="Name it, then promise and your words — no long form upfront."
      />
      <BrandCreateForm />
    </PageLayout>
  );
}

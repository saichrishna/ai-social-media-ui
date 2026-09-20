import { BrandCreateForm } from "@/components/brands/brand-create-form";

export default function NewBrandPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New brand</h1>
      <BrandCreateForm />
    </div>
  );
}

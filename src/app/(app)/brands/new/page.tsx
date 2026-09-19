import { BrandForm } from "@/components/brands/brand-form";

export default function NewBrandPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add Brand</h1>
      <BrandForm />
    </div>
  );
}

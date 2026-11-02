import { SectionSkeleton } from "@/components/Sections";

export default function Loading() {
  return (
    <div className="container-x py-12">
      <div className="skeleton mb-8 h-12 w-72" />
      <SectionSkeleton />
    </div>
  );
}

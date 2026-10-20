import { SkeletonRows } from "@/core/ui/primitives";

export default function Loading() {
  return (
    <div className="pt-2">
      <div className="skeleton mb-3 h-9 w-2/3 max-w-sm" />
      <div className="skeleton mb-8 h-4 w-1/3 max-w-40" />
      <SkeletonRows rows={3} />
    </div>
  );
}

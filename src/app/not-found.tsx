import Link from "next/link";
import { EmptyState } from "@/core/ui/primitives";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg pt-10">
      <h1 className="text-[32px] leading-tight">Nothing here</h1>
      <div className="mt-6">
        <EmptyState title="This page doesn't exist">
          <Link href="/" className="font-semibold text-accent underline">
            Back to Today
          </Link>
        </EmptyState>
      </div>
    </div>
  );
}

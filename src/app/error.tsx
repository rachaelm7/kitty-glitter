"use client";

import Link from "next/link";
import { ErrorState } from "@/core/ui/primitives";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg pt-10">
      <h1 className="text-[32px] leading-tight">Something went sideways</h1>
      <p className="mt-2 text-muted">This screen hit a snag. Your demo data is safe on this device.</p>
      <div className="mt-6">
        <ErrorState title="This page couldn't load" onRetry={reset}>
          You can try again, or head back to{" "}
          <Link href="/" className="font-semibold underline">
            Today
          </Link>
          .
        </ErrorState>
      </div>
    </div>
  );
}

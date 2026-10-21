"use client";

import Link from "next/link";
import { useState } from "react";
import { ErrorBoundary } from "@/core/ui/ErrorBoundary";
import { Button, Card, EmptyState, ErrorState, PageHeader, Section, SkeletonRows } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";

function Boom(): never {
  throw new Error("Simulated widget failure");
}

/** A design-review page showing every empty, loading and error state in one place. */
export function StatesGallery() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="max-w-2xl">
      <Link href="/more" className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-accent">
        <Icon.Back width={20} height={20} /> More
      </Link>
      <PageHeader title="State gallery" subtitle="Empty, loading and error states, for design review." />

      <Section title="Loading" id="g-loading">
        <SkeletonRows rows={2} />
      </Section>

      <Section title="Empty" id="g-empty">
        <div className="grid gap-3 sm:grid-cols-2">
          <EmptyState title="All clear">Nothing needs you here. That&apos;s a good thing.</EmptyState>
          <EmptyState title="No trips planned" icon={<Icon.Plane />} />
        </div>
      </Section>

      <Section title="Error" id="g-error">
        <ErrorState title="Inbox couldn't refresh" onRetry={() => {}}>
          Check your connection and try again. Nothing was changed.
        </ErrorState>
      </Section>

      <Section title="Widget failure is contained" id="g-boundary">
        <Card>
          <p className="text-sm text-muted">One widget breaking never takes down the rest of the page.</p>
          <div className="mt-3">
            {broken ? (
              <ErrorBoundary name="Sample widget">
                <Boom />
              </ErrorBoundary>
            ) : (
              <p className="rounded-xl bg-surface-2 p-3 text-sm">Sample widget is working.</p>
            )}
          </div>
          <Button size="sm" variant="ghost" className="mt-3" onClick={() => setBroken((b) => !b)}>
            {broken ? "Restore widget" : "Break the sample widget"}
          </Button>
        </Card>
      </Section>
    </div>
  );
}

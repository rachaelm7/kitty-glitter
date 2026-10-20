import type { Metadata } from "next";
import { Suspense } from "react";
import { SkeletonRows } from "@/core/ui/primitives";
import { ThreadDetailScreen } from "@/modules/hub";
import { SEED_THREADS } from "@/modules/threads";

export const metadata: Metadata = { title: "Life Thread" };

// Pre-render the sample threads; threads created on a device render on demand.
export function generateStaticParams() {
  return SEED_THREADS.map((t) => ({ id: t.id }));
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ThreadDetailScreen id={id} />;
}

export default function Page({ params }: PageProps<"/threads/[id]">) {
  return (
    <Suspense fallback={<SkeletonRows rows={3} />}>
      <Detail params={params} />
    </Suspense>
  );
}

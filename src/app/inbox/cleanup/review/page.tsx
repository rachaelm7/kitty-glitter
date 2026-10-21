import type { Metadata } from "next";
import { CleanupReview } from "@/modules/email";

export const metadata: Metadata = { title: "Review cleanup" };

export default function Page() {
  return <CleanupReview />;
}

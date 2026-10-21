import type { Metadata } from "next";
import { CollectionsScreen } from "@/modules/collections";

export const metadata: Metadata = { title: "Personal Collections" };

export default function Page() {
  return <CollectionsScreen />;
}

import type { Metadata } from "next";
import { CleanupScreen } from "@/modules/email";

export const metadata: Metadata = { title: "Promotions to review" };

export default function Page() {
  return <CleanupScreen />;
}

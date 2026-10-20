import type { Metadata } from "next";
import { FinancesScreen } from "@/modules/finances";

export const metadata: Metadata = { title: "Finances" };

export default function Page() {
  return <FinancesScreen />;
}

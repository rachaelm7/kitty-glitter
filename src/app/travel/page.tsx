import type { Metadata } from "next";
import { TravelScreen } from "@/modules/travel";

export const metadata: Metadata = { title: "Travel" };

export default function Page() {
  return <TravelScreen />;
}

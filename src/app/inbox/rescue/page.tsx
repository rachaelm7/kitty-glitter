import type { Metadata } from "next";
import { RescueScreen } from "@/modules/email";

export const metadata: Metadata = { title: "Rescue Mode" };

export default function Page() {
  return <RescueScreen />;
}

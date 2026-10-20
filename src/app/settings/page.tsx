import type { Metadata } from "next";
import { SettingsScreen } from "@/modules/settings";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsScreen />;
}

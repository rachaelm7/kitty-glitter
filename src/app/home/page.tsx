import type { Metadata } from "next";
import { HomeScreen } from "@/modules/home";

export const metadata: Metadata = { title: "Home" };

export default function Page() {
  return <HomeScreen />;
}

import type { Metadata } from "next";
import { ThreadsScreen } from "@/modules/hub";

export const metadata: Metadata = { title: "Life Threads" };

export default function Page() {
  return <ThreadsScreen />;
}

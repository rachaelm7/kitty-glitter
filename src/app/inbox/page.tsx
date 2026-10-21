import type { Metadata } from "next";
import { InboxScreen } from "@/modules/email";

export const metadata: Metadata = { title: "Inbox" };

export default function Page() {
  return <InboxScreen />;
}

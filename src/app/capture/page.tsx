import type { Metadata } from "next";
import { CaptureScreen } from "@/modules/capture";

export const metadata: Metadata = { title: "Brain dump" };

export default function Page() {
  return <CaptureScreen />;
}

import type { Metadata } from "next";
import { StatesGallery } from "@/modules/settings";

export const metadata: Metadata = { title: "State gallery" };

export default function Page() {
  return <StatesGallery />;
}

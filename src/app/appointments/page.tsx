import type { Metadata } from "next";
import { AppointmentsScreen } from "@/modules/appointments";

export const metadata: Metadata = { title: "Appointments" };

export default function Page() {
  return <AppointmentsScreen />;
}

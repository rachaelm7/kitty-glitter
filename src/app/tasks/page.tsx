import type { Metadata } from "next";
import { TasksScreen } from "@/modules/tasks";

export const metadata: Metadata = { title: "Tasks" };

export default function Page() {
  return <TasksScreen />;
}

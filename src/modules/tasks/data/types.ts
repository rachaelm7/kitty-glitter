export const CATEGORIES = ["Home", "Health", "Money", "Travel", "Social", "Work", "Errands"] as const;
export type TaskCategory = (typeof CATEGORIES)[number];

export type TaskStatus = "open" | "waiting" | "done";

export type Task = {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  /** Who or what you're waiting on, when status is "waiting". */
  waitingOn?: string;
  category: TaskCategory;
  kind?: "task" | "reminder";
  /** Optional and never invented: only set when the user or a source supplies it. */
  dueDayOffset?: number; // sample data, relative to today
  dueDate?: string; // YYYY-MM-DD, set by the user or a capture
  dueSource?: string; // the words a captured date came from, e.g. "by Friday"
  /** Link to the (fictional) email this came from. */
  emailId?: string;
  emailFrom?: string;
  threadId?: string;
  createdAt: number;
  completedAt?: number;
};

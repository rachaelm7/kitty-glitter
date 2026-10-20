export type Task = {
  id: string;
  title: string;
  done: boolean;
  /** Set when the task came from an email (fictional source). */
  fromEmail?: { messageId: string; sender: string };
  kind?: "task" | "reminder";
  /** Optional and never invented: only set when the user or a source supplies it. */
  dueDayOffset?: number; // sample data, relative to today
  dueDate?: string; // YYYY-MM-DD, from a capture or the user
  dueSource?: string; // the words the date came from, e.g. "by Friday"
  threadId?: string;
  createdAt: number;
};

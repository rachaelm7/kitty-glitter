export type Task = {
  id: string;
  title: string;
  done: boolean;
  /** Set when the task came from an email (fictional source). */
  fromEmail?: { messageId: string; sender: string };
  /** Optional; never invented. Only set when the user or a source supplies it. */
  dueDayOffset?: number;
  threadId?: string;
  createdAt: number;
};

export const STATUSES = [
  "needs-scheduling",
  "scheduled",
  "waiting-office",
  "results-pending",
  "follow-up",
  "completed",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  "needs-scheduling": "Needs Scheduling",
  scheduled: "Scheduled",
  "waiting-office": "Waiting on Office",
  "results-pending": "Results Pending",
  "follow-up": "Follow-Up Needed",
  completed: "Completed",
};

export type TimelineEvent = {
  id: string;
  dayOffset: number; // relative to today
  label: string;
  by: "you" | "office" | "app";
};

export type Appointment = {
  id: string;
  title: string;
  kind: "referral" | "visit" | "test";
  provider: string; // fictional
  contact: string; // fictional 555-01xx number
  status: Status;
  /** Day the current status started, relative to today. */
  statusSince: number;
  when?: { dayOffset: number; time: string; place: string }; // time may be "" when not known
  referredBy?: string;
  events: TimelineEvent[];
  threadId?: string;
};

export type ThreadStage = "action" | "waiting" | "scheduled" | "done";

export type ThreadEvent = {
  id: string;
  dayOffset: number; // relative to today
  label: string;
  kind: "email" | "task" | "appointment" | "note" | "update" | "booking";
};

/** A Life Thread ties related emails, tasks, appointments and plans together. */
export type LifeThread = {
  id: string;
  name: string;
  color: string;
  icon: "Heart" | "Stethoscope" | "Wallet" | "Plane" | "House" | "Star" | "Thread";
  blurb: string;
  /** Short, human status, e.g. "Confirm by today". */
  status: string;
  stage: ThreadStage;
  waitingOn?: string;
  /** The single next step, linked to the email or task that handles it. */
  next?: { label: string; emailId?: string; taskId?: string; href?: string };
  /** Hand-curated history; related emails, tasks and appointments are merged in when shown. */
  events: ThreadEvent[];
  /** Lowercase words that suggest a capture belongs to this thread. */
  keywords: string[];
};

export type ThreadNote = { id: string; threadId: string; text: string; createdAt: number };

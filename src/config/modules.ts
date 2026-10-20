/**
 * Module registry. Drives the desktop side nav and the More screen.
 * Flip a module to "live" when its screens ship.
 */
export type ModuleStatus = "live" | "planned";
export type ModuleEntry = {
  key: string;
  name: string;
  href?: string;
  status: ModuleStatus;
  blurb: string;
  icon: "Today" | "Inbox" | "Tasks" | "Calendar" | "Stethoscope" | "Plane" | "House" | "Lifebuoy" | "Mic" | "Thread" | "Grid";
};

export const MODULES: ModuleEntry[] = [
  { key: "email", name: "Email Command Center", href: "/inbox", status: "live", blurb: "Five accounts, one calm inbox", icon: "Inbox" },
  { key: "tasks", name: "Tasks", href: "/tasks", status: "live", blurb: "Checklist, some pulled from email", icon: "Tasks" },
  { key: "capture", name: "Brain Dump", status: "planned", blurb: "Type or talk, review before anything is added", icon: "Mic" },
  { key: "appointments", name: "Appointment Concierge", status: "planned", blurb: "Referrals, scheduling and follow-ups", icon: "Stethoscope" },
  { key: "rescue", name: "Email Rescue Mode", status: "planned", blurb: "Calm path through a huge unread pile", icon: "Lifebuoy" },
  { key: "travel", name: "Travel", status: "planned", blurb: "Trips, packing and reservations", icon: "Plane" },
  { key: "home", name: "Home", status: "planned", blurb: "Maintenance, warranties and insurance", icon: "House" },
  { key: "calendar", name: "Calendar", status: "planned", blurb: "Full calendar sync", icon: "Calendar" },
  { key: "finances", name: "Finances", status: "planned", blurb: "Bills and budgets", icon: "Grid" },
  { key: "health", name: "Health and wellness", status: "planned", blurb: "Habits and check-ins", icon: "Grid" },
  { key: "projects", name: "Personal projects", status: "planned", blurb: "Ideas and progress", icon: "Grid" },
];

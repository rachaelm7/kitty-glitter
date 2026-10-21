/**
 * Module registry. Drives the desktop side nav and the More screen.
 * "live" modules are functional; "preview" modules show sample content.
 */
export type ModuleStatus = "live" | "preview" | "planned";
export type ModuleEntry = {
  key: string;
  name: string;
  href?: string;
  status: ModuleStatus;
  blurb: string;
  icon: "Thread" | "Stethoscope" | "Plane" | "House" | "Wallet" | "Heart" | "Settings" | "Mic" | "Lifebuoy" | "Inbox" | "Tasks" | "Grid";
  tone: "accent" | "lavender" | "champagne";
};

export const MODULES: ModuleEntry[] = [
  { key: "threads", name: "Life Threads", href: "/threads", status: "live", blurb: "Every unfinished situation, in one place", icon: "Thread", tone: "accent" },
  { key: "appointments", name: "Appointments", href: "/appointments", status: "live", blurb: "Referrals, bookings and follow-ups", icon: "Stethoscope", tone: "lavender" },
  { key: "travel", name: "Travel", href: "/travel", status: "live", blurb: "Trips, bookings and packing", icon: "Plane", tone: "champagne" },
  { key: "home", name: "Home", href: "/home", status: "live", blurb: "Upkeep, insurance and warranties", icon: "House", tone: "lavender" },
  { key: "finances", name: "Finances", href: "/finances", status: "preview", blurb: "Bills and subscriptions at a glance", icon: "Wallet", tone: "champagne" },
  { key: "collections", name: "Personal Collections", href: "/collections", status: "preview", blurb: "Gift ideas, books, recipes and more", icon: "Heart", tone: "accent" },
  { key: "settings", name: "Settings", href: "/settings", status: "live", blurb: "Theme, accounts and demo data", icon: "Settings", tone: "lavender" },
  { key: "capture", name: "Brain Dump", href: "/capture", status: "live", blurb: "Type or talk, review before anything is added", icon: "Mic", tone: "accent" },
  { key: "rescue", name: "Email Rescue", href: "/inbox/rescue", status: "live", blurb: "A calm path through a huge unread pile", icon: "Lifebuoy", tone: "lavender" },
];

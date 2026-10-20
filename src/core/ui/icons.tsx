import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  width: 24,
  height: 24,
};

export const Icon = {
  /** Delicate cat silhouette with a sparkle: the Kitty Glitter mark. */
  Cat: (p: P) => (
    <svg {...base} {...p}>
      <path d="M5 9.5V4.5l3.6 3a8.6 8.6 0 0 1 6.8 0l3.6-3v5c.6 1 1 2.2 1 3.5 0 4-3.6 7-8 7s-8-3-8-7c0-1.3.4-2.5 1-3.5z" />
      <path d="M9.5 13.2h.01M14.5 13.2h.01M11 16c.6.5 1.4.5 2 0" />
      <path d="M20.5 1.8l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" fill="currentColor" stroke="none" />
    </svg>
  ),
  Archive: (p: P) => (
    <svg {...base} {...p}><rect x="3" y="4" width="18" height="5" rx="1.5" /><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4" /></svg>
  ),
  Mail: (p: P) => (
    <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></svg>
  ),
  MailOpen: (p: P) => (
    <svg {...base} {...p}><path d="M3 10l9-6 9 6v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M4 10.5l8 5.5 8-5.5" /></svg>
  ),
  Star: (p: P) => (
    <svg {...base} {...p}><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" /></svg>
  ),
  Pencil: (p: P) => (
    <svg {...base} {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg>
  ),
  Clock: (p: P) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  Wallet: (p: P) => (
    <svg {...base} {...p}><path d="M4 7a2 2 0 0 1 2-2h11v4" /><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M16 13.5h2" /></svg>
  ),
  Heart: (p: P) => (
    <svg {...base} {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
  ),
  Settings: (p: P) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.4M12 18.8v2.4M4.2 6.2l1.7 1.7M18.1 16.1l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.2 17.8l1.7-1.7M18.1 7.9l1.7-1.7" /></svg>
  ),
  Undo: (p: P) => (
    <svg {...base} {...p}><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
  ),
  Today: (p: P) => (
    <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
  ),
  Inbox: (p: P) => (
    <svg {...base} {...p}><path d="M3 13l3-8h12l3 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 13h5l1 3h6l1-3h5" /></svg>
  ),
  Tasks: (p: P) => (
    <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M8 12.5l3 3 5-6" /></svg>
  ),
  More: (p: P) => (
    <svg {...base} {...p}><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></svg>
  ),
  Check: (p: P) => (
    <svg {...base} strokeWidth={3} {...p}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
  ),
  Close: (p: P) => (
    <svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
  Search: (p: P) => (
    <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
  ),
  Plus: (p: P) => (
    <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
  ),
  Sparkle: (p: P) => (
    <svg {...base} {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z" /></svg>
  ),
  Mic: (p: P) => (
    <svg {...base} {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
  ),
  Shield: (p: P) => (
    <svg {...base} {...p}><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
  ),
  Thread: (p: P) => (
    <svg {...base} {...p}><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="12" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8.3 7.2l7.4 3.6M8.3 16.8l7.4-3.6" /></svg>
  ),
  Chevron: (p: P) => (
    <svg {...base} {...p}><path d="M9 6l6 6-6 6" /></svg>
  ),
  Back: (p: P) => (
    <svg {...base} {...p}><path d="M15 6l-6 6 6 6" /></svg>
  ),
  Calendar: (p: P) => (
    <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4M8 14h3" /></svg>
  ),
  Stethoscope: (p: P) => (
    <svg {...base} {...p}><path d="M6 3v6a4 4 0 0 0 8 0V3" /><path d="M10 13v2a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" /></svg>
  ),
  Plane: (p: P) => (
    <svg {...base} {...p}><path d="M10.5 13.5L3 11l1.5-1.5 8 1 4-4.5a2 2 0 0 1 3 3l-4.5 4 1 8L14.5 22 12 14.5l-3 3V20l-1.5 1-1-3.5L3 16.5 4 15h2.5z" /></svg>
  ),
  House: (p: P) => (
    <svg {...base} {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>
  ),
  Lifebuoy: (p: P) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" /></svg>
  ),
  Grid: (p: P) => (
    <svg {...base} {...p}><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></svg>
  ),
  Up: (p: P) => (
    <svg {...base} {...p}><path d="M6 15l6-6 6 6" /></svg>
  ),
  Down: (p: P) => (
    <svg {...base} {...p}><path d="M6 9l6 6 6-6" /></svg>
  ),
};

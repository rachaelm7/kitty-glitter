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

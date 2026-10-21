import type { Coverage, MaintenanceItem } from "./types";

// Fictional home data.
export const SEED_MAINTENANCE: MaintenanceItem[] = [
  { id: "h1", title: "Replace furnace filter", area: "Heating & air", everyDays: 90, lastDoneOffset: -104, how: "16×25×1 filter, arrow toward the furnace" },
  { id: "h2", title: "Test smoke and CO detectors", area: "Safety", everyDays: 30, lastDoneOffset: -26, how: "Press and hold the test button on each unit" },
  { id: "h3", title: "Clean dishwasher filter", area: "Kitchen", everyDays: 30, lastDoneOffset: -12 },
  { id: "h4", title: "Clear gutters", area: "Outside", everyDays: 180, lastDoneOffset: -170, how: "Before the late-autumn rains" },
  { id: "h5", title: "Flush water heater", area: "Plumbing", everyDays: 365, lastDoneOffset: -120 },
];

export const SEED_COVERAGE: Coverage[] = [
  { id: "c1", kind: "insurance", title: "Auto insurance", provider: "Harborline Auto Insurance", endsOffset: 14, amount: "$612 / 6 mo", note: "Renews automatically; review the quote first", threadId: "t-car" },
  { id: "c2", kind: "insurance", title: "Renters insurance", provider: "Keystone Mutual", endsOffset: 118, amount: "$184 / yr", note: "Covers personal property and liability" },
  { id: "c3", kind: "warranty", title: "Dishwasher warranty", provider: "Brightline Appliances", endsOffset: 53, note: "Register any repair before it ends" },
  { id: "c4", kind: "warranty", title: "Laptop protection plan", provider: "Pixel Plus Store", endsOffset: 210, note: "Accidental damage, one claim per year" },
];

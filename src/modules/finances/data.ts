// Fictional household money picture for the preview.
export const MONTH_BILLS = [
  { id: "f1", name: "Rent", amount: 1650, dayOfMonth: 1, autopay: true },
  { id: "f2", name: "Riverbend Power & Light", amount: 86.4, dayOfMonth: 28, autopay: true },
  { id: "f3", name: "Clearwave Internet", amount: 59.99, dayOfMonth: 15, autopay: true },
  { id: "f4", name: "Sapphire Card", amount: 1284.5, dayOfMonth: 6, autopay: false },
  { id: "f5", name: "Auto insurance (sample)", amount: 102, dayOfMonth: 3, autopay: true },
];

export const SUBSCRIPTIONS = [
  { id: "s1", name: "Streaming bundle", amount: 22.99, lastUsedDaysAgo: 2 },
  { id: "s2", name: "Cloud photo storage", amount: 2.99, lastUsedDaysAgo: 1 },
  { id: "s3", name: "Language app", amount: 12.99, lastUsedDaysAgo: 64 },
  { id: "s4", name: "Whisker & Co. cat food", amount: 38, lastUsedDaysAgo: 0 },
];

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

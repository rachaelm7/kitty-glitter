export type MaintenanceItem = {
  id: string;
  title: string;
  area: "Heating & air" | "Kitchen" | "Safety" | "Outside" | "Plumbing";
  everyDays: number;
  lastDoneOffset: number; // negative: days ago
  how?: string;
  threadId?: string;
};

export type Coverage = {
  id: string;
  kind: "insurance" | "warranty";
  title: string;
  provider: string; // fictional
  endsOffset: number; // renewal or expiry, days from today
  amount?: string;
  note: string;
  threadId?: string;
};

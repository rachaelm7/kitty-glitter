export type Reservation = {
  id: string;
  kind: "flight" | "stay" | "dining" | "activity" | "transport";
  title: string;
  dayIndex: number; // 0 = first day of the trip
  time?: string;
  detail: string;
  confirmation: string; // fictional code
};

export type PackItem = { id: string; label: string; group: "Documents" | "Clothes" | "Toiletries" | "Tech" | "Other"; packed: boolean };

export type Trip = {
  id: string;
  name: string;
  destination: string;
  startOffset: number; // days from today
  nights: number;
  threadId?: string;
  reservations: Reservation[];
  packing: PackItem[];
};

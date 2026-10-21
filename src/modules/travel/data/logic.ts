import type { PackItem, Trip } from "./types";

export function packingProgress(items: PackItem[]) {
  const packed = items.filter((i) => i.packed).length;
  return { packed, total: items.length, pct: items.length ? Math.round((packed / items.length) * 100) : 0 };
}

export function groupPacking(items: PackItem[]) {
  const order: PackItem["group"][] = ["Documents", "Clothes", "Toiletries", "Tech", "Other"];
  return order.map((g) => ({ group: g, items: items.filter((i) => i.group === g) })).filter((g) => g.items.length);
}

/** Days of the trip with their reservations, for the itinerary. */
export function itinerary(trip: Trip) {
  return Array.from({ length: trip.nights + 2 }, (_, i) => ({
    dayIndex: i,
    offset: trip.startOffset + i,
    items: trip.reservations.filter((r) => r.dayIndex === i),
  })).filter((d) => d.items.length);
}

/** Simple, non-invented reminders based only on the trip's own dates and list. */
export function tripReminders(trip: Trip): string[] {
  const out: string[] = [];
  const docs = trip.packing.filter((p) => p.group === "Documents" && !p.packed);
  if (docs.length) out.push(`Still to pack: ${docs.map((d) => d.label.toLowerCase()).join(", ")}.`);
  const flight = trip.reservations.find((r) => r.kind === "flight" && r.dayIndex === 0);
  if (flight && trip.startOffset <= 2 && trip.startOffset >= 1) out.push("Online check-in is open for your outbound flight.");
  if (trip.startOffset > 0 && trip.startOffset <= 7) out.push("Trip is this week. Check the weather and your bookings.");
  return out;
}

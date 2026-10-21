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
  return Array.from({ length: tripDayCount(trip) }, (_, i) => ({
    dayIndex: i,
    offset: trip.startOffset + i,
    items: trip.reservations.filter((r) => r.dayIndex === i),
  })).filter((d) => d.items.length);
}

/** "Passport" → "passport", but "ID or passport" keeps its capitals. */
function lowerFirst(s: string) {
  return /^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

/** Simple, non-invented reminders based only on the trip's own dates and list. */
export function tripReminders(trip: Trip): string[] {
  const out: string[] = [];
  const docs = trip.packing.filter((p) => p.group === "Documents" && !p.packed);
  if (docs.length) out.push(`Still to pack: ${docs.map((d) => lowerFirst(d.label)).join(", ")}.`);
  const flight = trip.reservations.find((r) => r.kind === "flight" && r.dayIndex === 0);
  if (flight && trip.startOffset <= 2 && trip.startOffset >= 1) out.push("Online check-in is open for your outbound flight.");
  if (trip.startOffset > 0 && trip.startOffset <= 7) out.push("Trip is this week. Check the weather and your bookings.");
  return out;
}

/** Bookings can fall from the departure day through the day after the last night (a late flight home). */
export function tripDayCount(trip: Pick<Trip, "nights">) {
  return trip.nights + 2;
}

export type TripDraft = { name: string; destination: string; start: string; nights: string };
export type TripErrors = Partial<Record<"name" | "destination" | "start" | "nights", string>>;
export const MAX_NIGHTS = 60;

export function validateTrip(d: TripDraft): TripErrors {
  const e: TripErrors = {};
  if (!d.name.trim()) e.name = "Give the trip a name, like “Lisbon getaway”.";
  if (!d.destination.trim()) e.destination = "Add where you're going.";
  if (!d.start) e.start = "Pick the day you leave.";
  const n = Number(d.nights);
  if (d.nights.trim() === "" || !Number.isInteger(n) || n < 0 || n > MAX_NIGHTS) e.nights = `Enter a whole number of nights from 0 to ${MAX_NIGHTS}.`;
  return e;
}

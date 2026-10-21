"use client";

import { createStore } from "@/core/store/createStore";
import { SEED_TRIPS } from "./mock";
import type { PackItem, Reservation, Trip } from "./types";

export const tripStore = createStore<Trip[]>("trips", SEED_TRIPS, 1, {
  shift: (ts, d) => ts.map((t) => ({ ...t, startOffset: t.startOffset + d })),
});

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function updateOne(tripId: string, fn: (t: Trip) => Trip) {
  tripStore.set((ts) => ts.map((t) => (t.id === tripId ? fn(t) : t)));
}

export function togglePacked(tripId: string, itemId: string) {
  updateOne(tripId, (t) => ({ ...t, packing: t.packing.map((p) => (p.id === itemId ? { ...p, packed: !p.packed } : p)) }));
}

export function addPackItem(tripId: string, label: string, group: PackItem["group"]) {
  const clean = label.trim();
  if (!clean) return;
  updateOne(tripId, (t) => ({ ...t, packing: [...t.packing, { id: uid("p"), label: clean, group, packed: false }] }));
}

/** A short starter list for a new trip, so packing isn't a blank page. Edit or add to it freely. */
export const STARTER_PACKING: Omit<PackItem, "id">[] = [
  { label: "ID or passport", group: "Documents", packed: false },
  { label: "Booking confirmations", group: "Documents", packed: false },
  { label: "Phone charger", group: "Tech", packed: false },
  { label: "Toothbrush", group: "Toiletries", packed: false },
];

export type TripInput = Pick<Trip, "name" | "destination" | "startOffset" | "nights" | "threadId">;

export function addTrip(input: TripInput): string {
  const id = uid("trip");
  tripStore.set((ts) => [...ts, { ...input, id, reservations: [], packing: STARTER_PACKING.map((p) => ({ ...p, id: uid("p") })) }]);
  return id;
}

/** Shortening a trip keeps bookings that now fall after it; they move to its last day. */
export function updateTrip(id: string, patch: Partial<TripInput>) {
  updateOne(id, (t) => {
    const next = { ...t, ...patch };
    const lastDay = next.nights + 1;
    return { ...next, reservations: next.reservations.map((r) => (r.dayIndex > lastDay ? { ...r, dayIndex: lastDay } : r)) };
  });
}

export function removeTrip(id: string): () => void {
  const list = tripStore.get();
  const index = list.findIndex((t) => t.id === id);
  if (index < 0) return () => {};
  const removed = list[index];
  tripStore.set((ts) => ts.filter((t) => t.id !== id));
  return () => tripStore.set((ts) => (ts.some((t) => t.id === id) ? ts : [...ts.slice(0, index), removed, ...ts.slice(index)]));
}

export type ReservationInput = Omit<Reservation, "id">;

export function addReservation(tripId: string, input: ReservationInput): string {
  const id = uid("r");
  updateOne(tripId, (t) => ({ ...t, reservations: [...t.reservations, { ...input, id }] }));
  return id;
}

export function updateReservation(tripId: string, id: string, patch: Partial<ReservationInput>) {
  updateOne(tripId, (t) => ({ ...t, reservations: t.reservations.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
}

export function removeReservation(tripId: string, id: string): () => void {
  const trip = tripStore.get().find((t) => t.id === tripId);
  const index = trip?.reservations.findIndex((r) => r.id === id) ?? -1;
  if (!trip || index < 0) return () => {};
  const removed = trip.reservations[index];
  updateOne(tripId, (t) => ({ ...t, reservations: t.reservations.filter((r) => r.id !== id) }));
  return () =>
    updateOne(tripId, (t) => (t.reservations.some((r) => r.id === id) ? t : { ...t, reservations: [...t.reservations.slice(0, index), removed, ...t.reservations.slice(index)] }));
}

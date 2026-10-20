"use client";

import { createStore } from "@/core/store/createStore";
import { SEED_TRIPS } from "./mock";
import type { PackItem, Trip } from "./types";

export const tripStore = createStore<Trip[]>("trips", SEED_TRIPS);

export function togglePacked(tripId: string, itemId: string) {
  tripStore.set((ts) => ts.map((t) => (t.id === tripId ? { ...t, packing: t.packing.map((p) => (p.id === itemId ? { ...p, packed: !p.packed } : p)) } : t)));
}

export function addPackItem(tripId: string, label: string, group: PackItem["group"]) {
  const clean = label.trim();
  if (!clean) return;
  tripStore.set((ts) =>
    ts.map((t) => (t.id === tripId ? { ...t, packing: [...t.packing, { id: `p${Date.now().toString(36)}`, label: clean, group, packed: false }] } : t)),
  );
}

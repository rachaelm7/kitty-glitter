"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny persisted store. State lives in memory and is mirrored to
 * localStorage so the demo remembers changes on this device only.
 * The server always renders the seed, and the client swaps in saved
 * state right after hydration.
 */
export type Store<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  reset: () => void;
  seed: T;
};

const registry: Store<unknown>[] = [];

export type StoreOptions<T> = {
  persist?: boolean;
  /**
   * For state that stores dates as day offsets from "today". Saved state remembers the day
   * it was saved, and on load every offset is moved by the days since, so "in 2 days" saved
   * yesterday reads "tomorrow" today instead of staying frozen.
   */
  shift?: (state: T, days: number) => T;
};

type Saved<T> = { savedOn: string; state: T };

function localISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Whole days from one YYYY-MM-DD to another (local dates, so daylight saving can't skew it). */
export function daysBetweenISO(from: string, to: string) {
  const [a, b] = [from, to].map((s) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((b - a) / 86_400_000);
}

/** Reads saved JSON, moving day offsets forward when the store asks for it. */
export function revive<T>(raw: unknown, today: string, shift?: (state: T, days: number) => T): T {
  if (!shift) return raw as T;
  const saved = raw as Partial<Saved<T>>;
  if (!saved || typeof saved !== "object" || typeof saved.savedOn !== "string" || !("state" in saved)) return raw as T; // older save, no date
  const days = daysBetweenISO(today, saved.savedOn); // negative once time has passed
  return days ? shift(saved.state as T, days) : (saved.state as T);
}

export function createStore<T>(key: string, seed: T, version = 1, opts: StoreOptions<T> = {}): Store<T> {
  const persist = opts.persist ?? true;
  const storageKey = `kg:${key}:v${version}`;
  let state: T = seed;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    if (!persist) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) state = revive<T>(JSON.parse(raw), localISO(new Date()), opts.shift);
    } catch {
      // Storage can be unavailable (private mode); fall back to the seed.
    }
  }

  function save() {
    if (!persist) return;
    try {
      const value: T | Saved<T> = opts.shift ? { savedOn: localISO(new Date()), state } : state;
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Not saved; the demo still works for this visit.
    }
  }

  const store: Store<T> = {
    seed,
    get() {
      load();
      return state;
    },
    set(next) {
      load();
      state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
      save();
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      state = seed;
      loaded = true;
      try {
        window.localStorage.removeItem(storageKey);
      } catch {}
      listeners.forEach((l) => l());
    },
  };
  registry.push(store as Store<unknown>);
  return store;
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.seed);
}

/** Restore every module's sample data (used by More → Reset demo). */
export function resetAllStores() {
  registry.forEach((s) => s.reset());
}

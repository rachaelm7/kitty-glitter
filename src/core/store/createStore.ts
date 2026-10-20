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

export function createStore<T>(key: string, seed: T, version = 1, opts: { persist?: boolean } = {}): Store<T> {
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
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      // Storage can be unavailable (private mode); fall back to the seed.
    }
  }

  function save() {
    if (!persist) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
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

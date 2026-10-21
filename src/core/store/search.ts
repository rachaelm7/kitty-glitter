"use client";

import { createStore } from "./createStore";

/** Whether the quick switcher is open. In memory only; any screen can open it. */
export const searchStore = createStore<{ open: boolean }>("search-ui", { open: false }, 1, { persist: false });

export const openSearch = () => searchStore.set({ open: true });
export const closeSearch = () => searchStore.set({ open: false });

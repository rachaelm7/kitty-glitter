"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useStore } from "@/core/store/createStore";
import { openSearch, closeSearch, searchStore } from "@/core/store/search";

// One shared import, so the idle preload and the first open use the same downloaded chunk.
const loadSwitcher = () => import("./QuickSwitcher");

// The dialog and its search code load on first use, not with the page.
const QuickSwitcher = dynamic(loadSwitcher, { ssr: false });

/** Always mounted and tiny: listens for ⌘K / Ctrl+K and loads the dialog when it's first needed. */
export function SearchHost() {
  const open = useStore(searchStore).open;
  const [wanted, setWanted] = useState(false);

  // Load the dialog the first time it's opened, and keep it for later opens.
  if (open && !wanted) setWanted(true);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchStore.get().open) closeSearch();
        else openSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Warm the download when the browser is idle so the first open feels instant.
  useEffect(() => {
    const warm = () => void loadSwitcher();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm);
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, 2000);
    return () => window.clearTimeout(id);
  }, []);

  return wanted ? <QuickSwitcher /> : null;
}

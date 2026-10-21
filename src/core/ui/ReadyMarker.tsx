"use client";

import { useEffect } from "react";

/**
 * Sets data-ready on <html> once the app has started in the browser (event
 * listeners attached). Automated tests wait for it before pressing keys, so a
 * slow machine can't make them type into a page that isn't listening yet.
 */
export function ReadyMarker() {
  useEffect(() => {
    document.documentElement.dataset.ready = "true";
  }, []);
  return null;
}

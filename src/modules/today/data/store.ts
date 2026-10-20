"use client";

import { createStore } from "@/core/store/createStore";
import { DEFAULT_LAYOUT, type Layout } from "./layout";

/** Which "Needs you" items are checked off today. */
export const needsDoneStore = createStore<Record<string, boolean>>("today-needs", {});

export const layoutStore = createStore<Layout>("today-layout", DEFAULT_LAYOUT);

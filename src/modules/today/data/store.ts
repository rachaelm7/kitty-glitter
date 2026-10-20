"use client";

import { createStore } from "@/core/store/createStore";

/** Which "Needs you" items are checked off today. */
export const needsDoneStore = createStore<Record<string, boolean>>("today-needs", {});

"use client";

import { createStore } from "@/core/store/createStore";

/** The unsent brain dump text, so nothing is lost if you leave the screen. */
export const draftStore = createStore<string>("capture-draft", "");

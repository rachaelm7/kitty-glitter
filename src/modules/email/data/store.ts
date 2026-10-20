"use client";

import { createStore } from "@/core/store/createStore";
import type { CleanupChoice } from "./types";

/** Per-sender cleanup choices. Choosing never changes any mailbox. */
export const cleanupStore = createStore<Record<string, CleanupChoice | undefined>>("email-cleanup", {});

/** Edited reply drafts, keyed by message id. Drafts are never sent. */
export const draftStore = createStore<Record<string, string>>("email-drafts", {});

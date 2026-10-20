// Public API of Life Threads (data and a tag). Screens that combine threads
// with other modules live in modules/hub.
export type { LifeThread, ThreadNote } from "./data/types";
export { threadStore, threadNoteStore, createThread, addThreadNote } from "./data/store";
export { ThreadTag } from "./components/ThreadTag";

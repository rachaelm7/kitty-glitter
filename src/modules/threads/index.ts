// Public API of Life Threads (data and a tag). Screens that combine threads
// with other modules live in modules/hub.
export type { LifeThread, ThreadNote, ThreadEvent, ThreadStage } from "./data/types";
export { threadStore, threadNoteStore, createThread, updateThread, addThreadNote, removeThreadNote } from "./data/store";
export { ThreadTag } from "./components/ThreadTag";
export { SEED_THREADS } from "./data/mock";

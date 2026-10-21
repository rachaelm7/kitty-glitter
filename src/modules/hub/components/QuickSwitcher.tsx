"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useStore } from "@/core/store/createStore";
import { requestOpen } from "@/core/store/intent";
import { closeSearch, searchStore } from "@/core/store/search";
import { cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { inboxStateStore, markRead } from "@/modules/email";
import { maintenanceStore } from "@/modules/home";
import { threadStore } from "@/modules/threads";
import { pushRecent, recentStore } from "../data/recent";
import { KIND_LABEL, buildIndex, defaultResults, normalize, rank, type SearchItem, type SearchKind } from "../data/search";
import { useThreadSources } from "./useThreadSources";

const KIND_ICON: Record<SearchKind, keyof typeof Icon> = {
  page: "Grid",
  email: "Mail",
  task: "Tasks",
  thread: "Thread",
  appointment: "Stethoscope",
  trip: "Plane",
  upkeep: "House",
};

/** The search dialog. Loaded on demand by SearchHost, so it isn't in the first page load. */
export default function QuickSwitcher() {
  const open = useStore(searchStore).open;
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const src = useThreadSources();
  const inbox = useStore(inboxStateStore);
  const threads = useStore(threadStore);
  const upkeep = useStore(maintenanceStore);
  const recent = useStore(recentStore);

  // One index per open, from data already in memory; ranking per keystroke is linear and cheap.
  const index = useMemo(
    () => (open ? buildIndex({ messages: src.messages, archived: inbox.archived, read: inbox.read, tasks: src.tasks, threads, appointments: src.appointments, trips: src.trips, upkeep }) : []),
    [open, src.messages, src.tasks, src.appointments, src.trips, inbox, threads, upkeep],
  );
  const trimmed = query.trim();
  const results = useMemo(() => (trimmed ? rank(index, trimmed) : defaultResults(index, recent)), [index, trimmed, recent]);
  const current = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      inputRef.current?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    document.getElementById(`${listId}-${current}`)?.scrollIntoView({ block: "nearest" });
  }, [current, listId]);

  function reset() {
    setQuery("");
    setActive(0);
  }

  function go(item: SearchItem) {
    pushRecent(item.id);
    closeSearch();
    reset();
    const t = item.target;
    if (t.type === "email") {
      markRead(t.id);
      requestOpen({ email: t.id });
      router.push("/inbox");
    } else if (t.type === "task") {
      requestOpen({ task: t.id });
      router.push("/tasks");
    } else {
      router.push(t.href);
    }
  }

  const tokens = normalize(trimmed).split(" ").filter(Boolean);
  const activeItem = results[current];

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search everything"
      onClose={() => {
        closeSearch();
        reset();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) closeSearch();
      }}
      className="kg-sheet m-0 mx-auto mt-[10dvh] w-[min(94vw,640px)] max-w-none overflow-hidden rounded-3xl bg-surface p-0 text-ink shadow-lift backdrop:bg-scrim"
    >
      {open && (
        <div>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Icon.Search className="flex-none text-muted" width={20} height={20} />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeItem ? `${listId}-${current}` : undefined}
              aria-label="Search emails, tasks, threads, appointments and pages"
              value={query}
              placeholder="Search emails, tasks, threads…"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive(results.length ? (current + 1) % results.length : 0);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive(results.length ? (current - 1 + results.length) % results.length : 0);
                } else if (e.key === "Enter" && activeItem) {
                  e.preventDefault();
                  go(activeItem);
                }
              }}
              className="min-h-14 min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted"
            />
            <button type="button" onClick={closeSearch} aria-label="Close search" className="grid size-10 flex-none place-items-center rounded-full text-muted hover:bg-surface-2">
              <Icon.Close width={18} height={18} />
            </button>
          </div>

          <p role="status" className="sr-only">
            {trimmed ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Recent items and pages"}
          </p>

          {results.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="font-display text-lg font-semibold">No matches for “{trimmed}”</p>
              <p className="mt-1 text-sm text-muted">Try fewer words, a sender&apos;s name, or a place like Lisbon.</p>
            </div>
          ) : (
            <>
              {!trimmed && <p className="px-5 pt-3 text-xs font-bold tracking-wide text-muted uppercase">{recent.length ? "Recent and quick links" : "Quick links"}</p>}
              <ul id={listId} role="listbox" aria-label="Results" className="max-h-[min(52dvh,420px)] overflow-y-auto p-2">
                {results.map((r, i) => {
                  const I = Icon[KIND_ICON[r.kind]];
                  return (
                    <li
                      key={r.id}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === current}
                      onMouseMove={() => i !== current && setActive(i)}
                      onClick={() => go(r)}
                      className={cx("flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2", i === current ? "bg-accent-soft" : "hover:bg-surface-2")}
                    >
                      <span className={cx("grid size-9 flex-none place-items-center rounded-xl", i === current ? "bg-surface text-accent" : "bg-surface-2 text-muted")}>
                        <I width={18} height={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">
                          <Highlight text={r.title} tokens={tokens} />
                        </span>
                        {r.subtitle && <span className="block truncate text-sm text-muted">{r.subtitle}</span>}
                      </span>
                      <span className="flex-none text-xs text-muted">{KIND_LABEL[r.kind]}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <p className="hidden items-center justify-center gap-4 border-t border-line px-4 py-2.5 text-xs text-muted sm:flex">
            <span>
              <kbd className="rounded bg-surface-2 px-1">↑</kbd> <kbd className="rounded bg-surface-2 px-1">↓</kbd> move
            </span>
            <span>
              <kbd className="rounded bg-surface-2 px-1">Enter</kbd> open
            </span>
            <span>
              <kbd className="rounded bg-surface-2 px-1">Esc</kbd> close
            </span>
          </p>
        </div>
      )}
    </dialog>
  );
}

/** Bolds the typed words inside a title. Accent-insensitive matches simply aren't bolded. */
function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;
  const re = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-champagne-soft px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

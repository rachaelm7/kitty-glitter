"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useStore } from "@/core/store/createStore";
import { requestOpen } from "@/core/store/intent";
import { closeSearch, searchStore } from "@/core/store/search";
import { setTheme } from "@/core/theme/theme";
import { cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { inboxStateStore, markRead } from "@/modules/email";
import { maintenanceStore } from "@/modules/home";
import { threadStore } from "@/modules/threads";
import { pushRecent, recentStore } from "../data/recent";
import { KIND_LABEL, browse, buildIndex, defaultResults, parseQuery, queryTokens, rank, type SearchItem, type SearchKind } from "../data/search";
import { useThreadSources } from "./useThreadSources";

const KIND_ICON: Record<SearchKind, keyof typeof Icon> = {
  page: "Grid",
  action: "Sparkle",
  email: "Mail",
  task: "Tasks",
  thread: "Thread",
  appointment: "Stethoscope",
  trip: "Plane",
  upkeep: "House",
};

/** Filter chips, for phones where typing "#email" is awkward. */
const FILTERS: { kind: SearchKind; label: string }[] = [
  { kind: "email", label: "Email" },
  { kind: "task", label: "Tasks" },
  { kind: "thread", label: "Threads" },
  { kind: "appointment", label: "Appointments" },
  { kind: "trip", label: "Trips" },
  { kind: "upkeep", label: "Home" },
  { kind: "action", label: "Actions" },
];

const THEME_TOAST = { "theme-dark": "Dark theme on", "theme-light": "Light theme on", "theme-auto": "Theme now matches your device" } as const;

/**
 * The search dialog. Loaded on demand by SearchHost, so it isn't in the first page load.
 * This shell is cheap: it only watches the open flag. The heavy parts (index, ranking,
 * subscriptions to your data) live in Panel and exist only while the dialog is open.
 */
export default function QuickSwitcher() {
  const open = useStore(searchStore).open;
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close(); // native close returns focus to what opened it
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search everything"
      onCancel={closeSearch} // Escape: update our state right away, not a tick later when "close" fires
      onClose={closeSearch}
      onClick={(e) => {
        if (e.target === dialogRef.current) closeSearch();
      }}
      className="kg-sheet m-0 mx-auto mt-[10dvh] w-[min(94vw,640px)] max-w-none overflow-hidden rounded-3xl bg-surface p-0 text-ink shadow-lift backdrop:bg-scrim"
    >
      {open && <Panel />}
    </dialog>
  );
}

function Panel() {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<SearchKind | undefined>();
  // The highlighted row is remembered together with the query it belongs to, so a new
  // query always starts at the top without an effect.
  const [cursor, setCursor] = useState({ q: "", i: 0 });

  const src = useThreadSources();
  const inbox = useStore(inboxStateStore);
  const threads = useStore(threadStore);
  const upkeep = useStore(maintenanceStore);
  const recent = useStore(recentStore);

  // One index per open, from data already in memory; ranking per keystroke is linear and cheap.
  const index = useMemo(
    () => buildIndex({ messages: src.messages, archived: inbox.archived, read: inbox.read, tasks: src.tasks, threads, appointments: src.appointments, trips: src.trips, upkeep }),
    [src.messages, src.tasks, src.appointments, src.trips, inbox, threads, upkeep],
  );
  const parsed = parseQuery(query);
  const text = parsed.text;
  const kind = parsed.kind ?? chip; // a typed "#email" or ">" wins over the chips
  const results = useMemo(
    () => (text ? rank(index, text, 30, kind) : kind ? browse(index, kind) : defaultResults(index, recent)),
    [index, text, kind, recent],
  );
  const cursorKey = `${kind ?? ""}|${text}`;
  const current = Math.min(cursor.q === cursorKey ? cursor.i : 0, Math.max(results.length - 1, 0));
  const setActive = (i: number) => setCursor({ q: cursorKey, i });

  function pickFilter(next: SearchKind | undefined) {
    if (parsed.kind) setQuery(text); // drop the typed shorthand so the chip and the text agree
    setChip(next);
    inputRef.current?.focus();
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.getElementById(`${listId}-${current}`)?.scrollIntoView({ block: "nearest" });
  }, [current, listId]);

  // On a phone the chips scroll sideways; keep the active one in sight (e.g. "Actions" after typing ">").
  const chipsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chipsRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [kind]);

  function go(item: SearchItem) {
    pushRecent(item.id);
    closeSearch();
    const t = item.target;
    if (t.type === "email") {
      markRead(t.id); // opening it from search counts as reading it, like opening it in the Inbox
      requestOpen({ email: t.id });
      router.push("/inbox");
    } else if (t.type === "task") {
      requestOpen({ task: t.id });
      router.push("/tasks");
    } else if (t.type === "appointment") {
      requestOpen({ appointment: t.id });
      router.push("/appointments");
    } else if (t.type === "trip") {
      requestOpen({ trip: t.id });
      router.push("/travel");
    } else if (t.type === "action") {
      if (t.action === "theme-dark" || t.action === "theme-light" || t.action === "theme-auto") {
        setTheme(t.action === "theme-dark" ? "dark" : t.action === "theme-light" ? "light" : "auto");
        toast(THEME_TOAST[t.action]);
      } else {
        requestOpen({ create: t.action === "new-task" ? "task" : t.action === "new-appointment" ? "appointment" : "trip" });
        if (t.href) router.push(t.href);
      }
    } else {
      router.push(t.href);
    }
  }

  const tokens = queryTokens(text);
  const filterLabel = kind && (FILTERS.find((f) => f.kind === kind)?.label ?? KIND_LABEL[kind]);
  const activeItem = results[current];
  const hasResults = results.length > 0;

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Icon.Search className="flex-none text-muted" width={20} height={20} />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={hasResults}
          aria-controls={hasResults ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeItem ? `${listId}-${current}` : undefined}
          aria-label="Search emails, tasks, threads, appointments and pages"
          value={query}
          maxLength={120}
          placeholder={kind === "action" ? "Type an action, like “new trip”" : "Search, or type > for actions"}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return; // Enter while composing text (IME) must not open a result
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive(hasResults ? (current + 1) % results.length : 0);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive(hasResults ? (current - 1 + results.length) % results.length : 0);
            } else if (e.key === "Enter" && activeItem) {
              e.preventDefault();
              go(activeItem);
            }
          }}
          className="min-h-14 min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted"
        />
        <button type="button" onClick={closeSearch} aria-label="Close search" className="grid size-11 flex-none place-items-center rounded-full text-muted hover:bg-surface-2">
          <Icon.Close width={18} height={18} />
        </button>
      </div>

      <div ref={chipsRef} role="group" aria-label="Filter results" className="flex gap-1.5 overflow-x-auto border-b border-line px-3 py-2 [scrollbar-width:none]">
        {[{ kind: undefined, label: "All" }, ...FILTERS].map((f) => (
          <button
            key={f.label}
            type="button"
            aria-pressed={kind === f.kind}
            onClick={() => pickFilter(f.kind)}
            className={cx(
              "min-h-9 flex-none rounded-full border-[1.5px] px-3 text-[13px] font-semibold",
              kind === f.kind ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink hover:bg-surface-2",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p role="status" className="sr-only">
        {text || kind ? `${results.length} ${results.length === 1 ? "result" : "results"}${filterLabel ? ` in ${filterLabel}` : ""}` : "Recent items and pages"}
      </p>

      {!hasResults ? (
        <div className="px-6 py-10 text-center">
          <p className="font-display text-lg font-semibold">
            {text ? `No matches for “${text}”` : "Nothing here yet"}
            {filterLabel && ` in ${filterLabel}`}
          </p>
          <p className="mt-1 text-sm text-muted">
            {kind ? (
              <button type="button" onClick={() => pickFilter(undefined)} className="font-semibold text-accent underline-offset-2 hover:underline">
                Search everything instead
              </button>
            ) : (
              "Try fewer words, a sender's name, or a place like Lisbon."
            )}
          </p>
        </div>
      ) : (
        <>
          {!text && !kind && <p className="px-5 pt-3 text-xs font-bold tracking-wide text-muted uppercase">{recent.length ? "Recent and quick links" : "Quick links"}</p>}
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
          <kbd className="rounded bg-surface-2 px-1">&gt;</kbd> actions
        </span>
        <span>
          <kbd className="rounded bg-surface-2 px-1">#task</kbd> filter
        </span>
        <span>
          <kbd className="rounded bg-surface-2 px-1">Esc</kbd> close
        </span>
      </p>
    </div>
  );
}

/** Bolds the typed words inside a title. Accent-insensitive matches simply aren't bolded. */
function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;
  const longestFirst = [...tokens].sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${longestFirst.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
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

"use client";

import { useStore } from "@/core/store/createStore";
import { cx } from "@/core/ui/primitives";
import { mockEmailProvider } from "../data/mock";
import { cleanupStore } from "../data/store";
import type { CleanupChoice } from "../data/types";
import { AccountDot } from "./AccountDot";

const OPTIONS: { value: CleanupChoice; label: string }[] = [
  { value: "unsubscribe", label: "Unsubscribe" },
  { value: "spam", label: "Mark spam" },
  { value: "keep", label: "Keep" },
];

export function CleanupChooser() {
  const choices = useStore(cleanupStore);
  const senders = mockEmailProvider.listPromoSenders();

  return (
    <div className="mt-4">
      <p className="text-sm text-muted">
        Newsletters and promotions you rarely open. Pick an action for each sender. Nothing happens until you review and confirm.
      </p>
      <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface px-4">
        {senders.map((s) => {
          const current = choices[s.id];
          return (
            <li key={s.id} className="py-3.5">
              <div className="flex items-center gap-2">
                <AccountDot account={s.account} />
                <b className="font-semibold">{s.name}</b>
              </div>
              <p className="text-sm text-muted">
                {s.count} emails · {s.lastOpenedDaysAgo === null ? "never opened" : `last opened ${s.lastOpenedDaysAgo} days ago`}
              </p>
              <div role="radiogroup" aria-label={`Action for ${s.name}`} className="mt-2 flex gap-1.5">
                {OPTIONS.map((o) => {
                  const on = current === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => cleanupStore.set((c) => ({ ...c, [s.id]: on ? undefined : o.value }))}
                      className={cx(
                        "min-h-10 flex-1 rounded-xl border-[1.5px] px-1 text-[13px] font-semibold transition-colors sm:text-sm",
                        !on && "border-line bg-surface hover:bg-surface-2",
                        on && o.value === "spam" && "border-urgent bg-urgent text-urgent-ink",
                        on && o.value !== "spam" && "border-accent bg-accent text-accent-ink",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { useStore } from "@/core/store/createStore";
import { CheckCircle, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { emailProvider } from "@/modules/email";
import type { NeedItem } from "../../data/brief";
import { needsDoneStore } from "../../data/store";
import { Frame } from "./Frame";

const MAX_NEEDS = 3;

export function useNeeds(): NeedItem[] {
  return emailProvider
    .listMessages()
    .filter((m) => m.urgent)
    .slice(0, MAX_NEEDS)
    .map((m) => ({ id: m.id, title: m.actionTitle ?? m.subject, who: m.from, when: m.deadline?.label ?? "Soon" }));
}

export function NeedsWidget() {
  const done = useStore(needsDoneStore);
  const needs = useNeeds();
  const left = needs.filter((n) => !done[n.id]).length;

  return (
    <Frame id="needs" title="Needs you" action={<span className="text-sm text-muted">{left} of {needs.length} left</span>}>
      {left === 0 && (
        <p className="mb-2.5 flex items-center gap-2 rounded-2xl bg-accent-soft p-3.5 font-semibold text-accent animate-rise">
          <Icon.Sparkle className="animate-pop" /> All clear. Nicely done.
        </p>
      )}
      <ul className="space-y-2.5">
        {needs.map((n) => {
          const checked = !!done[n.id];
          return (
            <li
              key={n.id}
              className={cx(
                "flex items-start gap-3 rounded-2xl border-l-[5px] p-3.5 transition-[background-color,opacity] duration-300",
                checked ? "border-l-line bg-transparent opacity-60" : "border-l-urgent bg-urgent-soft",
              )}
            >
              <CheckCircle
                tone="urgent"
                checked={checked}
                onToggle={() => needsDoneStore.set((d) => ({ ...d, [n.id]: !checked }))}
                label={`${checked ? "Mark not done" : "Mark done"}: ${n.title}`}
              />
              <div className="min-w-0">
                <p className={cx("text-[13px] font-semibold", checked ? "text-muted" : "text-urgent")}>{n.when}</p>
                <p className={cx("font-semibold", checked && "line-through")}>{n.title}</p>
                <p className="text-sm text-muted">{n.who}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

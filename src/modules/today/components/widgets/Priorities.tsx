"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/core/store/createStore";
import { requestOpen } from "@/core/store/intent";
import { CheckCircle, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { emailProvider, markRead } from "@/modules/email";
import { ThreadTag } from "@/modules/threads";
import type { NeedItem } from "../../data/brief";
import { needsDoneStore } from "../../data/store";
import { Frame } from "./Frame";

const MAX = 3;

/** The three things worth attention today, drawn from urgent fictional mail. */
export function usePriorities(): (NeedItem & { emailId: string })[] {
  return emailProvider
    .listMessages()
    .filter((m) => m.urgent)
    .slice(0, MAX)
    .map((m) => ({ id: m.id, emailId: m.id, title: m.actionTitle ?? m.subject, who: m.from, when: m.deadline?.label ?? "Waiting on you", briefLine: m.briefLine, threadId: m.threadId }));
}

export function PrioritiesWidget() {
  const done = useStore(needsDoneStore);
  const items = usePriorities();
  const router = useRouter();
  const left = items.filter((n) => !done[n.id]).length;

  return (
    <Frame id="priorities" title="Three priorities" action={<span className="text-sm text-muted">{left} of {items.length} left</span>}>
      {left === 0 && (
        <p className="mb-2.5 flex items-center gap-2 rounded-2xl bg-accent-soft p-3.5 font-semibold text-accent animate-rise">
          <Icon.Cat className="animate-pop" /> All clear. Nicely done.
        </p>
      )}
      <ol className="space-y-2.5">
        {items.map((n, i) => {
          const checked = !!done[n.id];
          return (
            <li
              key={n.id}
              className={cx(
                "flex items-start gap-3 rounded-[22px] border p-3.5 transition-[background-color,opacity] duration-300",
                checked ? "border-line bg-transparent opacity-60" : "border-urgent/25 bg-urgent-soft",
              )}
            >
              <CheckCircle
                tone="urgent"
                checked={checked}
                onToggle={() => needsDoneStore.set((d) => ({ ...d, [n.id]: !checked }))}
                label={`${checked ? "Mark not done" : "Mark done"}: ${n.title}`}
              />
              <div className="min-w-0 flex-1">
                <p className={cx("text-[13px] font-semibold", checked ? "text-muted" : "text-urgent")}>
                  {i + 1}. {n.when}
                </p>
                <p className={cx("font-semibold", checked && "line-through")}>{n.title}</p>
                <p className="text-sm text-muted">{n.who}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      markRead(n.emailId);
                      requestOpen({ email: n.emailId });
                      router.push("/inbox");
                    }}
                    className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface px-3 text-xs font-semibold shadow-soft hover:bg-surface-2"
                  >
                    <Icon.Mail width={14} height={14} /> Open email
                  </button>
                  {n.threadId && <ThreadTag id={n.threadId} />}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-muted">
        Suggested from fictional sample mail. <Link href="/inbox" className="font-semibold text-accent hover:underline">See everything</Link>
      </p>
    </Frame>
  );
}

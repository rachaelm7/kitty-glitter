"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestOpen } from "@/core/store/intent";
import { Card, EmptyState, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { markRead } from "@/modules/email";
import { useChanges, type Change } from "@/modules/hub";
import { Frame } from "./Frame";

const ICON: Record<Change["kind"], keyof typeof Icon> = { email: "Mail", update: "Thread", finished: "Check", waiting: "Clock" };
const SHOWN = 4;

/** What moved since yesterday. Every line opens the email or thread behind it. */
export function ChangesWidget() {
  const { changes } = useChanges();
  const router = useRouter();
  const [all, setAll] = useState(false);
  const shown = all ? changes : changes.slice(0, SHOWN);

  return (
    <Frame id="changes" title="Since yesterday" action={<span className="text-sm text-muted">{changes.length} {changes.length === 1 ? "update" : "updates"}</span>}>
      {changes.length === 0 ? (
        <EmptyState title="Nothing new" icon={<Icon.Cat />}>
          Quiet since yesterday. Enjoy it.
        </EmptyState>
      ) : (
        <Card className="py-1">
          <ul>
            {shown.map((c) => {
              const I = Icon[ICON[c.kind]];
              const when = c.kind === "waiting" ? "Pending" : c.dayOffset === 0 ? "Today" : "Yesterday";
              const inner = (
                <>
                  <span className={cx("mt-0.5 grid size-8 flex-none place-items-center rounded-full", c.urgent ? "bg-urgent-soft text-urgent" : c.kind === "waiting" ? "bg-lavender-soft text-lavender" : "bg-accent-soft text-accent")}>
                    <I width={16} height={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{c.text}</span>
                    {c.detail && <span className="block truncate text-sm text-muted">{c.detail}</span>}
                  </span>
                  <span className="flex-none pt-0.5 text-xs text-muted">{when}</span>
                </>
              );
              const row = "flex w-full items-start gap-3 py-3 text-left";
              return (
                <li key={c.id} className="border-b border-line last:border-b-0">
                  {c.emailId ? (
                    <button
                      type="button"
                      className={row}
                      onClick={() => {
                        markRead(c.emailId!);
                        requestOpen({ email: c.emailId });
                        router.push("/inbox");
                      }}
                    >
                      {inner}
                    </button>
                  ) : (
                    <Link href={c.threadId ? `/threads/${c.threadId}` : "/tasks"} className={row}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          {changes.length > SHOWN && (
            <button type="button" onClick={() => setAll((a) => !a)} className="w-full border-t border-line py-2.5 text-sm font-semibold text-accent hover:underline">
              {all ? "Show fewer" : `Show ${changes.length - SHOWN} more`}
            </button>
          )}
        </Card>
      )}
    </Frame>
  );
}

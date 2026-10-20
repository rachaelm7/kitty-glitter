"use client";

import { addDays, formatDay, untilLabel, useNow } from "@/core/date";
import { Card, EmptyState, Tag } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { RENEWALS } from "@/modules/bills";
import { Frame } from "./Frame";

export function UpcomingWidget() {
  const now = useNow();
  const upcoming = [...RENEWALS].filter((r) => r.dayOffset >= 0).sort((a, b) => a.dayOffset - b.dayOffset);
  return (
    <Frame id="upcoming" title="Coming up">
      {upcoming.length === 0 ? (
        <EmptyState title="No bills or renewals ahead" icon={<Icon.Calendar />} />
      ) : (
        <Card className="py-1">
          <ul>
            {upcoming.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <span className="min-w-0">
                  <span className="block truncate">{r.title}</span>
                  {r.amount && <span className="text-sm text-muted">{r.amount}</span>}
                </span>
                <span className="flex flex-none flex-col items-end">
                  <b className="font-semibold">{formatDay(addDays(now, r.dayOffset))}</b>
                  <Tag tone={r.dayOffset <= 7 ? "urgent" : "neutral"}>{untilLabel(r.dayOffset)}</Tag>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Frame>
  );
}

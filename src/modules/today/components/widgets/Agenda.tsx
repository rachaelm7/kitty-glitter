"use client";

import { useNow } from "@/core/date";
import { Card, cx } from "@/core/ui/primitives";
import { AGENDA, formatTime } from "@/modules/calendar";
import { Frame } from "./Frame";

export function AgendaWidget() {
  const now = useNow();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  let current = -1;
  AGENDA.forEach((a, i) => {
    if (a.hour * 60 + a.minute <= minutesNow) current = i;
  });
  return (
    <Frame id="agenda" title="Today">
      <Card className="py-1">
        <ol>
          {AGENDA.map((a, i) => (
            <li
              key={a.id}
              aria-current={i === current ? "time" : undefined}
              className="grid grid-cols-[76px_1fr] gap-2 border-b border-line py-3 last:border-b-0"
            >
              <span className={cx("pt-px text-sm", i === current ? "font-bold text-accent" : "text-muted")}>{formatTime(a.hour, a.minute)}</span>
              <span>
                <b className={cx("font-semibold", i < current && "font-normal text-muted")}>{a.title}</b>
                {i < current && <span className="sr-only"> (earlier today)</span>}
                {a.where && <span className="block text-sm text-muted">{a.where}</span>}
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </Frame>
  );
}

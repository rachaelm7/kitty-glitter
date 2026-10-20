"use client";

import { addDays, formatDay, untilLabel, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Card, EmptyState, Tag } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { maintenanceStore, nextDue } from "@/modules/home";
import { packingProgress, tripStore } from "@/modules/travel";
import { Frame } from "./Frame";

export function TripWidget() {
  const now = useNow();
  const trip = [...useStore(tripStore)].filter((t) => t.startOffset >= 0).sort((a, b) => a.startOffset - b.startOffset)[0];
  if (!trip) {
    return (
      <Frame id="trip" title="Next trip">
        <EmptyState title="No trips planned" icon={<Icon.Plane />} />
      </Frame>
    );
  }
  const p = packingProgress(trip.packing);
  return (
    <Frame id="trip" title="Next trip" href="/travel">
      <Card>
        <p className="text-sm text-muted">{trip.destination}</p>
        <b className="font-display text-xl font-semibold">{trip.name}</b>
        <p className="text-sm">
          {formatDay(addDays(now, trip.startOffset))} · leaves {untilLabel(trip.startOffset)}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`${p.pct}% packed`}>
          <div className="h-full rounded-full bg-accent" style={{ width: `${p.pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted">
          {p.packed} of {p.total} packed
        </p>
      </Card>
    </Frame>
  );
}

export function UpkeepWidget() {
  const items = useStore(maintenanceStore)
    .map((m) => ({ m, due: nextDue(m) }))
    .filter((x) => x.due.state !== "ok")
    .sort((a, b) => a.due.offset - b.due.offset);
  return (
    <Frame id="upkeep" title="Home upkeep" href="/home">
      {items.length === 0 ? (
        <EmptyState title="Home is on track" icon={<Icon.House />}>
          Nothing due in the next two weeks.
        </EmptyState>
      ) : (
        <Card className="py-1">
          <ul>
            {items.map(({ m, due }) => (
              <li key={m.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <span>{m.title}</span>
                <Tag tone={due.state === "overdue" ? "urgent" : "accent"}>{due.offset < 0 ? `${-due.offset}d late` : untilLabel(due.offset)}</Tag>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Frame>
  );
}

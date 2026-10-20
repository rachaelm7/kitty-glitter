"use client";

import { useState } from "react";
import { addDays, formatDay, untilLabel, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Button, Card, CheckCircle, Chip, PageHeader, Section, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { sortTasks, taskStore, toggleTask } from "@/modules/tasks";
import { ThreadTag } from "@/modules/threads";
import { groupPacking, itinerary, packingProgress, tripReminders } from "../data/logic";
import { addPackItem, togglePacked, tripStore } from "../data/store";
import type { PackItem, Reservation } from "../data/types";

const KIND_LABEL: Record<Reservation["kind"], string> = { flight: "Flight", stay: "Stay", dining: "Dining", activity: "Activity", transport: "Train" };

export function TravelScreen() {
  const now = useNow();
  const trips = useStore(tripStore);
  const tasks = useStore(taskStore);
  const [tripId, setTripId] = useState(trips[0]?.id);
  const [newItem, setNewItem] = useState("");
  const [group, setGroup] = useState<PackItem["group"]>("Other");
  const trip = trips.find((t) => t.id === tripId) ?? trips[0];
  if (!trip) return null;

  const progress = packingProgress(trip.packing);
  const related = trip.threadId ? sortTasks(tasks).filter((t) => t.threadId === trip.threadId) : [];
  const start = addDays(now, trip.startOffset);
  const end = addDays(now, trip.startOffset + trip.nights);

  return (
    <div>
      <PageHeader title="Travel" subtitle="Trips, bookings and packing in one place." />
      <div role="group" aria-label="Choose a trip" className="mt-4 flex flex-wrap gap-2">
        {trips.map((t) => (
          <Chip key={t.id} pressed={t.id === trip.id} onClick={() => setTripId(t.id)}>
            <Icon.Plane width={16} height={16} /> {t.name}
          </Chip>
        ))}
      </div>

      <div className="mt-5 rounded-3xl bg-accent p-5 text-accent-ink animate-rise">
        <p className="text-sm font-semibold opacity-90">{trip.destination}</p>
        <h2 className="mt-1 text-[26px] leading-tight">{trip.name}</h2>
        <p className="mt-1">
          {formatDay(start)} – {formatDay(end)} · {trip.nights} nights
        </p>
        <p className="mt-3 inline-flex rounded-full bg-ink/15 px-3 py-1 text-sm font-semibold">Leaves {untilLabel(trip.startOffset)}</p>
        {trip.threadId && (
          <div className="mt-3">
            <ThreadTag id={trip.threadId} />
          </div>
        )}
      </div>

      {tripReminders(trip).length > 0 && (
        <ul className="mt-4 space-y-2">
          {tripReminders(trip).map((r) => (
            <li key={r} className="flex items-start gap-2 rounded-[22px] border border-line/70 bg-surface shadow-soft p-3 text-sm">
              <Icon.Sparkle width={18} height={18} className="mt-0.5 flex-none text-accent" /> {r}
            </li>
          ))}
        </ul>
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <Section title="Itinerary" id="itinerary">
          <Card className="py-2">
            <ol>
              {itinerary(trip).map((d) => (
                <li key={d.dayIndex} className="border-b border-line py-3 last:border-b-0">
                  <p className="text-xs font-bold tracking-wide text-muted uppercase">
                    Day {d.dayIndex + 1} · {formatDay(addDays(now, d.offset))}
                  </p>
                  <ul className="mt-1.5 space-y-2">
                    {d.items.map((r) => (
                      <li key={r.id}>
                        <p className="flex flex-wrap items-center gap-2">
                          <Tag tone="neutral">{KIND_LABEL[r.kind]}</Tag>
                          <b className="font-semibold">{r.title}</b>
                        </p>
                        <p className="text-sm text-muted">
                          {r.time && `${r.time} · `}
                          {r.detail} · Conf. <span className="font-mono">{r.confirmation}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Card>
        </Section>

        <div>
          <Section title="Packing" id="packing" action={<span className="text-sm text-muted">{progress.packed} of {progress.total} packed</span>}>
            <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`${progress.pct}% packed`}>
              <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${progress.pct}%` }} />
            </div>
            <Card>
              {groupPacking(trip.packing).map((g) => (
                <div key={g.group} className="mb-3 last:mb-0">
                  <p className="text-xs font-bold tracking-wide text-muted uppercase">{g.group}</p>
                  <ul className="mt-1">
                    {g.items.map((p) => (
                      <li key={p.id} className="flex items-center gap-3 py-1.5">
                        <CheckCircle checked={p.packed} onToggle={() => togglePacked(trip.id, p.id)} label={`Packed: ${p.label}`} />
                        <span className={cx(p.packed && "text-muted line-through")}>{p.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <form
                className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  addPackItem(trip.id, newItem, group);
                  setNewItem("");
                }}
              >
                <label className="sr-only" htmlFor="pack-new">
                  Add to packing list
                </label>
                <input
                  id="pack-new"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add an item"
                  className="min-h-11 min-w-0 flex-1 rounded-xl border-[1.5px] border-line bg-bg px-3"
                />
                <label className="sr-only" htmlFor="pack-group">
                  Group
                </label>
                <select id="pack-group" value={group} onChange={(e) => setGroup(e.target.value as PackItem["group"])} className="min-h-11 rounded-xl border-[1.5px] border-line bg-bg px-2">
                  {(["Documents", "Clothes", "Toiletries", "Tech", "Other"] as const).map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                <Button type="submit" disabled={!newItem.trim()}>
                  Add
                </Button>
              </form>
            </Card>
          </Section>

          {related.length > 0 && (
            <Section title="Trip tasks" id="trip-tasks">
              <Card className="py-1">
                <ul>
                  {related.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
                      <CheckCircle checked={(t.status === "done")} onToggle={() => toggleTask(t.id)} label={`Done: ${t.title}`} />
                      <span className={cx((t.status === "done") && "text-muted line-through")}>{t.title}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

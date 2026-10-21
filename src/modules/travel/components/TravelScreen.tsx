"use client";

import { useState } from "react";
import { addDays, formatDay, untilLabel, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { clearIntent, intentStore } from "@/core/store/intent";
import { Sheet } from "@/core/ui/Sheet";
import { Button, Card, CheckCircle, Chip, EmptyState, PageHeader, Section, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { sortTasks, taskStore, toggleTask } from "@/modules/tasks";
import { ThreadTag } from "@/modules/threads";
import { groupPacking, itinerary, packingProgress, tripReminders } from "../data/logic";
import { addPackItem, togglePacked, tripStore } from "../data/store";
import { RESERVATION_LABEL, type PackItem } from "../data/types";
import { ReservationForm, TripForm } from "./TripForms";

type Editing = { kind: "trip-new" } | { kind: "trip-edit" } | { kind: "res-new" } | { kind: "res-edit"; id: string };

export function TravelScreen() {
  const now = useNow();
  const trips = useStore(tripStore);
  const tasks = useStore(taskStore);
  const intent = useStore(intentStore);
  const [pickedId, setTripId] = useState(trips[0]?.id);
  const [newItem, setNewItem] = useState("");
  const [group, setGroup] = useState<PackItem["group"]>("Other");
  const [localEditing, setEditing] = useState<Editing | null>(null);
  // Search can ask for a specific trip or the "new trip" form without importing this screen.
  const tripId = intent.trip ?? pickedId;
  const editing: Editing | null = intent.create === "trip" ? { kind: "trip-new" } : localEditing;
  const trip = trips.find((t) => t.id === tripId) ?? trips[0];

  function edit(next: Editing | null) {
    if (intent.create === "trip") clearIntent("create");
    setEditing(next);
  }
  function pick(id: string) {
    if (intent.trip) clearIntent("trip");
    setTripId(id);
  }

  const editingRes = editing?.kind === "res-edit" ? trip?.reservations.find((r) => r.id === editing.id) : undefined;
  const sheetTitle = editing?.kind === "trip-new" ? "New trip" : editing?.kind === "trip-edit" ? "Edit trip" : editing?.kind === "res-new" ? "Add a booking" : "Edit booking";
  const sheet = (
    <Sheet open={!!editing && (editing.kind === "trip-new" || !!trip)} onClose={() => edit(null)} title={sheetTitle}>
      {editing?.kind === "trip-new" && (
        <TripForm
          key="new"
          onDone={(id) => {
            if (id) pick(id);
            edit(null);
          }}
        />
      )}
      {editing?.kind === "trip-edit" && trip && <TripForm key={`edit-${trip.id}`} trip={trip} onDone={() => edit(null)} />}
      {editing?.kind === "res-new" && trip && <ReservationForm key={`res-new-${trip.id}`} trip={trip} onDone={() => edit(null)} />}
      {editing?.kind === "res-edit" && trip && editingRes && <ReservationForm key={editingRes.id} trip={trip} reservation={editingRes} onDone={() => edit(null)} />}
    </Sheet>
  );

  const newTrip = (
    <Button onClick={() => edit({ kind: "trip-new" })}>
      <Icon.Plus width={18} height={18} /> New trip
    </Button>
  );

  if (!trip)
    return (
      <div>
        <PageHeader title="Travel" subtitle="Trips, bookings and packing in one place." />
        <div className="mt-5">
          <EmptyState title="No trips planned" icon={<Icon.Plane />}>
            Add a trip to keep its bookings and packing list together.
          </EmptyState>
          <div className="mt-4">{newTrip}</div>
        </div>
        {sheet}
      </div>
    );

  const progress = packingProgress(trip.packing);
  const related = trip.threadId ? sortTasks(tasks).filter((t) => t.threadId === trip.threadId) : [];
  const start = addDays(now, trip.startOffset);
  const end = addDays(now, trip.startOffset + trip.nights);

  return (
    <div>
      <PageHeader title="Travel" subtitle="Trips, bookings and packing in one place." />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Choose a trip" className="flex flex-wrap gap-2">
          {trips.map((t) => (
            <Chip key={t.id} pressed={t.id === trip.id} onClick={() => pick(t.id)}>
              <Icon.Plane width={16} height={16} /> {t.name}
            </Chip>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => edit({ kind: "trip-new" })}>
          <Icon.Plus width={16} height={16} /> New trip
        </Button>
      </div>

      <div className="mt-5 rounded-3xl bg-accent p-5 text-accent-ink animate-rise">
        <p className="text-sm font-semibold opacity-90">{trip.destination}</p>
        <h2 className="mt-1 text-[26px] leading-tight">{trip.name}</h2>
        <p className="mt-1">
          {formatDay(start)} – {formatDay(end)} · {trip.nights} nights
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="inline-flex rounded-full bg-ink/15 px-3 py-1 text-sm font-semibold">
            {trip.startOffset >= 0 ? `Leaves ${untilLabel(trip.startOffset)}` : trip.startOffset + trip.nights >= 0 ? "Happening now" : `Ended ${untilLabel(trip.startOffset + trip.nights)}`}
          </p>
          <button
            type="button"
            onClick={() => edit({ kind: "trip-edit" })}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-ink/15 px-3 text-sm font-semibold hover:bg-ink/25"
          >
            <Icon.Pencil width={15} height={15} /> Edit trip
          </button>
        </div>
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
        <Section
          title="Itinerary"
          id="itinerary"
          action={
            <Button size="sm" variant="ghost" onClick={() => edit({ kind: "res-new" })}>
              <Icon.Plus width={16} height={16} /> Add booking
            </Button>
          }
        >
          <Card className="py-2">
            {trip.reservations.length === 0 && <p className="py-3 text-sm text-muted">No bookings yet. Add flights, stays and plans to build the day-by-day view.</p>}
            <ol>
              {itinerary(trip).map((d) => (
                <li key={d.dayIndex} className="border-b border-line py-3 last:border-b-0">
                  <p className="text-xs font-bold tracking-wide text-muted uppercase">
                    Day {d.dayIndex + 1} · {formatDay(addDays(now, d.offset))}
                  </p>
                  <ul className="mt-1.5 space-y-2">
                    {d.items.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => edit({ kind: "res-edit", id: r.id })}
                          aria-label={`Edit booking: ${r.title}`}
                          className="-mx-2 block w-[calc(100%+1rem)] rounded-xl px-2 py-1 text-left hover:bg-surface-2"
                        >
                          <span className="flex flex-wrap items-center gap-2">
                            <Tag tone="neutral">{RESERVATION_LABEL[r.kind]}</Tag>
                            <b className="font-semibold">{r.title}</b>
                          </span>
                          <span className="block text-sm text-muted">
                            {[r.time, r.detail].filter(Boolean).join(" · ")}
                            {r.confirmation && (
                              <>
                                {(r.time || r.detail) && " · "}Conf. <span className="font-mono">{r.confirmation}</span>
                              </>
                            )}
                          </span>
                        </button>
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
      {sheet}
    </div>
  );
}

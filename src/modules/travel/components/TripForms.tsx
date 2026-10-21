"use client";

import { useState } from "react";
import { addDays, formatDay, offsetOfISO, toISODate, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Button } from "@/core/ui/primitives";
import { Field, inputClass } from "@/core/ui/fields";
import { useToast } from "@/core/ui/Toast";
import { threadStore } from "@/modules/threads";
import { MAX_NIGHTS, tripDayCount, validateTrip, type TripErrors } from "../data/logic";
import { addReservation, addTrip, removeReservation, removeTrip, updateReservation, updateTrip } from "../data/store";
import { RESERVATION_KINDS, RESERVATION_LABEL, type Reservation, type Trip } from "../data/types";

function Actions({ saveLabel, onCancel, onDelete }: { saveLabel: string; onCancel: () => void; onDelete?: () => void }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <Button type="submit">{saveLabel}</Button>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      {onDelete && (
        <Button variant="quiet" className="ml-auto text-urgent hover:bg-urgent-soft" onClick={onDelete}>
          Delete
        </Button>
      )}
    </div>
  );
}

/** Add or edit a trip's basics. Bookings and packing are edited on the trip itself. */
export function TripForm({ trip, onDone }: { trip?: Trip; onDone: (tripId?: string) => void }) {
  const now = useNow();
  const toast = useToast();
  const threads = useStore(threadStore);
  const [name, setName] = useState(trip?.name ?? "");
  const [destination, setDestination] = useState(trip?.destination ?? "");
  const [start, setStart] = useState(trip ? toISODate(addDays(now, trip.startOffset)) : "");
  const [nights, setNights] = useState(trip ? String(trip.nights) : "3");
  const [threadId, setThreadId] = useState(trip?.threadId ?? "");
  // Errors appear after the first save attempt, then update as you type.
  const [tried, setTried] = useState(false);
  const errors: TripErrors = tried ? validateTrip({ name, destination, start, nights }) : {};
  const n = Number(nights);
  const returnDay = start && nights.trim() !== "" && Number.isInteger(n) && n >= 0 ? formatDay(addDays(now, offsetOfISO(start, now) + n)) : undefined;

  function save() {
    const found = validateTrip({ name, destination, start, nights });
    setTried(true);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`trip-${first}`)?.focus();
      return;
    }
    const input = { name: name.trim(), destination: destination.trim(), startOffset: offsetOfISO(start, now), nights: n, threadId: threadId || undefined };
    if (trip) {
      updateTrip(trip.id, input);
      toast("Trip updated");
      onDone(trip.id);
    } else {
      const id = addTrip(input);
      toast("Trip added, with a starter packing list");
      onDone(id);
    }
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <h3 className="pr-12 text-xl">{trip ? "Edit trip" : "New trip"}</h3>
      <div className="mt-4 grid gap-4">
        <Field id="trip-name" label="Trip name" error={errors.name}>
          {(a) => <input {...a} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Autumn in Kyoto" className={inputClass} />}
        </Field>
        <Field id="trip-destination" label="Destination" error={errors.destination}>
          {(a) => <input {...a} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Kyoto, Japan" className={inputClass} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="trip-start" label="Leaving on" error={errors.start}>
            {(a) => <input {...a} type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />}
          </Field>
          <Field id="trip-nights" label="Nights away" error={errors.nights} hint={returnDay && !errors.nights ? `Back ${returnDay}` : undefined}>
            {(a) => <input {...a} type="number" inputMode="numeric" min={0} max={MAX_NIGHTS} value={nights} onChange={(e) => setNights(e.target.value)} className={inputClass} />}
          </Field>
        </div>
        <Field id="trip-thread" label="Life Thread" optional>
          {(a) => (
            <select {...a} value={threadId} onChange={(e) => setThreadId(e.target.value)} className={inputClass}>
              <option value="">None</option>
              {threads.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Actions
        saveLabel={trip ? "Save changes" : "Add trip"}
        onCancel={() => onDone(trip?.id)}
        onDelete={
          trip &&
          (() => {
            const undo = removeTrip(trip.id);
            onDone();
            toast("Trip deleted", { label: "Undo", onClick: undo });
          })
        }
      />
    </form>
  );
}

/** Add or edit one booking. Confirmation codes are whatever you type; nothing is looked up or booked. */
export function ReservationForm({ trip, reservation, onDone }: { trip: Trip; reservation?: Reservation; onDone: () => void }) {
  const now = useNow();
  const toast = useToast();
  const [kind, setKind] = useState<Reservation["kind"]>(reservation?.kind ?? "stay");
  const [title, setTitle] = useState(reservation?.title ?? "");
  const [day, setDay] = useState(String(reservation?.dayIndex ?? 0));
  const [time, setTime] = useState(reservation?.time ?? "");
  const [detail, setDetail] = useState(reservation?.detail ?? "");
  const [confirmation, setConfirmation] = useState(reservation?.confirmation ?? "");
  const [tried, setTried] = useState(false);
  const error = tried && !title.trim() ? "Name the booking, like the hotel or flight number." : undefined;

  function save() {
    setTried(true);
    if (!title.trim()) {
      document.getElementById("res-title")?.focus();
      return;
    }
    const input = { kind, title: title.trim(), dayIndex: Number(day), time: time.trim() || undefined, detail: detail.trim(), confirmation: confirmation.trim() };
    if (reservation) {
      updateReservation(trip.id, reservation.id, input);
      toast("Booking updated");
    } else {
      addReservation(trip.id, input);
      toast("Booking added");
    }
    onDone();
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <h3 className="pr-12 text-xl">{reservation ? "Edit booking" : "Add a booking"}</h3>
      <p className="mt-1 text-sm text-muted">For {trip.name}. This only keeps your own notes; nothing is booked.</p>
      <div className="mt-4 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="res-kind" label="Type">
            {(a) => (
              <select {...a} value={kind} onChange={(e) => setKind(e.target.value as Reservation["kind"])} className={inputClass}>
                {RESERVATION_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {RESERVATION_LABEL[k]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="res-day" label="Day">
            {(a) => (
              <select {...a} value={day} onChange={(e) => setDay(e.target.value)} className={inputClass}>
                {Array.from({ length: tripDayCount(trip) }, (_, i) => (
                  <option key={i} value={i}>
                    Day {i + 1} · {formatDay(addDays(now, trip.startOffset + i))}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <Field id="res-title" label="Name" error={error}>
          {(a) => <input {...a} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hotel Sakura, room for two" className={inputClass} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="res-time" label="Time" optional>
            {(a) => <input {...a} value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 3:00 PM check-in" className={inputClass} />}
          </Field>
          <Field id="res-confirmation" label="Confirmation code" optional>
            {(a) => <input {...a} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoCapitalize="characters" spellCheck={false} className={`${inputClass} font-mono`} />}
          </Field>
        </div>
        <Field id="res-detail" label="Notes" optional>
          {(a) => <input {...a} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="e.g. Seat 14A, breakfast included" className={inputClass} />}
        </Field>
      </div>
      <Actions
        saveLabel={reservation ? "Save changes" : "Add booking"}
        onCancel={onDone}
        onDelete={
          reservation &&
          (() => {
            const undo = removeReservation(trip.id, reservation.id);
            onDone();
            toast("Booking deleted", { label: "Undo", onClick: undo });
          })
        }
      />
    </form>
  );
}

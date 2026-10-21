import { STATUSES, type Appointment, type Status } from "./types";

export type NextAction = { text: string; urgent: boolean };

/**
 * Suggested next steps. These are scheduling and paperwork prompts only.
 * They never comment on symptoms, results or treatment.
 */
export function nextActions(a: Appointment): NextAction[] {
  const waited = -a.statusSince;
  switch (a.status) {
    case "needs-scheduling":
      return [
        { text: `Call ${a.provider}${a.contact ? ` (${a.contact})` : ""} to book.${a.referredBy || a.kind === "referral" ? ` The referral was sent ${ago(waited)}.` : ""}`, urgent: waited >= 5 },
        { text: "Have your insurance card and the referral details ready when you call.", urgent: false },
      ];
    case "scheduled": {
      const out: NextAction[] = [];
      if (a.when && a.when.dayOffset >= 0 && a.when.dayOffset <= 3)
        out.push({ text: `Coming up ${a.when.dayOffset === 0 ? "today" : `in ${days(a.when.dayOffset)}`}. Confirm with the office if they asked you to.`, urgent: a.when.dayOffset <= 1 });
      out.push({ text: "Add it to your calendar and note any forms to bring.", urgent: false });
      return out;
    }
    case "waiting-office":
      return waited >= 5
        ? [{ text: `No reply in ${days(waited)}. Consider calling ${a.provider}${a.contact ? ` at ${a.contact}` : ""} to check on it.`, urgent: true }]
        : [{ text: "Give the office a few business days to reply.", urgent: false }];
    case "results-pending":
      return [
        { text: "Ask the office when and how results will be shared (portal, call or letter).", urgent: false },
        ...(waited >= 7 ? [{ text: `It's been ${days(waited)}. A quick call to check on timing is reasonable.`, urgent: false }] : []),
      ];
    case "follow-up":
      return [{ text: `Book the follow-up the office asked for. It was requested ${ago(waited)}.`, urgent: waited >= 7 }];
    case "completed":
      return [];
  }
}

export function needsAttention(a: Appointment) {
  return nextActions(a).some((n) => n.urgent);
}

export function stepIndex(s: Status) {
  return STATUSES.indexOf(s);
}

export function countByStatus(list: Appointment[]) {
  return Object.fromEntries(STATUSES.map((s) => [s, list.filter((a) => a.status === s).length])) as Record<Status, number>;
}

/** A polite, fictional draft to the office. It is never sent. */
export function officeDraft(a: Appointment) {
  const ask: Record<Status, string> = {
    "needs-scheduling": `I received a referral to ${a.provider}${a.referredBy ? ` from ${a.referredBy}` : ""} and would like to schedule the first available appointment.`,
    scheduled: "I'm writing to confirm my upcoming appointment. Please let me know if I should bring anything.",
    "waiting-office": "I'm following up on my earlier message about scheduling. Could you let me know the next available time?",
    "results-pending": "Could you let me know when and how I should expect to receive my results?",
    "follow-up": "I was asked to book a follow-up visit. Could you share available times?",
    completed: "Thank you for your help.",
  };
  return `Hello,\n\n${ask[a.status]}\n\nThank you,\n[Your name]`;
}

function ago(n: number) {
  return n <= 0 ? "today" : n === 1 ? "yesterday" : `${days(n)} ago`;
}

function days(n: number) {
  return `${n} day${n === 1 ? "" : "s"}`;
}

export type AppointmentDraft = { title: string; provider: string; status: Status; date: string; time: string };
export type DraftErrors = Partial<Record<"title" | "provider" | "date", string>>;

/** What must be filled in before an appointment can be saved. */
export function validateAppointment(d: AppointmentDraft): DraftErrors {
  const e: DraftErrors = {};
  if (!d.title.trim()) e.title = "Give it a short name, like “Dental cleaning”.";
  if (!d.provider.trim()) e.provider = "Add the office or provider.";
  if (d.status === "scheduled" && !d.date) e.date = "Scheduled appointments need a date. Add one, or pick another status.";
  return e;
}

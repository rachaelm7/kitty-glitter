import type { Appointment } from "./types";

// Every provider, person and number here is fictional (555-01xx numbers are reserved for fiction).
export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "ap1", title: "Dermatology referral", kind: "referral", provider: "Brightwater Dermatology", contact: "555-0142",
    status: "needs-scheduling", statusSince: -6, referredBy: "Maple Grove Family Clinic", threadId: "t-health",
    events: [
      { id: "e1", dayOffset: -6, label: "Referral sent by Maple Grove Family Clinic", by: "office" },
    ],
  },
  {
    id: "ap2", title: "Annual check-up", kind: "visit", provider: "Maple Grove Family Clinic", contact: "555-0118",
    status: "scheduled", statusSince: -20, when: { dayOffset: 2, time: "3:30 PM", place: "Maple Grove Family Clinic, Suite 2" }, threadId: "t-health",
    events: [
      { id: "e1", dayOffset: -21, label: "You requested an appointment", by: "you" },
      { id: "e2", dayOffset: -20, label: "Booked for Thursday 3:30 PM", by: "office" },
      { id: "e3", dayOffset: 0, label: "Reminder email: please confirm", by: "office" },
    ],
  },
  {
    id: "ap3", title: "Physical therapy intake", kind: "referral", provider: "Stride Physio Studio", contact: "555-0167",
    status: "waiting-office", statusSince: -8, referredBy: "Maple Grove Family Clinic", threadId: "t-health",
    events: [
      { id: "e1", dayOffset: -12, label: "Referral sent", by: "office" },
      { id: "e2", dayOffset: -8, label: "You left a voicemail asking for an intake slot", by: "you" },
    ],
  },
  {
    id: "ap4", title: "Routine lab work", kind: "test", provider: "Northside Lab Services", contact: "555-0173",
    status: "results-pending", statusSince: -3, threadId: "t-health",
    events: [
      { id: "e1", dayOffset: -10, label: "Lab order received", by: "office" },
      { id: "e2", dayOffset: -3, label: "Sample taken", by: "office" },
    ],
  },
  {
    id: "ap5", title: "Eye exam", kind: "visit", provider: "Clearview Optometry", contact: "555-0129",
    status: "follow-up", statusSince: -14, threadId: "t-health",
    events: [
      { id: "e1", dayOffset: -30, label: "Visit completed", by: "office" },
      { id: "e2", dayOffset: -14, label: "Office asked you to book a 6-week follow-up", by: "office" },
    ],
  },
  {
    id: "ap6", title: "Dental cleaning", kind: "visit", provider: "Harbor Smiles Dental", contact: "555-0191",
    status: "completed", statusSince: -40,
    events: [
      { id: "e1", dayOffset: -55, label: "Booked", by: "you" },
      { id: "e2", dayOffset: -40, label: "Visit completed", by: "office" },
    ],
  },
];

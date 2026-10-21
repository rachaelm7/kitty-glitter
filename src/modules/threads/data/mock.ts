import type { LifeThread } from "./types";

// Fictional situations. Each one gathers related emails, tasks and dates.
export const SEED_THREADS: LifeThread[] = [
  {
    id: "t-dental", name: "Dental cleaning", color: "#9A515D", icon: "Heart",
    blurb: "Six-month cleaning at Harbor Smiles Dental", status: "Confirm by today", stage: "action",
    next: { label: "Confirm Thursday's appointment", emailId: "m2" },
    events: [{ id: "e1", dayOffset: -20, label: "You booked a cleaning for Thursday at 3:30 PM", kind: "booking" }],
    keywords: ["dentist", "dental", "teeth", "cleaning", "harbor smiles"],
  },
  {
    id: "t-car", name: "Auto insurance renewal", color: "#4E7F8C", icon: "Wallet",
    blurb: "Sample policy renews in two weeks", status: "Renews in 14 days", stage: "waiting",
    next: { label: "Compare the quote when it arrives", taskId: "k3" },
    events: [{ id: "e1", dayOffset: -1, label: "You asked Harborline for a higher-deductible quote (by phone)", kind: "update" }],
    keywords: ["car", "insurance", "policy", "renewal", "harborline", "oil change", "tires"],
  },
  {
    id: "t-derm", name: "Skin check follow-up", color: "#6F5FA0", icon: "Stethoscope",
    blurb: "Referral from Maple Grove to Brightwater Dermatology", status: "Needs scheduling", stage: "action",
    next: { label: "Call Brightwater Dermatology to book", taskId: "k4" },
    events: [{ id: "e1", dayOffset: -9, label: "At your check-up, the clinic suggested a routine skin check", kind: "note" }],
    keywords: ["dermatology", "dermatologist", "skin", "referral", "brightwater", "doctor", "clinic"],
  },
  {
    id: "t-house", name: "Kitchen faucet repair", color: "#9A7A3F", icon: "House",
    blurb: "Dripping faucet; Pipewise Plumbing quoted the fix", status: "Estimate to approve", stage: "action",
    next: { label: "Approve the $185 estimate", emailId: "m8" },
    events: [
      { id: "e1", dayOffset: -5, label: "You noticed the kitchen faucet dripping", kind: "note" },
      { id: "e2", dayOffset: -3, label: "Pipewise came to take a look", kind: "appointment" },
    ],
    keywords: ["faucet", "plumber", "plumbing", "leak", "sink", "pipewise", "repair"],
  },
  {
    id: "t-return", name: "Lamp return & refund", color: "#7D5F31", icon: "Star",
    blurb: "Returning a table lamp to Lumen & Loom", status: "Return approved", stage: "action",
    next: { label: "Drop off the lamp", taskId: "k6" },
    events: [{ id: "e1", dayOffset: -4, label: "You requested a return: the shade arrived cracked", kind: "update" }],
    keywords: ["lamp", "return", "refund", "lumen", "loom", "order"],
  },
  {
    id: "t-party", name: "Priya's birthday picnic", color: "#A85F7A", icon: "Heart",
    blurb: "A picnic in the park on the 8th", status: "Planning", stage: "waiting",
    waitingOn: "Priya to confirm the park",
    next: { label: "Tell Priya you'll bring a tart", emailId: "m13" },
    events: [],
    keywords: ["priya", "birthday", "picnic", "party", "gift", "tart"],
  },
  {
    id: "t-lisbon", name: "Holiday trip to Lisbon", color: "#6F5FA0", icon: "Plane",
    blurb: "Five nights in Lisbon", status: "Leaves in 24 days", stage: "scheduled",
    next: { label: "Find your passport", taskId: "k8" },
    events: [],
    keywords: ["lisbon", "trip", "flight", "passport", "packing", "pack", "hotel", "travel", "holiday"],
  },
];
